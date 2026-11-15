import React from 'react';
import { IconChevronRight } from './Icons';

interface AboutPageProps {
  onBackToHome?: () => void;
  onNavigateTab?: (tab: any) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBackToHome, onNavigateTab }) => {
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
        <span className="text-slate-800 dark:text-[#F8FAFC] font-semibold">About IndiaDealHunts</span>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-mono text-[11px] font-bold w-fit">
          <span>YOUR SHOPPING ADVANTAGE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-slate-900 dark:text-[#F1F5F9] leading-tight">
          Retail discoveries & clearer price evidence
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl">
          E-commerce promotions frequently advertise artificial discounts against inflated MRPs. IndiaDealHunts monitors genuine price drops, flash clearances, and real coupon stacks across Amazon, Flipkart, Myntra, Swiggy Instamart, and partner platforms.
        </p>
      </div>

      {/* Impact Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Shopping discovery', val: 'Multi-store' },
          { label: 'Recorded price evidence', val: 'When available' },
          { label: 'Your shortlist', val: 'On-device' },
          { label: 'Shopper Access', val: '100% Free' },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-white/10 flex flex-col gap-1 shadow-sm"
          >
            <div className="text-2xl font-black font-heading text-slate-900 dark:text-[#F1F5F9]">
              {stat.val}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* 4 Core Pillars */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-[#F1F5F9]">
          What you can do here
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {[
            {
              title: '1. Inspect the price evidence',
              desc: 'Explore recorded observations where available. A percentage below MRP is a merchant reference, not proof of a historical low.',
            },
            {
              title: '2. Discover across stores',
              desc: 'Browse the deal directory and search for products across stores. External listings are labelled separately; source coverage and freshness can vary.',
            },
            {
              title: '3. Keep the finds you care about',
              desc: 'Save a shortlist on your device, compare products, and calculate a checkout scenario using the discounts you are eligible for.',
            },
            {
              title: '4. Free & Open for Shoppers',
              desc: 'No paywalls, subscriptions, or hidden charges. We earn affiliate referral commissions from supported retail partners at zero additional cost to you.',
            },
          ].map((pillar, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:border-white/20 shadow-sm hover:shadow-md transition-all flex flex-col gap-2"
            >
              <h3 className="text-sm font-bold font-heading text-blue-600">
                {pillar.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
        <div>
          <h3 className="text-base font-bold font-heading text-slate-900 dark:text-[#F1F5F9]">
            Verification Pipeline Documentation
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Review our step-by-step verification pipeline explaining how price scraping, multi-source consensus, and affiliate redirects operate.
          </p>
        </div>
        <button
          onClick={() => onNavigateTab && onNavigateTab('how_we_verify')}
          className="h-10 px-5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer flex-shrink-0 transition-all shadow-sm active:scale-95"
        >
          <span>Read Methodology</span>
          <IconChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
