import sys
sys.stdout.reconfigure(encoding='utf-8')

path = r'e:\Rudranildocs0066543\html-yt\tg-setup\src\app\App.tsx'
with open(path, 'rb') as f:
    raw = f.read()
raw = raw.replace(b'\r\r\n', b'\r\n')
text = raw.decode('utf-8')

# Add pending-redirection badge after the title h4 in DealCard (mobile layout around line 1307)
old = '''              {/* Title: 2 lines with comfortable leading */}
              <h4
                className="font-heading text-xs font-bold text-slate-100 line-clamp-2 leading-snug mt-1 hover:text-indigo-300 transition-colors cursor-pointer tracking-tight"
                onClick={() => onEdit(deal)}
                title={deal.title}
              >
                {deal.title}
              </h4>
            </div>'''

new = '''              {/* Title: 2 lines with comfortable leading */}
              <h4
                className="font-heading text-xs font-bold text-slate-100 line-clamp-2 leading-snug mt-1 hover:text-indigo-300 transition-colors cursor-pointer tracking-tight"
                onClick={() => onEdit(deal)}
                title={deal.title}
              >
                {deal.title}
              </h4>
              {deal.pendingRedirection && (
                <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/40 text-[9px] font-bold text-amber-300">
                  ⚠️ Link Resolving — Approve after verifying URL
                </span>
              )}
            </div>'''

count = text.count(old)
if count == 1:
    text = text.replace(old, new, 1)
    print(f'DealCard (mobile): badge added')
else:
    print(f'DealCard (mobile): PATTERN count={count}, searching nearby...')
    idx = text.find('Title: 2 lines with comfortable leading')
    print(f'  Title comment found at char index: {idx}')
    print(repr(text[idx:idx+400]))

with open(path, 'wb') as f:
    f.write(text.encode('utf-8'))

