import urllib.request
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')
req = urllib.request.Request('https://api.rudranil.me/api/v1/deals/pending?page_size=120', headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode('utf-8'))
    deals = data.get('deals', [])
    junk_count = 0
    for d in deals:
        text = f"{d.get('aff_text') or ''} {d.get('ai_formatted_text') or ''} {d.get('message') or ''}"
        has_junk = False
        for junk_marker in ['Profit links added', '[Source](', '🤖', '/10*', 'AVERAGE*', 'GOOD DEAL*', 'GREAT DEAL*']:
            if junk_marker in text:
                has_junk = True
                break
        if has_junk:
            junk_count += 1
            print(f"Junk deal: {d.get('fp_hash')} | {str(d.get('prod_name'))[:40]} | channel: {d.get('source_channel')}")
    print(f"\nTotal pending deals with junk: {junk_count} / {len(deals)}")
