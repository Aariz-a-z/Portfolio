/**
 * Offline frame renderer.
 *
 * Bundles a three.js scene, runs it in headless Chrome, and writes one image per
 * frame. Three.js is a BUILD-TIME tool here — none of it ships. The site
 * receives images.
 *
 * Usage: node scripts/render-frames.mjs <sceneModule> <outDir> <frames> [w] [h]
 */

import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { connect, evaluate, goto, launch, screenshot, setViewport, sleep } from './cdp.mjs';

const sceneModule = resolve(process.argv[2]);
const outDir = resolve(process.argv[3] ?? 'verification/frames');
const frameCount = Number(process.argv[4] ?? 5);
const W = Number(process.argv[5] ?? 1200);
const H = Number(process.argv[6] ?? 750);
// A lit sheet of paper is a large, nearly flat field, which is the worst case
// for a lossy codec: at the default quality it bands into visible blotches that
// look like mottled card. Raised, and overridable per render.
const QUALITY = Number(process.env.FRAME_QUALITY ?? 92);

const tmp = resolve('.frames-tmp');
mkdirSync(tmp, { recursive: true });
mkdirSync(outDir, { recursive: true });

execSync(
  `npx --yes esbuild "${sceneModule}" --bundle --format=iife --global-name=Beat ` +
    `--outfile="${tmp}/beat.js" --log-level=error`,
  { stdio: 'inherit', shell: true, cwd: resolve(sceneModule, '..') },
);
const bundle = readFileSync(`${tmp}/beat.js`, 'utf8');

const html = [
  '<!doctype html><meta charset="utf-8">',
  '<style>html,body{margin:0;background:#0b0c0e}',
  `canvas{display:block;width:${W}px;height:${H}px}</style>`,
  '<canvas id="c"></canvas>',
  `<script>${bundle}</script>`,
  '<script>',
  '  window.__info = null;',
  '  window.renderAt = function (t) {',
  '    var c = document.getElementById("c");',
  '    window.__info = Beat.render(c, t);',
  '    return true;',
  '  };',
  '</script>',
].join('\n');

const file = `${tmp}/frame.html`;
writeFileSync(file, html);

// SwiftShader gives a real GL implementation without a GPU; it is slow, which
// does not matter because this runs once at build time.
const { child, port } = await launch({ port: 9390, gl: true });
const session = await connect(port);
await setViewport(session, W, H);
await goto(session, `file:///${file.split('\\').join('/')}`, 1500);

const started = Date.now();
for (let i = 0; i < frameCount; i++) {
  const t = frameCount === 1 ? 0 : i / (frameCount - 1);
  const ok = await evaluate(session, `window.renderAt(${t})`);
  if (!ok) {
    console.error(`FAILED: render returned falsy at frame ${i}`);
    child.kill();
    process.exit(1);
  }
  await sleep(180);
  const name = `${outDir}/frame-${String(i).padStart(3, '0')}.webp`;
  await screenshot(session, name, { fullPage: false, format: 'webp', quality: QUALITY });
  const info = await evaluate(session, 'JSON.stringify(window.__info)');
  console.log(`  frame ${i}  t=${t.toFixed(2)}  ${info}  -> ${name}`);
}

// The manifest is the whole contract between the renderer and the site.
// Replacing these frames with Blender or C4D output means writing files and
// editing this one file — no component changes anywhere.
writeFileSync(
  `${outDir}/manifest.json`,
  `${JSON.stringify(
    {
      count: frameCount,
      width: W,
      height: H,
      ext: 'webp',
      pattern: 'frame-{i}.webp',
      // Chosen for composition rather than being frame 0: this is the single
      // image shown for reduced motion, Save-Data and slow connections.
      still: Math.round((frameCount - 1) * 0.72),
      renderedAt: new Date().toISOString().slice(0, 10),
    },
    null,
    2,
  )}\n`,
);

console.log(
  `\nrendered ${frameCount} frames in ${((Date.now() - started) / 1000).toFixed(1)}s`,
);
console.log(`manifest: ${outDir}/manifest.json`);

child.kill();
rmSync(tmp, { recursive: true, force: true });
