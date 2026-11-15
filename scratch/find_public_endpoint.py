import subprocess

remote_code = r'''
import subprocess
out = subprocess.check_output(['grep', '-rn', '/deals/public', '/home/rudranil777/dealbot/'], text=True)
print(out)
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
