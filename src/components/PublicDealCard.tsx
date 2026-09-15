import React, { useState } from 'react';
import { ExternalLink, Copy, Check, MessageCircle, ZoomIn, Clock, Flame, Star, TrendingDown, ShieldCheck, Scissors, AlertOctagon } from 'lucide-react';
import { PublicDeal } from '../types';
import { calculateWorthScore, getEndingSoonMins } from '../utils/worthScore';

interface PublicDealCardProps {
  deal: PublicDeal;
  onOpenImage: (deal: PublicDeal) => void;
  isEndingSoonView?: boolean;
  isBestWorthView?: boolean;
}

const WHATSAPP_CHANNEL_URL = 'https://whatsapp.com/channel/0029VaHCuZs2v1IkBRgH9w3z';

// Relative time formatter
function getRelativeTime(timestamp?: number): string {
  if (!timestamp) return 'Just now';
  const ms = timestamp > 1e11 ? timestamp : timestamp * 1000;
  const diffSec = Math.floor((Date.now() - ms) / 1000);
  if (diffSec < 0 || diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

// Circular Worth Score SVG Ring Component
const WorthScoreRing: React.FC<{ score: number; label: string }> = ({ score, label }) => {
  const radius = 11;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, score)) / 100 * circumference;
  const strokeColor = score >= 85 ? '#10B981' : score >= 70 ? '#F59E0B' : '#F97316';

  return (
    <div 
      className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#070A11]/80 border border-white/10 shadow-sm backdrop-blur-sm"
      title={`DealFlow Worth Index: ${score}/100 (${label})`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
        <svg className="w-5 h-5 -rotate-90" viewBox="0 0 28 28">
          <circle
            cx="14"
            cy="14"
            r={radius}
            className="stroke-slate-800"
            strokeWidth="2.5"
            fill="transparent"
          />
          <circle
            cx="14"
            cy="14"
            r={radius}
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <span className="absolute text-[9px] font-black text-white font-mono">{score}</span>
      </div>
      <span className="text-[10px] font-black text-slate-300 hidden sm:inline tracking-tight">{label}</span>
    </div>
  );
};

// Store Brand SVG Logos & Badges
const StoreLogo: React.FC<{ store: string }> = ({ store }) => {
  const s = (store || '').toLowerCase();
  if (s.includes('amazon')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#232F3E] border border-amber-500/30 text-amber-300 text-[11px] font-black shadow-xs">
        <svg className="w-3 h-3 fill-amber-400" viewBox="0 0 24 24">
          <path d="M15.93 17.09c-2.83 2.08-6.95 3.19-10.49 1.57-1.44-.66-2.6-1.74-3.44-3.09-.23-.37.05-.83.47-.73 3.65.86 7.6.61 10.98-1.02.43-.21.9.21.62.61-.41.59-.83 1.14-1.32 1.66l3.18 1zm4.72-2.19c.14-.84.22-1.7.22-2.58 0-6.07-4.93-11-11-11S-.13 6.25-.13 12.32 4.8 23.32 10.87 23.32c3.55 0 6.72-1.68 8.76-4.31.25-.32.06-.79-.34-.84l-2.02-.27c-.22-.03-.43.08-.54.27-1.41 1.94-3.7 3.2-6.28 3.2-4.38 0-7.94-3.44-8.09-7.78 3.73 1.83 8.16 1.87 11.96.11l.07-.03c.53-.25.86-.79.82-1.38-.05-.81-.69-1.44-1.5-1.47-2.9-.11-5.74.88-8.08 2.59.34-3.37 3.18-5.99 6.64-5.99 3.69 0 6.68 3 6.68 6.68 0 .42-.04.83-.11 1.23-.05.3.16.58.46.61l2.45.24c.26.03.48-.15.52-.41z"/>
        </svg>
        Amazon
      </span>
    );
  }
  if (s.includes('flipkart')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#2874F0]/25 border border-blue-500/40 text-blue-300 text-[11px] font-black shadow-xs">
        <span className="w-2.5 h-2.5 rounded-full bg-[#FFE500] text-[#2874F0] font-black text-[9px] flex items-center justify-center leading-none">f</span>
        Flipkart
      </span>
    );
  }
  if (s.includes('myntra')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-pink-500/20 border border-pink-500/40 text-pink-300 text-[11px] font-black shadow-xs">
        <span className="font-black text-[10px] text-pink-400">M</span>
        Myntra
      </span>
    );
  }
  if (s.includes('ajio')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[11px] font-black shadow-xs">
        AJIO
      </span>
    );
  }
  if (s.includes('swiggy')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-500/20 border border-orange-500/40 text-orange-300 text-[11px] font-black shadow-xs">
        Swiggy
      </span>
    );
  }
  if (s.includes('zepto')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[11px] font-black shadow-xs">
        ⚡ Zepto
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-black shadow-xs">
      {store}
    </span>
  );
};

