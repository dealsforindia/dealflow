import sys, re
sys.stdout.reconfigure(encoding='utf-8')

path_app = r'e:\Rudranildocs0066543\html-yt\tg-setup\src\app\App.tsx'
with open(path_app, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Replace INVALID_TITLE_TERMS
new_invalid_body = '''INVALID_TITLE_TERMS = [
  "site maintenance", "maintenance", "access denied", "just a moment",
  "security check", "robot or human", "are you a human", "attention required",
  "403 forbidden", "404 not found", "page not found", "myntra new", "amazon.in",
  "flipkart.com", "online shopping", "loading...", "error", "we could not locate",
  "{title}", "{name}", "{product}", "{prod_name}", "[title]", "[name]",
  // Anti-Leak: Source channels & competitor handles must NEVER appear as product titles
  "fet (deals", "fetdeals", "offerzone", "crazy deals", "dealztrendz",
  "genie loot", "genie tricks", "genie all", "free earning tech", "technical sheikh",
  "loot deals app", "glam haul diaries", "trending loot deals", "earnkaro",
  "extrape", "desidime", "bblbblp", "shoppers quest", "fitness finds", "oz loot"
];'''

text, n1 = re.subn(r'INVALID_TITLE_TERMS\s*=\s*\[.*?\];', new_invalid_body, text, count=1, flags=re.DOTALL)
print(f"INVALID_TITLE_TERMS replaced: {n1}")

# 2. Replace header 1
pat_h1 = r'<div className="w-4 h-4 rounded-full bg-slate-800 text-\[9px\] font-bold text-white flex items-center justify-center">\s*\{\(deal\.channel \|\| "D"\)\[0\]\}\s*</div>\s*<span className="truncate">\{deal\.channel \|\| "Direct Channel"\}</span>'
sub_h1 = '<div className="w-4 h-4 rounded-full bg-emerald-600 text-[9px] font-black text-white flex items-center justify-center shadow-sm">I</div>\n            <span className="truncate font-bold text-white">IndiaDealHunts</span>'
text, n2 = re.subn(pat_h1, sub_h1, text, count=1)
print(f"Header 1 replaced: {n2}")

# 3. Replace header 2
pat_h2 = r'<div className="tg-preview-avatar">\s*\{deal\.channel \? deal\.channel\.charAt\(0\)\.toUpperCase\(\) : "D"\}\s*</div>\s*<div>\s*<div className="tg-preview-name">\s*\{deal\.channel\} <CheckCheck size=\{12\} className="text-blue-400" />\s*</div>\s*<div className="text-\[10px\] text-slate-400">\s*\{deal\.channelRaw && deal\.channelRaw\.startsWith\("@"\) \? deal\.channelRaw : `Telegram Channel · \$\{deal\.channel\}`\}\s*</div>\s*</div>'
sub_h2 = '<div className="tg-preview-avatar" style={{ background: "#10b981", color: "#ffffff", fontWeight: 800 }}>IDH</div>\n                    <div>\n                      <div className="tg-preview-name">IndiaDealHunts <CheckCheck size={12} className="text-blue-400" /></div>\n                      <div className="text-[10px] text-slate-400">@dealsforindiachannel · Verified Broadcast</div>\n                    </div>'
text, n3 = re.subn(pat_h2, sub_h2, text, count=1)
print(f"Header 2 replaced: {n3}")

with open(path_app, 'w', encoding='utf-8') as f:
    f.write(text)

print("Finished updating App.tsx")

