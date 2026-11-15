import subprocess

remote_code = r'''
with open("/home/rudranil777/dealbot/api.py", "r", encoding="utf-8", errors="ignore") as f:
    vm_api = f.read()

import re
m = re.search(r"def get_authentic_product_history", vm_api)
if m:
    idx = m.start()
    print(vm_api[idx:idx+2500])
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
