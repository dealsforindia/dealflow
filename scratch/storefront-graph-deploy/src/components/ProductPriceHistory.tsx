import { lazy, Suspense } from 'react';
const HistoryContent = lazy(() => import('./ProductPriceHistoryContent'));
interface Props { url: string; dealId?: string; currentPrice?: number; mrp?: number }
export function ProductPriceHistory(props: Props) {
  return <Suspense fallback={<div role="status" className="h-80 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-center text-sm text-slate-600 dark:text-slate-300">Loading price chart…</div>}><HistoryContent {...props} /></Suspense>;
}
