import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const SHOT_DIR = 'E:\\Rudranildocs0066543\\html-yt\\scratch\\browser_check_results';

async function captureWithDelay(url, outName, waitMs = 5000) {
  const outShot = path.join(SHOT_DIR, `${outName}.png`);
  const outDom = path.join(SHOT_DIR, `${outName}_dom.html`);
  const tmpDir = `C:\\temp\\edge_timed_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  try {
    const cmd = [
      `"${EDGE_PATH}"`,
      '--headless',
      '--disable-gpu',
      `--user-data-dir="${tmpDir}"`,
      `--window-size=1440,900`,
      `--virtual-time-budget=${waitMs}`,
      `--screenshot="${outShot}"`,
      `--dump-dom`,
      `"${url}"`
    ].join(' ');

    const domHtml = execSync(cmd, { encoding: 'utf-8', timeout: 45000 });
    fs.writeFileSync(outDom, domHtml, 'utf-8');
    console.log(`[PASS] ${outName}: shot ${fs.statSync(outShot).size} bytes, DOM ${domHtml.length} chars`);
  } catch (err) {
    console.error(`[FAIL] ${outName}:`, err.message);
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
  }
}

async function run() {
  console.log('Capturing Admin Deck with virtual-time-budget...');
  await captureWithDelay('http://127.0.0.1:4174/', 'admin_deck_live_wait', 6000);
  console.log('Capturing Storefront with virtual-time-budget...');
  await captureWithDelay('http://127.0.0.1:4173/', 'storefront_live_wait', 6000);
}

run();

