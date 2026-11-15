import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9356;
const FILE = 'file:///E:/Rudranildocs0066543/html-yt/igloo-webgl.html';
const PROFILE = path.join(os.tmpdir(), 'igloo-spec-' + Date.now());

const proc = spawn(EDGE, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${PROFILE}`,
  '--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--hide-scrollbars',
  '--window-size=1280,760', '--no-first-run', '--no-default-browser-check', FILE], { stdio: 'ignore' });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function endpoint() {
  for (let i = 0; i < 100; i++) {
    try { const l = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); const p = l.find(t => t.type === 'page' && t.webSocketDebuggerUrl); if (p) return p; } catch {}
    await sleep(250);
  }
  throw new Error('no ep');
}
const page = await endpoint();
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let id = 0; const pending = new Map(); const logs = [];
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); return; }
  if (m.method === 'Runtime.exceptionThrown') logs.push('[EXC] ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text));
  if (m.method === 'Runtime.consoleAPICalled') { const t = (m.params.args || []).map(a => a.value ?? a.description).join(' '); if (!/Tracking Prevention/.test(t)) logs.push('[' + m.params.type + '] ' + t); }
};
const send = (method, params = {}) => { const mid = ++id; ws.send(JSON.stringify({ id: mid, method, params })); return new Promise(r => pending.set(mid, r)); };
const ev = async (expr) => {
  const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails) return 'THROW: ' + (r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text);
  return r.result?.result?.value;
};
const mouse = (type, x, y) => send('Input.dispatchMouseEvent', {
  type, x, y, button: 'none', buttons: 0, clickCount: 0
});

await send('Runtime.enable'); await send('Page.enable');
await send('Page.navigate', { url: FILE });
await sleep(7000);
for (let i = 0; i < 40; i++) { if (await ev('typeof window.__IG !== "undefined"')) break; await sleep(400); }

const ok = (name, pass, detail) => console.log((pass ? 'PASS  ' : 'FAIL  ') + name + '  ' + JSON.stringify(detail));

/* 1 — preloader ASCII frames cycle and hide */
const frames = [];
await ev(`(typeof replayIntro === 'function') ? replayIntro() : 'missing'`);
for (let i = 0; i < 6; i++) {
  frames.push(await ev(`document.getElementById('preloader-ascii').textContent`));
  await sleep(150);
}
await sleep(1400);
const preOp = await ev(`getComputedStyle(document.getElementById('preloader')).opacity`);
const uniq = [...new Set(frames)].filter(Boolean);
ok('preloader ASCII cycles', uniq.length > 1 && uniq.every(f => /^[=+\-]{10}$/.test(f)), { frames, uniq: uniq.length });
ok('preloader hides after intro', Number(preOp) < 0.05, { preOp });

/* 2 — brick HUD on hover at stage 1 */
await ev('S.t=0.12;S.scroll=0.12;S.intro=1;1');
await sleep(2200);
const brickXY = await ev(`(() => {
  const g = window.__IG, c = g.camera;
  const v = new THREE.Vector3();
  let best = null;
  g.bricks.forEach(b => {
    b.mesh.getWorldPosition(v);
    const p = v.clone().project(c);
    if (p.z > 1) return;
    const x = (p.x * 0.5 + 0.5) * innerWidth, y = (-p.y * 0.5 + 0.5) * innerHeight;
    if (x < 200 || x > innerWidth - 200 || y < 150 || y > innerHeight - 150) return;
    const centre = Math.hypot(x - innerWidth / 2, y - innerHeight / 2);
    if (!best || centre < best.centre) best = { x: Math.round(x), y: Math.round(y), centre, id: b.id };
  });
  return JSON.stringify(best);
})()`);
const bp = JSON.parse(brickXY || '{}');
await mouse('mouseMoved', bp.x ?? 640, bp.y ?? 380);
await sleep(1500);
const hover = await ev(`(() => {
  const g = window.__IG;
  const off = g.bricks.map(b => b.offset).filter(v => v > 0.01).length;
  const c = document.getElementById('hud');
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 12) n++;
  return JSON.stringify({ liftedBricks: off, hudPixels: n, mouseActive: S.mouseActive });
})()`);
const hv = JSON.parse(hover || '{}');
ok('brick lift + HUD polylines on hover', hv.liftedBricks > 2 && hv.hudPixels > 500, { brick: bp, ...hv });

/* 3 — loop reset at the bottom, scroll prompt never returns */
await ev('S.t=1;S.scroll=0.995;1');
await sleep(3200);
const loop1 = await ev(`JSON.stringify({
  scroll: +S.scroll.toFixed(3), stage: S.stage, looping: S.looping,
  prompt: document.getElementById('scroll-prompt').className,
  hasScrolled: S.hasScrolled
})`);
await sleep(2600);
const loop2 = await ev(`JSON.stringify({
  scroll: +S.scroll.toFixed(3), stage: S.stage,
  prompt: document.getElementById('scroll-prompt').className
})`);
const l1 = JSON.parse(loop1 || '{}'), l2 = JSON.parse(loop2 || '{}');
ok('loop reset returns to top', l2.scroll < 0.2 && l1.prompt.includes('hidden'), { during: l1, after: l2 });
ok('scroll prompt never returns after loop', l2.prompt.includes('hidden') && l1.hasScrolled === true, { after: l2.prompt });

/* 4 — freeze on modal open, thaw on close */
await ev('S.t=0.28;S.scroll=0.28;1');
await sleep(2600);
const before = await ev(`JSON.stringify({ darken: +window.__IG.compositeUniforms.uDarken.value.toFixed(3), thaw: +window.__IG.compositeUniforms.uThaw.value.toFixed(3) })`);
await mouse('mouseMoved', 640, 380);
await sleep(500);
await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 640, y: 380, button: 'left', buttons: 1, clickCount: 1 });
await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 640, y: 380, button: 'left', buttons: 0, clickCount: 1 });
await sleep(1600);
const frozen = await ev(`JSON.stringify({ open: document.getElementById('modal').className, darken: +window.__IG.compositeUniforms.uDarken.value.toFixed(3) })`);
await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
await sleep(700);
const thawing = await ev(`JSON.stringify({ open: document.getElementById('modal').className, thaw: +window.__IG.compositeUniforms.uThaw.value.toFixed(3), darken: +window.__IG.compositeUniforms.uDarken.value.toFixed(3) })`);
const b = JSON.parse(before || '{}'), f = JSON.parse(frozen || '{}'), t = JSON.parse(thawing || '{}');
ok('freeze darkens on open', f.open === 'active' && f.darken > 0.5, { before: b, frozen: f });
ok('thaw spikes on close', t.open === '' && t.thaw > 0.15, { thawing: t });

if (logs.length) console.log('\nLOGS\n' + logs.slice(0, 20).join('\n')); else console.log('\nLOGS (clean)');
ws.close(); proc.kill(); process.exit(0);
