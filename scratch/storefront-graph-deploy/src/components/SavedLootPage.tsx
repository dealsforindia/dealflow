import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { PublicDeal } from '../types';
import { PublicDealCard } from './PublicDealCard';
import { ShoppingArtwork } from './ShoppingArtwork';

interface SavedLootPageProps {
  deals: PublicDeal[];
  savedDealIds: string[];
  onSelectDeal: (deal: PublicDeal) => void;
  onToggleSaveDeal: (deal: PublicDeal) => void;
  onClearAllSaved: () => void;
  onToggleCompare: (deal: PublicDeal) => void;
  compareDeals: PublicDeal[];
  onNavigateHome: () => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onShowToast?: (msg: string) => void;
}

export const SavedLootPage: React.FC<SavedLootPageProps> = ({
  deals,
  savedDealIds,
  onSelectDeal,
  onToggleSaveDeal,
  onClearAllSaved,
  onToggleCompare,
  compareDeals,
  onNavigateHome,
  viewMode,
  onViewModeChange,
  onShowToast,
}) => {
  const [searchFilter, setSearchFilter] = useState<string>('');
  const availableSavedCount = deals.filter(deal => savedDealIds.includes(deal.id)).length;

  const savedDeals = useMemo(() => {
    let list = deals.filter((d) => savedDealIds.includes(d.id));

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.category?.toLowerCase().includes(q) ||
          d.store?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [deals, savedDealIds, searchFilter]);

  return (
    <div className="w-full max-w-[1340px] mx-auto px-4 md:px-6 pt-6 pb-28 md:pb-12">
      {/* ── Page Header (Mobbin / Apple Inspired) ── */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold mb-3">
          <span>❤️</span>
          <span>SAVED LOOT VAULT</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-[#F1F5F9] tracking-tight">
              Your Bookmarked Deals
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
              Quickly compare, monitor, and claim the deals you've saved. Bookmarks are stored locally on your device.
            </p>
          </div>

          {savedDealIds.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClearAllSaved}
                className="px-4 py-2 rounded-full border border-rose-200 text-rose-700 bg-rose-50/50 hover:bg-rose-100 text-xs font-semibold transition-colors cursor-pointer"
              >
                Clear All ({savedDealIds.length})
              </button>
              <button
                type="button"
                onClick={onNavigateHome}
                className="px-4 py-2 rounded-full bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                Find More Deals →
              </button>
            </div>
          )}
        </div>
      </div>

      {availableSavedCount > 0 ? (
        <>
          {/* ── Filter & View Toolbar ── */}
          <div className="bg-white/80 dark:bg-[#0D1527]/80 backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-white/10 p-4 mb-6 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Search saved deals..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="px-3.5 py-1.5 rounded-full bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-800 dark:text-[#F8FAFC] focus:outline-none focus:border-blue-500 focus:bg-white dark:bg-[#0D1527] w-full transition-all"
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">
                <strong className="text-slate-800 dark:text-[#F8FAFC] font-semibold">{savedDeals.length}</strong> deal{savedDeals.length === 1 ? '' : 's'} saved
              </span>

              <div className="hidden sm:flex items-center rounded-full bg-slate-100 dark:bg-[#111C33] p-0.5 border border-slate-200 dark:border-white/10">
                <button
                  onClick={() => onViewModeChange('grid')}
                  className={`p-1.5 rounded-full transition-colors ${
                    viewMode === 'grid' ? 'bg-white dark:bg-[#0D1527] text-slate-900 dark:text-[#F1F5F9] shadow-2xs' : 'text-slate-500 hover:text-slate-800 dark:text-[#F8FAFC]'
                  }`}
                  title="Grid View"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                </button>
                <button
                  onClick={() => onViewModeChange('list')}
                  className={`p-1.5 rounded-full transition-colors ${
                    viewMode === 'list' ? 'bg-white dark:bg-[#0D1527] text-slate-900 dark:text-[#F1F5F9] shadow-2xs' : 'text-slate-500 hover:text-slate-800 dark:text-[#F8FAFC]'
                  }`}
                  title="List View"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* ── Deals Grid ── */}
          <motion.div
            layout
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5'
                : 'commerce-deal-list flex flex-col gap-3'
            }
          >
            {savedDeals.map((deal, idx) => (
              <PublicDealCard
                key={deal.id}
                deal={deal}
                index={idx}
                onSelectDeal={onSelectDeal}
                onToggleSave={onToggleSaveDeal}
                isSaved={true}
                onToggleCompare={onToggleCompare}
                isComparing={compareDeals.some((d) => d.id === deal.id)}
                onShowToast={onShowToast}
              />
            ))}
          </motion.div>
          {savedDeals.length === 0 && <div className="commerce-feed-status" role="status"><span>No saved offers match your search.</span><button type="button" onClick={() => setSearchFilter('')}>Clear search</button></div>}
        </>
      ) : (
        /* ── Empty State (Apple / Mobbin Design Language) ── */
        <div className="max-w-md mx-auto my-12 text-center p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-white/10 shadow-sm">
          <ShoppingArtwork className="shopping-artwork-empty" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-[#F1F5F9] tracking-tight">{savedDealIds.length ? 'Your earlier bookmarks are still saved' : 'Your Loot Vault is Empty'}</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            {savedDealIds.length ? 'These older bookmarks contain IDs only. Load their original offers again to recover the product cards. New bookmarks now retain their product details.' : 'Save a deal with the bookmark icon to revisit and compare it here. Saved prices are snapshots; confirm them before buying.'}
          </p>
          <button
            type="button"
            onClick={onNavigateHome}
            className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer"
          >
            <span>⚡ Browse Latest Deals</span>
          </button>
        </div>
      )}
    </div>
  );
};
