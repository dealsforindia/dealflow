import subprocess

with open("scratch/check_db_progress.py", "r", encoding="utf-8") as f:
    remote_code = f.read()

res = subprocess.run(
    ['ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0', 'python3 -'],
    input=remote_code,
    capture_output=True,
    text=True,
    encoding="utf-8",
    errors="replace"
)
print("STDOUT:", res.stdout)
