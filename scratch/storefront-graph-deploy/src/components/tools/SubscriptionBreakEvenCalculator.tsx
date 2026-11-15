import React, { useState, useMemo } from 'react';

export interface SubscriptionPlan {
  id: string;
  name: string;
  provider: string;
  annualFee: number;
  quarterlyFee?: number;
  monthlyFee?: number;
  icon: string;
  category: 'E-Commerce' | 'Food & Quick Commerce' | 'Entertainment & Delivery';
  color: string;
  corePerks: string[];
  deliveryThresholdNonMember: number;
  standardDeliveryFee: number;
  cashbackDeltaPercent: number;
  streamingEstimatedValueAnnual: number;
  surgeProtectionSavingsPerOrder: number;
  notes: string;
}

const PLANS: SubscriptionPlan[] = [
  {
    id: 'amazon_prime',
    name: 'Amazon Prime Annual',
    provider: 'Amazon India',
    annualFee: 1499,
    quarterlyFee: 599,
    monthlyFee: 299,
    icon: '📦',
    category: 'E-Commerce',
    color: '#00A8E1',
    corePerks: [
      'Free 1-Day & Same-Day delivery (saves ₹175 on sub-₹499 carts)',
      '5% unlimited cashback on Amazon Pay ICICI Card (vs 3% for non-Prime)',
      'Prime Video (4K HDR), Prime Music & Prime Gaming included',
      '24-Hour early access to Great Indian Festival & Prime Day loot',
    ],
    deliveryThresholdNonMember: 499,
    standardDeliveryFee: 40, // Standard delivery fee for small orders
    cashbackDeltaPercent: 2, // 5% vs 3% = 2% extra
    streamingEstimatedValueAnnual: 600, // Imputed subjective OTT value
    surgeProtectionSavingsPerOrder: 0,
    notes: 'If you only want shopping perks without movies, Prime Shopping Edition is ₹799/year. 2% extra cashback on ICICI card covers the fee if you spend over ₹75,000/year.',
  },
  {
    id: 'swiggy_one',
    name: 'Swiggy One Annual',
    provider: 'Swiggy',
    annualFee: 899,
    quarterlyFee: 299,
    icon: '🛵',
    category: 'Food & Quick Commerce',
    color: '#FC8019',
    corePerks: [
      'Free food delivery on orders above ₹149 within 7km',
      'Free Instamart grocery delivery on orders above ₹199',
      'Zero surge fees during peak dinner & rainy weather',
      'Extra 10% to 30% discount at partner restaurants',
    ],
    deliveryThresholdNonMember: 149,
    standardDeliveryFee: 45, // Average delivery charge per food/instamart order
    cashbackDeltaPercent: 0, // Handled separately via Swiggy HDFC card
    streamingEstimatedValueAnnual: 0,
    surgeProtectionSavingsPerOrder: 25,
    notes: 'Pays for itself in just 1.5 orders per month. If ordering groceries from Instamart 3+ times a month, Swiggy One yields over 400% annual ROI.',
  },
  {
    id: 'flipkart_vip',
    name: 'Flipkart VIP Annual',
    provider: 'Flipkart',
    annualFee: 499,
    icon: '🛍️',
    category: 'E-Commerce',
    color: '#2874F0',
    corePerks: [
      'Free delivery on all Flipkart orders with NO minimum purchase limit',
      '5% SuperCoins return up to 300 coins per order (vs 2% regular)',
      'Instant return pickup within 48 hours & VIP priority customer hotline',
      'Flat ₹499 flight discount voucher on Cleartrip',
    ],
    deliveryThresholdNonMember: 500,
    standardDeliveryFee: 40,
    cashbackDeltaPercent: 3, // 5% SuperCoins vs 2% regular
    streamingEstimatedValueAnnual: 0,
    surgeProtectionSavingsPerOrder: 0,
    notes: 'Very low barrier at ₹499. The ₹499 Cleartrip flight voucher immediately recovers the cost if you travel even once annually.',
  },
  {
    id: 'zomato_gold',
    name: 'Zomato Gold Annual',
    provider: 'Zomato',
    annualFee: 999,
    quarterlyFee: 299,
    icon: '🍽️',
    category: 'Food & Quick Commerce',
    color: '#E23744',
    corePerks: [
      'Free food delivery on orders above ₹199 within 7km',
      'Up to 40% flat off at 20,000+ dine-in restaurants across India',
      'No surge fees during rainy weather or holiday rush',
      'Priority delivery dispatch during peak hours',
    ],
    deliveryThresholdNonMember: 199,
    standardDeliveryFee: 40,
    cashbackDeltaPercent: 0,
    streamingEstimatedValueAnnual: 0,
    surgeProtectionSavingsPerOrder: 25,
    notes: 'If you dine out at restaurants 3 times a year, the dining discount alone saves ₹1,500+, making the delivery perks completely free.',
  },
  {
    id: 'youtube_premium_family',
    name: 'YouTube Premium Family',
    provider: 'Google India',
    annualFee: 2388, // ₹199/month * 12
    monthlyFee: 199,
    icon: '▶️',
    category: 'Entertainment & Delivery',
    color: '#FF0000',
    corePerks: [
      'Zero ads on YouTube across Smart TV, PC, and Mobile for up to 6 members',
      'Background play & picture-in-picture video on smartphones',
      'Full YouTube Music Premium streaming included for all members',
      'Offline video downloads for travel & commutes',
    ],
    deliveryThresholdNonMember: 0,
    standardDeliveryFee: 0,
    cashbackDeltaPercent: 0,
    streamingEstimatedValueAnnual: 2388,
    surgeProtectionSavingsPerOrder: 0,
    notes: 'Shared between 5-6 family members or friends, cost drops to just ₹33-₹40 per person per month. Eliminates Spotify/Apple Music fees.',
  },
];

