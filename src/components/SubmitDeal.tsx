import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Sparkles, Upload, Link, Tag, HelpCircle } from 'lucide-react';

interface SubmitDealProps {
  onBackToHome?: () => void;
}

export const SubmitDeal: React.FC<SubmitDealProps> = ({ onBackToHome }) => {
  const [email, setEmail] = useState('');
  const [url, setUrl] = useState('');
  const [store, setStore] = useState('Amazon');
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [tip, setTip] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() && !tip.trim()) return;

    setLoading(true);
    // Simulate submission to backend
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  const handleReset = () => {
    setEmail('');
    setUrl('');
    setStore('Amazon');
    setPrice('');
    setMrp('');
    setTip('');
    setFile(null);
    setSubmitted(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      {/* Breadcrumb / Nav */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <button 
          onClick={onBackToHome}
          className="hover:text-emerald-400 transition-colors"
        >
          Home
        </button>
        <span>/</span>
        <span className="text-emerald-400 font-medium">Submit a Deal</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Guidelines & Community info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Community Deal Submission
          </div>

          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-3">
              Share a Loot Deal
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Spotted a crazy price glitch, limited coupon, or flash drop that we missed? Share it with thousands of savvy shoppers across India!
            </p>
          </div>

          {/* Submission Guidelines Card */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Tag className="w-4 h-4 text-amber-400" />
              What makes a verified submission?
            </div>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span><strong className="text-white">Direct product links:</strong> Amazon, Flipkart, Myntra, Swiggy Instamart, Zepto, Ajio, or brand storefronts.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span><strong className="text-white">Explain required steps:</strong> Mention if a bank offer (e.g. HDFC 10% instant off), collectible coupon, or combo trick is required.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span><strong className="text-white">Attach screenshot (optional):</strong> For cart glitched prices or lightning drops, a screenshot helps our team fast-track verification.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span><strong className="text-white">Zero affiliate spam:</strong> Personal referral or shortlinks are stripped automatically by our link sanitizer.</span>
              </li>
            </ul>
          </div>

          {/* Verification Team Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
              <div className="text-lg font-black text-emerald-400">⚡ &lt; 5m</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Verification Time</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
              <div className="text-lg font-black text-white">24/7</div>
              <div className="text-[11px] text-slate-400 mt-0.5">AI + Human Review</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
              <div className="text-lg font-black text-amber-400">100%</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Scam-Free Guaranteed</div>
            </div>
          </div>
        </div>

        {/* Right Column: Submission Form */}
        <div className="lg:col-span-7">
          <div className="p-6 md:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-4 ring-emerald-500/10">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-white">Deal Submitted Successfully!</h3>
                <p className="text-slate-300 text-sm max-w-md mx-auto">
                  Thank you for contributing! Our verification engine and curation team have received your tip and are validating it now. Once verified, it will appear live across IndiaDealHunts and our Telegram channel.
                </p>
                <div className="pt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={handleReset}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
                  >
                    Submit Another Deal
                  </button>
                  {onBackToHome && (
                    <button
                      onClick={onBackToHome}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-emerald-600/20"
                    >
                      Browse Live Deals
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 relative">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Deal Tip Form</span>
                  <span className="text-[11px] text-slate-400">* Required fields</span>
                </div>

                {/* Deal / Product Link */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Link className="w-3.5 h-3.5 text-emerald-400" />
                      Product / Offer URL *
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">Amazon, Flipkart, etc.</span>
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://www.amazon.in/dp/... or https://dl.flipkart.com/..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                </div>

                {/* Store Selection & Prices */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Store Platform
                    </label>
                    <select
                      value={store}
                      onChange={(e) => setStore(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    >
                      <option value="Amazon">Amazon</option>
                      <option value="Flipkart">Flipkart</option>
                      <option value="Myntra">Myntra</option>
                      <option value="AJIO">AJIO</option>
                      <option value="Swiggy Instamart">Swiggy Instamart</option>
                      <option value="Zepto">Zepto</option>
                      <option value="Blinkit">Blinkit</option>
                      <option value="Other">Other Store</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Deal Price (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 499"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Regular MRP (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 1999"
                      value={mrp}
                      onChange={(e) => setMrp(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Deal Details / Instructions */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center justify-between">
                    <span>How to get this deal / Coupon details *</span>
                    <span className="text-[11px] text-slate-400 font-normal">{tip.length}/4000</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    maxLength={4000}
                    placeholder="Describe how to claim this deal (e.g. Apply ₹200 coupon on page + pay with HDFC credit card for extra ₹100 off). Mention sizes, colors or expiration time if known."
                    value={tip}
                    onChange={(e) => setTip(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors resize-y"
                  />
                </div>

                {/* Screenshot Upload (Optional) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    Screenshot / Proof (Optional)
                  </label>
                  <div className="relative border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-950/50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
                    {file ? (
                      <span className="text-xs text-emerald-400 font-medium">{file.name}</span>
                    ) : (
                      <span className="text-xs text-slate-400">
                        Click or drag & drop deal screenshot here (PNG, JPG)
                      </span>
                    )}
                  </div>
                </div>

                {/* Submitter Contact */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center justify-between">
                    <span>Your Email or Telegram Username (Optional)</span>
                    <span className="text-[11px] text-slate-400 font-normal">For deal credits</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. @yourtelegram or email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send My Deal Tip
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-3 h-3 text-emerald-400" />
                  All submissions are checked against live price histories before publishing.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
