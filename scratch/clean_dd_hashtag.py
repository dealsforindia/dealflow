import subprocess, sys
sys.stdout.reconfigure(encoding='utf-8')

script = r"""
with open('/home/rudranil777/dealbot/desidime_bot.py', 'r', encoding='utf-8') as f:
    text = f.read()

old_send = 'result = send_to_admin(admin_header + post_text + "\\n\\n#DesiDime", deal_id, image_path=img_path, extra_images=img_paths[1:])'
new_send = 'result = send_to_admin(admin_header + post_text, deal_id, image_path=img_path, extra_images=img_paths[1:])'

if old_send in text:
    text = text.replace(old_send, new_send, 1)
    with open('/home/rudranil777/dealbot/desidime_bot.py', 'w', encoding='utf-8') as f:
        f.write(text)
    print("✓ Removed #DesiDime from send_to_admin in desidime_bot.py")
else:
    print("Warning: old_send not found")
"""

p = subprocess.run(["ssh", "rudranil777@74.225.250.0", "python3 -"], input=script.encode(), capture_output=True)
print(p.stdout.decode('utf-8', errors='replace'))
if p.stderr:
    print("ERR:", p.stderr.decode('utf-8', errors='replace'))