export const SubscriptionBreakEvenCalculator: React.FC = () => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('amazon_prime');

  // User Lifestyle Inputs
  const [monthlyEcommerceSpend, setMonthlyEcommerceSpend] = useState<number>(3500);
  const [monthlySmallDeliveriesCount, setMonthlySmallDeliveriesCount] = useState<number>(2); // Sub-threshold orders
  const [monthlyFoodOrdersCount, setMonthlyFoodOrdersCount] = useState<number>(4);
  const [monthlyInstamartOrdersCount, setMonthlyInstamartOrdersCount] = useState<number>(4);
  const [hasCoBrandedCard, setHasCoBrandedCard] = useState<boolean>(true); // e.g. Amazon Pay ICICI or Flipkart Axis
  const [valuesStreaming, setValuesStreaming] = useState<boolean>(true);
  const [copiedMemo, setCopiedMemo] = useState<boolean>(false);

  const activePlan = PLANS.find((p) => p.id === selectedPlanId) || PLANS[0];

  // Mathematical Modeling of Annual Returns
  const analysis = useMemo(() => {
    let annualDeliveryFeeSavings = 0;
    let annualCashbackDeltaSavings = 0;
    let annualSurgeSavings = 0;
    let annualStreamingEntertainmentValue = 0;
    let breakEvenOrdersNeededPerYear = 0;

    if (activePlan.id === 'amazon_prime') {
      // Small orders (<₹499) save ₹40-₹175
      annualDeliveryFeeSavings = monthlySmallDeliveriesCount * 12 * 70; // Blended avg saving ₹70 per small cart

      // 2% extra cashback on ICICI Card if member
      if (hasCoBrandedCard) {
        annualCashbackDeltaSavings = monthlyEcommerceSpend * 12 * 0.02;
      }

      if (valuesStreaming) {
        annualStreamingEntertainmentValue = 600; // Subjective market value of Prime Video/Music
      }

      const effectiveFee = Math.max(0, activePlan.annualFee - annualStreamingEntertainmentValue);
      const savingsPerSmallOrder = 70;
      breakEvenOrdersNeededPerYear = Math.ceil(effectiveFee / savingsPerSmallOrder);
    } else if (activePlan.id === 'swiggy_one') {
      // Food orders save ~₹45 delivery + ₹15 average surge
      const totalOrdersPerMonth = monthlyFoodOrdersCount + monthlyInstamartOrdersCount;
      annualDeliveryFeeSavings = totalOrdersPerMonth * 12 * 45;
      annualSurgeSavings = totalOrdersPerMonth * 12 * 15; // Rain / surge savings
      const savingsPerOrder = 60; // 45 + 15
      breakEvenOrdersNeededPerYear = Math.ceil(activePlan.annualFee / savingsPerOrder);
    } else if (activePlan.id === 'flipkart_vip') {
      annualDeliveryFeeSavings = monthlySmallDeliveriesCount * 12 * 40;
      // 3% extra SuperCoins value
      annualCashbackDeltaSavings = monthlyEcommerceSpend * 12 * 0.03;
      const savingsPerOrder = 40;
      breakEvenOrdersNeededPerYear = Math.ceil(activePlan.annualFee / savingsPerOrder);
    } else if (activePlan.id === 'zomato_gold') {
      annualDeliveryFeeSavings = monthlyFoodOrdersCount * 12 * 40;
      annualSurgeSavings = monthlyFoodOrdersCount * 12 * 20;
      const savingsPerOrder = 60;
      breakEvenOrdersNeededPerYear = Math.ceil(activePlan.annualFee / savingsPerOrder);
    } else if (activePlan.id === 'youtube_premium_family') {
      annualStreamingEntertainmentValue = 2388;
      breakEvenOrdersNeededPerYear = 0;
    }

    const totalAnnualValueRecovered =
      annualDeliveryFeeSavings +
      annualCashbackDeltaSavings +
      annualSurgeSavings +
      annualStreamingEntertainmentValue;

    const netAnnualProfit = totalAnnualValueRecovered - activePlan.annualFee;
    const roiMultiplier =
      activePlan.annualFee > 0
        ? (totalAnnualValueRecovered / activePlan.annualFee).toFixed(1)
        : '0';

    const breakEvenOrdersPerMonth = (breakEvenOrdersNeededPerYear / 12).toFixed(1);

    return {
      annualDeliveryFeeSavings,
      annualCashbackDeltaSavings,
      annualSurgeSavings,
      annualStreamingEntertainmentValue,
      totalAnnualValueRecovered,
      netAnnualProfit,
      roiMultiplier,
      breakEvenOrdersNeededPerYear,
      breakEvenOrdersPerMonth,
    };
  }, [
    activePlan,
    monthlyEcommerceSpend,
    monthlySmallDeliveriesCount,
    monthlyFoodOrdersCount,
    monthlyInstamartOrdersCount,
    hasCoBrandedCard,
    valuesStreaming,
  ]);

  const handleCopyMemo = () => {
    const text = `=== SUBSCRIPTION PAYBACK & VALUE AUDIT ===
Plan: ${activePlan.name} (${activePlan.provider})
Annual Subscription Cost: ₹${activePlan.annualFee}
--------------------------------------------------
Annual Delivery Fee Recovered: ₹${Math.round(analysis.annualDeliveryFeeSavings).toLocaleString('en-IN')}
Annual Extra Cashback / SuperCoins: ₹${Math.round(analysis.annualCashbackDeltaSavings).toLocaleString('en-IN')}
Annual Surge & Rain Protection Savings: ₹${Math.round(analysis.annualSurgeSavings).toLocaleString('en-IN')}
Imputed Entertainment / Streaming Value: ₹${Math.round(analysis.annualStreamingEntertainmentValue).toLocaleString('en-IN')}
--------------------------------------------------
TOTAL VALUE HARVESTED: ₹${Math.round(analysis.totalAnnualValueRecovered).toLocaleString('en-IN')}
NET ANNUAL SAVINGS (PROFIT): ${analysis.netAnnualProfit >= 0 ? '+' : ''}₹${Math.round(analysis.netAnnualProfit).toLocaleString('en-IN')}
Annual ROI Multiplier: ${analysis.roiMultiplier}x
Break-Even Requirement: ~${analysis.breakEvenOrdersPerMonth} orders / month (~${analysis.breakEvenOrdersNeededPerYear} / year)
Generated via IndiaDealHunts Subscription Lab`;

    navigator.clipboard.writeText(text);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#0D1527] p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">💳</span>
              <h3 className="font-heading font-black text-lg text-slate-900 dark:text-[#F1F5F9] tracking-tight">
                Subscription ROI &amp; Break-Even Math Sentinel
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                LIFESTYLE VALUE AUDIT
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-2xl">
              Are you bleeding money on Amazon Prime, Swiggy One, Zomato Gold, or Flipkart VIP?
              Model your genuine monthly order habits, credit card cashback delta, and surge protection to know your exact break-even point.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMemo}
              className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white cursor-pointer shadow-xs active:scale-95"
            >
              <span>{copiedMemo ? '✓ Copied' : '📋 Copy Subscription Audit'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subscription Cards Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {PLANS.map((plan) => {
          const isSelected = plan.id === selectedPlanId;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedPlanId(plan.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:border-white/20 hover:bg-slate-50 dark:bg-[#070A11] bg-white dark:bg-[#0D1527]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">{plan.icon}</span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    ₹{plan.annualFee}/yr
                  </span>
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-[#F1F5F9] line-clamp-1">{plan.name}</div>
                <div className="text-[10px] text-slate-500 font-medium">{plan.provider}</div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px]">
                <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">
                  {plan.category}
                </span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Plan Perks Card */}
      <div className="bg-slate-50 dark:bg-[#070A11] p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-1">
          <div className="font-bold text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
            <span>{activePlan.icon}</span>
            <span>{activePlan.name} Membership Features:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11.5px] text-slate-600 dark:text-slate-400">
            {activePlan.corePerks.map((perk, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{perk}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="sm:border-l sm:border-slate-200 dark:border-white/10 sm:pl-4 flex-shrink-0 text-right">
          <div className="text-[10px] text-slate-400 uppercase font-mono font-bold">Annual Fee</div>
          <div className="text-base font-black font-mono text-slate-900 dark:text-[#F1F5F9]">
            ₹{activePlan.annualFee}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {activePlan.quarterlyFee ? `or ₹${activePlan.quarterlyFee}/3-mo` : 'Billed Yearly'}
          </div>
        </div>
      </div>

      {/* Main Analysis Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Habit Adjusters */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-[#0D1527] p-5 rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-xs space-y-4">
            <div className="font-bold text-sm text-slate-800 dark:text-[#F8FAFC] flex items-center gap-2">
              <span>📊</span>
              <span>Your Genuine Monthly Usage Habits</span>
            </div>

            {/* E-Commerce Controls if applicable */}
            {(activePlan.id === 'amazon_prime' || activePlan.id === 'flipkart_vip') && (
              <>
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    <span>Monthly Shopping Spend on Store</span>
                    <span className="font-mono text-emerald-700 font-extrabold text-sm">
                      ₹{monthlyEcommerceSpend.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="30000"
                    step="500"
                    value={monthlyEcommerceSpend}
                    onChange={(e) => setMonthlyEcommerceSpend(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                    <span>₹500/mo</span>
                    <span>₹15,000/mo</span>
                    <span>₹30,000+/mo</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    <span>Small Orders per Month (under ₹500 free threshold)</span>
                    <span className="font-mono text-slate-800 dark:text-[#F8FAFC] font-bold">
                      {monthlySmallDeliveriesCount} orders/mo
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={monthlySmallDeliveriesCount}
                    onChange={(e) => setMonthlySmallDeliveriesCount(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Without membership, each small order under ₹499 incurs a ₹40 - ₹175 shipping charge.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasCoBrandedCard}
                      onChange={(e) => setHasCoBrandedCard(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>
                      I hold the Store Credit Card (Amazon Pay ICICI / Flipkart Axis)
                    </span>
                  </label>
                  <p className="text-[11px] text-slate-400 mt-1 ml-6">
                    Prime unlocks 5% unlimited cashback (vs 3% for non-Prime), providing an extra 2% return on all spends.
                  </p>
                </div>

                {activePlan.id === 'amazon_prime' && (
                  <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={valuesStreaming}
                        onChange={(e) => setValuesStreaming(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>
                        I actively watch Prime Video / listen to Prime Music
                      </span>
                    </label>
                  </div>
                )}
              </>
            )}

            {/* Food & Quick Commerce Controls */}
            {(activePlan.id === 'swiggy_one' || activePlan.id === 'zomato_gold') && (
              <>
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    <span>Restaurant Food Orders per Month</span>
                    <span className="font-mono text-emerald-700 font-extrabold text-sm">
                      {monthlyFoodOrdersCount} orders/mo
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={monthlyFoodOrdersCount}
                    onChange={(e) => setMonthlyFoodOrdersCount(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                {activePlan.id === 'swiggy_one' && (
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                      <span>Instamart Grocery Orders per Month</span>
                      <span className="font-mono text-emerald-700 font-extrabold text-sm">
                        {monthlyInstamartOrdersCount} orders/mo
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="1"
                      value={monthlyInstamartOrdersCount}
                      onChange={(e) => setMonthlyInstamartOrdersCount(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Swiggy One grants free delivery on all Instamart orders above ₹199.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Form: Payback Ledger */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="text-xs uppercase tracking-wider font-mono text-emerald-400 font-bold">
                  Net Annual Benefit
                </div>
                <div className="text-2xl sm:text-3xl font-heading font-black tracking-tight mt-0.5 text-white flex items-center gap-2">
                  <span className={analysis.netAnnualProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {analysis.netAnnualProfit >= 0 ? '+' : ''}₹{Math.round(analysis.netAnnualProfit).toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-mono font-normal text-slate-400">/ yr</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                  {analysis.roiMultiplier}x Annual ROI
                </span>
                <div className="text-[11px] text-slate-400 font-mono mt-1">
                  Break-even: {analysis.breakEvenOrdersPerMonth} orders / mo
                </div>
              </div>
            </div>

            {/* Itemized Recovery Breakdown */}
            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">1. Delivery Fees Saved:</span>
                <span className="text-emerald-400">+₹{Math.round(analysis.annualDeliveryFeeSavings).toLocaleString('en-IN')}</span>
              </div>

              {analysis.annualCashbackDeltaSavings > 0 && (
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">2. Extra Card Cashback / SuperCoins:</span>
                  <span className="text-emerald-400">+₹{Math.round(analysis.annualCashbackDeltaSavings).toLocaleString('en-IN')}</span>
                </div>
              )}

              {analysis.annualSurgeSavings > 0 && (
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">3. Rain &amp; Rush Surge Protection:</span>
                  <span className="text-emerald-400">+₹{Math.round(analysis.annualSurgeSavings).toLocaleString('en-IN')}</span>
                </div>
              )}

              {analysis.annualStreamingEntertainmentValue > 0 && (
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">4. Streaming Media Imputed Value:</span>
                  <span className="text-emerald-400">+₹{Math.round(analysis.annualStreamingEntertainmentValue).toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-slate-400 pt-1 border-t border-slate-800">
                <span>Total Annual Value Generated:</span>
                <span className="text-white font-bold">₹{Math.round(analysis.totalAnnualValueRecovered).toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between items-center text-rose-400">
                <span>Less Subscription Membership Fee:</span>
                <span>-₹{activePlan.annualFee}</span>
              </div>
            </div>

            {/* Verdict Box */}
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs space-y-1">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <span>🎯</span>
                <span>Financial Verdict</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {analysis.netAnnualProfit > 1500
                  ? `Spectacular investment. Your monthly order volume harvests ${analysis.roiMultiplier}x more value than the subscription price. Renew with confidence.`
                  : analysis.netAnnualProfit >= 0
                  ? `Moderately profitable. You break even after just ${analysis.breakEvenOrdersNeededPerYear} orders a year. Keep an eye on your order cadence.`
                  : `Currently running at an annual loss of ₹${Math.abs(Math.round(analysis.netAnnualProfit))}. Your order frequency is too low to justify the full annual fee. Consider pausing or switching to monthly.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pro Advice Note */}
      <div className="bg-slate-100 dark:bg-[#111C33] p-4 rounded-2xl text-xs space-y-1 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10">
        <div className="font-bold flex items-center gap-2 text-slate-900 dark:text-[#F1F5F9]">
          <span>💡</span>
          <span>Pro Shopping Tip</span>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-[11.5px] leading-relaxed">
          {activePlan.notes}
        </p>
      </div>
    </div>
  );
};
