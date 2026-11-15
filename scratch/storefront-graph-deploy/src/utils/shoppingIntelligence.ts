import { priceFreshness } from './priceEvidence';
export interface IntelligenceOffer {
  id: string; title: string; price: number | null; mrp: number | null;
  store: string; image: string | null; url: string; raw_url?: string;
  source_type?: string; product_id?: string; gtin?: string; has_price_history?: boolean;
  history?: Array<[number, number]>; affiliate_applied?: boolean;
  in_stock?: boolean; last_checked_at?: number; effective_price?: number | null;
  price_verified?: boolean; price_source?: string;
  coupon?: string | null; coupon_discount?: number | null; regular_price?: number | null;
  cluster_count?: number; consensus_badge?: string; posted_at?: number;
}

export const rupees = (value?: number | null) => value != null && value > 0
  ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value)
  : 'Price unavailable';

export function cleanHistory(history?: Array<[number, number]>) {
  const points = (Array.isArray(history) ? history : []).filter(p => Array.isArray(p) && Number.isFinite(p[0]) && p[0] > 0 && Number.isFinite(p[1]) && p[1] > 0)
    .map(([t, p]): [number, number] => [t < 1e12 ? t * 1000 : t, p])
    .filter(([t, p]) => t <= Date.now() + 60000 && p <= 10000000);
  return [...new Map(points.map(p => [p[0], p])).values()].sort((a, b) => a[0] - b[0]);
}

// Conservative matching: merchant IDs or complete normalized titles only.
// Similar words alone cannot establish that two offers have the same variant.
export function validGtin(value?: string) {
  if (!value || !/^(\d{8}|\d{12}|\d{13}|\d{14})$/.test(value) || /^0+$/.test(value)) return false;
  const digits = value.slice(0, -1).split('').reverse().map(Number);
  const sum = digits.reduce((total, digit, i) => total + digit * (i % 2 === 0 ? 3 : 1), 0);
  return (10 - sum % 10) % 10 === Number(value[value.length - 1]);
}

export function productIdentity(offer: IntelligenceOffer) {
  // A checked global barcode can identify the same variant across merchants.
  // Merchant IDs and titles are not global identifiers.
  if (validGtin(offer.gtin)) return `gtin:${offer.gtin!.padStart(14, '0')}`;
  const url = offer.raw_url || offer.url;
  const asin = url.match(/amazon\.[^/]+\/(?:[^?]*\/)?(?:dp|gp\/product)\/([a-z0-9]{10})/i)?.[1];
  if (asin) return `amazon:${asin.toUpperCase()}`;
  const flipkart = url.match(/\/p\/itm([a-z0-9]+)/i)?.[1];
  if (flipkart) {
    let variant = '';
    try { variant = new URL(url).searchParams.get('pid') || ''; } catch { /* URL may be incomplete. */ }
    return `flipkart:${flipkart.toLowerCase()}:${variant}`;
  }
  const store = offer.store.toLowerCase().trim();
  if (offer.product_id) return `product:${store}:${offer.product_id}`;
  const title = offer.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  return title.length > 12 ? `title:${store}:${title}` : `offer:${store}:${offer.id}`;
}

export function offerIdentity(offer: IntelligenceOffer) {
  // Search backends may use positional IDs such as ext_gshop_1. They cannot
  // identify persistent saved offers across unrelated queries.
  try {
    const url = new URL(offer.raw_url || offer.url);
    for (const key of ['tag', 'utm_source', 'utm_medium', 'utm_campaign']) url.searchParams.delete(key);
    return `${offer.store.toLowerCase()}:${url.toString()}`;
  } catch { return `${offer.store.toLowerCase()}:${offer.title.toLowerCase()}:${offer.id}`; }
}

