import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE_URL = 'http://127.0.0.1:4173/';
const SHOT_DIR = 'E:\\Rudranildocs0066543\\html-yt\\scratch\\browser_audit_shots';

fs.mkdirSync(SHOT_DIR, { recursive: true });

const views = [
  { name: '01_home_desktop_light', query: '', dark: false, w: 1440, h: 900 },
  { name: '01_home_desktop_dark', query: '', dark: true, w: 1440, h: 900 },
  { name: '01_home_mobile_light', query: '', dark: false, w: 390, h: 844 },
  { name: '01_home_mobile_dark', query: '', dark: true, w: 390, h: 844 },

  { name: '02_profile_auth_desktop_light', query: '?tab=profile&auth=1', dark: false, w: 1440, h: 900 },
  { name: '02_profile_auth_desktop_dark', query: '?tab=profile&auth=1', dark: true, w: 1440, h: 900 },
  { name: '02_profile_auth_mobile_dark', query: '?tab=profile&auth=1', dark: true, w: 390, h: 844 },

  { name: '03_price_alert_desktop_dark', query: '?modal=alert', dark: true, w: 1440, h: 900 },
  { name: '03_price_alert_desktop_light', query: '?modal=alert', dark: false, w: 1440, h: 900 },

  { name: '04_deal_detail_desktop_dark', query: '?modal=detail', dark: true, w: 1440, h: 900 },
  { name: '04_deal_detail_desktop_light', query: '?modal=detail', dark: false, w: 1440, h: 900 },

  { name: '05_wall_happiness_desktop_dark', query: '?tab=wall_of_happiness', dark: true, w: 1440, h: 900 },
  { name: '05_wall_happiness_desktop_light', query: '?tab=wall_of_happiness', dark: false, w: 1440, h: 900 },

  { name: '06_compare_desktop_dark', query: '?modal=compare', dark: true, w: 1440, h: 900 },
  { name: '07_submit_deal_desktop_dark', query: '?tab=submit_deal', dark: true, w: 1440, h: 900 },

  { name: '08_tool_gst_desktop_dark', query: '?modal=tools&tool=gst', dark: true, w: 1440, h: 900 },
  { name: '09_tool_warranty_desktop_dark', query: '?modal=tools&tool=warranty', dark: true, w: 1440, h: 900 },
  { name: '10_tool_budget_desktop_dark', query: '?modal=tools&tool=budget', dark: true, w: 1440, h: 900 },
  { name: '11_search_palette_desktop_dark', query: '?modal=search', dark: true, w: 1440, h: 900 },
];

console.log('Capturing remaining visual audit snapshots...');
for (const v of views) {
  const outPath = path.join(SHOT_DIR, `${v.name}.png`);
  const tmpDir = `C:\\temp\\edge_fast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const args = [
    `"${EDGE_PATH}"`,
    '--headless',
    `--user-data-dir="${tmpDir}"`,
    v.dark ? '--force-dark-mode' : '',
    `--window-size=${v.w},${v.h}`,
    `--screenshot="${outPath}"`,
    `"${BASE_URL}${v.query}"`,
  ].filter(Boolean).join(' ');

  try {
    execSync(args, { stdio: 'ignore', timeout: 15000 });
    const size = fs.existsSync(outPath) ? fs.statSync(outPath).size : 0;
    console.log(`✓ ${v.name}.png (${size.toLocaleString()} bytes)`);
  } catch (err) {
    console.error(`✗ Failed ${v.name}`);
  }
}
console.log('Done!');

