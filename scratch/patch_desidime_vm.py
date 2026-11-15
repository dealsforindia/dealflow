import subprocess

patch_script = """
file_path = '/home/rudranil777/dealbot/desidime_bot.py'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = "from dealbot.pincode_resolver import extract_locations_from_text"
replacement = \"\"\"try:
                from pincode_resolver import extract_locations_from_text
            except ImportError:
                try:
                    from dealbot.pincode_resolver import extract_locations_from_text
                except ImportError:
                    def extract_locations_from_text(t): return {"pincodes": [], "cities": []}\"\"\"

if target in content:
    content = content.replace(target, replacement)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS: Patched desidime_bot.py on VM!")
else:
    print("TARGET NOT FOUND or ALREADY PATCHED")
"""

p = subprocess.run(['ssh', 'rudranil777@74.225.250.0', 'python3 -'], input=patch_script, capture_output=True, text=True)
print(p.stdout)
if p.stderr:
    print('ERR:', p.stderr)
