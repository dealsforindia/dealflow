import urllib.request
import json
import sys

req = urllib.request.Request(
    'https://api.rudranil.me/api/v1/deals/pending?limit=500',
    headers={'User-Agent': 'Mozilla/5.0'}
)
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode('utf-8'))
    deals = data.get('deals', [])
    for d in deals:
        t = (d.get('title') or '') + ' ' + (d.get('prod_name') or '') + ' ' + (d.get('aff_text') or '')
        if '1BDF' in t or 'Casio' in t or 'LA680' in t or 'B00N17ACWU' in t:
            print("--- MATCH ---")
            print("ID:", d.get('_id'))
            print("Title:", repr(d.get('title')))
            print("Prod Name:", repr(d.get('prod_name')))
            print("Coupon:", repr(d.get('coupon')))
            print("Effective Price:", repr(d.get('effective_price')))
            print("Price:", repr(d.get('price')))
            print("Aff Text:", repr(d.get('aff_text')).encode('ascii', 'backslashreplace').decode('ascii'))
            print("AI Text:", repr(d.get('ai_formatted_text')).encode('ascii', 'backslashreplace').decode('ascii'))
            print("Fingerprint:", repr(d.get('fingerprint_hash') or d.get('fingerprint')))
