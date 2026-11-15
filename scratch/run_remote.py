import subprocess, sys

def run_remote_python(code: str):
    cmd = ["ssh", "rudranil777@74.225.250.0", "python3 -"]
    p = subprocess.run(cmd, input=code.encode("utf-8"), capture_output=True)
    sys.stdout.buffer.write(p.stdout)
    if p.stderr:
        sys.stderr.buffer.write(p.stderr)

if __name__ == "__main__":
    code = """
import subprocess
out = subprocess.run("tail -n 30 /home/rudranil777/.pm2/logs/price-scanner-out.log", shell=True, capture_output=True, text=True)
print(out.stdout)
"""
    run_remote_python(code)
