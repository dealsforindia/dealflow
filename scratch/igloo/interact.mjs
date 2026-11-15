import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { regions, colorGrid } = require('./png.cjs');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9354;
const FILE = 'file:///E:/Rudranildocs0066543/html-yt/igloo-webgl.html';
const OUT = 'E:/Rudranildocs0066543/html-yt/scratch/igloo/shots';
fs.mkdirSync(OUT, { recursive: true });
const PROFILE = path.join(os.tmpdir(), 'igloo-inter-' + Date.now());

const proc = spawn(EDGE, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${PROFILE}`,
  '--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--hide-scrollbars',
  '--window-size=1280,760', '--no-first-run', '--no-default-browser-check',
  '--autoplay-policy=no-user-gesture-required', FILE], { stdio: 'ignore' });
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
  type, x, y, button: type === 'mouseMoved' ? 'none' : 'left', clickCount: type === 'mousePressed' || type === 'mouseReleased' ? 1 : 0,
  buttons: type === 'mousePressed' ? 1 : 0
});
async function shot(name) {
  const s = await send('Page.captureScreenshot', { format: 'png' });
  const f = path.join(OUT, 'ix-' + name + '.png');
  fs.writeFileSync(f, Buffer.from(s.result.data, 'base64'));
  return f;
}

await send('Runtime.enable'); await send('Page.enable');
await send('Page.navigate', { url: FILE });
await sleep(7000);

console.log('A. initial DOM', await ev(`JSON.stringify({
  preloader: getComputedStyle(document.getElementById('preloader')).opacity,
  prompt: document.getElementById('scroll-prompt').className,
  stage: document.getElementById('stage-label').textContent,
  copyright: document.getElementById('copyright').textContent.slice(0,40),
  wordmark: document.getElementById('wordmark').textContent.slice(0,30),
  manifesto: document.getElementById('manifesto-head').textContent,
  sound: document.getElementById('sound-label').textContent,
  hudCanvas: (()=>{const c=document.getElementById('hud');const x=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<x.length;i+=4) if(x[i]>10) n++;return n;})()
})`));

// nav rail: jump to stage 2
console.log('B. nav -> scene 2', await ev(`(()=>{const p=document.querySelectorAll('.nav-pill')[2]; p.click(); return 'clicked ' + p.textContent;})()`));
await sleep(4000);
console.log('   stage/scroll', await ev(`JSON.stringify({stage:S.stage,scroll:+S.scroll.toFixed(3),label:document.getElementById('stage-label').textContent})`));
await shot('nav2');

// hover the crystal at screen centre, read HUD
await mouse('mouseMoved', 640, 380);
await sleep(1200);
console.log('C. hover state', await ev(`JSON.stringify({hover:typeof S.hoverStrength!=='undefined'?+S.hoverStrength.toFixed(2):null, hudDrawn:(()=>{const c=document.getElementById('hud');const x=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<x.length;i+=4) if(x[i]>10) n++;return n;})()})`));
await shot('hover');

// click crystal → modal
await mouse('mousePressed', 640, 380); await sleep(60); await mouse('mouseReleased', 640, 380);
await sleep(1800);
console.log('D. modal', await ev(`JSON.stringify({open:document.getElementById('modal').className, title:document.getElementById('modal-title').textContent, hash:location.hash, href:location.href.slice(-40), body:document.getElementById('modal-body').textContent.slice(0,60)})`));
await shot('modal');

// close via Escape
await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
await sleep(1800);
console.log('E. after esc', await ev(`JSON.stringify({open:document.getElementById('modal').className, hash:location.hash})`));

// sound toggle
console.log('F. sound', await ev(`(()=>{document.getElementById('sound-btn').click(); return document.getElementById('sound-label').textContent;})()`));
await sleep(600);
console.log('   after toggle', await ev(`document.getElementById('sound-label').textContent`));

// dais morph buttons
await ev(`S.t=0.85;S.scroll=0.85;1`);
await sleep(4000);
console.log('G. dais', await ev(`JSON.stringify({stage:S.stage, links:document.getElementById('dais-links').className, morph:+S.morphMix.toFixed(2)})`));
await ev(`document.getElementById('dais-next').click(); 1`);
await sleep(2500);
console.log('   after next', await ev(`JSON.stringify({morph:+S.morphMix.toFixed(2), links:document.getElementById('dais-links').textContent.slice(0,60)})`));
await shot('dais');

console.log('\nLOGS\n' + (logs.slice(0, 30).join('\n') || '(clean)'));
ws.close(); proc.kill(); process.exit(0);
