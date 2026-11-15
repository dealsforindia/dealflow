import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DealFlowEngineSnapshot } from '../hooks/useDealFlowSync';

interface DealFlowBridgeProps {
  status: 'connected' | 'connecting' | 'disconnected';
  snapshot: DealFlowEngineSnapshot | null;
  newDropsCount: number;
  onRefreshFeed?: () => void;
}

export const DealFlowBridge: React.FC<DealFlowBridgeProps> = ({
  status,
  snapshot,
  newDropsCount,
  onRefreshFeed,
}) => {
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Auto-detect local vs production DealFlow deck URL
  const dealflowUrl =
    typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? 'http://localhost:5174'
      : 'https://dealflow-topaz-seven.vercel.app';

  return (
    <div className="relative">
      <button
        onClick={() => setPopoverOpen(!popoverOpen)}
        title="DealFlow Real-time Engine Connection"
        className={`flex items-center gap-2 h-8.5 px-3 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
          status === 'connected'
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800 hover:bg-emerald-100/90 shadow-2xs'
            : status === 'connecting'
            ? 'bg-amber-50/80 border-amber-200 text-amber-800 hover:bg-amber-100/90'
            : 'bg-slate-100 dark:bg-[#111C33] border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-200 dark:bg-[#172440]'
        }`}
      >
        <span className="relative flex h-2 w-2">
          {status === 'connected' && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              status === 'connected'
                ? 'bg-emerald-500'
                : status === 'connecting'
                ? 'bg-amber-500'
                : 'bg-slate-400'
            }`}
          />
        </span>

        <span className="hidden sm:inline font-mono tracking-tight text-[11px]">
          {status === 'connected' ? 'DealFlow' : status === 'connecting' ? 'Connecting…' : 'Engine Sync'}
        </span>

        {newDropsCount > 0 && (
          <span className="flex items-center justify-center px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono bg-rose-500 text-white shadow-2xs animate-pulse">
            +{newDropsCount}
          </span>
        )}
      </button>

      {/* Popover Card */}
      <AnimatePresence>
        {popoverOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setPopoverOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-11 z-50 w-72 p-4 rounded-2xl bg-white/95 dark:bg-[#0D1527]/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-xl text-slate-800 dark:text-[#F8FAFC] text-xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs">
                    ⚡
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-[#F1F5F9] leading-tight">DealFlow Engine</h4>
                    <p className="text-[10px] text-slate-500">Live AI Curation Bridge</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    status === 'connected'
                      ? 'bg-emerald-100 text-emerald-700'
                      : status === 'connecting'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 dark:bg-[#111C33] text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {status === 'connected' ? 'ONLINE' : status.toUpperCase()}
                </span>
              </div>

              {/* Engine Metrics */}
              <div className="grid grid-cols-2 gap-2 my-3">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-100 dark:border-white/5">
                  <p className="text-[10px] text-slate-500 font-medium">Pending Review</p>
                  <p className="text-base font-extrabold text-slate-900 dark:text-[#F1F5F9] font-mono mt-0.5">
                    {snapshot?.pending_count ?? '3,280+'}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-100 dark:border-white/5">
                  <p className="text-[10px] text-slate-500 font-medium">Approved Today</p>
                  <p className="text-base font-extrabold text-emerald-600 font-mono mt-0.5">
                    {snapshot?.posted_today ?? '0'}
                  </p>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 font-mono space-y-1 py-1">
                <div className="flex justify-between">
                  <span>Backend Gateway:</span>
                  <span className="text-slate-700 dark:text-slate-200 font-semibold">DealFlow Edge (Encrypted)</span>
                </div>
                <div className="flex justify-between">
                  <span>Redis Queue:</span>
                  <span className="text-slate-700 dark:text-slate-200 font-semibold">{snapshot?.queue_depth ?? 0} items</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
                <a
                  href={dealflowUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-xs"
                >
                  <span>⚡ Open DealFlow Curation Deck</span>
                  <span className="text-[10px] opacity-75">↗</span>
                </a>

                {onRefreshFeed && (
                  <button
                    onClick={() => {
                      onRefreshFeed();
                      setPopoverOpen(false);
                    }}
                    className="flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-[#111C33] hover:bg-slate-200 dark:bg-[#172440] text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all cursor-pointer"
                  >
                    <span>🔄 Refresh Storefront Feed</span>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
