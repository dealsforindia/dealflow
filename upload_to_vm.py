import sys
import time
import subprocess
from pathlib import Path

REMOTE_HOST = "rudranil777@74.225.250.0"

def upload_file(local_path: str, remote_dest: str = "/home/rudranil777/dealbot/", max_retries: int = 5):
    p = Path(local_path)
    if not p.exists():
        print(f"Error: Local file {local_path} does not exist.")
        return False
    data = p.read_bytes()
    filename = p.name
    target = f"{remote_dest.rstrip('/')}/{filename}"
    cmd = [
        "ssh",
        "-i", "C:/Users/Neel/.ssh/id_ed25519",
        "-o", "IdentitiesOnly=yes",
        "-o", "BatchMode=yes",
        "-o", "ConnectTimeout=10",
        REMOTE_HOST,
        f"cat > '{target}'"
    ]

    for attempt in range(1, max_retries + 1):
        try:
            res = subprocess.run(cmd, input=data, capture_output=True, timeout=30)
            stderr = res.stderr.decode("utf-8", errors="replace")
            if res.returncode == 0:
                print(f"Successfully uploaded {filename} ({len(data):,} bytes) -> {target}")
                return True
            if "banner exchange" in stderr or "Permission denied" in stderr:
                time.sleep(2.0 * attempt)
                continue
            print(f"Upload failed: {stderr}")
            return False
        except Exception as e:
            print(f"Attempt {attempt} exception: {e}")
            time.sleep(2.0 * attempt)
    return False

if __name__ == "__main__":
    if len(sys.argv) > 1:
        for f in sys.argv[1:]:
            upload_file(f)
    else:
        print("Usage: python upload_to_vm.py <file1> <file2> ...")
