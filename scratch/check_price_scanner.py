import subprocess

remote_code = r'''
import subprocess, json
out = subprocess.check_output(['pm2', 'jlist'], text=True)
procs = json.loads(out)
for p in procs:
    if p['name'] == 'price-scanner':
        print("price-scanner script:", p['pm2_env']['pm_exec_path'])
        print("price-scanner args:", p['pm2_env'].get('args'))
        print("price-scanner cwd:", p['pm2_env'].get('pm_cwd'))

# Also inspect recent logs of price-scanner
log_out = subprocess.check_output(['pm2', 'logs', 'price-scanner', '--lines', '25', '--nostream'], text=True)
print("\n--- Recent Logs of price-scanner ---")
print(log_out)
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
