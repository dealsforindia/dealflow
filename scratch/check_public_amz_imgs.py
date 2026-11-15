import urllib.request, json

req = urllib.request.Request("https://api.rudranil.me/api/v1/deals/public?limit=30")
with urllib.request.urlopen(req, timeout=10) as resp:
    data = json.loads(resp.read().decode())

deals = data.get("deals", [])
print(f"Total public deals returned: {len(deals)}")
for d in deals:
    store = d.get("store")
    img = d.get("image") or ""
    title = d.get("title", "")[:40]
    if "amazon" in store.lower() or "amazon" in img.lower():
        is_cdn = "media-amazon.com" in img or "ssl-images-amazon" in img
        print(f"[{'OK' if is_cdn else 'LOGO/FAIL'}] {store} | {title} | img: {img[:60]}")
