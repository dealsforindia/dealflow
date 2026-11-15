import subprocess, sys
sys.stdout.reconfigure(encoding='utf-8')

script = r"""
with open('/home/rudranil777/dealbot/desidime_bot.py', 'r', encoding='utf-8') as f:
    text = f.read()

old_block = '''    for page_url in [
        "https://www.desidime.com/deals",
        "https://www.desidime.com/new",
        "https://www.desidime.com/new?page=2",
    ]:'''

new_block = '''    for page_url in [
        "https://www.desidime.com/new",
        "https://www.desidime.com/new?page=2",
        "https://www.desidime.com/new?page=3",
    ]:'''

if old_block in text:
    text = text.replace(old_block, new_block, 1)
    with open('/home/rudranil777/dealbot/desidime_bot.py', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Successfully reverted scrape URLs to /new (pages 1, 2, 3)!")
else:
    print("Warning: old_block not matched in desidime_bot.py")

# Also verify INTERVAL is 600s
for line in text.split('\n'):
    if 'INTERVAL' in line and '=' in line and not line.startswith('#'):
        print("Scrape Interval setting:", line.strip())
"""

p = subprocess.run(["ssh", "rudranil777@74.225.250.0", "python3 -"], input=script.encode(), capture_output=True)
print(p.stdout.decode('utf-8', errors='replace'))
if p.stderr:
    print("ERR:", p.stderr.decode('utf-8', errors='replace'))
