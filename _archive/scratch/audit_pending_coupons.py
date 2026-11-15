import urllib.request
import json
import sys
sys.path.insert(0, r'e:\Rudranildocs0066543\html-yt\dealflow_for_ai\backend')
from coupon_extractor import extract_coupon

req = urllib.request.Request('https://api.rudranil.me/api/v1/deals/pending?limit=500', headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode('utf-8'))
    deals = data.get('deals', [])
    print(f"Total deals: {len(deals)}")
    coupons = []
    for d in deals:
        c = d.get('coupon')
        if c:
            name = (d.get('prod_name') or d.get('title') or 'Unknown')
            valid = extract_coupon(c, prod_name=name)
            coupons.append((name, c, valid, d.get('price'), d.get('effective_price')))

    print(f"Deals with coupon: {len(coupons)}")
    for name, c, valid, price, eff in coupons:
        out = f"- {name} | Coupon: {c} | Validated: {valid} | Price: {price} -> Eff: {eff}\n"
        sys.stdout.buffer.write(out.encode('utf-8', errors='replace'))
