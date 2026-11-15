import subprocess

remote_code = r'''
with open("/home/rudranil777/dealbot/api.py", "r", encoding="utf-8", errors="ignore") as f:
    vm_api = f.read()

import re
matches = [m.start() for m in re.finditer(r"def get_authentic_product_history", vm_api)]
print("Matches in VM api.py:", len(matches))
if matches:
    idx = matches[0]
    print(vm_api[idx:idx+1500])
'''

res = subprocess.run(
    ['ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0', 'python3 -'],
    input=remote_code,
    capture_output=True,
    text=True
)
print("STDOUT:")
print(res.stdout)
