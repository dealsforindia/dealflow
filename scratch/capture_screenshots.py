import json
import urllib.request
import base64
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from cdp_indiadealhunts import SimpleWS

artifact_dir = Path("C:/Users/Neel/.gemini/antigravity-ide/brain/0e459aef-aaee-4c4a-9cda-ad0d398fb988")
artifact_dir.mkdir(parents=True, exist_ok=True)

def capture_tab(url_match, filename):
    pages = json.loads(urllib.request.urlopen('http://127.0.0.1:9222/json').read())
    for p in pages:
        if url_match in p.get('url', '') and p.get('type') == 'page':
            # Activate tab first
            urllib.request.urlopen(f"http://127.0.0.1:9222/json/activate/{p['id']}")
            ws = SimpleWS(p['webSocketDebuggerUrl'])
            # Request screenshot
            payload = json.dumps({
                "id": 101,
                "method": "Page.captureScreenshot",
                "params": {
                    "format": "png",
                    "quality": 85
                }
            })
            ws.send_text(payload)
            while True:
                msg = ws.recv_text()
                if not msg:
                    break
                data = json.loads(msg)
                if data.get("id") == 101:
                    img_data = base64.b64decode(data["result"]["data"])
                    out_path = artifact_dir / filename
                    with open(out_path, "wb") as f:
                        f.write(img_data)
                    print(f"Captured {filename} ({len(img_data)} bytes) -> {out_path}")
                    return str(out_path).replace("\\", "/")
    return None

p1 = capture_tab("indiadealhunts.vercel.app", "indiadealhunts_showcase.png")
p2 = capture_tab("dealflow-topaz-seven.vercel.app", "dealflow_curation_deck.png")
print("P1:", p1)
print("P2:", p2)
