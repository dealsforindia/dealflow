import subprocess
import base64
import time

with open("dealbot_backend/dealbot/worker.py", "rb") as f:
    raw_data = f.read()

b64_str = base64.b64encode(raw_data).decode("ascii")
print(f"Encoded worker.py to base64 ({len(b64_str)} chars). Transferring...")

time.sleep(1.5)

res = subprocess.run(
    ['ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0', 'python3 -'],
    input=f"import base64\nwith open('/home/rudranil777/dealbot/worker.py', 'wb') as f:\n    f.write(base64.b64decode({repr(b64_str)}))\nprint('Wrote worker.py successfully!')\n",
    capture_output=True,
    text=True,
    encoding="utf-8",
    errors="replace"
)

print("STDOUT:", res.stdout)
print("STDERR:", res.stderr)

if res.returncode == 0 and "successfully" in res.stdout:
    time.sleep(1.5)
    restart = subprocess.run(
        ['ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0', 'pm2 restart worker && pm2 logs worker --lines 10 --nostream'],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace"
    )
    print("Restart STDOUT:", restart.stdout.encode('ascii', errors='replace').decode('ascii'))
    print("Restart STDERR:", restart.stderr.encode('ascii', errors='replace').decode('ascii'))
