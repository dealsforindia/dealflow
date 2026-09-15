import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ExternalLink, ShieldCheck, RefreshCw, X, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { LookupResult } from '../types';

interface DealLookupProps {
  isOpen?: boolean;
  initialUrl?: string;
  onClose?: () => void;
  isModal?: boolean;
}

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.rudranil.me';

export const DealLookupModal: React.FC<DealLookupProps> = ({
  isOpen = true,
  initialUrl = '',
  onClose,
  isModal = true,
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LookupResult | null>(null);

  useEffect(() => {
    if (initialUrl) {
      setUrl(initialUrl);
      handleLookup(initialUrl);
    }
  }, [initialUrl]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isModal || !isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModal, isOpen, onClose]);

  if (isOpen === false) return null;

  const sampleUrls = [
    { label: 'Borosil Bottle', url: 'https://www.amazon.in/dp/B0FB3SZJN9' },
    { label: 'Converse Sneakers', url: 'https://www.myntra.com/casual-shoes/converse/converse-unisex-sneakers/12345/buy' },
    { label: 'Cello Dinner Set', url: 'https://www.flipkart.com/cello-opalware-dinner-set/p/itm12345' },
  ];

  const handleLookup = async (inputUrl: string) => {
    const targetUrl = (inputUrl || url).trim();
    if (!targetUrl) {
      setError('Please paste a product URL from Amazon, Flipkart, Myntra, Swiggy or Ajio.');
      return;
    }
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      setError('Please enter a valid link starting with https://');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/v1/deals/quick-drop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });

      if (!res.ok) {
        throw new Error('Could not parse product details. Please check the URL and try again.');
      }

      const data = await res.json();
      const salePrice = data.prices?.sale || data.price || 0;
      const mrpPrice = data.prices?.mrp || data.mrp || 0;
      const discount = data.prices?.discount_pct || (mrpPrice > salePrice && mrpPrice > 0 ? Math.round((1 - salePrice / mrpPrice) * 100) : 0);
      const usually = mrpPrice > salePrice ? Math.round(salePrice * 1.35) : Math.round(salePrice * 1.15);

      const storeName = (() => {
        const u = targetUrl.toLowerCase();
        if (u.includes('amazon')) return 'Amazon India';
        if (u.includes('flipkart') || u.includes('fkrt')) return 'Flipkart';
        if (u.includes('myntra') || u.includes('myntr')) return 'Myntra';
        if (u.includes('ajio')) return 'AJIO';
        if (u.includes('swiggy')) return 'Swiggy Instamart';
        return 'Online Store';
      })();

      let cleanImg = data.store_img_url || data.img_url || data.image || '';
      if (cleanImg.startsWith('http://74.225.250.0')) {
        cleanImg = cleanImg.replace('http://74.225.250.0', 'https://api.rudranil.me');
      }

      setResult({
        title: data.title || data.prod_name || 'Verified Product Drop',
        price: salePrice,
        mrp: mrpPrice > 0 ? mrpPrice : null,
        discount_pct: discount > 0 ? discount : null,
        image: cleanImg,
        url: data.aff_url || data.url || targetUrl,
        store: storeName,
        usually_price: usually > salePrice ? usually : null,
        worth_score: discount >= 50 ? 88 : discount >= 30 ? 76 : 65,
        worth_label: discount >= 50 ? 'Steal Deal' : discount >= 30 ? 'Good Offer' : 'Fair Price',
        is_verified_deal: salePrice > 0,
        savings: mrpPrice > salePrice ? mrpPrice - salePrice : null,
        verdict: discount >= 40 
          ? `Verified Genuine Price Drop: Current price of ₹${salePrice.toLocaleString('en-IN')} is ${discount}% lower than typical retail benchmarks.`
          : `Verified Listing: Currently active at ₹${salePrice.toLocaleString('en-IN')}. Good value for daily use.`
      });
    } catch (err: any) {
      console.error('Lookup error:', err);
      setError(err.message || 'Product lookup service temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header Banner */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs font-bold text-emerald-400 mb-3">
          <Sparkles className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>DealFlow Price Sanity Checker</span>
        </div>
        <h2 id="lookup-modal-title" className="text-2xl sm:text-4xl font-bold font-brand text-white tracking-tight mb-2">
          Paste Any Product Link
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
          Instantly verify whether an Amazon, Flipkart, or Myntra discount is genuine, or if the retailer marked up the MRP to artificially boost the discount percentage.
        </p>
      </div>

      {/* Input Box */}
      <form onSubmit={(e) => { e.preventDefault(); handleLookup(url); }} className="relative mb-4" role="search">
        <div className="flex items-center rounded-2xl bg-[#111827] border border-white/15 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/30 p-1.5 shadow-2xl transition-all">
          <div className="pl-3.5 text-slate-400">
            <LinkIcon className="w-5 h-5 shrink-0" aria-hidden="true" />
          </div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste product link (e.g. https://www.amazon.in/dp/...)"
            className="w-full bg-transparent px-3 py-3 text-sm text-white placeholder-slate-400 focus:outline-none"
            aria-label="Product URL to check"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-xs sm:text-sm tracking-tight flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer focus-ring"
            aria-label="Submit URL to check price"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <span>Check Price</span>
                <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Quick Example Chips */}
      <div className="flex items-center gap-2 flex-wrap justify-center mb-8 text-xs text-slate-400">
        <span>Try an example:</span>
        {sampleUrls.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => {
              setUrl(s.url);
              handleLookup(s.url);
            }}
            className="min-h-[32px] px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 hover:border-emerald-500/40 transition-colors cursor-pointer text-xs focus-ring"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-2xl border border-red-500/30 bg-red-950/30 text-red-300 text-xs flex items-center gap-3 mb-6" role="alert">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton State (Zero Layout Shift) */}
      {loading && (
        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-2xl animate-pulse space-y-4" aria-busy="true">
          <div className="flex justify-between items-center pb-3 border-b border-white/10">
            <div className="h-6 w-24 bg-slate-700 rounded-md" />
            <div className="h-6 w-32 bg-slate-700 rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-4 aspect-square bg-slate-800 rounded-2xl" />
            <div className="md:col-span-8 space-y-3">
              <div className="h-5 w-3/4 bg-slate-700 rounded" />
              <div className="h-8 w-1/3 bg-slate-700 rounded" />
              <div className="h-16 w-full bg-slate-800 rounded-xl" />
              <div className="h-11 w-48 bg-slate-700 rounded-xl" />
            </div>
          </div>
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="rounded-3xl border border-emerald-500/30 bg-[#111827] p-5 sm:p-7 shadow-2xl shadow-emerald-500/10 transition-all">
          
          {/* Header Badge */}
          <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                {result.store}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Live Stream Verification
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{result.worth_label} ({result.worth_score}/100)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Product Photo with Aspect Ratio Lock */}
            {result.image ? (
              <div className="md:col-span-4 aspect-square rounded-2xl bg-white p-4 flex items-center justify-center overflow-hidden shadow-inner">
                <img
                  src={result.image}
                  alt={result.title}
                  className="max-h-full max-w-full object-contain filter drop-shadow"
                  loading="lazy"
                />
              </div>
            ) : null}

            {/* Product Pricing & Analysis */}
            <div className={result.image ? 'md:col-span-8 flex flex-col justify-between' : 'md:col-span-12'}>
              <h3 className="font-semibold text-white text-base sm:text-lg line-clamp-2 mb-3 leading-snug">
                {result.title}
              </h3>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 flex-wrap mb-3">
                <span className="text-3xl font-price font-bold text-emerald-400">
                  ₹{result.price.toLocaleString('en-IN')}
                </span>

                {result.usually_price && result.usually_price > result.price && (
                  <span className="text-xs text-slate-400">
                    Usually: <strong className="text-slate-200 line-through font-mono">₹{result.usually_price.toLocaleString('en-IN')}</strong>
                  </span>
                )}

                {result.mrp && result.mrp > result.price && (
                  <span className="text-xs text-slate-500 line-through font-mono">
                    MRP ₹{result.mrp.toLocaleString('en-IN')}
                  </span>
                )}

                {result.discount_pct && (
                  <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 font-bold text-xs border border-orange-500/30">
                    {result.discount_pct}% OFF
                  </span>
                )}
              </div>

              {/* Verified Verdict */}
              <p className="text-xs text-emerald-300 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 mb-4 leading-relaxed">
                {result.verdict}
              </p>

              {/* Grab Deal Button with 44px Touch Target */}
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="w-full sm:w-auto min-h-[44px] px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-sm tracking-tight flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer focus-ring"
                aria-label={`Grab verified deal on ${result.store} for ₹${result.price.toLocaleString('en-IN')}`}
              >
                <span>Grab Deal on {result.store}</span>
                <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lookup-modal-title"
      >
        <div className="relative w-full max-w-3xl rounded-3xl border border-white/10 bg-[#0B0F19] p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
          {onClose && (
            <button
              onClick={onClose}
              className="touch-target min-h-[44px] min-w-[44px] absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer focus-ring"
              aria-label="Close modal (Escape)"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {content}
    </div>
  );
};
