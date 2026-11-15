import subprocess, sys

script = """
with open('/home/rudranil777/.pm2/logs/price-scanner-error.log', 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if '031b4af5197ec30a' in line:
            start = max(0, i - 15)
            end = min(len(lines), i + 15)
            print(''.join(lines[start:end]))
"""

cmd = ["ssh", "rudranil777@74.225.250.0", "python3 -"]
p = subprocess.run(cmd, input=script.encode("utf-8"), capture_output=True)
sys.stdout.buffer.write(p.stdout)
if p.stderr:
    sys.stderr.buffer.write(p.stderr)
