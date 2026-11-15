import sys
sys.stdout.reconfigure(encoding='utf-8')

# 1. Update worker.py
path_worker = r'e:\Rudranildocs0066543\html-yt\dealbot_backend\dealbot\worker.py'
with open(path_worker, 'rb') as f:
    raw = f.read()
raw = raw.replace(b'\r\r\n', b'\r\n')
text = raw.decode('utf-8')

changes_worker = []

# A. Fix line 1633: title = raw.get("title", channel) -> title = raw.get("title") or ""
old_title_init = '    title   = raw.get("title",   channel)'
new_title_init = '    title   = raw.get("title") or ""'
if old_title_init in text:
    text = text.replace(old_title_init, new_title_init, 1)
    changes_worker.append("worker.py: line 1633 - stopped defaulting title to channel name")
else:
    changes_worker.append("worker.py: line 1633 pattern not found")

# B. Add channel anti-leak to is_invalid_product_name
old_inv_check = '    if any(b in clean_lower for b in BOT_BLOCKED_TERMS):\r\n        return True'
new_inv_check = '''    if any(b in clean_lower for b in BOT_BLOCKED_TERMS):
        return True
    # Anti-Leak Guard: Never allow source Telegram channel names or competitor handles as product titles!
    CHANNEL_LEAK_NAMES = [
        'crazy deals', 'dealdrops', 'dealspoint', 'dealztrendz', 'desidime',
        'earnkaro', 'extrape', 'fet (deals', 'fetdeals', 'fitness finds',
        'free earning tech', 'freeearningtechog', 'freekart', 'genie all',
        'genie loot', 'genie tricks', 'glam haul', 'glamhauldiaries',
        'loot deals app', 'loot_dealsx', 'lootdealsapp', 'offerzone',
        'oz loot', 'private deals', 'realearnkaro', 'shoppers quest',
        'shoppersquest', 'shopping genie', 'technical sheikh', 'technicalsheikh',
        'trending loot', 'bblbblp'
    ]
    if any(ch in clean_lower for ch in CHANNEL_LEAK_NAMES):
        return True'''
if old_inv_check in text:
    text = text.replace(old_inv_check, new_inv_check, 1)
    changes_worker.append("worker.py: added CHANNEL_LEAK_NAMES to is_invalid_product_name")
else:
    changes_worker.append("worker.py: is_invalid_product_name pattern not found")

# C. Clean fallback title in pending_doc on lines ~1756 and ~2048
# Ensure title or "Special Offer" NEVER uses channel name
old_pdoc1 = '"title": title or "Retail Offer",'
new_pdoc1 = '"title": ("Verified Store Offer" if (not title or any(ch in (title or "").lower() for ch in [\'fet\', \'offerzone\', \'crazy\', \'genie\', \'trendz\', \'earnkaro\', \'extrape\', \'sheikh\'])) else title),'
if old_pdoc1 in text:
    text = text.replace(old_pdoc1, new_pdoc1, 1)
    changes_worker.append("worker.py: sanitized pending_doc title at line ~1756")

old_pdoc2 = '"title": title or "Special Offer",'
new_pdoc2 = '"title": ("Verified Store Offer" if (not title or any(ch in (title or "").lower() for ch in [\'fet\', \'offerzone\', \'crazy\', \'genie\', \'trendz\', \'earnkaro\', \'extrape\', \'sheikh\'])) else title),'
if old_pdoc2 in text:
    text = text.replace(old_pdoc2, new_pdoc2, 1)
    changes_worker.append("worker.py: sanitized pending_doc title at line ~2048")

old_prod2 = '"prod_name": title or "Special Offer",'
new_prod2 = '"prod_name": ("Verified Store Offer" if (not title or any(ch in (title or "").lower() for ch in [\'fet\', \'offerzone\', \'crazy\', \'genie\', \'trendz\', \'earnkaro\', \'extrape\', \'sheikh\'])) else title),'
if old_prod2 in text:
    text = text.replace(old_prod2, new_prod2, 1)
    changes_worker.append("worker.py: sanitized pending_doc prod_name at line ~2049")

with open(path_worker, 'wb') as f:
    f.write(text.encode('utf-8'))

for c in changes_worker:
    print(c)

