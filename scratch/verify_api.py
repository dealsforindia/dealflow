import urllib.request
import json

url = "http://127.0.0.1:8000/api/v1/deals/public?limit=100"
req = urllib.request.Request(url)
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode())
    multis = [d for d in data.get("deals", []) if d.get("is_multi_deal")]
    print(f"Total genuine multi deals in top 100: {len(multis)}")
    for m in multis[:3]:
        print(" - Title:", m.get("title")[:60])
        print("   Multi items count:", len(m.get("multi_items", [])))
        for it in m.get("multi_items", [])[:3]:
            print("     *", repr(it.get("label")), "=>", it.get("url")[:70])
