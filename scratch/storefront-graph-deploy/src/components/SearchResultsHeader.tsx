import React, { FormEvent } from 'react';

interface SearchResultsHeaderProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  verifiedCount: number;
}

export const SearchResultsHeader: React.FC<SearchResultsHeaderProps> = ({ query, onQueryChange, onSubmit, onClear, verifiedCount }) => {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <section className="phone-search-results border-b border-slate-200 dark:border-white/10 bg-gradient-to-br from-white via-slate-50 to-blue-50/50 px-4 py-4 sm:px-6 sm:py-7">
      <div className="mx-auto w-full max-w-[1340px]">
        <button type="button" onClick={onClear} className="mb-4 text-xs font-bold text-slate-500 transition hover:text-blue-600">← Back to all deals</button>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-[11px] font-mono font-bold uppercase tracking-[0.16em] text-blue-600">Storefront search</p>
            <h1 className="font-heading text-2xl font-black tracking-tight text-slate-900 dark:text-[#F1F5F9] sm:text-4xl">Deals for “{query.trim()}”</h1>
            <p className="mt-2 max-w-2xl text-xs sm:text-sm text-slate-500">Search the deal directory and discover store offers. Inspect product matches and available price evidence before buying.</p>
          </div>
          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">{verifiedCount} directory result{verifiedCount === 1 ? '' : 's'}</div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex max-w-3xl items-center gap-2 rounded-2xl border border-slate-300 dark:border-white/20 bg-white dark:bg-[#0D1527] p-1.5 shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
          <span className="pl-3 text-slate-400" aria-hidden="true">⌕</span>
          <input id="search-results-input" aria-label="Search products" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search products across the deal directory and stores…" className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-slate-900 dark:text-[#F1F5F9] outline-none" autoFocus />
          <button type="submit" className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700">Search</button>
          <button type="button" onClick={onClear} className="rounded-xl px-3 py-2.5 text-xs font-bold text-slate-500 transition hover:bg-slate-100 dark:bg-[#111C33] hover:text-slate-900 dark:text-[#F1F5F9]">Clear</button>
        </form>
      </div>
    </section>
  );
};
