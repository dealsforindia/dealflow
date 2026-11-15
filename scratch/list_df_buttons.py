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
        const allButtons = Array.from(document.querySelectorAll('button')).map(b => ({
            text: b.innerText.trim(),
            title: b.title,
            className: b.className
        }));
        return {
            buttonCount: allButtons.length,
            buttons: allButtons.slice(0, 30)
        };
    })()
    """
    res = ws.eval_js(js)
    print("ALL BUTTONS:", json.dumps(res, indent=2))
