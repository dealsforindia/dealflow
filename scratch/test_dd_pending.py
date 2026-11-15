import requests, sys
sys.stdout.reconfigure(encoding='utf-8')

res = requests.get('https://api.rudranil.me/api/v1/deals/desidime?status=pending_approval&limit=10')
data = res.json()
deals = data.get('deals', [])
print(f"DesiDime pending deals: {len(deals)}")
for d in deals:
    fp = str(d.get('fp_hash', ''))[:8]
    ch = d.get('channel')
    temp = d.get('desidimeTemperature') or d.get('desidime_temperature')
    title = str(d.get('prod_name', ''))[:55]
    print(f"FP:{fp} | Ch:{ch} | Temp:{temp} | {title}")
