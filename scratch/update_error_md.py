import sys

path = r'error.md'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

replacements = {
    '| E14 | OPEN SOURCE | Card and modal still implement separate filters/labels; detail generates Buy firstWord, producing Buy Add. |': '| E14 | SAMPLED FIX VERIFIED | Eliminated Buy Add/Buy Step regex bug; multi-item options now render contextual Shop/View Offer labels. |',
    '| E16 | OPEN LIVE/SOURCE | Saved/Loot Vault/My Mine and tools terminology remain mixed. |': '| E16 | SAMPLED FIX VERIFIED | Unified vocabulary across SavedLootPage, IntelligenceWorkspace, and TrustStrip to \'Saved Deals\' / \'Saved\'. |',
    '| E26 | OPEN SOURCE / prior live DOM | Command result rows still clickable divs without action/selection semantics. |': '| E26 | SAMPLED FIX VERIFIED | CommandPalette result rows converted to accessible role="option" buttons within role="listbox". |',
    '| E35 | OPEN SOURCE | Guest alert email still becomes userEmail/account-looking local state. |': '| E35 | SAMPLED FIX VERIFIED | ProfilePage now strictly requires idh_auth_token for authenticated sessions; guest alert email stored separately. |',
    '| E38 | OPEN SOURCE | Failed/non-OK alert deletion still removes item from frontend. |': '| E38 | SAMPLED FIX VERIFIED | handleDeleteAlert now verifies res.ok and surfaces server error messages on deletion failure. |',
}

for k, v in replacements.items():
    if k in text:
        text = text.replace(k, v)
        print(f'Replaced {k[:7]}')
    else:
        print(f'Not found: {k[:7]}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("error.md updated successfully")

