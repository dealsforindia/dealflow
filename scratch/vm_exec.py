import subprocess, sys

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if sys.stderr.encoding and sys.stderr.encoding.lower() != 'utf-8':
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

def run_vm_py(code_str: str) -> str:
    p = subprocess.run(
        ["ssh", "rudranil777@74.225.250.0", "python3 -"],
        input=code_str,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace"
    )
    if p.stderr and ("Traceback" in p.stderr or "Error" in p.stderr):
        print("STDERR:\n", p.stderr, file=sys.stderr)
    return p.stdout

def run_vm_sh(cmd_str: str) -> str:
    p = subprocess.run(
        ["ssh", "rudranil777@74.225.250.0", cmd_str],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace"
    )
    if p.stderr and ("Error" in p.stderr):
        print("STDERR:\n", p.stderr, file=sys.stderr)
    return p.stdout

if __name__ == "__main__":
    out = run_vm_sh("ls -la /home/rudranil777/dealbot/amazon*")
    print(out)
