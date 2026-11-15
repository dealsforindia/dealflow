import React from 'react';
import { openGoogleShoppingModal } from '../utils/googleShopping';

interface BroadStoreSearchProps {
  query: string;
  compact?: boolean;
}

const STORE_SEARCHES = [
  {
    name: 'Amazon',
    label: 'Search Amazon catalog',
    tone: 'border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100',
    buildUrl: (query: string) => `https://www.amazon.in/s?k=${encodeURIComponent(query)}&tag=rudranil0a-21`,
  },
  {
    name: 'Flipkart',
    label: 'Search Flipkart catalog',
    tone: 'border-blue-200 bg-blue-50 text-blue-900 hover:bg-blue-100',
    buildUrl: (query: string) => `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`,
  },
  {
    name: 'Myntra',
    label: 'Search Myntra catalog',
    tone: 'border-pink-200 bg-pink-50 text-pink-900 hover:bg-pink-100',
    buildUrl: (query: string) => `https://www.myntra.com/search?q=${encodeURIComponent(query)}`,
  },
  {
    name: 'Google Shopping',
    label: 'Search the wider web',
    tone: 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-[#F1F5F9] hover:bg-slate-100 dark:bg-[#111C33]',
    buildUrl: (query: string) => `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(query)}`,
  },
];

export const BroadStoreSearch: React.FC<BroadStoreSearchProps> = ({ query, compact = false }) => {
  const cleanQuery = query.trim();
  if (!cleanQuery) return null;

  return (
    <section
      aria-label="Search other stores"
      className={`rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1527] shadow-sm ${compact ? 'p-3.5' : 'p-5 sm:p-6'}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-base" aria-hidden="true">
          🔎
        </div>
        <div className="min-w-0">
          <h3 className="font-heading text-sm sm:text-base font-extrabold text-slate-900 dark:text-[#F1F5F9]">
            Search every major store for “{cleanQuery}”
          </h3>
          <p className="mt-1 text-[11px] sm:text-xs leading-relaxed text-slate-500">
            No verified drop is currently indexed for this query. These links open live store results; prices are not treated as verified until our feed checks them.
          </p>
        </div>
      </div>

      <div className={`mt-4 grid gap-2 ${compact ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
        {STORE_SEARCHES.map((store) => {
          if (store.name === 'Google Shopping') {
            return (
              <button
                key={store.name}
                type="button"
                onClick={() => openGoogleShoppingModal(cleanQuery)}
                className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition-colors cursor-pointer ${store.tone}`}
              >
                <span className="min-w-0 truncate flex items-center gap-1.5">
                  <span>🛍️</span>
                  <span>Google Shopping</span>
                </span>
                <span className="shrink-0 text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
                  IN-APP
                </span>
              </button>
            );
          }
          return (
            <a
              key={store.name}
              href={store.buildUrl(cleanQuery)}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition-colors ${store.tone}`}
            >
              <span className="min-w-0 truncate">{store.name}</span>
              <span aria-hidden="true" className="shrink-0 text-[11px]">↗</span>
              <span className="sr-only">{store.label}</span>
            </a>
          );
        })}
      </div>
    </section>
  );
};
