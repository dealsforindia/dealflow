import subprocess, time, sys

files = [
    ('dealbot_backend/dealbot/stealth_fetcher.py', '/home/rudranil777/dealbot/stealth_fetcher.py'),
    ('dealbot_backend/dealbot/universal_store_engine.py', '/home/rudranil777/dealbot/universal_store_engine.py'),
    ('dealbot_backend/dealbot/store_scraper.py', '/home/rudranil777/dealbot/store_scraper.py'),
    ('dealbot_backend/dealbot/bot.py', '/home/rudranil777/dealbot/bot.py'),
    ('dealbot_backend/dealbot/worker.py', '/home/rudranil777/dealbot/worker.py'),
    ('dealbot_backend/dealbot/api.py', '/home/rudranil777/dealbot/api.py'),
]

for local_path, remote_path in files:
    success = False
    with open(local_path, 'rb') as f:
        data = f.read()
    for attempt in range(5):
        print(f"Uploading {local_path} (attempt {attempt+1})...")
        cmd = ['ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0', f'cat > {remote_path}']
        proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = proc.communicate(input=data)
        if proc.returncode == 0:
            print(f"[OK] Uploaded {local_path} ({len(data)} bytes)")
            success = True
            time.sleep(2)
            break
        else:
            print(f"Attempt {attempt+1} failed ({stderr.decode('utf-8', errors='ignore').strip()}). Waiting 4s...")
            time.sleep(4)
    if not success:
        print(f"FAILED to upload {local_path}")
        sys.exit(1)

print("All backend files uploaded successfully!")
