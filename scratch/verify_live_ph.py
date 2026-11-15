import urllib.request
import json

req = urllib.request.Request(
    "https://api.rudranil.me/api/v1/deals/public?limit=10",
    headers={"User-Agent": "Mozilla/5.0"}
)
with urllib.request.urlopen(req, timeout=10) as resp:
    data = json.loads(resp.read().decode())
    deals = data.get("deals", [])

print(f"Fetched {len(deals)} public deals.\n")
successful = 0

for d in deals[:10]:
    fp_hash = d.get("fp_hash") or d.get("id")
    title = (d.get("prod_name") or d.get("title") or "")[:40]
    store = d.get("platform") or d.get("store")
    
    ph_url = f"https://api.rudranil.me/api/v1/deals/{fp_hash}/price-history"
    try:
        ph_req = urllib.request.Request(ph_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(ph_req, timeout=8) as ph_resp:
            ph_data = json.loads(ph_resp.read().decode())
            hist = ph_data.get("history") or (ph_data.get("price_intelligence") or {}).get("history", [])
            ck = ph_data.get("canonical_key")
            low = (ph_data.get("price_intelligence") or {}).get("lowest")
            high = (ph_data.get("price_intelligence") or {}).get("highest")
            print(f"[{store}] {title} (ID: {fp_hash})")
            print(f"  Key: {ck} | Points: {len(hist)} | Low: Rs.{low} | High: Rs.{high}")
            if hist:
                successful += 1
                print(f"  First: {hist[0]} | Last: {hist[-1]}")
    except Exception as ex:
        print(f"[{store}] {title} -> ERROR: {ex}")

print(f"\nSummary: {successful}/{len(deals[:10])} deals returned authentic price history points!")
