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
    
    # Enable Log and Runtime to catch console messages and check DOM errors
    js = """
    (() => {
        // Find broken images
        const brokenImages = Array.from(document.querySelectorAll('img')).filter(img => !img.complete || img.naturalWidth === 0).map(img => ({
            src: img.src,
            alt: img.alt,
            parent: img.parentElement ? img.parentElement.innerText.slice(0, 50) : ''
        }));

        // Check for any red error banners or alerts
        const alerts = Array.from(document.querySelectorAll('[class*="error"], [class*="alert"], [class*="fail"], [role="alert"]')).map(el => el.innerText.trim()).filter(Boolean);

        // Check window errors if tracked
        const errs = window.__errors || [];

        // Check cards count and state
        const pendingCountEl = document.querySelector('[class*="badge"], button');
        
        // Inspect failed network or broken elements
        const badCards = Array.from(document.querySelectorAll('.deal-card, [data-deal-card]')).filter(c => {
            return c.innerText.includes('NaN') || c.innerText.includes('undefined') || c.innerText.includes('null') || c.innerText.includes('[object');
        }).map(c => c.innerText.slice(0, 100));

        return {
            title: document.title,
            brokenImagesCount: brokenImages.length,
            brokenImages: brokenImages.slice(0, 5),
            alerts: alerts.slice(0, 5),
            windowErrors: errs,
            badCards: badCards
        };
    })()
    """
    res = ws.eval_js(js)
    print("DEALFLOW DIAGNOSTICS:", json.dumps(res, indent=2))
