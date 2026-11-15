import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { regions, colorGrid, ascii } = require('./png.cjs');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9352;
const FILE = 'file:///E:/Rudranildocs0066543/html-yt/igloo-webgl.html';
const OUT = 'E:/Rudranildocs0066543/html-yt/scratch/igloo/shots';
fs.mkdirSync(OUT, { recursive: true });
const PROFILE = path.join(os.tmpdir(), 'igloo-stops-' + Date.now());
const W = Number(process.env.VW || 1200), H = Number(process.env.VH || 720);
const ASCII = process.argv.includes('--ascii');

const STOPS = [
  { s: 0.00, stage: 0, name: 'hero' },
  { s: 0.12, stage: 1, name: 'igloo' },
  { s: 0.28, stage: 2, name: 'pudgy' },
  { s: 0.50, stage: 3, name: 'overpass' },
  { s: 0.66, stage: 4, name: 'portal' },
  { s: 0.705, stage: 4, name: 'portal-drop' },
  { s: 0.86, stage: 5, name: 'dais' },
];

const proc = spawn(EDGE, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${PROFILE}`,
  '--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--hide-scrollbars',
  `--window-size=${W},${H}`, '--no-first-run', '--no-default-browser-check', FILE], { stdio: 'ignore' });
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
await send('Runtime.enable'); await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: FILE });
await sleep(7000);
// wait for __IG to appear
for (let i = 0; i < 40; i++) { if (await ev('typeof window.__IG !== "undefined"')) break; await sleep(500); }

for (const stop of STOPS) {
  await ev(`S.t=${stop.s};S.scroll=${stop.s};1`);
  let ok = false;
  for (let i = 0; i < 40; i++) {
    const st = await ev('S.stage');
    if (st === stop.stage) { ok = true; break; }
    await sleep(400);
  }
  await sleep(900);
  const info = await ev(`(()=>{const g=window.__IG,c=g.camera,v=new THREE.Vector3(),p=new THREE.Vector3();
    const proj=(o)=>{o.getWorldPosition(v);p.copy(v).project(c);const d=c.position.distanceTo(v);
      return {ndc:[+p.x.toFixed(2),+p.y.toFixed(2)],d:Math.round(d),vis:o.visible};};
    const grp=(y)=>g.scene.children.find(o=>o.isGroup&&Math.round(o.position.y)===y);
    return JSON.stringify({stage:S.stage,cam:c.position.toArray().map(n=>+n.toFixed(1)),
      igloo:proj(g.bricks[0].mesh), iceA:grp(-42)?proj(grp(-42)):null, iceB:grp(-84)?proj(grp(-84)):null,
      portal:grp(-118)?proj(grp(-118)):null, dais:grp(-152)?proj(grp(-152)):null});})()`);
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const f = path.join(OUT, 'stop-' + stop.name + '.png');
  fs.writeFileSync(f, Buffer.from(shot.result.data, 'base64'));
  console.log('\n#### ' + stop.name + ' t=' + stop.s + ' stageOk=' + ok);
  console.log(info);
  console.log(JSON.stringify(regions(f)));
  console.log(colorGrid(f, 8, 6));
  if (ASCII) console.log(ascii(f, 78).art);
}
if (logs.length) console.log('\nLOGS\n' + logs.slice(0, 20).join('\n'));
ws.close(); proc.kill(); process.exit(0);
