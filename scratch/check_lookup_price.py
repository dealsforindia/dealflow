import subprocess

remote_code = r'''
with open("/home/rudranil777/dealbot/api.py", "r", encoding="utf-8", errors="ignore") as f:
    vm_api = f.read()

import re
m = re.search(r"async def _lookup_public_price", vm_api)
if m:
    idx = m.start()
    print(vm_api[idx:idx+2500])
else:
    print("_lookup_public_price not found")
'''

res = subprocess.run(
    ['ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0', 'python3 -'],
    input=remote_code,
    capture_output=True,
    text=True
)
print("STDOUT:")
print(res.stdout)
