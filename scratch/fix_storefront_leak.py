import sys
sys.stdout.reconfigure(encoding='utf-8')

path = r'e:\Rudranildocs0066543\html-yt\rudranil-deals-web\src\App.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

count = text.count("source_channel: 'Crazy Deals'")
print(f"Found {count} occurrences of source_channel: 'Crazy Deals'")
text = text.replace("source_channel: 'Crazy Deals'", "source_channel: 'IndiaDealHunts'")

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated rudranil-deals-web App.tsx")

