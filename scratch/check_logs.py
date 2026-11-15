import subprocess, sys

script = """
import os
for f in os.listdir('/home/rudranil777/.pm2/logs/'):
    if 'scanner' in f or 'price' in f or 'oos' in f:
        print(f, os.path.getsize('/home/rudranil777/.pm2/logs/' + f))
"""

cmd = ["ssh", "rudranil777@74.225.250.0", "python3 -"]
p = subprocess.run(cmd, input=script.encode("utf-8"), capture_output=True)
sys.stdout.buffer.write(p.stdout)
if p.stderr:
    sys.stderr.buffer.write(p.stderr)
