with open('rudranil-deals-web/src/App.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

target = '''  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);
  const [isSpecCompareOpen, setIsSpecCompareOpen] = useState(false);
  const [compareDeals, setCompareDeals] = useState<PublicDeal[]>([]);'''

replacement = '''  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        return new URLSearchParams(window.location.search).get('modal') === 'compare';
      }
    } catch {}
    return false;
  });
  const [isSpecCompareOpen, setIsSpecCompareOpen] = useState(false);
  const [compareDeals, setCompareDeals] = useState<PublicDeal[]>(() => {
    try {
      if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('modal') === 'compare') {
        return [
          { id: 'c1', title: 'BOLDFIT DripWave Sneakers', price: 799, mrp: 2999, discount_pct: 73, store: 'Flipkart', category: 'Fashion', url: 'https://flipkart.com/sample', image: 'https://rukminim2.flixcart.com/image/612/612/xif0q/shoe/c/u/1/6-dripwave-boldfit-white-navy-original-imah4e2yggfxkfyh.jpeg' } as any,
          { id: 'c2', title: 'Mustard Magma Smart Watch 1.8 AMOLED', price: 1299, mrp: 4999, discount_pct: 74, store: 'Amazon', category: 'Electronics', url: 'https://amazon.in/sample', image: 'https://m.media-amazon.com/images/I/61y2VVWcGBL._SL1500_.jpg' } as any
        ];
      }
    } catch {}
    return [];
  });'''

assert target in c, 'Target not found in App.tsx'
c = c.replace(target, replacement, 1)

with open('rudranil-deals-web/src/App.tsx', 'w', encoding='utf-8', newline='\r\n') as f:
    f.write(c)

print('App.tsx compare state successfully updated!')

