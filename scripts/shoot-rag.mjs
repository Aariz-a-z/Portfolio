/**
 * Captures the RAG chatbot answering a real question.
 *
 * Drives the running application: types a question into its own composer, sends
 * it, waits for the streamed answer to finish, and screenshots the result.
 * Nothing is staged — the answer is whatever the local model produces from
 * whatever the retrieval layer actually returns.
 *
 * The admin route is deliberately never visited: it surfaces configuration, and
 * configuration is exactly what must not appear in a published screenshot.
 *
 * Usage: node scripts/shoot-rag.mjs <appUrl> <outPath>
 */

import { connect, evaluate, goto, insertText, launch, screenshot, setViewport, sleep } from './cdp.mjs';

const url = process.argv[2] ?? 'http://localhost:3999';
const outPath = process.argv[3] ?? 'public/media/aariz-ai/chat.png';
const QUESTION = 'How does retrieval-augmented generation work?';

const { child, port } = await launch({ port: 9337 });
const session = await connect(port);

await setViewport(session, 1600, 1000);
await goto(session, url, 6000);

console.log('typing question...');
await insertText(session, 'textarea', QUESTION);
await sleep(1000);

const sent = await evaluate(
  session,
  `(() => {
     const btn = [...document.querySelectorAll('button')].find(b => /^send$/i.test((b.textContent || '').trim()));
     if (!btn || btn.disabled) return false;
     btn.click();
     return true;
   })()`,
);
if (!sent) {
  console.error('FAILED: Send button unavailable');
  child.kill();
  process.exit(1);
}
console.log('sent; waiting for the local model to finish streaming...');

// A 3B model on CPU is not fast. Poll for the Stop control to disappear, which
// is how the UI signals that streaming has ended.
let settled = false;
for (let i = 0; i < 90; i++) {
  await sleep(2000);
  const state = JSON.parse(
    await evaluate(
      session,
      `(() => {
         const t = document.body.innerText;
         return JSON.stringify({
           streaming: /\\bStop\\b/.test(t),
           chars: t.length,
           hasSources: /Sources?\\b/i.test(t),
           error: /(something went wrong|failed|error)/i.test(t)
         });
       })()`,
    ),
  );
  if (i % 5 === 0) console.log(`  ${i * 2}s streaming=${state.streaming} chars=${state.chars}`);
  if (!state.streaming && state.chars > 700) {
    settled = true;
    break;
  }
}

const final = JSON.parse(
  await evaluate(
    session,
    `(() => {
       const t = document.body.innerText;
       return JSON.stringify({
         hasSources: /Sources?\\b/i.test(t),
         answerLength: t.length,
         error: /(something went wrong|unable to|failed)/i.test(t),
         tail: t.slice(-260)
       });
     })()`,
  ),
);
console.log('final state:', JSON.stringify(final, null, 2));

await screenshot(session, outPath, { fullPage: false });
console.log('wrote', outPath);

child.kill();
process.exit(settled && !final.error ? 0 : 2);
