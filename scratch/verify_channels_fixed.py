import json
import urllib.request
import time
import base64
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from cdp_indiadealhunts import SimpleWS
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

time.sleep(3) # Wait for reload

data = json.loads(urllib.request.urlopen("http://127.0.0.1:9222/json").read())
df_tab = None
for page in data:
    if page.get("type") == "page" and "dealflow-topaz-seven.vercel.app" in page.get("url", ""):
        df_tab = page
        break

if df_tab:
    ws = SimpleWS(df_tab["webSocketDebuggerUrl"])
    
    # Click "Channels" tab
    click_js = """
    (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Channels'));
        if (btn) {
            btn.click();
            return { clicked: true, text: btn.innerText };
        }
        return { clicked: false };
    })()
    """
    click_res = ws.eval_js(click_js)
    print("Click result:", click_res)
    time.sleep(2)
    
    # Check text in main
    inspect_js = """
    (() => {
        const headerBadges = Array.from(document.querySelectorAll('[class*="badge"], button')).map(b => b.innerText.trim()).filter(t => t.includes('Channel'));
        const channelCards = Array.from(document.querySelectorAll('.channel-row, [class*="channel"], tr')).map(el => el.innerText.trim()).filter(t => t.length > 5 && t.length < 200);
        return {
            headerBadges: headerBadges,
            channelCardsCount: channelCards.length,
            sample: channelCards.slice(0, 5)
        };
    })()
    """
    inspect_res = ws.eval_js(inspect_js)
    print("Channels inspection:", json.dumps(inspect_res, indent=2))
    
    # Capture Screenshot
    payload = json.dumps({
        "id": 999,
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
        if data.get("id") == 999:
            img_data = base64.b64decode(data["result"]["data"])
            out_path = Path("C:/Users/Neel/.gemini/antigravity-ide/brain/0e459aef-aaee-4c4a-9cda-ad0d398fb988/dealflow_channels_fixed.png")
            with open(out_path, "wb") as f:
                f.write(img_data)
            print(f"Captured dealflow_channels_fixed.png -> {out_path}")
            break
