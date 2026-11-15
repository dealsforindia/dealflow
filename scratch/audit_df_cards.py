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
    js = """
    (() => {
        // Collect all card titles and fingerprints
        const cards = Array.from(document.querySelectorAll('.deal-card, [data-deal-card]')).map(c => {
            const title = c.querySelector('h3, h4, [class*="title"]')?.innerText?.trim() || '';
            const price = c.querySelector('[class*="price"]')?.innerText?.trim() || '';
            const store = c.querySelector('[class*="store"], [class*="badge"]')?.innerText?.trim() || '';
            const buttons = Array.from(c.querySelectorAll('button')).map(b => b.innerText.trim());
            const hasVideoOverlay = !!c.querySelector('svg.lucide-play, [class*="play"], [class*="video"]');
            return { title, price, store, buttons, hasVideoOverlay };
        });

        // Check for duplicate titles in view
        const titleCounts = {};
        cards.forEach(c => {
            if (c.title) {
                titleCounts[c.title] = (titleCounts[c.title] || 0) + 1;
            }
        });
        const duplicates = Object.entries(titleCounts).filter(([t, count]) => count > 1);

        return {
            totalCardsInView: cards.length,
            duplicatesInView: duplicates,
            sampleCards: cards.slice(0, 10)
        };
    })()
    """
    res = ws.eval_js(js)
    print("DEALFLOW CARDS AUDIT:", json.dumps(res, indent=2))
