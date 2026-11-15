import { PublicDeal } from '../types';

export interface StorePriceQuote {
  store: string;
  price?: number;
  mrp?: number;
  isVerifiedDeal: boolean;
  statusText: string;
  url: string;
  badge: string;
  actionText: string;
}

export interface ArbitrageAnalysis {
  sourceStore: string;
  dealPrice: number;
  mrp?: number;
  savingsVsMrp: number;
  discountPct: number;
  quotes: StorePriceQuote[];
  verdict: string;
}

/**
 * Returns genuine multi-store comparison and live verification links.
 * Never invents or fabricates fake competitor prices.
 */
export function analyzeArbitrage(deal: Partial<PublicDeal>): ArbitrageAnalysis {
  const currentStore = (deal.store || 'Source store').toLowerCase();
  const currentPrice = Number(deal.price) || 0;
  const mrp = Number(deal.mrp && deal.mrp > currentPrice ? deal.mrp : 0);
  const savingsVsMrp = mrp > currentPrice ? mrp - currentPrice : 0;
  const discountPct = Number(deal.discount_pct) || (mrp > 0 ? Math.round(((mrp - currentPrice) / mrp) * 100) : 0);

  const title = (deal.title || '').trim();
  const cleanTitle = title
    .replace(/[\[\]()]/g, '')
    .replace(/\b(\d+%\s*off|loot|deal|discount|cheapest|lowest)\b/gi, '')
    .trim();
  const query = encodeURIComponent(cleanTitle || 'deals');

  const isFlipkart = currentStore.includes('flipkart');
  const isAmazon = currentStore.includes('amazon');
  const isMyntra = currentStore.includes('myntra');
  const isAjio = currentStore.includes('ajio');
  const isBlinkit = currentStore.includes('blinkit');
  const isSwiggy = currentStore.includes('swiggy');

  // Detect domain for store relevance
  const titleLower = title.toLowerCase();
  const catLower = (deal.category || '').toLowerCase();
  const isFashion = /\b(shirt|t-shirt|shoes|sneakers|jeans|dress|saree|kurta|trousers|sandals|handbag|watch)\b/i.test(titleLower) || catLower.includes('fashion');
  const isGrocery = /\b(atta|oil|rice|dal|tea|coffee|soap|biscuit|face wash|shampoo|detergent)\b/i.test(titleLower) || catLower.includes('grocery');

  const quotes: StorePriceQuote[] = [];

  // 1. Current Verified Deal Source
  let sourceDisplayName = 'Source store';
  if (isAmazon) sourceDisplayName = 'Amazon India';
  else if (isFlipkart) sourceDisplayName = 'Flipkart';
  else if (isMyntra) sourceDisplayName = 'Myntra';
  else if (isAjio) sourceDisplayName = 'AJIO';
  else if (isBlinkit) sourceDisplayName = 'Blinkit';
  else if (isSwiggy) sourceDisplayName = 'Swiggy Instamart';
  else if (deal.store) sourceDisplayName = deal.store;

  quotes.push({
    store: sourceDisplayName,
    price: currentPrice > 0 ? currentPrice : undefined,
    mrp: mrp > 0 ? mrp : undefined,
    isVerifiedDeal: currentPrice > 0,
    statusText: currentPrice > 0 ? 'Source-reported price' : 'Price not confirmed',
    url: deal.url || '#',
    badge: 'Source listing',
    actionText: 'Open store',
  });

  // 2. Competitor Check 1: Amazon (if source is not Amazon)
  if (!isAmazon) {
    quotes.push({
      store: 'Amazon India',
      isVerifiedDeal: false,
      statusText: 'Live Search Comparison',
      url: `https://www.amazon.in/s?k=${query}&tag=rudranil0a-21`,
      badge: '🔍 Live Catalog Search',
      actionText: 'Check Amazon ↗',
    });
  }

  // 3. Competitor Check 2: Flipkart (if source is not Flipkart)
  if (!isFlipkart) {
    quotes.push({
      store: 'Flipkart',
      isVerifiedDeal: false,
      statusText: 'Live Search Comparison',
      url: `https://www.flipkart.com/search?q=${query}`,
      badge: '🔍 Live Catalog Search',
      actionText: 'Check Flipkart ↗',
    });
  }

  // 4. Competitor Check 3: Domain-specific store
  if (isFashion && !isMyntra) {
    quotes.push({
      store: 'Myntra',
      isVerifiedDeal: false,
      statusText: 'Fashion Catalog Check',
      url: `https://www.myntra.com/${encodeURIComponent(cleanTitle.replace(/\s+/g, '-'))}`,
      badge: '👗 Fashion Store',
      actionText: 'Check Myntra ↗',
    });
  } else if (isFashion && !isAjio) {
    quotes.push({
      store: 'AJIO',
      isVerifiedDeal: false,
      statusText: 'Apparel Catalog Check',
      url: `https://www.ajio.com/search/?text=${query}`,
      badge: '👠 Trend Store',
      actionText: 'Check AJIO ↗',
    });
  } else if (isGrocery && !isBlinkit) {
    quotes.push({
      store: 'Blinkit 10-Min',
      isVerifiedDeal: false,
      statusText: 'Quick Commerce Check',
      url: `https://blinkit.com/s/?q=${query}`,
      badge: '⚡ 10-Min Delivery',
      actionText: 'Check Blinkit ↗',
    });
  } else {
    // Universal Google Shopping comparison
    quotes.push({
      store: 'Google Shopping',
      isVerifiedDeal: false,
      statusText: 'Pan-India Multi-Merchant Check',
      url: `https://www.google.com/search?tbm=shop&q=${query}`,
      badge: '🌐 Multi-Store Index',
      actionText: 'Pan-India Radar (In-App)',
    });
  }

  const verdict = currentPrice <= 0 ? 'Current merchant price is not confirmed. Open the store listing to check it.' : discountPct > 0
    ? `Source-reported price on ${sourceDisplayName} is ₹${currentPrice.toLocaleString('en-IN')}${mrp > 0 ? ` (${discountPct}% below ₹${mrp.toLocaleString('en-IN')} MRP)` : ''}. The links below search alternative stores; exact matching prices are not supplied.`
    : `Source listing on ${sourceDisplayName} at ₹${currentPrice.toLocaleString('en-IN')}. Inspect alternative store listings using the search links below.`;

  return {
    sourceStore: sourceDisplayName,
    dealPrice: currentPrice,
    mrp: mrp > 0 ? mrp : undefined,
    savingsVsMrp,
    discountPct,
    quotes,
    verdict,
  };
}
