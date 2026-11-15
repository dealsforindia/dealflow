import subprocess
from pathlib import Path

content = Path("scratch/check_db.py").read_bytes()
p = subprocess.run(
    ["ssh", "-o", "BatchMode=yes", "rudranil777@74.225.250.0", "cat > /home/rudranil777/dealbot/check_db.py"],
    input=content,
    stdin=None,
    capture_output=True
)
print("WRITE:", p.returncode, p.stderr.decode() if p.stderr else "")

p2 = subprocess.run(
    ["ssh", "-o", "BatchMode=yes", "rudranil777@74.225.250.0", "python3 /home/rudranil777/dealbot/check_db.py"],
    stdin=subprocess.DEVNULL,
    capture_output=True
)
print(p2.stdout.decode('utf-8', errors='replace'))
if p2.stderr:
    print("ERR:", p2.stderr.decode('utf-8', errors='replace'))
