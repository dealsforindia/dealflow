import React, { useState, useMemo } from 'react';

export interface PhoneModelPreset {
  brand: string;
  model: string;
  storage: string;
  originalMrp: number;
  baseMarketFairValue: number; // Fair second-hand cash value
  flipkartBaseQuote: number;
  amazonBaseQuote: number;
  cashifyBaseQuote: number;
  typicalFestiveBonus: number;
  isApple: boolean;
}

const PHONE_PRESETS: PhoneModelPreset[] = [
  {
    brand: 'Apple',
    model: 'iPhone 13',
    storage: '128 GB',
    originalMrp: 59900,
    baseMarketFairValue: 27000,
    flipkartBaseQuote: 23500,
    amazonBaseQuote: 22000,
    cashifyBaseQuote: 24500,
    typicalFestiveBonus: 4000,
    isApple: true,
  },
  {
    brand: 'Apple',
    model: 'iPhone 14',
    storage: '128 GB',
    originalMrp: 69900,
    baseMarketFairValue: 36000,
    flipkartBaseQuote: 31000,
    amazonBaseQuote: 30000,
    cashifyBaseQuote: 32500,
    typicalFestiveBonus: 5000,
    isApple: true,
  },
  {
    brand: 'Samsung',
    model: 'Galaxy S23 5G',
    storage: '128 GB',
    originalMrp: 74999,
    baseMarketFairValue: 32000,
    flipkartBaseQuote: 26000,
    amazonBaseQuote: 25000,
    cashifyBaseQuote: 28000,
    typicalFestiveBonus: 6000,
    isApple: false,
  },
  {
    brand: 'OnePlus',
    model: 'OnePlus 11R 5G',
    storage: '128 GB',
    originalMrp: 39999,
    baseMarketFairValue: 18500,
    flipkartBaseQuote: 14500,
    amazonBaseQuote: 14000,
    cashifyBaseQuote: 16000,
    typicalFestiveBonus: 3000,
    isApple: false,
  },
  {
    brand: 'Xiaomi / Redmi',
    model: 'Redmi Note 12 Pro 5G',
    storage: '128 GB',
    originalMrp: 24999,
    baseMarketFairValue: 10500,
    flipkartBaseQuote: 8000,
    amazonBaseQuote: 7500,
    cashifyBaseQuote: 9200,
    typicalFestiveBonus: 2000,
    isApple: false,
  },
  {
    brand: 'Realme',
    model: 'Realme 11 Pro+ 5G',
    storage: '256 GB',
    originalMrp: 27999,
    baseMarketFairValue: 12000,
    flipkartBaseQuote: 9500,
    amazonBaseQuote: 9000,
    cashifyBaseQuote: 10500,
    typicalFestiveBonus: 2500,
    isApple: false,
  },
];

