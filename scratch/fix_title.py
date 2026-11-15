path = 'dealbot_backend/dealbot/deal_clusterer.py'
with open(path, 'r', encoding='utf-8') as f:
    s = f.read()

old_s = 'if longest_title and len(longest_title) > len(best_deal.get("prod_name") or best_deal.get("title") or ""):'
new_s = 'if longest_title:'

assert old_s in s, "old_s not found"
s = s.replace(old_s, new_s, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(s)

print("Title assignment fixed!")
