import requests

r = requests.get('http://127.0.0.1:8000/api/v1/deals/public?limit=30').json()
deals = r.get('deals', [])
print(f"Checking {len(deals)} deals for price history across stores...\n")

stores_checked = {}
success_count = 0

for d in deals:
    store = d.get('store', 'Unknown')
    fp = d.get('fingerprint_hash') or d.get('id')
    title = (d.get('title') or '')[:35]
    
    h = requests.get(f'http://127.0.0.1:8000/api/v1/deals/{fp}/price-history').json()
    hist = h.get('history', [])
    pts = len(hist)
    status = 'OK' if pts >= 2 else f'{pts} pts'
    if pts >= 2:
        success_count += 1
    low = h.get('lowest_price')
    curr = h.get('current_price')
    avg = h.get('average_price')
    print(f"[{store:10}] {title:35} -> {status} ({pts} pts | low: {low} | curr: {curr} | avg: {avg})")
    stores_checked[store] = stores_checked.get(store, 0) + 1

print(f"\nTotal deals checked: {len(deals)}")
print(f"Valid multi-point price histories: {success_count}/{len(deals)} ({round(success_count/len(deals)*100, 1)}%)")
print("Store distribution:", stores_checked)
