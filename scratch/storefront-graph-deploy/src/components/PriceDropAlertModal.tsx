import { useModalSurface } from '../utils/useModalSurface';
import { PUBLIC_API_BASE, PUBLIC_EDGE_BASE, publicStoreUrl, lookupTargetUrl } from '../utils/publicLinks';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PublicDeal } from '../types';

interface PriceDropAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: PublicDeal | null;
  onSuccessToast?: (msg: string) => void;
}

const API_BASE = PUBLIC_API_BASE;

export const PriceDropAlertModal: React.FC<PriceDropAlertModalProps> = ({
  isOpen,
  onClose,
  deal,
  onSuccessToast,
}) => {
  const [targetPrice, setTargetPrice] = useState<string>(
    deal?.price ? Math.round(deal.price * 0.85).toString() : ''
  );
  const [contact, setContact] = useState<string>('');
  const [contactType, setContactType] = useState<'telegram' | 'email'>('telegram');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && deal) {
      setTargetPrice(deal.price ? Math.round(deal.price * 0.85).toString() : '');
      setSuccess(false);
      setErrorMsg(null);
    }
  }, [isOpen, deal?.id]);

  const modalSurface = useModalSurface(isOpen && !!deal, onClose);
  if (!isOpen || !deal) return null;

  const cleanPrice = Number(deal.price ?? deal.sale_price ?? deal.prices?.sale) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanContact = contact.trim().toLowerCase();
    if (!cleanContact) {
      setErrorMsg('Please enter your Telegram handle or Email');
      return;
    }
    if (cleanContact.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanContact)) {
      setErrorMsg('Please enter a valid email address (e.g. name@gmail.com)');
      return;
    }
    const tPrice = parseFloat(targetPrice);
    if (isNaN(tPrice) || tPrice <= 0) {
      setErrorMsg('Please enter a valid target price');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const payload = {
        product_url: deal.url,
        target_price: tPrice,
        contact: contact.trim(),
        product_title: deal.title,
        current_price: deal.price,
        store: deal.store || 'Store',
      };

      const res = await fetch(`${API_BASE}/api/v1/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const confirmation = await res.json();
      if (confirmation.success !== true || !confirmation.alert_id) {
        throw new Error('Alert registration was not confirmed');
      }

      setSuccess(true);
      if (onSuccessToast) {
        onSuccessToast(`🎯 Price alert set! We will notify you if ${deal.title.slice(0, 25)} drops to ₹${tPrice}.`);
      }
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1800);
    } catch (err: any) {
      setErrorMsg('Unable to schedule alert at this time. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div ref={modalSurface} role="dialog" aria-modal="true" aria-label="Set a price alert" className="shopper-tool-modal fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-white dark:bg-[#0D1527] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/80 dark:bg-[#070A11]/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-lg font-bold shadow-sm">
                🔔
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-[#F1F5F9]">
                  Price Drop Radar Alert
                </h2>
                <p className="text-xs text-slate-500">
                  Register a target; delivery depends on monitoring coverage
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog" className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#1E293B]/60 dark:bg-[#172440]/60 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="p-6">
            {success ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl">
                  ✓
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-[#F1F5F9]">Alert Armed Successfully!</h3>
                <p className="text-xs text-slate-500">
                  Your target of ₹{targetPrice} has been registered. Notifications depend on the monitoring service detecting a qualifying price.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Product Pill */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 p-1 flex items-center justify-center overflow-hidden shrink-0">
                    {deal.image ? (
                      <img src={deal.image} alt={deal.title} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-xl">📱</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-[#F1F5F9] truncate">{deal.title}</p>
                    <p className="text-xs text-slate-500">
                      Listed price: <span className="font-bold text-slate-800 dark:text-[#F8FAFC]">{cleanPrice > 0 ? `₹${cleanPrice.toLocaleString('en-IN')}` : 'Check store'}</span>
                    </p>
                  </div>
                </div>

                {/* Target Price Input */}
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 font-semibold mb-1">
                    Your Target Price (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">₹</span>
                    <input
                      type="number"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/20 focus:border-blue-500 focus:ring-3 focus:ring-blue-100 outline-none text-base font-bold text-slate-900 dark:text-[#F1F5F9]"
                      placeholder="e.g. 19999"
                      required
                    />
                  </div>
                  <div className="flex gap-2 mt-1.5">
                    {[0.9, 0.8, 0.7].map((pct) => {
                      const quickVal = Math.round(deal.price * pct);
                      return (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setTargetPrice(quickVal.toString())}
                          className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-[#111C33] hover:bg-slate-200 dark:bg-[#172440] text-slate-600 dark:text-slate-400 transition-colors"
                        >
                          {Math.round((1 - pct) * 100)}% Drop (₹{quickVal.toLocaleString('en-IN')})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notification Channel */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-mono uppercase text-slate-400 font-semibold">
                      Notify Me Via
                    </label>
                    <div className="flex gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setContactType('telegram')}
                        className={`font-semibold cursor-pointer ${contactType === 'telegram' ? 'text-blue-600 underline' : 'text-slate-400'}`}
                      >
                        Telegram
                      </button>
                      <span className="text-slate-300">·</span>
                      <button
                        type="button"
                        onClick={() => setContactType('email')}
                        className={`font-semibold cursor-pointer ${contactType === 'email' ? 'text-blue-600 underline' : 'text-slate-400'}`}
                      >
                        Email
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/20 focus:border-blue-500 focus:ring-3 focus:ring-blue-100 outline-none text-sm text-slate-900 dark:text-[#F1F5F9]"
                    placeholder={contactType === 'telegram' ? '@your_telegram_username' : 'you@example.com'}
                    required
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-medium">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-sm tracking-wide shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Arming Radar...</span>
                  ) : (
                    <>
                      <span>Arm Price Drop Alert</span>
                      <span>🔔</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};


