import React, { useState, useMemo } from 'react';
import type { IntelligenceOffer } from '../utils/shoppingIntelligence';
import {
  extractAmazonAsin,
  buildAmazonCartUrl,
  generateSubId,
  openSmartStoreLink,
  useIsMobile,
} from '../utils/affiliateEngine';
import { openGoogleShoppingModal } from '../utils/googleShopping';

export interface ExternalSearchDeal extends IntelligenceOffer {
  id: string;
  title: string;
  price: number | null;
  mrp: number | null;
  discount_pct: number | null;
  store: string;
  image: string | null;
  url: string;
  raw_url?: string;
  has_price_history?: boolean;
  is_lowest_price?: boolean;
  affiliate_applied?: boolean;
  source_type?: string;
  history_badge?: string;
  verdict?: string;
}

interface ExternalSearchResultsProps {
  query: string;
  deals: ExternalSearchDeal[];
  loading: boolean;
  error?: string | null;
  onCheckHistory?: (url: string) => void;
  onOpenGoogleShopping?: (query: string) => void;
}

const STORE_LINKS = [
  { name: 'Google Shopping', url: (q: string) => `https://www.google.com/search?q=${encodeURIComponent(q)}&udm=28#ip=1`, tone: 'border-slate-300 dark:border-white/20 bg-slate-900 text-white hover:bg-black', icon: '🛍️' },
  { name: 'Amazon India', url: (q: string) => `https://www.amazon.in/s?k=${encodeURIComponent(q)}&tag=rudranil0a-21`, tone: 'border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100', icon: '📦' },
  { name: 'Flipkart', url: (q: string) => `https://www.flipkart.com/search?q=${encodeURIComponent(q)}`, tone: 'border-blue-200 bg-blue-50 text-blue-900 hover:bg-blue-100', icon: '⚡' },
  { name: 'Myntra', url: (q: string) => `https://www.myntra.com/search?q=${encodeURIComponent(q)}`, tone: 'border-pink-200 bg-pink-50 text-pink-900 hover:bg-pink-100', icon: '👗' },
];

const money = (value: number | null) =>
  value == null || value <= 0 ? 'N/A' : `₹${Math.round(value).toLocaleString('en-IN')}`;

