/**
 * The verification pass, run against the built site.
 *
 * Every check here executes against a real page in a real browser: axe-core is
 * injected from node_modules and run per route, headings and landmarks are read
 * from the live DOM, every link is followed, tap targets and overflow are
 * measured at each required width, reduced motion is emulated, and focus order
 * is walked with real Tab presses.
 *
 * Usage: node scripts/verify.mjs <baseUrl>
 */

import { readFileSync } from 'node:fs';
import { connect, evaluate, goto, launch, setViewport, sleep } from './cdp.mjs';

const base = process.argv[2] ?? 'http://localhost:4321';
const AXE = readFileSync('node_modules/axe-core/axe.min.js', 'utf8');
const ROUTES = ['/', '/resume', '/this-route-does-not-exist'];
const WIDTHS = [360, 390, 768, 1024, 1440, 1920];

const line = (s) => console.log(s);
const heading = (s) => console.log(`\n${'='.repeat(74)}\n${s}\n${'='.repeat(74)}`);

const { child, port } = await launch({ port: 9340 });
const session = await connect(port);
let failures = 0;

// --------------------------------------------------------------- accessibility
heading('1. ACCESSIBILITY — axe-core');
await setViewport(session, 1440, 900);
for (const route of ROUTES) {
  await goto(session, `${base}${route}`, 1200);
  await evaluate(session, AXE);
  const raw = await evaluate(
    session,
    `axe.run(document, { resultTypes: ['violations'] }).then(r => JSON.stringify({
       v: r.violations.length,
       ver: axe.version,
       detail: r.violations.map(x => ({ id: x.id, impact: x.impact, nodes: x.nodes.length }))
     }))`,
  );
  const res = JSON.parse(raw);
  if (res.v > 0) failures++;
  line(`  ${route.padEnd(30)} axe ${res.ver}  violations: ${res.v}`);
  if (res.v) line(`      ${JSON.stringify(res.detail)}`);
}

// ------------------------------------------------------------------- structure
heading('2. DOCUMENT STRUCTURE');
for (const route of ROUTES.slice(0, 2)) {
  await goto(session, `${base}${route}`, 800);
  const s = JSON.parse(
    await evaluate(
      session,
      `(() => {
        const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => +h.tagName[1]);
        let skips = 0;
        for (let i = 1; i < hs.length; i++) if (hs[i] > hs[i-1] + 1) skips++;
        return JSON.stringify({
          h1: document.querySelectorAll('h1').length,
          headings: hs.length,
          skips,
          lang: document.documentElement.lang,
          title: document.title,
          desc: (document.querySelector('meta[name=description]')||{}).content ? 'present' : 'MISSING',
          landmarks: ['header','nav','main','footer'].map(t => t + '=' + document.querySelectorAll(t).length).join(' '),
          skipLink: !!document.querySelector('a[href="#main"]'),
          // An image with alt="" is correctly marked decorative, and axe agrees:
          // flagging it was this script's bug, not the page's. Only an image
          // with no alt ATTRIBUTE at all is unlabelled.
          imgsNoAlt: [...document.querySelectorAll('img')].filter(
            i => !i.hasAttribute('alt') && !i.hasAttribute('aria-hidden')
          ).length,
          iconBtnNoLabel: [...document.querySelectorAll('button')].filter(b => !b.textContent.trim() && !b.getAttribute('aria-label')).length
        });
      })()`,
    ),
  );
  const bad = s.h1 !== 1 || s.skips > 0 || s.imgsNoAlt > 0 || s.iconBtnNoLabel > 0 || !s.skipLink;
  if (bad) failures++;
  line(`  ${route}`);
  line(`    h1=${s.h1}  headings=${s.headings}  skippedLevels=${s.skips}  lang=${s.lang}`);
  line(`    landmarks: ${s.landmarks}   skip-link=${s.skipLink}   meta description=${s.desc}`);
  line(`    images without alt=${s.imgsNoAlt}   icon buttons without label=${s.iconBtnNoLabel}`);
  line(`    title: ${s.title}`);
}

