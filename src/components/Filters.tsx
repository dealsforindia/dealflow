import React from 'react';
import { SortOption } from '../types';
import { Store, Layers, ArrowUpDown, Smartphone, Shirt, Home, Utensils, Apple, Sparkles, CheckCircle2 } from 'lucide-react';

interface FiltersProps {
  selectedStore: string;
  onSelectStore: (store: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalDeals: number;
}

const STORES = [
  { id: 'all', label: 'All Stores' },
  { id: 'Amazon', label: 'Amazon' },
  { id: 'Flipkart', label: 'Flipkart' },
  { id: 'Myntra', label: 'Myntra' },
  { id: 'AJIO', label: 'AJIO' },
  { id: 'Swiggy', label: 'Swiggy' },
  { id: 'Croma', label: 'Croma' },
  { id: 'Blinkit', label: 'Blinkit' },
];

const CATEGORIES = [
  { id: 'all', label: 'All Categories', icon: Layers },
  { id: 'Electronics', label: 'Electronics', icon: Smartphone },
  { id: 'Fashion', label: 'Fashion', icon: Shirt },
  { id: 'Home', label: 'Home & Living', icon: Home },
  { id: 'Kitchen', label: 'Kitchenware', icon: Utensils },
  { id: 'Grocery', label: 'Grocery', icon: Apple },
  { id: 'Beauty', label: 'Beauty', icon: Sparkles },
];

export const Filters: React.FC<FiltersProps> = ({
  selectedStore,
  onSelectStore,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  totalDeals,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 space-y-4" role="region" aria-label="Deal Filters and Sorting">
      
      {/* Top Filter Bar: Store Pills + Sort Dropdown */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        
        {/* Store Pills (Horizontal Scroll on Mobile) */}
        <div 
          className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none"
          role="group"
          aria-label="Filter by Store"
        >
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider mr-1.5 flex items-center gap-1 shrink-0 font-mono">
            <Store className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" /> Store:
          </span>
          {STORES.map((s) => {
            const isSelected = selectedStore.toLowerCase() === s.id.toLowerCase();
            return (
              <button
                key={s.id}
                onClick={() => onSelectStore(s.id)}
                className={`min-h-[38px] px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border cursor-pointer select-none focus-ring ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 border-emerald-400 font-black shadow-md shadow-emerald-500/25 active:scale-95'
                    : 'bg-[#0E1424] text-slate-300 border-white/[0.08] hover:border-white/20 hover:text-white hover:bg-white/[0.05]'
                }`}
                aria-pressed={isSelected}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Right Sort Controls & Live Count Badge */}
        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto shrink-0">
          <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3.5 py-2 rounded-xl border border-emerald-500/25 flex items-center gap-2 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{totalDeals} Verified Drops</span>
          </span>

          <div className="flex items-center gap-2 bg-[#0E1424] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/40 focus-within:border-emerald-500/50">
            <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              aria-label="Sort deals"
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer pr-1 text-xs"
            >
              <option value="worth" className="bg-[#0E1424] text-white">
                ✨ Best Worth Index
              </option>
              <option value="newest" className="bg-[#0E1424] text-white">
                ⚡ Ending Soon
              </option>
              <option value="discount" className="bg-[#0E1424] text-white">
                🔥 Highest % Off
              </option>
              <option value="price_low" className="bg-[#0E1424] text-white">
                🏷️ Price: Low to High
              </option>
              <option value="price_high" className="bg-[#0E1424] text-white">
                💎 Price: High to Low
              </option>
            </select>
          </div>
        </div>

      </div>

      {/* Category Pills Bar with Vector Lucide Icons */}
      <div 
        className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1"
        role="group"
        aria-label="Filter by Category"
      >
        <span className="text-xs font-black text-slate-400 uppercase tracking-wider mr-1.5 flex items-center gap-1 shrink-0 font-mono">
          <Layers className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" /> Category:
        </span>
        {CATEGORIES.map((c) => {
          const isSelected = selectedCategory.toLowerCase() === c.id.toLowerCase();
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              onClick={() => onSelectCategory(c.id)}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border flex items-center gap-2 cursor-pointer select-none focus-ring ${
                isSelected
                  ? 'bg-white text-slate-950 border-white font-black shadow-md active:scale-95'
                  : 'bg-[#0E1424] text-slate-300 border-white/[0.08] hover:border-white/20 hover:text-white hover:bg-white/[0.05]'
              }`}
              aria-pressed={isSelected}
            >
              <Icon className="w-3.5 h-3.5 shrink-0 text-emerald-400" aria-hidden="true" />
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
};
