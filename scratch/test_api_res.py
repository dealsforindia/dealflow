import requests, sys
sys.stdout.reconfigure(encoding='utf-8')

res = requests.get('https://api.rudranil.me/api/v1/deals/public?limit=15')
data = res.json()
deals = data.get('deals', [])
print(f"Total public deals returned: {len(deals)}")
for d in deals:
    did = str(d.get('id', ''))[:8]
    ch = d.get('channel')
    raw = d.get('channelRaw')
    temp = d.get('desidimeTemperature')
    store = d.get('store')
    multi = d.get('is_multi_deal')
    title = str(d.get('title', ''))[:45]
    print(f"ID:{did} | Ch:{ch} | Raw:{raw} | Temp:{temp} | Store:{store} | Multi:{multi} | {title}")
