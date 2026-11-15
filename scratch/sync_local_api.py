with open("scratch/vm_api.py", "r", encoding="utf-8") as f_in:
    content = f_in.read()

with open("dealbot_backend/dealbot/api.py", "w", encoding="utf-8") as f_out:
    f_out.write(content)

print("Synced dealbot_backend/dealbot/api.py with VM api.py!")
