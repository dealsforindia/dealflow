import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { Filters } from './components/Filters';
import { PublicDealCard } from './components/PublicDealCard';
import { ImageModal } from './components/ImageModal';
import { LegalModal, LegalDocType } from './components/LegalModal';
import { DealLookupModal } from './components/DealLookupModal';
import { WallOfHappiness } from './components/WallOfHappiness';
import { FloatingDock } from './components/FloatingDock';
import { Footer } from './components/Footer';
import { SubmitDeal } from './components/SubmitDeal';
import { AboutPage } from './components/AboutPage';
import { HowWeVerify } from './components/HowWeVerify';
import { ContactPage } from './components/ContactPage';
import type { PublicDeal, PublicDealsResponse, SortOption, NavTab } from './types';
import { calculateWorthScore } from './utils/worthScore';
import { MarqueeTicker } from './components/MarqueeTicker';
import { CategoryStories } from './components/CategoryStories';
import { Sparkles, Zap, RefreshCw, AlertCircle, Clock, ShoppingBag, ChevronRight, CheckCircle2, ShieldCheck, Flame } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.rudranil.me';

export const App: React.FC = () => {
  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  // Deals State
  const [deals, setDeals] = useState<PublicDeal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('worth');

  // Ending Soon Filter Pills
  const [hideOverEndingSoon, setHideOverEndingSoon] = useState<boolean>(false);
  const [endingSoonStoreFilter, setEndingSoonStoreFilter] = useState<string>('all');

  // Pagination
  const [totalDeals, setTotalDeals] = useState<number>(0);
  const [skip, setSkip] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const PAGE_SIZE = 40;

  // Modals
  const [lightboxDeal, setLightboxDeal] = useState<PublicDeal | null>(null);
  const [activeLegal, setActiveLegal] = useState<LegalDocType>(null);
  const [isLookupOpen, setIsLookupOpen] = useState<boolean>(false);
  const [lookupUrl, setLookupUrl] = useState<string>('');

  // Fetch Deals from Backend
  const fetchDeals = useCallback(
    async (currentSkip = 0, isAppend = false) => {
      if (isAppend) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const params = new URLSearchParams({
          limit: PAGE_SIZE.toString(),
          skip: currentSkip.toString(),
        });

        if (selectedStore !== 'all') params.append('store', selectedStore);
        if (selectedCategory !== 'all' && selectedCategory !== 'loot70') params.append('category', selectedCategory);
        if (searchQuery.trim()) params.append('search', searchQuery.trim());

        const res = await fetch(`${API_BASE}/api/v1/deals/public?${params.toString()}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch deals: ${res.status} ${res.statusText}`);
        }

        const data: PublicDealsResponse = await res.json();

        // Enrich deals with Worth Score
        const enriched = (data.deals || []).map((d) => {
          const w = calculateWorthScore(d);
          return {
            ...d,
            worth_score: w.score,
            worth_label: w.label,
          };
        });

        if (isAppend) {
          setDeals((prev) => {
            const existingIds = new Set(prev.map((d) => d.id));
            const newDeals = enriched.filter((d) => !existingIds.has(d.id));
            return [...prev, ...newDeals];
          });
        } else {
          setDeals(enriched);
        }

        setTotalDeals(data.total || enriched.length);
        setHasMore(data.has_more ?? (currentSkip + enriched.length < data.total));
        setSkip(currentSkip);
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err.message || 'Unable to connect to DealFlow engine');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedStore, selectedCategory, searchQuery]
  );

  // Initial fetch and reload on filter changes
  useEffect(() => {
    fetchDeals(0, false);
  }, [fetchDeals]);

  // Spotlight Deal (Highest Rupee Savings Deal with verified physical product heuristics)
  const spotlightDeal = useMemo(() => {
    if (!deals || deals.length === 0) return null;

    const spamPhrases = [
      'lab test',
      'test @',
      'recharge',
      'refer',
      'loot -',
      'loot alert',
      'voucher',
      'minutes',
      'short',
      'bottle',
      'party',
      'watch video',
      'survey',
      'claim free',
    ];

    const candidates = deals.filter((d) => {
      if (!d.image || !d.price || d.price < 150) return false;
      const lowerTitle = d.title.toLowerCase();
      if (spamPhrases.some((phrase) => lowerTitle.includes(phrase))) return false;
      if (d.image.includes('banner_') || d.image.includes('ytimg') || d.image.includes('youtube')) return false;
      return true;
    });

    const calculateSavings = (deal: typeof deals[0]) => {
      const price = deal.price || 0;
      if (deal.mrp && deal.mrp > price) {
        return deal.mrp - price;
      }
      if (deal.discount_pct && deal.discount_pct > 0 && price > 0) {
        return (price / (1 - deal.discount_pct / 100)) - price;
      }
      return 0;
    };

    // Prefer deals with official high-res store images (e.g. Amazon, Flipkart, Myntra direct CDNs)
    // and high discount / savings
    candidates.sort((a, b) => {
      const aIsStoreCdn = a.image.includes('media-amazon.com') || a.image.includes('rukminim') || a.image.includes('myntassets');
      const bIsStoreCdn = b.image.includes('media-amazon.com') || b.image.includes('rukminim') || b.image.includes('myntassets');
      if (aIsStoreCdn && !bIsStoreCdn) return -1;
      if (!aIsStoreCdn && bIsStoreCdn) return 1;

      const saveA = calculateSavings(a);
      const saveB = calculateSavings(b);
      return saveB - saveA;
    });

    return candidates[0] || deals[0];
  }, [deals]);

  // Curated Carousels for Homepage (ShoppinGenie Pattern: "Order Right Now" + "Ending Soon")
  const orderRightNowDeals = useMemo(() => {
    return [...deals]
      .filter((d) => (d.worth_score || 0) >= 80 && !d.is_over)
      .slice(0, 4);
  }, [deals]);

  const endingSoonCarouselDeals = useMemo(() => {
    return [...deals]
      .filter((d) => (d.discount_pct || 0) >= 50 && !d.is_over)
      .slice(0, 4);
  }, [deals]);

  // Exclusive Grid Deals
  const gridDeals = useMemo(() => {
    let result = [...deals];

    // Exclude spotlight in home tab
    if (activeTab === 'home' && spotlightDeal) {
      result = result.filter((d) => d.id !== spotlightDeal.id);
    }

    // Filter for 'loot70' (70%+ off steal deals)
    if (selectedCategory === 'loot70') {
      result = result.filter((d) => (d.discount_pct || 0) >= 70);
    }

    // Filter for 'Best Worth' Tab (Score 78+)
    if (activeTab === 'best_worth') {
      result = result.filter((d) => (d.worth_score || 0) >= 78);
    }

    // Filter for 'Ending Soon' Tab (High discount or urgent price crash)
    if (activeTab === 'ending_soon') {
      result = result.filter((d) => (d.discount_pct || 0) >= 50);
      if (hideOverEndingSoon) {
        result = result.filter((d) => !d.is_over && d.expiry_mins !== 0);
      }
      if (endingSoonStoreFilter !== 'all') {
        result = result.filter((d) => d.store.toLowerCase().includes(endingSoonStoreFilter.toLowerCase()));
      }
    }

    // Sorting Logic
    if (sortBy === 'worth') {
      result.sort((a, b) => (b.worth_score || 0) - (a.worth_score || 0));
    } else if (sortBy === 'newest') {
      result.sort((a, b) => (b.posted_at || 0) - (a.posted_at || 0));
    } else if (sortBy === 'discount') {
      result.sort((a, b) => (b.discount_pct || 0) - (a.discount_pct || 0));
    } else if (sortBy === 'price_low') {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price_high') {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    return result;
  }, [deals, spotlightDeal, activeTab, sortBy, hideOverEndingSoon, endingSoonStoreFilter, selectedCategory]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchDeals(skip + PAGE_SIZE, true);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#070A11] text-white flex flex-col selection:bg-emerald-500 selection:text-black font-sans">
      
      {/* 0. Top Live Telemetry Marquee Ticker */}
      <MarqueeTicker />

      {/* 1. Pro Max Sticky Glassmorphic Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'lookup') {
            setIsLookupOpen(true);
          } else {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        totalDeals={totalDeals}
      />

      {/* 2. Main Content Area with Safe Bottom Padding */}
      <main className="flex-1 pb-28 sm:pb-20">

        {/* Tab 1: HOME VIEW */}
        {activeTab === 'home' && (
          <>
            {/* Hero Banner with Search & Spotlight */}
            <HeroBanner
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onQuickSearch={(tag) => {
                setSearchQuery(tag);
                setActiveTab('home');
              }}
              dealCount={totalDeals}
              spotlightDeal={spotlightDeal}
              onOpenLookup={(url) => {
                setLookupUrl(url || '');
                setIsLookupOpen(true);
              }}
            />

            {/* Category Stories (Instagram/ShoppinGenie Style Quick Filter Bar) */}
            <div className="mt-4 mb-2">
              <CategoryStories
                selectedCategory={selectedCategory}
                onSelectCategory={(catId) => {
                  setSelectedCategory(catId);
                }}
              />
            </div>

            {/* ShoppinGenie Feature: "Order Right Now" Horizontal 4-Card Carousel */}
            {orderRightNowDeals.length > 0 && !searchQuery && selectedStore === 'all' && selectedCategory === 'all' && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black font-brand text-white tracking-tight">
                      Order Right Now
                    </h2>
                    <span className="text-xs text-slate-400 hidden md:inline">
                      — Insane Worth Scores (80+) verified live
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('best_worth');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 group py-1 px-2.5 rounded-lg hover:bg-emerald-500/10 transition-colors"
                  >
                    <span>See all</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                  {orderRightNowDeals.map((deal) => (
                    <PublicDealCard
                      key={`orn-${deal.id}`}
                      deal={deal}
                      onOpenImage={setLightboxDeal}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ShoppinGenie Feature: "Ending Soon" Horizontal 4-Card Carousel */}
            {endingSoonCarouselDeals.length > 0 && !searchQuery && selectedStore === 'all' && selectedCategory === 'all' && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      <Clock className="w-4 h-4 animate-pulse" />
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black font-brand text-white tracking-tight">
                      Ending Soon
                    </h2>
                    <span className="text-xs text-slate-400 hidden md:inline">
                      — Fast-selling drops near stock depletion
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('ending_soon');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 group py-1 px-2.5 rounded-lg hover:bg-orange-500/10 transition-colors"
                  >
                    <span>See all</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                  {endingSoonCarouselDeals.map((deal) => (
                    <PublicDealCard
                      key={`es-${deal.id}`}
                      deal={deal}
                      onOpenImage={setLightboxDeal}
                      isEndingSoonView={true}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Filter & Sort Bar */}
            <div className="mt-12">
              <Filters
                selectedStore={selectedStore}
                onSelectStore={setSelectedStore}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                sortBy={sortBy}
                onSortChange={setSortBy}
                totalDeals={gridDeals.length}
              />
            </div>

            {/* Section Heading: "Verified Live Loot Hunts" */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
                <h2 className="text-xl sm:text-2xl font-bold font-brand text-white tracking-tight">
                  Verified Live Loot Hunts
                </h2>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  — Verified at lowest price in 90 days across Indian stores
                </span>
              </div>
            </div>

            {/* Deals Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
              {loading && deals.length === 0 ? (
                <div className="py-24 text-center">
                  <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-slate-300 text-sm font-medium">
                    Loading verified drops from DealFlow engine...
                  </p>
                </div>
              ) : error && deals.length === 0 ? (
                <div className="py-16 px-6 text-center max-w-md mx-auto rounded-3xl border border-red-500/20 bg-red-950/20">
                  <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" aria-hidden="true" />
                  <h3 className="font-bold text-white mb-1">Could not connect to engine</h3>
                  <p className="text-xs text-slate-300 mb-4">{error}</p>
                  <button
                    onClick={() => fetchDeals(0, false)}
                    className="min-h-[44px] px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs focus-ring active:scale-95 transition-all"
                  >
                    Retry Connection
                  </button>
                </div>
              ) : gridDeals.length === 0 ? (
                <div className="py-20 text-center rounded-3xl border border-white/10 bg-[#0E1424] p-8 shadow-xl">
                  <ShoppingBag className="w-12 h-12 text-slate-500 mx-auto mb-3" aria-hidden="true" />
                  <h3 className="text-white font-bold text-lg mb-1 font-brand">No deals found</h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Try adjusting your store or category filter to discover more drops.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedStore('all');
                      setSelectedCategory('all');
                      setSearchQuery('');
                    }}
                    className="min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs focus-ring active:scale-95 transition-all"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                  {gridDeals.map((deal) => (
                    <PublicDealCard
                      key={deal.id}
                      deal={deal}
                      onOpenImage={setLightboxDeal}
                    />
                  ))}
                </div>
              )}

              {/* Load More Button */}
              {hasMore && gridDeals.length > 0 && (
                <div className="text-center mt-10">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="min-h-[44px] px-8 py-3.5 rounded-2xl bg-white/[0.08] hover:bg-emerald-500 hover:text-black text-white font-bold text-sm tracking-tight border border-white/15 hover:border-emerald-400 transition-all duration-200 active:scale-95 shadow-lg flex items-center gap-2 mx-auto disabled:opacity-50 focus-ring"
                    aria-label="Load more deals"
                  >
                    {loadingMore ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
                        <span>Loading More Drops...</span>
                      </>
                    ) : (
                      <>
                        <span>Load More Deals</span>
                        <span className="text-xs opacity-75 font-mono">({gridDeals.length} shown)</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

          </>
        )}

        {/* Tab 2: ENDING SOON VIEW (With ShoppinGenie Filter Pills) */}
        {activeTab === 'ending_soon' && (
          <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                  <Clock className="w-5 h-5 animate-pulse" aria-hidden="true" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black font-brand text-white tracking-tight">
                    Ending Soon Price Drops
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300">
                    Flash loots with stock depletion alerts. Once these sell out, prices return to regular retail.
                  </p>
                </div>
              </div>

              {/* ShoppinGenie Filter Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setEndingSoonStoreFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    endingSoonStoreFilter === 'all'
                      ? 'bg-emerald-500 text-black font-bold'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  All Stores
                </button>
                <button
                  onClick={() => setEndingSoonStoreFilter('amazon')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    endingSoonStoreFilter === 'amazon'
                      ? 'bg-amber-500 text-black font-bold'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  Amazon
                </button>
                <button
                  onClick={() => setEndingSoonStoreFilter('flipkart')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    endingSoonStoreFilter === 'flipkart'
                      ? 'bg-blue-500 text-white font-bold'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  Flipkart
                </button>
                <button
                  onClick={() => setHideOverEndingSoon(!hideOverEndingSoon)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                    hideOverEndingSoon
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${hideOverEndingSoon ? 'bg-rose-400' : 'bg-slate-600'}`} />
                  Hide OVER
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {gridDeals.map((deal) => (
                <PublicDealCard
                  key={deal.id}
                  deal={deal}
                  onOpenImage={setLightboxDeal}
                  isEndingSoonView={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: BEST WORTH DEALS VIEW (Large 3-Column Cards) */}
        {activeTab === 'best_worth' && (
          <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.08]">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black font-brand text-white tracking-tight">
                  Best Worth Deals
                </h1>
                <p className="text-xs sm:text-sm text-slate-300">
                  Ranked by DealFlow Worth Index (78+ rating) with verified 90-day regular price comparison.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridDeals.map((deal) => (
                <PublicDealCard
                  key={deal.id}
                  deal={deal}
                  onOpenImage={setLightboxDeal}
                  isBestWorthView={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: ACTIVE OFFERS & VOUCHERS VIEW (Rich Image & Action Cards) */}
        {activeTab === 'active_offers' && (
          <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex items-center gap-3 pb-4 border-b border-white/[0.08]">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black font-brand text-white tracking-tight">
                  Verified Loot Hacks & Active Offers
                </h1>
                <p className="text-xs sm:text-sm text-slate-300">
                  Curated step-by-step loot tricks, grocery coupon stacks, and instant savings verified across leading Indian apps.
                </p>
              </div>
            </div>

            {/* Rich Image-Dominant Store Offer Banners */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Swiggy Instamart */}
              <div className="rounded-3xl border border-white/10 bg-[#0E1424] overflow-hidden hover:border-orange-500/40 card-elevation transition flex flex-col justify-between group shadow-xl">
                <div className="h-44 bg-gradient-to-br from-orange-600/30 via-slate-900 to-slate-950 p-6 flex flex-col justify-between relative">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md bg-orange-500 text-black text-xs font-black">
                      SWIGGY INSTAMART
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-400 text-xs font-bold backdrop-blur-sm">
                      ⚡ Flat ₹10 Drop
                    </span>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-white group-hover:text-orange-300 transition-colors">
                      Soda & Snacks Glitch
                    </div>
                    <div className="text-xs text-orange-200/80 mt-1">Instant delivery in 10 minutes</div>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Search in your Swiggy app for: <strong>"Noice"</strong>, <strong>"Farmley Masala"</strong>, <strong>"Let's Try"</strong>. Select products are price-crashed to ₹10 flat. Add up to 5 items to checkout.
                  </p>
                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified Live
                    </span>
                    <a
                      href="https://www.swiggy.com/instamart"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs transition active:scale-95"
                    >
                      Open Swiggy
                    </a>
                  </div>
                </div>
              </div>

              {/* Flipkart Minutes */}
              <div className="rounded-3xl border border-white/10 bg-[#0E1424] overflow-hidden hover:border-blue-500/40 card-elevation transition flex flex-col justify-between group shadow-xl">
                <div className="h-44 bg-gradient-to-br from-blue-600/30 via-slate-900 to-slate-950 p-6 flex flex-col justify-between relative">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md bg-blue-500 text-white text-xs font-black">
                      FLIPKART MINUTES
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-blue-300 text-xs font-bold backdrop-blur-sm">
                      Flat ₹9
                    </span>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-white group-hover:text-blue-300 transition-colors">
                      Grocery & Essentials
                    </div>
                    <div className="text-xs text-blue-200/80 mt-1">Daily deals in select metro cities</div>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Open the Flipkart app and tap the "Minutes" top banner. Fresh milk, biscuits, chips, and personal care items appear for ₹9. Refreshes every hour.
                  </p>
                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">Limited Pincodes</span>
                    <a
                      href="https://www.flipkart.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs transition active:scale-95"
                    >
                      Open Flipkart
                    </a>
                  </div>
                </div>
              </div>

              {/* Myntra Sports & Sneakers */}
              <div className="rounded-3xl border border-white/10 bg-[#0E1424] overflow-hidden hover:border-pink-500/40 card-elevation transition flex flex-col justify-between group shadow-xl">
                <div className="h-44 bg-gradient-to-br from-pink-600/30 via-slate-900 to-slate-950 p-6 flex flex-col justify-between relative">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md bg-pink-500 text-white text-xs font-black">
                      MYNTRA
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-pink-300 text-xs font-bold backdrop-blur-sm">
                      Coupon: SPORTS10
                    </span>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-white group-hover:text-pink-300 transition-colors">
                      Extra 10% on Sneakers
                    </div>
                    <div className="text-xs text-pink-200/80 mt-1">Puma, Nike, Converse & Vans</div>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Stack coupon code <strong className="font-mono text-emerald-400">SPORTS10</strong> on top of ongoing 50-60% sales for an extra instant 10% off at the payment page.
                  </p>
                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-[11px] text-pink-400 font-semibold">Active Coupon</span>
                    <a
                      href="https://www.myntra.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-bold text-xs transition active:scale-95"
                    >
                      Shop Myntra
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: WALL OF HAPPINESS (COMMUNITY UNBOXING & PROOF) VIEW */}
        {activeTab === 'reviews' && (
          <WallOfHappiness />
        )}

        {/* Tab 6: SUBMIT DEAL VIEW (ShoppinGenie Feature) */}
        {activeTab === 'submit_deal' && (
          <SubmitDeal onBackToHome={() => setActiveTab('home')} />
        )}

        {/* Tab 7: ABOUT PAGE VIEW (ShoppinGenie Feature) */}
        {activeTab === 'about' && (
          <AboutPage
            onBackToHome={() => setActiveTab('home')}
            onNavigateTab={setActiveTab}
          />
        )}

        {/* Tab 8: HOW WE VERIFY VIEW (ShoppinGenie Feature) */}
        {activeTab === 'how_we_verify' && (
          <HowWeVerify
            onBackToHome={() => setActiveTab('home')}
            onNavigateTab={setActiveTab}
          />
        )}

        {/* Tab 9: CONTACT PAGE VIEW (ShoppinGenie Feature) */}
        {activeTab === 'contact' && (
          <ContactPage
            onBackToHome={() => setActiveTab('home')}
            onNavigateTab={setActiveTab}
          />
        )}

      </main>

      {/* 3. Floating Quick Filter & Back to Top Dock */}
      <FloatingDock
        selectedStore={selectedStore}
        onSelectStore={setSelectedStore}
      />

      {/* 4. Footer */}
      <Footer
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenLegal={(type) => {
          if (type === 'verify') {
            setActiveTab('how_we_verify');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            setActiveLegal(type);
          }
        }}
      />

      {/* 5. Lightbox Modal */}
      <ImageModal
        deal={lightboxDeal}
        onClose={() => setLightboxDeal(null)}
      />

      {/* 6. Real Legal & Verification Modal */}
      <LegalModal
        type={activeLegal}
        onClose={() => setActiveLegal(null)}
      />

      {/* 7. Instant Deal Lookup & Sanity Checker Modal */}
      <DealLookupModal
        isOpen={isLookupOpen || activeTab === 'lookup'}
        initialUrl={lookupUrl}
        onClose={() => {
          setIsLookupOpen(false);
          setLookupUrl('');
          if (activeTab === 'lookup') setActiveTab('home');
        }}
      />

    </div>
  );
};

export default App;
