import subprocess, sys
sys.stdout.reconfigure(encoding='utf-8')

script = r"""
with open('/home/rudranil777/dealbot/desidime_bot.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update scrape list to include /deals
old_urls = '''    for page_url in [
        "https://www.desidime.com/new",
        "https://www.desidime.com/new?page=2",
        "https://www.desidime.com/new?page=3",
    ]:'''

new_urls = '''    for page_url in [
        "https://www.desidime.com/deals",
        "https://www.desidime.com/new",
        "https://www.desidime.com/new?page=2",
    ]:'''

if old_urls in content:
    content = content.replace(old_urls, new_urls, 1)
    print("✓ Replaced scrape URLs")
else:
    print("Warning: old_urls not found")

# 2. Add channel and channelRaw to comment deal doc
old_comment_doc = '''            "status": "pending_approval",
            "source": "desidime_comment",
            "source_channel": "desidime",'''

new_comment_doc = '''            "status": "pending_approval",
            "channel": "DesiDime - Handpicked Deals",
            "channelRaw": "@DesidimeHot",
            "source": "desidime_comment",
            "source_channel": "desidime",'''

if old_comment_doc in content:
    content = content.replace(old_comment_doc, new_comment_doc, 1)
    print("✓ Added channel to comment deal doc")
else:
    print("Warning: old_comment_doc not found")

# 3. Add channel, channelRaw, and desidimeTemperature to main deal doc
old_main_doc = '''            "status": status_val,
            "source": "desidime",
            "source_channel": "desidime",
            "affiliate_applied": bool(aff_link and aff_link != d.get("link")),'''

new_main_doc = '''            "status": status_val,
            "channel": "DesiDime - Handpicked Deals",
            "channelRaw": "@DesidimeHot",
            "source": "desidime",
            "source_channel": "desidime",
            "desidimeTemperature": d.get("desidime_temperature", 0),
            "affiliate_applied": bool(aff_link and aff_link != d.get("link")),'''

if old_main_doc in content:
    content = content.replace(old_main_doc, new_main_doc, 1)
    print("✓ Added channel, channelRaw, and desidimeTemperature to main deal doc")
else:
    print("Warning: old_main_doc not found")

with open('/home/rudranil777/dealbot/desidime_bot.py', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated desidime_bot.py successfully!")
"""

p = subprocess.run(["ssh", "rudranil777@74.225.250.0", "python3 -"], input=script.encode(), capture_output=True)
print(p.stdout.decode('utf-8', errors='replace'))
if p.stderr:
    print("ERR:", p.stderr.decode('utf-8', errors='replace'))
