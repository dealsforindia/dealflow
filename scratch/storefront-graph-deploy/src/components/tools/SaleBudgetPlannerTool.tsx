import React, { useState, useMemo } from 'react';

interface WishlistItem {
  id: string;
  name: string;
  estimatedPrice: number;
  category: 'Tech' | 'Fashion' | 'Home' | 'Gifts';
  priority: 'must_have' | 'nice_to_have' | 'impulse';
}

const INITIAL_WISHLIST: WishlistItem[] = [
  { id: 'item_1', name: 'ANC Wireless Headphones', estimatedPrice: 8500, category: 'Tech', priority: 'must_have' },
  { id: 'item_2', name: 'Cotton Festive Kurta / Shirt', estimatedPrice: 1800, category: 'Fashion', priority: 'must_have' },
  { id: 'item_3', name: 'Air Fryer 4.5L', estimatedPrice: 4200, category: 'Home', priority: 'nice_to_have' },
  { id: 'item_4', name: 'Smartwatch with AMOLED', estimatedPrice: 2999, category: 'Tech', priority: 'impulse' },
];

export const SaleBudgetPlannerTool: React.FC = () => {
  const [totalBudget, setTotalBudget] = useState<number>(35000);
  const [monthlyTakeHome, setMonthlyTakeHome] = useState<number>(65000);
  const [wishlist, setWishlist] = useState<WishlistItem[]>(INITIAL_WISHLIST);

  // New item inputs
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState<number>(2000);
  const [newItemCat, setNewItemCat] = useState<'Tech' | 'Fashion' | 'Home' | 'Gifts'>('Tech');
  const [newItemPriority, setNewItemPriority] = useState<'must_have' | 'nice_to_have' | 'impulse'>('must_have');

  // Pre-sale readiness checklist
  const [checklist, setChecklist] = useState({
    creditCardLimit: true,
    priceTrackerReady: true,
    deliveryAddressSet: true,
    returnPolicyChecked: false,
    sleepRoutineGuarded: false,
  });

  const toggleChecklist = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || newItemPrice <= 0) return;

    const item: WishlistItem = {
      id: `w_${Date.now()}`,
      name: newItemName.trim(),
      estimatedPrice: newItemPrice,
      category: newItemCat,
      priority: newItemPriority,
    };

    setWishlist((prev) => [...prev, item]);
    setNewItemName('');
    setNewItemPrice(1500);
  };

  const handleRemoveItem = (id: string) => {
    setWishlist((prev) => prev.filter((i) => i.id !== id));
  };

  // Calculations
  const analysis = useMemo(() => {
    const totalPlanned = wishlist.reduce((sum, item) => sum + item.estimatedPrice, 0);
    const remaining = totalBudget - totalPlanned;
    const utilizationPct = totalBudget > 0 ? Math.round((totalPlanned / totalBudget) * 100) : 0;

    // Priority breakdown
    const mustHaveTotal = wishlist
      .filter((i) => i.priority === 'must_have')
      .reduce((sum, i) => sum + i.estimatedPrice, 0);

    const niceToHaveTotal = wishlist
      .filter((i) => i.priority === 'nice_to_have')
      .reduce((sum, i) => sum + i.estimatedPrice, 0);

    const impulseTotal = wishlist
      .filter((i) => i.priority === 'impulse')
      .reduce((sum, i) => sum + i.estimatedPrice, 0);

    // Impulse Risk Index (0-100%)
    const impulseRatio = totalPlanned > 0 ? (impulseTotal + niceToHaveTotal * 0.5) / totalPlanned : 0;
    const impulseRiskScore = Math.min(100, Math.round(impulseRatio * 100));

    // Salary Burn Metric: % of monthly take-home spent on this single sale event
    const salaryBurnPct = monthlyTakeHome > 0 ? Math.round((totalPlanned / monthlyTakeHome) * 100) : 0;

    // Recommended Day-3 Flash Buffer (10% of total budget)
    const recommendedBuffer = Math.round(totalBudget * 0.1);

    return {
      totalPlanned,
      remaining,
      utilizationPct,
      mustHaveTotal,
      niceToHaveTotal,
      impulseTotal,
      impulseRiskScore,
      salaryBurnPct,
      recommendedBuffer,
    };
  }, [totalBudget, monthlyTakeHome, wishlist]);

  return (
    <div className="w-full bg-white dark:bg-[#0D1527] rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-sm p-5 md:p-7 text-slate-800 dark:text-[#F8FAFC]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <h3 className="font-heading font-extrabold text-lg sm:text-xl text-slate-900 dark:text-[#F1F5F9] tracking-tight">
              Festival Sale Budget &amp; Regret-Proof Planner
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              ANTI-FOMO
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Plan your Amazon Great Indian Festival &amp; Flipkart Big Billion Days budget without impulse overspending.
          </p>
        </div>
      </div>

      {/* Main Grid: Controls vs Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5">
        {/* Left: Budget & Wishlist Builder (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Top Sliders: Budget & Income */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Festival Sale Budget</label>
                <span className="text-sm font-extrabold font-mono text-slate-900 dark:text-[#F1F5F9]">
                  ₹{totalBudget.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="5000"
                max="200000"
                step="2500"
                value={totalBudget}
                onChange={(e) => setTotalBudget(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-[#172440] rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Monthly Take-Home</label>
                <span className="text-sm font-extrabold font-mono text-slate-900 dark:text-[#F1F5F9]">
                  ₹{monthlyTakeHome.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="15000"
                max="300000"
                step="5000"
                value={monthlyTakeHome}
                onChange={(e) => setMonthlyTakeHome(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-[#172440] rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
          </div>

          {/* Add Item to Wishlist */}
          <form onSubmit={handleAddItem} className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-800 dark:text-[#F8FAFC] uppercase tracking-wide">
              + Add Planned Purchase to Wishlist
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <input
                type="text"
                placeholder="Product name (e.g. Robot Vacuum)"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="sm:col-span-5 h-9 px-3 rounded-xl border border-slate-200 dark:border-white/10 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="sm:col-span-3 relative">
                <span className="absolute left-2.5 top-2.5 text-xs text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  step="100"
                  value={newItemPrice || ''}
                  onChange={(e) => setNewItemPrice(Number(e.target.value))}
                  placeholder="Price"
                  className="w-full h-9 pl-6 pr-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-mono font-bold"
                />
              </div>
              <select
                value={newItemPriority}
                onChange={(e) => setNewItemPriority(e.target.value as any)}
                className="sm:col-span-4 h-9 px-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs bg-white dark:bg-[#0D1527] font-medium"
              >
                <option value="must_have">🟢 Must-Have</option>
                <option value="nice_to_have">🟡 Nice-to-Have</option>
                <option value="impulse">🔴 Impulse / Temptation</option>
              </select>
            </div>

            <div className="flex justify-between items-center pt-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Category:</span>
                {(['Tech', 'Fashion', 'Home', 'Gifts'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setNewItemCat(cat)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                      newItemCat === cat
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'bg-white dark:bg-[#0D1527] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors"
              >
                Add Item
              </button>
            </div>
          </form>

          {/* Wishlist Items Table */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
              Planned Items ({wishlist.length})
            </span>
            <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden divide-y divide-slate-100">
              {wishlist.map((item) => (
                <div key={item.id} className="p-3 bg-white dark:bg-[#0D1527] flex items-center justify-between text-xs hover:bg-slate-50 dark:bg-[#070A11] transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {item.priority === 'must_have' ? '🟢' : item.priority === 'nice_to_have' ? '🟡' : '🔴'}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-[#F1F5F9]">{item.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono ml-2">({item.category})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900 dark:text-[#F1F5F9]">
                      ₹{item.estimatedPrice.toLocaleString('en-IN')}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-slate-400 hover:text-rose-600 text-xs"
                      title="Remove item"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Financial Health & Regret Meter (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider block mb-1">
                Budget Allocation Meter
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black font-heading text-slate-900 dark:text-[#F1F5F9]">
                  ₹{analysis.totalPlanned.toLocaleString('en-IN')}
                </span>
                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full ${
                  analysis.remaining >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}>
                  {analysis.remaining >= 0 ? `₹${analysis.remaining.toLocaleString('en-IN')} Left` : `₹${Math.abs(analysis.remaining).toLocaleString('en-IN')} OVER BUDGET`}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-[#172440] overflow-hidden mt-3 flex">
                <div
                  style={{ width: `${Math.min(100, analysis.utilizationPct)}%` }}
                  className={`h-full transition-all ${
                    analysis.utilizationPct > 100
                      ? 'bg-rose-500'
                      : analysis.utilizationPct > 80
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />
              </div>

              {/* Breakdown */}
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 space-y-2 text-xs">
                <div className="flex justify-between items-center text-emerald-800 font-medium">
                  <span>🟢 Must-Haves</span>
                  <span className="font-mono font-bold">₹{analysis.mustHaveTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-amber-800 font-medium">
                  <span>🟡 Nice-to-Haves</span>
                  <span className="font-mono font-bold">₹{analysis.niceToHaveTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-rose-700 font-medium">
                  <span>🔴 Impulse Purchases</span>
                  <span className="font-mono font-bold">₹{analysis.impulseTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-white/10">
                  <span>Salary Impact</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-[#F1F5F9]">{analysis.salaryBurnPct}% of 1 month pay</span>
                </div>
              </div>
            </div>

            {/* Impulse Risk Score */}
            <div className="mt-5 p-3.5 rounded-xl bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-800 dark:text-[#F8FAFC]">Impulse Regret Risk</span>
                <span className={`text-xs font-mono font-extrabold ${
                  analysis.impulseRiskScore > 40 ? 'text-rose-600' : 'text-emerald-600'
                }`}>
                  {analysis.impulseRiskScore}% {analysis.impulseRiskScore > 40 ? 'HIGH' : 'LOW'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {analysis.impulseRiskScore > 40
                  ? `Over ${analysis.impulseRiskScore}% of your planned spend is non-essential temptation. Wait 48 hours before pulling the trigger to eliminate buyer's remorse.`
                  : 'Well disciplined! Your festival shopping list is focused on verified must-haves.'}
              </p>
            </div>
          </div>

          {/* Pre-Sale Checklist */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1527]">
            <span className="text-xs font-bold text-slate-800 dark:text-[#F8FAFC] uppercase tracking-wide block mb-3">
              ✅ Pre-Sale Preparedness Checklist
            </span>
            <div className="space-y-2 text-xs">
              {[
                { key: 'creditCardLimit' as const, label: 'Credit card online transaction limit unblocked' },
                { key: 'priceTrackerReady' as const, label: 'Price history checked to spot fake discounts' },
                { key: 'deliveryAddressSet' as const, label: 'Primary delivery address set for 1-click checkout' },
                { key: 'returnPolicyChecked' as const, label: 'Verified seller return policy (7-day replacement only)' },
                { key: 'sleepRoutineGuarded' as const, label: 'Midnight flash sale alarm set (no sleep sacrifice)' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2.5 cursor-pointer text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:text-[#F1F5F9]">
                  <input
                    type="checkbox"
                    checked={checklist[key]}
                    onChange={() => toggleChecklist(key)}
                    className="rounded border-slate-300 dark:border-white/20 text-blue-600"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
