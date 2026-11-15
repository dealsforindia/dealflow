import subprocess, sys
sys.stdout.reconfigure(encoding='utf-8')

script = r"""
with open('/home/rudranil777/dealbot/api.py', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('def redirect_outbound_deal')
if idx != -1:
    lines = text[idx:idx+8500].splitlines()
    for i, l in enumerate(lines[140:190], 141):
        print(f"{i}: {l}")
"""

p = subprocess.run(["ssh", "rudranil777@74.225.250.0", "python3 -"], input=script.encode(), capture_output=True)
print(p.stdout.decode('utf-8', errors='replace'))
if p.stderr:
    print("ERR:", p.stderr.decode('utf-8', errors='replace'))
