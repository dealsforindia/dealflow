import subprocess
import sys
from pathlib import Path
path = Path(__file__).with_name(sys.argv[1] if len(sys.argv) > 1 else 'provider_public_probe.py')
result = subprocess.run(['ssh','-o','BatchMode=yes','-o','ConnectTimeout=5','-o','StrictHostKeyChecking=yes','rudranil777@74.225.250.0','python3 -'], input=path.read_bytes(), capture_output=True, timeout=180)
path.with_suffix('.evidence.jsonl').write_bytes(result.stdout)
sys.stdout.buffer.write(result.stdout + result.stderr)
sys.exit(result.returncode)
