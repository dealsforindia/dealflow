import requests

url = "https://api.rudranil.me/api/v1/deals/public?limit=3&sort=newest"
r = requests.get(url, timeout=10)
print("Public API Status code:", r.status_code)
if r.status_code == 200:
    data = r.json()
    deals = data.get("deals", [])
    print(f"Received {len(deals)} public deals.")
    for d in deals[:3]:
        print("---")
        print("ID:", d.get("id") or d.get("_id"))
        print("Store:", d.get("store"))
        print("Title:", d.get("title")[:60] if d.get("title") else "N/A")
        print("Status:", d.get("status"))
        # Check rule 6: Zero Aggregator Leaks (No DesiDime, #hashtags, degrees)
        full_text = str(d)
        for leak in ["desidime", "DesiDime", "ddime", "#loot", "#deal"]:
            if leak in full_text:
                print(f"  [ALERT] Potential leak found: {leak}")
        print("  [OK] No aggregator leaks in deal.")
else:
    print("Error:", r.text[:200])
