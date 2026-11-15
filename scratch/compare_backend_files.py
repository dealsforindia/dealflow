import hashlib
import os
import subprocess
from pathlib import Path

LOCAL_DIR = Path(r"e:\Rudranildocs0066543\html-yt\dealbot_backend\dealbot")
REMOTE_HOST = "rudranil777@74.225.250.0"

# List local python files
local_files = [f.name for f in LOCAL_DIR.glob("*.py")]

# Get remote md5sums
cmd = [
    "ssh", "-i", "C:/Users/Neel/.ssh/id_ed25519", "-o", "IdentitiesOnly=yes", "-o", "BatchMode=yes",
    REMOTE_HOST,
    "cd /home/rudranil777/dealbot && md5sum *.py"
]

res = subprocess.run(cmd, capture_output=True, text=True)
remote_md5s = {}
for line in res.stdout.strip().splitlines():
    parts = line.split()
    if len(parts) >= 2:
        remote_md5s[parts[1].replace("./", "")] = parts[0]

print(f"{'Filename':<35} {'Local MD5':<34} {'Remote MD5':<34} {'Status'}")
print("-" * 115)

diffs = []
for fname in sorted(local_files):
    local_path = LOCAL_DIR / fname
    local_md5 = hashlib.md5(local_path.read_bytes()).hexdigest()
    remote_md5 = remote_md5s.get(fname, "MISSING_ON_REMOTE")
    status = "MATCH" if local_md5 == remote_md5 else "DIFFERENT"
    if status != "MATCH":
        diffs.append((fname, status))
    print(f"{fname:<35} {local_md5:<34} {remote_md5:<34} {status}")

print("\nDifferences found:", len(diffs))
for f, s in diffs:
    print(f"  - {f}: {s}")
