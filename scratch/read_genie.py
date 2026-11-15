import subprocess

remote_code = r'''
with open("/home/rudranil777/dealbot/genie_history.py", "r", encoding="utf-8", errors="ignore") as f:
    text = f.read()
    print(text[1500:4000])
'''

res = subprocess.run(
    ['ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0', 'python3 -'],
    input=remote_code,
    capture_output=True,
    text=True
)
print("STDOUT:")
print(res.stdout)