// ----------------------------------------------------------------------- links
heading('3. LINKS');
await goto(session, `${base}/`, 800);
const links = JSON.parse(
  await evaluate(
    session,
    `(() => {
      const as = [...document.querySelectorAll('a[href]')];
      const hrefs = [...new Set(as.map(a => a.getAttribute('href')))];
      return JSON.stringify({
        total: as.length,
        unique: hrefs.length,
        dead: hrefs.filter(h => !h || h === '#' || h.includes('undefined') || h.includes('TODO')),
        demoButtons: as.filter(a => /live demo/i.test(a.textContent)).map(a => ({
          href: a.getAttribute('href'),
          text: a.textContent.trim(),
          label: a.getAttribute('aria-label') || ''
        })),
        externalNoRel: as.filter(a => a.href.startsWith('http') && !a.href.includes(location.host) && a.rel !== 'noopener noreferrer').length,
        anchors: hrefs.filter(h => h.startsWith('#') || h.startsWith('/#')).map(h => h.replace('/#','#')),
        internal: hrefs.filter(h => h.startsWith('/') && !h.startsWith('/#'))
      });
    })()`,
  ),
);
const missingAnchors = JSON.parse(
  await evaluate(
    session,
    `JSON.stringify(${JSON.stringify(links.anchors)}.filter(a => !document.getElementById(a.slice(1))))`,
  ),
);
line(`  anchors on page: ${links.total} (${links.unique} unique)`);
line(`  dead/placeholder hrefs: ${links.dead.length}`);
line(`  in-page anchors resolving to a real element: ${links.anchors.length - missingAnchors.length}/${links.anchors.length}`);
line(`  external links missing rel=noopener noreferrer: ${links.externalNoRel}`);
// A demo button must exist only where a project supplies a real URL. Rather
// than hard-code how many that is, assert the property that matters: every
// rendered demo control points at an absolute http(s) URL, and none points at a
// placeholder. Zero buttons is valid; a button with a dead href is not.
const badDemos = links.demoButtons.filter(
  (d) => !d.href || !/^https?:\/\//.test(d.href),
);
line(`  demo buttons rendered: ${links.demoButtons.length}`);
for (const d of links.demoButtons) {
  line(`      "${d.text}" -> ${d.href}`);
  // WCAG 2.5.3: the visible text must appear in the accessible name.
  //
  // With no aria-label the accessible name IS the visible text, so the
  // criterion is satisfied by construction. The check previously compared the
  // text against an empty string and reported a failure for every correctly
  // marked-up link that simply did not need an override.
  const overridden = d.label.trim().length > 0;
  const inName = !overridden || d.label.toLowerCase().includes(d.text.toLowerCase());
  line(
    `      accessible name: "${overridden ? d.label : d.text}"` +
      `${overridden ? '' : ' (from visible text)'}` +
      `  (contains visible text: ${inName ? 'yes' : 'NO'})`,
  );
  if (!inName) failures++;
}
line(`  demo buttons with a missing or non-absolute href: ${badDemos.length}`);
if (badDemos.length) failures++;
if (links.dead.length || missingAnchors.length || links.externalNoRel) failures++;

for (const route of [...links.internal, '/robots.txt', '/sitemap.xml', '/opengraph-image']) {
  const r = JSON.parse(
    await evaluate(
      session,
      `fetch(${JSON.stringify(route)}).then(r => JSON.stringify({ s: r.status, t: r.headers.get('content-type') }))`,
    ),
  );
  if (r.s !== 200) failures++;
  line(`    ${String(r.s).padEnd(4)} ${route.padEnd(34)} ${r.t}`);
}

