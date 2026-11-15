import subprocess

cmd = ['ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0', 'python3 /home/rudranil777/dealbot/vm_restore.py']
res = subprocess.run(cmd, capture_output=True, text=True)
print("STDOUT:", res.stdout.strip())
print("STDERR:", res.stderr.strip())
