import React from 'react';
import { ShieldCheck, Zap, Sparkles, Heart, Users, Target, CheckCircle2, ArrowRight } from 'lucide-react';

interface AboutPageProps {
  onBackToHome?: () => void;
  onNavigateTab?: (tab: any) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBackToHome, onNavigateTab }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-14 space-y-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <button onClick={onBackToHome} className="hover:text-emerald-400 transition-colors">
          Home
        </button>
        <span>/</span>
        <span className="text-emerald-400 font-medium">About Us</span>
      </div>

      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          The IndiaDealHunts Mission
        </div>
        {/* Hidden purposely: 'Fake Discounts' headline
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
          Saving Indian Shoppers From <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Fake Discounts</span>
        </h1>
        */}
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
          Saving Indian Shoppers From <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Inflated Pricing</span>
        </h1>
        <p className="text-slate-300 text-base md:text-lg leading-relaxed">
          E-commerce sales are filled with artificial MRP hikes and deceptive discounts. IndiaDealHunts uses 24/7 AI scrapers and verified price-tracking models to find genuine price drops, lightning glitch deals, and real coupon stacks across Amazon, Flipkart, Myntra, Swiggy Instamart, and 20+ top platforms.
        </p>
      </div>

      {/* Impact Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
          <div className="text-3xl font-black text-emerald-400">27+</div>
          <div className="text-xs text-slate-400 font-medium">Active Stores Monitored</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
          <div className="text-3xl font-black text-white">50k+</div>
          <div className="text-xs text-slate-400 font-medium">Savvy Community Members</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
          <div className="text-3xl font-black text-amber-400">₹2.4 Cr+</div>
          <div className="text-xs text-slate-400 font-medium">Verified User Savings</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
          <div className="text-3xl font-black text-teal-400">100%</div>
          <div className="text-xs text-slate-400 font-medium">Free & Unbiased</div>
        </div>
      </div>

      {/* 4 Core Pillars */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Our 4 Core Promises</h2>
          <p className="text-slate-400 text-sm">Why tens of thousands of shoppers trust our alerts every single day.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">1. True Price History Checks</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              We never post an item just because a seller claims "80% off". Our algorithm compares the live deal price against the item's 90-day average price to guarantee you're getting a historic low.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">2. Sub-Second Glitch Detection</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Price errors and flash sales last minutes or seconds. Our Telethon scrapers and high-frequency backend workers capture drops and instantly dispatch alerts to our Web feed and Telegram channel.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">3. Zero Sponsored Clutter</h3>
            {/* Hidden purposely: 'fake reviews' wording */}
            <p className="text-slate-300 text-sm leading-relaxed">
              We don't accept sponsorships or kickbacks to feature inferior products. If a product has poor ratings, bot reviews, or inflated MRPs, it is rejected by our quality filters before you ever see it.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">4. 100% Free For Shoppers</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              No premium subscriptions, no paywalls, and no hidden fees. When you purchase through some of our links, we may earn an affiliate commission at zero additional cost to you.
            </p>
          </div>
        </div>
      </div>

      {/* Action Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-900/40 via-slate-900 to-teal-900/30 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <h3 className="text-xl md:text-2xl font-black text-white">Want to see our verification math?</h3>
          {/* Hidden purposely: 'detect fake discounts' wording */}
          <p className="text-slate-300 text-sm max-w-lg">
            Learn the exact 5-step algorithm we use to calculate Worth Scores, verify seller ratings, and detect deceptive discounts.
          </p>
        </div>
        <button
          onClick={() => onNavigateTab && onNavigateTab('how_we_verify')}
          className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all flex items-center gap-2 shrink-0 shadow-lg shadow-emerald-500/20"
        >
          How We Verify
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
