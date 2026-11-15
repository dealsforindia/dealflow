import { RecoveryBoundary } from './components/RecoveryBoundary';
import { PUBLIC_API_BASE, PUBLIC_EDGE_BASE, publicDeal, publicStoreUrl, lookupTargetUrl, isDisplayableOffer } from './utils/publicLinks';
import { ArrowDown, LoaderCircle, X } from 'lucide-react';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { motion, AnimatePresence } from 'motion/react';
import { HeroBanner } from './components/HeroBanner';
import { CategoryRail } from './components/CategoryRail';
import { DealToolbar } from './components/DealToolbar';
import { PublicDealCard } from './components/PublicDealCard';
import { PriceLookupStrip } from './components/PriceLookupStrip';
import { TrustStrip } from './components/TrustStrip';
import { MobileNav } from './components/MobileNav';
import { Footer } from './components/Footer';
import { DealDetailModal } from './components/DealDetailModal';
import { ImageModal } from './components/ImageModal';
import { DealLookupModal } from './components/DealLookupModal';
import { SubmitDeal } from './components/SubmitDeal';
import { LegalModal, LegalDocType } from './components/LegalModal';
import { AboutPage } from './components/AboutPage';
import { HowWeVerify } from './components/HowWeVerify';
import { ContactPage } from './components/ContactPage';
import { WallOfHappiness } from './components/WallOfHappiness';
import { DealSkeletonGrid } from './components/DealSkeleton';
import { MarqueeTicker } from './components/MarqueeTicker';
import { HowDealsWorkModal } from './components/HowDealsWorkModal';
import { CategoryStories } from './components/CategoryStories';
import { CommandPalette } from './components/CommandPalette';
import { CompareDrawer } from './components/CompareDrawer';
import { ProductSpecCompareModal } from './components/ProductSpecCompareModal';
import { PriceDropAlertModal } from './components/PriceDropAlertModal';
import { PhoneExchangeEstimatorModal } from './components/PhoneExchangeEstimatorModal';
import type { ToolId } from './components/tools/ToolsHubModal';
import { DeferredToolsHub } from './components/DeferredToolsHub';
import { TopDiscountsPage } from './components/TopDiscountsPage';
import { WorthScorePage } from './components/WorthScorePage';
import { ProfilePage } from './components/ProfilePage';
import { SavedLootPage } from './components/SavedLootPage';
import { ExternalSearchResults, ExternalSearchDeal } from './components/ExternalSearchResults';
import { GoogleShoppingDiscoveryModal } from './components/GoogleShoppingDiscoveryModal';
import { openGoogleShoppingModal } from './utils/googleShopping';
import { SearchResultsHeader } from './components/SearchResultsHeader';
import { IntelligenceWorkspace } from './components/IntelligenceWorkspace';
import type { PublicDeal, PublicDealsResponse, SortOption, NavTab } from './types';
import { calculateWorthScore } from './utils/worthScore';
import { searchDealsClient } from './utils/semanticSearch';
import { getSavedDealIds, getSavedDealSnapshots, rememberSavedDeals, toggleSavedDealId, subscribeSavedDeals, clearAllSavedDealIds } from './utils/savedDeals';
import { isAudioEnabled, setAudioEnabled, playTactileClick } from './utils/audio';
import { useDealFlowSync } from './hooks/useDealFlowSync';
import { useTheme } from './utils/themeManager';

const EDGE_API = PUBLIC_EDGE_BASE;
const API_BASE = PUBLIC_API_BASE;

