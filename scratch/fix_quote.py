path = 'dealbot_backend/dealbot/deal_clusterer.py'
with open(path, 'r', encoding='utf-8') as f:
    s = f.read()

# Replace line 134
old_line = 'm_amz_txt = re.search(r\'amazon\\.in[^\\s"\'<>]*?(?:/dp/|/gp/product/|/gp/aw/d/)([A-Z0-9]{10})\', all_text, re.I)'
new_line = 'm_amz_txt = re.search(r"""amazon\\.in[^\\s"\'<>]*?(?:/dp/|/gp/product/|/gp/aw/d/)([A-Z0-9]{10})""", all_text, re.I)'

assert old_line in s, "old_line not found"
s = s.replace(old_line, new_line, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(s)

print("Fixed quote successfully!")
