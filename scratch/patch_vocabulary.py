import sys

# 1. SavedLootPage.tsx
path_slp = r'rudranil-deals-web/src/components/SavedLootPage.tsx'
with open(path_slp, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('SAVED LOOT VAULT', 'SAVED DEALS')
text = text.replace("'Your Loot Vault is Empty'", "'Your Saved Deals are Empty'")

with open(path_slp, 'w', encoding='utf-8') as f:
    f.write(text)
print("SavedLootPage.tsx updated")

# 2. IntelligenceWorkspace.tsx
path_iw = r'rudranil-deals-web/src/components/IntelligenceWorkspace.tsx'
with open(path_iw, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("setNotice(exists ? 'Removed from My Mine.' : 'Saved to My Mine on this device.');",
                    "setNotice(exists ? 'Removed from Saved Deals.' : 'Saved to Saved Deals on this device.');")
text = text.replace("<Bookmark size={16} /> My Mine <span>{saved.length}</span>",
                    "<Bookmark size={16} /> Saved <span>{saved.length}</span>")
text = text.replace("{isSaved ? 'Remove from My Mine' : 'Save to My Mine'}",
                    "{isSaved ? 'Remove from Saved' : 'Save to Deals'}")

with open(path_iw, 'w', encoding='utf-8') as f:
    f.write(text)
print("IntelligenceWorkspace.tsx updated")

# 3. TrustStrip.tsx
path_ts = r'rudranil-deals-web/src/components/TrustStrip.tsx'
with open(path_ts, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("Save discoveries to My Mine", "Save discoveries to Saved Deals")

with open(path_ts, 'w', encoding='utf-8') as f:
    f.write(text)
print("TrustStrip.tsx updated")

