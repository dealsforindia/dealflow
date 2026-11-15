import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  ExternalLink,
  TrendingDown,
  Sparkles,
  ShoppingBag,
  Store,
  Layers,
  CheckCircle2,
  RefreshCw,
  Clock,
  ArrowUpRight,
  Filter,
  ShieldCheck,
  Grid,
  List as ListIcon,
  Image as ImageIcon
} from 'lucide-react';
import { PUBLIC_API_BASE, publicStoreUrl, lookupTargetUrl } from '../utils/publicLinks';
import { openSmartStoreLink, extractAmazonAsin, generateSubId } from '../utils/affiliateEngine';
import { ProductPriceHistory } from './ProductPriceHistory';
import { CardReviewEvidence } from './CardReviewEvidence';

export interface DiscoveredStoreOffer {
  id: string;
  title: string;
  price: number | null;
  mrp: number | null;
  discount_pct: number | null;
  store: string;
  image: string | null;
  url: string;
  raw_url: string;
  has_price_history?: boolean;
  history?: Array<[number, number]>;
  is_lowest_price?: boolean;
  affiliate_applied?: boolean;
  source_type?: string;
  price_verified?: boolean;
  in_stock?: boolean;
  last_checked_at?: number;
}

interface GoogleShoppingDiscoveryModalProps {
  isOpen: boolean;
  initialQuery?: string;
  onClose: () => void;
  onOpenLookup?: (url: string) => void;
  onShowToast?: (msg: string) => void;
}

