/**
 * Full-page screenshots of the portfolio at every required width, plus the
 * measurements the responsive gate asks for, taken at exact viewport sizes.
 *
 * Usage: node scripts/shoot-site.mjs <baseUrl> <outDir>
 */

import { connect, evaluate, goto, launch, screenshot, setViewport, sleep } from './cdp.mjs';

const base = process.argv[2] ?? 'http://localhost:3000';
const outDir = process.argv[3] ?? 'verification/shots';

const WIDTHS = [360, 390, 768, 1024, 1440, 1920];
const ROUTES = [
  { path: '/', name: 'home' },
  { path: '/resume', name: 'resume' },
];

const OVERFLOW_PROBE = `(() => {
  const vw = document.documentElement.clientWidth;
  const offenders = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    if (r.right > vw + 1 || r.left < -1) {
      offenders.push(el.tagName.toLowerCase() + ' :: ' + (el.textContent || '').trim().slice(0, 30));
    }
  }
  const tap = [];
  for (const el of document.querySelectorAll('a[href],button,summary,[tabindex]:not([tabindex="-1"])')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    if (r.height < 44 || r.width < 44) {
      tap.push(el.tagName.toLowerCase() + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) + ' :: ' + (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 28));
    }
  }
  return JSON.stringify({
    viewport: vw,
    scrollWidth: document.documentElement.scrollWidth,
    overflow: document.documentElement.scrollWidth > vw,
    offenders,
    smallTapTargets: tap
  });
})()`;

const { child, port } = await launch({ port: 9333 });
const session = await connect(port);

const report = [];

for (const route of ROUTES) {
  for (const width of WIDTHS) {
    await setViewport(session, width, 900, width < 768);
    await goto(session, `${base}${route.path}`, 1200);
    const raw = await evaluate(session, OVERFLOW_PROBE);
    const probe = JSON.parse(raw);
    // Sections enter on intersection, which a full-page capture never triggers
    // below the fold. Scroll the page first so the entrances fire the way they
    // do for a reader, then settle any that remain mid-entrance — the capture
    // is meant to document the finished state, not catch it part-way.
    await evaluate(
      session,
      `(async () => {
         const step = window.innerHeight * 0.8;
         for (let y = 0; y < document.body.scrollHeight; y += step) {
           window.scrollTo(0, y);
           await new Promise(r => setTimeout(r, 110));
         }
         window.scrollTo(0, 0);
         await new Promise(r => setTimeout(r, 300));
         for (const el of document.querySelectorAll('[data-animate="pending"]')) {
           el.dataset.animate = 'in';
         }
         await new Promise(r => setTimeout(r, 350));
         return document.querySelectorAll('[data-animate="pending"]').length;
       })()`,
    );

    const file = `${outDir}/${route.name}-${width}.png`;
    await screenshot(session, file);
    report.push({ route: route.path, width, ...probe, file });
    console.log(
      `${route.path.padEnd(8)} ${String(width).padStart(4)}px  ` +
        `overflow=${probe.overflow ? 'YES' : 'no '}  ` +
        `offenders=${probe.offenders.length}  ` +
        `smallTaps=${probe.smallTapTargets.length}`,
    );
    if (probe.offenders.length) console.log('    offenders:', probe.offenders.slice(0, 4));
    if (probe.smallTapTargets.length) console.log('    small taps:', probe.smallTapTargets.slice(0, 6));
  }
}

// Reduced motion: every revealed section must end visible.
await setViewport(session, 1440, 900);
await session.send('Emulation.setEmulatedMedia', {
  features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
});
await goto(session, `${base}/`, 1500);
const reduced = JSON.parse(
  await evaluate(
    session,
    `(() => {
      const els = [...document.querySelectorAll('.enter')];
      const hidden = els.filter(e => getComputedStyle(e).opacity !== '1');
      const durations = [...new Set(els.map(e => getComputedStyle(e).transitionDuration))];
      return JSON.stringify({ total: els.length, stillHidden: hidden.length, transitionDurations: durations });
    })()`,
  ),
);
console.log('\nreduced-motion:', reduced);
await screenshot(session, `${outDir}/home-reduced-motion.png`);

const failures = report.filter(
  (r) => r.overflow || r.offenders.length || r.smallTapTargets.length,
);
console.log(
  `\nRESULT: ${report.length} viewport/route combinations, ${failures.length} with findings.`,
);

await sleep(300);
child.kill();
process.exit(failures.length === 0 && reduced.stillHidden === 0 ? 0 : 1);
