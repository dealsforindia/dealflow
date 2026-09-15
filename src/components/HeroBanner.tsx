import React, { useState, useEffect } from 'react';
import { Search, Sparkles, ExternalLink, ArrowRight, ShieldCheck, Tag, MessageCircle, Send, CheckCircle2, Star, X, Zap } from 'lucide-react';
import { PublicDeal } from '../types';
import { calculateWorthScore } from '../utils/worthScore';

interface HeroBannerProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onQuickSearch: (q: string) => void;
  dealCount: number;
  spotlightDeal: PublicDeal | null;
  onSelectDeal?: (deal: PublicDeal) => void;
  onOpenLookup?: (url?: string) => void;
}

const WHATSAPP_CHANNEL_URL = 'https://whatsapp.com/channel/0029VaHCuZs2v1IkBRgH9w3z';
const TELEGRAM_CHANNEL_URL = 'https://t.me/dealsforindiachannel';

export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchQuery,
  onSearchChange,
  onQuickSearch,
  dealCount,
  spotlightDeal,
  onOpenLookup,
}) => {
  const quickTags = [
    'Smart TVs',
    'Laptops',
    'Sneakers',
    'Smartwatches',
    'Dinner Sets',
    'boAt Audio',
    'Grocery',
    'Luggage Bags',
  ];

  const [inputVal, setInputVal] = useState(searchQuery);
  const [currentTime, setCurrentTime] = useState('');
  const [spotlightImgLoaded, setSpotlightImgLoaded] = useState(false);
  const [spotlightImgError, setSpotlightImgError] = useState(false);

  useEffect(() => {
    setSpotlightImgLoaded(false);
    setSpotlightImgError(false);
  }, [spotlightDeal?.id, spotlightDeal?.image]);

  useEffect(() => {
    setInputVal(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    // Generate IST formatted timestamp for verified freshness indicator
    const now = new Date();
    const istOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    };
    setCurrentTime(now.toLocaleTimeString('en-IN', istOptions));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = inputVal.trim();
    if (
      val.startsWith('http://') ||
      val.startsWith('https://') ||
      val.includes('amzn.') ||
      val.includes('flipkart.') ||
      val.includes('myntra.')
    ) {
      if (onOpenLookup) {
        onOpenLookup(val);
        return;
      }
    }
    onSearchChange(inputVal);
  };

  const handleClear = () => {
    setInputVal('');
    onSearchChange('');
  };

  const spotlightScore = spotlightDeal ? calculateWorthScore(spotlightDeal) : null;
  const spotlightDisplayTitle = spotlightDeal?.title
    ? spotlightDeal.title.replace(/^[\s\u2700-\u27BF\uE000-\uF8FF\uD83C-\uDBFF\uDC00-\uDFFF\u2011-\u26FF\uFE0E-\uFE0F\u00A0-\u00BF👉⚡🔥✅🎁📦🚨📢🏷️💎⏰‼️💥]+\s*/gu, '').trim() || spotlightDeal.title
    : 'Verified Retail Deal';

  return (
    <section className="relative pt-6 sm:pt-12 pb-10 sm:pb-16 overflow-hidden border-b border-white/[0.08]">
      {/* Dynamic Aurora Ambient Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[950px] h-[400px] bg-gradient-to-b from-emerald-500/20 via-teal-500/10 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-12 left-6 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-20 right-6 w-96 h-96 bg-orange-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headlines, Trust telemetry, Search & Quick Actions */}
          <div className="lg:col-span-7 text-center lg:text-left">
            
            {/* Live Telemetry Radar & Verification Badge */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 mb-5">
              <div 
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-black text-emerald-400 shadow-md shadow-emerald-500/10 backdrop-blur-md"
                aria-live="polite"
              >
                <span className="relative flex h-2 w-2">
                  <span className="radar-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-90" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="tracking-wider uppercase text-[10px] font-mono">DEALFLOW ENGINE</span>
                <span className="text-white/30">•</span>
                <span className="font-semibold">{dealCount > 0 ? `${dealCount} drops verified live` : 'Scanning 27 streams'}</span>
              </div>

              {/* Hidden purposely: unverified fake claim badge
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-[11px] font-medium text-slate-300 backdrop-blur-md">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                <span>Zero Fake MRPs {currentTime ? `• ${currentTime} IST` : '• Today'}</span>
              </div>
              */}
            </div>

            {/* Main Headline with Pro Max Rubik/Outfit Typography */}
            <h1 className="text-3xl sm:text-5xl lg:text-[4rem] font-black tracking-tight text-white leading-[1.08] mb-4 font-brand">
              Discover Verified Deals,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 block lg:inline">
                Discounts & Loots
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-300 font-normal max-w-xl mx-auto lg:mx-0 mb-7 leading-relaxed">
              Curated price crash intelligence across Amazon, Flipkart, Swiggy, and Myntra. Cross-referenced across 27+ live channels with automated link sanity checks and historical all-time low price verification.
            </p>

            {/* Call to Actions with Touch-Target Compliance (>= 44px) */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6">
              <a
                href={WHATSAPP_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[46px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm tracking-tight shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200 active:scale-[0.98] focus-ring"
                aria-label="Follow IndiaDealHunts on WhatsApp Channel"
              >
                <MessageCircle className="w-4 h-4 fill-slate-950 text-slate-950 shrink-0" aria-hidden="true" />
                <span>Join WhatsApp Channel</span>
                <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </a>

              <a
                href={TELEGRAM_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[46px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white font-bold text-xs sm:text-sm transition-all active:scale-[0.98] focus-ring"
                aria-label="Join IndiaDealHunts Telegram Community"
              >
                <Send className="w-4 h-4 text-sky-400 shrink-0" aria-hidden="true" />
                <span>Telegram Group</span>
              </a>

              {onOpenLookup && (
                <button
                  type="button"
                  onClick={() => onOpenLookup()}
                  className="min-h-[46px] inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs sm:text-sm transition-all active:scale-[0.98] focus-ring"
                  aria-label="Open Instant Link Sanity Checker modal"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                  <span>Instant Link Sanity Checker</span>
                </button>
              )}
            </div>

            {/* Smart Search & URL Input Bar with Glassmorphic Glow */}
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto lg:mx-0 mb-5" role="search">
              <div className="relative flex items-center rounded-2xl border border-white/15 bg-[#0E1424]/90 p-1.5 shadow-2xl backdrop-blur-2xl focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/40 transition-all duration-200">
                <div className="pl-3.5 pr-2 text-slate-400">
                  <Search className="w-5 h-5 text-emerald-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => {
                    setInputVal(e.target.value);
                    onSearchChange(e.target.value);
                  }}
                  placeholder="Paste product link (Amazon/Flipkart) or search (e.g. sneakers, TV, boAt)..."
                  className="w-full bg-transparent py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none"
                  aria-label="Search deals or paste product URL"
                />
                {inputVal && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-2 text-slate-400 hover:text-white transition-colors mr-1"
                    aria-label="Clear search input"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="submit"
                  className="min-h-[42px] shrink-0 px-5 sm:px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm tracking-wide transition shadow-lg shadow-emerald-500/25 active:scale-95 focus-ring"
                >
                  Lookup Deal
                </button>
              </div>
            </form>

            {/* Popular Query Pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 sm:gap-2 mb-3">
              <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" /> Popular:
              </span>
              {quickTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setInputVal(tag);
                    onQuickSearch(tag);
                  }}
                  className="min-h-[32px] px-3 py-1 text-xs font-semibold rounded-lg bg-white/[0.04] hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/30 text-slate-300 hover:text-emerald-300 transition-all active:scale-95 focus-ring cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Community Motto */}
            <p className="text-[11px] font-bold text-emerald-400/80 tracking-widest uppercase font-mono">
              FOLLOW • SHARE • SAVE THOUSANDS
            </p>

          </div>

          {/* Right Column: Featured Spotlight Deal with 3D Glass Surface */}
          <div className="lg:col-span-5">
            {spotlightDeal ? (
              <div className="relative rounded-3xl border border-emerald-500/35 bg-gradient-to-b from-[#151E34] via-[#0E1424] to-[#070A11] p-5 sm:p-7 shadow-2xl overflow-hidden group card-elevation">
                
                {/* Luminous Glow Accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-[80px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/15 blur-[70px] rounded-full pointer-events-none" />

                <div className="flex items-center justify-between gap-2 mb-4 relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black tracking-wide uppercase shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                    <span>#1 Verified Loot Hunt</span>
                  </div>

                  {spotlightScore && (
                    <div 
                      className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 font-black text-xs shadow-md flex items-center gap-1"
                      aria-label={`Spotlight deal score: ${spotlightScore.score} out of 100`}
                    >
                      <Star className="w-3.5 h-3.5 fill-slate-950 shrink-0" aria-hidden="true" />
                      <span>{spotlightScore.score}</span>
                      <span className="text-[10px] opacity-90 font-bold">{spotlightScore.label}</span>
                    </div>
                  )}
                </div>

                {/* Product Image Stage with Aspect Ratio Lock & Soft Lighting */}
                <div className="relative w-full aspect-[16/10] bg-white rounded-2xl p-4 flex items-center justify-center mb-4 overflow-hidden shadow-inner group-hover:scale-[1.01] transition-transform duration-300">
                  {/* Skeleton shimmer while loading */}
                  {!spotlightImgLoaded && !spotlightImgError && spotlightDeal.image && (
                    <div className="absolute inset-0 bg-slate-100 skeleton-loading" aria-hidden="true" />
                  )}

                  {spotlightDeal.image && !spotlightImgError ? (
                    <img
                      src={
                        spotlightDeal.image.startsWith('http://74.225.250.0')
                          ? spotlightDeal.image.replace('http://74.225.250.0', 'https://api.rudranil.me')
                          : spotlightDeal.image
                      }
                      alt={spotlightDisplayTitle}
                      onLoad={() => setSpotlightImgLoaded(true)}
                      onError={() => {
                        setSpotlightImgError(true);
                        setSpotlightImgLoaded(true);
                      }}
                      className={`max-h-full max-w-full object-contain filter drop-shadow-md transition-all duration-300 group-hover:scale-105 ${
                        spotlightImgLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      loading="eager"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shadow-sm">
                        <Sparkles className="w-6 h-6 text-emerald-600" />
                      </div>
                      <span className="text-slate-800 font-black text-sm tracking-tight font-brand">
                        Verified {spotlightDeal.store} Loot
                      </span>
                      <span className="text-emerald-600 text-[11px] font-bold uppercase tracking-wider">
                        Curated Deal Drop
                      </span>
                    </div>
                  )}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/80 text-white text-xs font-bold backdrop-blur-md shadow-sm border border-white/10 z-10">
                    {spotlightDeal.store}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-white text-base sm:text-lg line-clamp-2 mb-3 leading-snug group-hover:text-emerald-300 transition-colors">
                  {spotlightDisplayTitle}
                </h3>

                {/* Price and Savings Row */}
                <div className="flex items-baseline gap-2.5 mb-5 flex-wrap">
                  <span className="text-3xl sm:text-4xl font-price font-black text-emerald-400">
                    ₹{(spotlightDeal.price || 0).toLocaleString('en-IN')}
                  </span>
                  {spotlightDeal.mrp && spotlightDeal.mrp > (spotlightDeal.price || 0) && (
                    <span className="text-sm sm:text-base text-slate-500 line-through font-mono">
                      ₹{spotlightDeal.mrp.toLocaleString('en-IN')}
                    </span>
                  )}
                  {spotlightDeal.discount_pct && (
                    <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black text-xs shadow-sm">
                      {spotlightDeal.discount_pct}% OFF
                    </span>
                  )}
                </div>

                {/* CTA Action Button ($\ge 44\text{px}$ touch target) */}
                <a
                  href={spotlightDeal.url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="w-full min-h-[46px] py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all active:scale-[0.98] focus-ring"
                  aria-label={`Claim spotlight deal on ${spotlightDeal.store} for ₹${(spotlightDeal.price || 0).toLocaleString('en-IN')}`}
                >
                  <span>Claim Hunt on {spotlightDeal.store}</span>
                  <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
                </a>

              </div>
            ) : (
              <div className="rounded-3xl border border-white/10 bg-[#0E1424] p-8 text-center text-slate-300">
                <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" aria-hidden="true" />
                <h4 className="text-white font-bold text-lg mb-1.5 font-brand">Algorithmic Deal Verification</h4>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Every product is cross-referenced against historical pricing data across 27+ live Indian streams to ensure zero inflated MRP markups.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};
