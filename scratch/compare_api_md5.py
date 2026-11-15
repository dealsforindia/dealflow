import subprocess
import hashlib

with open("dealbot_backend/dealbot/api.py", "rb") as f:
    local_hash = hashlib.md5(f.read()).hexdigest()

remote_code = r'''
import hashlib
with open("/home/rudranil777/dealbot/api.py", "rb") as f:
    print(hashlib.md5(f.read()).hexdigest())
'''

res = subprocess.run(
    ['ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0', 'python3 -'],
    input=remote_code,
    capture_output=True,
    text=True,
    encoding="utf-8",
    errors="replace"
)
print(f"Local md5: {local_hash}")
print(f"VM md5:    {res.stdout.strip()}")
