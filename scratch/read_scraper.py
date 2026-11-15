import subprocess, sys

script = """
with open('/home/rudranil777/dealbot/store_scraper.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    print(''.join(lines[460:500]))
"""

cmd = ["ssh", "rudranil777@74.225.250.0", "python3 -"]
p = subprocess.run(cmd, input=script.encode("utf-8"), capture_output=True)
sys.stdout.buffer.write(p.stdout)
if p.stderr:
    sys.stderr.buffer.write(p.stderr)
