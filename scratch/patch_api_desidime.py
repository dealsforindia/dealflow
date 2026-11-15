import subprocess, sys
sys.stdout.reconfigure(encoding='utf-8')

script = r"""
with open('/home/rudranil777/dealbot/api.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update get_pending
old_pending_block = '''    for d in deals:
        if not d.get("img_url") and d.get("img_path"):'''

new_pending_block = '''    for d in deals:
        if not d.get("channel") and (d.get("source") == "desidime" or d.get("source_channel") == "desidime"):
            d["channel"] = "DesiDime - Handpicked Deals"
            d["channelRaw"] = "@DesidimeHot"
        if not d.get("desidimeTemperature") and d.get("desidime_temperature"):
            d["desidimeTemperature"] = d.get("desidime_temperature")
        if not d.get("img_url") and d.get("img_path"):'''

if old_pending_block in content:
    content = content.replace(old_pending_block, new_pending_block, 1)
    print("✓ Patched get_pending in api.py")
else:
    print("Warning: old_pending_block not found in api.py")

# 2. Update get_public_deals
old_public_block = '''            "coupon": d.get("coupon"),
            "coupon_discount": d.get("coupon_discount"),
            "effective_price": d.get("effective_price"),
            "desidime_temperature": d.get("desidime_temperature"),'''

new_public_block = '''            "coupon": d.get("coupon"),
            "coupon_discount": d.get("coupon_discount"),
            "effective_price": d.get("effective_price"),
            "channel": d.get("channel") or ("DesiDime - Handpicked Deals" if (d.get("source") == "desidime" or d.get("source_channel") == "desidime") else None),
            "channelRaw": d.get("channelRaw") or ("@DesidimeHot" if (d.get("source") == "desidime" or d.get("source_channel") == "desidime") else None),
            "desidimeTemperature": d.get("desidimeTemperature") or d.get("desidime_temperature"),
            "desidime_temperature": d.get("desidime_temperature") or d.get("desidimeTemperature"),'''

if old_public_block in content:
    content = content.replace(old_public_block, new_public_block, 1)
    print("✓ Patched get_public_deals in api.py")
else:
    print("Warning: old_public_block not found in api.py")

with open('/home/rudranil777/dealbot/api.py', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated api.py successfully!")
"""

p = subprocess.run(["ssh", "rudranil777@74.225.250.0", "python3 -"], input=script.encode(), capture_output=True)
print(p.stdout.decode('utf-8', errors='replace'))
if p.stderr:
    print("ERR:", p.stderr.decode('utf-8', errors='replace'))
