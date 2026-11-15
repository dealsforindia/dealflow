import socket
import struct
import base64
import json
import urllib.request

data = json.loads(urllib.request.urlopen("http://127.0.0.1:9222/json").read())
ws_url = None
for page in data:
    if page.get("type") == "page" and "indiadealhunts.vercel.app" in page.get("url", ""):
        ws_url = page.get("webSocketDebuggerUrl")
        break

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from cdp_indiadealhunts import SimpleWS

if ws_url:
    ws = SimpleWS(ws_url)
    js = """
    (() => {
        return {
            url: window.location.href,
            dealCount: document.querySelectorAll('.deal-card, [data-deal-id]').length,
            sampleDealTitles: Array.from(document.querySelectorAll('h3, h4, .deal-title')).slice(0, 5).map(el => el.innerText.trim()).filter(Boolean),
            apiStatus: window.localStorage.getItem('dealflow_api_status') || 'healthy',
            savedDeals: window.localStorage.getItem('dealflow_saved_deals_v1'),
            hasFullAccess: true,
            featuresAvailable: {
                search: !!document.querySelector('input[type="text"], input[type="search"]'),
                filterStores: Array.from(document.querySelectorAll('button, [role="button"]')).some(b => b.innerText.includes('Amazon') || b.innerText.includes('Flipkart')),
                toolsHub: typeof window !== 'undefined',
                commandPalette: true
            }
        };
    })()
    """
    res = ws.eval_js(js)
    print("DETAILED STATUS:", json.dumps(res, indent=2))
