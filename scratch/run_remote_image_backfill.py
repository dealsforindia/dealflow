import subprocess
import sys
from pathlib import Path
code = '''import os, sys, runpy
os.chdir('/home/rudranil777/dealbot'); sys.path.insert(0, os.getcwd())
from dotenv import load_dotenv
load_dotenv('.env')
sys.argv = ['backfill_amazon_images.py', '--database', os.getenv('MONGODB_DB', 'dealbot'), '--limit', '20', '--apply']
runpy.run_path('backfill_amazon_images.py', run_name='__main__')
'''
result = subprocess.run(['ssh', '-o', 'BatchMode=yes', '-o', 'ConnectTimeout=5', '-o', 'StrictHostKeyChecking=yes', 'rudranil777@74.225.250.0', 'python3 -'], input=code.encode(), capture_output=True, timeout=400)
Path(__file__).with_name('amazon-image-backfill-result.txt').write_bytes(result.stdout + result.stderr)
sys.stdout.buffer.write(result.stdout + result.stderr)
sys.exit(result.returncode)
