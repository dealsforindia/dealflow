import React from 'react';
import { NavTab } from '../types';
import { Sparkles, MessageCircle, Send, Zap, CheckCircle2, Search, Heart, PlusCircle, Tag } from 'lucide-react';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  totalDeals: number;
}

const WHATSAPP_CHANNEL_URL = 'https://whatsapp.com/channel/0029VaHCuZs2v1IkBRgH9w3z';
const TELEGRAM_CHANNEL_URL = 'https://t.me/dealsforindiachannel';

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  totalDeals,
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#070A11]/85 backdrop-blur-2xl transition-all shadow-xl shadow-black/40">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        
        {/* Top Navbar Row */}
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onTabChange('home')}
              className="flex items-center gap-3 text-left group focus-ring rounded-2xl"
              aria-label="Go to IndiaDealHunts Home"
            >
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl overflow-hidden border border-emerald-500/40 shadow-lg shadow-emerald-500/20 group-hover:scale-105 group-hover:border-emerald-400 group-hover:shadow-emerald-500/40 transition-all duration-300 bg-gradient-to-br from-[#0E1424] to-[#151E34] flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="IndiaDealHunts Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="text-xl font-brand font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-300 to-teal-400">
                  ID
                </span>
                <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-brand font-black text-xl sm:text-2xl tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                    IndiaDealHunts
                  </span>
                  <span className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                </div>
                <div className="flex items-center gap-2 -mt-0.5">
                  <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                    Verified Loot Discovery
                  </p>
                  <span className="hidden sm:inline text-slate-600 text-[10px]">•</span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {totalDeals > 0 ? `${totalDeals} drops live` : '27 streams active'}
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Center Navigation Tabs with Modern Glassmorphism */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-md shadow-inner" aria-label="Main Navigation">
            <button
              onClick={() => onTabChange('home')}
              className={`relative px-3.5 py-2 text-xs font-bold transition-all duration-200 whitespace-nowrap rounded-xl focus-ring ${
                activeTab === 'home'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
              }`}
              aria-current={activeTab === 'home' ? 'page' : undefined}
            >
              Home
            </button>
            <button
              onClick={() => onTabChange('ending_soon')}
              className={`relative px-3.5 py-2 text-xs font-bold transition-all duration-200 whitespace-nowrap rounded-xl flex items-center gap-1.5 focus-ring ${
                activeTab === 'ending_soon'
                  ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-300 border border-orange-500/30 shadow-sm shadow-orange-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
              }`}
              aria-current={activeTab === 'ending_soon' ? 'page' : undefined}
            >
              <Zap className="w-3.5 h-3.5 text-orange-400" aria-hidden="true" />
              <span>Flash Drops</span>
            </button>
            <button
              onClick={() => onTabChange('best_worth')}
              className={`relative px-3.5 py-2 text-xs font-bold transition-all duration-200 whitespace-nowrap rounded-xl flex items-center gap-1.5 focus-ring ${
                activeTab === 'best_worth'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
              }`}
              aria-current={activeTab === 'best_worth' ? 'page' : undefined}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span>Top Worth</span>
            </button>
            <button
              onClick={() => onTabChange('lookup')}
              className={`relative px-3.5 py-2 text-xs font-bold transition-all duration-200 whitespace-nowrap rounded-xl flex items-center gap-1.5 focus-ring ${
                activeTab === 'lookup'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
              }`}
              aria-current={activeTab === 'lookup' ? 'page' : undefined}
            >
              <Search className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span>Link Lookup</span>
            </button>

            {/* Hidden purposely: mock/unverified active offers tab
            <button
              onClick={() => onTabChange('active_offers')}
              className={`relative px-3.5 py-2 text-xs font-bold transition-all duration-200 whitespace-nowrap rounded-xl flex items-center gap-1.5 focus-ring ${
                activeTab === 'active_offers'
                  ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
              }`}
              aria-current={activeTab === 'active_offers' ? 'page' : undefined}
            >
              <Tag className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
              <span>Active Offers</span>
            </button>
            */}

            {/* Hidden purposely: mock testimonials / Wall of Proofs tab
            <button
              onClick={() => onTabChange('reviews')}
              className={`relative px-3.5 py-2 text-xs font-bold transition-all duration-200 whitespace-nowrap rounded-xl flex items-center gap-1.5 focus-ring ${
                activeTab === 'reviews'
                  ? 'bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-pink-300 border border-pink-500/30 shadow-sm shadow-pink-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
              }`}
              aria-current={activeTab === 'reviews' ? 'page' : undefined}
            >
              <Heart className="w-3.5 h-3.5 text-pink-400" aria-hidden="true" />
              <span>Wall of Proofs</span>
            </button>
            */}

            {/* Hidden purposely: mock submit deal form
            <button
              onClick={() => onTabChange('submit_deal')}
              className={`relative px-3.5 py-2 text-xs font-bold transition-all duration-200 whitespace-nowrap rounded-xl flex items-center gap-1.5 focus-ring ${
                activeTab === 'submit_deal'
                  ? 'bg-gradient-to-r from-amber-500/25 to-yellow-500/25 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20'
                  : 'text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/20'
              }`}
              aria-current={activeTab === 'submit_deal' ? 'page' : undefined}
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              <span>Submit Deal</span>
            </button>
            */}
          </nav>

          {/* Right Action: WhatsApp Channel + Telegram */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <a
              href={TELEGRAM_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 min-h-[42px] px-4 py-2 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 hover:text-sky-200 text-xs font-bold transition-all active:scale-95 focus-ring shadow-sm"
              aria-label="Join Telegram channel"
            >
              <Send className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Telegram</span>
            </a>

            <a
              href={WHATSAPP_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs sm:text-sm font-black shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200 group active:scale-95 focus-ring"
              title="Join official IndiaDealHunts WhatsApp Channel"
              aria-label="Join official WhatsApp Channel"
            >
              <span className="relative flex h-2 w-2">
                <span className="radar-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950" />
              </span>
              <MessageCircle className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform shrink-0" aria-hidden="true" />
              <span className="tracking-tight">Join WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <nav 
          className="flex md:hidden items-center justify-between gap-1 overflow-x-auto scrollbar-none pb-2 pt-1 border-t border-white/[0.06]"
          aria-label="Mobile Navigation"
        >
          <button
            onClick={() => onTabChange('home')}
            className={`min-h-[44px] px-3 py-2 text-xs font-bold whitespace-nowrap rounded-xl flex items-center justify-center transition-colors focus-ring ${
              activeTab === 'home' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
            }`}
            aria-current={activeTab === 'home' ? 'page' : undefined}
          >
            Home
          </button>
          <button
            onClick={() => onTabChange('ending_soon')}
            className={`min-h-[44px] px-3 py-2 text-xs font-bold whitespace-nowrap rounded-xl flex items-center justify-center gap-1 transition-colors focus-ring ${
              activeTab === 'ending_soon' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'text-slate-400 hover:text-white'
            }`}
            aria-current={activeTab === 'ending_soon' ? 'page' : undefined}
          >
            <Zap className="w-3 h-3 text-orange-400 shrink-0" aria-hidden="true" />
            <span>Flash</span>
          </button>
          <button
            onClick={() => onTabChange('best_worth')}
            className={`min-h-[44px] px-3 py-2 text-xs font-bold whitespace-nowrap rounded-xl flex items-center justify-center gap-1 transition-colors focus-ring ${
              activeTab === 'best_worth' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
            }`}
            aria-current={activeTab === 'best_worth' ? 'page' : undefined}
          >
            <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" aria-hidden="true" />
            <span>Worth</span>
          </button>
          <button
            onClick={() => onTabChange('lookup')}
            className={`min-h-[44px] px-3 py-2 text-xs font-bold whitespace-nowrap rounded-xl flex items-center justify-center gap-1 transition-colors focus-ring ${
              activeTab === 'lookup' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
            }`}
            aria-current={activeTab === 'lookup' ? 'page' : undefined}
          >
            <Search className="w-3 h-3 text-emerald-400 shrink-0" aria-hidden="true" />
            <span>Lookup</span>
          </button>

          {/* Hidden purposely: mock/unverified active offers tab
          <button
            onClick={() => onTabChange('active_offers')}
            className={`min-h-[44px] px-3 py-2 text-xs font-bold whitespace-nowrap rounded-xl flex items-center justify-center transition-colors focus-ring ${
              activeTab === 'active_offers' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
            aria-current={activeTab === 'active_offers' ? 'page' : undefined}
          >
            Offers
          </button>
          */}

          {/* Hidden purposely: mock testimonials / Wall of Proofs tab
          <button
            onClick={() => onTabChange('reviews')}
            className={`min-h-[44px] px-3 py-2 text-xs font-bold whitespace-nowrap rounded-xl flex items-center justify-center gap-1 transition-colors focus-ring ${
              activeTab === 'reviews' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'text-slate-400 hover:text-white'
            }`}
            aria-current={activeTab === 'reviews' ? 'page' : undefined}
          >
            <Heart className="w-3 h-3 text-pink-400 shrink-0" aria-hidden="true" />
            <span>Proofs</span>
          </button>
          */}

          {/* Hidden purposely: mock submit deal form
          <button
            onClick={() => onTabChange('submit_deal')}
            className={`min-h-[44px] px-3 py-2 text-xs font-bold whitespace-nowrap rounded-xl flex items-center justify-center gap-1 transition-colors focus-ring ${
              activeTab === 'submit_deal' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-amber-400 hover:text-amber-300'
            }`}
            aria-current={activeTab === 'submit_deal' ? 'page' : undefined}
          >
            <PlusCircle className="w-3 h-3 text-amber-400 shrink-0" aria-hidden="true" />
            <span>Submit</span>
          </button>
          */}
        </nav>

      </div>
    </header>
  );
};
