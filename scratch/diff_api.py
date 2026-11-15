import difflib

with open("dealbot_backend/dealbot/api.py", "r", encoding="utf-8", errors="ignore") as f1:
    local_lines = f1.readlines()

with open("scratch/vm_api.py", "r", encoding="utf-8", errors="ignore") as f2:
    vm_lines = f2.readlines()

diff = list(difflib.unified_diff(local_lines, vm_lines, fromfile="local", tofile="vm", n=3))
print(f"Total diff lines: {len(diff)}")
for line in diff[:60]:
    print(line.rstrip())
