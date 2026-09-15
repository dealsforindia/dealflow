import React from 'react';
import { CheckCircle2, Search, TrendingDown, Star, AlertTriangle, Shield, Clock, ExternalLink } from 'lucide-react';

interface HowWeVerifyProps {
  onBackToHome?: () => void;
  onNavigateTab?: (tab: any) => void;
}

export const HowWeVerify: React.FC<HowWeVerifyProps> = ({ onBackToHome, onNavigateTab }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-14 space-y-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <button onClick={onBackToHome} className="hover:text-emerald-400 transition-colors">
          Home
        </button>
        <span>/</span>
        <span className="text-emerald-400 font-medium">How We Verify Deals</span>
      </div>

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Shield className="w-3.5 h-3.5" />
          The IndiaDealHunts Verification Standard
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
          How We Verify <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Every Single Deal</span>
        </h1>
        {/* Hidden purposely: unverified 'fake MRPs' claim
        <p className="text-slate-300 text-base md:text-lg leading-relaxed">
          Over 90% of deals posted on social media are low-quality items with jacked-up fake MRPs. Here is our exact 5-layer pipeline that ensures only genuine, high-savings drops reach your feed.
        </p>
        */}
      </div>

      {/* 5-Step Pipeline Cards */}
      <div className="space-y-6">
        {/* Step 1 */}
        <div className="p-6 md:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row gap-6 items-start">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black text-xl shrink-0">
            01
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-white">Canonical Link Resolution & Sanitization</h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-emerald-400 font-medium">Link Layer</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              When a deal link enters our system, we follow all redirects (e.g. <code className="text-emerald-400 text-xs bg-slate-950 px-1 py-0.5 rounded">fpkrt.cc</code>, <code className="text-emerald-400 text-xs bg-slate-950 px-1 py-0.5 rounded">amzn.to</code>) to extract the canonical product ID (<code className="text-slate-400 text-xs">ASIN</code> on Amazon, <code className="text-slate-400 text-xs">pid/itm</code> on Flipkart). We strip all tracking cookies, referral parameters, and spam tokens to ensure you get clean, transparent product links.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="p-6 md:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row gap-6 items-start">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-black text-xl shrink-0">
            02
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-white">90-Day Real Price History Benchmarking</h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-400 font-medium">Price Audit</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Sellers routinely double an item's MRP right before a sale to claim "70% OFF". Our crawler verifies the item's historical selling price over the last 90 days. We only flag an item as a deal if the live price is substantially below its median running price.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="p-6 md:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row gap-6 items-start">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black text-xl shrink-0">
            03
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-white">The Proprietary Worth Score (0 - 100)</h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-400 font-medium">Algorithm</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Every deal gets an objective Worth Score calculated from three weighted factors:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="text-xs font-bold text-emerald-400 mb-1">Percentage Drop (40%)</div>
                <div className="text-xs text-slate-400">Discount relative to the authentic 90-day running price.</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="text-xs font-bold text-amber-400 mb-1">Rupee Savings (35%)</div>
                <div className="text-xs text-slate-400">Absolute money saved in ₹. A ₹5,000 drop scores higher than a ₹10 drop.</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="text-xs font-bold text-cyan-400 mb-1">Brand & Category (25%)</div>
                <div className="text-xs text-slate-400">Brand reputation, return policies, and product review authenticity.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="p-6 md:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row gap-6 items-start">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center font-black text-xl shrink-0">
            04
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-white">Seller Reputation & Authenticity Check</h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-purple-400 font-medium">Quality Filter</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              We eliminate unauthorized sellers and knockoffs. On Amazon, we verify Fulfilled by Amazon (FBA) or trusted merchants (Appario, Cocoblu, RetailNet). Products with sudden spikes of suspicious 1-star complaints or review manipulation are automatically disqualified.
            </p>
          </div>
        </div>

        {/* Step 5 */}
        <div className="p-6 md:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row gap-6 items-start">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center font-black text-xl shrink-0">
            05
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-white">Stock Expiry & "OVER" Status Tracking</h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-rose-400 font-medium">Liveness</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Nothing is more frustrating than clicking an expired deal. Our background workers continuously re-check deal pages. When stock sells out or the price resets, the deal is automatically stamped with a red <span className="text-rose-400 font-bold">OVER</span> badge so you never waste time on dead links.
            </p>
          </div>
        </div>
      </div>

      {/* Worth Score Reference Table */}
      <div className="p-6 md:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400" />
          Decoding the Worth Score Badge
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-black text-lg">90 – 100</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-bold">Insane Loot</span>
            </div>
            <p className="text-xs text-slate-300">
              All-time lowest price recorded or genuine price glitch. Sells out within minutes. Instant buy recommendation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-amber-400 font-black text-lg">80 – 89</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-xs font-bold">Great Deal</span>
            </div>
            <p className="text-xs text-slate-300">
              Significant discount below 90-day average. Verified genuine saving with high stock availability.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-black text-lg">70 – 79</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-bold">Fair Value</span>
            </div>
            <p className="text-xs text-slate-300">
              Standard discount or bundled value offer. Good if you were already planning to buy this product.
            </p>
          </div>
        </div>
      </div>

      {/* Test a Link CTA */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/20 text-center space-y-3">
        <h3 className="text-lg font-bold text-white">Have a link you want us to check right now?</h3>
        <p className="text-slate-400 text-xs max-w-md mx-auto">
          Paste any Amazon, Flipkart, or Myntra link into our Deal Lookup tool to calculate its instant Worth Score and price history.
        </p>
        <button
          onClick={() => onNavigateTab && onNavigateTab('lookup')}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors inline-flex items-center gap-1.5"
        >
          <Search className="w-3.5 h-3.5" />
          Open Deal Lookup Tool
        </button>
      </div>
    </div>
  );
};
