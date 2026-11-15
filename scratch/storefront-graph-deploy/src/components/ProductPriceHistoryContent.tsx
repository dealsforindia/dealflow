import { useEffect, useState, useId } from 'react';
import { History, RefreshCw } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PUBLIC_API_BASE, lookupTargetUrl } from '../utils/publicLinks';
import { cleanHistory, rupees } from '../utils/shoppingIntelligence';
import { historyRange } from '../utils/historyRange';

interface ProductPriceHistoryProps { url: string; dealId?: string; currentPrice?: number; mrp?: number }
const dateLabel = (time: number, short = false) => new Date(time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', ...(short ? {} : { year: 'numeric' }) });

export default function ProductPriceHistoryContent({ url, dealId, currentPrice }: ProductPriceHistoryProps) {
  const id = useId().replace(/:/g, '');
  const [points, setPoints] = useState<Array<[number, number]>>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [days, setDays] = useState(90);
  const [source, setSource] = useState('Recorded observations');

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    setLoading(true); setPoints([]); setMessage('');
    async function load() {
      let observations: Array<[number, number]> = [];
      let historySource = 'Recorded observations';
      try {
        if (dealId && /^[a-f0-9]{8,64}$/i.test(dealId)) {
          const request = new AbortController();
          const stop = () => request.abort();
          controller.signal.addEventListener('abort', stop, { once: true });
          const deadline = setTimeout(stop, 10000);
          try {
            const response = await fetch(`${PUBLIC_API_BASE}/api/v1/deals/${encodeURIComponent(dealId)}/price-history`, { signal: request.signal, cache: 'no-store' });
            if (response.ok) {
              const data = await response.json();
              observations = cleanHistory(data.price_intelligence?.history || data.history);
              historySource = data.history_source || 'Directory price observations';
            }
          } catch { /* URL lookup remains available. */ }
          finally { clearTimeout(deadline); controller.signal.removeEventListener('abort', stop); }
        }
        const target = lookupTargetUrl(url);
        if (observations.length < 2 && target && !controller.signal.aborted) {
          const response = await fetch(`${PUBLIC_API_BASE}/api/v1/deals/analyze-url?url=${encodeURIComponent(target)}`, { signal: controller.signal, cache: 'no-store' });
          if (response.ok) {
            const data = await response.json();
            const fallback = cleanHistory(data.history || data.price_intelligence?.history);
            if (fallback.length > observations.length) {
              observations = fallback;
              historySource = data.history_source || 'Provider price observations';
            }
          }
        }
      } catch { if (!observations.length) setMessage('Price history could not be loaded. Try again.'); }
      finally {
        clearTimeout(timer);
        if (controller.signal.reason !== 'closed') {
          setPoints(observations); setSource(historySource); setLoading(false);
        }
      }
    }
    void load();
    return () => { clearTimeout(timer); controller.abort('closed'); };
  }, [url, dealId, attempt]);

  const visible = historyRange(points, days);
  const data = visible.map(([time, price]) => ({ time, price }));
  const prices = visible.map(([, price]) => price);
  const low = prices.length ? Math.min(...prices) : null;
  const high = prices.length ? Math.max(...prices) : null;
  const latest = visible[visible.length - 1];
  const span = visible.length > 1 ? visible[visible.length - 1][0] - visible[0][0] : 0;
  const tick = (time: number) => span < 86400000 ? new Date(time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : dateLabel(time, true);
  const padding = low !== null && high !== null ? Math.max((high - low) * .15, high * .03, 1) : 1;
  return (
    <section className="proper-price-history premium-history mt-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50 p-4 sm:p-5 min-w-0" aria-label="Product price history">
      <header className="flex items-start justify-between gap-3">
        <div><h3 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white"><History size={18} className="text-sky-500" />Price history & trend</h3><p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{source}</p></div>
        <button type="button" onClick={() => setAttempt(a => a + 1)} disabled={loading} aria-label="Reload price history" className="h-11 w-11 shrink-0 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-200 disabled:opacity-50"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></button>
      </header>
      <div role="group" aria-label="Price history period" className="grid grid-cols-4 rounded-xl bg-slate-100 dark:bg-slate-950/50 p-1 mt-4 gap-1">
        {[7, 30, 90, 0].map(period => <button type="button" key={period} aria-pressed={days === period} onClick={() => setDays(period)} className={`min-h-11 rounded-lg text-xs font-semibold transition-colors ${days === period ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/5'}`}>{period ? `${period} days` : 'All'}</button>)}
      </div>
      {loading ? <div role="status" className="h-64 flex items-center justify-center text-sm text-slate-600 dark:text-slate-300">Loading recorded prices…</div> : <>
        <div className="flex justify-between items-end gap-2 mt-5 mb-3"><div><p className="text-xs text-slate-600 dark:text-slate-300">Latest observation in this range</p><strong className="text-2xl font-bold text-slate-900 dark:text-white">{latest ? rupees(latest[1]) : '—'}</strong></div><span className="text-xs text-slate-600 dark:text-slate-300">{visible.length} recorded checks</span></div>
        {visible.length > 1 ? <div className="h-64 w-full min-w-0" role="img" aria-label={`Price chart: ${visible.length} observations, low ${rupees(low)}, high ${rupees(high)}`}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={data} margin={{ top: 12, right: 6, left: 0, bottom: 8 }} accessibilityLayer>
              <defs><linearGradient id={`history-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a78bfa" stopOpacity={.25}/><stop offset="100%" stopColor="#a78bfa" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeDasharray="3 5" />
              <XAxis dataKey="time" type="number" domain={['dataMin', 'dataMax']} tickFormatter={tick} tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={35} />
              <YAxis domain={[Math.max(0, (low || 0) - padding), (high || 0) + padding]} tickFormatter={value => `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} width={66} tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip labelFormatter={label => `${dateLabel(Number(label))} · ${new Date(Number(label)).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`} formatter={value => [rupees(Number(value)), 'Recorded price']} contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, color: '#f8fafc', fontSize: 12 }} itemStyle={{ color: '#ddd6fe' }} cursor={{ stroke: '#a78bfa', strokeDasharray: '4 4' }} />
              <Area type="stepAfter" dataKey="price" stroke="#a78bfa" strokeWidth={2.5} fill={`url(#history-${id})`} dot={false} activeDot={{ r: 5, strokeWidth: 2, fill: '#0f172a' }} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div> : <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 p-5 text-sm text-slate-600 dark:text-slate-300 mt-4" role="status">{visible.length === 1 ? `One recorded price on ${dateLabel(visible[0][0])}. More observations are needed to show a trend.` : points.length ? `No recorded prices in the last ${days} days. Select All to see available observations.` : message || 'No recorded price history is available for this product.'}</div>}
        <div className="grid grid-cols-3 gap-2 mt-4">{[['Recorded low', rupees(low)], ['Recorded high', rupees(high)], ['Coverage', visible.length ? `${Math.max(1, Math.ceil(span / 86400000))} day${span > 86400000 ? 's' : ''}` : '—']].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 dark:bg-white/5 p-3 min-w-0"><p className="text-xs text-slate-600 dark:text-slate-300">{label}</p><p className="text-sm font-bold text-slate-900 dark:text-white mt-1 break-words">{value === 'Price unavailable' ? '—' : value}</p></div>)}</div>
      </>}
      <p className="mt-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">Periods filter available observations; they do not guarantee that many days of history. {currentPrice ? `Directory price: ${rupees(currentPrice)}. ` : ''}Confirm the current price and variant at checkout.</p>
    </section>
  );
}
