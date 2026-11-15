import { useModalSurface } from '../utils/useModalSurface';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { SortOption } from '../types';

interface DealToolbarProps {
  selectedStore: string;
  onSelectStore: (store: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalDeals?: number;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  availableStores?: string[];
}

const DEFAULT_STORES = [
  { id: 'all', label: 'All Stores' },
  { id: 'Amazon', label: 'Amazon' },
  { id: 'Flipkart', label: 'Flipkart' },
  { id: 'Myntra', label: 'Myntra' },
  { id: 'AJIO', label: 'AJIO' },
  { id: 'Croma', label: 'Croma' },
  { id: 'Nykaa', label: 'Nykaa' },
  { id: 'Zepto', label: 'Zepto' },
  { id: 'Swiggy', label: 'Swiggy' },
  { id: 'Blinkit', label: 'Blinkit' },
];

const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'Mobiles', label: '📱 Mobiles & 5G' },
  { id: 'Electronics', label: '🔌 Electronics' },
  { id: 'Laptops', label: '💻 Laptops' },
  { id: 'Fashion', label: '👗 Fashion' },
  { id: 'Home', label: '🏠 Home' },
  { id: 'Grocery', label: '🍎 Grocery' },
  { id: 'Beauty', label: '💄 Beauty' },
  { id: 'Sports', label: '🏋️ Sports' },
  { id: 'Automotive', label: '🚗 Automotive' },
  { id: 'Travel', label: '✈️ Travel' },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: '⏰ Sort: Latest Drops' },
  { value: 'discount', label: '🔥 Sort: Highest % Off' },
  { value: 'worth', label: '🏆 Sort: Top Value Score' },
  { value: 'price_low', label: '🏷️ Sort: Price: Low to High' },
  { value: 'price_high', label: '💎 Sort: Price: High to Low' },
];

