import sys
import time
import subprocess

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

REMOTE_HOST = "rudranil777@74.225.250.0"

def run_ssh_command(cmd_str: str, max_retries: int = 6):
    ssh_cmd = [
        "ssh",
        "-i", "C:/Users/Neel/.ssh/id_ed25519",
        "-o", "IdentitiesOnly=yes",
        "-o", "BatchMode=yes",
        "-o", "ConnectTimeout=10",
        REMOTE_HOST,
        cmd_str
    ]
    for attempt in range(1, max_retries + 1):
        try:
            res = subprocess.run(ssh_cmd, capture_output=True, encoding="utf-8", errors="replace", timeout=45)
            stderr = res.stderr or ""
            if res.returncode == 0:
                print(res.stdout, end="")
                if stderr:
                    print(stderr, end="")
                return True
            if "banner exchange" in stderr or "Permission denied" in stderr:
                sleep_time = 3.0 * attempt
                time.sleep(sleep_time)
                continue
            print(f"Command error (returncode {res.returncode}):\n{stderr}")
            if res.stdout:
                print(res.stdout)
            return False
        except Exception as e:
            time.sleep(3.0 * attempt)
    print("Error: Max retries exceeded.")
    return False

if __name__ == "__main__":
    if len(sys.argv) > 1:
        run_ssh_command(" ".join(sys.argv[1:]))
    else:
        print("Usage: python run_on_vm.py <command>")