const STORE_CONFIG: Record<string, { bg: string; text: string; border: string; btn: string; icon: string }> = {
  flipkart: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800', btn: 'bg-blue-600 hover:bg-blue-700', icon: '⚡' },
  amazon: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-800 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800', btn: 'bg-amber-600 hover:bg-amber-700', icon: '📦' },
  myntra: { bg: 'bg-pink-50 dark:bg-pink-950/40', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-200 dark:border-pink-800', btn: 'bg-pink-600 hover:bg-pink-700', icon: '👗' },
  croma: { bg: 'bg-cyan-50 dark:bg-cyan-950/40', text: 'text-cyan-800 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800', btn: 'bg-cyan-600 hover:bg-cyan-700', icon: '💻' },
  ajio: { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800', btn: 'bg-purple-600 hover:bg-purple-700', icon: '👠' },
  swiggy: { bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800', btn: 'bg-orange-600 hover:bg-orange-700', icon: '🛵' },
  blinkit: { bg: 'bg-yellow-50 dark:bg-yellow-950/40', text: 'text-yellow-800 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-800', btn: 'bg-yellow-600 hover:bg-yellow-700', icon: '⚡' },
  jiomart: { bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800', btn: 'bg-teal-600 hover:bg-teal-700', icon: '🛒' },
  tatacliq: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800', btn: 'bg-rose-600 hover:bg-rose-700', icon: '✨' },
};

function getStoreConfig(store: string) {
  const s = (store || '').toLowerCase();
  for (const [key, config] of Object.entries(STORE_CONFIG)) {
    if (s.includes(key)) return config;
  }
  return { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-800 dark:text-slate-200', border: 'border-slate-300 dark:border-slate-700', btn: 'bg-slate-800 hover:bg-slate-900', icon: '🛍️' };
}

export const GoogleShoppingDiscoveryModal: React.FC<GoogleShoppingDiscoveryModalProps> = ({
  isOpen,
  initialQuery = '',
  onClose,
  onOpenLookup,
  onShowToast,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [offers, setOffers] = useState<DiscoveredStoreOffer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [storeFilter, setStoreFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'lowest' | 'discount' | 'relevance'>('lowest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedHistoryOfferId, setExpandedHistoryOfferId] = useState<string | null>(null);
  const [pasteUrlInput, setPasteUrlInput] = useState('');

  const requestRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync initial query when modal opens
  useEffect(() => {
    if (isOpen) {
      const targetQuery = initialQuery.trim() || 'cashew';
      setQuery(targetQuery);
      setActiveQuery(targetQuery);
      fetchGoogleShoppingOffers(targetQuery);
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      requestRef.current?.abort();
      setExpandedHistoryOfferId(null);
    }
  }, [isOpen, initialQuery]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Core Data Fetcher: queries /api/v1/search/external & /api/v1/deals/external-search
  const fetchGoogleShoppingOffers = async (searchTarget: string) => {
    const q = searchTarget.trim();
    if (!q || q.length < 2) return;

    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;

    setLoading(true);
    setError(null);
    setExpandedHistoryOfferId(null);

    const toNumber = (val: unknown): number | null => {
      const n = typeof val === 'number' ? val : Number(val);
      return Number.isFinite(n) && n > 0 ? n : null;
    };

    try {
      // Run parallel requests: Google Shopping search + live multi-store crawler
      const [gRes, extRes] = await Promise.allSettled([
        fetch(`${PUBLIC_API_BASE}/api/v1/search/external?q=${encodeURIComponent(q)}&limit=16`, {
          signal: controller.signal,
          cache: 'no-store'
        }),
        fetch(`${PUBLIC_API_BASE}/api/v1/deals/external-search?q=${encodeURIComponent(q)}&limit=24`, {
          signal: controller.signal,
          cache: 'no-store'
        })
      ]);

      if (controller.signal.aborted) return;

      const mergedMap = new Map<string, DiscoveredStoreOffer>();

      // 1. Process Google Shopping results
      if (gRes.status === 'fulfilled' && gRes.value.ok) {
        try {
          const gData = await gRes.value.json();
          const items = Array.isArray(gData.results) ? gData.results : Array.isArray(gData.deals) ? gData.deals : [];
          items.forEach((item: any, idx: number) => {
            const rawUrl = String(item.raw_url || item.google_link || item.url || '');
            const targetUrl = publicStoreUrl(item.aff_url || item.url || rawUrl);
            const key = rawUrl.toLowerCase().split('?')[0] || `gshop-${idx}`;
            mergedMap.set(key, {
              id: `gshop-${idx}-${Date.now()}`,
              title: String(item.title || 'Product Match'),
              price: toNumber(item.price),
              mrp: toNumber(item.mrp),
              discount_pct: toNumber(item.discount_pct),
              store: String(item.store || 'Google Shopping'),
              image: item.image || null,
              url: targetUrl,
              raw_url: rawUrl,
              has_price_history: Boolean(item.has_price_history),
              history: Array.isArray(item.history) ? item.history : [],
              affiliate_applied: Boolean(item.affiliate_applied),
              source_type: 'google_shopping_search',
              price_verified: Boolean(item.price_verified),
              in_stock: item.in_stock === true ? true : item.in_stock === false ? false : undefined,
              last_checked_at: item.last_checked_at || undefined,
            });
          });
        } catch (e) {
          console.warn('Error parsing Google Shopping response:', e);
        }
      }

      // 2. Process Multi-Store Live Crawler results
      if (extRes.status === 'fulfilled' && extRes.value.ok) {
        try {
          const extData = await extRes.value.json();
          const deals = Array.isArray(extData.deals) ? extData.deals : [];
          deals.forEach((deal: any, idx: number) => {
            const rawUrl = String(deal.raw_url || deal.canonical_url || deal.url || '');
            const key = rawUrl.toLowerCase().split('?')[0] || `ext-${idx}`;
            if (!mergedMap.has(key)) {
              mergedMap.set(key, {
                id: String(deal.id || `ext-${idx}-${Date.now()}`),
                title: String(deal.title || deal.product_name || 'Store Match'),
                price: toNumber(deal.price ?? deal.sale_price),
                mrp: toNumber(deal.mrp ?? deal.regular_price),
                discount_pct: toNumber(deal.discount_pct ?? deal.discount),
                store: String(deal.store || 'Store'),
                image: deal.image || deal.image_url || deal.thumbnail || null,
                url: publicStoreUrl(deal.aff_url || deal.url || rawUrl),
                raw_url: rawUrl,
                has_price_history: Boolean(deal.has_price_history),
                history: Array.isArray(deal.history) ? deal.history : [],
                affiliate_applied: Boolean(deal.affiliate_applied),
                source_type: 'live_store_crawler',
                price_verified: deal.price_verified === true,
                in_stock: deal.in_stock,
                last_checked_at: deal.last_checked_at,
              });
            }
          });
        } catch (e) {
          console.warn('Error parsing external search deals:', e);
        }
      }

      const list = Array.from(mergedMap.values());

      if (list.length === 0) {
        setError(`No live shopping offers found for “${q}”. Try a broader brand name, model, or check product link.`);
      } else {
        // Tag the lowest price offer
        const validPriced = list.filter(o => o.price && o.price > 0);
        if (validPriced.length > 0) {
          const lowest = Math.min(...validPriced.map(o => o.price as number));
          list.forEach(o => {
            if (o.price === lowest) o.is_lowest_price = true;
          });
        }
      }

      setOffers(list);
    } catch (err: unknown) {
      if (controller.signal.aborted) return;
      console.error('Google Shopping Discovery error:', err);
      setError('Shopping radar scan was interrupted. Retry or search individual stores below.');
      setOffers([]);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setActiveQuery(query.trim());
      fetchGoogleShoppingOffers(query.trim());
    }
  };

  const handlePasteCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const url = pasteUrlInput.trim();
    if (!url) return;
    onOpenLookup?.(url);
    onClose();
  };

  // Distinct Stores List for filters
  const storeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: offers.length };
    offers.forEach(o => {
      const s = (o.store || 'Other').toLowerCase();
      const matchedKey = Object.keys(STORE_CONFIG).find(k => s.includes(k)) || 'other';
      counts[matchedKey] = (counts[matchedKey] || 0) + 1;
    });
    return counts;
  }, [offers]);

  // Filtered & Sorted Offers
  const processedOffers = useMemo(() => {
    let result = [...offers];

    if (storeFilter !== 'all') {
      result = result.filter(o => {
        const s = (o.store || '').toLowerCase();
        if (storeFilter === 'other') {
          return !Object.keys(STORE_CONFIG).some(k => s.includes(k));
        }
        return s.includes(storeFilter);
      });
    }

    if (sortBy === 'lowest') {
      result.sort((a, b) => {
        if (!a.price) return 1;
        if (!b.price) return -1;
        return a.price - b.price;
      });
    } else if (sortBy === 'discount') {
      result.sort((a, b) => (b.discount_pct || 0) - (a.discount_pct || 0));
    }

    return result;
  }, [offers, storeFilter, sortBy]);

  // Lowest Price Spotlight
  const lowestPriceOffer = useMemo(() => {
    const valid = offers.filter(o => o.price && o.price > 0);
    if (valid.length === 0) return null;
    return valid.reduce((min, cur) => ((cur.price || Infinity) < (min.price || Infinity) ? cur : min), valid[0]);
  }, [offers]);

  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set());

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-5xl rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-[#0D1527]/95 text-slate-900 dark:text-[#F1F5F9] shadow-2xl backdrop-blur-xl flex flex-col max-h-[92vh] overflow-hidden z-10"
        >
          {/* ── 1. Top Header Banner ── */}
          <div className="border-b border-slate-200/80 dark:border-white/10 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-[#0D1527] dark:via-[#111C33] dark:to-[#0D1527] p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Vibrant Google Colors Shopping Badge */}
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-500 via-rose-500 to-amber-400 p-0.5 shadow-md">
                  <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-white dark:bg-[#0D1527]">
                    <ShoppingBag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-heading text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      Google Shopping & Pan-India Radar
                    </h2>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      IN-APP DISCOVERY
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Live server-side price comparison across Amazon, Flipkart, Myntra, Croma, & 10+ stores without leaving the PWA.
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111C33] text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#172440] transition cursor-pointer shadow-xs"
                aria-label="Close Google Shopping Radar"
              >
                <X size={18} />
              </button>
            </div>

            {/* In-Modal Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="mt-4 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Scan product across stores (e.g. Cashew 1kg, OnePlus Nord, Sony Headphones)..."
                  className="w-full rounded-2xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#070A11] pl-10 pr-10 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 shadow-xs"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:shadow-lg transition cursor-pointer shrink-0"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span>Scan Stores</span>
              </button>
            </form>
          </div>

          {/* ── 2. Telemetry & Lowest Price Spotlight ── */}
          {lowestPriceOffer && lowestPriceOffer.price && offers.length > 0 && !loading && (
            <div className="px-4 sm:px-6 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-300 dark:border-emerald-600/40 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-emerald-950/30 p-3.5 sm:p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-lg shadow-sm">
                    🏆
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                        Pan-India Lowest Listed Price
                      </span>
                      <span className="rounded-full bg-emerald-200 dark:bg-emerald-900/60 px-2 py-0.5 text-[10px] font-bold text-emerald-900 dark:text-emerald-200">
                        {lowestPriceOffer.store}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1 max-w-xl">
                      {lowestPriceOffer.title} · <span className="font-black text-emerald-700 dark:text-emerald-400 text-sm">₹{Math.round(lowestPriceOffer.price).toLocaleString('en-IN')}</span>
                      {lowestPriceOffer.mrp && lowestPriceOffer.mrp > lowestPriceOffer.price && (
                        <span className="text-slate-500 font-normal line-through ml-1 text-xs">
                          ₹{Math.round(lowestPriceOffer.mrp).toLocaleString('en-IN')}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openSmartStoreLink(lowestPriceOffer.url, lowestPriceOffer.store, extractAmazonAsin(lowestPriceOffer.raw_url) || undefined, false, generateSubId('gshop_modal', lowestPriceOffer.id))}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white transition shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
                >
                  ⚡ Claim on {lowestPriceOffer.store} ↗
                </button>
              </div>
            </div>
          )}

          {/* ── 3. Filters and Sorting Toolbar ── */}
          <div className="px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-white/10 text-xs">
            {/* Merchant Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { key: 'all', label: `All Stores (${offers.length})` },
                { key: 'flipkart', label: `Flipkart ${storeCounts.flipkart ? `(${storeCounts.flipkart})` : ''}`, show: Boolean(storeCounts.flipkart) },
                { key: 'amazon', label: `Amazon ${storeCounts.amazon ? `(${storeCounts.amazon})` : ''}`, show: Boolean(storeCounts.amazon) },
                { key: 'myntra', label: `Myntra ${storeCounts.myntra ? `(${storeCounts.myntra})` : ''}`, show: Boolean(storeCounts.myntra) },
                { key: 'croma', label: `Croma ${storeCounts.croma ? `(${storeCounts.croma})` : ''}`, show: Boolean(storeCounts.croma) },
                { key: 'other', label: `Other Merchants ${storeCounts.other ? `(${storeCounts.other})` : ''}`, show: Boolean(storeCounts.other) },
              ].filter(item => item.show !== false).map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStoreFilter(key)}
                  className={`rounded-xl px-2.5 py-1 font-bold transition cursor-pointer ${
                    storeFilter === key
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                      : 'border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#111C33] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#172440]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Sort Dropdown & View Mode */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 font-bold text-slate-500">
                <span>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#111C33] px-2 py-1 text-slate-800 dark:text-slate-200 font-bold outline-hidden cursor-pointer"
                >
                  <option value="lowest">Lowest Price</option>
                  <option value="discount">Highest Discount %</option>
                  <option value="relevance">Source Relevance</option>
                </select>
              </label>

              <div className="flex items-center rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#111C33] p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1 rounded-md transition ${viewMode === 'grid' ? 'bg-white dark:bg-[#1B2947] text-blue-600 shadow-2xs' : 'text-slate-400'}`}
                  title="Grid view"
                >
                  <Grid size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-1 rounded-md transition ${viewMode === 'list' ? 'bg-white dark:bg-[#1B2947] text-blue-600 shadow-2xs' : 'text-slate-400'}`}
                  title="List view"
                >
                  <ListIcon size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* ── 4. Main Offers Body ── */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Loading State */}
            {loading && (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-ping" />
                  <div className="h-12 w-12 rounded-full border-3 border-blue-600 border-t-transparent animate-spin" />
                  <ShoppingBag className="absolute h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-white">
                  Scanning Pan-India Google Shopping Index…
                </h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  Checking Amazon, Flipkart, Myntra, Croma, and verified Indian merchants for “{activeQuery}”.
                </p>
              </div>
            )}

            {/* Error / Empty State */}
            {!loading && (error || processedOffers.length === 0) && (
              <div className="py-10 px-6 text-center max-w-lg mx-auto rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-[#111C33]/60 p-6">
                <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 text-xl mb-3">
                  🔍
                </div>
                <h3 className="font-heading font-black text-slate-900 dark:text-white text-base">
                  {error ? 'Search Notice' : 'No Offers Discovered'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 leading-relaxed">
                  {error || `We couldn't find matching store offers for “${activeQuery}”. You can paste an exact product link below to verify price history.`}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setQuery('cashew 1kg'); setActiveQuery('cashew 1kg'); fetchGoogleShoppingOffers('cashew 1kg'); }}
                    className="rounded-xl border border-slate-300 dark:border-white/20 bg-white dark:bg-[#172440] px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100"
                  >
                    Try &ldquo;Cashew 1kg&rdquo;
                  </button>
                  <button
                    type="button"
                    onClick={() => { setQuery('OnePlus Nord'); setActiveQuery('OnePlus Nord'); fetchGoogleShoppingOffers('OnePlus Nord'); }}
                    className="rounded-xl border border-slate-300 dark:border-white/20 bg-white dark:bg-[#172440] px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100"
                  >
                    Try &ldquo;OnePlus Nord&rdquo;
                  </button>
                </div>
              </div>
            )}

            {/* Results Grid / List */}
            {!loading && processedOffers.length > 0 && (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5' : 'flex flex-col gap-2.5'}>
                {processedOffers.map((offer) => {
                  const sc = getStoreConfig(offer.store);
                  const isHistoryExpanded = expandedHistoryOfferId === offer.id;
                  const asin = extractAmazonAsin(offer.raw_url || offer.url);

                  return (
                    <article
                      key={offer.id}
                      className={`relative flex flex-col justify-between rounded-2xl border transition-all duration-200 ${
                        offer.is_lowest_price
                          ? 'border-emerald-300 dark:border-emerald-600/50 bg-gradient-to-b from-emerald-50/40 via-white to-white dark:from-emerald-950/20 dark:via-[#0D1527] dark:to-[#0D1527] shadow-md ring-1 ring-emerald-300/40'
                          : 'border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0D1527] hover:border-slate-300 dark:hover:border-white/20 shadow-xs hover:shadow-md'
                      } p-3.5`}
                    >
                      {/* Top Brand Pill & Lowest Price Tag */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-bold ${sc.bg} ${sc.text} ${sc.border}`}>
                            <span>{sc.icon}</span>
                            <span>{offer.store}</span>
                          </span>
                          {offer.is_lowest_price && (
                            <span className="rounded-lg bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white shadow-2xs">
                              LOWEST
                            </span>
                          )}
                        </div>

                        {offer.has_price_history && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 px-1.5 py-0.5 text-[9.5px] font-bold text-purple-700 dark:text-purple-300">
                            <TrendingDown size={10} />
                            Trend Tracked
                          </span>
                        )}
                      </div>

                      {/* Content Area: Thumbnail + Title */}
                      <div className="flex gap-3">
                        <div className="h-18 w-18 shrink-0 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#111C33] p-1 flex items-center justify-center overflow-hidden">
                          {offer.image && !failedImages.has(offer.id) ? (
                            <img
                              src={offer.image}
                              alt={offer.title}
                              className="h-full w-full object-contain"
                              onError={() => {
                                setFailedImages(prev => new Set([...prev, offer.id]));
                              }}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-center p-1">
                              <span className="text-xl mb-0.5">{sc.icon}</span>
                              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">{offer.store}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-heading text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug" title={offer.title}>
                            {offer.title}
                          </h4>

                          <CardReviewEvidence id={offer.id} url={offer.raw_url || offer.url} title={offer.title} />
                          {/* Pricing */}
                          <div className="mt-1.5 flex items-baseline gap-1.5">
                            {offer.price ? (
                              <span className="font-mono text-base font-black text-slate-900 dark:text-emerald-400">
                                ₹{Math.round(offer.price).toLocaleString('en-IN')}
                              </span>
                            ) : (
                              <span className="text-xs font-mono font-bold text-slate-500">
                                Check store price
                              </span>
                            )}

                            {offer.mrp && offer.price && offer.mrp > offer.price && (
                              <span className="font-mono text-[11px] text-slate-400 line-through">
                                ₹{Math.round(offer.mrp).toLocaleString('en-IN')}
                              </span>
                            )}

                            {offer.discount_pct && offer.discount_pct > 0 ? (
                              <span className="rounded-sm bg-rose-50 dark:bg-rose-950/60 px-1 py-0.2 text-[10px] font-black text-rose-600 dark:text-rose-400">
                                {offer.discount_pct}% OFF
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {/* Inline Price History Expander */}
                      {isHistoryExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/10">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-mono font-bold text-slate-500">
                              Verified 90-Day Trend
                            </span>
                            <button
                              type="button"
                              onClick={() => setExpandedHistoryOfferId(null)}
                              className="text-[10px] font-bold text-slate-400 hover:text-slate-600"
                            >
                              Close
                            </button>
                          </div>
                          <ProductPriceHistory url={offer.raw_url || offer.url} currentPrice={offer.price ?? undefined} />
                        </div>
                      )}

                      {/* Actions Toolbar */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              if (isHistoryExpanded) {
                                setExpandedHistoryOfferId(null);
                              } else if (offer.raw_url || offer.url) {
                                setExpandedHistoryOfferId(offer.id);
                              }
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#111C33] hover:bg-slate-100 dark:hover:bg-[#172440] px-2 py-1 text-[10px] font-bold text-slate-700 dark:text-slate-300 transition"
                            title="Inspect 90-day price trend"
                          >
                            <TrendingDown size={11} />
                            <span>{isHistoryExpanded ? 'Hide History' : 'History'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              onOpenLookup?.(offer.raw_url || offer.url);
                              onClose();
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#111C33] hover:bg-slate-100 dark:hover:bg-[#172440] px-2 py-1 text-[10px] font-bold text-slate-700 dark:text-slate-300 transition"
                            title="Deep verify on Deal Lookup"
                          >
                            <ShieldCheck size={11} />
                            <span>Deep Check</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            openSmartStoreLink(
                              offer.url,
                              offer.store,
                              asin || undefined,
                              false,
                              generateSubId('gshop_card', offer.id)
                            );
                            onShowToast?.(`Opening ${offer.store} with best price…`);
                          }}
                          className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold text-white transition shadow-2xs hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${sc.btn}`}
                        >
                          <span>Claim on {offer.store}</span>
                          <ArrowUpRight size={12} />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── 5. Bottom Verification Strip & Direct Link Lookup ── */}
          <div className="border-t border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-[#070A11] p-3 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <form onSubmit={handlePasteCheck} className="flex-1 flex items-center gap-2 max-w-xl">
                <input
                  type="url"
                  value={pasteUrlInput}
                  onChange={(e) => setPasteUrlInput(e.target.value)}
                  placeholder="Paste any product URL from Google Shopping, Amazon, Flipkart, etc..."
                  className="flex-1 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0D1527] px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={!pasteUrlInput.trim()}
                  className="rounded-xl bg-slate-900 hover:bg-blue-600 disabled:opacity-50 px-3 py-1.5 text-xs font-bold text-white transition shrink-0 cursor-pointer"
                >
                  Verify URL
                </button>
              </form>

              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={13} className="text-emerald-500" />
                  Merchant Checkout Verified
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="font-bold text-slate-700 dark:text-slate-300 hover:underline cursor-pointer"
                >
                  Close Radar
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
