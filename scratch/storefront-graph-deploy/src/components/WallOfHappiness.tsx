import { PUBLIC_API_BASE, PUBLIC_EDGE_BASE, publicStoreUrl, lookupTargetUrl } from '../utils/publicLinks';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';
import { useModalSurface } from '../utils/useModalSurface';
import type { CommunityBrag, WallStats } from '../types';
import { IconShieldCheck, IconChevronRight } from './Icons';

interface WallOfHappinessProps {
  onBackToHome?: () => void;
  onNavigateTab?: (tab: any) => void;
}

const EDGE_API = PUBLIC_EDGE_BASE;
const API_BASE = PUBLIC_API_BASE;

export const WallOfHappiness: React.FC<WallOfHappinessProps> = ({ onBackToHome }) => {
  const [stats, setStats] = useState<WallStats | null>(null);
  const [brags, setBrags] = useState<CommunityBrag[]>([]);
  const [filterStore, setFilterStore] = useState<string>('all');

  // Savings Simulator State
  const [monthlySpend, setMonthlySpend] = useState<number>(8000);
  const [assumedDiscount, setAssumedDiscount] = useState(30);

  // Submit Modal State
  const [isSubmitOpen, setIsSubmitOpen] = useState<boolean>(false);
  const submitSurface = useModalSurface(isSubmitOpen, () => setIsSubmitOpen(false));
  const [submitForm, setSubmitForm] = useState({
    name: '',
    city: '',
    product_name: '',
    store: 'Amazon',
    sale_price: '',
    savings_amount: '',
    comment: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState('');

  // Fetch live stats from API
  const fetchWallData = useCallback(async () => {
    try {
      let res: Response | null = null;
      try {
        res = await fetch(`${API_BASE}/api/v1/deals/wall-of-happiness`);
      } catch {
        res = null;
      }
      if (!res || !res.ok) {
        try {
          res = await fetch(`${EDGE_API}/deals/wall-of-happiness`);
        } catch {
          res = null;
        }
      }
      if (res && res.ok) {
        const data = await res.json();
        // The legacy endpoint includes seeded testimonials and static platform
        // claims. Display only actual submissions, explicitly as self-reports.
        const reports: CommunityBrag[] = Array.isArray(data.brags) ? data.brags.filter((report: CommunityBrag) => report.id && !/^brag-\d+$/.test(report.id)) : [];
        const reportedTotal = reports.reduce((sum, report) => sum + (Number.isFinite(report.saved_amount) && report.saved_amount > 0 ? report.saved_amount : 0), 0);
        setBrags(reports);
        setStats({ total_saved_inr: reportedTotal, formatted_savings: `₹${reportedTotal.toLocaleString('en-IN')}`, active_deals_count: reports.length, verified_shoppers_count: new Set(reports.map(report => `${report.name}|${report.city}`)).size, satisfaction_rate: 'Not measured', updated_at: Date.now() / 1000 });
      }
    } catch {
      // Fallback handles gracefully
    }
  }, []);

  useEffect(() => {
    fetchWallData();
  }, [fetchWallData]);

  // A shopper-controlled scenario, not a measured platform average.
  const monthlySavings = Math.round(monthlySpend * assumedDiscount / 100);
  const annualSavings = monthlySavings * 12;

  const getSavingsPerk = (annual: number) => {
    if (annual >= 100000) return 'Put it towards a travel fund';
    if (annual >= 60000) return 'Put it towards a computer or phone upgrade';
    if (annual >= 30000) return 'Build a fund for your next big purchase';
    if (annual >= 15000) return 'Set aside a budget for accessories';
    return 'Build your shopping budget over time';
  };

  const filteredBrags = filterStore === 'all'
    ? brags
    : brags.filter((b) => b.store.toLowerCase().includes(filterStore.toLowerCase()));

  const handleBragSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitForm.name || !submitForm.product_name) return;

    setIsSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch(`${API_BASE}/api/v1/deals/brag-submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: submitForm.name,
          city: submitForm.city || 'India',
          product_name: submitForm.product_name,
          store: submitForm.store,
          sale_price: parseFloat(submitForm.sale_price) || 0,
          savings_amount: parseFloat(submitForm.savings_amount) || 0,
          comment: submitForm.comment,
        }),
      });

      if (!res.ok) throw new Error('Submission unavailable');
      if (res.ok) {
        const newBrag: CommunityBrag = {
          id: `user-${Date.now()}`,
          name: submitForm.name,
          city: submitForm.city || 'India',
          product: submitForm.product_name,
          store: submitForm.store,
          sale_price: parseFloat(submitForm.sale_price) || 0,
          saved_amount: parseFloat(submitForm.savings_amount) || 0,
          comment: submitForm.comment || 'Shopper-submitted report',
          relative_time: 'Just now',
          avatar_bg: 'from-amber-500 to-rose-600',
        };
        setBrags((prev) => [newBrag, ...prev]);
        setSubmitSuccess(true);
        setTimeout(() => {
          setSubmitSuccess(false);
          setIsSubmitOpen(false);
          setSubmitForm({
            name: '',
            city: '',
            product_name: '',
            store: 'Amazon',
            sale_price: '',
            savings_amount: '',
            comment: '',
          });
        }, 1500);
      }
    } catch {
      setSubmitError('Your report could not be sent. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1180px] mx-auto px-4 pt-8 pb-28 md:pb-12 space-y-10">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <button
          onClick={onBackToHome}
          className="hover:text-blue-600 transition-colors cursor-pointer bg-transparent border-0 p-0 font-medium"
        >
          Home
        </button>
        <span>/</span>
        <span className="text-slate-800 dark:text-[#F8FAFC] font-semibold">Wall of Happiness</span>
      </div>

      {/* Header Banner */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono font-bold">
          <span>Community stories</span>
          <span>•</span>
          <span>Shopper submitted</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-[#F1F5F9] tracking-tight">
          Wall of Happiness
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base max-w-2xl leading-relaxed">
          Shopping experiences shared by the community. Prices and savings are reported by shoppers; purchase receipts and outcomes have not been independently verified.
        </p>
      </div>

      {/* ── 1. Live Platform Savings Meter ── */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-white/10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-600">
                Reported savings in this community feed
              </div>
              <div className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-[#F1F5F9] font-mono tracking-tight mt-1">
                {stats?.formatted_savings ?? '₹5,20,000+'}

              </div>
            </div>

            <button
              onClick={() => setIsSubmitOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-sm transition-all shadow-sm hover:shadow-md cursor-pointer flex-shrink-0 active:scale-95"
            >
              <span>🎉 Brag Your Deal Loot</span>
              <IconChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 4 Stat Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10">
              <div className="text-[11px] font-mono text-slate-500 uppercase font-semibold">Loaded reports</div>
              <div className="text-xl font-bold text-slate-900 dark:text-[#F1F5F9] font-mono mt-1">
                {stats?.active_deals_count?.toLocaleString('en-IN') ?? '—'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10">
              <div className="text-[11px] font-mono text-slate-500 uppercase font-semibold">Reporting names</div>
              <div className="text-xl font-bold text-blue-600 font-mono mt-1">
                {stats?.verified_shoppers_count?.toLocaleString('en-IN') ?? '—'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10">
              <div className="text-[11px] font-mono text-slate-500 uppercase font-semibold">Measured discount</div>
              <div className="text-xl font-bold text-emerald-600 font-mono mt-1">
                —
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10">
              <div className="text-[11px] font-mono text-slate-500 uppercase font-semibold">Purchase verification</div>
              <div className="text-xl font-bold text-slate-900 dark:text-[#F1F5F9] font-mono mt-1">
                {stats?.satisfaction_rate ?? '—'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Interactive Personal Savings Simulator ── */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-white/10 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
              <span>🧮 Personal Deal Savings Simulator</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Explore an estimate using your own assumed discount. This is a planning scenario, not promised savings or a measured average.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono text-slate-500">Your Monthly Online Spend</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-[#F1F5F9] font-mono">
              ₹{monthlySpend.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <label className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">Assumed saving <select aria-label="Assumed saving percentage" value={assumedDiscount} onChange={event => setAssumedDiscount(Number(event.target.value))} className="min-h-11 rounded-xl border border-slate-200 px-3">{[0, 5, 10, 15, 20, 25, 30, 40, 50].map(value => <option key={value} value={value}>{value}%</option>)}</select></label>
        {/* Range Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min="2000"
            max="50000"
            step="1000"
            value={monthlySpend}
            onChange={(e) => setMonthlySpend(Number(e.target.value))}
            className="w-full h-2.5 bg-slate-200 dark:bg-[#172440] rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>₹2,000 / mo</span>
            <span>₹25,000 / mo</span>
            <span>₹50,000 / mo</span>
          </div>
        </div>

        {/* Dynamic Calculation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10">
            <div className="text-xs font-mono text-slate-500 uppercase font-semibold">Monthly Money Saved</div>
            <div className="text-2xl font-extrabold text-emerald-600 font-mono mt-1">
              ₹{monthlySavings.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Estimated using your assumption</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10">
            <div className="text-xs font-mono text-slate-500 uppercase font-semibold">Annual Loot Savings</div>
            <div className="text-2xl font-extrabold text-blue-600 font-mono mt-1">
              ₹{annualSavings.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Estimated annual scenario</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10 flex flex-col justify-center">
            <div className="text-xs font-mono text-slate-500 uppercase font-semibold">A possible savings goal</div>
            <div className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC] mt-1">
              {getSavingsPerk(annualSavings)}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Community Brags Feed ── */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
              <span>✨ Recent Community Loot Brags</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Self-reported experiences. Confirm details with the shopper.
            </p>
          </div>

          {/* Store Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-[#111C33] border border-slate-200 dark:border-white/10 overflow-x-auto">
            {['all', 'Amazon', 'Flipkart', 'Myntra', 'Zepto'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStore(st)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filterStore === st
                    ? 'bg-white dark:bg-[#0D1527] text-slate-900 dark:text-[#F1F5F9] shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:text-[#F1F5F9]'
                }`}
              >
                {st === 'all' ? 'All Stores' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Brag Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBrags.length > 0 ? filteredBrags.map((brag) => (
            <motion.div
              key={brag.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-white/10 shadow-sm hover:shadow-md hover:border-slate-300 dark:border-white/20 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* User & Store Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-full bg-gradient-to-tr ${
                        brag.avatar_bg || 'from-emerald-500 to-teal-700'
                      } flex items-center justify-center text-white font-bold text-sm shadow`}
                    >
                      {brag.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-[#F1F5F9] leading-tight">
                        {brag.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {brag.city} • <span className="text-slate-400">{brag.relative_time}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#111C33] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10">
                    {brag.store}
                  </span>
                </div>

                {/* Deal Product Tag */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10 space-y-1">
                  <div className="text-xs font-semibold text-slate-900 dark:text-[#F1F5F9] line-clamp-1">
                    {brag.product}
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500">Paid: ₹{brag.sale_price.toLocaleString('en-IN')}</span>
                    <span className="text-emerald-600 font-bold">
                      Saved ₹{brag.saved_amount.toLocaleString('en-IN')}!
                    </span>
                  </div>
                </div>

                {/* Comment */}
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">
                  "{brag.comment}"
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <IconShieldCheck className="w-3 h-3 text-emerald-600" />
                  Shopper report
                </span>
                <span>IndiaDealHunts Drop</span>
              </div>
            </motion.div>
          )) : (
            <div className="md:col-span-2 lg:col-span-3 rounded-2xl border border-dashed border-slate-300 dark:border-white/20 bg-white dark:bg-[#0D1527] p-8 text-center">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Live community brags will appear here.</p>
              <p className="text-xs text-slate-500 mt-1">No shopper reports are available in this view yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── 4. Submit Your Deal Loot Modal ── */}
      {createPortal(<AnimatePresence>
        {isSubmitOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => setIsSubmitOpen(false)} />

            <motion.div
              ref={submitSurface}
              role="dialog"
              aria-modal="true"
              aria-label="Share your shopper report"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg max-h-[88dvh] overflow-y-auto overscroll-contain bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-white/10 rounded-2xl shadow-2xl p-6 space-y-5 z-10"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                <h3 className="text-lg font-bold text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
                  <span>🎉 Share Your Deal Loot</span>
                </h3>
                <button
                  type="button"
                  aria-label="Close shopper report"
                  onClick={() => setIsSubmitOpen(false)}
                  className="min-h-11 min-w-11 rounded-lg text-slate-400 hover:text-slate-800 dark:text-[#F8FAFC] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {submitSuccess ? (
                <div className="py-8 text-center space-y-2">
                  <div className="text-4xl">🎊</div>
                  <h4 className="text-base font-bold text-emerald-600">Report accepted</h4>
                  <p className="text-xs text-slate-500">
                    Your shopper report was accepted. Reported savings are not independently verified.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBragSubmit} className="space-y-4">
                  {submitError && <p role="alert" className="text-sm text-amber-600 dark:text-amber-400 font-medium">{submitError}</p>}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-mono text-slate-500 font-semibold">Your Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul M."
                        value={submitForm.name}
                        onChange={(e) => setSubmitForm({ ...submitForm, name: e.target.value })}
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#F1F5F9] text-xs focus:bg-white dark:bg-[#0D1527] focus:border-blue-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-slate-500 font-semibold">City / State</label>
                      <input
                        type="text"
                        placeholder="e.g. Pune"
                        value={submitForm.city}
                        onChange={(e) => setSubmitForm({ ...submitForm, city: e.target.value })}
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#F1F5F9] text-xs focus:bg-white dark:bg-[#0D1527] focus:border-blue-600 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-500 font-semibold">Product Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apple AirPods Pro 2 or Puma Shoes"
                      value={submitForm.product_name}
                      onChange={(e) => setSubmitForm({ ...submitForm, product_name: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#F1F5F9] text-xs focus:bg-white dark:bg-[#0D1527] focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-mono text-slate-500 font-semibold">Store</label>
                      <select
                        value={submitForm.store}
                        onChange={(e) => setSubmitForm({ ...submitForm, store: e.target.value })}
                        className="w-full mt-1 px-2 py-2 rounded-lg bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#F1F5F9] text-xs focus:bg-white dark:bg-[#0D1527] focus:border-blue-600 outline-none cursor-pointer"
                      >
                        <option value="Amazon">Amazon</option>
                        <option value="Flipkart">Flipkart</option>
                        <option value="Zepto">Zepto</option>
                        <option value="Myntra">Myntra</option>
                        <option value="AJIO">AJIO</option>
                        <option value="Croma">Croma</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-mono text-slate-500 font-semibold">Price Paid (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 1499"
                        value={submitForm.sale_price}
                        onChange={(e) => setSubmitForm({ ...submitForm, sale_price: e.target.value })}
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#F1F5F9] text-xs focus:bg-white dark:bg-[#0D1527] focus:border-blue-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-slate-500 font-semibold">Saved (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 3500"
                        value={submitForm.savings_amount}
                        onChange={(e) => setSubmitForm({ ...submitForm, savings_amount: e.target.value })}
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#F1F5F9] text-xs focus:bg-white dark:bg-[#0D1527] focus:border-blue-600 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-500 font-semibold">Your Deal Experience</label>
                    <textarea
                      rows={3}
                      placeholder="Tell fellow deal hunters how you claimed it, coupon tips, or delivery review..."
                      value={submitForm.comment}
                      onChange={(e) => setSubmitForm({ ...submitForm, comment: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#F1F5F9] text-xs focus:bg-white dark:bg-[#0D1527] focus:border-blue-600 outline-none resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsSubmitOpen(false)}
                      className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-[#111C33] hover:bg-slate-200 dark:bg-[#172440] text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? 'Posting...' : 'Post to Wall'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>, document.body)}

    </div>
  );
};
