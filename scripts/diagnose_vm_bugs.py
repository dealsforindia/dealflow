import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from run_on_vm import run_ssh_command

cmd = """python3 -c "
import os, requests, json
from dotenv import load_dotenv
load_dotenv('/home/rudranil777/dealbot/.env')

print('=== 1. CHECK GROQ KEYS & MODELS ===')
groq_keys = [k.strip() for k in os.getenv('GROQ_KEYS', '').split(',') if k.strip()]
print(f'Total GROQ keys: {len(groq_keys)}')
valid_groq_models = []
for i, k in enumerate(groq_keys):
    try:
        r = requests.get('https://api.groq.com/openai/v1/models', headers={'Authorization': f'Bearer {k}'}, timeout=5)
        if r.status_code == 200:
            mods = [m['id'] for m in r.json().get('data', [])]
            valid_groq_models = mods
            print(f'  Key #{i}: Valid! Models count: {len(mods)}')
            print(f'  Sample models: {mods[:10]}')
            break
        else:
            print(f'  Key #{i}: HTTP {r.status_code}')
    except Exception as e:
        print(f'  Key #{i} err: {e}')

print('=== 2. CHECK CEREBRAS KEY ===')
c_key = os.getenv('CEREBRAS_API_KEY') or os.getenv('CEREBRAS_KEY')
if c_key:
    try:
        r = requests.get('https://api.cerebras.ai/v1/models', headers={'Authorization': f'Bearer {c_key}'}, timeout=5)
        print(f'  Cerebras status: {r.status_code}')
        if r.status_code == 200:
            print('  Cerebras models:', [m['id'] for m in r.json().get('data', [])])
    except Exception as e:
        print(f'  Cerebras err: {e}')
else:
    print('  No Cerebras key found')

print('=== 3. CHECK GEMINI KEYS ===')
gemini_keys = [k.strip() for k in os.getenv('GEMINI_KEYS', '').split(',') if k.strip()]
g_single = os.getenv('GEMINI_API_KEY') or os.getenv('GEMINI_KEY')
if g_single and g_single not in gemini_keys: gemini_keys.insert(0, g_single)
print(f'Total Gemini keys: {len(gemini_keys)}')
for i, gk in enumerate(gemini_keys[:3]):
    try:
        r = requests.get(f'https://generativelanguage.googleapis.com/v1beta/models?key={gk}', timeout=5)
        if r.status_code == 200:
            avail = [m['name'].replace('models/', '') for m in r.json().get('models', []) if 'flash' in m['name']]
            print(f'  Gemini key #{i}: Valid! Flash models: {avail[:4]}')
            break
        else:
            print(f'  Gemini key #{i}: HTTP {r.status_code}')
    except Exception as e:
        print(f'  Gemini key #{i} err: {e}')

print('=== 4. CHECK RECENT PM2 LOG ERRORS ===')
import subprocess
for app in ['bot', 'desidime', 'worker', 'api']:
    res = subprocess.run(['pm2', 'logs', app, '--lines', '20', '--nostream'], capture_output=True, text=True)
    out = res.stdout + res.stderr
    err_lines = [l for l in out.splitlines() if 'error' in l.lower() or 'exception' in l.lower() or 'traceback' in l.lower() or 'fail' in l.lower() or 'retry' in l.lower() or 'drop' in l.lower()]
    print(f'  [{app}] error/warning lines found: {len(err_lines)}')
    for el in err_lines[-5:]:
        print(f'    {el[:120]}')
"
"""

if __name__ == "__main__":
    run_ssh_command(cmd)
