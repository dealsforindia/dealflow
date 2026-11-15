import subprocess, sys
sys.stdout.reconfigure(encoding='utf-8')

script = """
with open('/home/rudranil777/dealbot/desidime_bot.py', encoding='utf-8', errors='ignore') as f:
    for i, line in enumerate(f, 1):
        if 'def fetch' in line or 'def get_deals' in line or 'def scrape' in line or 'desidime.com/' in line:
            print(f'{i}: {line.strip()[:100]}')
"""

p = subprocess.run(['ssh', 'rudranil777@74.225.250.0', 'python3 -'], input=script.encode('utf-8'), capture_output=True)
print(p.stdout.decode('utf-8', errors='replace'))
