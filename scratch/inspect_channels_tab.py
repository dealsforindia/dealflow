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
        const main = document.querySelector('main, .content, .h-full, #root');
        return {
            text: main ? main.innerText.slice(0, 1000) : ''
        };
    })()
    """
    res = ws.eval_js(js)
    print("CHANNELS TAB VIEW:", json.dumps(res, indent=2))
