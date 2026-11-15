import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';

interface QuickCommercePlatform {
  id: string;
  name: string;
  brandColor: string;
  freeDeliveryThreshold: number;
  standardDeliveryFee: number;
  handlingFee: number;
  smallCartFee: number;
  smallCartThreshold: number;
  nightSurgeTime: string;
  nightSurgeFee: number;
  passName: string;
  passPrice: number;
  passThreshold: number;
  icon: string;
}

const PLATFORMS: QuickCommercePlatform[] = [
  {
    id: 'zepto',
    name: 'Zepto',
    brandColor: '#EC4899',
    freeDeliveryThreshold: 149,
    standardDeliveryFee: 35,
    handlingFee: 5,
    smallCartFee: 20,
    smallCartThreshold: 99,
    nightSurgeTime: '11:00 PM - 5:00 AM',
    nightSurgeFee: 25,
    passName: 'Zepto Pass',
    passPrice: 19,
    passThreshold: 99,
    icon: '⚡',
  },
  {
    id: 'blinkit',
    name: 'Blinkit (Zomato)',
    brandColor: '#EAB308',
    freeDeliveryThreshold: 199,
    standardDeliveryFee: 30,
    handlingFee: 6,
    smallCartFee: 15,
    smallCartThreshold: 99,
    nightSurgeTime: '11:30 PM - 6:00 AM',
    nightSurgeFee: 30,
    passName: 'Zomato Gold (Dineout/Food)',
    passPrice: 99,
    passThreshold: 199,
    icon: '🟡',
  },
  {
    id: 'swiggy_instamart',
    name: 'Swiggy Instamart',
    brandColor: '#F97316',
    freeDeliveryThreshold: 149,
    standardDeliveryFee: 35,
    handlingFee: 6,
    smallCartFee: 20,
    smallCartThreshold: 99,
    nightSurgeTime: '12:00 AM - 5:30 AM',
    nightSurgeFee: 20,
    passName: 'Swiggy One',
    passPrice: 149,
    passThreshold: 99,
    icon: '🍊',
  },
];

interface CartFillerItem {
  id: string;
  name: string;
  price: number;
  category: string;
  icon: string;
}

const COMMON_FILLERS: CartFillerItem[] = [
  { id: 'coriander', name: 'Fresh Coriander (Kothmir) 100g', price: 12, category: 'Veggies', icon: '🌿' },
  { id: 'lemon', name: 'Nimbu / Fresh Lemon 2 Pcs', price: 15, category: 'Veggies', icon: '🍋' },
  { id: 'maggi', name: 'Maggi 2-Minute Noodles Single Pack', price: 14, category: 'Snacks', icon: '🍜' },
  { id: 'parle_g', name: 'Parle-G Gold Glucose Biscuits', price: 10, category: 'Biscuits', icon: '🍪' },
  { id: 'matchbox', name: 'Safety Matches 10-Pack', price: 10, category: 'Household', icon: '🔥' },
  { id: 'tata_salt', name: 'Tata Salt Lite / Vacuum Evaporated 500g', price: 28, category: 'Pantry', icon: '🧂' },
  { id: 'amul_butter', name: 'Amul Butter 100g Pack', price: 58, category: 'Dairy', icon: '🧈' },
  { id: 'lays', name: 'Lay\'s Magic Masala Chips 30g', price: 20, category: 'Snacks', icon: '🥔' },
];

