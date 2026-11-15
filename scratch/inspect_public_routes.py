import subprocess, sys
sys.stdout.reconfigure(encoding='utf-8')

script = r"""
with open('/home/rudranil777/dealbot/api.py', 'r', encoding='utf-8') as f:
    text = f.read()

import re
for route in ['ticker', 'wall-of-happiness', 'stories']:
    idx = text.find(f'/api/v1/deals/{route}')
    if idx != -1:
        snippet = text[idx:idx+1200]
        print(f"--- Route /api/v1/deals/{route} ---")
        print(snippet[:600])
        print("\n")
"""

p = subprocess.run(["ssh", "rudranil777@74.225.250.0", "python3 -"], input=script.encode(), capture_output=True)
print(p.stdout.decode('utf-8', errors='replace'))
if p.stderr:
    print("ERR:", p.stderr.decode('utf-8', errors='replace'))
