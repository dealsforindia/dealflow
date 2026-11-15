import re

# 1. CommandPalette.tsx
path_cp = r'rudranil-deals-web/src/components/CommandPalette.tsx'
with open(path_cp, 'r', encoding='utf-8') as f:
    text_cp = f.read()

text_cp = text_cp.replace("text-[9.5px]", "text-[11px]")
text_cp = text_cp.replace("text-[10px]", "text-xs")
text_cp = text_cp.replace("text-[10.5px]", "text-xs")

with open(path_cp, 'w', encoding='utf-8') as f:
    f.write(text_cp)
print("CommandPalette.tsx fonts bumped")

# 2. StoryModal.tsx
path_sm = r'rudranil-deals-web/src/components/StoryModal.tsx'
with open(path_sm, 'r', encoding='utf-8') as f:
    text_sm = f.read()

text_sm = text_sm.replace("text-[10px]", "text-xs")

with open(path_sm, 'w', encoding='utf-8') as f:
    f.write(text_sm)
print("StoryModal.tsx fonts bumped")

# 3. DealDetailModal.tsx
path_ddm = r'rudranil-deals-web/src/components/DealDetailModal.tsx'
with open(path_ddm, 'r', encoding='utf-8') as f:
    text_ddm = f.read()

text_ddm = re.sub(r"fontSize:\s*'9px'", "fontSize: '11px'", text_ddm)
text_ddm = re.sub(r"fontSize:\s*'9\.5px'", "fontSize: '11.5px'", text_ddm)
text_ddm = re.sub(r"fontSize:\s*'10px'", "fontSize: '11.5px'", text_ddm)
text_ddm = re.sub(r"fontSize:\s*'10\.5px'", "fontSize: '12px'", text_ddm)

with open(path_ddm, 'w', encoding='utf-8') as f:
    f.write(text_ddm)
print("DealDetailModal.tsx fonts bumped")

