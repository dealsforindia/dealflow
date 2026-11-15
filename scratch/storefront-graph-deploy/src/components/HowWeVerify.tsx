import React from 'react';
import { IconChevronRight } from './Icons';

interface HowWeVerifyProps {
  onBackToHome?: () => void;
  onNavigateTab?: (tab: any) => void;
}

export const HowWeVerify: React.FC<HowWeVerifyProps> = ({ onBackToHome }) => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 flex flex-col gap-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <button
          onClick={onBackToHome}
          className="hover:text-blue-600 transition-colors cursor-pointer bg-transparent border-0 p-0 font-medium"
        >
          Home
        </button>
        <span>/</span>
        <span className="text-slate-800 dark:text-[#F8FAFC] font-semibold">Understanding offer evidence</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-[11px] font-bold w-fit">
          <span>🛡️ KNOW WHAT YOU ARE BUYING</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-slate-900 dark:text-[#F1F5F9] leading-tight">
          How Deals Are Verified
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl">
          Use source labels, recorded prices and merchant links to assess an offer. Directory inclusion is different from a confirmed historical low, and evidence coverage varies by product.
        </p>
      </div>

      {/* 5-Step Pipeline */}
      <div className="flex flex-col gap-3.5">
        {[
          {
            num: '01',
            title: 'Merchant product links',
            tag: 'Link Layer',
            desc: 'Open the merchant page and check the exact product and variant. Some links redirect through an affiliate service; a category or collection page does not identify a single product for price history.',
          },
          {
            num: '02',
            title: 'Recorded price observations',
            tag: 'Price Audit',
            desc: 'Where price observations are supplied, the inspector shows the recorded low, median and high, with dates. Missing history stays missing; MRP alone cannot establish a genuine bargain.',
          },
          {
            num: '03',
            title: 'Multi-Source Signal Consensus',
            tag: 'Consensus',
            desc: 'Multiple source sightings can be useful context. They do not establish independent verification, seller reliability or that a price is still available.',
          },
          {
            num: '04',
            title: 'Availability and freshness',
            tag: 'Availability',
            desc: 'The inspector shows stock status and check timestamps when the source supplies them. Unknown stock stays unconfirmed. Verify seller, delivery location and final price on the store before buying.',
          },
          {
            num: '05',
            title: 'Clean Affiliate Transformation',
            tag: 'Monetization',
            desc: 'Supported merchant links may be transformed into affiliate links. Conversion is labelled when confirmed by the source. An affiliate link may earn us commission; it does not guarantee an extra discount.',
          },
        ].map((step) => (
          <div
            key={step.num}
            className="p-5 rounded-2xl bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:border-white/20 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 sm:items-start"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center font-mono font-bold text-blue-600 text-sm flex-shrink-0">
              {step.num}
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="flex items-center gap-2.5">
                <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-[#F1F5F9]">
                  {step.title}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#111C33] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 font-semibold">
                  {step.tag}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Try Tool Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
        <div>
          <h3 className="text-base font-bold font-heading text-slate-900 dark:text-[#F1F5F9]">
            Want to test a product link yourself?
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Use our interactive Price Lookup tool to paste a specific Amazon, Flipkart, or Myntra product link and inspect available evidence.
          </p>
        </div>
        <button
          onClick={onBackToHome}
          className="h-10 px-5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer flex-shrink-0 transition-all shadow-sm active:scale-95"
        >
          <span>Explore Live Drops</span>
          <IconChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
