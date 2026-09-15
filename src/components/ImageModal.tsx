import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, Tag, ShoppingBag } from 'lucide-react';
import { PublicDeal } from '../types';

interface ImageModalProps {
  deal: PublicDeal | null;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ deal, onClose }) => {
  const [imageError, setImageError] = React.useState(false);

  useEffect(() => {
    setImageError(false);
  }, [deal?.id, deal?.image]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (deal) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [deal, onClose]);

  if (!deal) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-modal-title"
    >
      <div
        className="relative max-w-2xl w-full bg-[#111827] rounded-3xl border border-white/[0.12] p-6 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button with >= 44x44px Hit Target */}
        <button
          onClick={onClose}
          className="touch-target min-h-[44px] min-w-[44px] absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition focus-ring"
          aria-label="Close photo modal (Escape)"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Modal Content */}
        <div className="flex flex-col md:flex-row gap-6 items-center">
          
          {/* Image */}
          <div className="w-full md:w-1/2 aspect-square bg-white rounded-2xl p-4 flex items-center justify-center border border-white/[0.06] overflow-hidden shadow-inner">
            {deal.image && !imageError ? (
              <img
                src={deal.image.startsWith('http://74.225.250.0') ? deal.image.replace('http://74.225.250.0', 'https://api.rudranil.me') : deal.image}
                alt={deal.title}
                onError={() => setImageError(true)}
                className="max-h-full max-w-full object-contain filter drop-shadow-xl"
              />
            ) : (
              <div className="text-slate-400 flex flex-col items-center gap-2 p-4 text-center">
                <ShoppingBag className="w-12 h-12 text-emerald-400" aria-hidden="true" />
                <span className="text-xs font-semibold text-slate-700">Verified {deal.store} Drop</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="w-full md:w-1/2 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {deal.store}
                </span>
                {deal.discount_pct && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    {deal.discount_pct}% OFF
                  </span>
                )}
              </div>

              <h2 id="image-modal-title" className="text-base font-semibold text-white line-clamp-3 leading-snug">
                {deal.title}
              </h2>
            </div>

            {/* Pricing */}
            <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/[0.06]">
              <div className="flex items-baseline gap-2">
                {deal.price ? (
                  <span className="text-2xl font-price font-bold text-emerald-400">
                    ₹{deal.price.toLocaleString('en-IN')}
                  </span>
                ) : (
                  <span className="text-lg font-bold text-slate-300">Price on Store</span>
                )}

                {deal.mrp && deal.mrp > (deal.price || 0) && (
                  <span className="text-sm text-slate-500 line-through font-mono">
                    ₹{deal.mrp.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {deal.coupon && (
                <div className="mt-2 text-xs text-amber-300 flex items-center gap-1 font-mono">
                  <Tag className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Coupon: {deal.coupon}</span>
                </div>
              )}
            </div>

            {/* CTA Button with 44px Touch Target */}
            <a
              href={deal.url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="w-full min-h-[44px] py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-sm tracking-wide text-center shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] focus-ring"
              aria-label={`Claim deal on ${deal.store}`}
            >
              <span>Buy on {deal.store}</span>
              <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
            </a>

          </div>

        </div>
      </div>
    </div>,
    document.body
  );
};
