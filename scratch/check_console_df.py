import json
import urllib.request
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from cdp_indiadealhunts import SimpleWS

data = json.loads(urllib.request.urlopen("http://127.0.0.1:9222/json").read())
df_tab = None
for page in data:
    if page.get("type") == "page" and "dealflow-topaz-seven.vercel.app" in page.get("url", ""):
        df_tab = page
        break

if df_tab:
    ws = SimpleWS(df_tab["webSocketDebuggerUrl"])
    # Send Log.enable and inspect recent messages
    payload = json.dumps({"id": 201, "method": "Log.enable"})
    ws.send_text(payload)
    
    # Also evaluate console errors in window
    js = """
    (() => {
        // Collect everything from performance entries
        const resources = performance.getEntriesByType('resource').filter(r => r.name.includes('/api/')).map(r => ({
            name: r.name,
            duration: r.duration,
            transferSize: r.transferSize
        }));
        return {
            resources: resources.slice(-10),
            url: window.location.href,
            activeTab: document.querySelector('.active, [aria-selected="true"]')?.innerText,
        };
    })()
    """
    res = ws.eval_js(js)
    print("CONSOLE & RESOURCES:", json.dumps(res, indent=2))
