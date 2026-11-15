import os
import sys
import time
import subprocess
import tarfile
import io
from pathlib import Path

REMOTE_HOST = "rudranil777@74.225.250.0"
REMOTE_DIR = "/home/rudranil777/dealbot"
LOCAL_DIR = Path(__file__).resolve().parent / "dealbot_backend" / "dealbot"

def download_repo_from_vm():
    print(f"Connecting to {REMOTE_HOST} to download codebase from {REMOTE_DIR}...")
    LOCAL_DIR.mkdir(parents=True, exist_ok=True)
    
    # Exclude heavy sessions, logs, cache, images
    remote_cmd = (
        f"cd {REMOTE_DIR} && tar "
        f"--exclude='*.session*' "
        f"--exclude='*.log*' "
        f"--exclude='images' "
        f"--exclude='__pycache__' "
        f"--exclude='*.bak*' "
        f"-czf - *.py *.sh *.json .env"
    )
    
    ssh_cmd = [
        "ssh",
        "-o", "ConnectTimeout=15",
        "-o", "StrictHostKeyChecking=no",
        REMOTE_HOST,
        remote_cmd
    ]
    
    start_time = time.time()
    proc = subprocess.run(ssh_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if proc.returncode != 0:
        print(f"SSH tar download failed with code {proc.returncode}:")
        print(proc.stderr.decode("utf-8", errors="replace"))
        return False
        
    tar_bytes = proc.stdout
    print(f"Received {len(tar_bytes):,} bytes tar archive in {time.time() - start_time:.2f}s.")
    
    with tarfile.open(fileobj=io.BytesIO(tar_bytes), mode="r:gz") as tar:
        members = tar.getmembers()
        print(f"Extracting {len(members)} files to {LOCAL_DIR}...")
        for member in members:
            # If member is .env, also backup to .env.vm
            if member.name == ".env":
                target_env = LOCAL_DIR / ".env.vm"
                f = tar.extractfile(member)
                if f:
                    target_env.write_bytes(f.read())
                    print(f"  Saved remote .env as {target_env.name}")
            tar.extract(member, path=LOCAL_DIR)
            print(f"  -> {member.name} ({member.size:,} bytes)")
            
    print(f"Successfully downloaded and synchronized codebase to {LOCAL_DIR}!")
    return True

if __name__ == "__main__":
    download_repo_from_vm()
