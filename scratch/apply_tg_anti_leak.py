import sys
sys.stdout.reconfigure(encoding='utf-8')

# Update tg-setup/src/app/App.tsx
path_app = r'e:\Rudranildocs0066543\html-yt\tg-setup\src\app\App.tsx'
with open(path_app, 'rb') as f:
    raw = f.read()
raw = raw.replace(b'\r\r\n', b'\r\n')
text = raw.decode('utf-8')

changes = []

# 1. Update INVALID_TITLE_TERMS
old_invalid = '''const INVALID_TITLE_TERMS = [
  "site maintenance", "maintenance", "access denied", "just a moment",
  "security check", "robot or human", "are you a human", "attention required",
  "403 forbidden", "404 not found", "page not found", "myntra new", "amazon.in",
  "flipkart.com", "online shopping", "loading...", "error", "we could not locate",
  "{title}", "{name}", "{product}", "{prod_name}", "[title]", "[name]"
];'''

new_invalid = '''const INVALID_TITLE_TERMS = [
  "site maintenance", "maintenance", "access denied", "just a moment",
  "security check", "robot or human", "are you a human", "attention required",
  "403 forbidden", "404 not found", "page not found", "myntra new", "amazon.in",
  "flipkart.com", "online shopping", "loading...", "error", "we could not locate",
  "{title}", "{name}", "{product}", "{prod_name}", "[title]", "[name]",
  // Anti-Leak: Source channels & aggregator names must NEVER appear as product titles
  "fet (deals", "fetdeals", "offerzone", "crazy deals", "dealztrendz",
  "genie loot", "genie tricks", "genie all", "free earning tech", "technical sheikh",
  "loot deals app", "glam haul diaries", "trending loot deals", "earnkaro",
  "extrape", "desidime", "bblbblp", "shoppers quest", "fitness finds", "oz loot"
];'''

if old_invalid in text:
    text = text.replace(old_invalid, new_invalid, 1)
    changes.append("App.tsx: Added channel names to INVALID_TITLE_TERMS")
else:
    changes.append("App.tsx: INVALID_TITLE_TERMS pattern not found")

# 2. Update cleanDealTitle fallback
old_clean_fallback = '  return "Unverified Deal";'
new_clean_fallback = '  return "Verified Store Offer";'
if old_clean_fallback in text:
    text = text.replace(old_clean_fallback, new_clean_fallback, 1)
    changes.append("App.tsx: Updated fallback deal title to 'Verified Store Offer'")

# 3. Fix DealCard mobile header channel leak
old_card_ch_mobile = '<span className="text-[11px] font-semibold text-slate-300 truncate max-w-[90px]">{deal.channel}</span>'
new_card_ch_mobile = '<span className="text-[11px] font-semibold text-slate-300 truncate max-w-[110px]" title="Discovery Stream: Verified Radar">{store.label || "Verified Drop"}</span>'
if old_card_ch_mobile in text:
    text = text.replace(old_card_ch_mobile, new_card_ch_mobile, 1)
    changes.append("App.tsx: Masked DealCard mobile channel name with store label")
else:
    changes.append("App.tsx: DealCard mobile channel pattern not found")

# 4. Fix DealCard desktop header channel leak
old_card_ch_desktop = '<span className="text-[11px] font-medium text-zinc-300 truncate max-w-[150px]">{deal.channel}</span>'
new_card_ch_desktop = '<span className="text-[11px] font-medium text-zinc-300 truncate max-w-[150px]" title="Discovery Stream: Verified Radar">{store.label || "Verified Drop"}</span>'
if old_card_ch_desktop in text:
    text = text.replace(old_card_ch_desktop, new_card_ch_desktop, 1)
    changes.append("App.tsx: Masked DealCard desktop channel name with store label")
else:
    changes.append("App.tsx: DealCard desktop channel pattern not found")

# 5. Fix Telegram live preview header in EditModal (lines ~2015-2018)
old_tg_header1 = '''            <div className="w-4 h-4 rounded-full bg-slate-800 text-[9px] font-bold text-white flex items-center justify-center">
              {(deal.channel || "D")[0]}
            </div>
            <span className="truncate">{deal.channel || "Direct Channel"}</span>'''

new_tg_header1 = '''            <div className="w-4 h-4 rounded-full bg-emerald-600 text-[9px] font-black text-white flex items-center justify-center shadow-sm">
              I
            </div>
            <span className="truncate font-bold text-white">IndiaDealHunts</span>'''

if old_tg_header1 in text:
    text = text.replace(old_tg_header1, new_tg_header1, 1)
    changes.append("App.tsx: Fixed EditModal Telegram preview header 1 to show IndiaDealHunts")
else:
    changes.append("App.tsx: Telegram preview header 1 pattern not found")

# 6. Fix second Telegram live preview header (lines ~2911-2921)
old_tg_header2 = '''                    <div className="tg-preview-avatar">
                      {deal.channel ? deal.channel.charAt(0).toUpperCase() : "D"}
                    </div>
                    <div>
                      <div className="tg-preview-name">
                        {deal.channel} <CheckCheck size={12} className="text-blue-400" />
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {deal.channelRaw && deal.channelRaw.startsWith("@") ? deal.channelRaw : `Telegram Channel · ${deal.channel}`}
                      </div>
                    </div>'''

new_tg_header2 = '''                    <div className="tg-preview-avatar" style={{ background: '#10b981', color: '#ffffff', fontWeight: 800 }}>
                      IDH
                    </div>
                    <div>
                      <div className="tg-preview-name">
                        IndiaDealHunts <CheckCheck size={12} className="text-blue-400" />
                      </div>
                      <div className="text-[10px] text-slate-400">
                        @dealsforindiachannel · Verified Broadcast
                      </div>
                    </div>'''

if old_tg_header2 in text:
    text = text.replace(old_tg_header2, new_tg_header2, 1)
    changes.append("App.tsx: Fixed EditModal Telegram preview header 2 to show IndiaDealHunts")
else:
    changes.append("App.tsx: Telegram preview header 2 pattern not found")

with open(path_app, 'wb') as f:
    f.write(text.encode('utf-8'))

for c in changes:
    print(c)

