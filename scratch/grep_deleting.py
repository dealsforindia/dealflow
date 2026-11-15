import subprocess, sys

script = """
with open('/home/rudranil777/.pm2/logs/price-scanner-error.log', 'r', encoding='utf-8', errors='ignore') as f:
    for line in f:
        if 'DELETING OUT-OF-STOCK' in line:
            print(line.strip())
"""

cmd = ["ssh", "rudranil777@74.225.250.0", "python3 -"]
p = subprocess.run(cmd, input=script.encode("utf-8"), capture_output=True)
sys.stdout.buffer.write(p.stdout)
if p.stderr:
    sys.stderr.buffer.write(p.stderr)
