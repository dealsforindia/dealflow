import subprocess, sys

script = """
with open('/home/rudranil777/dealbot/oos_expiry_worker.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    print(''.join(lines[130:200]))
"""

cmd = ["ssh", "rudranil777@74.225.250.0", "python3 -"]
p = subprocess.run(cmd, input=script.encode(), capture_output=True)
sys.stdout.buffer.write(p.stdout)
if p.stderr:
    sys.stderr.buffer.write(p.stderr)
