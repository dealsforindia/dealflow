import React from 'react';
import { NavTab } from '../types';
import { Sparkles, Mail, Send, MessageCircle, CheckCircle2, ShieldCheck, Heart, PlusCircle } from 'lucide-react';
import { LegalDocType } from './LegalModal';

interface FooterProps {
  onTabChange?: (tab: NavTab) => void;
  onOpenLegal?: (type: LegalDocType) => void;
}

const WHATSAPP_CHANNEL_URL = 'https://whatsapp.com/channel/0029VaHCuZs2v1IkBRgH9w3z';
const TELEGRAM_CHANNEL_URL = 'https://t.me/dealsforindiachannel';

export const Footer: React.FC<FooterProps> = ({ onTabChange, onOpenLegal }) => {
  return (
    <footer className="relative z-10 mt-16 border-t border-white/10 bg-gradient-to-t from-black via-[#0B0F19] to-[#111827] text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between lg:gap-8 pb-10 border-b border-white/10">
          
          {/* Brand Info & Official Mission Statement */}
          <div className="flex max-w-sm flex-col gap-3.5">
            <div className="flex items-center gap-3 w-fit">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-emerald-500/40 shadow-lg shadow-emerald-500/20 bg-[#111827] flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="IndiaDealHunts Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="text-xl font-brand font-bold text-emerald-400">ID</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-2xl font-brand font-bold tracking-tight text-white">
                    IndiaDealHunts
                  </h3>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                </div>
                <p className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">
                  Verified Loot Discovery Engine
                </p>
              </div>
            </div>

            {/* Hidden purposely: wording containing 'fake discounts'
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              India's AI-powered deal curation platform. We track 27+ retailers and Telegram feeds every minute, eliminating fake discounts and surfacing genuine price drops.
            </p>
            */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              India's AI-powered deal curation platform. We track 27+ retailers and Telegram feeds every minute, eliminating inflated prices and surfacing genuine price drops.
            </p>

            <a
              href="mailto:hello@rudranil.me"
              className="text-xs text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-2 group w-fit mt-1 focus-ring rounded"
              aria-label="Contact us at hello@rudranil.me"
            >
              <Mail className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" aria-hidden="true" />
              <span className="group-hover:underline">hello@rudranil.me</span>
            </a>
          </div>

          {/* Navigation Sections */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 lg:gap-10">
            
            {/* Explore Section */}
            <div className="flex flex-col gap-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Explore
              </span>
              <nav className="flex flex-col gap-2" aria-label="Explore Pages">
                <button
                  onClick={() => onTabChange && onTabChange('home')}
                  className="text-sm text-slate-300 hover:text-emerald-400 transition-colors text-left focus-ring rounded"
                >
                  Home
                </button>
                <button
                  onClick={() => onTabChange && onTabChange('ending_soon')}
                  className="text-sm text-slate-300 hover:text-emerald-400 transition-colors text-left focus-ring rounded"
                >
                  Flash Drops
                </button>
                <button
                  onClick={() => onTabChange && onTabChange('best_worth')}
                  className="text-sm text-slate-300 hover:text-emerald-400 transition-colors text-left focus-ring rounded"
                >
                  Top Worth Deals
                </button>
                {/* Hidden purposely: mock/unverified active offers
                <button
                  onClick={() => onTabChange && onTabChange('active_offers')}
                  className="text-sm text-slate-300 hover:text-emerald-400 transition-colors text-left focus-ring rounded"
                >
                  Vouchers & Offers
                </button>
                */}
                <button
                  onClick={() => onTabChange && onTabChange('lookup')}
                  className="text-sm text-slate-300 hover:text-emerald-400 transition-colors text-left focus-ring rounded"
                >
                  Link Lookup Tool
                </button>
              </nav>
            </div>

            {/* Company Section */}
            <div className="flex flex-col gap-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Company
              </span>
              <nav className="flex flex-col gap-2" aria-label="Company Pages">
                <button
                  onClick={() => onTabChange && onTabChange('about')}
                  className="text-sm text-slate-300 hover:text-emerald-400 transition-colors text-left focus-ring rounded"
                >
                  About Us
                </button>
                <button
                  onClick={() => onTabChange && onTabChange('how_we_verify')}
                  className="text-sm text-slate-300 hover:text-emerald-400 transition-colors text-left focus-ring rounded"
                >
                  How We Verify Deals
                </button>
                {/* Hidden purposely: mock submit deal form
                <button
                  onClick={() => onTabChange && onTabChange('submit_deal')}
                  className="text-sm text-amber-300 hover:text-amber-200 transition-colors text-left focus-ring rounded flex items-center gap-1 font-medium"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Submit a Deal
                </button>
                */}
                <button
                  onClick={() => onTabChange && onTabChange('contact')}
                  className="text-sm text-slate-300 hover:text-emerald-400 transition-colors text-left focus-ring rounded"
                >
                  Contact & Support
                </button>
                {/* Hidden purposely: mock testimonials / Wall of Happiness
                <button
                  onClick={() => onTabChange && onTabChange('reviews')}
                  className="text-sm text-slate-300 hover:text-emerald-400 transition-colors text-left focus-ring rounded flex items-center gap-1"
                >
                  <Heart className="w-3 h-3 text-pink-400" />
                  Wall of Happiness
                </button>
                */}
              </nav>
            </div>

            {/* Official Channels */}
            <div className="flex flex-col gap-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Community
              </span>
              <nav className="flex flex-col gap-2" aria-label="Community Channels">
                <a
                  href={WHATSAPP_CHANNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-1.5 focus-ring rounded"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                  <span>WhatsApp Channel</span>
                </a>
                <a
                  href={TELEGRAM_CHANNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-1.5 focus-ring rounded"
                >
                  <Send className="w-3.5 h-3.5 text-sky-400 shrink-0" aria-hidden="true" />
                  <span>Telegram Channel</span>
                </a>
                <button
                  onClick={() => onOpenLegal && onOpenLegal('disclosure')}
                  className="text-sm text-slate-300 hover:text-emerald-400 transition-colors text-left focus-ring rounded"
                >
                  Affiliate Disclosure
                </button>
                <button
                  onClick={() => onOpenLegal && onOpenLegal('terms')}
                  className="text-sm text-slate-300 hover:text-emerald-400 transition-colors text-left focus-ring rounded"
                >
                  Terms of Service
                </button>
                <button
                  onClick={() => onOpenLegal && onOpenLegal('privacy')}
                  className="text-sm text-slate-300 hover:text-emerald-400 transition-colors text-left focus-ring rounded"
                >
                  Privacy Policy
                </button>
              </nav>
            </div>

          </div>

          {/* Official Free Alerts CTA */}
          <div className="flex w-full flex-col gap-3 lg:max-w-xs">
            <div className="flex items-center gap-2 text-white">
              <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" aria-hidden="true" />
              <span className="text-sm font-bold">Free Instant Alerts</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed -mt-1">
              Join 50,000+ smart shoppers on WhatsApp and Telegram for instant glitch notifications.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <a
                href={WHATSAPP_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-3.5 py-2.5 text-xs font-bold text-black transition-all shadow-lg shadow-emerald-500/20 active:scale-95 focus-ring"
                aria-label="Join WhatsApp channel"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-black shrink-0" aria-hidden="true" />
                <span>WhatsApp</span>
              </a>
              <a
                href={TELEGRAM_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/30 px-3.5 py-2.5 text-xs font-bold text-sky-300 transition-all active:scale-95 focus-ring"
                aria-label="Join Telegram channel"
              >
                <Send className="w-3.5 h-3.5 text-sky-400 shrink-0" aria-hidden="true" />
                <span>Telegram</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Disclaimer */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2024–2026 IndiaDealHunts. All rights reserved. Transparent, algorithmically verified deals.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => onOpenLegal && onOpenLegal('terms')} className="hover:text-white transition focus-ring rounded">
              Terms
            </button>
            <span>•</span>
            <button onClick={() => onOpenLegal && onOpenLegal('privacy')} className="hover:text-white transition focus-ring rounded">
              Privacy
            </button>
            <span>•</span>
            <button onClick={() => onOpenLegal && onOpenLegal('disclosure')} className="hover:text-white transition focus-ring rounded">
              Affiliate Disclosure
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