// ------------------------------------------------------------------ responsive
heading('4. RESPONSIVE');
for (const w of WIDTHS) {
  await setViewport(session, w, 900, w < 768);
  await goto(session, `${base}/`, 900);
  const r = JSON.parse(
    await evaluate(
      session,
      `(() => {
        const vw = document.documentElement.clientWidth;
        let over = 0;
        for (const el of document.querySelectorAll('body *')) {
          const b = el.getBoundingClientRect();
          if ((b.width || b.height) && (b.right > vw + 1 || b.left < -1)) over++;
        }
        let small = 0;
        for (const el of document.querySelectorAll('a[href],button,summary')) {
          const b = el.getBoundingClientRect();
          if ((b.width || b.height) && (b.height < 44 || b.width < 44)) small++;
        }
        return JSON.stringify({ vw, sw: document.documentElement.scrollWidth, over, small });
      })()`,
    ),
  );
  const ok = r.sw <= r.vw && r.over === 0 && r.small === 0;
  if (!ok) failures++;
  line(`  ${String(w).padStart(4)}px  scrollWidth=${r.sw} viewport=${r.vw}  overflowingElements=${r.over}  tapTargets<44px=${r.small}  ${ok ? 'PASS' : 'FAIL'}`);
}

// -------------------------------------------------------------- reduced motion
heading('5. REDUCED MOTION');
await setViewport(session, 1440, 900);
await session.send('Emulation.setEmulatedMedia', {
  features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
});
await goto(session, `${base}/`, 1500);
const rm = JSON.parse(
  await evaluate(
    session,
    `(() => {
      const els = [...document.querySelectorAll('.enter')];
      return JSON.stringify({
        sections: els.length,
        hidden: els.filter(e => getComputedStyle(e).opacity !== '1').length,
        durations: [...new Set(els.map(e => getComputedStyle(e).transitionDuration))]
      });
    })()`,
  ),
);
if (rm.hidden > 0) failures++;
line(`  reveal sections: ${rm.sections}   still hidden: ${rm.hidden}   transition-duration: ${rm.durations.join(', ')}`);
await session.send('Emulation.setEmulatedMedia', { features: [] });

// -------------------------------------------------------------------- keyboard
heading('6. KEYBOARD');
await goto(session, `${base}/`, 1200);
const order = [];
for (let i = 0; i < 12; i++) {
  await session.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 9, key: 'Tab', code: 'Tab' });
  await session.send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 9, key: 'Tab', code: 'Tab' });
  await sleep(120);
  const info = JSON.parse(
    await evaluate(
      session,
      `(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return JSON.stringify({ tag: 'body' });
        const st = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return JSON.stringify({
          tag: el.tagName.toLowerCase(),
          label: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30),
          outline: st.outlineStyle + ' ' + st.outlineWidth,
          visible: r.width > 0 && r.height > 0
        });
      })()`,
    ),
  );
  order.push(info);
}
const noRing = order.filter((o) => o.tag !== 'body' && (o.outline.startsWith('none') || o.outline === ' 0px'));
if (noRing.length) failures++;
order.forEach((o, i) => line(`  ${String(i + 1).padStart(2)}. ${o.tag.padEnd(8)} outline=${(o.outline || '-').padEnd(14)} ${o.label || ''}`));
line(`  focusable steps without a visible focus ring: ${noRing.length}`);

// --------------------------------------------------------------------- console
heading('7. CONSOLE');
for (const route of ROUTES.slice(0, 2)) {
  session.events.length = 0;
  await goto(session, `${base}${route}`, 2000);
  const errs = session.events.filter(
    (e) => e.method === 'Runtime.exceptionThrown' ||
      (e.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(e.params?.type)),
  );
  if (errs.length) failures++;
  line(`  ${route.padEnd(30)} console errors/warnings: ${errs.length}`);
  errs.slice(0, 3).forEach((e) => line(`      ${JSON.stringify(e.params).slice(0, 160)}`));
}

heading(failures === 0 ? 'RESULT: ALL CHECKS PASSED' : `RESULT: ${failures} CHECK GROUP(S) FAILED`);
child.kill();
process.exit(failures === 0 ? 0 : 1);
