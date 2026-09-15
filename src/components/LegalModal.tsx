import React, { useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2, AlertCircle, FileText, Lock, Award, ExternalLink } from 'lucide-react';

export type LegalDocType = 'disclosure' | 'verify' | 'terms' | 'privacy' | null;

interface LegalModalProps {
  type: LegalDocType;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (type) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [type, onClose]);

  if (!type) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] bg-[#111827] border border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#1E293B]">
          <div className="flex items-center gap-2.5">
            {type === 'disclosure' && (
              <>
                <Award className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />
                <h2 id="legal-modal-title" className="text-lg font-bold font-brand text-white">Affiliate Disclosure</h2>
              </>
            )}
            {type === 'verify' && (
              <>
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />
                <h2 id="legal-modal-title" className="text-lg font-bold font-brand text-white">How We Verify Deals</h2>
              </>
            )}
            {type === 'terms' && (
              <>
                <FileText className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />
                <h2 id="legal-modal-title" className="text-lg font-bold font-brand text-white">Terms of Service</h2>
              </>
            )}
            {type === 'privacy' && (
              <>
                <Lock className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />
                <h2 id="legal-modal-title" className="text-lg font-bold font-brand text-white">Privacy Policy</h2>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="touch-target min-h-[44px] min-w-[44px] p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white transition focus-ring"
            aria-label="Close legal modal (Escape)"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-white/80 leading-relaxed scrollbar-thin">
          {/* 1. AFFILIATE DISCLOSURE */}
          {type === 'disclosure' && (
            <>
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
                IndiaDealHunts is dedicated to 100% transparency. We believe our community deserves complete clarity regarding how our service is sustained.
              </div>

              <div>
                <h4 className="font-bold text-white text-base mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Amazon Associates Program
                </h4>
                <p className="text-xs text-white/70">
                  IndiaDealHunts participates in the Amazon Services LLC Associates Program and the Amazon India Associates Program. As an Amazon Associate, we earn from qualifying purchases. When you click on an Amazon link from our service and make a purchase, we may earn a small referral commission at <strong>zero additional cost to you</strong>. The product price remains identical.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-base mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Flipkart & EarnKaro Affiliate Programs
                </h4>
                <p className="text-xs text-white/70">
                  We participate in the Flipkart Affiliate Program and partner affiliate networks (including EarnKaro). When you click product links for Flipkart, Myntra, AJIO, Swiggy, Croma, or other partner stores, we may receive a commission on qualifying completed orders.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-base mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Editorial Independence & Authenticity
                </h4>
                {/* Hidden purposely: 'fake discount' wording */}
                <p className="text-xs text-white/70">
                  Affiliate partnerships never dictate our editorial verdict. We will <strong>never</strong> promote an inflated MRP, an artificial discount, or a low-grade product simply to earn a commission. Our algorithms evaluate genuine price drops against historical regular selling prices.
                </p>
              </div>
            </>
          )}

          {/* 2. HOW WE VERIFY DEALS */}
          {type === 'verify' && (
            <>
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
                Unlike scrapers that dump hundreds of unverified links, every drop published on IndiaDealHunts passes through our 4-stage verification engine.
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm">Continuous Multi-Stream Ingestion</h5>
                    <p className="text-xs text-white/60 mt-0.5">
                      We monitor 27+ top deal feeds, telegram channels, and online communities simultaneously. Sibling posts of identical items are clustered to prevent spam.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm">90-Day Usual Price Benchmark ("Usually: ₹X")</h5>
                    {/* Hidden purposely: 'fake 80% discounts' wording */}
                    <p className="text-xs text-white/60 mt-0.5">
                      Sellers frequently inflate MRP to show artificial 80% discounts. We cross-reference the product against its actual regular selling price over the last 90 days. If a discount isn't genuine, it gets dropped.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm">Anti-Dead Deal & Live Stock Checking</h5>
                    <p className="text-xs text-white/60 mt-0.5">
                      Shortlinks are resolved to canonical store URLs. Our pipeline checks that the product is in stock, not marked "Currently unavailable", and that the price matches what was claimed.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm">Tricks vs Product Separation</h5>
                    <p className="text-xs text-white/60 mt-0.5">
                      App-specific promo loots (like Swiggy Instamart searches or grocery cashbacks) are separated from product drops and documented with step-by-step instructions.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 3. TERMS OF SERVICE */}
          {type === 'terms' && (
            <>
              <div>
                <h4 className="font-bold text-white text-base mb-1.5">Welcome to IndiaDealHunts</h4>
                <p className="text-xs text-white/70">
                  By accessing IndiaDealHunts (web or official WhatsApp/Telegram channels), you agree to these terms. Our mission is to discover and share verified price drops and promotional offers across Indian e-commerce platforms.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-base mb-1.5">Price & Stock Volatility</h4>
                <p className="text-xs text-white/70">
                  Online retail prices, coupon validity, and product stock levels fluctuate rapidly. While we verify deals prior to publishing, merchants may update prices or terminate flash sales at their sole discretion. We recommend confirming final checkout pricing on the merchant website before completing payment.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-base mb-1.5">Merchant Responsibility</h4>
                <p className="text-xs text-white/70">
                  IndiaDealHunts is a curation and deal discovery platform. All orders, deliveries, warranties, and returns are fulfilled directly by the respective merchants (Amazon, Flipkart, Myntra, Swiggy, etc.).
                </p>
              </div>
            </>
          )}

          {/* 4. PRIVACY POLICY */}
          {type === 'privacy' && (
            <>
              <div>
                <h4 className="font-bold text-white text-base mb-1.5">Zero Invasive Tracking</h4>
                <p className="text-xs text-white/70">
                  IndiaDealHunts does not require user registration or personal identification to browse deals. We do not sell your personal information or run invasive third-party ad trackers.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-base mb-1.5">Affiliate Cookies</h4>
                <p className="text-xs text-white/70">
                  When you click a merchant link, standard affiliate cookies may be set by the merchant platform (e.g. Amazon.in, Flipkart.com) to credit referral traffic. These cookies are governed by the respective merchant's privacy policy.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-base mb-1.5">Contact Us</h4>
                <p className="text-xs text-white/70">
                  For feedback, deal tip-offs, or inquiries, reach out to our team at <a href="mailto:hello@rudranil.me" className="text-emerald-400 underline">hello@rudranil.me</a>.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#1E293B] flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">IndiaDealHunts • Follow, Share, Support</span>
          <button
            onClick={onClose}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition active:scale-95 focus-ring"
            aria-label="Close modal dialog"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
