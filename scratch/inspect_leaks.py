import requests, json, sys
sys.stdout.reconfigure(encoding='utf-8')

res = requests.get('https://api.rudranil.me/api/v1/deals/public?limit=30')
data = res.json()
deals = data.get('deals', [])

print(f"Total deals: {len(deals)}")
for idx, d in enumerate(deals):
    raw = json.dumps(d).lower()
    for term in ['desidime', 'ddime', 'temperature']:
        if term in raw:
            print(f"Deal #{idx} '{d.get('title')}' matched '{term}':")
            # Find which key matched
            for k, v in d.items():
                if term in str(k).lower() or term in str(v).lower():
                    print(f"   Key '{k}': {v}")
