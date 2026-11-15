import subprocess

remote_code = r'''
with open("/home/rudranil777/dealbot/api.py", "r", encoding="utf-8", errors="ignore") as f:
    vm_api = f.read()

import re
matches = [m.start() for m in re.finditer(r"/price-history", vm_api)]
for idx in matches:
    print("=== /price-history match ===")
    print(vm_api[max(0, idx-200):min(len(vm_api), idx+1200)])
    print("============================")

matches_analyze = [m.start() for m in re.finditer(r"analyze-url", vm_api)]
for idx in matches_analyze:
    print("=== analyze-url match ===")
    print(vm_api[max(0, idx-100):min(len(vm_api), idx+800)])
    print("============================")
'''

res = subprocess.run(
    ['ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0', 'python3 -'],
    input=remote_code,
    capture_output=True,
    text=True
)
print("STDOUT:")
print(res.stdout)
