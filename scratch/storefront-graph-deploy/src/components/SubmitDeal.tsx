import { PUBLIC_API_BASE, PUBLIC_EDGE_BASE, publicStoreUrl, lookupTargetUrl } from '../utils/publicLinks';
import React, { useState, useRef } from 'react';

interface DealSubmissionResult {
  status: string;
  message?: string;
  deal_id?: string;
  [key: string]: unknown;
}

interface SubmitDealProps {
  onBackToHome?: () => void;
}

const API_BASE = PUBLIC_API_BASE;

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
  const [error, setError] = useState<string | null>(null);
  const [dealResult, setDealResult] = useState<DealSubmissionResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() && !tip.trim()) {
      setError('Please provide either a product link or deal description.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const targetUrl = url.trim() || tip.trim();
      let res: Response;
      
      if (file) {
        const formData = new FormData();
        formData.append('url', targetUrl);
        formData.append('store', store);
        if (price) formData.append('price', price);
        if (mrp) formData.append('mrp', mrp);
        if (tip) formData.append('tip', tip);
        if (email) formData.append('email', email);
        formData.append('screenshot', file);

        res = await fetch(`${API_BASE}/api/v1/deals/submit`, {
          method: 'POST',
          body: formData,
        });
      } else {
        res = await fetch(`${API_BASE}/api/v1/deals/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: targetUrl,
            store,
            price: price ? parseFloat(price) : null,
            mrp: mrp ? parseFloat(mrp) : null,
            tip,
            email: email.trim(),
          }),
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to submit deal. Please verify the URL.');
      }

      const data = await res.json() as DealSubmissionResult;
      setDealResult(data);
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please check your connection or URL.');
    } finally {
      setLoading(false);
    }
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
    setError(null);
    setDealResult(null);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 flex flex-col gap-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <button
          onClick={onBackToHome}
          className="hover:text-blue-600 transition-colors cursor-pointer bg-transparent border-0 p-0 font-medium"
        >
          Home
        </button>
        <span>/</span>
        <span className="text-slate-800 dark:text-[#F8FAFC] font-semibold">Submit a Deal</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-mono text-[11px] font-bold w-fit">
          <span>⚡ COMMUNITY SUBMISSIONS</span>
        </div>
        <h1 className="text-3xl font-heading font-black tracking-tight text-slate-900 dark:text-[#F1F5F9]">
          Submit a Deal or Loot Drop
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          Found a price drop or promo code? Submit the source link for review. Submission does not guarantee verification or publication.
        </p>
      </div>

      {submitted ? (
        <div className="p-8 rounded-2xl bg-white dark:bg-[#0D1527] border border-emerald-200 flex flex-col gap-3 items-center text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 text-xl font-bold shadow-xs">
            ✓
          </div>
          <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-[#F1F5F9]">
            Deal Submitted for Review!
          </h3>
          <p className="text-xs text-slate-500 max-w-md leading-relaxed">
            {dealResult?.message || 'Your submission was accepted for review. Publication and price verification are not confirmed yet.'}
          </p>
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold cursor-pointer transition-colors shadow-sm active:scale-95"
            >
              Submit Another Deal
            </button>
            <button
              onClick={onBackToHome}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-[#111C33] hover:bg-slate-200 dark:bg-[#172440] text-slate-900 dark:text-[#F1F5F9] text-xs font-semibold border border-slate-300 dark:border-white/20 cursor-pointer transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-white/10 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
          {error && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-500 font-bold mb-1.5">
              Product URL *
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              aria-label="Product link" placeholder="https://www.amazon.in/dp/..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#F1F5F9] placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:bg-white dark:bg-[#0D1527] focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-500 font-bold mb-1.5">
                Store
              </label>
              <select aria-label="Store"
                value={store}
                onChange={(e) => setStore(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#F1F5F9] text-xs sm:text-sm focus:outline-none focus:bg-white dark:bg-[#0D1527] focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-colors"
              >
                <option value="Amazon">Amazon</option>
                <option value="Flipkart">Flipkart</option>
                <option value="Myntra">Myntra</option>
                <option value="AJIO">AJIO</option>
                <option value="Swiggy">Swiggy Instamart</option>
                <option value="Zepto">Zepto</option>
                <option value="Other">Other Store</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-500 font-bold mb-1.5">
                Deal Price (₹)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                aria-label="Listed deal price" placeholder="899"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#F1F5F9] placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:bg-white dark:bg-[#0D1527] focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-500 font-bold mb-1.5">
                MRP / Regular (₹)
              </label>
              <input
                type="number"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                aria-label="Listed MRP" placeholder="2499"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#F1F5F9] placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:bg-white dark:bg-[#0D1527] focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-500 font-bold mb-1.5">
              Coupon Code / Offer Notes
            </label>
            <textarea
              rows={3}
              value={tip}
              onChange={(e) => setTip(e.target.value)}
              aria-label="Deal details and conditions" placeholder="e.g. Apply 10% coupon checkbox + ₹200 ICICI card discount"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#F1F5F9] placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:bg-white dark:bg-[#0D1527] focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-500 font-bold mb-1.5">
              Your Email (Optional, for reward credit)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email address" placeholder="hunter@gmail.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#F1F5F9] placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:bg-white dark:bg-[#0D1527] focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-11 rounded-xl bg-slate-900 hover:bg-black text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-sm hover:shadow-md active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
          >
            {loading ? 'Validating Link & Metrics...' : 'Submit Deal to Verification Desk →'}
          </button>
        </form>
      )}
    </div>
  );
};
