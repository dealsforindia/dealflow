import subprocess, sys

cmd = ["ssh", "rudranil777@74.225.250.0", "grep -C 5 '031b4af5197ec30a' /home/rudranil777/.pm2/logs/price-scanner-out.log"]
p = subprocess.run(cmd, capture_output=True)
sys.stdout.buffer.write(p.stdout)
if p.stderr:
    sys.stderr.buffer.write(p.stderr)
