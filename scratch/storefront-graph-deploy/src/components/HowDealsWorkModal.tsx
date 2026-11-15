import { useModalSurface } from '../utils/useModalSurface';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { IconShieldCheck, IconExternalLink } from './Icons';

interface HowDealsWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewFullPage?: () => void;
}

interface PipelineStep {
  id: string;
  number: string;
  title: string;
  badge: string;
  badgeColor: string;
  icon: string;
  description: string;
  telemetry: {
    coverage: string;
    action: string;
    limitation: string;
  };
}

const PIPELINE_STEPS: PipelineStep[] = [
  { id: 'ingestion', number: '01', title: 'Source Labels', badge: 'Discovery', badgeColor: 'text-sky-600 bg-sky-50 border-sky-200', icon: '📡',
    description: 'Directory offers and external shopping results have different source labels. A source label explains where an offer came from; it does not guarantee the current merchant price.',
    telemetry: { coverage: 'Shown on offer cards', action: 'Inspect the source label', limitation: 'External search coverage can vary' } },
  { id: 'unshorten', number: '02', title: 'Merchant Links', badge: 'Product', badgeColor: 'text-amber-700 bg-amber-50 border-amber-200', icon: '🔗',
    description: 'Follow the store link to confirm the actual product. Collection pages and search links are useful for discovery, but cannot supply history for a single product.',
    telemetry: { coverage: 'Merchant link supplied', action: 'Check model and variant', limitation: 'A link is not a live price guarantee' } },
  { id: 'consensus', number: '03', title: 'Matching Variants', badge: 'Comparison', badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: '🔎',
    description: 'Product identity uses merchant identifiers or a valid global barcode when supplied. Similar names and different capacities are not enough to claim an exact cross-store match.',
    telemetry: { coverage: 'Identity fields when supplied', action: 'Compare the exact variant', limitation: 'Merchant IDs do not identify products globally' } },
  { id: 'ai_gate', number: '04', title: 'Recorded Prices', badge: 'History', badgeColor: 'text-purple-700 bg-purple-50 border-purple-200', icon: '📉',
    description: 'Historical guidance uses actual recorded observations. An MRP discount is distinct from a recorded price low. Without enough observations, buy-timing guidance remains unavailable.',
    telemetry: { coverage: 'Dates and prices when supplied', action: 'Inspect the historical low and median', limitation: 'Missing observations are not invented' } },
  { id: 'sentinel', number: '05', title: 'Checkout Checks', badge: 'Final price', badgeColor: 'text-rose-700 bg-rose-50 border-rose-200', icon: '🛍️',
    description: 'Confirm stock, seller, delivery charge and discount eligibility at checkout. The checkout planner separates immediate payment from conditional later cashback.',
    telemetry: { coverage: 'Source stock and timestamps when supplied', action: 'Check your final payable amount', limitation: 'Unknown stock and delivery remain unconfirmed' } },
];

export const HowDealsWorkModal: React.FC<HowDealsWorkModalProps> = ({
  isOpen,
  onClose,
  onViewFullPage,
}) => {
  const [selectedStep, setSelectedStep] = useState<string>('ingestion');

  const modalSurface = useModalSurface(isOpen, onClose);

  if (!isOpen) return null;

  const currentStep = PIPELINE_STEPS.find((s) => s.id === selectedStep) || PIPELINE_STEPS[0];

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm">
        {/* Backdrop click */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Modal Window */}
        <motion.div ref={modalSurface} role="dialog" aria-modal="true" aria-label="How deal evidence works"
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl max-h-[calc(100dvh-2rem)] flex flex-col bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10 overscroll-contain"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#070A11]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600">
                <IconShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
                  How IndiaDealHunts Verifies Deals
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Buyer guide
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Five checks to help you judge an offer before buying.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:text-[#F8FAFC] hover:bg-slate-100 dark:bg-[#111C33] transition-colors cursor-pointer text-lg font-mono leading-none"
            >
              ✕
            </button>
          </div>

          {/* Stepper Tabs Bar */}
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#070A11]/80 overflow-x-auto scrollbar-none">
            {PIPELINE_STEPS.map((step) => {
              const isActive = step.id === selectedStep;
              return (
                <button
                  key={step.id}
                  onClick={() => setSelectedStep(step.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer border ${
                    isActive
                      ? 'bg-white dark:bg-[#0D1527] text-slate-900 dark:text-[#F1F5F9] border-slate-300 dark:border-white/20 shadow-xs font-bold'
                      : 'bg-transparent text-slate-500 hover:text-slate-900 dark:text-[#F1F5F9] border-transparent hover:bg-slate-100 dark:bg-[#111C33]'
                  }`}
                >
                  <span className="font-mono text-[10px] text-slate-400 font-bold">{step.number}</span>
                  <span>{step.icon}</span>
                  <span>{step.title.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Step Detail Card Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5 bg-white dark:bg-[#0D1527]">
            {/* Step Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{currentStep.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      STAGE {currentStep.number} OF 05
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${currentStep.badgeColor}`}
                    >
                      {currentStep.badge}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#F1F5F9] mt-0.5">
                    {currentStep.title}
                  </h3>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-[#070A11]/60 border border-slate-200 dark:border-white/10 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {currentStep.description}
            </div>

            {/* Telemetry Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  Available evidence
                </div>
                <div className="text-sm font-bold text-emerald-600 font-mono mt-1">
                  {currentStep.telemetry.coverage}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  What to check
                </div>
                <div className="text-xs font-semibold text-slate-800 dark:text-[#F8FAFC] mt-1">
                  {currentStep.telemetry.action}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  Limits
                </div>
                <div className="text-xs font-semibold text-rose-600 mt-1">
                  {currentStep.telemetry.limitation}
                </div>
              </div>
            </div>

            {/* Live Pipeline Flow Graphic Preview */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10 flex items-center justify-between overflow-x-auto text-[11px] font-mono">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1 flex-shrink-0 font-medium">
                <span>📡 Source</span>
              </span>
              <span className="text-slate-400 px-2 flex-shrink-0">➔</span>
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1 flex-shrink-0 font-medium">
                <span>🔗 Product</span>
              </span>
              <span className="text-slate-400 px-2 flex-shrink-0">➔</span>
              <span className="text-amber-600 flex items-center gap-1 flex-shrink-0 font-medium">
                <span>🔎 Variant</span>
              </span>
              <span className="text-slate-400 px-2 flex-shrink-0">➔</span>
              <span className="text-purple-600 flex items-center gap-1 flex-shrink-0 font-medium">
                <span>📉 History</span>
              </span>
              <span className="text-slate-400 px-2 flex-shrink-0">➔</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1 flex-shrink-0">
                <span>🛍️ Checkout</span>
              </span>
            </div>
          </div>

          {/* Footer Action */}
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#070A11]">
            <span className="text-xs text-slate-400 hidden sm:inline">
              Inspect the evidence. Confirm the final price at checkout.
            </span>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {onViewFullPage && (
                <button
                  onClick={() => {
                    onClose();
                    onViewFullPage();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#0D1527] hover:bg-slate-100 dark:bg-[#111C33] text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:text-[#F1F5F9] border border-slate-200 dark:border-white/10 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <span>Read Full Methodology</span>
                  <IconExternalLink className="w-3 h-3 text-slate-400" />
                </button>
              )}

              <button
                onClick={onClose}
                className="px-5 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
              >
                Got It
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