export const QuickCommerceDeliveryFeeOptimizer: React.FC = () => {
  const [cartValue, setCartValue] = useState<number>(85);
  const [isNightSurge, setIsNightSurge] = useState<boolean>(false);
  const [isRaining, setIsRaining] = useState<boolean>(false);
  const [hasZeptoPass, setHasZeptoPass] = useState<boolean>(false);
  const [hasSwiggyOne, setHasSwiggyOne] = useState<boolean>(false);
  const [ordersPerMonth, setOrdersPerMonth] = useState<number>(12);

  // Rain Surge Fee in India is typically flat ₹20-₹30
  const rainSurgeFee = isRaining ? 25 : 0;

  // Platform Evaluation
  const platformComparisons = useMemo(() => {
    return PLATFORMS.map((platform) => {
      const isPassActive =
        (platform.id === 'zepto' && hasZeptoPass) ||
        (platform.id === 'swiggy_instamart' && hasSwiggyOne);

      const threshold = isPassActive ? platform.passThreshold : platform.freeDeliveryThreshold;
      const isFreeDelivery = cartValue >= threshold;
      const deliveryFee = isFreeDelivery ? 0 : platform.standardDeliveryFee;

      const hasSmallCartFee = cartValue > 0 && cartValue < platform.smallCartThreshold;
      const smallCartFee = hasSmallCartFee ? platform.smallCartFee : 0;

      const nightFee = isNightSurge ? platform.nightSurgeFee : 0;
      const handlingFee = platform.handlingFee;

      const totalSurcharges = deliveryFee + smallCartFee + nightFee + rainSurgeFee + handlingFee;
      const totalPayable = cartValue + totalSurcharges;

      // Filler math: How many rupees needed to reach free delivery threshold?
      const deficitToFreeDelivery = Math.max(0, threshold - cartValue);

      // Surcharge to Cart Ratio (The Burn Ratio)
      const burnRatioPercent = cartValue > 0 ? (totalSurcharges / cartValue) * 100 : 0;

      return {
        ...platform,
        isPassActive,
        threshold,
        isFreeDelivery,
        deliveryFee,
        hasSmallCartFee,
        smallCartFee,
        nightFee,
        rainSurgeFee,
        handlingFee,
        totalSurcharges,
        totalPayable,
        deficitToFreeDelivery,
        burnRatioPercent: Math.round(burnRatioPercent),
      };
    }).sort((a, b) => a.totalPayable - b.totalPayable);
  }, [cartValue, isNightSurge, isRaining, hasZeptoPass, hasSwiggyOne, rainSurgeFee]);

  const bestPlatform = platformComparisons[0];

  // Best Cart Filler Suggestions
  const suggestedFillers = useMemo(() => {
    if (bestPlatform.deficitToFreeDelivery <= 0) return [];
    const deficit = bestPlatform.deficitToFreeDelivery;

    // Pick fillers that satisfy or are closest to the deficit
    return COMMON_FILLERS.filter((item) => item.price >= deficit - 10 && item.price <= deficit + 30).slice(0, 3);
  }, [bestPlatform]);

  // Annual Surcharge Drain
  const annualSurchargePaid = bestPlatform.totalSurcharges * ordersPerMonth * 12;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0D1527] rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🛵</span>
            <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 dark:text-[#F1F5F9] m-0">
              Quick Commerce Surcharge &amp; Cart Filler Optimizer
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
              BLINKIT • ZEPTO • INSTAMART
            </span>
          </div>
          <p className="text-xs text-slate-500 m-0 leading-relaxed">
            Never pay ₹65 extra in delivery and small-cart fees on an ₹80 grocery order. Find the exact item to add so you get food for free!
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-[#070A11] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 cursor-pointer">
            <input
              type="checkbox"
              checked={isNightSurge}
              onChange={(e) => setIsNightSurge(e.target.checked)}
              className="rounded text-pink-600"
            />
            <span className="font-semibold">🌙 Late Night Surge</span>
          </label>
          <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-[#070A11] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 cursor-pointer">
            <input
              type="checkbox"
              checked={isRaining}
              onChange={(e) => setIsRaining(e.target.checked)}
              className="rounded text-blue-600"
            />
            <span className="font-semibold">🌧️ Rain Surge Active</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Cart Input & Pass Settings */}
        <div className="lg:col-span-5 space-y-5">
          {/* Cart Amount Input */}
          <div className="bg-white dark:bg-[#0D1527] rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
            <label className="block">
              <span className="text-xs font-mono uppercase font-bold text-slate-500">
                Your Current Grocery Cart Value
              </span>
              <div className="relative mt-2">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono text-base">
                  ₹
                </span>
                <input
                  type="number"
                  min="20"
                  step="10"
                  value={cartValue || ''}
                  onChange={(e) => setCartValue(Number(e.target.value))}
                  placeholder="e.g. 85"
                  className="w-full h-11 pl-9 pr-4 rounded-xl border border-slate-300 dark:border-white/20 text-base font-mono font-bold text-slate-900 dark:text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-600 transition-all"
                />
              </div>
            </label>

            {/* Quick Price Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[49, 85, 119, 149, 199, 299].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setCartValue(val)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
                    cartValue === val
                      ? 'bg-pink-50 text-pink-700 border-pink-300 font-bold'
                      : 'bg-slate-50 dark:bg-[#070A11] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:bg-[#111C33]'
                  }`}
                >
                  ₹{val}
                </button>
              ))}
            </div>
          </div>

          {/* Active Memberships */}
          <div className="bg-white dark:bg-[#0D1527] rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
            <span className="text-xs font-mono uppercase font-bold text-slate-500 block">
              Active Memberships &amp; VIP Passes
            </span>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:bg-[#070A11] transition-colors cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚡</span>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-[#F1F5F9] block">Zepto Pass</span>
                    <span className="text-[10px] text-slate-500 font-mono">Free delivery lowered to ₹99</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={hasZeptoPass}
                  onChange={(e) => setHasZeptoPass(e.target.checked)}
                  className="w-4 h-4 rounded text-pink-600"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:bg-[#070A11] transition-colors cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🍊</span>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-[#F1F5F9] block">Swiggy One</span>
                    <span className="text-[10px] text-slate-500 font-mono">Free delivery lowered to ₹99</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={hasSwiggyOne}
                  onChange={(e) => setHasSwiggyOne(e.target.checked)}
                  className="w-4 h-4 rounded text-orange-600"
                />
              </label>
            </div>
          </div>

          {/* Habit Burn Tracker */}
          <div className="bg-white dark:bg-[#0D1527] rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase font-bold text-slate-500">
                Monthly 10-Min Orders
              </span>
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-[#F1F5F9]">
                {ordersPerMonth} orders / mo
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="35"
              value={ordersPerMonth}
              onChange={(e) => setOrdersPerMonth(Number(e.target.value))}
              className="w-full accent-pink-600 cursor-pointer"
            />
            <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-500">Annual Surcharges Paid:</span>
              <span className="font-mono font-black text-rose-600">
                ₹{annualSurchargePaid.toLocaleString('en-IN')}/yr
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Platform Comparison & Cart Filler Hack */}
        <div className="lg:col-span-7 space-y-5">
          {/* Cart Filler Hack Hero */}
          {bestPlatform.deficitToFreeDelivery > 0 ? (
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 rounded-3xl p-5 text-white shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/20 dark:bg-[#0D1527]/20 uppercase tracking-wider">
                  💡 CART FILLER HACK AVAILABLE
                </span>
                <span className="text-xs font-mono font-bold">
                  Deficit: ₹{bestPlatform.deficitToFreeDelivery}
                </span>
              </div>

              <div>
                <h4 className="font-heading font-black text-lg text-white m-0">
                  Add ₹{bestPlatform.deficitToFreeDelivery} to Waive ₹{bestPlatform.deliveryFee + bestPlatform.smallCartFee} in Surcharges!
                </h4>
                <p className="text-xs text-white/90 leading-relaxed mt-1 m-0">
                  Your cart is at ₹{cartValue}. If you checkout now, you will pay{' '}
                  <strong>₹{bestPlatform.totalSurcharges} in fees</strong>. Adding a ₹{bestPlatform.deficitToFreeDelivery} essential gives you free food instead of burning money on platform fees!
                </p>
              </div>

              {/* Recommended Filler Items */}
              {suggestedFillers.length > 0 && (
                <div className="pt-2 border-t border-white/20 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase font-bold text-amber-100 block">
                    Recommended Low-Cost Cart Fillers:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {suggestedFillers.map((filler) => (
                      <div
                        key={filler.id}
                        className="bg-white/10 dark:bg-[#0D1527]/10 backdrop-blur-md rounded-xl p-2 border border-white/15 flex items-center gap-2"
                      >
                        <span className="text-base">{filler.icon}</span>
                        <div className="min-w-0">
                          <span className="text-[11px] font-bold text-white block truncate">
                            {filler.name}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-200">
                            +₹{filler.price}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-emerald-600 rounded-3xl p-5 text-white shadow-md flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-white/20 dark:bg-[#0D1527]/20 px-2 py-0.5 rounded-full">
                  ✓ FREE DELIVERY UNLOCKED
                </span>
                <h4 className="font-heading font-extrabold text-base text-white mt-1 m-0">
                  Your Cart Exceeds Free Shipping Minimums!
                </h4>
                <p className="text-xs text-emerald-100 m-0 mt-0.5">
                  Standard delivery fees are waived on {bestPlatform.name}.
                </p>
              </div>
              <span className="text-3xl">🎉</span>
            </div>
          )}

          {/* Three Platform Price Breakdown Cards */}
          <div className="space-y-3">
            {platformComparisons.map((platform, idx) => {
              const isCheapest = idx === 0;
              return (
                <div
                  key={platform.id}
                  className={`bg-white dark:bg-[#0D1527] rounded-2xl p-4 border transition-all shadow-sm ${
                    isCheapest ? 'border-pink-300 ring-2 ring-pink-500/10' : 'border-slate-200 dark:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{platform.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-slate-900 dark:text-[#F1F5F9]">
                            {platform.name}
                          </span>
                          {isCheapest && (
                            <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              CHEAPEST OUTFLOW
                            </span>
                          )}
                          {platform.isPassActive && (
                            <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              PASS ACTIVE
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          Free delivery threshold: ₹{platform.threshold}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-mono font-black text-slate-900 dark:text-[#F1F5F9]">
                        ₹{platform.totalPayable}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 block">
                        (₹{cartValue} item + ₹{platform.totalSurcharges} fees)
                      </span>
                    </div>
                  </div>

                  {/* Surcharge Anatomy Chips */}
                  <div className="flex items-center gap-2 pt-2.5 flex-wrap text-[11px] font-mono">
                    <span
                      className={`px-2 py-0.5 rounded-md border ${
                        platform.deliveryFee === 0
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-50 dark:bg-[#070A11] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/10'
                      }`}
                    >
                      Delivery: {platform.deliveryFee === 0 ? 'FREE' : `₹${platform.deliveryFee}`}
                    </span>

                    {platform.smallCartFee > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                        Small Cart Surcharge: ₹{platform.smallCartFee}
                      </span>
                    )}

                    <span className="px-2 py-0.5 rounded-md bg-slate-50 dark:bg-[#070A11] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                      Handling / Tech Fee: ₹{platform.handlingFee}
                    </span>

                    {platform.nightFee > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                        🌙 Night Surge: ₹{platform.nightFee}
                      </span>
                    )}

                    {platform.rainSurgeFee > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                        🌧️ Rain Surge: ₹{platform.rainSurgeFee}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick-Commerce Rules Guide */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <span className="font-bold text-slate-900 dark:text-[#F1F5F9] block font-heading">
              Quick Commerce Pricing Realities (2025/2026):
            </span>
            <p className="text-[11px] leading-relaxed m-0">
              Dark stores increasingly use dynamic surge fees based on courier supply. If buying under ₹150, always bundle 2-3 shelf-stable grocery items (dal, noodles, milk, soap) to permanently trigger free shipping tier!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
