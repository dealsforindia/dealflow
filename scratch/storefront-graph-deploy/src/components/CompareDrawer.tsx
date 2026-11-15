import { useModalSurface } from '../utils/useModalSurface';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { PublicDeal } from '../types';
import { getCleanImageUrl } from '../utils/imageUrl';

interface CompareDrawerProps {
  compareDeals: PublicDeal[];
  isOpen: boolean;
  onOpenModal: () => void;
  onCloseModal: () => void;
  onRemoveDeal: (id: string) => void;
  onClearAll: () => void;
  onOpenSpecs: () => void;
}

export const CompareDrawer: React.FC<CompareDrawerProps> = ({
  compareDeals,
  isOpen,
  onOpenModal,
  onCloseModal,
  onRemoveDeal,
  onClearAll,
  onOpenSpecs,
}) => {
  const modalSurface = useModalSurface(isOpen && compareDeals.length > 0, onCloseModal);

  if (compareDeals.length === 0) return null;

  return (
    <>
      {/* ── Floating Sticky Compare Dock at Bottom ── */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="phone-compare-dock fixed bottom-[calc(68px+env(safe-area-inset-bottom,0px))] md:bottom-6 left-1/2 -translate-x-1/2 z-[45] bg-slate-900 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-xl flex items-center gap-2 sm:gap-3 border border-slate-700 max-w-[calc(100vw-1.5rem)]"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">⚖️</span>
          <span className="text-xs font-bold font-heading">
            Compare Deals ({compareDeals.length}/3)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {compareDeals.map((d) => (
            <div
              key={d.id}
              className="relative w-7 h-7 rounded-lg bg-white dark:bg-[#0D1527] overflow-hidden border border-slate-600 flex items-center justify-center p-0.5"
            >
              {d.image ? (
                <img src={getCleanImageUrl(d.image) || ''} alt={d.title} className="w-full h-full object-contain" />
              ) : (
                <span className="text-xs">🛍️</span>
              )}
              <button
                type="button"
                onClick={() => onRemoveDeal(d.id)}
                className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-600 text-white rounded-full text-[8px] flex items-center justify-center cursor-pointer"
                aria-label={`Remove ${d.title} from comparison`}
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onOpenModal}
          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold cursor-pointer transition-colors shadow-xs"
        >
          Compare Now →
        </button>

        <button
          type="button"
          onClick={onClearAll}
          className="text-slate-400 hover:text-white text-xs cursor-pointer px-1"
        >
          Clear
        </button>
      </motion.div>

      {/* ── Full Comparison Modal Table ── */}
      {createPortal(<AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm"
            onClick={onCloseModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              ref={modalSurface} role="dialog" aria-modal="true" aria-label="Compare selected offers" className="w-full max-w-4xl bg-white dark:bg-[#0D1527] rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl p-4 sm:p-6 overflow-hidden flex flex-col max-h-[calc(100dvh-2rem)] overscroll-contain"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚖️</span>
                  <div>
                    <h3 className="font-heading text-lg font-black text-slate-900 dark:text-[#F1F5F9] m-0">
                      Side-by-Side Deal Comparison
                    </h3>
                    <span className="text-xs text-slate-500 font-mono">
                      Evaluating {compareDeals.length} products
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onCloseModal}
                  aria-label="Close comparison" className="w-11 h-11 rounded-lg bg-slate-100 dark:bg-[#111C33] hover:bg-slate-200 dark:bg-[#172440] text-slate-600 dark:text-slate-400 flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto py-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10">
                      <th className="py-3 px-3 text-xs font-mono font-bold text-slate-400 uppercase w-32">
                        Product
                      </th>
                      {compareDeals.map((d) => (
                        <th key={d.id} className="py-3 px-3 min-w-[200px]">
                          <div className="flex flex-col gap-1.5">
                            <div className="w-20 h-20 rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10 p-2 flex items-center justify-center mx-auto">
                              <img
                                src={getCleanImageUrl(d.image) || ''}
                                alt={d.title}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-900 dark:text-[#F1F5F9] line-clamp-2 text-center">
                              {d.title}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 text-xs">
                    {/* Deal Price */}
                    <tr>
                      <td className="py-3 px-3 font-semibold text-slate-500 font-mono">Deal Price</td>
                      {compareDeals.map((d) => (
                        <td key={d.id} className="py-3 px-3 font-mono font-black text-slate-900 dark:text-[#F1F5F9] text-base text-center">
                          ₹{d.price ? Number(d.price).toLocaleString('en-IN') : 'Check Store'}
                        </td>
                      ))}
                    </tr>

                    {/* MRP & Discount */}
                    <tr>
                      <td className="py-3 px-3 font-semibold text-slate-500 font-mono">MRP / Discount</td>
                      {compareDeals.map((d) => (
                        <td key={d.id} className="py-3 px-3 text-center">
                          <span className="font-mono text-slate-400 line-through mr-1.5">
                            ₹{d.mrp ? Number(d.mrp).toLocaleString('en-IN') : '—'}
                          </span>
                          <span className="font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                            {d.discount_pct || 0}% OFF
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Total Savings */}
                    <tr>
                      <td className="py-3 px-3 font-semibold text-slate-500 font-mono">Total Savings</td>
                      {compareDeals.map((d) => (
                        <td key={d.id} className="py-3 px-3 font-mono font-bold text-emerald-700 text-center">
                          {d.mrp && d.price ? `₹${(d.mrp - d.price).toLocaleString('en-IN')}` : '—'}
                        </td>
                      ))}
                    </tr>

                    {/* Store Origin */}
                    <tr>
                      <td className="py-3 px-3 font-semibold text-slate-500 font-mono">Merchant</td>
                      {compareDeals.map((d) => (
                        <td key={d.id} className="py-3 px-3 text-center font-bold text-slate-800 dark:text-[#F8FAFC]">
                          {d.store}
                        </td>
                      ))}
                    </tr>

                    {/* Action Button */}
                    <tr>
                      <td className="py-3 px-3 font-semibold text-slate-500 font-mono">Buy Link</td>
                      {compareDeals.map((d) => (
                        <td key={d.id} className="py-3 px-3 text-center">
                          <a
                            href={d.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-black text-white font-extrabold text-xs shadow-xs"
                          >
                            <span>Grab Deal</span>
                            <span>→</span>
                          </a>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
              <button type="button" onClick={onOpenSpecs} className="min-h-11 mt-3 rounded-xl bg-blue-600 text-white font-bold text-sm shrink-0">Compare supplied specifications →</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>, document.body)}
    </>
  );
};


