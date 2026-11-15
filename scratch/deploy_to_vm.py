import subprocess, sys
from pathlib import Path

files_to_deploy = [
    ("dealbot_backend/dealbot/api.py", "/home/rudranil777/dealbot/api.py"),
    ("dealbot_backend/dealbot/oos_expiry_worker.py", "/home/rudranil777/dealbot/oos_expiry_worker.py"),
    ("dealbot_backend/dealbot/store_scraper.py", "/home/rudranil777/dealbot/store_scraper.py"),
]

for local_path, remote_path in files_to_deploy:
    content = Path(local_path).read_bytes()
    cmd = ["ssh", "rudranil777@74.225.250.0", f"cat > {remote_path}"]
    p = subprocess.run(cmd, input=content, capture_output=True)
    if p.returncode == 0:
        print(f"Deployed: {local_path} -> {remote_path} ({len(content)} bytes)")
    else:
        print(f"FAILED {local_path}: {p.stderr.decode()}")
        sys.exit(1)

# Restart PM2 api (7) and price-scanner (18)
cmd_restart = ["ssh", "rudranil777@74.225.250.0", "pm2 restart api price-scanner && pm2 status"]
p2 = subprocess.run(cmd_restart, capture_output=True)
sys.stdout.buffer.write(p2.stdout)
if p2.stderr:
    sys.stderr.buffer.write(p2.stderr)
