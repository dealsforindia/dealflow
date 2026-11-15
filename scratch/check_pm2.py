import subprocess

remote_code = r'''
import subprocess
out = subprocess.check_output(['pm2', 'jlist'], text=True)
import json
procs = json.loads(out)
for p in procs:
    print(f"ID: {p['pm_id']} | Name: {p['name']} | Status: {p['pm2_env']['status']} | CPU: {p['monit']['cpu']}% | Mem: {p['monit']['memory'] // 1048576}MB")
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
