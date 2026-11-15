import subprocess, sys
sys.stdout.reconfigure(encoding='utf-8')

script = r"""
with open('/home/rudranil777/dealbot/api.py', 'r', encoding='utf-8') as f:
    content = f.read()

target_str = '    # 4. OS-Aware App Intent Routing (Bypass Mobile Web Login)'
replacement_str = '''    # Guard: Never leak or redirect to DesiDime
    if any(d in target_url.lower() for d in ["desidime.com", "links.ddime.in", "visit.desidime.com"]):
        import urllib.parse
        parsed = urllib.parse.urlparse(target_url)
        params = urllib.parse.parse_qs(parsed.query)
        unpacked = None
        for p_key in ['url', 'target', 'destination', 'targetUrl']:
            if p_key in params and params[p_key]:
                cand_u = urllib.parse.unquote(params[p_key][0])
                if cand_u.startswith('http') and 'desidime' not in cand_u.lower():
                    unpacked = cand_u
                    break
        if unpacked:
            target_url = unpacked
        else:
            target_url = "https://indiadealhunts.vercel.app"

    # 4. OS-Aware App Intent Routing (Bypass Mobile Web Login)'''

if target_str in content:
    content = content.replace(target_str, replacement_str, 1)
    with open('/home/rudranil777/dealbot/api.py', 'w', encoding='utf-8') as f:
        f.write(content)
    print("✓ Added DesiDime outbound redirect blocker to api.py")
else:
    print("Warning: target_str not found in api.py")
"""

p = subprocess.run(["ssh", "rudranil777@74.225.250.0", "python3 -"], input=script.encode(), capture_output=True)
print(p.stdout.decode('utf-8', errors='replace'))
if p.stderr:
    print("ERR:", p.stderr.decode('utf-8', errors='replace'))
