import subprocess, sys

if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if sys.stderr.encoding.lower() != 'utf-8':
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

def run(cmd):
    p = subprocess.run(["ssh", "rudranil777@74.225.250.0", cmd], capture_output=True, encoding="utf-8", errors="replace")
    print("STDOUT:\n", p.stdout)
    if p.stderr:
        print("STDERR:\n", p.stderr)

run("pm2 status")
