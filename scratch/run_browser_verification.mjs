import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const SHOT_DIR = 'E:\\Rudranildocs0066543\\html-yt\\scratch\\browser_check_results';
fs.mkdirSync(SHOT_DIR, { recursive: true });

const auditTargets = [
  // 1. Public Storefront Desktop Dark
  {
    name: '01_storefront_desktop_dark',
    url: 'http://127.0.0.1:4173/',
    dark: true,
    w: 1440,
    h: 900
  },
  // 2. Public Storefront Desktop Light
  {
    name: '02_storefront_desktop_light',
    url: 'http://127.0.0.1:4173/',
    dark: false,
    w: 1440,
    h: 900
  },
  // 3. Public Storefront Mobile Dark
  {
    name: '03_storefront_mobile_dark',
    url: 'http://127.0.0.1:4173/',
    dark: true,
    w: 390,
    h: 844
  },
  // 4. Admin Curation Deck Desktop
  {
    name: '04_admin_curation_deck',
    url: 'http://127.0.0.1:4174/',
    dark: true,
    w: 1440,
    h: 900
  },
  // 5. Public Storefront Deal Detail Modal
  {
    name: '05_storefront_deal_detail',
    url: 'http://127.0.0.1:4173/?modal=detail',
    dark: true,
    w: 1440,
    h: 900
  },
  // 6. Public Storefront Price Alert Modal
  {
    name: '06_storefront_price_alert',
    url: 'http://127.0.0.1:4173/?modal=alert',
    dark: true,
    w: 1440,
    h: 900
  }
];

console.log('--- Running Browser Verification Audit ---');
for (const target of auditTargets) {
  const outShot = path.join(SHOT_DIR, `${target.name}.png`);
  const outDom = path.join(SHOT_DIR, `${target.name}_dom.html`);
  const tmpDir = `C:\\temp\\edge_audit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  try {
    const cmd = [
      `"${EDGE_PATH}"`,
      '--headless',
      '--disable-gpu',
      `--user-data-dir="${tmpDir}"`,
      target.dark ? '--force-dark-mode' : '',
      `--window-size=${target.w},${target.h}`,
      `--screenshot="${outShot}"`,
      `--dump-dom`,
      `"${target.url}"`
    ].filter(Boolean).join(' ');

    const domHtml = execSync(cmd, { encoding: 'utf-8', timeout: 30000 });
    fs.writeFileSync(outDom, domHtml, 'utf-8');
    console.log(`[PASS] Captured ${target.name} (shot: ${fs.statSync(outShot).size} bytes, DOM: ${domHtml.length} chars)`);
  } catch (err) {
    console.error(`[FAIL] Error capturing ${target.name}:`, err.message);
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
  }
}

console.log('--- Checking for Channel Leaks in Captured DOMs ---');
const leakPatterns = [
  'crazy deals', 'fetdeals', 'fet (deals', 'offerzone', 'dealztrendz',
  'genie loot', 'free earning tech', 'technical sheikh', 'loot deals app',
  'glam haul diaries', 'trending loot deals'
];

const domFiles = fs.readdirSync(SHOT_DIR).filter(f => f.endsWith('_dom.html'));
for (const df of domFiles) {
  const content = fs.readFileSync(path.join(SHOT_DIR, df), 'utf-8').toLowerCase();
  const hits = leakPatterns.filter(p => content.includes(p));
  if (hits.length > 0) {
    console.warn(`[LEAK DETECTED] in ${df}: found ${hits.join(', ')}`);
  } else {
    console.log(`[CLEAN - ZERO LEAKS] in ${df}`);
  }
}

