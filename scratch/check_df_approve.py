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
    # Check if there are any errors or what happens on approve
    js = """
    (() => {
        // Find first deal card and inspect its approve button
        const approveBtn = document.querySelector('button[title*="Approve"]');
        return {
            hasApproveBtn: !!approveBtn,
            approveBtnText: approveBtn ? approveBtn.innerText : null,
            apiBase: window.location.origin,
            localStorageItems: Object.keys(localStorage).map(k => ({ [k]: localStorage.getItem(k) }))
        };
    })()
    """
    res = ws.eval_js(js)
    print("INSPECT RESULT:", json.dumps(res, indent=2))
