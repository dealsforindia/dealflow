import urllib.request
import json
import re
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

def check_backend():
    print("="*60)
    print("1. CHECKING BACKEND API (https://api.rudranil.me)")
    print("="*60)
    try:
        req = urllib.request.Request("https://api.rudranil.me/health", headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as r:
            print(f"GET /health -> Status: {r.status}")
            data = json.loads(r.read().decode())
            print("Health response:", json.dumps(data, indent=2))
    except Exception as e:
        print("GET /health error (or fallback):", e)

    try:
        req = urllib.request.Request("https://api.rudranil.me/api/v1/deals/public?limit=10", headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as r:
            print(f"\nGET /api/v1/deals/public -> Status: {r.status}")
            data = json.loads(r.read().decode())
            deals = data.get("deals", []) if isinstance(data, dict) else data
            print(f"Total public deals returned: {len(deals)}")
            print("Latest 3 published deals in public API:")
            for i, d in enumerate(deals[:3], 1):
                print(f"  {i}. [{d.get('store')}] {d.get('prod_name', d.get('title'))[:55]} | ₹{d.get('price')} (FP: {d.get('fp_hash')})")
    except Exception as e:
        print("GET /api/v1/deals/public error:", e)

def check_indiadealhunts():
    print("\n" + "="*60)
    print("2. CHECKING INDIADEALHUNTS STOREFRONT (https://indiadealhunts.vercel.app)")
    print("="*60)
    try:
        req = urllib.request.Request("https://indiadealhunts.vercel.app", headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as r:
            print(f"Storefront Web Status: {r.status} OK")
            html = r.read().decode("utf-8", errors="ignore")
            title_m = re.search(r"<title>(.*?)</title>", html, re.I)
            title = title_m.group(1) if title_m else "N/A"
            print(f"Page Title: {title}")
            print(f"HTML Size: {len(html)} bytes")
            if "deal" in html.lower() or "loot" in html.lower():
                print("IndiaDealHunts consumer storefront is healthy and rendering HTML correctly.")
    except Exception as e:
        print("IndiaDealHunts check error:", e)

def check_dealflow():
    print("\n" + "="*60)
    print("3. CHECKING DEALFLOW ADMIN DECK (https://dealflow-topaz-seven.vercel.app)")
    print("="*60)
    try:
        req = urllib.request.Request("https://dealflow-topaz-seven.vercel.app", headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as r:
            print(f"DealFlow Admin Deck Status: {r.status} OK")
            html = r.read().decode("utf-8", errors="ignore")
            title_m = re.search(r"<title>(.*?)</title>", html, re.I)
            title = title_m.group(1) if title_m else "N/A"
            print(f"Page Title: {title}")
            print(f"HTML Size: {len(html)} bytes")
            print("DealFlow Admin Curation Deck is healthy and responding.")
    except Exception as e:
        print("DealFlow Admin Deck check error:", e)

def check_telegram():
    print("\n" + "="*60)
    print("4. CHECKING TELEGRAM CHANNEL (https://t.me/s/dealsforindiachannel)")
    print("="*60)
    try:
        req = urllib.request.Request("https://t.me/s/dealsforindiachannel", headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as r:
            print(f"Telegram Web View Status: {r.status} OK")
            html = r.read().decode("utf-8", errors="ignore")
            matches = re.findall(r'<div class="tgme_widget_message_text[^"]*"[^>]*>(.*?)</div>', html, re.DOTALL)
            print(f"Total visible broadcast messages found: {len(matches)}")
            print("\nLatest 4 messages in @dealsforindiachannel:")
            for i, m in enumerate(matches[-4:], 1):
                clean_text = re.sub(r'<[^<]+?>', '', m).strip()
                # Single line preview
                lines = [line.strip() for line in clean_text.splitlines() if line.strip()]
                preview = " | ".join(lines[:2])
                print(f"  {i}. {preview[:100]}")
    except Exception as e:
        print("Telegram check error:", e)

if __name__ == "__main__":
    check_backend()
    check_indiadealhunts()
    check_dealflow()
    check_telegram()
