import { connect, evaluate, goto, launch, setViewport, sleep } from './cdp.mjs';

const base = process.argv[2] ?? 'http://localhost:4321';
const { child, port } = await launch({ port: 9371 });
const session = await connect(port);

await setViewport(session, 1440, 900);
await session.send('Page.addScriptToEvaluateOnNewDocument', {
  source: `
    const gc = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
      if (String(type).indexOf('webgl') === 0) return null;
      return gc.call(this, type, ...rest);
    };
  `,
});
await goto(session, `${base}/`, 4500);
await sleep(2500);

console.log(
  await evaluate(
    session,
    `(() => {
       const c = document.querySelector('canvas');
       if (!c) return JSON.stringify({ canvas: null });
       const cs = getComputedStyle(c);
       return JSON.stringify({
         className: c.className,
         opacity: cs.opacity,
         display: cs.display,
         webglReturnsNull: c.getContext('webgl') === null,
       }, null, 1);
     })()`,
  ),
);

child.kill();