export function groupProducts(offers: IntelligenceOffer[]) {
  const groups = new Map<string, IntelligenceOffer[]>();
  for (const offer of offers) {
    const key = productIdentity(offer);
    const group = groups.get(key) || [];
    const duplicate = group.findIndex(o => offerIdentity(o) === offerIdentity(offer));
    if (duplicate < 0) group.push(offer);
    else {
      const existing = group[duplicate];
      // Preserve the directory identity while adding real evidence from the
      // same merchant offer. Do not merge histories from different variants.
      group[duplicate] = { ...offer, ...existing,
        history: cleanHistory([...(existing.history || []), ...(offer.history || [])]),
        in_stock: existing.in_stock ?? offer.in_stock,
        last_checked_at: existing.last_checked_at ?? offer.last_checked_at,
        affiliate_applied: existing.affiliate_applied ?? offer.affiliate_applied,
      };
    }
    groups.set(key, group);
  }
  return [...groups.entries()].map(([id, offers]) => ({ id, offers: offers.sort((a, b) => (a.price || Infinity) - (b.price || Infinity)) }));
}

export function decisionFor(offer: IntelligenceOffer) {
  const points = cleanHistory(offer.history);
  if (offer.in_stock === false) return { label: 'Unavailable', tone: 'amber', reason: 'The source reports this offer out of stock.' };
  if (!Number.isFinite(offer.price) || !offer.price || offer.price <= 0) return { label: 'Check price', tone: 'amber', reason: 'A current merchant price is required before comparing.' };
  if (!priceFreshness(offer).current) return { label: 'Verify first', tone: 'slate', reason: 'This source price has no recent, confirmed merchant observation. Refresh the price before judging buy timing.' };
  if (points.length < 2) return { label: 'Verify first', tone: 'slate', reason: 'There is not enough recorded history to recommend buy timing.' };
  const low = Math.min(...points.map(p => p[1]));
  if (offer.price <= low) return { label: 'At recorded low', tone: 'emerald', reason: `Current price is at or below the lowest of ${points.length} recorded observations.` };
  if (offer.price > low * 1.1) return { label: 'Consider waiting', tone: 'amber', reason: `This is ${Math.round((offer.price / low - 1) * 100)}% above the recorded low of ${rupees(low)}.` };
  return { label: 'Near recorded low', tone: 'blue', reason: `Within 10% of the recorded low of ${rupees(low)}. Confirm the price at checkout.` };
}

export function parseMission(query: string) {
  const m = query.match(/\b(?:under|below|less than)\s*[₹]?\s*(\d+(?:\.\d+)?)\s*(k|lakh|lac)?\b/i);
  return { budget: m ? Number(m[1]) * (m[2]?.toLowerCase() === 'k' ? 1000 : m[2] ? 100000 : 1) : null,
    product: query.replace(/\b(?:under|below|less than)\s*[₹]?\s*\d+(?:\.\d+)?\s*(?:k|lakh|lac)?\b/i, '').trim() };
}

export function shoppingMatch(query: string, offer: IntelligenceOffer): 'product' | 'related' {
  const intent = parseMission(query).product.toLowerCase();
  const accessoryTerms = /\b(cooler|cooling|fan|fans|motherboard|thermal|paste|power supply|psu|cabinet|case|cable|cables)\b/i;
  const computerTerms = /\b(laptop|pc|assembled|mini tower|mid tower|vivobook|all.in.one)\b/i;
  const desktopComputer = /\bdesktop\b/i.test(offer.title) && (!/\bprocessor\b/i.test(offer.title) || /\b(ram|ssd|hdd)\b/i.test(offer.title));
  const specificallyRelatedQuery = accessoryTerms.test(intent) || computerTerms.test(intent) || /\bdesktop\b/i.test(intent);
  if (/\b(cpu|processor|processors)\b/.test(intent) && !specificallyRelatedQuery && (accessoryTerms.test(offer.title) || computerTerms.test(offer.title) || desktopComputer)) return 'related';
  return 'product';
}

const WATCH_KEY = 'indiadealhunts_watchlist_v1';
export function readWatchlist(): IntelligenceOffer[] {
  try { const data = JSON.parse(localStorage.getItem(WATCH_KEY) || '[]'); return Array.isArray(data) ? data.filter(o => o && typeof o.id === 'string' && typeof o.title === 'string').slice(0, 100) : []; }
  catch { return []; }
}
export function writeWatchlist(offers: IntelligenceOffer[]): boolean {
  try { localStorage.setItem(WATCH_KEY, JSON.stringify(offers.slice(0, 100))); window.dispatchEvent(new Event('idh-watchlist')); return true; }
  catch { return false; }
}
