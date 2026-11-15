import subprocess, sys

if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

def run_remote_python(code: str):
    p = subprocess.run(["ssh", "rudranil777@74.225.250.0", "python3 -"], input=code.encode("utf-8"), capture_output=True, encoding="utf-8", errors="replace")
    print("STDOUT:\n", p.stdout)
    if p.stderr:
        print("STDERR:\n", p.stderr)

code = """
import os, glob
print("Files matching amazon* in dealbot:")
print(glob.glob("/home/rudranil777/dealbot/amazon*"))
"""
run_remote_python(code)
