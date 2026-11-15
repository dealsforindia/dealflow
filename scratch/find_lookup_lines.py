with open("dealbot_backend/dealbot/api.py", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "_lookup_public_price" in line:
        print(f"Line {i+1}: {line.strip()}")
