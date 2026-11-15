import sys

path = r'rudranil-deals-web/src/components/ProductSpecCompareModal.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace getProductAttributes price calculations
text = text.replace(
    'const cardCashback = Math.round(deal.price * 0.05);',
    'const cleanPrice = Number(deal.price ?? deal.sale_price ?? deal.prices?.sale) || 0;\n  const cardCashback = Math.round(cleanPrice * 0.05);'
)
text = text.replace('deal.price - cardCashback', 'cleanPrice - cardCashback')
text = text.replace('deal.price >= 1500', 'cleanPrice >= 1500')
text = text.replace('deal.price - deal.price / 1.18', 'cleanPrice - cleanPrice / 1.18')
text = text.replace('deal.price - gstItc', 'cleanPrice - gstItc')
text = text.replace(': deal.price;', ': cleanPrice;')

text = text.replace(
    'const lowestPrice = deals.length > 0 ? Math.min(...deals.map((d) => d.price)) : 0;',
    'const lowestPrice = deals.length > 0 ? Math.min(...deals.map((d) => Number(d.price ?? d.sale_price ?? d.prices?.sale) || 0)) : 0;'
)

text = text.replace(
    '<span className="text-lg font-black text-slate-900 dark:text-[#F1F5F9]">₹{deal.price.toLocaleString(\'en-IN\')}</span>',
    '''{(() => {
                            const p = Number(deal.price ?? deal.sale_price ?? deal.prices?.sale) || 0;
                            return <span className="text-lg font-black text-slate-900 dark:text-[#F1F5F9]">{p > 0 ? `₹${p.toLocaleString('en-IN')}` : 'Check store'}</span>;
                          })()}'''
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated ProductSpecCompareModal.tsx successfully!")
