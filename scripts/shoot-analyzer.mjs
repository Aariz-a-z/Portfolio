/**
 * Captures the AI Resume Analyzer in real state.
 *
 * Drives the actual application: uploads a real PDF through its own file input,
 * types a job description into its own textarea, clicks its own Analyze button,
 * and screenshots whatever the app computes. Nothing is mocked, and no value on
 * screen is authored here — the score, the missing-skill count and the radar
 * chart are all produced by the app's own code.
 *
 * The resume used is the rebuilt, text-based one. The old image-only PDF would
 * extract zero words and trip the app's ATS warning, producing a screenshot
 * that misrepresented the tool.
 *
 * Usage: node scripts/shoot-analyzer.mjs <streamlitUrl> <resumePdfPath> <outPath>
 */

import { connect, evaluate, goto, insertText, launch, screenshot, setViewport, sleep, uploadFile } from './cdp.mjs';
import { resolve } from 'node:path';

const url = process.argv[2] ?? 'http://localhost:8501';
const resumePath = resolve(process.argv[3] ?? 'public/resume/aariz-khan-resume.pdf');
const outPath = process.argv[4] ?? 'public/media/resume-analyzer/dashboard.png';

/**
 * A generic public-style posting. Not a real application, and it is only input:
 * nothing from it is published.
 */
const JOB_DESCRIPTION = `Machine Learning Intern

We are looking for a machine learning intern to work on applied NLP problems.

Responsibilities:
- Build and evaluate machine learning models on real datasets
- Work with natural language processing and text embeddings
- Write clean, tested Python code
- Query and analyse data with SQL

Requirements:
- Strong Python skills
- Familiarity with machine learning fundamentals and model evaluation
- Exposure to artificial intelligence and NLP concepts
- Understanding of data structures and algorithms
- Experience with SQL databases
- Bonus: exposure to AWS or other cloud platforms`;

const { child, port } = await launch({ port: 9334 });
const session = await connect(port);

await setViewport(session, 1600, 1100);
await goto(session, url, 6000);

// Streamlit runs the script on WebSocket connect, and the first run loads the
// sentence-transformer model. Poll until the widgets actually exist.
let ready = false;
for (let i = 0; i < 90; i++) {
  ready = await evaluate(
    session,
    `!!document.querySelector('input[type=file]') && !!document.querySelector('textarea')`,
  );
  if (ready) break;
  if (i % 10 === 0) {
    const len = await evaluate(session, 'document.body.innerText.length');
    console.log(`  waiting for widgets... ${i * 2}s (body ${len} chars)`);
  }
  await sleep(2000);
}
if (!ready) {
  console.error('FAILED: Streamlit widgets never rendered');
  child.kill();
  process.exit(1);
}

console.log('widgets present, uploading resume...');
await uploadFile(session, 'input[type=file]', [resumePath]);
await sleep(4000);

console.log('entering job description...');
await insertText(session, 'textarea', JOB_DESCRIPTION);

// Streamlit commits a text_area on blur and then round-trips to the server.
// Clicking before that lands makes the script see an empty job description.
await sleep(6000);

console.log('clicking Analyze...');
const clicked = await evaluate(
  session,
  `(() => {
     const btn = [...document.querySelectorAll('button')].find(b => /analyze/i.test(b.textContent || ''));
     if (!btn) return false;
     btn.click();
     return true;
   })()`,
);
if (!clicked) {
  console.error('FAILED: no Analyze button found');
  child.kill();
  process.exit(1);
}

// Model encoding plus chart rendering.
await sleep(20000);

// If the inputs had not committed in time, the app shows its prompt instead of
// results. Click once more now that both values are definitely registered.
const needsRetry = await evaluate(
  session,
  `/Please upload a PDF and paste a Job Description/i.test(document.body.innerText)`,
);
if (needsRetry) {
  console.log('inputs had not committed; re-clicking Analyze...');
  await evaluate(
    session,
    `(() => { const b = [...document.querySelectorAll('button')].find(b => /analyze/i.test(b.textContent || '')); if (b) b.click(); return !!b; })()`,
  );
  await sleep(30000);
}

const state = await evaluate(
  session,
  `(() => {
     const text = document.body.innerText;
     return JSON.stringify({
       hasScore: /Semantic Match Score/i.test(text),
       hasGap: /Skill Gap Analysis/i.test(text),
       hasAts: /ATS Check|ATS Warning/i.test(text),
       hasChart: !!document.querySelector('.js-plotly-plot'),
       spinner: /Analyzing/i.test(text)
     });
   })()`,
);
console.log('app state:', state);

await screenshot(session, outPath, { fullPage: true });
console.log('wrote', outPath);

const parsed = JSON.parse(state);
child.kill();
process.exit(parsed.hasScore && parsed.hasChart ? 0 : 2);
