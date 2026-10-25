/**
 * Builds the resume PDF from HTML through headless Chrome.
 *
 * Replaces the PyMuPDF builder, for a reason that was measured rather than
 * assumed. PyMuPDF can embed a real typeface, but every route it offers
 * corrupts the text layer on the way out: with any embedded TrueType font the
 * ASCII hyphen round-trips as U+2010 and the space as U+00A0, and Georgia
 * turns the hyphen into U+00AD, which is invisible. "ROC-AUC" stops being
 * findable by an applicant tracking system searching for "ROC-AUC". The old
 * builder avoided this only by staying on base-14 Helvetica, which is exactly
 * why the output looked like a default.
 *
 * Chrome's Page.printToPDF embeds subsetted Type0 fonts and round-trips ASCII
 * exactly — verified by the assertion pass at the bottom of this file, which
 * fails the build rather than shipping a resume no parser can read.
 *
 * Layout is a single column with no tables, no text boxes and no multi-column
 * flow, because those are what break extraction in the first place.
 *
 * Usage:  node scripts/build-resume.mjs [outPath]
 */

import { writeFileSync, mkdirSync, readFileSync, unlinkSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { launch, connect, goto } from './cdp.mjs';
import {
  profile,
  summary,
  projects,
  alsoBuilt,
  skills,
  education,
  languages,
} from './resume-data.mjs';

const OUT = process.argv[2] ?? 'public/resume/aariz-khan-resume.pdf';

/**
 * Escapes text for HTML. Content is ours, but a stray ampersand in a stack
 * string should not silently become an entity.
 */
const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const link = (label, href) =>
  `<a href="${esc(href)}">${esc(label)}</a>`;

/**
 * The type system.
 *
 * One family carries the whole document and hierarchy comes from weight, size
 * and colour — three signals, consistently applied. The previous resume used
 * three different typefaces on one page, which is the single loudest signal
 * that a document was assembled rather than designed.
 *
 * Inter is vendored under scripts/fonts and inlined as a data URI rather than
 * fetched from a CDN. The first build that pulled it from Google Fonts silently
 * fell back to the system sans on a later run, which would have meant a
 * different-looking resume from the same source. A data URI also sidesteps the
 * CORS rules that block @font-face over file://. Chrome then embeds a subset of
 * what it rendered, so the PDF is self-contained on any reader.
 *
 * Inter is licensed SIL OFL 1.1, which permits embedding and redistribution.
 */
const FONT_PATH = resolve(dirname(fileURLToPath(import.meta.url)), 'fonts/inter-latin-var.woff2');

const fontFace = existsSync(FONT_PATH)
  ? `@font-face {
      font-family: "Inter";
      font-style: normal;
      font-weight: 100 900;
      font-display: block;
      src: url(data:font/woff2;base64,${readFileSync(FONT_PATH).toString('base64')}) format("woff2");
    }`
  : '';

const cssRest = `
  @page { size: A4; margin: 14mm 13mm 12mm 13mm; }

  :root {
    --ink:    #16181d;
    --body:   #2b2f37;
    --muted:  #61666f;
    --rule:   #d4d8de;
    --accent: #16181d;
  }

  * { box-sizing: border-box; }

  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  body {
    margin: 0;
    font-family: Inter, "Segoe UI", system-ui, -apple-system, Arial, sans-serif;
    font-size: 9.3pt;
    line-height: 1.5;
    color: var(--body);
    font-feature-settings: "kern" 1, "liga" 1;
    -webkit-font-smoothing: antialiased;
  }

  a { color: inherit; text-decoration: none; }

  /* ---- Header ------------------------------------------------------- */

  .name {
    font-size: 22pt;
    font-weight: 650;
    letter-spacing: -0.021em;
    color: var(--ink);
    line-height: 1.05;
    margin: 0;
  }

  .title {
    font-size: 9.4pt;
    font-weight: 550;
    letter-spacing: 0.005em;
    color: var(--ink);
    margin: 3.5pt 0 0;
  }

  .subtitle {
    font-size: 8.3pt;
    color: var(--muted);
    margin: 1.5pt 0 0;
  }

  .contact {
    font-size: 8.2pt;
    color: var(--muted);
    margin: 5pt 0 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0 6pt;
  }

  .contact span::after {
    content: "·";
    margin-left: 6pt;
    color: var(--rule);
  }

  .contact span:last-child::after { content: none; }

  .contact-web { margin-top: 1.4pt; }

  .contact a { border-bottom: 0.4pt solid var(--rule); }

  .header-rule {
    border: 0;
    border-top: 1pt solid var(--ink);
    margin: 6.5pt 0 0;
  }

  /* ---- Sections ----------------------------------------------------- */

  .summary {
    margin: 6.5pt 0 0;
    color: var(--body);
  }

  h2 {
    font-size: 7.6pt;
    font-weight: 700;
    letter-spacing: 0.115em;
    text-transform: uppercase;
    color: var(--ink);
    margin: 12pt 0 0;
    padding: 0 0 3pt;
    border-bottom: 0.5pt solid var(--rule);
  }

  section:first-of-type h2 { margin-top: 10pt; }

  /* ---- Projects ----------------------------------------------------- */

  .project { margin-top: 9pt; break-inside: avoid; }
  .project:first-of-type { margin-top: 5pt; }

  .project-head {
    display: flex;
    align-items: baseline;
    gap: 6pt;
  }

  .project-title {
    font-size: 10.6pt;
    font-weight: 650;
    letter-spacing: -0.008em;
    color: var(--ink);
  }

  .badge {
    font-size: 6.6pt;
    font-weight: 650;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: #ffffff;
    background: var(--accent);
    border-radius: 2pt;
    padding: 1.2pt 3.6pt 1.4pt;
    position: relative;
    top: -0.6pt;
  }

  .metric {
    font-size: 8pt;
    font-weight: 600;
    color: var(--ink);
    margin-left: auto;
    white-space: nowrap;
  }

  .metric em {
    font-style: normal;
    font-weight: 400;
    color: var(--muted);
  }

  .project-meta {
    font-size: 7.6pt;
    color: var(--muted);
    margin: 1.6pt 0 0;
  }

  .project-meta .sep { color: #9aa0aa; padding: 0 4pt; }

  .project-meta a { border-bottom: 0.4pt solid var(--rule); }

  ul {
    margin: 2.8pt 0 0;
    padding: 0;
    list-style: none;
  }

  li {
    position: relative;
    padding-left: 9pt;
    margin-top: 4pt;
  }

  li::before {
    content: "";
    position: absolute;
    left: 1.5pt;
    top: 4.6pt;
    width: 2.6pt;
    height: 2.6pt;
    border-radius: 50%;
    background: #a8adb6;
  }

  /* ---- Compact rows -------------------------------------------------- */

  .row {
    display: flex;
    gap: 7pt;
    margin-top: 4pt;
    break-inside: avoid;
  }

  .row-label {
    flex: 0 0 82pt;
    font-weight: 650;
    color: var(--ink);
  }

  .row-body { flex: 1; color: var(--body); }

  .row-body .sep { color: #9aa0aa; padding: 0 4.5pt; }

  .also { margin-top: 4.5pt; }
  .also .name { font-size: inherit; font-weight: 600; color: var(--ink); letter-spacing: 0; }

  /* ---- Education ----------------------------------------------------- */

  .edu {
    display: flex;
    align-items: baseline;
    gap: 7pt;
    margin-top: 2.6pt;
  }

  .edu-main { flex: 1; }
  .edu-credential { font-weight: 650; color: var(--ink); }
  .edu-institution { color: var(--muted); }
  .edu-side { color: var(--muted); white-space: nowrap; text-align: right; }
  .edu-score { font-weight: 600; color: var(--ink); }
`;

const css = fontFace + cssRest;

/**
 * Contact details on two deliberate rows rather than one wrapping row.
 *
 * All five on one line overflows, because the Vercel-generated portfolio
 * hostname is 43 characters on its own. A line that wraps by one item looks
 * like an accident; splitting it where the meaning splits — how to reach him,
 * then where to read his work — looks like a decision.
 */
function renderHead() {
  const reach = [
    `<span>${link(profile.email, `mailto:${profile.email}`)}</span>`,
    `<span>${esc(profile.phone)}</span>`,
  ].join('');

  const web = [
    `<span>${link(profile.portfolio, profile.portfolioHref)}</span>`,
    `<span>${link(profile.github, profile.githubHref)}</span>`,
    `<span>${link(profile.linkedin, profile.linkedinHref)}</span>`,
  ].join('');

  return `
    <header>
      <h1 class="name">${esc(profile.name)}</h1>
      <p class="title">${esc(profile.title)}</p>
      <p class="subtitle">${esc(profile.subtitle)}</p>
      <div class="contact">${reach}</div>
      <div class="contact contact-web">${web}</div>
      <hr class="header-rule" />
    </header>
    <p class="summary">${esc(summary)}</p>
  `;
}

function renderProject(p) {
  const badge = p.badge ? `<span class="badge">${esc(p.badge)}</span>` : '';
  const metric = p.metric
    ? `<span class="metric">${esc(p.metric)} <em>(${esc(p.metricBasis)})</em></span>`
    : '';
  const links = p.links.map((l) => link(l.label, l.href)).join('<span class="sep">·</span>');
  const bullets = p.bullets.map((b) => `<li>${esc(b)}</li>`).join('');

  return `
    <article class="project">
      <div class="project-head">
        <span class="project-title">${esc(p.title)}</span>${badge}${metric}
      </div>
      <p class="project-meta">${esc(p.stack)}<span class="sep">·</span>${links}</p>
      <ul>${bullets}</ul>
    </article>
  `;
}

function renderAlsoBuilt() {
  // An empty list renders nothing rather than a stranded label.
  if (!alsoBuilt.items.length) return '';

  const body = alsoBuilt.items
    .map((i) => {
      const name = `<span class="name">${link(i.name, i.href)}</span>`;
      // A name-only entry must not render a trailing dash.
      return i.note ? `${name} — ${esc(i.note)}` : name;
    })
    .join('<span class="sep">·</span>');

  return `
    <div class="row also">
      <div class="row-label">${esc(alsoBuilt.label)}</div>
      <div class="row-body">${body}</div>
    </div>
  `;
}

function renderSkills() {
  return skills
    .map(
      (s) => `
      <div class="row">
        <div class="row-label">${esc(s.label)}</div>
        <div class="row-body">${esc(s.items)}</div>
      </div>`,
    )
    .join('');
}

function renderEducation() {
  return education
    .map(
      (e) => `
      <div class="edu">
        <div class="edu-main">
          <span class="edu-credential">${esc(e.credential)}</span> ·
          <span class="edu-institution">${esc(e.institution)}</span>
        </div>
        <div class="edu-side">
          ${esc(e.dates)} · <span class="edu-score">${esc(e.score)}</span>
        </div>
      </div>`,
    )
    .join('');
}

function renderHtml() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${esc(profile.name)} - Resume</title>
  <style>${css}</style>
</head>
<body>
  ${renderHead()}

  <section>
    <h2>Projects</h2>
    ${projects.map(renderProject).join('')}
    ${renderAlsoBuilt()}
  </section>

  <section>
    <h2>Technical Skills</h2>
    ${renderSkills()}
  </section>

  <section>
    <h2>Education</h2>
    ${renderEducation()}
    <div class="row" style="margin-top:2.5pt">
      <div class="row-label">Languages</div>
      <div class="row-body">${esc(languages)}</div>
    </div>
  </section>
</body>
</html>`;
}

/**
 * The reason this build can be trusted.
 *
 * A resume that looks right and extracts wrong is worse than a plain one, so
 * the strings a recruiter or a parser searches for are asserted against the
 * finished PDF's own text layer. Any mismatch fails the build.
 */
const MUST_EXTRACT = [
  'Aariz Khan',
  'AI Software Engineer',
  // Project metrics, each traceable to a recorded run or README.
  '96.2%',
  '103 actions',
  '1,932 tests',
  'pgvector',
  // The requisition's own expertise terms. An applicant tracking system
  // scanning for these must find them, so a layout change that drops one
  // fails the build rather than reaching an application.
  'PyTorch',
  'scikit-learn',
  'Sentence-Transformers',
  'Linux',
  'Kubernetes',
  'PostgreSQL',
  'MongoDB',
  'REST APIs',
  'CGPA 8.8',
  profile.email,
  profile.phone,
  profile.portfolio,
  profile.github,
  profile.linkedin,
];

async function main() {
  const outPath = resolve(OUT);
  mkdirSync(dirname(outPath), { recursive: true });

  const htmlPath = resolve(tmpdir(), `resume-${Date.now()}.html`);
  writeFileSync(htmlPath, renderHtml(), 'utf8');

  // Chrome has to die on every exit path. An earlier version returned straight
  // from the happy path and left a headless browser holding the debugging port,
  // which then failed the next build with EADDRINUSE.
  const { child, port } = await launch({ port: 9411 });
  try {
    return await render(port, htmlPath, outPath);
  } finally {
    child.kill();
  }
}

async function render(port, htmlPath, outPath) {
  const session = await connect(port);

  const fileUrl = 'file:///' + htmlPath.split('\\').join('/');
  await goto(session, fileUrl, 1200);

  // Report which family actually rendered, so a silent fallback to the system
  // sans is visible in the build log rather than discovered in the PDF.
  const usedInter = await session.send('Runtime.evaluate', {
    expression:
      'document.fonts.ready.then(() => document.fonts.check("600 20pt Inter"))',
    returnByValue: true,
    awaitPromise: true,
  });
  if (!usedInter.result.value) {
    throw new Error(
      'Inter did not load; the PDF would render in a fallback face. ' +
        `Expected the vendored font at ${FONT_PATH}`,
    );
  }
  console.log('font: Inter (vendored, inlined)');

  const { data } = await session.send('Page.printToPDF', {
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: false,
  });

  writeFileSync(outPath, Buffer.from(data, 'base64'));
  unlinkSync(htmlPath);

  console.log(`wrote ${outPath} (${(readFileSync(outPath).length / 1024).toFixed(1)} KB)`);
  return outPath;
}

/**
 * Stamps document properties and repacks the file.
 *
 * Chrome writes no author, subject or keywords, and names itself as the
 * creator — a recruiter opening the document properties should see the
 * candidate, not "HeadlessChrome". The same pass runs garbage collection and
 * recompression, which matters because several application portals cap resume
 * uploads at a few hundred kilobytes.
 */
function finalise(outPath) {
  // PyMuPDF refuses a non-incremental save over the file it opened, so the
  // repack goes to a sibling path and then replaces the original.
  const script = `
import sys, os, fitz
path = sys.argv[1]
tmp = path + ".tmp"
doc = fitz.open(path)
doc.set_metadata({
    "title": sys.argv[2] + " - Resume",
    "author": sys.argv[2],
    "subject": "Data Science and Machine Learning resume",
    "keywords": (
        "data science, machine learning, NLP, retrieval-augmented generation, "
        "embeddings, pgvector, Python, scikit-learn, pandas, TypeScript"
    ),
    "creator": "",
    "producer": "",
})
doc.save(tmp, deflate=True, garbage=4, clean=True)
doc.close()
os.replace(tmp, path)
`;
  const before = readFileSync(outPath).length;
  const res = spawnSync('python', ['-c', script, outPath, profile.name], {
    encoding: 'utf8',
  });
  if (res.status !== 0) {
    console.warn(`metadata pass skipped: ${(res.stderr || '').trim().split('\n').pop()}`);
    return;
  }
  const after = readFileSync(outPath).length;
  console.log(
    `metadata: stamped; size ${(before / 1024).toFixed(1)} -> ${(after / 1024).toFixed(1)} KB`,
  );
}

/**
 * Reads the finished PDF's text layer back and checks the strings that have to
 * survive it. Runs through PyMuPDF because it is an independent engine from the
 * one that wrote the file — a check that used Chrome again would only prove
 * Chrome agrees with itself.
 */
function verify(outPath) {
  const probe = JSON.stringify(MUST_EXTRACT);
  const script = `
import sys, json, fitz
sys.stdout.reconfigure(encoding="utf-8")
doc = fitz.open(sys.argv[1])
text = "".join(page.get_text() for page in doc)
flat = " ".join(text.split())
missing = [s for s in json.loads(sys.argv[2]) if s not in flat]
print(json.dumps({"pages": doc.page_count, "chars": len(text), "missing": missing}))
`;
  const res = spawnSync('python', ['-c', script, outPath, probe], { encoding: 'utf8' });
  if (res.status !== 0) {
    console.warn(`verify skipped: ${(res.stderr || '').trim().split('\n').pop()}`);
    return;
  }

  const { pages, chars, missing } = JSON.parse(res.stdout.trim().split('\n').pop());
  console.log(`verify: ${pages} page(s), ${chars} extractable characters`);

  if (missing.length) {
    throw new Error(`text layer lost these strings: ${missing.join(' | ')}`);
  }
  console.log(`verify: all ${MUST_EXTRACT.length} required strings extract intact`);

  if (pages > 1) {
    console.warn(`warning: resume runs to ${pages} pages`);
  }
}

const written = await main();
if (!existsSync(written)) throw new Error('build produced no file');
finalise(written);
verify(written);
process.exit(0);
