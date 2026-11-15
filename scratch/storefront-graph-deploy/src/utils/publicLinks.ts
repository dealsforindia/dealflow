import type { PublicDeal } from '../types';

// The public website uses its own origin. Only shopper endpoints are proxied.
export const PUBLIC_API_BASE = '';
export const PUBLIC_EDGE_BASE = '/feed-fallback';
const API_HOSTS = new Set(['api.rudranil.me', '74.225.250.0']);

export function publicStoreUrl(value: string): string {
  if (!value || !/^(?:https?:\/\/|\/out\/[a-zA-Z0-9_-]{1,100}(?:[?#]|$))/i.test(value)) return '';
  try {
    const parsed = new URL(value, 'https://indiadealhunts.vercel.app');
    if (!['http:', 'https:'].includes(parsed.protocol)) return '';
    if (API_HOSTS.has(parsed.hostname)) {
      const redirect = parsed.pathname.match(/^\/r\/([a-zA-Z0-9_-]+)\/?$/);
      if (redirect) return `/out/${redirect[1]}${parsed.search}`;
      return '';
    }
    return value.startsWith('/') && !value.startsWith('//') ? `${parsed.pathname}${parsed.search}${parsed.hash}` : parsed.href;
  } catch { return ''; }
}

export function lookupTargetUrl(value: string): string {
  try {
    const parsed = new URL(value, typeof window !== 'undefined' ? window.location.origin : 'https://www.indiadealhunts.me');
    const match = parsed.pathname.match(/^\/out\/([a-zA-Z0-9_-]+)\/?$/);
    return match && ['indiadealhunts.me', 'www.indiadealhunts.me', 'indiadealhunts.vercel.app', 'indiadealhunts.com', '127.0.0.1', 'localhost'].includes(parsed.hostname) ? `https://api.rudranil.me/r/${match[1]}${parsed.search}` : value;
  } catch { return value; }
}

export function isAssetUrl(url: string): boolean {
  if (!url) return false;
  const low = url.toLowerCase();
  return (
    low.includes('.css') ||
    low.includes('.js') ||
    low.includes('static-assets-web.flixcart.com') ||
    low.includes('rukminim1.flixcart.com') ||
    low.includes('rukminim2.flixcart.com')
  );
}

export function sanitizeStoreUrl(value: string, title?: string, store?: string): string {
  if (!value) return '';
  if (isAssetUrl(value)) {
    if (store?.toLowerCase().includes('amazon')) {
      return `https://www.amazon.in/s?k=${encodeURIComponent(title || 'deals')}&tag=rudranil0a-21`;
    }
    return `https://www.flipkart.com/search?q=${encodeURIComponent(title || 'deals')}`;
  }
  return value;
}

export function publicDeal(deal: PublicDeal): PublicDeal {
  const resolvedImage = deal.image || (deal as any).uploaded_img_url || (deal as any).uploadedImgUrl || (deal as any).img_url || null;
  const rawStore = deal.store || 'Store';
  const cleanStore = /static[\s_-]?assets/i.test(rawStore) ? 'Flipkart' : rawStore;
  const rawUrl = sanitizeStoreUrl(deal.url, deal.title, cleanStore);
  return {
    ...deal,
    store: cleanStore,
    image: resolvedImage,
    url: publicStoreUrl(rawUrl),
    ...(Array.isArray(deal.items) ? { items: deal.items.map(item => ({ ...item, buy_url: publicStoreUrl(sanitizeStoreUrl(item.buy_url, (item as any).title || deal.title, cleanStore)) })) } : {}),
    ...(deal.arbitrage ? { arbitrage: { ...deal.arbitrage, stores: Array.isArray(deal.arbitrage.stores) ? deal.arbitrage.stores.map(store => ({ ...store, ...(store.url ? { url: publicStoreUrl(sanitizeStoreUrl(store.url, deal.title, store.store || cleanStore)) } : {}) })) : [] } } : {}),
  };
}

export function publicShareUrl(value: string): string {
  const link = publicStoreUrl(value);
  return link.startsWith('/') ? `${typeof window === 'undefined' ? 'https://www.indiadealhunts.me' : window.location.origin}${link}` : link;
}

/** Hide unfinished template records without inventing replacement product data. */
export function isDisplayableOffer(deal: Pick<PublicDeal, 'title' | 'url' | 'status'>): boolean {
  const title = typeof deal.title === 'string' ? deal.title.trim() : '';
  return !!title && !/\{\{?\s*(?:title|product(?:_name)?|name)\s*\}?\}|^\s*(?:undefined|null|test (?:deal|product)|sample product|placeholder)\s*$/i.test(title)
    && !['rejected', 'pending', 'pending_approval', 'deleted', 'unpublished'].includes(deal.status || '')
    && !!publicStoreUrl(deal.url);
}

export function selectTickerDeals(deals: PublicDeal[] = []): PublicDeal[] {
  const seen = new Set<string>();
  return deals.filter(deal => {
    if (!deal.id || seen.has(deal.id) || !isDisplayableOffer(deal) || !Number.isFinite(deal.price) || !(Number(deal.price) > 0) || deal.is_expired || deal.is_over || deal.status === 'expired') return false;
    seen.add(deal.id);
    return true;
  }).slice(0, 12);
}
