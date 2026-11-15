import subprocess

remote_code = r'''
with open("/home/rudranil777/dealbot/oos_expiry_worker.py", "r", encoding="utf-8", errors="ignore") as f:
    text = f.read()

import re
matches = [m.start() for m in re.finditer(r"price_history", text)]
for idx in matches:
    print("=== price_history match in oos_expiry_worker ===")
    print(text[max(0, idx-200):min(len(text), idx+600)])
'''

res = subprocess.run(
    ['ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0', 'python3 -'],
    input=remote_code,
    capture_output=True,
    text=True,
    encoding="utf-8",
    errors="replace"
)
print("STDOUT:")
print(res.stdout.encode('ascii', errors='replace').decode('ascii'))
