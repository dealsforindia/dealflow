import subprocess, sys
sys.stdout.reconfigure(encoding='utf-8')

script = r"""
with open('/home/rudranil777/dealbot/api.py', 'r', encoding='utf-8') as f:
    content = f.read()

old_img_line = '            "image": img,'
new_img_line = '''            "image": (img.replace("www_desidime_com", "curated_drop").replace("desidime", "curated_drop") if img else None),'''

if old_img_line in content:
    content = content.replace(old_img_line, new_img_line, 1)
    with open('/home/rudranil777/dealbot/api.py', 'w', encoding='utf-8') as f:
        f.write(content)
    print("✓ Added defensive image URL sanitization to api.py")
else:
    print("Warning: old_img_line not found")
"""

p = subprocess.run(["ssh", "rudranil777@74.225.250.0", "python3 -"], input=script.encode(), capture_output=True)
print(p.stdout.decode('utf-8', errors='replace'))
if p.stderr:
    print("ERR:", p.stderr.decode('utf-8', errors='replace'))
