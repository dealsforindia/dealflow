import subprocess

res = subprocess.run(
    ['ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0', 'cat /home/rudranil777/dealbot/api.py'],
    capture_output=True,
    text=True,
    encoding="utf-8",
    errors="replace"
)
print("SSH returncode:", res.returncode)
if res.returncode == 0:
    with open("scratch/vm_api.py", "w", encoding="utf-8") as f:
        f.write(res.stdout)
    with open("scratch/vm_api.py", "r", encoding="utf-8") as f1:
        vm_lines = len(f1.readlines())
    with open("dealbot_backend/dealbot/api.py", "r", encoding="utf-8") as f2:
        local_lines = len(f2.readlines())
    print(f"VM lines: {vm_lines}, Local lines: {local_lines}")
