import json
import urllib.request
import time
import sys
import io
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, str(Path(__file__).parent))
from cdp_indiadealhunts import SimpleWS

def check_storefront():
    try:
        req = urllib.request.Request('https://api.rudranil.me/api/v1/deals/public')
        with urllib.request.urlopen(req, timeout=5) as res:
            data = json.loads(res.read())
            deals = data.get('deals', [])
            total = data.get('total', 0)
            return {
                "status": "clean" if len(deals) == 0 else "DEAL_DETECTED",
                "count": len(deals),
                "total": total,
                "titles": [d.get("title") for d in deals[:3]]
            }
    except Exception as e:
        return {"status": "error", "error": str(e), "count": -1}

def check_dealflow():
    try:
        from admin_token_helper import ADMIN_TOKEN
    except:
        ADMIN_TOKEN = os.getenv("ADMIN_API_TOKEN", "")
    try:
        req = urllib.request.Request('https://api.rudranil.me/api/v1/deals/pending?limit=5', headers={
            'X-Admin-Token': ADMIN_TOKEN,
            'Authorization': f'Bearer {ADMIN_TOKEN}'
        })
        with urllib.request.urlopen(req, timeout=5) as res:
            data = json.loads(res.read())
            pending = data.get('deals', [])
            total = data.get('total', len(pending))
            return {
                "status": "accumulating" if total > 0 else "empty",
                "pending_count": total,
                "latest_incoming": [d.get("prod_name") or d.get("title") for d in pending[:2]]
            }
    except Exception as e:
        return {"status": "error", "error": str(e), "pending_count": -1}

def check_telegram():
    try:
        pages = json.loads(urllib.request.urlopen("http://127.0.0.1:9222/json").read())
        tg_page = None
        for p in pages:
            if p.get("type") == "page" and "dealsforindiachannel" in p.get("url", ""):
                tg_page = p
                break
        if not tg_page:
            for p in pages:
                if p.get("type") == "page" and "web.telegram.org" in p.get("url", ""):
                    tg_page = p
                    break
        if tg_page:
            ws = SimpleWS(tg_page["webSocketDebuggerUrl"])
            js = """
            (() => {
                const bubbles = Array.from(document.querySelectorAll('.bubble, .message, [data-message-id]')).map(el => el.innerText.trim()).filter(Boolean);
                const lastMsg = bubbles.length > 0 ? bubbles[bubbles.length - 1] : "";
                return {
                    totalBubbles: bubbles.length,
                    lastMessageSnippet: lastMsg.slice(0, 120).replace(/\\n/g, ' ')
                };
            })()
            """
            return ws.eval_js(js)
    except Exception as e:
        return {"error": str(e)}
    return {"status": "tab_not_found"}

if __name__ == "__main__":
    t_now = time.strftime('%H:%M:%S')
    sf = check_storefront()
    df = check_dealflow()
    tg = check_telegram()
    
    print(json.dumps({
        "timestamp": t_now,
        "storefront": sf,
        "dealflow": df,
        "telegram": tg
    }, indent=2, ensure_ascii=False))
