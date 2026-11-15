import subprocess

with open("dealbot_backend/dealbot/api.py", "rb") as f:
    content = f.read()

print(f"Uploading {len(content)} bytes to /home/rudranil777/dealbot/api.py...")

# Pipe content to remote file
res = subprocess.run(
    ['ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0', 'cat > /home/rudranil777/dealbot/api.py'],
    input=content,
    capture_output=True
)

if res.returncode != 0:
    print("Upload error:", res.stderr.decode('utf-8', errors='replace'))
else:
    print("Upload successful!")
    # Restart PM2 api
    restart_res = subprocess.run(
        ['ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0', 'pm2 restart api && pm2 logs api --lines 15 --nostream'],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace"
    )
    print("PM2 restart output:")
    print(restart_res.stdout.encode('ascii', errors='replace').decode('ascii'))
