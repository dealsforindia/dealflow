import subprocess

remote_code = r'''
for fname in ["public_price_evidence.py", "test_public_lookup_history.py", "check_vm_price_history.py"]:
    fpath = f"/home/rudranil777/dealbot/{fname}"
    print(f"\n=== {fname} ===")
    with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
        print(f.read()[:1500])
'''

res = subprocess.run(
    ['ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0', 'python3 -'],
    input=remote_code,
    capture_output=True,
    text=True
)
print("STDOUT:")
print(res.stdout)