export const DealToolbar: React.FC<DealToolbarProps> = ({
  selectedStore,
  onSelectStore,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  totalDeals = 0,
  viewMode = 'grid',
  onViewModeChange,
  availableStores,
}) => {
  const [storeOpen, setStoreOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const [draftStore, setDraftStore] = useState(selectedStore);
  const [draftCat, setDraftCat] = useState(selectedCategory);
  const [draftSort, setDraftSort] = useState(sortBy);

  const drawerRef = useModalSurface(mobileDrawerOpen, () => setMobileDrawerOpen(false));
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const storeRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (storeRef.current && !storeRef.current.contains(e.target as Node)) {
        setStoreOpen(false);
      }
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openMobileDrawer = () => {
    setDraftStore(selectedStore);
    setDraftCat(selectedCategory);
    setDraftSort(sortBy);
    setMobileDrawerOpen(true);
  };

  const applyMobileDrawer = () => {
    onSelectStore(draftStore);
    onSelectCategory(draftCat);
    onSortChange(draftSort);
    setMobileDrawerOpen(false);
  };

  const storeList = useMemo(() => {
    const set = new Set<string>();
    DEFAULT_STORES.filter(s => s.id !== 'all').forEach(s => set.add(s.id));
    if (availableStores) {
      availableStores.forEach(s => {
        if (s && s.trim() && !['all', 'store', 'retail deal', 'unknown', 'deals', 'none'].includes(s.toLowerCase())) {
          set.add(s.trim());
        }
      });
    }
    const sorted = Array.from(set).sort((a, b) => a.localeCompare(b));
    return [
      { id: 'all', label: 'All Stores' },
      ...sorted.map(s => ({ id: s, label: s }))
    ];
  }, [availableStores]);

  const desktopStoreLabel = storeList.find((s) => s.id.toLowerCase() === selectedStore.toLowerCase())?.label || (selectedStore !== 'all' ? selectedStore : 'All Stores');
  const desktopCatLabel = CATEGORIES.find((c) => c.id === selectedCategory)?.label || 'All Categories';
  const desktopSortLabel = SORT_OPTIONS.find((s) => s.value === sortBy)?.label || 'Sort: Latest';

  return (
    <>
      <div className="deal-toolbar max-w-[1340px] mx-auto px-4 md:px-6 pt-5 pb-3 flex items-center justify-between gap-3 w-full">
        {/* ── Desktop: Left Filter Popovers ── */}
        <div className="hidden md:flex items-center gap-2.5 flex-wrap">
          {/* Store Dropdown */}
          <div ref={storeRef} className="relative">
            <button
              type="button"
              onClick={() => { setStoreOpen(!storeOpen); setCatOpen(false); setSortOpen(false); }}
              aria-expanded={storeOpen}
              className={`h-8.5 px-4 rounded-full text-[12.5px] font-medium flex items-center gap-2 border transition-all cursor-pointer ${
                selectedStore !== 'all'
                  ? 'bg-[#0066cc]/10 text-[#0066cc] border-[#0066cc]/30 font-semibold shadow-xs'
                  : 'bg-white dark:bg-[#0D1527] hover:bg-slate-50 dark:bg-[#070A11] text-slate-700 dark:text-slate-200 border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:border-white/20 shadow-2xs'
              }`}
            >
              <span>{desktopStoreLabel}</span>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={`transition-transform duration-150 ${storeOpen ? 'rotate-180' : ''}`}>
                <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <AnimatePresence>
              {storeOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-full left-0 mt-2 w-48 max-h-72 overflow-y-auto rounded-2xl bg-white/95 dark:bg-[#0D1527]/95 backdrop-blur-md border border-slate-200/80 dark:border-white/10 p-1.5 shadow-xl z-50"
                >
                  {storeList.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { onSelectStore(s.id); setStoreOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-colors text-left ${
                        selectedStore.toLowerCase() === s.id.toLowerCase()
                          ? 'bg-[#0066cc]/10 text-[#0066cc] font-semibold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <span className="truncate">{s.label}</span>
                      {selectedStore.toLowerCase() === s.id.toLowerCase() && <span className="text-[#0066cc] ml-1">✓</span>}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Category Dropdown */}
          <div ref={catRef} className="relative">
            <button
              type="button"
              onClick={() => { setCatOpen(!catOpen); setStoreOpen(false); setSortOpen(false); }}
              aria-expanded={catOpen}
              className={`h-8.5 px-4 rounded-full text-[12.5px] font-medium flex items-center gap-2 border transition-all cursor-pointer ${
                selectedCategory !== 'all'
                  ? 'bg-[#0066cc]/10 text-[#0066cc] border-[#0066cc]/30 font-semibold shadow-xs'
                  : 'bg-white dark:bg-[#0D1527] hover:bg-slate-50 dark:bg-[#070A11] text-slate-700 dark:text-slate-200 border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:border-white/20 shadow-2xs'
              }`}
            >
              <span>{desktopCatLabel}</span>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={`transition-transform duration-150 ${catOpen ? 'rotate-180' : ''}`}>
                <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <AnimatePresence>
              {catOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-full left-0 mt-2 w-48 rounded-2xl bg-white/95 dark:bg-[#0D1527]/95 backdrop-blur-md border border-slate-200/80 dark:border-white/10 p-1.5 shadow-xl z-50"
                >
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { onSelectCategory(c.id); setCatOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-colors text-left ${
                        selectedCategory === c.id
                          ? 'bg-[#0066cc]/10 text-[#0066cc] font-semibold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:bg-[#070A11]'
                      }`}
                    >
                      <span>{c.label}</span>
                      {selectedCategory === c.id && <span className="text-[#0066cc]">✓</span>}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sort Dropdown */}
          <div ref={sortRef} className="relative">
            <button
              type="button"
              onClick={() => { setSortOpen(!sortOpen); setStoreOpen(false); setCatOpen(false); }}
              aria-expanded={sortOpen}
              className={`h-8.5 px-4 rounded-full text-[12.5px] font-medium flex items-center gap-2 border transition-all cursor-pointer ${
                sortBy !== 'newest'
                  ? 'bg-[#0066cc]/10 text-[#0066cc] border-[#0066cc]/30 font-semibold shadow-xs'
                  : 'bg-white dark:bg-[#0D1527] hover:bg-slate-50 dark:bg-[#070A11] text-slate-700 dark:text-slate-200 border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:border-white/20 shadow-2xs'
              }`}
            >
              <span>{desktopSortLabel}</span>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={`transition-transform duration-150 ${sortOpen ? 'rotate-180' : ''}`}>
                <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-full left-0 mt-2 w-56 rounded-2xl bg-white/95 dark:bg-[#0D1527]/95 backdrop-blur-md border border-slate-200/80 dark:border-white/10 p-1.5 shadow-xl z-50"
                >
                  {SORT_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      onClick={() => { onSortChange(o.value); setSortOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-colors text-left ${
                        sortBy === o.value
                          ? 'bg-[#0066cc]/10 text-[#0066cc] font-semibold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:bg-[#070A11]'
                      }`}
                    >
                      <span>{o.label}</span>
                      {sortBy === o.value && <span className="text-[#0066cc]">✓</span>}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Mobile: Filter & Sort Button ── */}
        <div className="flex md:hidden items-center justify-between w-full">
          <button
            type="button"
            ref={filterTriggerRef}
            aria-haspopup="dialog"
            aria-expanded={mobileDrawerOpen}
            onClick={openMobileDrawer}
            className="h-9 px-3.5 rounded-xl bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-[#F8FAFC] flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
            </svg>
            <span>Filter & Sort</span>
            <span className="text-slate-400">›</span>
          </button>

          <span className="font-mono text-xs text-slate-500 font-semibold">
            {totalDeals.toLocaleString('en-IN')} drops
          </span>
        </div>

        {/* ── Desktop Right: Deals Count & View Grid/List Toggles ── */}
        <div className="hidden md:flex items-center gap-3.5 ml-auto">
          <span className="font-mono text-xs font-semibold text-slate-500">
            {totalDeals.toLocaleString('en-IN')} loaded offers
          </span>

          {onViewModeChange && (
            <div className="flex items-center bg-slate-100 dark:bg-[#111C33] rounded-xl p-0.5 gap-0.5 border border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => onViewModeChange('grid')}
                title="Grid view"
                aria-label="Grid view"
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white dark:bg-[#0D1527] text-slate-900 dark:text-[#F1F5F9] shadow-2xs' : 'text-slate-500 hover:text-slate-900 dark:text-[#F1F5F9]'
                }`}
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="2" y="2" width="5" height="5" rx="1" />
                  <rect x="9" y="2" width="5" height="5" rx="1" />
                  <rect x="2" y="9" width="5" height="5" rx="1" />
                  <rect x="9" y="9" width="5" height="5" rx="1" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => onViewModeChange('list')}
                title="List view"
                aria-label="List view"
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-white dark:bg-[#0D1527] text-slate-900 dark:text-[#F1F5F9] shadow-2xs' : 'text-slate-500 hover:text-slate-900 dark:text-[#F1F5F9]'
                }`}
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <line x1="3" y1="5" x2="13" y2="5" strokeLinecap="round" />
                  <line x1="3" y1="8" x2="13" y2="8" strokeLinecap="round" />
                  <line x1="3" y1="11" x2="13" y2="11" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Portal contains the animation, so presence filtering cannot discard the drawer. */}
      {createPortal(<AnimatePresence>{mobileDrawerOpen && <motion.div key="filters" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="commerce-sheet-backdrop" onClick={() => setMobileDrawerOpen(false)}>
        <div ref={drawerRef} className="commerce-product-sheet commerce-filter-sheet" role="dialog" aria-modal="true" aria-label="Filter and sort offers" onClick={event => event.stopPropagation()}>
          <div className="commerce-sheet-handle" aria-hidden="true" />
          <header><div><small>MAKE IT YOURS</small><h2>Filter & sort</h2></div><button type="button" aria-label="Close filters" onClick={() => setMobileDrawerOpen(false)}>✕</button></header>
          <label className="commerce-filter-field">Store<select value={draftStore} onChange={event => setDraftStore(event.target.value)}>{storeList.map(store => <option key={store.id} value={store.id}>{store.label}</option>)}</select></label>
          <label className="commerce-filter-field">Category<select value={draftCat} onChange={event => setDraftCat(event.target.value)}>{CATEGORIES.map(category => <option key={category.id} value={category.id}>{category.label.replace(/^[^a-zA-Z]+/, '')}</option>)}</select></label>
          <label className="commerce-filter-field">Sort by<select value={draftSort} onChange={event => setDraftSort(event.target.value as SortOption)}>{SORT_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label.replace(/^[^a-zA-Z]+/, '').replace('Sort: ', '')}</option>)}</select></label>
          <div className="commerce-filter-footer"><button type="button" onClick={() => { setDraftStore('all'); setDraftCat('all'); setDraftSort('newest'); }}>Reset</button><button type="button" onClick={applyMobileDrawer}>Show results</button></div>
        </div>
      </motion.div>}</AnimatePresence>, document.body)}
    </>
  );
};
