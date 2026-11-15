import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const SHOT_DIR = 'E:\\Rudranildocs0066543\html-yt\\scratch\\browser_check_results';

async function checkVercelAdminDeck() {
  const url = 'https://dealflow-topaz-seven.vercel.app/';
  const outShot = path.join(SHOT_DIR, 'admin_deck_vercel_live.png');
  const outDom = path.join(SHOT_DIR, 'admin_deck_vercel_dom.html');
  const tmpDir = `C:\\temp\\edge_vercel_${Date.now()}`;

  try {
    const cmd = [
      `"${EDGE_PATH}"`,
      '--headless',
      '--disable-gpu',
      `--user-data-dir="${tmpDir}"`,
      `--window-size=1440,900`,
      `--virtual-time-budget=6000`,
      `--screenshot="${outShot}"`,
      `--dump-dom`,
      `"${url}"`
    ].join(' ');

    const domHtml = execSync(cmd, { encoding: 'utf-8', timeout: 45000 });
    fs.writeFileSync(outDom, domHtml, 'utf-8');
    console.log(`[PASS] Vercel Admin Deck captured: shot ${fs.statSync(outShot).size} bytes, DOM ${domHtml.length} chars`);
  } catch (err) {
    console.error(`[FAIL] Vercel Admin Deck:`, err.message);
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
  }
}

checkVercelAdminDeck();

