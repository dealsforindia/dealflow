import subprocess
import base64
import time

with open("dealbot_backend/dealbot/api.py", "rb") as f:
    raw_data = f.read()

b64_str = base64.b64encode(raw_data).decode("ascii")
print(f"Encoded api.py to base64 ({len(b64_str)} chars). Transferring...")

# Send to remote script that decodes and writes to api.py
remote_cmd = f"python3 -c \"import base64; open('/home/rudranil777/dealbot/api.py', 'wb').write(base64.b64decode('{b64_str}'))\""

res = subprocess.run(
    ['ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0', 'python3 -'],
    input=f"import base64\nwith open('/home/rudranil777/dealbot/api.py', 'wb') as f:\n    f.write(base64.b64decode({repr(b64_str)}))\nprint('Wrote file successfully!')\n",
    capture_output=True,
    text=True,
    encoding="utf-8",
    errors="replace"
)

print("STDOUT:", res.stdout)
print("STDERR:", res.stderr)

if res.returncode == 0 and "successfully" in res.stdout:
    print("Restarting PM2 api...")
    restart = subprocess.run(
        ['ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0', 'pm2 restart api && pm2 logs api --lines 15 --nostream'],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace"
    )
    print("Restart STDOUT:", restart.stdout.encode('ascii', errors='replace').decode('ascii'))
    print("Restart STDERR:", restart.stderr.encode('ascii', errors='replace').decode('ascii'))
