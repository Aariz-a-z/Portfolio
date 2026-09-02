/**
 * Verifies the deployed RAG chatbot actually works.
 *
 * A 200 response proves a URL serves something; it does not prove the
 * application functions. Marking the project "completed" on the portfolio is a
 * factual claim, so this drives the deployed app the way a visitor would: load
 * it, type a question into its own composer, send, and wait for a real answer.
 *
 * Usage: node scripts/verify-deployed-rag.mjs [url]
 */

import { connect, evaluate, goto, insertText, launch, screenshot, setViewport, sleep } from './cdp.mjs';

const url = process.argv[2] ?? 'https://aariz-ai-three.vercel.app';
const QUESTION = 'What is retrieval-augmented generation?';

const { child, port } = await launch({ port: 9380 });
const session = await connect(port);
await setViewport(session, 1500, 950);

console.log(`loading ${url} ...`);
await goto(session, url, 7000);

const shell = JSON.parse(
  await evaluate(
    session,
    `JSON.stringify({
       title: document.title,
       textareas: document.querySelectorAll('textarea').length,
       buttons: [...document.querySelectorAll('button')].map(b => (b.textContent||'').trim()).filter(Boolean).slice(0, 10),
       bodyChars: document.body.innerText.length
     })`,
  ),
);
console.log('shell:', JSON.stringify(shell));

if (shell.textareas === 0) {
  console.error('FAILED: no composer rendered — the app did not boot');
  child.kill();
  process.exit(1);
}

console.log('asking a question...');
await insertText(session, 'textarea', QUESTION);
await sleep(1200);

const sent = await evaluate(
  session,
  `(() => {
     const b = [...document.querySelectorAll('button')].find(x => /^send$/i.test((x.textContent||'').trim()));
     if (!b || b.disabled) return false;
     b.click();
     return true;
   })()`,
);
if (!sent) {
  console.error('FAILED: send control unavailable');
  child.kill();
  process.exit(1);
}

const before = shell.bodyChars;
let answered = false;
for (let i = 0; i < 60; i++) {
  await sleep(2000);
  const state = JSON.parse(
    await evaluate(
      session,
      `(() => {
         const t = document.body.innerText;
         return JSON.stringify({
           chars: t.length,
           streaming: /\\bStop\\b/.test(t),
           error: /(something went wrong|failed to|unavailable)/i.test(t)
         });
       })()`,
    ),
  );
  if (i % 5 === 0) console.log(`  ${i * 2}s  chars=${state.chars} streaming=${state.streaming}`);
  if (!state.streaming && state.chars > before + 120) {
    answered = true;
    break;
  }
  if (state.error) break;
}

const final = JSON.parse(
  await evaluate(
    session,
    `(() => {
       const t = document.body.innerText;
       return JSON.stringify({
         chars: t.length,
         hasSources: /sources?/i.test(t),
         error: /(something went wrong|failed to|unavailable)/i.test(t),
         tail: t.slice(-420)
       });
     })()`,
  ),
);

console.log('\n--- final state ---');
console.log('chars:', final.chars, '| grew by:', final.chars - before);
console.log('mentions sources:', final.hasSources, '| error text present:', final.error);
console.log('tail:\n' + final.tail);

await screenshot(session, 'verification/deployed-rag.png', { fullPage: false });
console.log('\nscreenshot: verification/deployed-rag.png');

child.kill();
process.exit(answered && !final.error ? 0 : 2);
