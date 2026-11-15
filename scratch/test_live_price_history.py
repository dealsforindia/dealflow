import urllib.request
import json

req = urllib.request.Request('https://api.rudranil.me/api/v1/deals/public?limit=15', headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode())

deals = data.get('deals', [])
print(f"Retrieved {len(deals)} public deals.\n")

for d in deals[:10]:
    fp = d.get('fingerprint_hash') or d.get('id')
    store = d.get('store', 'Unknown')
    title = (d.get('title') or '')[:35]
    
    h_url = f"https://api.rudranil.me/api/v1/deals/{fp}/price-history"
    try:
        h_req = urllib.request.Request(h_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(h_req) as h_resp:
            h_data = json.loads(h_resp.read().decode())
            history = h_data.get('history', [])
            pts = len(history)
            status = '✅ OK' if pts >= 2 else f'⚠️ {pts} pts'
            low = h_data.get('lowest_price')
            curr = h_data.get('current_price')
            avg = h_data.get('average_price')
            print(f"[{store:10}] {title:35} -> {status} ({pts} pts | low: ₹{low} | curr: ₹{curr} | avg: ₹{avg})")
    except Exception as e:
        print(f"[{store:10}] {title:35} -> ❌ Error: {e}")
