import sys
sys.stdout.reconfigure(encoding='utf-8')

path = r'e:\Rudranildocs0066543\html-yt\tg-setup\src\app\App.tsx'
with open(path, 'rb') as f:
    raw = f.read()
raw = raw.replace(b'\r\r\n', b'\r\n')
text = raw.decode('utf-8')

# Use the exact byte sequences from the file
old = (
    '              {/* Title: 2 lines with comfortable leading */}\r\n'
    '              <h4\r\n'
    '                className="font-heading text-xs font-bold text-slate-100 line-clamp-2 leading-snug mt-1 hover:text-indigo-300 transition-colors cursor-pointer tracking-tight"\r\n'
    '                onClick={() => onEdit(deal)}\r\n'
    '                title={deal.title}\r\n'
    '              >\r\n'
    '                {deal.title}\r\n'
    '              </h4>\r\n'
    '            </div>'
)

new = (
    '              {/* Title: 2 lines with comfortable leading */}\r\n'
    '              <h4\r\n'
    '                className="font-heading text-xs font-bold text-slate-100 line-clamp-2 leading-snug mt-1 hover:text-indigo-300 transition-colors cursor-pointer tracking-tight"\r\n'
    '                onClick={() => onEdit(deal)}\r\n'
    '                title={deal.title}\r\n'
    '              >\r\n'
    '                {deal.title}\r\n'
    '              </h4>\r\n'
    '              {deal.pendingRedirection && (\r\n'
    '                <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/40 text-[9px] font-bold text-amber-300">\r\n'
    '                  \u26a0\ufe0f Link Resolving \u2014 Approve after verifying URL\r\n'
    '                </span>\r\n'
    '              )}\r\n'
    '            </div>'
)

count = text.count(old)
print(f'Pattern occurrences: {count}')
if count >= 1:
    text = text.replace(old, new, 1)
    with open(path, 'wb') as f:
        f.write(text.encode('utf-8'))
    print('SUCCESS: Badge added to DealCard mobile layout')
else:
    # Debug: show the actual chars around the title section
    idx = text.find('{deal.title}\r\n              </h4>')
    if idx >= 0:
        snippet = repr(text[idx-10:idx+60])
        print(f'Nearby snippet: {snippet}')
    else:
        idx2 = text.find('{deal.title}')
        print(f'deal.title at: {idx2}')
        print(repr(text[idx2-5:idx2+50]))

