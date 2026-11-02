import { useEffect, useState } from 'react';
import { Users, RefreshCw, Eye } from 'lucide-react';
import { getAdminHeaders } from '../utils/adminAuth';

interface AnalyticsData {
  live_now: number;
  visitors_today: number;
}

export function VisitorSummary({ apiBase }: { apiBase: string }) {
  const [data, setData] = useState<AnalyticsData>({ live_now: 0, visitors_today: 0 });
  const [state, setState] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  const [updated, setUpdated] = useState('');

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();

    async function load() {
      try {
        const primaryUrl = `${apiBase || ''}/api/v1/analytics/visitors`;
        let res = await fetch(primaryUrl, {
          headers: getAdminHeaders(false),
          cache: 'no-store',
          signal: controller.signal
        }).catch(() => null);

        // Fallback to direct production API if local proxy failed
        if (!res || !res.ok) {
          res = await fetch('https://api.rudranil.me/api/v1/analytics/visitors', {
            headers: getAdminHeaders(false),
            cache: 'no-store',
            signal: controller.signal
          }).catch(() => null);
        }

        if (!res || !res.ok) throw new Error('Unavailable');
        const json = await res.json();

        if (alive) {
          setData({
            live_now: typeof json.live_now === 'number' ? json.live_now : 0,
            visitors_today: typeof json.visitors_today === 'number' ? json.visitors_today : 0,
          });
          setState('ready');
          setUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }
      } catch {
        if (alive && state === 'loading') {
          setState('unavailable');
        }
      }
    }

    void load();
    // Poll every 10 seconds for real-time live presence
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void load();
      }
    }, 10000);

    return () => {
      alive = false;
      controller.abort();
      window.clearInterval(timer);
    };
  }, [apiBase]);

  return (
    <div
      className="visitor-summary select-none"
      role="status"
      title="Real-time live watchers (heartbeats in last 60s) and total unique browsers on IndiaDealHunts today (midnight to midnight IST)."
    >
      <div className="flex items-center gap-2.5">
        {/* Live Active Watchers */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                data.live_now > 0 ? 'bg-emerald-400 opacity-80' : 'bg-slate-500 opacity-20'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                data.live_now > 0
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]'
                  : 'bg-slate-500'
              }`}
            />
          </span>
          <Eye size={12} className={data.live_now > 0 ? 'text-emerald-400' : 'text-slate-400'} />
          <span className="font-mono font-bold text-xs text-white">
            {state === 'ready' ? data.live_now : '—'}
          </span>
          <span className="text-[10px] font-semibold text-emerald-300 uppercase tracking-wider">
            {data.live_now === 1 ? 'Watching Now' : 'Watching Now'}
          </span>
        </div>

        <span className="text-slate-700 text-xs hidden sm:inline">|</span>

        {/* Daily Unique Visitors */}
        <div className="flex items-center gap-1.5 px-2 py-1 text-slate-300">
          <Users size={13} className="text-slate-400" />
          <span className="font-mono font-bold text-xs text-slate-100">
            {state === 'ready' ? data.visitors_today.toLocaleString('en-IN') : '...'}
          </span>
          <span className="text-[10.5px] text-slate-400">
            Today (IST)
          </span>
        </div>
      </div>

      {state === 'ready' && (
        <span
          className="visitor-updated ml-auto flex items-center gap-1 text-[10px] text-slate-500 font-mono"
          title={`Live counter updated at ${updated} IST (refreshes every 10s)`}
        >
          <RefreshCw size={10} className="animate-spin-slow opacity-60" />
          {updated}
        </span>
      )}
    </div>
  );
}
