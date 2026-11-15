import React from 'react';
import { ShoppingArtwork } from './ShoppingArtwork';

interface PriceLookupStripProps {
  onOpenLookup: () => void;
}

export const PriceLookupStrip: React.FC<PriceLookupStripProps> = ({ onOpenLookup }) => {
  return (
    <div className="max-w-[1340px] mx-auto px-4 md:px-6 my-10 w-full">
      <div className="relative rounded-2xl bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Left Content */}
        <div className="flex items-start sm:items-center gap-4 sm:gap-5 max-w-2xl">
          {/* Emblem */}
          <ShoppingArtwork className="shopping-artwork-inline" />

          <div>
            <h3 className="font-heading text-lg sm:text-xl font-black text-slate-900 dark:text-[#F1F5F9] tracking-tight leading-snug">
              Wondering if a deal is actually genuine?
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed">
              Paste a specific product link to inspect available price observations. History coverage varies; confirm the final price with the merchant.
            </p>
          </div>
        </div>

        {/* Right CTA Button */}
        <button
          type="button"
          onClick={onOpenLookup}
          className="h-10 px-6 rounded-full bg-[#0066cc] hover:bg-[#0071e3] text-white font-semibold text-xs sm:text-sm tracking-tight shadow-xs active:scale-98 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap self-stretch sm:self-auto justify-center"
        >
          <span>Analyze Any Product Link</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 10L10 2M10 2H4M10 2V8" />
          </svg>
        </button>
      </div>
    </div>
  );
};
