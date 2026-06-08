import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract styles
match = re.search(r'const styles = `(.*?)`;', content, re.DOTALL)
if match:
    css = match.group(1)
    with open('src/App.css', 'w', encoding='utf-8') as f:
        f.write(css)
    print("CSS extracted successfully")
else:
    print("Failed to find styles")
