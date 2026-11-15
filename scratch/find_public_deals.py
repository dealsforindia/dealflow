import subprocess, sys
sys.stdout.reconfigure(encoding='utf-8')

script = r"""
with open('/home/rudranil777/dealbot/api.py', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = [m.start() for m in re.finditer(r'def get_public_deals', text)]
for idx in matches:
    line_no = text[:idx].count('\n') + 1
    print(f"Found def get_public_deals at line {line_no}")
"""

p = subprocess.run(["ssh", "rudranil777@74.225.250.0", "python3 -"], input=script.encode(), capture_output=True)
print(p.stdout.decode('utf-8', errors='replace'))
if p.stderr:
    print("ERR:", p.stderr.decode('utf-8', errors='replace'))