export const MobileExchangeValueAuditor: React.FC = () => {
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number>(0);
  const [customPhoneName, setCustomPhoneName] = useState<string>('');
  const [useCustomPhone, setUseCustomPhone] = useState<boolean>(false);
  const [customBaseValue, setCustomBaseValue] = useState<number>(15000);
  const [exchangeBonusApplied, setExchangeBonusApplied] = useState<boolean>(true);

  // Doorstep Condition Factors
  const [hasOriginalBoxAndBill, setHasOriginalBoxAndBill] = useState<boolean>(true);
  const [hasOriginalCharger, setHasOriginalCharger] = useState<boolean>(true);
  const [bodyCondition, setBodyCondition] = useState<'flawless' | 'minor_scratches' | 'dents' | 'cracked_back'>('minor_scratches');
  const [screenCondition, setScreenCondition] = useState<'flawless' | 'minor_scratches' | 'deep_scratch' | 'cracked_glass' | 'display_lines'>('flawless');
  const [batteryHealthUnder80, setBatteryHealthUnder80] = useState<boolean>(false);
  const [functionalDefects, setFunctionalDefects] = useState<boolean>(false); // camera/mic/wifi defect

  const [copiedMemo, setCopiedMemo] = useState<boolean>(false);

  const preset = PHONE_PRESETS[selectedPresetIdx];

  // Mathematical deduction calculator
  const conditionMath = useMemo(() => {
    let penaltyPercent = 0;
    let flatDeduction = 0;

    // Body
    if (bodyCondition === 'minor_scratches') penaltyPercent += 5;
    else if (bodyCondition === 'dents') penaltyPercent += 15;
    else if (bodyCondition === 'cracked_back') penaltyPercent += 30;

    // Screen
    if (screenCondition === 'minor_scratches') penaltyPercent += 5;
    else if (screenCondition === 'deep_scratch') penaltyPercent += 15;
    else if (screenCondition === 'cracked_glass') penaltyPercent += 40;
    else if (screenCondition === 'display_lines') penaltyPercent += 60;

    // Battery
    if (batteryHealthUnder80) penaltyPercent += 12;

    // Functional defects
    if (functionalDefects) penaltyPercent += 35;

    // Missing accessories
    if (!hasOriginalBoxAndBill) flatDeduction += 500;
    if (!hasOriginalCharger) flatDeduction += 500;

    const baseQuoteFlipkart = useCustomPhone
      ? customBaseValue * 0.85
      : preset.flipkartBaseQuote;
    const baseQuoteAmazon = useCustomPhone
      ? customBaseValue * 0.8
      : preset.amazonBaseQuote;
    const baseQuoteCashify = useCustomPhone
      ? customBaseValue * 0.92
      : preset.cashifyBaseQuote;
    const p2pFairMarket = useCustomPhone
      ? customBaseValue
      : preset.baseMarketFairValue;

    const festiveBonus = exchangeBonusApplied
      ? useCustomPhone
        ? 3000
        : preset.typicalFestiveBonus
      : 0;

    // Calculate deductions
    const calcFinalOffer = (base: number, bonus: number) => {
      const deductionVal = base * (penaltyPercent / 100) + flatDeduction;
      const netBase = Math.max(500, base - deductionVal);
      return Math.round(netBase + bonus);
    };

    const finalFlipkart = calcFinalOffer(baseQuoteFlipkart, festiveBonus);
    const finalAmazon = calcFinalOffer(baseQuoteAmazon, festiveBonus);
    const finalCashify = calcFinalOffer(baseQuoteCashify, 0); // Cashify rarely has festive exchange bonus on new cart
    const finalP2P = Math.max(1000, Math.round(p2pFairMarket * (1 - penaltyPercent * 0.007) - flatDeduction));

    // Best Route
    const offers = [
      { name: 'Flipkart Exchange', val: finalFlipkart, type: 'Cart Discount' },
      { name: 'Amazon Trade-In', val: finalAmazon, type: 'Cart Discount' },
      { name: 'Cashify Instant Cash', val: finalCashify, type: 'Direct Bank Transfer' },
      { name: 'OLX / P2P Direct Sale', val: finalP2P, type: 'Direct Cash (High Effort)' },
    ];
    offers.sort((a, b) => b.val - a.val);

    return {
      penaltyPercent,
      flatDeduction,
      finalFlipkart,
      finalAmazon,
      finalCashify,
      finalP2P,
      bestOffer: offers[0],
      festiveBonus,
    };
  }, [
    preset,
    useCustomPhone,
    customBaseValue,
    exchangeBonusApplied,
    bodyCondition,
    screenCondition,
    batteryHealthUnder80,
    functionalDefects,
    hasOriginalBoxAndBill,
    hasOriginalCharger,
  ]);

  const handleCopyMemo = () => {
    const phoneName = useCustomPhone ? customPhoneName || 'Custom Smartphone' : `${preset.brand} ${preset.model} (${preset.storage})`;
    const text = `=== PHONE EXCHANGE & CASHIFY VALUATION AUDIT ===
Device: ${phoneName}
Body Condition: ${bodyCondition.replace('_', ' ')}
Screen Condition: ${screenCondition.replace('_', ' ')}
Accessories: ${hasOriginalBoxAndBill ? 'Box & Bill Present' : 'No Box/Bill'}, ${hasOriginalCharger ? 'Original Charger' : 'No Charger'}
Condition Deduction: ${conditionMath.penaltyPercent}% penalty + ₹${conditionMath.flatDeduction}
Festive Exchange Bonus Applied: ₹${conditionMath.festiveBonus}
--------------------------------------------------
1. Flipkart Exchange (New Cart Value): ₹${conditionMath.finalFlipkart.toLocaleString('en-IN')}
2. Amazon Trade-In (New Cart Value): ₹${conditionMath.finalAmazon.toLocaleString('en-IN')}
3. Cashify Doorstep Cash (Direct Bank UPI): ₹${conditionMath.finalCashify.toLocaleString('en-IN')}
4. OLX / Direct P2P Sale (Peer Cash): ₹${conditionMath.finalP2P.toLocaleString('en-IN')}
--------------------------------------------------
RECOMMENDED CHANNEL: ${conditionMath.bestOffer.name} (₹${conditionMath.bestOffer.val.toLocaleString('en-IN')})
Audit Note: If buying during a major sale, Flipkart/Amazon Exchange Bonus (+₹${conditionMath.festiveBonus}) usually beats Cashify by ₹2,000-₹4,000.
Generated via IndiaDealHunts Mobile Trade-In Lab`;

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
              <span className="text-xl">📱</span>
              <h3 className="font-heading font-black text-lg text-slate-900 dark:text-[#F1F5F9] tracking-tight">
                Phone Exchange vs. Cashify Valuation Sentinel
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                TRADE-IN REALITY CHECK
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-2xl">
              Should you exchange your old phone on Flipkart/Amazon or sell for direct cash on Cashify?
              Model doorstep physical deductions, screen scratches, missing chargers, and festive bonus bumps.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMemo}
              className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white cursor-pointer shadow-xs active:scale-95"
            >
              <span>{copiedMemo ? '✓ Copied' : '📋 Copy Valuation Audit'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preset Model Buttons */}
      <div className="bg-white dark:bg-[#0D1527] p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Select Popular Indian Handsets
          </span>
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={useCustomPhone}
              onChange={(e) => setUseCustomPhone(e.target.checked)}
              className="rounded text-violet-600 focus:ring-violet-500"
            />
            <span>Custom Phone Model</span>
          </label>
        </div>

        {!useCustomPhone ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {PHONE_PRESETS.map((p, idx) => {
              const isSelected = selectedPresetIdx === idx;
              return (
                <button
                  key={p.model}
                  type="button"
                  onClick={() => setSelectedPresetIdx(idx)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-violet-600 bg-violet-50/50 shadow-xs ring-1 ring-violet-500/20'
                      : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:border-white/20 hover:bg-slate-50 dark:bg-[#070A11]'
                  }`}
                >
                  <div>
                    <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                      {p.brand}
                    </div>
                    <div className="font-bold text-xs text-slate-800 dark:text-[#F8FAFC] line-clamp-1 mt-0.5">
                      {p.model}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">{p.storage}</div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px]">
                    <span className="font-mono text-slate-500">Base</span>
                    <span className="font-mono font-bold text-violet-700">
                      ₹{p.baseMarketFairValue.toLocaleString('en-IN')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-violet-50/50 border border-violet-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Phone Brand &amp; Model Name
              </label>
              <input
                type="text"
                value={customPhoneName}
                onChange={(e) => setCustomPhoneName(e.target.value)}
                placeholder="e.g. Pixel 7 128GB"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-white/20 text-xs bg-white dark:bg-[#0D1527]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Estimated Pristine Value (₹)
              </label>
              <input
                type="number"
                value={customBaseValue}
                onChange={(e) => setCustomBaseValue(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-white/20 text-xs font-mono bg-white dark:bg-[#0D1527]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Condition Diagnostics vs Valuation Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Condition Diagnostics */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-[#0D1527] p-5 rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-xs space-y-4">
            <div className="font-bold text-sm text-slate-800 dark:text-[#F8FAFC] flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>🔍</span>
                <span>Doorstep Inspection Diagnostics</span>
              </span>
              <span className="text-xs font-mono text-rose-600 font-bold">
                -{conditionMath.penaltyPercent}% Penalty
              </span>
            </div>

            {/* Screen Condition */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Touchscreen &amp; Display Glass
              </label>
              <select
                value={screenCondition}
                onChange={(e) => setScreenCondition(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-medium bg-slate-50 dark:bg-[#070A11] focus:bg-white dark:bg-[#0D1527]"
              >
                <option value="flawless">Flawless (No scratches under light) [0% penalty]</option>
                <option value="minor_scratches">Micro-scratches on glass [-5% penalty]</option>
                <option value="deep_scratch">Deep visible nail-catching scratch [-15% penalty]</option>
                <option value="cracked_glass">Cracked glass (touch still works) [-40% penalty]</option>
                <option value="display_lines">Dead pixels / Green lines / Touch failure [-60% penalty]</option>
              </select>
            </div>

            {/* Body Condition */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Chassis, Frame &amp; Back Panel
              </label>
              <select
                value={bodyCondition}
                onChange={(e) => setBodyCondition(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-medium bg-slate-50 dark:bg-[#070A11] focus:bg-white dark:bg-[#0D1527]"
              >
                <option value="flawless">Pristine / Flawless (No scuffs) [0% penalty]</option>
                <option value="minor_scratches">Minor paint scuffs or bumper marks [-5% penalty]</option>
                <option value="dents">Corner dent or bent aluminum rail [-15% penalty]</option>
                <option value="cracked_back">Cracked back glass [-30% penalty]</option>
              </select>
            </div>

            {/* Checkboxes for accessories & health */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5 text-xs">
              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasOriginalBoxAndBill}
                  onChange={(e) => setHasOriginalBoxAndBill(e.target.checked)}
                  className="rounded text-violet-600 focus:ring-violet-500"
                />
                <span>I have original box &amp; purchase invoice (No ₹500 penalty)</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasOriginalCharger}
                  onChange={(e) => setHasOriginalCharger(e.target.checked)}
                  className="rounded text-violet-600 focus:ring-violet-500"
                />
                <span>Original power adapter &amp; charging cable included</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={batteryHealthUnder80}
                  onChange={(e) => setBatteryHealthUnder80(e.target.checked)}
                  className="rounded text-violet-600 focus:ring-violet-500"
                />
                <span>Battery degraded / Health below 80% (Service warning)</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={functionalDefects}
                  onChange={(e) => setFunctionalDefects(e.target.checked)}
                  className="rounded text-violet-600 focus:ring-violet-500"
                />
                <span>Hardware flaw (Blurry camera, faulty mic, broken speaker)</span>
              </label>
            </div>

            {/* Festive Bonus Toggle */}
            <div className="pt-2 border-t border-slate-100 dark:border-white/5">
              <label className="flex items-center gap-2 text-xs font-bold text-violet-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exchangeBonusApplied}
                  onChange={(e) => setExchangeBonusApplied(e.target.checked)}
                  className="rounded text-violet-600 focus:ring-violet-500"
                />
                <span>Apply Festive Exchange Bonus (+₹{conditionMath.festiveBonus.toLocaleString('en-IN')})</span>
              </label>
              <p className="text-[11px] text-slate-400 mt-0.5 ml-6">
                Offered by Flipkart / Amazon during Great Indian Festival &amp; Big Billion Days on flagship new carts.
              </p>
            </div>
          </div>
        </div>

        {/* Right Form: Valuation Comparison Ledger */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="text-xs uppercase tracking-wider font-mono text-violet-400 font-bold">
                  Recommended Selling Channel
                </div>
                <div className="text-xl sm:text-2xl font-heading font-black tracking-tight mt-0.5 text-white flex items-center gap-2">
                  <span>{conditionMath.bestOffer.name}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black font-mono text-emerald-400">
                  ₹{conditionMath.bestOffer.val.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {conditionMath.bestOffer.type}
                </div>
              </div>
            </div>

            {/* Platform Comparison Bars */}
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-200">Flipkart Exchange</div>
                  <div className="text-[10px] text-slate-400">
                    Includes ₹{conditionMath.festiveBonus} Festive Bonus
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-white text-sm">
                    ₹{conditionMath.finalFlipkart.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-blue-400 font-mono">Immediate Cart Rebate</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-200">Amazon Trade-In</div>
                  <div className="text-[10px] text-slate-400">Doorstep diagnostic check</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-white text-sm">
                    ₹{conditionMath.finalAmazon.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-amber-400 font-mono">Amazon Pay Balance / Cart</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-200">Cashify Doorstep Cash</div>
                  <div className="text-[10px] text-slate-400">No purchase needed, technician visits home</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-emerald-400 text-sm">
                    ₹{conditionMath.finalCashify.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono">Direct UPI / Bank Transfer</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-200">OLX / P2P Direct Sale</div>
                  <div className="text-[10px] text-slate-400">Direct buyer meetup (Scam risk caution)</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-300 text-sm">
                    ₹{conditionMath.finalP2P.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">Paper Cash / UPI</div>
                </div>
              </div>
            </div>

            {/* Strategy Verdict */}
            <div className="p-3.5 rounded-xl bg-violet-950/40 border border-violet-800/60 text-xs space-y-1 text-violet-200">
              <div className="font-bold flex items-center gap-1.5 text-violet-300">
                <span>💡</span>
                <span>Pro Trade-In Verdict</span>
              </div>
              <p className="text-[11px] leading-relaxed text-violet-200/90">
                {exchangeBonusApplied
                  ? `With the ₹${conditionMath.festiveBonus.toLocaleString('en-IN')} Festive Exchange Bonus active, exchanging directly on Flipkart/Amazon gives you ₹${Math.abs(conditionMath.finalFlipkart - conditionMath.finalCashify).toLocaleString('en-IN')} MORE than selling for cash on Cashify.`
                  : 'Without an exchange bonus, selling on Cashify gives you direct bank liquidity with zero obligation to buy a new device.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
