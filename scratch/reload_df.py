import json
import urllib.request
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from cdp_indiadealhunts import SimpleWS

data = json.loads(urllib.request.urlopen("http://127.0.0.1:9222/json").read())
for page in data:
    if page.get("type") == "page" and "dealflow-topaz-seven.vercel.app" in page.get("url", ""):
        ws = SimpleWS(page["webSocketDebuggerUrl"])
        # Reload the page
        ws.send_text(json.dumps({"id": 501, "method": "Page.reload"}))
        print(f"Reloaded page {page['id']}")

