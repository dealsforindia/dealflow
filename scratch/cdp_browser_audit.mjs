import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const WS = globalThis.WebSocket;
const CHROME_PATH = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

async function waitForPort(port, timeoutMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) return await res.json();
    } catch {}
    await new Promise(r => setTimeout(r, 200));
  }
  throw new Error(`Timeout waiting for Chrome on port ${port}`);
}

async function cdpClient(port = 9222) {
  const newTargetRes = await fetch(`http://127.0.0.1:${port}/json/new?http://127.0.0.1:4173/`, { method: 'PUT' });
  const target = await newTargetRes.json();
  console.log('Created Target:', target.id);

  const ws = new WS(target.webSocketDebuggerUrl);
  let id = 1;
  const callbacks = new Map();
  const events = [];

  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });

  ws.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    if (data.id && callbacks.has(data.id)) {
      callbacks.get(data.id)(data);
      callbacks.delete(data.id);
    } else if (data.method) {
      events.push(data);
    }
  };

  const send = (method, params = {}) => {
    return new Promise((resolve) => {
      const msgId = id++;
      callbacks.set(msgId, resolve);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  };

  return { ws, send, target, events };
}

async function run() {
  console.log('Spawning Headless Chrome directly from Node...');
  const chromeProcess = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--user-data-dir=C:\\temp\\chrome_dev_audit_prof',
    '--disable-gpu',
    '--no-first-run',
    'about:blank'
  ]);

  chromeProcess.on('error', (err) => console.error('Chrome process error:', err));

  try {
    const versionInfo = await waitForPort(9222, 10000);
    console.log('Connected to Chrome:', versionInfo.Browser);

    const { send, target, ws } = await cdpClient(9222);

    // Enable domains
    await send('Page.enable');
    await send('Runtime.enable');
    await send('DOM.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    console.log('Navigating to http://127.0.0.1:4173/ ...');
    await send('Page.navigate', { url: 'http://127.0.0.1:4173/' });

    // Wait for hydration and data load
    await new Promise(r => setTimeout(r, 3500));

    async function evalJs(expr) {
      const res = await send('Runtime.evaluate', {
        expression: expr,
        returnByValue: true,
        awaitPromise: true
      });
      return res.result?.value;
    }

    console.log('Page Title:', await evalJs(`document.title`));

    // 1. Light Mode Desktop Check
    const lightStatus = await evalJs(`({
      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
      dealsRendered: document.querySelectorAll('.commerce-product-card, article').length,
      buttonsCount: document.querySelectorAll('button').length
    })`);
    console.log('1. Light Mode Desktop:', lightStatus);

    const lightShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.mkdirSync('scratch', { recursive: true });
    fs.writeFileSync('scratch/browser-check-light-desktop.png', Buffer.from(lightShot.result.data, 'base64'));
    console.log('   ✓ Saved scratch/browser-check-light-desktop.png');

    // 2. Dark Mode Toggle
    console.log('2. Toggling to Dark Mode...');
    const toggleRes = await evalJs(`(() => {
      const btn = document.querySelector('button[aria-label*="theme"], button[aria-label*="Dark"], button[aria-label*="Light"], .theme-toggle, button:has(svg.lucide-moon), button:has(svg.lucide-sun)');
      if (btn) { btn.click(); return 'clicked theme toggle'; }
      document.documentElement.classList.add('dark');
      return 'manually added dark class';
    })()`);
    console.log('   Result:', toggleRes);
    await new Promise(r => setTimeout(r, 1000));

    const darkStatus = await evalJs(`({
      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      hasOverflow: document.documentElement.scrollWidth > window.innerWidth
    })`);
    console.log('   Dark Mode Status:', darkStatus);

    const darkShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/browser-check-dark-desktop.png', Buffer.from(darkShot.result.data, 'base64'));
    console.log('   ✓ Saved scratch/browser-check-dark-desktop.png');

    // 3. Contrast & Readability Scan in Dark Mode
    const contrastScan = await evalJs(`(() => {
      const issues = [];
      const els = document.querySelectorAll('button, a, h1, h2, h3, h4, span, p');
      for (const el of els) {
        if (!el.offsetParent) continue;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        const s = window.getComputedStyle(el);
        const col = s.color;
        const bg = s.backgroundColor;
        // Flag dark text on dark background
        if (col === 'rgb(0, 0, 0)' || col === 'rgb(15, 23, 42)') {
          if (bg === 'rgb(13, 21, 39)' || bg === 'rgb(7, 10, 17)' || bg === 'rgb(0, 0, 0)') {
            issues.push({ text: el.innerText.slice(0, 30), problem: 'dark text on dark bg', tag: el.tagName });
          }
        }
        // Flag white text on white background
        if (col === 'rgb(255, 255, 255)' && bg === 'rgb(255, 255, 255)') {
          issues.push({ text: el.innerText.slice(0, 30), problem: 'white on white', tag: el.tagName });
        }
      }
      return issues.slice(0, 10);
    })()`);
    console.log('3. Dark Mode Contrast Scan Issues (0 is ideal):', contrastScan.length, contrastScan);

    // 4. Mobile Viewport (390 x 844)
    console.log('4. Testing Mobile Viewport (390x844)...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await new Promise(r => setTimeout(r, 1000));

    const mobileStatus = await evalJs(`({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
      navItemsCount: document.querySelectorAll('.commerce-mobile-nav button, nav button').length
    })`);
    console.log('   Mobile Status:', mobileStatus);

    const mobileShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/browser-check-mobile.png', Buffer.from(mobileShot.result.data, 'base64'));
    console.log('   ✓ Saved scratch/browser-check-mobile.png');

    // 5. Test Deal Card More Menu Sheet
    console.log('5. Testing Deal Card More Menu Sheet...');
    const clickMore = await evalJs(`(() => {
      const btn = document.querySelector('.commerce-card-more');
      if (btn) { btn.click(); return true; }
      return false;
    })()`);
    await new Promise(r => setTimeout(r, 800));

    const sheetStatus = await evalJs(`(() => {
      const sheet = document.querySelector('.commerce-product-sheet');
      if (!sheet) return { open: false };
      const actions = Array.from(sheet.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean);
      return {
        open: true,
        role: sheet.getAttribute('role'),
        actions: actions.slice(0, 8)
      };
    })()`);
    console.log('   Shopping Options Sheet:', sheetStatus);

    const sheetShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/browser-check-sheet.png', Buffer.from(sheetShot.result.data, 'base64'));
    console.log('   ✓ Saved scratch/browser-check-sheet.png');

    // Dismiss sheet
    await evalJs(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
    await new Promise(r => setTimeout(r, 500));

    // 6. Test Category Stories / Story Modal
    console.log('6. Testing Category Stories Modal...');
    const storyClick = await evalJs(`(() => {
      const storyRing = document.querySelector('button:has(.rounded-full):has(span), .category-story-item');
      if (storyRing) { storyRing.click(); return true; }
      return false;
    })()`);
    await new Promise(r => setTimeout(r, 1000));

    const storyStatus = await evalJs(`(() => {
      const pauseBtn = document.querySelector('button[aria-label*="Pause"], button[aria-label*="Resume"]');
      const closeBtn = document.querySelector('button[aria-label*="Close"]');
      const prevBtn = document.querySelector('button[aria-label*="Previous"]');
      const nextBtn = document.querySelector('button[aria-label*="Next"]');
      return {
        storyOpen: Boolean(pauseBtn || closeBtn),
        hasPauseBtn: Boolean(pauseBtn),
        pauseLabel: pauseBtn?.getAttribute('aria-label'),
        hasAccessibleTapButtons: Boolean(prevBtn && nextBtn)
      };
    })()`);
    console.log('   Story Modal Status:', storyStatus);

    if (storyStatus.storyOpen) {
      const storyShot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('scratch/browser-check-story.png', Buffer.from(storyShot.result.data, 'base64'));
      console.log('   ✓ Saved scratch/browser-check-story.png');

      // Dismiss story modal
      await evalJs(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
      await new Promise(r => setTimeout(r, 500));
    }

    // 7. Test Command Palette
    console.log('7. Testing Command Palette...');
    await evalJs(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))`);
    await new Promise(r => setTimeout(r, 1000));

    const paletteStatus = await evalJs(`(() => {
      const listbox = document.querySelector('[role="listbox"]');
      const options = document.querySelectorAll('[role="option"]');
      return {
        open: Boolean(listbox),
        roleListbox: Boolean(listbox),
        roleOptionCount: options.length
      };
    })()`);
    console.log('   Command Palette Status:', paletteStatus);

    if (paletteStatus.open) {
      const paletteShot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('scratch/browser-check-palette.png', Buffer.from(paletteShot.result.data, 'base64'));
      console.log('   ✓ Saved scratch/browser-check-palette.png');

      await evalJs(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
      await new Promise(r => setTimeout(r, 500));
    }

    // 8. Test Deal Detail Modal
    console.log('8. Testing Deal Detail Modal...');
    await evalJs(`(() => {
      const card = document.querySelector('.commerce-product-card');
      if (card) card.click();
    })()`);
    await new Promise(r => setTimeout(r, 1200));

    const detailModalStatus = await evalJs(`(() => {
      const modal = document.querySelector('[role="dialog"]');
      if (!modal) return { open: false };
      const btns = Array.from(modal.querySelectorAll('button, a')).map(b => b.innerText.trim()).filter(Boolean);
      const isAnyBuyAdd = btns.some(t => t.includes('Buy Add') || t.includes('Buy Step'));
      return {
        open: true,
        role: modal.getAttribute('role'),
        hasAnyBuyAddGlitch: isAnyBuyAdd,
        buttons: btns.slice(0, 10)
      };
    })()`);
    console.log('   Deal Detail Modal Status:', detailModalStatus);

    if (detailModalStatus.open) {
      const detailShot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('scratch/browser-check-detail.png', Buffer.from(detailShot.result.data, 'base64'));
      console.log('   ✓ Saved scratch/browser-check-detail.png');

      await evalJs(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
      await new Promise(r => setTimeout(r, 500));
    }

    // Close CDP websocket
    ws.close();
    console.log('All tests completed successfully!');

  } finally {
    chromeProcess.kill();
    console.log('Cleaned up Chrome process.');
  }
}

run().catch(err => {
  console.error('Audit run error:', err);
  process.exit(1);
});