export const App: React.FC = () => {
  // Theme Manager Engine (System vs Dark vs Light with OS sync)
  useTheme();

  // Instant outbound deal redirect if loaded on /out/:id
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/out/')) {
      const target = lookupTargetUrl(window.location.pathname + window.location.search);
      if (target && target.startsWith('http') && !target.includes('/out/')) {
        window.location.replace(target);
      }
    }
  }, []);

  // Navigation Tab State
  const [mobileDeskOpen, setMobileDeskOpen] = useState(false);
  const [mobileCollectionsOpen, setMobileCollectionsOpen] = useState(false);
  const [collectionFilter, setCollectionFilter] = useState<'all' | 'loot70' | 'budget499'>('all');
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  // Deals State (Starts empty with skeleton shimmer until live drops load from API)
  const [deals, setDeals] = useState<PublicDeal[]>([]);
  const [discoveryDeals, setDiscoveryDeals] = useState<PublicDeal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [searchMode, setSearchMode] = useState<'db' | 'live'>('db');
  const [externalSearchDeals, setExternalSearchDeals] = useState<ExternalSearchDeal[]>([]);
  const [externalSearchLoading, setExternalSearchLoading] = useState(false);
  const [externalSearchError, setExternalSearchError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Google Shopping In-App Radar Modal State
  const [isGoogleShoppingOpen, setIsGoogleShoppingOpen] = useState<boolean>(false);
  const [googleShoppingQuery, setGoogleShoppingQuery] = useState<string>('');

  useEffect(() => {
    const handleGoogleShoppingEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setGoogleShoppingQuery(detail?.query || '');
      setIsGoogleShoppingOpen(true);
    };
    window.addEventListener('open-google-shopping', handleGoogleShoppingEvent);
    return () => window.removeEventListener('open-google-shopping', handleGoogleShoppingEvent);
  }, []);

  const handleOpenGoogleShopping = useCallback((q: string) => {
    setGoogleShoppingQuery(q);
    setIsGoogleShoppingOpen(true);
  }, []);

  // Debounce search query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // When searching, query server-side Google Shopping discovery and live-store search
  // so shoppers get rich Pan-India results without ever being bounced to google.com.
  useEffect(() => {
    const query = debouncedSearch.trim();
    if (!query) {
      setExternalSearchDeals([]);
      setExternalSearchError(null);
      setExternalSearchLoading(false);
      return;
    }

    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 22000);
    setExternalSearchDeals([]);
    setExternalSearchLoading(true);
    setExternalSearchError(null);

    const executeSearch = async () => {
      let rawDeals: any[] = [];
      let searchResponded = false;
      const toNumber = (value: unknown) => {
        const number = typeof value === 'number' ? value : Number(value);
        return Number.isFinite(number) && number > 0 ? number : null;
      };

      try {
        // 1. First attempt: Server-Side Google Shopping Index
        const res = await fetch(`${API_BASE}/api/v1/search/external?q=${encodeURIComponent(query)}&limit=24`, {
          signal: controller.signal,
          cache: 'no-store'
        });
        if (res.ok) {
          const data = await res.json();
          searchResponded = true;
          rawDeals = Array.isArray(data?.results) ? data.results : Array.isArray(data?.deals) ? data.deals : [];
        }
      } catch (e) {
        // Fallback below
      }

      // 2. Fallback / supplementary multi-store live search if empty
      if (!rawDeals.length && !controller.signal.aborted) {
        try {
          const extRes = await fetch(`${API_BASE}/api/v1/deals/external-search?q=${encodeURIComponent(query)}&limit=24`, {
            signal: controller.signal,
            cache: 'no-store'
          });
          if (extRes.ok) {
            const extData = await extRes.json();
            searchResponded = true;
            rawDeals = Array.isArray(extData?.deals) ? extData.deals : Array.isArray(extData?.results) ? extData.results : [];
          }
        } catch {
          // ignore
        }
      }

      if (!active) return;
      if (controller.signal.aborted) throw new Error('Store search timed out');
      if (!searchResponded) throw new Error('Store search unavailable');

      const normalized: ExternalSearchDeal[] = rawDeals.map((deal: any, index: number) => ({
        id: String(deal.id || deal._id || `external-${index}-${query}`),
        title: String(deal.title || deal.product_name || deal.name || 'Store product match'),
        price: toNumber(deal.price ?? deal.sale_price ?? deal.current_price),
        mrp: toNumber(deal.mrp ?? deal.regular_price ?? deal.original_price),
        discount_pct: toNumber(deal.discount_pct ?? deal.discount),
        store: String(deal.store || deal.source || deal.source_type || 'Store'),
        image: deal.image || deal.image_url || deal.thumbnail || deal.img_url || null,
        url: publicStoreUrl(String(deal.url || deal.link || deal.buy_url || '')),
        raw_url: String(deal.raw_url || deal.canonical_url || deal.url || ''),
        has_price_history: Boolean(deal.has_price_history),
        history_badge: deal.history_badge ? String(deal.history_badge) : undefined,
        verdict: deal.verdict ? String(deal.verdict) : undefined,
        is_lowest_price: false,
        affiliate_applied: Boolean(deal.affiliate_applied),
        source_type: String(deal.source_type || 'live_store_search'),
        history: Array.isArray(deal.history) ? deal.history : [],
        in_stock: typeof deal.in_stock === 'boolean' ? deal.in_stock : undefined,
        last_checked_at: Number(deal.last_checked_at) || undefined,
        price_verified: deal.price_verified === true,
        price_source: typeof deal.price_source === 'string' ? deal.price_source : undefined,
        product_id: deal.product_id,
        gtin: typeof deal.gtin === 'string' ? deal.gtin : undefined,
        effective_price: toNumber(deal.effective_price),
        coupon: deal.coupon,
        coupon_discount: toNumber(deal.coupon_discount),
        regular_price: toNumber(deal.regular_price),
      }));

      setExternalSearchDeals(normalized.filter(isDisplayableOffer));
    };

    executeSearch()
      .catch((err: unknown) => {
        if (!active) return;
        setExternalSearchDeals([]);
        setExternalSearchError(null);
      })
      .finally(() => {
        clearTimeout(timeout);
        if (active) setExternalSearchLoading(false);
      });

    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [debouncedSearch]);

  // Pagination
  const [totalDeals, setTotalDeals] = useState<number>(0);
  const [skip, setSkip] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const PAGE_SIZE = 40;

  // Modals & Power Tools
  const [selectedDetailDeal, setSelectedDetailDeal] = useState<PublicDeal | null>(null);
  const [selectedPhotoDeal, setSelectedPhotoDeal] = useState<PublicDeal | null>(null);
  const [activeFeatureDeal, setActiveFeatureDeal] = useState<PublicDeal | null>(null);
  const [isPriceAlertOpen, setIsPriceAlertOpen] = useState<boolean>(false);
  const [isTradeInOpen, setIsTradeInOpen] = useState<boolean>(false);
  const [isLookupOpen, setIsLookupOpen] = useState<boolean>(false);
  const [lookupInitialTab, setLookupInitialTab] = useState<'analyzer' | 'watches'>('analyzer');
  const [lookupUrl, setLookupUrl] = useState<string>('');
  const [isSubmitOpen, setIsSubmitOpen] = useState<boolean>(false);
  const [activeLegal, setActiveLegal] = useState<LegalDocType>(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState<boolean>(false);
  const [isToolsHubOpen, setIsToolsHubOpen] = useState<boolean>(false);
  const [activeToolId, setActiveToolId] = useState<ToolId>('gst');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);
  const [isSpecCompareOpen, setIsSpecCompareOpen] = useState(false);
  const [compareDeals, setCompareDeals] = useState<PublicDeal[]>([]);
  const [isAudioActive, setIsAudioActive] = useState<boolean>(() => isAudioEnabled());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleOpenToolsHub = useCallback((toolId?: ToolId) => {
    if (toolId) setActiveToolId(toolId);
    setIsToolsHubOpen(true);
  }, []);

  // Saved Deals (Favorites) State
  const [savedDealIds, setSavedDealIds] = useState<string[]>(() => getSavedDealIds());
  const [savedOffers, setSavedOffers] = useState<PublicDeal[]>(() => getSavedDealSnapshots());

  useEffect(() => {
    return subscribeSavedDeals((ids) => { setSavedDealIds(ids); });
  }, []);
  useEffect(() => {
    rememberSavedDeals(deals);
    setSavedOffers(getSavedDealSnapshots());
  }, [deals, savedDealIds]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 2800);
  }, []);

  const handleToggleCompare = useCallback((deal: PublicDeal) => {
    setCompareDeals((prev) => {
      const exists = prev.some((d) => d.id === deal.id);
      if (exists) {
        showToast('Removed from comparison');
        return prev.filter((d) => d.id !== deal.id);
      }
      if (prev.length >= 3) {
        showToast('Max 3 deals can be compared at once');
        return prev;
      }
      showToast(`Added to compare dock (${prev.length + 1}/3)`);
      return [...prev, deal];
    });
  }, [showToast]);

  const handleRemoveCompareDeal = useCallback((id: string) => {
    setCompareDeals((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const handleClearCompareAll = useCallback(() => {
    setCompareDeals([]);
    setIsCompareModalOpen(false);
    setIsSpecCompareOpen(false);
  }, []);

  const handleToggleAudio = useCallback(() => {
    const next = !isAudioActive;
    setAudioEnabled(next);
    setIsAudioActive(next);
    if (next) {
      playTactileClick();
      showToast('Sound effects enabled 🔊');
    } else {
      showToast('Sound effects muted 🔇');
    }
  }, [isAudioActive, showToast]);

  // Global Keyboard Shortcuts (⌘K, Ctrl+K, /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Android Native Share Target & Deep Link URL Interceptor
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const urlObj = new URL(window.location.href);
      const isShareTarget = urlObj.pathname.includes('/share-target');
      const paramUrl = urlObj.searchParams.get('url');
      const paramText = urlObj.searchParams.get('text');
      const paramTitle = urlObj.searchParams.get('title');

      const combined = `${paramUrl || ''} ${paramText || ''} ${paramTitle || ''}`.trim();
      if (isShareTarget || combined) {
        const urlMatch = combined.match(/https?:\/\/[^\s<>"]+/i);
        if (urlMatch) {
          const incomingUrl = urlMatch[0];
          window.history.replaceState({}, '', '/');
          setLookupUrl(incomingUrl);
          setIsLookupOpen(true);
          showToast('Analyzing shared product from your app...');
        }
      }
    } catch {
      // Ignore URL parsing exceptions
    }
  }, [showToast]);


  const handleToggleSaveDeal = useCallback((deal: PublicDeal) => {
    const { isSaved, list } = toggleSavedDealId(deal.id, deal);
    setSavedDealIds(list);
    showToast(isSaved ? 'Saved to your Loot Bookmarks!' : 'Removed from saved deals');
  }, [showToast]);

  const handleClearAllSaved = useCallback(() => {
    clearAllSavedDealIds();
    setSavedDealIds([]);
    showToast('Cleared all saved loot bookmarks');
  }, [showToast]);

  const flashLootCount = useMemo(() => {
    return discoveryDeals.filter(d => d.price != null && d.price > 0 && d.mrp != null && d.mrp > d.price && (1 - d.price / d.mrp) * 100 >= 70).length;
  }, [discoveryDeals]);

  const handleFilterFlashLoot = useCallback(() => {
    setActiveTab('home');
    setSelectedCategory('all');
    setSelectedStore('all');
    setSearchQuery('');
    setSortBy('discount');
    setCollectionFilter('loot70');
    const section = document.getElementById('deals-section');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  }, []);



  const feedRequest = useRef<AbortController | null>(null);
  useEffect(() => () => feedRequest.current?.abort(), []);
  // Fetch Deals from Backend
  const fetchDeals = useCallback(
    async (currentSkip = 0, isAppend = false, isSilent = false) => {
      feedRequest.current?.abort();
      const controller = new AbortController();
      feedRequest.current = controller;
      let timedOut = false;
      const requestTimeout = setTimeout(() => { timedOut = true; controller.abort(); }, 25000);
      if (!isSilent) {
        if (isAppend) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }
      }
      setError(null);

      try {
        // Mode 1: Live External Store Crawler
        if (searchMode === 'live' && debouncedSearch) {
          try {
            const extRes = await fetch(`${API_BASE}/api/v1/deals/external-search?q=${encodeURIComponent(debouncedSearch)}`, { signal: controller.signal, cache: 'no-store' });
            if (extRes.ok) {
              const extData = await extRes.json();
              if (controller.signal.aborted) { if (timedOut) throw new Error('Request timed out'); return; }
              if (extData && Array.isArray(extData.deals)) {
                const incomingDeals: PublicDeal[] = extData.deals.filter(isDisplayableOffer).map((deal: any) => {
                  const score = typeof deal.worth_score === 'number' ? deal.worth_score : calculateWorthScore(deal).score;
                  return {
                    ...publicDeal(deal),
                    worth_score: score,
                    display_ts: deal.posted_at ? (deal.posted_at < 1e12 ? deal.posted_at * 1000 : deal.posted_at) : 0,
                  };
                });
                setDeals(incomingDeals);
                setTotalDeals(extData.count || incomingDeals.length);
                setHasMore(false);
                setSkip(0);
                return;
              }
            }
          } catch (extErr) {
            if (controller.signal.aborted) { if (timedOut) throw new Error('Request timed out'); return; }
            console.warn('Live crawler fallback to DB:', extErr);
          }
        }

        // Mode 2: verified deals database (MongoDB)
        const params = new URLSearchParams({
          limit: (debouncedSearch ? 80 : PAGE_SIZE).toString(),
          skip: currentSkip.toString(),
          sort: sortBy,
        });

        if (debouncedSearch) {
          params.append('search', debouncedSearch);
        }
        if (selectedStore !== 'all') params.append('store', selectedStore);
        if (selectedCategory !== 'all') params.append('category', selectedCategory);

        let res: Response | null = null;
        try {
          res = await fetch(`${API_BASE}/api/v1/deals/public?${params.toString()}`, { signal: controller.signal, cache: 'no-store' });
        } catch {
          res = null;
        }

        if (controller.signal.aborted) { if (timedOut) throw new Error('Request timed out'); return; }
        if (!res || !res.ok) {
          try {
            res = await fetch(`${EDGE_API}/deals?${params.toString()}`, { signal: controller.signal, cache: 'no-store' });
          } catch {
            res = null;
          }
        }

        if (!res || !res.ok) {
          throw new Error(`API returned status ${res ? res.status : 'network error'}`);
        }

        const data: PublicDealsResponse = await res.json();
        if (controller.signal.aborted) { if (timedOut) throw new Error('Request timed out'); return; }
        const incomingDeals: PublicDeal[] = (data.deals || []).filter(isDisplayableOffer).map((deal: PublicDeal) => {
          const score = typeof deal.worth_score === 'number' ? deal.worth_score : calculateWorthScore(deal).score;
          return {
            ...publicDeal(deal),
            worth_score: score,
            display_ts: deal.posted_at ? (deal.posted_at < 1e12 ? deal.posted_at * 1000 : deal.posted_at) : 0,
          };
        });

        if (isAppend) {
          setDeals((prev) => {
            const existingIds = new Set(prev.map((d) => d.id));
            const fresh = incomingDeals.filter((d) => !existingIds.has(d.id));
            return [...prev, ...fresh];
          });
        } else {
          setDeals(incomingDeals);
        }
        if (!debouncedSearch && selectedStore === 'all' && selectedCategory === 'all') {
          setDiscoveryDeals(prev => isAppend
            ? [...prev, ...incomingDeals.filter(deal => !prev.some(existing => existing.id === deal.id))]
            : incomingDeals);
        }

        setTotalDeals(data.total || incomingDeals.length);
        setHasMore(data.has_more ?? (data.deals || []).length === (debouncedSearch ? 80 : PAGE_SIZE));
        setSkip(currentSkip);
      } catch (err: unknown) {
        if (feedRequest.current !== controller) return;
        if (controller.signal.aborted && !timedOut) return;
        const msg = err instanceof Error ? err.message : 'Failed to fetch deals';
        console.warn('Live deal feed unavailable:', msg);
        if (!isSilent) {
          if (!isAppend && deals.length === 0) {
            setError('Connecting to Deal Stream...');
            setHasMore(false);
          }
        }
      } finally {
        clearTimeout(requestTimeout);
        if (feedRequest.current === controller) {
          if (!isSilent) {
            setLoading(false);
            setLoadingMore(false);
          }
        }
      }
    },
    [selectedStore, selectedCategory, sortBy, debouncedSearch, searchMode]
  );

  // Initial fetch and on filter/sort changes
  useEffect(() => {
    fetchDeals(0, false);
  }, [fetchDeals]);

  // Real-Time WebSocket Event Handlers (No page reload needed for Delete, Edit, or New Deals)
  const handleDealReceived = useCallback((incomingDeal: PublicDeal) => {
    if (!isDisplayableOffer(incomingDeal)) return;

    setDeals((prev) => {
      const targetId = String(incomingDeal.id);
      const targetFp = incomingDeal.fp_hash ? String(incomingDeal.fp_hash) : null;
      const idx = prev.findIndex((d) => String(d.id) === targetId || (targetFp && String(d.fp_hash) === targetFp));
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...incomingDeal };
        return next;
      }
      return [incomingDeal, ...prev];
    });

    setDiscoveryDeals((prev) => {
      const targetId = String(incomingDeal.id);
      const targetFp = incomingDeal.fp_hash ? String(incomingDeal.fp_hash) : null;
      const idx = prev.findIndex((d) => String(d.id) === targetId || (targetFp && String(d.fp_hash) === targetFp));
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...incomingDeal };
        return next;
      }
      return [incomingDeal, ...prev];
    });

    setTotalDeals((prev) => prev + 1);
  }, []);

  const handleDealDeleted = useCallback((targetId: string) => {
    if (!targetId) return;
    const cleanId = String(targetId).trim();

    setDeals((prev) => prev.filter((d) => String(d.id) !== cleanId && String(d.fp_hash) !== cleanId));
    setDiscoveryDeals((prev) => prev.filter((d) => String(d.id) !== cleanId && String(d.fp_hash) !== cleanId));
    setCompareDeals((prev) => prev.filter((d) => String(d.id) !== cleanId && String(d.fp_hash) !== cleanId));

    setSelectedDetailDeal((prev) => {
      if (prev && (String(prev.id) === cleanId || String(prev.fp_hash) === cleanId)) {
        showToast('This deal drop has been removed by curators');
        return null;
      }
      return prev;
    });

    setSelectedPhotoDeal((prev) => {
      if (prev && (String(prev.id) === cleanId || String(prev.fp_hash) === cleanId)) {
        return null;
      }
      return prev;
    });

    setTotalDeals((prev) => Math.max(0, prev - 1));
  }, [showToast]);

  const handleDealUnpublished = useCallback((targetId: string) => {
    handleDealDeleted(targetId);
  }, [handleDealDeleted]);

  const handleDealEdited = useCallback((updatedDeal: PublicDeal) => {
    if (!updatedDeal) return;
    const targetId = String(updatedDeal.id);
    const targetFp = updatedDeal.fp_hash ? String(updatedDeal.fp_hash) : null;

    setDeals((prev) =>
      prev.map((d) =>
        String(d.id) === targetId || (targetFp && String(d.fp_hash) === targetFp)
          ? { ...d, ...updatedDeal }
          : d
      )
    );
    setDiscoveryDeals((prev) =>
      prev.map((d) =>
        String(d.id) === targetId || (targetFp && String(d.fp_hash) === targetFp)
          ? { ...d, ...updatedDeal }
          : d
      )
    );
    setCompareDeals((prev) =>
      prev.map((d) =>
        String(d.id) === targetId || (targetFp && String(d.fp_hash) === targetFp)
          ? { ...d, ...updatedDeal }
          : d
      )
    );

    setSelectedDetailDeal((prev) => {
      if (prev && (String(prev.id) === targetId || (targetFp && String(prev.fp_hash) === targetFp))) {
        return { ...prev, ...updatedDeal };
      }
      return prev;
    });

    setSelectedPhotoDeal((prev) => {
      if (prev && (String(prev.id) === targetId || (targetFp && String(prev.fp_hash) === targetFp))) {
        return { ...prev, ...updatedDeal };
      }
      return prev;
    });

    showToast(`Live update: ${updatedDeal.title.slice(0, 32)}…`);
  }, [showToast]);

  const handleDealStatusChange = useCallback(({ id, status }: { id: string; status: string }) => {
    if (!id) return;
    const cleanId = String(id).trim();

    if (['deleted', 'unpublished', 'rejected'].includes(status)) {
      handleDealDeleted(cleanId);
    } else if (['expired', 'oos', 'out_of_stock'].includes(status)) {
      setDeals((prev) =>
        prev.map((d) =>
          String(d.id) === cleanId || String(d.fp_hash) === cleanId
            ? { ...d, is_over: true, is_expired: true, status: 'expired' }
            : d
        )
      );
      setDiscoveryDeals((prev) =>
        prev.map((d) =>
          String(d.id) === cleanId || String(d.fp_hash) === cleanId
            ? { ...d, is_over: true, is_expired: true, status: 'expired' }
            : d
        )
      );
      setSelectedDetailDeal((prev) => {
        if (prev && (String(prev.id) === cleanId || String(prev.fp_hash) === cleanId)) {
          return { ...prev, is_over: true, is_expired: true, status: 'expired' };
        }
        return prev;
      });
    }
  }, [handleDealDeleted]);

  // DealFlow Live WebSocket Sync
  useDealFlowSync({
    onDealReceived: handleDealReceived,
    onDealDeleted: handleDealDeleted,
    onDealUnpublished: handleDealUnpublished,
    onDealEdited: handleDealEdited,
    onDealStatusChange: handleDealStatusChange,
    enableAlerts: false,
  });

  // Background focus & visibility sync (Reconcile updates automatically without manual page reload)
  useEffect(() => {
    const handleRevalidate = () => {
      if (document.visibilityState === 'visible' && !searchQuery.trim()) {
        fetchDeals(0, false, true); // silent background fetch
      }
    };
    window.addEventListener('focus', handleRevalidate);
    document.addEventListener('visibilitychange', handleRevalidate);

    const heartbeat = setInterval(() => {
      if (document.visibilityState === 'visible' && !searchQuery.trim()) {
        fetchDeals(0, false, true);
      }
    }, 45000);

    return () => {
      window.removeEventListener('focus', handleRevalidate);
      document.removeEventListener('visibilitychange', handleRevalidate);
      clearInterval(heartbeat);
    };
  }, [fetchDeals, searchQuery]);

  // Load More Handler
  const handleLoadMore = () => {
    if (loading || loadingMore || !hasMore) return;
    const nextSkip = skip + (debouncedSearch ? 80 : PAGE_SIZE);
    fetchDeals(nextSkip, true);
  };

  // Filter deals locally based on search query, category rail, activeTab
  const filteredDeals = useMemo(() => {
    let result = deals;
    if (collectionFilter === 'loot70') result = result.filter(d => d.price != null && d.price > 0 && d.mrp != null && d.mrp > d.price && (1 - d.price / d.mrp) * 100 >= 70);
    if (collectionFilter === 'budget499') result = result.filter(d => d.price != null && d.price > 0 && d.price < 499);

    // Search query filtering: Rank / filter locally while preserving server results
    if (searchQuery.trim()) {
      const clientFiltered = searchDealsClient(result, searchQuery).deals;
      // An empty semantic match is meaningful: show the cross-store search state
      // instead of silently returning unrelated deals for the user's query.
      result = clientFiltered;
    }

    // Category filtering
    if (selectedCategory !== 'all') {
      const catLower = selectedCategory.toLowerCase();
      const catStem = catLower.endsWith('s') && catLower.length > 4 ? catLower.slice(0, -1) : catLower;

      result = result.filter((d) => {
        const dc = (d.category || '').toLowerCase();
        const dt = (d.title || '').toLowerCase();

        if (catLower === 'mobiles' || catLower === 'mobile') {
          return (
            dc.includes('mobile') ||
            dc.includes('phone') ||
            /\b(mobile|phone|smartphone|iphone|galaxy|oneplus|realme|redmi|poco|iqoo|pixel|motorola|vivo|oppo|xiaomi)\b/i.test(dt)
          );
        }
        if (catLower === 'laptops' || catLower === 'laptop') {
          return (
            dc.includes('laptop') ||
            /\b(laptop|notebook|macbook|thinkpad|ideapad|vivobook|zenbook|tuf|victus|pavilion|inspiron)\b/i.test(dt)
          );
        }
        if (catLower === 'electronics') {
          return /electron|mobile|phone|laptop|computer|audio|gaming/.test(dc)
            || /\b(cpu|processor|motherboard|ram|ssd|gpu|keyboard|mouse|monitor|earbuds|headphone|speaker|smartwatch|laptop|phone|tablet)\b/i.test(dt);
        }
        if (catLower === 'home') return /home|kitchen|appliance|furniture/.test(dc) || /\b(cookware|casserole|stove|fan|washing machine|refrigerator|vacuum|mattress)\b/i.test(dt);
        if (catLower === 'travel') return /travel|luggage/.test(dc) || /\b(luggage|suitcase|trolley|backpack|travel bag)\b/i.test(dt);
        if (catLower === 'sports') return /sport|fitness/.test(dc) || /\b(dumbbell|treadmill|yoga|gym|cricket|football)\b/i.test(dt);

        return dc.includes(catLower) || dc.includes(catStem) || dt.includes(catLower) || dt.includes(catStem);
      });
    }

    // Store filtering
    if (selectedStore !== 'all') {
      const storeLower = selectedStore.toLowerCase();
      result = result.filter((d) => (d.store || '').toLowerCase() === storeLower || (d.store || '').toLowerCase().includes(storeLower));
    }

    // Tab-based filtering
    if (activeTab === 'saved') {
      result = result.filter((d) => savedDealIds.includes(d.id));
    } else if (activeTab === 'ending_soon') {
      // Popular / High discount
      result = [...result].sort((a, b) => (b.discount_pct || 0) - (a.discount_pct || 0));
    } else if (activeTab === 'best_worth') {
      // Top Value
      result = [...result].sort((a, b) => (b.worth_score || 0) - (a.worth_score || 0));
    }
    if (activeTab === 'home') {
      result = [...result];
      if (sortBy === 'discount') result.sort((a, b) => (b.discount_pct || 0) - (a.discount_pct || 0));
      if (sortBy === 'worth') result.sort((a, b) => (b.worth_score || 0) - (a.worth_score || 0));
      if (sortBy === 'price_low' || sortBy === 'price_high') result.sort((a, b) => {
        const left = a.price && a.price > 0 ? a.price : null;
        const right = b.price && b.price > 0 ? b.price : null;
        if (left == null) return right == null ? 0 : 1;
        if (right == null) return -1;
        return sortBy === 'price_low' ? left - right : right - left;
      });
    }

    return result;
  }, [deals, searchQuery, selectedCategory, selectedStore, activeTab, savedDealIds, sortBy, collectionFilter]);

  const spotlightDeal = useMemo(() => {
    if (!discoveryDeals.length) return null;
    return discoveryDeals.find((d) => d.discount_pct && d.discount_pct >= 50 && d.price > 200 && d.image) || discoveryDeals[0];
  }, [discoveryDeals]);

  const allLoadedStores = useMemo(() => {
    const set = new Set<string>();
    deals.forEach((d) => {
      if (d.store && d.store.trim() && !['all', 'store', 'retail deal', 'unknown', 'deals', 'none'].includes(d.store.toLowerCase())) {
        set.add(d.store.trim());
      }
    });
    return Array.from(set);
  }, [deals]);

  const handleFocusSearch = () => {
    const inputEl = (document.getElementById('search-results-input') || document.getElementById('hero-search-input')) as HTMLInputElement | null;
    if (inputEl) {
      inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => inputEl.focus(), 250);
    }
  };

  const startProductSearch = (query: string) => {
    setCollectionFilter('all');
    setSearchQuery(query.trim());
    setActiveTab('home');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleNavTabChange = (tab: NavTab) => {
    setCollectionFilter('all');
    setIsSubmitOpen(false);
    setActiveTab(tab);
    if (tab === 'home') {
      setSelectedStore('all');
      setSelectedCategory('all');
      setSearchQuery('');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const searchFullScreen = searchQuery.trim().length > 0;

  return (
    <div
      className={`storefront-app${mobileCollectionsOpen ? ' mobile-collections-open' : ''}${mobileDeskOpen ? ' mobile-desk-open' : ''}`}
      style={{
        minHeight: '100vh',
        maxWidth: '100vw',
        overflowX: 'clip',
        backgroundColor: 'var(--bg)',
        color: 'var(--text)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── 0. Global Ambient Mesh Background ── */}
      <div className="ambient-mesh"></div>



      {/* ── 1. Header (Navbar) ── */}
      <Navbar
        activeTab={activeTab}
        onTabChange={handleNavTabChange}
        onSelectCategory={(cat) => { setCollectionFilter('all'); setSelectedCategory(cat); }}
        onOpenLookup={() => {
          setLookupUrl('');
          setIsLookupOpen(true);
        }}
        onOpenSubmit={() => { setIsSubmitOpen(true); setActiveTab('submit_deal'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        onFocusSearch={handleFocusSearch}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenWatches={() => { setLookupInitialTab('watches'); setLookupUrl(''); setIsLookupOpen(true); }}
        onBrowseCollections={() => setMobileCollectionsOpen(v => !v)}
        onOpenCompareTools={() => {
          setActiveTab('home'); setSearchQuery(''); setMobileDeskOpen(true);
          requestAnimationFrame(() => document.getElementById('shopping-desk')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
        }}
        onOpenToolsHub={() => handleOpenToolsHub()}
        isAudioEnabled={isAudioActive}
        onToggleAudio={handleToggleAudio}
        savedCount={savedDealIds.length}
      />

      {/* ── Real-Time Loot Radar Marquee Ticker ── */}
      <MarqueeTicker
        deals={deals}
        loading={loading}
        onSelectDeal={(deal) => {
          setSelectedDetailDeal(deal);
        }}
        onOpenVerify={() => setIsVerifyModalOpen(true)}
      />

      {/* ── Main Tab Router with Smooth Apple/Mobbin Animated Transitions ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex-1 flex flex-col"
        >
          {activeTab === 'ending_soon' ? (
            <TopDiscountsPage
              deals={deals}
              loading={loading}
              onSelectDeal={(d) => setSelectedDetailDeal(d)}
              onToggleSaveDeal={handleToggleSaveDeal}
              savedDealIds={savedDealIds}
              onToggleCompare={handleToggleCompare}
              compareDeals={compareDeals}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onShowToast={showToast}
            />
          ) : activeTab === 'best_worth' ? (
            <WorthScorePage
              deals={deals}
              loading={loading}
              onSelectDeal={(d) => setSelectedDetailDeal(d)}
              onToggleSaveDeal={handleToggleSaveDeal}
              savedDealIds={savedDealIds}
              onToggleCompare={handleToggleCompare}
              compareDeals={compareDeals}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onShowToast={showToast}
            />
          ) : activeTab === 'profile' ? (
            <ProfilePage
              onNavigateTab={handleNavTabChange}
              onOpenLookup={() => {
                setLookupUrl('');
                setIsLookupOpen(true);
              }}
              onOpenSubmit={() => {
                setIsSubmitOpen(true);
                setActiveTab('submit_deal');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onShowToast={showToast}
              isAudioEnabled={isAudioActive}
              onToggleAudio={handleToggleAudio}
            />
          ) : activeTab === 'saved' ? (
            <SavedLootPage
              deals={[...deals, ...savedOffers.filter(saved => !deals.some(deal => deal.id === saved.id))]}
              savedDealIds={savedDealIds}
              onSelectDeal={(d) => setSelectedDetailDeal(d)}
              onToggleSaveDeal={handleToggleSaveDeal}
              onClearAllSaved={handleClearAllSaved}
              onToggleCompare={handleToggleCompare}
              compareDeals={compareDeals}
              onNavigateHome={() => setActiveTab('home')}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onShowToast={showToast}
            />
          ) : activeTab === 'about' ? (
            <div className="flex-1 w-full max-w-[1080px] mx-auto px-4 sm:px-6 pt-8 pb-28 md:pb-12">
              <AboutPage />
            </div>
          ) : activeTab === 'how_we_verify' ? (
            <div className="flex-1 w-full max-w-[1080px] mx-auto px-4 sm:px-6 pt-8 pb-28 md:pb-12">
              <HowWeVerify />
            </div>
          ) : activeTab === 'wall_of_happiness' ? (
            <div className="flex-1 w-full">
              <WallOfHappiness
                onBackToHome={() => setActiveTab('home')}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            </div>
          ) : activeTab === 'contact' ? (
            <div className="flex-1 w-full max-w-[1080px] mx-auto px-4 sm:px-6 pt-8 pb-28 md:pb-12">
              <ContactPage />
            </div>
          ) : activeTab === 'submit_deal' ? (
            <div className="flex-1 w-full max-w-[1080px] mx-auto px-4 sm:px-6 pt-8 pb-28 md:pb-12">
              <SubmitDeal onBackToHome={() => { setIsSubmitOpen(false); setActiveTab('home'); }} />
            </div>
          ) : (
            /* ── Homepage Main Flow ── */
            <div className="w-full flex-1">
              {searchFullScreen ? (
                <SearchResultsHeader
                  query={searchQuery}
                  onQueryChange={setSearchQuery}
                  onSubmit={() => startProductSearch(searchQuery)}
                  onClear={() => setSearchQuery('')}
                  verifiedCount={filteredDeals.length}
                />
              ) : (
                <>
                  {/* ── 2. Hero Section & Decoupled Search ── */}
                  <HeroBanner
                    searchQuery={searchQuery}
                    onSearch={startProductSearch}
                    searchMode={searchMode}
                    onSearchModeChange={(mode) => {
                      setSearchMode(mode);
                      showToast(mode === 'live' ? '🌐 External Store Search Selected' : '⚡ Deal Directory Active');
                    }}
                    onOpenLookup={(url) => {
                      setLookupUrl(url || '');
                      setIsLookupOpen(true);
                    }}
                    highDiscountCount={flashLootCount}
                    onFilterFlashLoot={handleFilterFlashLoot}
                    spotlightDeal={spotlightDeal}
                    spotlightAlternatives={discoveryDeals}
                  />

                  {/* ── 2.5 Flash Category Stories Rail (live deals only) ── */}
                  {/* Curated offers/video placements are deferred until DealFlow controls them.
                  Keep the dormant tile component for that future integration. */}
                  <CategoryStories
                    deals={discoveryDeals}
                    onSelectCategoryFilter={(cat) => {
                      setCollectionFilter('all');
                      setSelectedCategory(cat);
                      const dealGrid = document.getElementById('deals-section');
                      if (dealGrid) {
                        dealGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                  />

                  {/* ── 3. Category Rail (Sticky below header) ── */}
                  <CategoryRail
                    selectedCategory={selectedCategory}
                    onSelectCategory={(cat) => { setCollectionFilter('all'); setSelectedCategory(cat); }}
                  />
                </>
              )}

              {/* ── 4. Deal Toolbar (Store, Category, Sort, Deal Count, View Toggle) ── */}
              <div className={`mobile-shopping-controls ${searchFullScreen ? 'is-search' : ''}`}>
                {!searchFullScreen && <div className="mobile-drops-title"><h2>Latest Drops <span aria-hidden="true">🔥</span></h2><p>Latest directory offers · Check price evidence before buying</p></div>}
                {!searchFullScreen && <button type="button" className="mobile-desk-toggle" aria-expanded={mobileDeskOpen}
                  aria-controls="shopping-desk" onClick={() => setMobileDeskOpen(v => !v)}>
                  <span><strong>Compare & shopping tools</strong><small>Price evidence, shortlists & checkout costs</small></span>
                  <span aria-hidden="true">{mobileDeskOpen ? '−' : '+'}</span>
                </button>}
                <div id="shopping-desk" className={`shopping-desk ${searchFullScreen || mobileDeskOpen ? 'is-open' : ''}`}>
                  {!searchFullScreen && mobileDeskOpen && <div className="shopping-desk-dismiss"><span>Compare & shopping tools</span><button type="button" aria-label="Close compare and shopping tools" onClick={() => setMobileDeskOpen(false)}><X size={20} /><span>Close</span></button></div>}
                  <IntelligenceWorkspace
                    query={searchQuery}
                    offers={[
                      ...filteredDeals.slice(0, searchFullScreen ? 80 : 4).map(d => ({
                        ...d,
                        source_type: searchMode === 'live' ? 'live_store_search' : 'database_verified',
                      })),
                      ...(searchFullScreen ? externalSearchDeals : []),
                    ]}
                    loading={loading || (searchFullScreen && externalSearchLoading)}
                    externalError={searchFullScreen ? externalSearchError : null}
                    onSearch={startProductSearch}
                    onLookup={(url) => { setLookupUrl(url); setIsLookupOpen(true); }}
                    onAlert={(offer) => { setActiveFeatureDeal({ ...offer, category: 'General', posted_at: 0, discount_pct: null }); setIsPriceAlertOpen(true); }}
                  />
                </div>
                <DealToolbar
                  selectedStore={selectedStore}
                  onSelectStore={setSelectedStore}
                  selectedCategory={selectedCategory}
                  onSelectCategory={(cat) => { if (cat !== selectedCategory) setCollectionFilter('all'); setSelectedCategory(cat); }}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  totalDeals={filteredDeals.length}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  availableStores={allLoadedStores}
                />

              </div>
              {collectionFilter !== 'all' && !searchFullScreen && <div className="mobile-active-collection"><span>{collectionFilter === 'loot70' ? '70%+ below listed MRP' : 'Directory offers under ₹499'}</span><button type="button" onClick={() => setCollectionFilter('all')}>Clear collection ×</button></div>}
              {/* ── 5. Deal Section: Latest Verified Deals ── */}
              <section
                id="deals-section"
                className="max-w-[1340px] mx-auto px-4 md:px-6 pt-4 pb-10 w-full"
              >
                {/* ── Active Search Intelligence Telemetry Strip ── */}
                {searchQuery.trim() && !searchFullScreen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 p-3.5 sm:p-4 rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-50/90 via-sky-50/70 to-indigo-50/90 flex flex-wrap items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                        {searchMode === 'live' ? '🌐' : '⚡'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-[#F1F5F9] font-heading">
                            {searchMode === 'live' ? 'External Store Search' : 'Deal Directory'}
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                            {filteredDeals.length} Directory Match{filteredDeals.length === 1 ? '' : 'es'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 m-0 mt-0.5">
                          Query: <span className="font-semibold text-blue-900 font-mono">"{searchQuery}"</span>
                          {searchMode === 'db'
                            ? ' • Natural language budget and device matching across directory offers'
                            : ' • Store coverage and price evidence vary by product'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const next = searchMode === 'db' ? 'live' : 'db';
                          setSearchMode(next);
                          showToast(next === 'live' ? '🌐 External Store Search Selected' : '⚡ Deal Directory Active');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0D1527] hover:bg-slate-50 dark:bg-[#070A11] border border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                      >
                        {searchMode === 'db' ? '🌐 Switch to Live Crawler' : '⚡ Switch to Deal Directory'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold cursor-pointer transition-colors"
                      >
                        Clear ✕
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Section Header */}
                <div className="latest-drops-heading flex items-center justify-between mb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <h2 className="font-heading text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-[#F1F5F9] m-0">
                        <span className="hidden sm:inline">Latest finds</span>
                        <span className="sm:hidden">Latest Drops</span>
                      </h2>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        DIRECTORY
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs sm:text-sm mt-1">
                      Latest directory offers · Check price evidence before buying
                    </p>
                  </div>

                  {/* Deal count */}
                  <span className="font-mono text-xs sm:text-sm text-slate-500 font-semibold">
                    {totalDeals
                      ? `${totalDeals.toLocaleString('en-IN')} drops`
                      : loading
                        ? 'Loading drops…'
                        : 'No directory offers loaded'}
                  </span>
                </div>

                {/* Cards Grid / Empty States */}
                {loading && deals.length > 0 && <div className="commerce-feed-status" role="status"><LoaderCircle size={16} className="commerce-spinner" />Updating offers…</div>}
                {loading && deals.length === 0 ? (
                  <div className="py-8">
                    <DealSkeletonGrid count={8} />
                  </div>
                ) : error && deals.length === 0 ? (
                  <div className="space-y-4">
                    {searchFullScreen && (
                      <ExternalSearchResults
                        query={searchQuery}
                        deals={externalSearchDeals}
                        loading={externalSearchLoading}
                        error={externalSearchError}
                        onCheckHistory={(targetUrl) => {
                          setLookupUrl(targetUrl);
                          setIsLookupOpen(true);
                        }}
                        onOpenGoogleShopping={handleOpenGoogleShopping}
                      />
                    )}
                    <div className="py-12 px-6 text-center max-w-md mx-auto rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1527] shadow-sm">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-3 text-xl">
                        ⚡
                      </div>
                      <h3 className="font-heading font-bold text-slate-900 dark:text-[#F1F5F9] mb-1">
                        Connecting to Deal Stream
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                        Fetching the latest verified loot drops and discounts...
                      </p>
                      <button
                        onClick={() => fetchDeals(0, false)}
                        className="px-5 py-2.5 bg-slate-900 dark:bg-emerald-600 hover:bg-black dark:hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer shadow-sm transition-colors"
                      >
                        Refresh Offers
                      </button>
                    </div>
                  </div>
                ) : filteredDeals.length === 0 ? (
                  <div className="space-y-4">

                    {searchFullScreen && (
                      <ExternalSearchResults
                        query={searchQuery}
                        deals={externalSearchDeals}
                        loading={externalSearchLoading}
                        error={externalSearchError}
                        onCheckHistory={(targetUrl) => {
                          setLookupUrl(targetUrl);
                          setIsLookupOpen(true);
                        }}
                        onOpenGoogleShopping={handleOpenGoogleShopping}
                      />
                    )}

                    <div className="py-10 px-6 text-center max-w-md mx-auto rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1527] shadow-sm">
                      <h3 className="font-heading font-bold text-slate-900 dark:text-[#F1F5F9] mb-2">
                        {loading ? 'Finding matching offers…' : 'No directory deals found'}
                      </h3>
                      <p className="text-xs text-slate-500 mb-4">
                        {loading ? 'Your filters are applied. Matching products are on their way.' : 'Try a broader product name, clear a filter, or search the stores above.'}
                      </p>
                      <button
                        onClick={() => {
                          setSelectedStore('all');
                          setSelectedCategory('all');
                          setSearchQuery('');
                        }}
                        className="px-5 py-2.5 bg-slate-100 dark:bg-[#111C33] hover:bg-slate-200 dark:bg-[#172440] text-slate-900 dark:text-[#F1F5F9] font-bold text-xs rounded-xl border border-slate-300 dark:border-white/20 cursor-pointer transition-colors"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Unified Multi-Store & Google Shopping Radar shown prominently at top when searching */}
                    {searchFullScreen && (
                      <div className="mb-8">
                        <ExternalSearchResults
                          query={searchQuery}
                          deals={externalSearchDeals}
                          loading={externalSearchLoading}
                          error={externalSearchError}
                          onCheckHistory={(targetUrl) => {
                            setLookupUrl(targetUrl);
                            setIsLookupOpen(true);
                          }}
                          onOpenGoogleShopping={handleOpenGoogleShopping}
                        />
                        <div className="mt-8 mb-4 flex items-center justify-between border-t border-slate-200/80 dark:border-white/10 pt-6">
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-700">⚡</span>
                            <h3 className="font-heading text-base font-black text-slate-900 dark:text-[#F1F5F9]">
                              Directory offers ({filteredDeals.length})
                            </h3>
                          </div>
                          <span className="text-xs text-slate-500 font-medium">Directory offers matching “{searchQuery}”</span>
                        </div>
                      </div>
                    )}

                    {/* Responsive Grid: 4 columns desktop, 2 columns mobile */}
                    <div
                      aria-busy={loading}
                      className={viewMode === 'list' ? 'commerce-deal-list grid grid-cols-1 gap-3' : 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5'}
                    >
                      {filteredDeals.map((deal, idx) => (
                        <PublicDealCard
                          key={deal.id}
                          deal={deal}
                          index={idx}
                          isSaved={savedDealIds.includes(deal.id)}
                          isComparing={compareDeals.some((d) => d.id === deal.id)}
                          onToggleSave={handleToggleSaveDeal}
                          onToggleCompare={handleToggleCompare}
                          onShowToast={showToast}
                          onSelectDeal={(d) => setSelectedDetailDeal(d)}
                          onOpenImage={setSelectedPhotoDeal}
                          onOpenPriceAlert={(d) => {
                            setActiveFeatureDeal(d);
                            setIsPriceAlertOpen(true);
                          }}
                          onOpenExchange={(d) => {
                            setActiveFeatureDeal(d);
                            setIsTradeInOpen(true);
                          }}
                        />
                      ))}
                    </div>



                    {/* Load More Button */}
                    {hasMore && filteredDeals.length > 0 && (
                      <div className="text-center mt-10">
                        <button
                          onClick={handleLoadMore}
                          disabled={loading || loadingMore}
                          className="commerce-load-more"
                          aria-busy={loadingMore}
                        >
                          {loadingMore ? <LoaderCircle size={18} className="commerce-spinner" /> : <ArrowDown size={18} />}
                          {loadingMore ? 'Loading more finds…' : 'Discover more deals'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </section>

              {/* ── 6. Price Lookup CTA Strip ── */}
              <PriceLookupStrip
                onOpenLookup={() => {
                  setLookupUrl('');
                  setIsLookupOpen(true);
                }}
              />

              {/* ── 7. Trust / Verification Strip ── */}
              <TrustStrip />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── 8. Footer ── */}
      <Footer
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenLegal={(type) => setActiveLegal(type)}
        onOpenLookup={() => {
          setLookupUrl('');
          setIsLookupOpen(true);
        }}
        onOpenSubmit={() => { setIsSubmitOpen(true); setActiveTab('submit_deal'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
      />

      {/* ── 9. Mobile Bottom Navigation (md:hidden) ── */}
      <MobileNav
        activeTab={activeTab}
        onTabChange={handleNavTabChange}
        onOpenLookup={() => {
          setLookupUrl('');
          setIsLookupOpen(true);
        }}
        onOpenSubmit={() => { setIsSubmitOpen(true); setActiveTab('submit_deal'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        onFocusSearch={() => setIsCommandPaletteOpen(true)}
        savedCount={savedDealIds.length}
      />

      {/* ── Deal Detail Modal (Opens when card clicked) ── */}
      <RecoveryBoundary compact resetKey={selectedDetailDeal?.id || 'closed'} onRecover={() => setSelectedDetailDeal(null)}>
        <DealDetailModal
          deal={selectedDetailDeal}
          onOpenImage={setSelectedPhotoDeal}
          onClose={() => setSelectedDetailDeal(null)}
          onShowToast={showToast}
          onToggleSave={handleToggleSaveDeal}
          onOpenTool={(toolId) => handleOpenToolsHub(toolId as ToolId)}
        />

      </RecoveryBoundary>

      <ImageModal deal={selectedPhotoDeal} onClose={() => setSelectedPhotoDeal(null)} />

      {/* ── Price Lookup Tool Modal ── */}
      <DealLookupModal
        isOpen={isLookupOpen}
        onClose={() => { setIsLookupOpen(false); setLookupInitialTab('analyzer'); }}
        initialUrl={lookupUrl}
        initialTab={lookupInitialTab}
      />

      {/* ── Google Shopping & Pan-India Discovery Radar Modal (In-App) ── */}
      <GoogleShoppingDiscoveryModal
        isOpen={isGoogleShoppingOpen}
        initialQuery={googleShoppingQuery || searchQuery || debouncedSearch}
        onClose={() => setIsGoogleShoppingOpen(false)}
        onOpenLookup={(url) => {
          setLookupUrl(url);
          setIsLookupOpen(true);
        }}
        onShowToast={showToast}
      />

      {/* ── Legal / Terms Modal ── */}
      <LegalModal
        type={activeLegal}
        onClose={() => setActiveLegal(null)}
      />

      {/* ── Autonomous Deal Verification Pipeline Modal ── */}
      <HowDealsWorkModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        onViewFullPage={() => {
          setIsVerifyModalOpen(false);
          setActiveTab('how_we_verify');
        }}
      />



      {/* ── Apple Spotlight / Command Palette ── */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        deals={deals}
        onSelectDeal={(deal) => {
          setSelectedDetailDeal(deal);
        }}
        onSearchSubmit={startProductSearch}
        onOpenTool={handleOpenToolsHub}
      />

      {/* ── Multi-Deal Comparison Drawer & Floating Dock ── */}
      <CompareDrawer
        compareDeals={compareDeals}
        isOpen={isCompareModalOpen}
        onOpenModal={() => setIsCompareModalOpen(true)}
        onCloseModal={() => setIsCompareModalOpen(false)}
        onOpenSpecs={() => { setIsCompareModalOpen(false); setIsSpecCompareOpen(true); }}
        onRemoveDeal={handleRemoveCompareDeal}
        onClearAll={handleClearCompareAll}
      />

      {/* ── Product Spec Comparison Modal (Detailed Tech Specs, 5% Cashback, GST ITC) ── */}
      <ProductSpecCompareModal
        isOpen={isSpecCompareOpen && compareDeals.length > 0}
        onClose={() => setIsSpecCompareOpen(false)}
        onBack={() => { setIsSpecCompareOpen(false); setIsCompareModalOpen(true); }}
        deals={compareDeals}
        onRemoveDeal={handleRemoveCompareDeal}
        onClearAll={handleClearCompareAll}
      />



      {/* ── Target Price Drop Alert Modal (Wired to MongoDB PriceAlerts) ── */}
      <PriceDropAlertModal
        isOpen={isPriceAlertOpen}
        onClose={() => setIsPriceAlertOpen(false)}
        deal={activeFeatureDeal}
        onSuccessToast={showToast}
      />

      {/* ── Old Phone Trade-In & Exchange Estimator Modal (Condition grading & cash-in value) ── */}
      <PhoneExchangeEstimatorModal
        isOpen={isTradeInOpen}
        onClose={() => setIsTradeInOpen(false)}
        deal={activeFeatureDeal}
      />

      {/* ── Shopping Utilities & Loot Lab Suite (EMI, Shrinkflation, Energy, Warranties, Budgeting) ── */}
      <DeferredToolsHub
        isOpen={isToolsHubOpen}
        onClose={() => setIsToolsHubOpen(false)}
        initialToolId={activeToolId}
      />

      {/* ── Floating Action Toast ── */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-[calc(76px+env(safe-area-inset-bottom,0px))] md:bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-[200] bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center gap-2 text-white text-xs font-heading font-semibold shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150 max-w-[calc(100vw-32px)]"
        >
          <span className="text-emerald-400 font-bold">✓</span>
          <span className="truncate">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default App;
