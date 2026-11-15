import subprocess, sys
from pathlib import Path

files_to_deploy = [
    ("dealbot_backend/dealbot/amazon_direct_harvester.py", "/home/rudranil777/dealbot/amazon_direct_harvester.py"),
    ("dealbot_backend/dealbot/desidime_bot.py", "/home/rudranil777/dealbot/desidime_bot.py"),
    ("dealbot_backend/dealbot/worker.py", "/home/rudranil777/dealbot/worker.py"),
    ("dealbot_backend/dealbot/api.py", "/home/rudranil777/dealbot/api.py"),
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

# Restart affected PM2 processes: api (7), desidime (10), worker (3)
cmd_restart = ["ssh", "rudranil777@74.225.250.0", "pm2 restart api desidime worker && pm2 status"]
p2 = subprocess.run(cmd_restart, capture_output=True, encoding="utf-8", errors="replace")
print("PM2 Status:\n", p2.stdout)
if p2.stderr:
    print("PM2 Stderr:\n", p2.stderr)
