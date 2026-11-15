import subprocess

remote_code = r'''
with open("/home/rudranil777/dealbot/oos_expiry_worker.py", "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "Failed to update price in MongoDB for" in line:
        print("".join(lines[max(0, i-25):min(len(lines), i+15)]))
'''

res = subprocess.run(
    ['ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0', 'python3 -'],
    input=remote_code,
    capture_output=True,
    text=True,
    encoding="utf-8",
    errors="replace"
)
print("STDOUT:")
print(res.stdout.encode('ascii', errors='replace').decode('ascii'))
