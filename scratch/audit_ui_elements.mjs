import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE_URL = 'http://127.0.0.1:4173/';
const OUT_DIR = 'E:\\Rudranildocs0066543\\html-yt\\scratch\\ui_audit_shots';

fs.mkdirSync(OUT_DIR, { recursive: true });

function capture(name, { dark = false, width = 1440, height = 900, url = BASE_URL } = {}) {
  const tmpDir = `C:\\temp\\edge_audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const outPath = path.join(OUT_DIR, `${name}.png`);
  
  const args = [
    `"${EDGE_PATH}"`,
    '--headless',
    `--user-data-dir="${tmpDir}"`,
    dark ? '--force-dark-mode' : '',
    `--window-size=${width},${height}`,
    `--screenshot="${outPath}"`,
    `"${url}"`
  ].filter(Boolean).join(' ');

  try {
    execSync(args, { stdio: 'pipe', timeout: 15000 });
    const stats = fs.statSync(outPath);
    console.log(`✓ Captured ${name}.png (${stats.size.toLocaleString()} bytes) [${dark ? 'DARK' : 'LIGHT'} ${width}x${height}]`);
    return { success: true, size: stats.size, path: outPath };
  } catch (err) {
    console.error(`✗ Failed to capture ${name}:`, err.message);
    return { success: false, error: err.message };
  }
}

async function audit() {
  console.log('--- STARTING SYSTEMATIC BROWSER UI AUDIT ---');

  // 1. Desktop Light vs Dark Home
  capture('01_desktop_home_light', { dark: false, width: 1440, height: 900 });
  capture('02_desktop_home_dark', { dark: true, width: 1440, height: 900 });

  // 2. Mobile Light vs Dark Home
  capture('03_mobile_home_light', { dark: false, width: 390, height: 844 });
  capture('04_mobile_home_dark', { dark: true, width: 390, height: 844 });

  console.log('\nAudit screenshots successfully generated in scratch/ui_audit_shots/');
}

audit();

