import urllib.request
import json
import re
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

API_BASE = "https://api.rudranil.me"

def scrub_text(text, title="", price=None, store="Store"):
    if not text:
        p_str = f" @ ₹{price:,.0f}" if price else ""
        return f"{title}{p_str}".strip()
    
    t = text
    t = re.sub(r'^[🔴🟡✅🔥☠️]\s*\*\d+/\d+\*.*?\n', '', t, flags=re.M)
    t = re.sub(r'^\*\d+/\d+\*\s*\*[A-Z]+\*.*?\n', '', t, flags=re.M)
    t = re.sub(r'^🏪[^\n]*\n', '', t, flags=re.M)
    t = re.sub(r'^💵[^\n]*\n', '', t, flags=re.M)
    t = re.sub(r'^📢\s*#[a-zA-Z0-9_]+[^\n]*\n', '', t, flags=re.M)
    t = re.sub(r'\n*💸\s*_\(Profit links added\)_', '', t)
    t = re.sub(r'\n*🤖\s*.*?(?=\n🔗|\n#|\Z)', '', t, flags=re.DOTALL)
    t = re.sub(r'\n*🔗\s*\[Source\]\([^\)]+\)', '', t)
    t = re.sub(r'\n*#[a-zA-Z0-9_]+(?:\s+#[a-zA-Z0-9_]+)*\s*$', '', t)
    t = t.strip()

    # If stripped text lost title or is empty
    if not t or (title and title[:8].lower() not in t.lower() and not re.search(r'https?://', t)):
        urls = re.findall(r'https?://\S+', text)
        link = urls[0] if urls else ""
        p_str = f" @ ₹{price:,.0f}" if price else ""
        t = f"{title}{p_str}\n\n{link}\n\nAvailable on: {store}".strip()
    return t

def run():
    print("1. Fetching pending deals from API...")
    req = urllib.request.Request(f"{API_BASE}/api/v1/deals/pending?limit=500")
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
    
    deals = data.get("deals", [])
    print(f"Loaded {len(deals)} pending deals.")

    sanitized_count = 0

    for d in deals:
        fp = d.get("fp_hash")
        if not fp:
            continue

        aff = d.get("aff_text") or ""
        ai_txt = d.get("ai_formatted_text") or ""
        msg = d.get("message") or ""
        title = d.get("prod_name") or d.get("title") or ""
        prices = d.get("prices") or {}
        price = prices.get("sale")
        platforms = d.get("platforms") or ["Store"]
        store = platforms[0] if platforms else "Store"

        needs_edit = False
        payload = {}

        # 1. Check for legacy format junk
        has_junk = any(j in (str(aff) + str(ai_txt) + str(msg)) for j in ['Profit links added', '[Source](', '🤖', '/10*', 'AVERAGE*', 'GOOD DEAL*'])
        if has_junk:
            clean_aff = scrub_text(aff, title, price, store)
            clean_ai = scrub_text(ai_txt, title, price, store)
            clean_msg = scrub_text(msg, title, price, store)
            payload["aff_text"] = clean_aff
            payload["ai_formatted_text"] = clean_ai
            payload["message"] = clean_msg
            needs_edit = True

        # 2. Fix Borosil water bottle
        if fp == "4d1af9f67b4baf3490200f38b0db3f95" or "borosil" in title.lower():
            clean_amz_link = "https://www.amazon.in/dp/B0FB3SZJN9?tag=dealshare0b7-21"
            clean_post = f"Larah by Borosil 700 ml Stainless Steel Water Bottle @ ₹271 (Final Price)\n\n{clean_amz_link}\n\nAvailable on: Amazon India"
            payload["aff_text"] = clean_post
            payload["ai_formatted_text"] = clean_post
            payload["message"] = clean_post
            payload["asin"] = "B0FB3SZJN9"
            payload["platforms"] = ["Amazon India"]
            payload["affiliate_applied"] = True
            needs_edit = True

        if needs_edit:
            try:
                put_data = json.dumps(payload).encode('utf-8')
                put_req = urllib.request.Request(
                    f"{API_BASE}/api/v1/deals/{fp}/edit",
                    data=put_data,
                    headers={"Content-Type": "application/json"},
                    method="PUT"
                )
                with urllib.request.urlopen(put_req) as edit_resp:
                    if edit_resp.status == 200:
                        sanitized_count += 1
                        print(f"  [Sanitized] {fp} | {title[:35]}")
            except Exception as e:
                print(f"  [Error] {fp}: {e}")

    print(f"\nSuccessfully sanitized {sanitized_count} deals via API!")

    # 3. Call purge non deals
    try:
        print("\n2. Calling automated deal intelligence purge...")
        purge_req = urllib.request.Request(f"{API_BASE}/api/v1/deals/purge-non-deals", data=b"", method="POST")
        with urllib.request.urlopen(purge_req) as p_resp:
            p_res = json.loads(p_resp.read().decode('utf-8'))
            print(f"Purge result: {p_res}")
    except Exception as e:
        print(f"Purge error: {e}")

if __name__ == "__main__":
    run()
