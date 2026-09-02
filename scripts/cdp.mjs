/**
 * A very small Chrome DevTools Protocol client.
 *
 * Exists so that verification can take real screenshots at exact viewport
 * widths and drive a real file upload, without adding Playwright or Puppeteer
 * to a project whose whole dependency argument is that it added nothing. Node
 * 22 ships a global WebSocket, so this needs no packages at all.
 *
 * Verification tooling only. Never imported by the site.
 */

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
];

export function findChrome() {
  const found = CHROME_CANDIDATES.find((p) => existsSync(p));
  if (!found) throw new Error('No Chrome or Edge binary found');
  return found;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function launch({ port = 9333, userDataDir, gl = false } = {}) {
  const bin = findChrome();
  const args = [
    '--headless=new',
    // Software GL, so three.js scenes render offline without a GPU. Slow, and
    // that is fine: this path only runs at build time.
    ...(gl
      ? ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu']
      : ['--disable-gpu']),
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir ?? `${process.env.TEMP}/cdp-profile-${port}`}`,
    'about:blank',
  ];
  const child = spawn(bin, args, { stdio: 'ignore', detached: false });

  // Wait for the debugging endpoint to answer.
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) break;
    } catch {
      /* not up yet */
    }
    await sleep(250);
  }

  return { child, port };
}

export class Session {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.events = [];
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      } else if (msg.method) {
        this.events.push(msg);
      }
    });
  }

  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`CDP timeout: ${method}`));
        }
      }, 60000);
    });
  }

  waitForEvent(method, timeout = 30000) {
    const start = Date.now();
    return (async () => {
      while (Date.now() - start < timeout) {
        const found = this.events.find((e) => e.method === method);
        if (found) return found;
        await sleep(100);
      }
      return null;
    })();
  }
}

export async function connect(port) {
  const res = await fetch(`http://127.0.0.1:${port}/json/list`);
  const targets = await res.json();
  const page = targets.find((t) => t.type === 'page');
  if (!page) throw new Error('No page target');

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });

  const session = new Session(ws);
  await session.send('Page.enable');
  await session.send('Runtime.enable');
  await session.send('DOM.enable');
  return session;
}

export async function setViewport(session, width, height, mobile = false) {
  await session.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile,
  });
}

export async function goto(session, url, settleMs = 1500) {
  session.events.length = 0;
  await session.send('Page.navigate', { url });
  await session.waitForEvent('Page.loadEventFired');
  await sleep(settleMs);
}

export async function evaluate(session, expression) {
  const result = await session.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text ?? 'evaluate failed');
  }
  return result.result.value;
}

export async function screenshot(session, outPath, { fullPage = true, format = 'png', quality } = {}) {
  const params = { format };
  if (quality !== undefined) params.quality = quality;
  if (fullPage) {
    const metrics = await session.send('Page.getLayoutMetrics');
    const { width, height } = metrics.cssContentSize ?? metrics.contentSize;
    params.captureBeyondViewport = true;
    params.clip = { x: 0, y: 0, width, height, scale: 1 };
  }
  const { data } = await session.send('Page.captureScreenshot', params);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, Buffer.from(data, 'base64'));
  return outPath;
}

/**
 * Types into the focused element the way a person would.
 *
 * Setting `.value` and dispatching an input event is enough for React to update
 * its own state, but not for widget frameworks that only commit a value on a
 * real focus/blur cycle. Driving the browser's input pipeline avoids guessing
 * which of those a given widget needs.
 */
export async function insertText(session, selector, text) {
  await evaluate(
    session,
    `(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return false; el.focus(); el.click(); return true; })()`,
  );
  await sleep(300);
  await session.send('Input.insertText', { text });
  await sleep(300);
  await evaluate(
    session,
    `(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (el) el.blur(); return true; })()`,
  );
}

export async function uploadFile(session, selector, filePaths) {
  const doc = await session.send('DOM.getDocument');
  const { nodeId } = await session.send('DOM.querySelector', {
    nodeId: doc.root.nodeId,
    selector,
  });
  if (!nodeId) throw new Error(`No element matching ${selector}`);
  await session.send('DOM.setFileInputFiles', { nodeId, files: filePaths });
}

export { sleep };
