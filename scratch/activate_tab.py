import urllib.request
import json
import time
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from cdp_indiadealhunts import SimpleWS

def switch_to_tab(match_url):
    pages = json.loads(urllib.request.urlopen('http://127.0.0.1:9222/json').read())
    for p in pages:
        if match_url in p.get('url', '') and p.get('type') == 'page':
            urllib.request.urlopen(f"http://127.0.0.1:9222/json/activate/{p['id']}")
            print(f"Switched to {match_url} ({p['id']})")
            return p
    return None

# Activate IndiaDealHunts
p = switch_to_tab("indiadealhunts.vercel.app")
if p:
    ws = SimpleWS(p['webSocketDebuggerUrl'])
    # Scroll smoothly through the showcase part
    scroll_js = """
    (() => {
        window.scrollTo({ top: 300, behavior: 'smooth' });
        return { scrolled: true, y: window.scrollY };
    })()
    """
    res = ws.eval_js(scroll_js)
    print("Scroll result:", res)
