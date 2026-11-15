import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { PublicDeal } from '../types';
import { PublicDealCard } from './PublicDealCard';
import { DealSkeletonGrid } from './DealSkeleton';

interface WorthScorePageProps {
  deals: PublicDeal[];
  loading: boolean;
  onSelectDeal: (deal: PublicDeal) => void;
  onToggleSaveDeal: (deal: PublicDeal) => void;
  savedDealIds: string[];
  onToggleCompare: (deal: PublicDeal) => void;
  compareDeals: PublicDeal[];
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onShowToast?: (msg: string) => void;
}

const STORES = ['all', 'amazon', 'flipkart', 'myntra', 'ajio', 'swiggy', 'zepto'];

export const WorthScorePage: React.FC<WorthScorePageProps> = ({
  deals,
  loading,
  onSelectDeal,
  onToggleSaveDeal,
  savedDealIds,
  onToggleCompare,
  compareDeals,
  viewMode,
  onViewModeChange,
  onShowToast,
}) => {
  const [minScore, setMinScore] = useState<number>(0); // 0 = all, 90, 80, 70
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const sortedDeals = useMemo(() => {
    let list = [...deals].sort((a, b) => (b.worth_score || 0) - (a.worth_score || 0));

    if (minScore > 0) {
      list = list.filter((d) => (d.worth_score || 0) >= minScore);
    }

    if (selectedStore !== 'all') {
      list = list.filter((d) => d.store?.toLowerCase().includes(selectedStore.toLowerCase()));
    }

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
  }, [deals, minScore, selectedStore, searchFilter]);

  return (
    <div className="w-full max-w-[1340px] mx-auto px-4 md:px-6 pt-6 pb-28 md:pb-12">
      {/* ── Page Header (Mobbin / Apple Inspired) ── */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-3">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span>ALGORITHMIC VALUE LEADERBOARD</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-[#F1F5F9] tracking-tight">
          Highest Worth Score Deals
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Offers ranked by a 0–100 heuristic using the supplied discount, price and store fields. This score is a browsing aid; it does not verify seller credibility, authenticity or a historical low.
        </p>
      </div>

      {/* ── Filters & Controls Toolbar ── */}
      <div className="bg-white/80 dark:bg-[#0D1527]/80 backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-white/10 p-4 mb-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Worth Score Tier Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
            Worth Tier:
          </span>
          {[
            { label: 'All Scores', value: 0 },
            { label: '💎 Score 90+ (God Tier)', value: 90 },
            { label: '🔥 Score 80+ (Great Value)', value: 80 },
            { label: '⚡ Score 70+ (Solid Buy)', value: 70 },
          ].map((tier) => (
            <button
              key={tier.value}
              onClick={() => setMinScore(tier.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                minScore === tier.value
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-[#111C33] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#1E293B]/70 dark:bg-[#172440]/70 hover:text-slate-900 dark:text-[#F1F5F9]'
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>

        {/* Right: Search + Store Filter + View Toggle */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <input
            type="text"
            placeholder="Search deals..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="px-3.5 py-1.5 rounded-full bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-800 dark:text-[#F8FAFC] focus:outline-none focus:border-blue-500 focus:bg-white dark:bg-[#0D1527] w-full sm:w-44 transition-all"
          />

          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="px-3 py-1.5 rounded-full bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 capitalize cursor-pointer"
          >
            {STORES.map((s) => (
              <option key={s} value={s}>
                {s === 'all' ? 'All Stores' : s}
              </option>
            ))}
          </select>

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

      {/* ── Status Bar ── */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-4 px-1">
        <span>
          Showing <strong className="text-slate-800 dark:text-[#F8FAFC] font-semibold">{sortedDeals.length}</strong> top-rated deals
          {minScore > 0 && <span> with Worth Score &ge;{minScore}</span>}
        </span>
        <span className="text-[11px] font-mono text-blue-600 font-semibold">
          💎 Mathematical ROI Ranking
        </span>
      </div>

      {/* ── Deal Grid ── */}
      {loading && sortedDeals.length === 0 ? (
        <DealSkeletonGrid count={8} />
      ) : sortedDeals.length > 0 ? (
        <motion.div
          layout
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5'
              : 'commerce-deal-list flex flex-col gap-3'
          }
        >
          {sortedDeals.map((deal, idx) => (
            <PublicDealCard
              key={deal.id}
              deal={deal}
              index={idx}
              onSelectDeal={onSelectDeal}
              onToggleSave={onToggleSaveDeal}
              isSaved={savedDealIds.includes(deal.id)}
              onToggleCompare={onToggleCompare}
              isComparing={compareDeals.some((d) => d.id === deal.id)}
              onShowToast={onShowToast}
            />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-16 px-4 bg-white dark:bg-[#0D1527] rounded-2xl border border-slate-200 dark:border-white/10">
          <div className="text-4xl mb-3">💎</div>
          <h3 className="text-base font-bold text-slate-800 dark:text-[#F8FAFC]">No deals match this score tier</h3>
          <p className="text-xs text-slate-500 mt-1">Try selecting All Scores or a different store filter.</p>
          <button
            onClick={() => {
              setMinScore(0);
              setSelectedStore('all');
              setSearchFilter('');
            }}
            className="mt-4 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