export const PublicDealCard: React.FC<PublicDealCardProps> = ({
  deal,
  onOpenImage,
  isEndingSoonView = false,
  isBestWorthView = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [couponCopied, setCouponCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Calculate Worth Score & Urgency
  const worth = calculateWorthScore(deal);
  const endingMins = getEndingSoonMins(deal.id);
  const isOver = Boolean(deal.is_over || deal.expiry_mins === 0 || deal.stock_status === 'expired');
  const relativeTime = getRelativeTime(deal.posted_at);

  // Copy Link Action
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(deal.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // Copy Coupon Code Action
  const handleCopyCoupon = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!deal.coupon) return;
    navigator.clipboard.writeText(deal.coupon);
    setCouponCopied(true);
    setTimeout(() => setCouponCopied(false), 2000);
  };

  // WhatsApp Share Action with IndiaDealHunts Branding
  const handleWhatsAppShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = encodeURIComponent(
      `*${deal.title}*\n` +
      `Deal Price: ₹${(deal.price || 0).toLocaleString('en-IN')}` +
      (deal.mrp ? ` (MRP: ₹${deal.mrp.toLocaleString('en-IN')})` : '') +
      (deal.coupon ? `\nCoupon Code: ${deal.coupon}` : '') +
      `\nDeal Worth Index: ${worth.score}/100 (${worth.label})` +
      `\n\nClaim Deal: ${deal.url}` +
      `\n\nJoin IndiaDealHunts WhatsApp Channel for instant verified drops:\n${WHATSAPP_CHANNEL_URL}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Sanitize image URL to prevent mixed content HTTP blocks
  const sanitizeImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://74.225.250.0')) {
      return url.replace('http://74.225.250.0', 'https://api.rudranil.me');
    }
    if (url.startsWith('http://') && !url.includes('localhost') && !url.includes('127.0.0.1')) {
      return url.replace('http://', 'https://');
    }
    return url;
  };

  const cleanImageUrl = sanitizeImageUrl(deal.image);
  const savings = (deal.mrp || 0) - (deal.price || 0);

  return (
    <article 
      className={`group relative flex flex-col rounded-3xl border border-white/[0.09] bg-gradient-to-b from-[#0E1424] to-[#080B13] hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/10 card-elevation overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/50 transition-all ${
        isOver ? 'opacity-70 grayscale-[25%]' : ''
      } ${isBestWorthView ? 'md:p-1' : ''}`}
      aria-label={`${deal.title} on ${deal.store}`}
    >
      
      {/* 1. Header Meta Bar: Store Logo, Relative Time & Circular SVG Worth Ring */}
      <div className="flex items-center justify-between px-3.5 pt-3 pb-2 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <StoreLogo store={deal.store || 'Retail'} />
          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
            <Clock className="w-3 h-3 text-slate-400" />
            {relativeTime}
          </span>
        </div>

        {/* Circular SVG Worth Ring */}
        <WorthScoreRing score={worth.score} label={worth.label} />
      </div>

      {/* 2. Product Image Stage with Zero-CLS Locked Aspect Ratio */}
      <div
        className="relative mx-3 aspect-[4/3] bg-white rounded-2xl p-3 flex items-center justify-center overflow-hidden cursor-pointer group-hover:scale-[1.01] transition-transform duration-200 shadow-inner"
        onClick={() => onOpenImage(deal)}
        role="button"
        tabIndex={0}
        aria-label={`Enlarge photo for ${deal.title}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpenImage(deal);
          }
        }}
      >
        {/* Skeleton placeholder while loading image */}
        {!imageLoaded && !imgError && cleanImageUrl && (
          <div className="absolute inset-0 bg-slate-100 skeleton-loading" aria-hidden="true" />
        )}

        {cleanImageUrl && !imgError ? (
          <img
            src={cleanImageUrl}
            alt={deal.title}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImgError(true);
              setImageLoaded(true);
            }}
            className={`max-h-full max-w-full object-contain filter drop-shadow-sm transition-all duration-300 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
          />
        ) : (
          <div className="text-slate-400 text-xs font-semibold text-center px-2 flex flex-col items-center gap-1">
            <ShieldCheck className="w-5 h-5 text-emerald-500" aria-hidden="true" />
            <span>Verified {deal.store} Loot</span>
          </div>
        )}

        {/* OVER / Expired Badge Overlay */}
        {isOver ? (
          <div className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-rose-600/95 text-white text-[11px] font-black flex items-center gap-1 shadow-lg backdrop-blur-sm ring-1 ring-white/20">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>OVER</span>
          </div>
        ) : isEndingSoonView ? (
          /* Hidden purposely: Simulated countdown timer ({endingMins}m)
          <div 
            className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-black flex items-center gap-1.5 shadow-md"
            aria-live="polite"
          >
            <Clock className="w-3.5 h-3.5 animate-pulse" aria-hidden="true" />
            <span>Ends in {endingMins}m</span>
          </div>
          */
          <div 
            className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-black flex items-center gap-1.5 shadow-md"
            aria-live="polite"
          >
            <Clock className="w-3.5 h-3.5 animate-pulse" aria-hidden="true" />
            <span>LIMITED DROP</span>
          </div>
        ) : deal.discount_pct && deal.discount_pct >= 60 ? (
          <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 text-[10px] font-black flex items-center gap-1.5 shadow-md">
            <Flame className="w-3.5 h-3.5 fill-slate-950" aria-hidden="true" />
            <span>FLASH DROP</span>
          </div>
        ) : null}

        {/* Hover Zoom Hint */}
        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex items-center justify-center">
          <span className="px-3 py-1.5 rounded-full bg-black/80 text-white text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md shadow-lg border border-white/10">
            <ZoomIn className="w-3.5 h-3.5" aria-hidden="true" /> View Photo
          </span>
        </div>
      </div>

      {/* 3. Deal Info Body */}
      <div className="flex flex-col flex-1 p-3.5">
        
        {/* Title */}
        <h3
          className="font-bold text-sm text-white line-clamp-2 mb-2 group-hover:text-emerald-300 transition-colors leading-snug"
          title={deal.title}
        >
          {deal.title}
        </h3>

        {/* Pricing & Savings Hierarchy */}
        <div className="mt-auto pt-2 space-y-2.5">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl sm:text-[1.7rem] font-price font-black text-emerald-400">
              ₹{(deal.price || 0).toLocaleString('en-IN')}
            </span>

            {deal.usually_price && deal.usually_price > (deal.price || 0) ? (
              <span className="text-xs text-slate-400">
                Usually: <span className="line-through font-mono">₹{deal.usually_price.toLocaleString('en-IN')}</span>
              </span>
            ) : deal.mrp && deal.mrp > (deal.price || 0) ? (
              <span className="text-xs text-slate-500 line-through font-mono">
                ₹{deal.mrp.toLocaleString('en-IN')}
              </span>
            ) : null}

            {deal.discount_pct && (
              <span className="text-xs font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md">
                {deal.discount_pct}% OFF
              </span>
            )}
          </div>

          {/* Coupon Code Pill (if available) */}
          {deal.coupon && (
            <button
              onClick={handleCopyCoupon}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-dashed border-amber-500/40 hover:bg-amber-500/20 text-amber-300 text-xs transition-colors group/c"
              title="Click to copy coupon code"
            >
              <span className="flex items-center gap-1.5 font-mono font-bold">
                <Scissors className="w-3 h-3 text-amber-400" />
                Coupon: {deal.coupon}
              </span>
              <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                {couponCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {couponCopied ? 'Copied!' : 'Copy Code'}
              </span>
            </button>
          )}

          {/* Savings Tag with TrendingDown Vector */}
          {((deal.savings || 0) > 100 || savings > 100) && (
            <div className="text-[11px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 rounded-lg w-fit flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-emerald-400" aria-hidden="true" />
              <span>Save ₹{(deal.savings || savings).toLocaleString('en-IN')}</span>
            </div>
          )}

          {/* Action Row with $\ge 44\times 44\text{px}$ Mobile Touch Target Standard */}
          <div className="flex items-center gap-2 pt-1">
            <a
              href={deal.url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className={`flex-1 min-h-[44px] py-2.5 px-3.5 rounded-xl font-bold text-xs tracking-tight flex items-center justify-center gap-1.5 shadow-md transition-all duration-150 active:scale-[0.98] focus-ring ${
                isOver 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' 
                  : 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black shadow-emerald-500/20 hover:shadow-emerald-500/35'
              }`}
              aria-label={`Claim deal on ${deal.store} for ₹${(deal.price || 0).toLocaleString('en-IN')}`}
            >
              <span>{isOver ? 'View Product' : `Claim on ${deal.store}`}</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            </a>

            {/* WhatsApp Share Button */}
            <button
              onClick={handleWhatsAppShare}
              className="touch-target min-h-[44px] min-w-[44px] rounded-xl bg-white/[0.05] hover:bg-emerald-500/20 text-white/80 hover:text-emerald-300 border border-white/10 transition active:scale-95 focus-ring"
              title="Share deal on WhatsApp"
              aria-label="Share deal on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            </button>

            {/* Copy Link Button */}
            <button
              onClick={handleCopy}
              className="touch-target min-h-[44px] min-w-[44px] rounded-xl bg-white/[0.05] hover:bg-white/[0.12] text-white/80 hover:text-white border border-white/10 transition active:scale-95 focus-ring"
              title="Copy product link"
              aria-label="Copy deal link to clipboard"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              ) : (
                <Copy className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

      </div>

    </article>
  );
};
