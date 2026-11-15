import urllib.request, json, sys
sys.stdout.reconfigure(encoding='utf-8')

req = urllib.request.Request("https://www.indiadealhunts.me/api/v1/deals/public", headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req, timeout=10) as resp:
    data = json.loads(resp.read().decode())
    deals = data.get("deals", [])
    print(f"Total deals returned on public storefront: {len(deals)}")
    for i, d in enumerate(deals):
        print(f"{i+1}. {d.get('title')[:45]} | Price: Rs.{d.get('price')} | Store: {d.get('store')} | Multi: {d.get('is_multi_deal')}")
        if d.get("is_multi_deal"):
            print(f"   --> {d.get('multi_deal_count')} Items Inside:")
            for it in d.get("multi_items", []):
                print(f"       * {it.get('label')} (discount: {it.get('discount')}%) -> {it.get('url')}")

