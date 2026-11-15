import subprocess, sys
sys.stdout.reconfigure(encoding='utf-8')

script = r"""
with open('/home/rudranil777/dealbot/api.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Target block in get_public_deals
old_block = '''            "coupon": d.get("coupon"),
            "coupon_discount": d.get("coupon_discount"),
            "effective_price": d.get("effective_price"),
            "channel": d.get("channel") or ("DesiDime - Handpicked Deals" if (d.get("source") == "desidime" or d.get("source_channel") == "desidime") else None),
            "channelRaw": d.get("channelRaw") or ("@DesidimeHot" if (d.get("source") == "desidime" or d.get("source_channel") == "desidime") else None),
            "desidimeTemperature": d.get("desidimeTemperature") or d.get("desidime_temperature"),
            "desidime_temperature": d.get("desidime_temperature") or d.get("desidimeTemperature"),
            "is_community_verified": d.get("is_community_verified", False),
            "deal_score": d.get("deal_score") or d.get("score"),
            "deal_badges": d.get("deal_badges") or [],
            "cluster_count": d.get("cluster_count", 1),
            "cluster_channels": [c.get("name") if isinstance(c, dict) else str(c) for c in (d.get("cluster_channels") or [])],'''

new_block = '''            "coupon": d.get("coupon"),
            "coupon_discount": d.get("coupon_discount"),
            "effective_price": d.get("effective_price"),
            # Zero external aggregator leaks: never expose DesiDime channels, temperatures, or handles to public
            "channel": None if (str(d.get("channel") or "").lower().find("desidime") != -1 or d.get("channelRaw") == "@DesidimeHot" or d.get("source") == "desidime" or d.get("source_channel") == "desidime") else d.get("channel"),
            "channelRaw": None if (str(d.get("channelRaw") or "").lower().find("desidime") != -1 or d.get("channelRaw") == "@DesidimeHot" or d.get("source") == "desidime" or d.get("source_channel") == "desidime") else d.get("channelRaw"),
            "is_community_verified": bool(d.get("is_community_verified")),
            "deal_score": d.get("deal_score") or d.get("score"),
            "deal_badges": [b for b in (d.get("deal_badges") or []) if "desidime" not in str(b).lower()],
            "cluster_count": d.get("cluster_count", 1),
            "cluster_channels": [(c.get("name") if isinstance(c, dict) else str(c)) for c in (d.get("cluster_channels") or []) if "desidime" not in (c.get("name") if isinstance(c, dict) else str(c)).lower()],'''

if old_block in content:
    content = content.replace(old_block, new_block, 1)
    print("✓ Successfully patched get_public_deals in api.py to completely purge DesiDime leaks!")
else:
    print("Warning: old_block not found in api.py!")

with open('/home/rudranil777/dealbot/api.py', 'w', encoding='utf-8') as f:
    f.write(content)
"""

p = subprocess.run(["ssh", "rudranil777@74.225.250.0", "python3 -"], input=script.encode(), capture_output=True)
print(p.stdout.decode('utf-8', errors='replace'))
if p.stderr:
    print("ERR:", p.stderr.decode('utf-8', errors='replace'))
