import requests
import json
import os
import time
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

ADMIN_TOKEN = os.environ.get("ADMIN_API_TOKEN", "").strip()
if not ADMIN_TOKEN:
    raise SystemExit("ADMIN_API_TOKEN is not set in the environment. Refusing to run with a hardcoded credential.")
BASE_URL = os.environ.get("DEALFLOW_API_BASE", "https://api.rudranil.me/api/v1")

headers = {
    "X-Admin-Token": ADMIN_TOKEN,
    "Content-Type": "application/json"
}

def fetch_pending():
    url = f"{BASE_URL}/deals/pending?limit=100"
    print(f"Fetching pending deals from {url}...")
    resp = requests.get(url, headers=headers, timeout=20)
    print(f"Status: {resp.status_code}")
    if resp.status_code != 200:
        print("Failed to fetch pending deals:", resp.text[:200])
        return []
    data = resp.json()
    deals = data.get("deals", []) if isinstance(data, dict) else data
    print(f"Found {len(deals)} pending deals.")
    return deals

def filter_quality_deals(deals, target_count=7):
    quality = []
    seen_titles = set()
    for d in deals:
        name = d.get("prod_name") or d.get("title") or ""
        price = d.get("price") or (d.get("prices") or {}).get("sale")
        mrp = d.get("mrp") or (d.get("prices") or {}).get("mrp")
        img = d.get("img_url") or d.get("store_img_url")
        aff = d.get("aff_link") or d.get("url") or d.get("aff_text")
        fp = d.get("fp_hash") or d.get("fp")

        if not name or len(name) < 10 or name.lower() in ["deal", "apply coupon", "loot", "unknown"]:
            continue
        if not price or price <= 0:
            continue
        if not img or not img.startswith("http"):
            continue
        if not aff or not aff.startswith("http"):
            continue
        if not fp:
            continue
        if name in seen_titles:
            continue
        seen_titles.add(name)

        quality.append(d)
        if len(quality) == target_count:
            break
    return quality

def approve_deal(fp_hash, deal):
    url = f"{BASE_URL}/deals/{fp_hash}/approve"
    name = deal.get("prod_name") or deal.get("title")
    price = deal.get("price")
    print(f"\nApproving: [{deal.get('store', 'Store')}] {name[:60]} (₹{price})")
    
    payload = {
        "title": name,
        "price": price,
        "mrp": deal.get("mrp"),
        "img_url": deal.get("img_url"),
        "destinations": ["@dealsforindiachannel"]
    }
    
    resp = requests.put(url, headers=headers, json=payload, timeout=20)
    print(f"Status: {resp.status_code} | Response: {resp.text}")
    return resp.status_code == 200

if __name__ == "__main__":
    deals = fetch_pending()
    selected = filter_quality_deals(deals, target_count=7)
    print(f"\nSelected {len(selected)} quality deals to post:")
    for i, d in enumerate(selected, 1):
        print(f"{i}. [{d.get('store', 'Store')}] {d.get('prod_name')[:60]} | ₹{d.get('price')} | FP: {d.get('fp_hash')}")
        
    posted = 0
    for d in selected:
        fp = d.get("fp_hash") or d.get("fp")
        if approve_deal(fp, d):
            posted += 1
            time.sleep(1.5)
            
    print(f"\nSuccessfully posted {posted} / {len(selected)} deals!")
