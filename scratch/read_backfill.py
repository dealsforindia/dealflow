import subprocess

remote_code = r'''
with open("/home/rudranil777/dealbot/backfill_price_history.py", "r", encoding="utf-8", errors="ignore") as f:
    print(f.read())
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