const sc = (store: string) => {
  const s = (store || '').toLowerCase();
  if (s.includes('flipkart')) return { badge: 'bg-blue-50 text-blue-700 border-blue-200', btn: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-400' };
  if (s.includes('amazon')) return { badge: 'bg-amber-50 text-amber-800 border-amber-200', btn: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-300' };
  if (s.includes('jiomart')) return { badge: 'bg-teal-50 text-teal-700 border-teal-200', btn: 'bg-teal-600 hover:bg-teal-700 focus:ring-teal-400' };
  if (s.includes('myntra')) return { badge: 'bg-pink-50 text-pink-700 border-pink-200', btn: 'bg-pink-600 hover:bg-pink-700 focus:ring-pink-400' };
  if (s.includes('croma')) return { badge: 'bg-cyan-50 text-cyan-700 border-cyan-200', btn: 'bg-cyan-600 hover:bg-cyan-700 focus:ring-cyan-400' };
  return { badge: 'bg-slate-50 dark:bg-[#070A11] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/10', btn: 'bg-slate-800 hover:bg-slate-900 focus:ring-slate-400' };
};

export const ExternalSearchResults: React.FC<ExternalSearchResultsProps> = ({ query, deals, loading, error, onCheckHistory, onOpenGoogleShopping }) => {
  const isMobile = useIsMobile();
  const cleanQuery = query.trim();
  const [pastedUrl, setPastedUrl] = useState('');
  const [storeFilter, setStoreFilter] = useState<'all' | 'lowest' | 'flipkart' | 'amazon' | 'other'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'matrix'>('cards');

  const { minPriceDeal, priceSpread } = useMemo(() => {
    const valid = deals.filter((d) => d.price && d.price > 0);
    if (!valid.length) return { minPriceDeal: null, priceSpread: 0 };
    const sorted = [...valid].sort((a, b) => (a.price || 0) - (b.price || 0));
    return { minPriceDeal: sorted[0], priceSpread: Math.max(0, (sorted[sorted.length - 1].price || 0) - (sorted[0].price || 0)) };
  }, [deals]);

  const filteredDeals = useMemo(() => {
    if (storeFilter === 'lowest') return deals.filter((d) => minPriceDeal && d.id === minPriceDeal.id);
    if (storeFilter === 'flipkart') return deals.filter((d) => d.store?.toLowerCase().includes('flipkart'));
    if (storeFilter === 'amazon') return deals.filter((d) => d.store?.toLowerCase().includes('amazon'));
    if (storeFilter === 'other') return deals.filter((d) => !d.store?.toLowerCase().includes('flipkart') && !d.store?.toLowerCase().includes('amazon'));
    return deals;
  }, [deals, storeFilter, minPriceDeal]);

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = pastedUrl.trim();
    if (!target) return;
    onCheckHistory?.(target);
    setPastedUrl('');
  };

  if (!cleanQuery) return null;

  const hasDeals = deals.length > 0;
  const hasFk = deals.some((d) => d.store?.toLowerCase().includes('flipkart'));
  const hasAmz = deals.some((d) => d.store?.toLowerCase().includes('amazon'));
  const hasOther = deals.some((d) => !d.store?.toLowerCase().includes('flipkart') && !d.store?.toLowerCase().includes('amazon'));

  return (
    <section className="mt-8 rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-[#0D1527]/95 p-4 sm:p-6 shadow-sm backdrop-blur-md" aria-label="Live multi-store and Google Shopping results">
      {/* Top Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="font-heading text-lg sm:text-xl font-black text-slate-900 dark:text-[#F1F5F9]">
              Store Search & Shopping Discoveries
            </h2>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-700">
              SOURCE-REPORTED OFFERS
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 max-w-2xl">
            Offers returned from the deal directory and external store search for &ldquo;<span className="font-semibold text-slate-700 dark:text-slate-200">{cleanQuery}</span>&rdquo;. Check matching models, history and checkout eligibility before buying.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {hasDeals && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#070A11] px-3 py-1 text-xs font-mono font-bold text-slate-700 dark:text-slate-200 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {deals.length} offers · {new Set(deals.map(d => d.store)).size} stores
            </span>
          )}
          <button
            type="button"
            onClick={() => (onOpenGoogleShopping ? onOpenGoogleShopping(cleanQuery) : openGoogleShoppingModal(cleanQuery))}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs px-3.5 py-1.5 shadow-sm hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
          >
            <span>🛍️ Google Shopping Radar</span>
            <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[9px] font-mono">IN-APP</span>
          </button>
        </div>
      </div>

      {/* Lowest Price Spotlight Hero Callout */}
      {minPriceDeal && minPriceDeal.price && deals.length > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-300 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-xl text-white shadow-xs">
              🏆
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800">
                  Lowest Listed Price in These Results
                </span>
                <span className="rounded-full bg-emerald-200/90 px-2 py-0.5 text-[10px] font-bold text-emerald-900">
                  {minPriceDeal.store}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-[#F8FAFC]">
                Found for <span className="font-black text-emerald-700 text-sm">{money(minPriceDeal.price)}</span>
                {priceSpread > 0 && (
                  <span className="text-slate-600 dark:text-slate-400">
                    {' '}· Prices span different products and variants; this is not a same-product savings comparison.
                  </span>
                )}
              </p>
            </div>
          </div>
          {minPriceDeal.url && (() => {
            const isAmz = (minPriceDeal.store || '').toLowerCase().includes('amazon');
            const asin = isAmz ? extractAmazonAsin(minPriceDeal.url || minPriceDeal.id) : null;
            const subId = generateSubId('hero_search', minPriceDeal.id);
            return (
              <div className="flex items-center gap-2">
                {asin && (
                  <button
                    type="button"
                    onClick={() => {
                      const cartUrl = buildAmazonCartUrl(asin, undefined, subId);
                      openSmartStoreLink(cartUrl, 'amazon', asin, true, subId);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 px-3.5 py-2.5 text-xs font-bold text-white transition shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    title="Add to Amazon cart; confirm the final price there"
                  >
                    🛒 Add to Amazon cart
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => openSmartStoreLink(minPriceDeal.url, minPriceDeal.store, asin || undefined, false, subId)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white transition shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  ⚡ Claim on {minPriceDeal.store} ({money(minPriceDeal.price)}) ↗
                </button>
              </div>
            );
          })()}
        </div>
      )}

      {/* Filter Chips & View Mode Toggle */}
      {hasDeals && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-y border-slate-100 dark:border-white/5 py-3">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: 'all', label: `All Offers (${deals.length})`, cls: 'bg-slate-900 text-white', inactiveCls: 'border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1527] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:bg-[#070A11]' },
              { key: 'lowest', label: '🏆 Lowest Listed Price', cls: 'bg-emerald-600 text-white', inactiveCls: 'border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100' },
            ].map(({ key, label, cls, inactiveCls }) => (
              <button
                key={key}
                type="button"
                onClick={() => setStoreFilter(key as any)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${storeFilter === key ? cls + ' shadow-xs' : inactiveCls}`}
              >
                {label}
              </button>
            ))}
            {hasFk && (
              <button
                type="button"
                onClick={() => setStoreFilter('flipkart')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${storeFilter === 'flipkart'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100'
                  }`}
              >
                ⚡ Flipkart ({deals.filter((d) => d.store?.toLowerCase().includes('flipkart')).length})
              </button>
            )}
            {hasAmz && (
              <button
                type="button"
                onClick={() => setStoreFilter('amazon')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${storeFilter === 'amazon'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
              >
                📦 Amazon ({deals.filter((d) => d.store?.toLowerCase().includes('amazon')).length})
              </button>
            )}
            {hasOther && (
              <button
                type="button"
                onClick={() => setStoreFilter('other')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${storeFilter === 'other'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'border border-purple-200 bg-purple-50 text-purple-800 hover:bg-purple-100'
                  }`}
              >
                🛍️ Google Shopping + More
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-[#111C33] p-1">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${viewMode === 'cards' ? 'bg-white dark:bg-[#0D1527] text-slate-900 dark:text-[#F1F5F9] shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:text-[#F1F5F9]'
                }`}
            >
              Product Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${viewMode === 'matrix' ? 'bg-white dark:bg-[#0D1527] text-slate-900 dark:text-[#F1F5F9] shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:text-[#F1F5F9]'
                }`}
            >
              Comparison Table
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-center gap-2 py-4 text-xs font-bold text-slate-500">
            <span className="h-3 w-3 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
            Requesting available directory and external shopping results...
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2 rounded-2xl border border-slate-100 dark:border-white/5 p-3">
                <div className="h-32 animate-pulse rounded-xl bg-slate-100 dark:bg-[#111C33]" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100 dark:bg-[#111C33]" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-[#111C33]" />
                <div className="h-7 animate-pulse rounded-xl bg-slate-100 dark:bg-[#111C33]" />
              </div>
            ))}
          </div>
        </div>
      ) : !hasDeals ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#070A11] p-6 text-center">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            No direct store offers returned yet for &ldquo;{cleanQuery}&rdquo;. Explore live merchant links or Google Shopping Radar below.
          </p>
        </div>
      ) : viewMode === 'matrix' ? (
        /* Matrix Comparison Table View */
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#070A11]">
                <th className="px-4 py-3 text-left font-black text-slate-700 dark:text-slate-200 w-1/2">Product</th>
                <th className="px-4 py-3 text-center font-black text-slate-700 dark:text-slate-200">Store</th>
                <th className="px-4 py-3 text-right font-black text-slate-700 dark:text-slate-200">Price</th>
                <th className="px-4 py-3 text-right font-black text-slate-700 dark:text-slate-200">MRP</th>
                <th className="px-4 py-3 text-center font-black text-slate-700 dark:text-slate-200">Discount</th>
                <th className="px-4 py-3 text-center font-black text-slate-700 dark:text-slate-200">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeals.map((deal, idx) => {
                const isLowest = Boolean(minPriceDeal && deal.id === minPriceDeal.id);
                const colors = sc(deal.store || '');
                return (
                  <tr
                    key={deal.id}
                    className={`border-b border-slate-50 transition hover:bg-slate-50 dark:hover:bg-[#0E1729]/80 dark:bg-[#070A11]/80 ${isLowest ? 'bg-emerald-50/60' : idx % 2 === 0 ? 'bg-white dark:bg-[#0D1527]' : 'bg-slate-50/30 dark:bg-[#070A11]/30'
                      }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {deal.image && (
                          <img
                            src={deal.image}
                            alt=""
                            className="h-10 w-10 flex-shrink-0 rounded-lg object-contain bg-white dark:bg-[#0D1527] border border-slate-100 dark:border-white/5 p-0.5"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <div className="min-w-0">
                          <p className="line-clamp-2 font-semibold text-slate-800 dark:text-[#F8FAFC] leading-snug" title={deal.title}>
                            {deal.title}
                          </p>
                          <div className="mt-0.5 flex items-center gap-1.5">
                            {isLowest && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-black text-emerald-700">
                                LOWEST LISTED
                              </span>
                            )}
                            {deal.source_type === 'database_verified' && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-100">
                                Directory offer
                              </span>
                            )}
                          </div>
                          {deal.verdict && (
                            <p className="mt-1 text-[10px] leading-tight text-slate-500 max-w-xs">
                              {deal.verdict}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${colors.badge}`}>
                        {deal.store || 'Store'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-black text-sm ${isLowest ? 'text-emerald-700' : 'text-slate-900 dark:text-[#F1F5F9]'}`}>
                        {deal.price ? money(deal.price) : 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-slate-400 line-through text-xs">
                        {deal.mrp && deal.mrp > (deal.price || 0) ? money(deal.mrp) : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {deal.discount_pct && deal.discount_pct > 0 ? (
                        <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-black text-white">
                          {deal.discount_pct}% off
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col gap-1 items-center">
                        {deal.url && (() => {
                          const isAmz = (deal.store || '').toLowerCase().includes('amazon');
                          const asin = isAmz ? extractAmazonAsin(deal.url || deal.id) : null;
                          const subId = generateSubId('matrix', deal.id);

                          return (
                            <div className="flex flex-col gap-1 w-full">
                              {asin ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const cartUrl = buildAmazonCartUrl(asin, undefined, subId);
                                    openSmartStoreLink(cartUrl, 'amazon', asin, true, subId);
                                  }}
                                  className="rounded-lg px-2.5 py-1 text-[10px] font-bold text-white bg-amber-500 hover:bg-amber-600 transition shadow-2xs cursor-pointer"
                                  title="Add to Amazon cart; confirm the final price there"
                                >
                                  🛒 Add to Amazon cart
                                </button>
                              ) : null}
                              <button
                                type="button"
                                onClick={() => openSmartStoreLink(deal.url, deal.store, asin || undefined, false, subId)}
                                className={`rounded-lg px-2.5 py-1 text-[10px] font-bold text-white transition shadow-2xs hover:opacity-95 cursor-pointer ${isLowest ? 'bg-emerald-600 hover:bg-emerald-700' : colors.btn
                                  }`}
                              >
                                {asin ? (isMobile ? '⚡ Open App' : 'View on Amazon ↗') : (isMobile ? `Buy Deal ↗` : `View on ${deal.store} ↗`)}
                              </button>
                            </div>
                          );
                        })()}
                        {onCheckHistory && (deal.raw_url || deal.url) && (
                          <button
                            type="button"
                            onClick={() => onCheckHistory(deal.raw_url || deal.url)}
                            className="text-[9px] font-semibold text-slate-500 hover:text-emerald-600 transition cursor-pointer"
                          >
                            📊 History
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Product Cards Grid View */
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filteredDeals.map((deal) => {
            const isLowest = Boolean(minPriceDeal && deal.id === minPriceDeal.id);
            const colors = sc(deal.store || '');
            return (
              <article
                key={deal.id}
                className={`group flex flex-col justify-between overflow-hidden rounded-2xl border bg-white dark:bg-[#0D1527] transition hover:-translate-y-0.5 hover:shadow-md ${isLowest ? 'border-emerald-400 ring-2 ring-emerald-500/30' : 'border-slate-200 dark:border-white/10 hover:border-emerald-300'
                  }`}
              >
                <div>
                  <div className="relative flex h-36 items-center justify-center bg-slate-50/70 dark:bg-[#070A11]/70 p-3">
                    {deal.image ? (
                      <img
                        src={deal.image}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-contain mix-blend-multiply"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-3xl" aria-hidden="true">
                        🛍️
                      </span>
                    )}
                    {isLowest ? (
                      <span className="absolute left-2 top-2 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-black text-white shadow-xs">
                        LOWEST LISTED
                      </span>
                    ) : deal.discount_pct && deal.discount_pct > 0 ? (
                      <span className="absolute left-2 top-2 rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-black text-white shadow-xs">
                        {deal.discount_pct}% OFF
                      </span>
                    ) : null}
                  </div>
                  <div className="p-3">
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${colors.badge}`}>
                        {deal.store || 'Store'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> {deal.in_stock === true ? 'Stock reported' : deal.in_stock === false ? 'Out of stock' : 'Check stock'}
                      </span>
                    </div>
                    <h3 className="line-clamp-2 min-h-9 text-xs font-bold leading-snug text-slate-900 dark:text-[#F1F5F9]" title={deal.title}>
                      {deal.title}
                    </h3>
                    {deal.history_badge && (
                      <p className="mt-1 text-[10px] font-medium text-slate-500 truncate" title={deal.verdict}>
                        {deal.history_badge}
                      </p>
                    )}
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className={`text-base font-black ${isLowest ? 'text-emerald-700' : 'text-slate-900 dark:text-[#F1F5F9]'}`}>
                        {money(deal.price)}
                      </span>
                      {deal.mrp && deal.mrp > (deal.price || 0) && (
                        <span className="text-[10px] text-slate-400 line-through">
                          {money(deal.mrp)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-3 pt-0 space-y-1.5">
                  {onCheckHistory && (deal.raw_url || deal.url) && (
                    <button
                      type="button"
                      onClick={() => onCheckHistory(deal.raw_url || deal.url)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#070A11] hover:bg-slate-100 dark:bg-[#111C33] py-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                    >
                      📊 90-Day History
                    </button>
                  )}
                  {deal.url && (() => {
                    const isAmz = (deal.store || '').toLowerCase().includes('amazon');
                    const asin = isAmz ? extractAmazonAsin(deal.url || deal.id) : null;
                    const subId = generateSubId('search_card', deal.id);

                    if (asin) {
                      return (
                        <div className="flex gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              const cartUrl = buildAmazonCartUrl(asin, undefined, subId);
                              openSmartStoreLink(cartUrl, 'amazon', asin, true, subId);
                            }}
                            className="flex-1 rounded-xl bg-amber-500 hover:bg-amber-600 py-2 text-center text-[11px] font-bold text-white transition shadow-xs cursor-pointer"
                            title="Add to Amazon cart; confirm the final price there"
                          >
                            🛒 Add to Amazon cart
                          </button>
                          <button
                            type="button"
                            onClick={() => openSmartStoreLink(deal.url, deal.store, asin, false, subId)}
                            className="rounded-xl border border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-[#070A11] hover:bg-slate-100 dark:bg-[#111C33] px-3 py-2 text-center text-[11px] font-bold text-slate-800 dark:text-[#F8FAFC] transition cursor-pointer"
                            title={isMobile ? "Open in Amazon App" : "View on Amazon in new tab"}
                          >
                            {isMobile ? "⚡ App" : "View Store ↗"}
                          </button>
                        </div>
                      );
                    }

                    return (
                      <button
                        type="button"
                        onClick={() => openSmartStoreLink(deal.url, deal.store, undefined, false, subId)}
                        className={`w-full block rounded-xl px-3 py-2 text-center text-[11px] font-bold text-white transition shadow-xs hover:opacity-95 cursor-pointer ${isLowest ? 'bg-emerald-600 hover:bg-emerald-700' : colors.btn
                          }`}
                      >
                        ⚡ Open on {deal.store || 'Store'} ↗
                      </button>
                    );
                  })()}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Paste Link Verification Bar */}
      <div className="mt-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#070A11]/80 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔍</span>
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-[#F1F5F9]">
                Found It Cheaper on Google Shopping or Any Other Store?
              </h4>
              <p className="text-[11px] text-slate-500">
                Paste a supported product link to check available price history and affiliate conversion. History coverage varies by product.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => (onOpenGoogleShopping ? onOpenGoogleShopping(cleanQuery) : openGoogleShoppingModal(cleanQuery))}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700 px-3.5 py-1.5 text-[11px] font-bold text-white transition shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span>🛍️ Scan Google Shopping Radar</span>
            <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[9px] font-mono">IN-APP</span>
          </button>
        </div>
        <form onSubmit={handlePasteSubmit} className="mt-3 flex gap-2">
          <input
            type="url"
            value={pastedUrl}
            onChange={(e) => setPastedUrl(e.target.value)}
            placeholder="Paste Google Shopping, Amazon, Flipkart, or store link to verify price history..."
            className="flex-1 rounded-xl border border-slate-300 dark:border-white/20 bg-white dark:bg-[#0D1527] px-3.5 py-2 text-xs text-slate-900 dark:text-[#F1F5F9] placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={!pastedUrl.trim()}
            className="rounded-xl bg-slate-900 hover:bg-emerald-600 disabled:opacity-50 disabled:pointer-events-none px-4 py-2 text-xs font-bold text-white transition cursor-pointer shrink-0 shadow-2xs"
          >
            Verify Price
          </button>
        </form>
      </div>

      {/* Direct Store Link Badges */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STORE_LINKS.map((store) => {
          if (store.name === 'Google Shopping') {
            return (
              <button
                key={store.name}
                type="button"
                onClick={() => (onOpenGoogleShopping ? onOpenGoogleShopping(cleanQuery) : openGoogleShoppingModal(cleanQuery))}
                className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-bold transition cursor-pointer ${store.tone}`}
              >
                <span className="truncate flex items-center gap-1.5">
                  <span>{store.icon}</span>
                  <span>{store.name}</span>
                </span>
                <span className="shrink-0 text-[9px] font-mono font-bold bg-white/20 px-1.5 py-0.5 rounded">IN-APP ⚡</span>
              </button>
            );
          }
          return (
            <a
              key={store.name}
              href={store.url(cleanQuery)}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-bold transition ${store.tone}`}
            >
              <span className="truncate flex items-center gap-1.5">
                <span>{store.icon}</span>
                <span>{store.name}</span>
              </span>
              <span aria-hidden="true">↗</span>
            </a>
          );
        })}
      </div>
    </section>
  );
};

