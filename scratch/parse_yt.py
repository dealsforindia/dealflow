import re

file_path = r"C:\Users\Neel\.gemini\antigravity-ide\brain\86e1f479-54ec-45ff-a67e-f08a076ab728\.system_generated\steps\920\content.md"
with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
    text = f.read()

# find description
desc_match = re.search(r'"description":\s*{"runs":\s*(\[.+?\])\s*}', text)
if desc_match:
    runs = desc_match.group(1)
    parts = re.findall(r'"text":\s*"([^"]+)"', runs)
    print("DESCRIPTION:", "".join(parts))
else:
    # search for attributedDescriptionBodyText
    m = re.search(r'"attributedDescriptionBodyText":\s*{"content":\s*"([^"]+)"', text)
    if m:
        print("ATTRIBUTED DESC:", m.group(1)[:2000])

channel = re.search(r'"owner":\s*{"videoOwnerRenderer":\s*{"title":\s*{"runs":\s*\[{"text":\s*"([^"]+)"', text)
if channel:
    print("CHANNEL:", channel.group(1))
