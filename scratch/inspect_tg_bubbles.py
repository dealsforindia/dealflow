import json
import urllib.request
import sys
import io
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, str(Path(__file__).parent))
from cdp_indiadealhunts import SimpleWS

pages = json.loads(urllib.request.urlopen("http://127.0.0.1:9222/json").read())
tg_page = None
for p in pages:
    if p.get("type") == "page" and "dealsforindiachannel" in p.get("url", ""):
        tg_page = p
        break

if tg_page:
    ws = SimpleWS(tg_page["webSocketDebuggerUrl"])
    js = """
    (() => {
        const bubbles = Array.from(document.querySelectorAll('.bubble, .message, [data-message-id]')).map((el, idx) => {
            const timeEl = el.querySelector('.time, [class*="time"]');
            return {
                index: idx,
                id: el.getAttribute('data-message-id') || el.id,
                time: timeEl ? timeEl.innerText.trim() : '',
                text: el.innerText.trim()
            };
        }).filter(b => b.text.length > 0);
        return {
            total: bubbles.length,
            bubbles: bubbles.slice(-20)
        };
    })()
    """
    res = ws.eval_js(js)
    print(json.dumps(res, indent=2, ensure_ascii=False))
