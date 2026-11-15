import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE_URL = 'http://127.0.0.1:4173/';
const OUT_DIR = 'E:\\Rudranildocs0066543\\html-yt\\scratch\\ui_audit_shots';

fs.mkdirSync(OUT_DIR, { recursive: true });

function captureView(name, query, { dark = false, width = 1440, height = 900 } = {}) {
  const tmpDir = `C:\\temp\\edge_view_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const outPath = path.join(OUT_DIR, `${name}.png`);
  const fullUrl = `${BASE_URL}${query}`;

  const args = [
    `"${EDGE_PATH}"`,
    '--headless',
    `--user-data-dir="${tmpDir}"`,
    dark ? '--force-dark-mode' : '',
    `--window-size=${width},${height}`,
    `--screenshot="${outPath}"`,
    `"${fullUrl}"`
  ].filter(Boolean).join(' ');

  try {
    execSync(args, { stdio: 'pipe', timeout: 15000 });
    const stats = fs.statSync(outPath);
    console.log(`✓ [${dark ? 'DARK ' : 'LIGHT'}] ${name}.png (${stats.size.toLocaleString()} bytes) -> ${query}`);
    return true;
  } catch (err) {
    console.error(`✗ Error on ${name}:`, err.message);
    return false;
  }
}

async function run() {
  console.log('Testing Views in Browser...');

  // 1. Saved Deals Page
  captureView('view_saved_light', '?tab=saved', { dark: false });
  captureView('view_saved_dark', '?tab=saved', { dark: true });

  // 2. Tools Hub (EMI Calculator)
  captureView('view_tools_emi_light', '?modal=tools&tool=emi', { dark: false });
  captureView('view_tools_emi_dark', '?modal=tools&tool=emi', { dark: true });

  // 3. How We Verify
  captureView('view_verify_light', '?tab=how_we_verify', { dark: false });
  captureView('view_verify_dark', '?tab=how_we_verify', { dark: true });

  // 4. User Profile / Settings
  captureView('view_profile_light', '?tab=profile', { dark: false });
  captureView('view_profile_dark', '?tab=profile', { dark: true });

  // 5. Search Palette
  captureView('view_search_light', '?modal=search', { dark: false });
  captureView('view_search_dark', '?modal=search', { dark: true });

  console.log('All views tested and captured!');
}

run();

