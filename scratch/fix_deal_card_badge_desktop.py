import sys
sys.stdout.reconfigure(encoding='utf-8')

path = r'e:\Rudranildocs0066543\html-yt\tg-setup\src\app\App.tsx'
with open(path, 'rb') as f:
    raw = f.read()
raw = raw.replace(b'\r\r\n', b'\r\n')
text = raw.decode('utf-8')

# Desktop layout - add badge after h4 title
old = (
    '            <h4 className="font-heading text-[13.5px] font-bold text-zinc-100 line-clamp-2 leading-snug hover:text-indigo-300 transition-colors cursor-pointer tracking-tight" onClick={() => onEdit(deal)} title={deal.title}>\r\n'
    '              {deal.title}\r\n'
    '            </h4>\r\n'
    '            <div className="flex items-center justify-between gap-2 mt-2 flex-wrap">'
)

new = (
    '            <h4 className="font-heading text-[13.5px] font-bold text-zinc-100 line-clamp-2 leading-snug hover:text-indigo-300 transition-colors cursor-pointer tracking-tight" onClick={() => onEdit(deal)} title={deal.title}>\r\n'
    '              {deal.title}\r\n'
    '            </h4>\r\n'
    '            {deal.pendingRedirection && (\r\n'
    '              <span className="inline-flex items-center gap-1 mt-1 mb-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/40 text-[9px] font-bold text-amber-300">\r\n'
    '                \u26a0\ufe0f Link Resolving \u2014 Verify URL before approving\r\n'
    '              </span>\r\n'
    '            )}\r\n'
    '            <div className="flex items-center justify-between gap-2 mt-2 flex-wrap">'
)

count = text.count(old)
print(f'Desktop title pattern occurrences: {count}')
if count >= 1:
    text = text.replace(old, new, 1)
    with open(path, 'wb') as f:
        f.write(text.encode('utf-8'))
    print('SUCCESS: Badge added to DealCard desktop layout')
else:
    idx = text.find('font-heading text-[13.5px]')
    if idx >= 0:
        print(repr(text[idx-5:idx+200]))

