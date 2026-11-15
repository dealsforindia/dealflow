import React, { useState, useMemo } from 'react';

type UnitType = 'g' | 'kg' | 'ml' | 'l' | 'pcs';

interface PackOption {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: UnitType;
  packCount: number; // e.g., pack of 3
}

export const UnitPricingCalculatorTool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'compare' | 'shrinkflation'>('compare');

  // Option A (e.g. standard pack)
  const [optA, setOptA] = useState<PackOption>({
    id: 'a',
    name: 'Small / Single Pack',
    price: 185,
    quantity: 400,
    unit: 'g',
    packCount: 1,
  });

  // Option B (e.g. bulk / combo pack)
  const [optB, setOptB] = useState<PackOption>({
    id: 'b',
    name: 'Family / Bulk Pack',
    price: 430,
    quantity: 1000,
    unit: 'g',
    packCount: 1,
  });

  // Option C (e.g. multi-pack offer)
  const [optC, setOptC] = useState<PackOption>({
    id: 'c',
    name: 'Multipack Combo (Pack of 3)',
    price: 360,
    quantity: 300,
    unit: 'g',
    packCount: 3,
  });

  // Shrinkflation Calculator State
  const [oldWeight, setOldWeight] = useState<number>(100);
  const [newWeight, setNewWeight] = useState<number>(85);
  const [oldPrice, setOldPrice] = useState<number>(20);
  const [newPrice, setNewPrice] = useState<number>(20);

  // Helper to normalize quantity to a base unit (grams, ml, or pieces)
  const getNormalizedUnitRate = (opt: PackOption) => {
    const totalRawQty = opt.quantity * Math.max(1, opt.packCount);
    if (totalRawQty <= 0 || opt.price <= 0) return { baseRate: 0, displayRate: '₹0', unitLabel: '' };

    let totalInBase = totalRawQty;
    let standardQty = 100;
    let standardLabel = '100g';

    if (opt.unit === 'kg') {
      totalInBase = totalRawQty * 1000;
      standardQty = 1000;
      standardLabel = '1kg';
    } else if (opt.unit === 'g') {
      standardQty = 100;
      standardLabel = '100g';
    } else if (opt.unit === 'l') {
      totalInBase = totalRawQty * 1000;
      standardQty = 1000;
      standardLabel = '1L';
    } else if (opt.unit === 'ml') {
      standardQty = 100;
      standardLabel = '100ml';
    } else if (opt.unit === 'pcs') {
      standardQty = 1;
      standardLabel = '1 piece';
    }

    const ratePerBase = opt.price / totalInBase;
    const ratePerStandard = ratePerBase * standardQty;

    return {
      ratePerBase,
      ratePerStandard,
      displayRate: `₹${ratePerStandard.toFixed(2)}`,
      standardLabel,
      totalNetWeight: `${totalInBase >= 1000 && opt.unit !== 'pcs' ? (totalInBase / 1000).toFixed(1) + (opt.unit === 'ml' || opt.unit === 'l' ? 'L' : 'kg') : totalInBase + opt.unit}`,
    };
  };

  const comparison = useMemo(() => {
    const rateA = getNormalizedUnitRate(optA);
    const rateB = getNormalizedUnitRate(optB);
    const rateC = getNormalizedUnitRate(optC);

    const validRates = [
      { id: 'A', name: optA.name, ...rateA, opt: optA },
      { id: 'B', name: optB.name, ...rateB, opt: optB },
      { id: 'C', name: optC.name, ...rateC, opt: optC },
    ].filter((r) => r.ratePerStandard > 0);

    if (validRates.length === 0) return null;

    validRates.sort((a, b) => a.ratePerStandard - b.ratePerStandard);
    const winner = validRates[0];
    const loser = validRates[validRates.length - 1];

    const percentageSavings =
      loser.ratePerStandard > 0
        ? Math.round(((loser.ratePerStandard - winner.ratePerStandard) / loser.ratePerStandard) * 100)
        : 0;

    // Detect "Bulk Pack Trap" (e.g. Option B is bulk pack but costs more per unit than Option A)
    const isBulkTrap =
      optB.quantity > optA.quantity && rateB.ratePerStandard > rateA.ratePerStandard && rateA.ratePerStandard > 0;

    return {
      winner,
      loser,
      percentageSavings,
      isBulkTrap,
      rates: { A: rateA, B: rateB, C: rateC },
    };
  }, [optA, optB, optC]);

  // Shrinkflation Analysis
  const shrinkflationAnalysis = useMemo(() => {
    if (oldWeight <= 0 || newWeight <= 0 || oldPrice <= 0 || newPrice <= 0) return null;

    const oldRatePerGram = oldPrice / oldWeight;
    const newRatePerGram = newPrice / newWeight;

    const priceChangePct = ((newPrice - oldPrice) / oldPrice) * 100;
    const weightReductionPct = ((oldWeight - newWeight) / oldWeight) * 100;
    const trueHiddenPriceHike = ((newRatePerGram - oldRatePerGram) / oldRatePerGram) * 100;

    return {
      oldRatePerGram,
      newRatePerGram,
      priceChangePct: Math.round(priceChangePct * 10) / 10,
      weightReductionPct: Math.round(weightReductionPct * 10) / 10,
      trueHiddenPriceHike: Math.round(trueHiddenPriceHike * 10) / 10,
    };
  }, [oldWeight, newWeight, oldPrice, newPrice]);

  return (
    <div className="w-full bg-white dark:bg-[#0D1527] rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-sm p-5 md:p-7 text-slate-800 dark:text-[#F8FAFC]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">⚖️</span>
            <h3 className="font-heading font-extrabold text-lg sm:text-xl text-slate-900 dark:text-[#F1F5F9] tracking-tight">
              Grocery Unit Price &amp; Shrinkflation Analyzer
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              SMART FMCG
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Compare Blinkit, Zepto, Swiggy Instamart &amp; Amazon Fresh pack sizes to find the true cheapest cost per 100g / 1kg.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#111C33] p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('compare')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'compare' ? 'bg-white dark:bg-[#0D1527] text-slate-900 dark:text-[#F1F5F9] shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:text-[#F8FAFC]'
            }`}
          >
            Pack Comparison
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('shrinkflation')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'shrinkflation' ? 'bg-white dark:bg-[#0D1527] text-slate-900 dark:text-[#F1F5F9] shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:text-[#F8FAFC]'
            }`}
          >
            Shrinkflation Detective
          </button>
        </div>
      </div>

      {activeTab === 'compare' ? (
        <div className="pt-5 flex flex-col gap-6">
          {/* Winner Banner */}
          {comparison && (
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              comparison.isBulkTrap
                ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{comparison.isBulkTrap ? '⚠️' : '🏆'}</span>
                <div>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <span>Best Value: Option {comparison.winner.id} ({comparison.winner.name})</span>
                    <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded-full bg-white dark:bg-[#0D1527] border border-current shadow-2xs">
                      {comparison.percentageSavings}% CHEAPER
                    </span>
                  </div>
                  <p className="text-xs opacity-80 mt-0.5">
                    {comparison.isBulkTrap
                      ? 'Bulk Pack Trap Detected! The smaller pack has a cheaper per-unit cost than the family pack.'
                      : `Option ${comparison.winner.id} costs only ${comparison.winner.displayRate} per ${comparison.winner.standardLabel} vs ${comparison.loser.displayRate} for Option ${comparison.loser.id}.`}
                  </p>
                </div>
              </div>

              <div className="text-right sm:self-auto self-end font-mono">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">True Unit Rate</span>
                <span className="text-lg font-black text-slate-900 dark:text-[#F1F5F9]">{comparison.winner.displayRate}</span>
                <span className="text-[10px] text-slate-500"> / {comparison.winner.standardLabel}</span>
              </div>
            </div>
          )}

          {/* 3 Option Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Option A', opt: optA, setter: setOptA, rate: comparison?.rates.A },
              { label: 'Option B', opt: optB, setter: setOptB, rate: comparison?.rates.B },
              { label: 'Option C', opt: optC, setter: setOptC, rate: comparison?.rates.C },
            ].map(({ label, opt, setter, rate }) => {
              const isWinner = comparison?.winner.id === label.replace('Option ', '');
              return (
                <div
                  key={opt.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isWinner
                      ? 'bg-emerald-50/30 border-emerald-400 ring-2 ring-emerald-400/20'
                      : 'bg-slate-50/50 dark:bg-[#070A11]/50 border-slate-200 dark:border-white/10'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200">
                        {label}
                      </span>
                      {isWinner && (
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                          WINNER
                        </span>
                      )}
                    </div>

                    <input
                      type="text"
                      value={opt.name}
                      onChange={(e) => setter({ ...opt, name: e.target.value })}
                      className="w-full text-xs font-bold text-slate-900 dark:text-[#F1F5F9] bg-transparent border-0 border-b border-slate-200 dark:border-white/10 pb-1 mb-3 focus:outline-none focus:border-blue-500"
                    />

                    {/* Inputs */}
                    <div className="flex flex-col gap-2.5">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Price in ₹
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-2 text-xs text-slate-400 font-bold">₹</span>
                          <input
                            type="number"
                            min="1"
                            value={opt.price || ''}
                            onChange={(e) => setter({ ...opt, price: Number(e.target.value) })}
                            className="w-full h-8 pl-6 pr-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1527] text-xs font-mono font-bold text-slate-800 dark:text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Net Qty
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={opt.quantity || ''}
                            onChange={(e) => setter({ ...opt, quantity: Number(e.target.value) })}
                            className="w-full h-8 px-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1527] text-xs font-mono font-bold text-slate-800 dark:text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Unit
                          </label>
                          <select
                            value={opt.unit}
                            onChange={(e) => setter({ ...opt, unit: e.target.value as UnitType })}
                            className="w-full h-8 px-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1527] text-xs font-medium text-slate-800 dark:text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="g">Grams (g)</option>
                            <option value="kg">Kilograms (kg)</option>
                            <option value="ml">Milliliters (ml)</option>
                            <option value="l">Liters (L)</option>
                            <option value="pcs">Pieces (pcs)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Number of Packs (Multi-pack)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="24"
                          value={opt.packCount || 1}
                          onChange={(e) => setter({ ...opt, packCount: Math.max(1, Number(e.target.value)) })}
                          className="w-full h-8 px-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1527] text-xs font-mono text-slate-800 dark:text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Calculated Rate Box */}
                  <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0D1527] p-2.5 rounded-xl border">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                      Effective Unit Price
                    </span>
                    <div className="flex items-baseline justify-between mt-0.5">
                      <span className="text-base font-extrabold font-mono text-slate-900 dark:text-[#F1F5F9]">
                        {rate?.displayRate || '₹0'}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        per {rate?.standardLabel}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block mt-1">
                      Total net: {rate?.totalNetWeight}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Shrinkflation Detective View */
        <div className="pt-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-amber-900 text-xs">
              <span className="font-bold">What is Shrinkflation?</span> Brands quietly reduce package weight (e.g. 100g biscuits down to 82g) while keeping the ₹10 sticker price identical. This is a stealth price increase!
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Old Packaging */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#070A11]/50">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-3">📦 Old / Original Pack</span>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Old Weight (g / ml)
                    </label>
                    <input
                      type="number"
                      value={oldWeight}
                      onChange={(e) => setOldWeight(Number(e.target.value))}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1527] text-xs font-mono font-bold text-slate-900 dark:text-[#F1F5F9]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Old Price (₹)
                    </label>
                    <input
                      type="number"
                      value={oldPrice}
                      onChange={(e) => setOldPrice(Number(e.target.value))}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1527] text-xs font-mono font-bold text-slate-900 dark:text-[#F1F5F9]"
                    />
                  </div>
                </div>
              </div>

              {/* New Packaging */}
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/30">
                <span className="text-xs font-bold text-rose-800 block mb-3">🔍 New / Downsized Pack</span>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      New Weight (g / ml)
                    </label>
                    <input
                      type="number"
                      value={newWeight}
                      onChange={(e) => setNewWeight(Number(e.target.value))}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1527] text-xs font-mono font-bold text-rose-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      New Price (₹)
                    </label>
                    <input
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(Number(e.target.value))}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1527] text-xs font-mono font-bold text-rose-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shrinkflation Verdict */}
          <div className="lg:col-span-5 bg-slate-50 dark:bg-[#070A11] rounded-2xl border border-slate-200 dark:border-white/10 p-5 flex flex-col justify-between">
            {shrinkflationAnalysis ? (
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider block mb-1">
                  Hidden Price Hike
                </span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-heading font-black tracking-tight ${
                    shrinkflationAnalysis.trueHiddenPriceHike > 0 ? 'text-rose-600' : 'text-emerald-600'
                  }`}>
                    {shrinkflationAnalysis.trueHiddenPriceHike > 0 ? '+' : ''}
                    {shrinkflationAnalysis.trueHiddenPriceHike}%
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">effective increase</span>
                </div>

                <div className="mt-5 space-y-2 text-xs border-t border-slate-200 dark:border-white/10 pt-4">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Weight Reduction</span>
                    <span className="font-mono font-bold text-rose-600">
                      -{shrinkflationAnalysis.weightReductionPct}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Sticker Price Change</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-[#F1F5F9]">
                      {shrinkflationAnalysis.priceChangePct >= 0 ? '+' : ''}{shrinkflationAnalysis.priceChangePct}%
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-white/10">
                    <span className="text-slate-600 dark:text-slate-400">Old Rate per 100g</span>
                    <span className="font-mono">₹{(shrinkflationAnalysis.oldRatePerGram * 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">New Rate per 100g</span>
                    <span className="font-mono font-bold text-rose-600">₹{(shrinkflationAnalysis.newRatePerGram * 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-5 p-3 rounded-xl bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 text-xs text-slate-500 leading-relaxed">
              💡 <strong>Shopper Tip:</strong> When quick-commerce apps run sales, compare the grammage. A 15% discount on an item that has quietly downsized by 20% is still 5% more expensive than last year&apos;s regular stock.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
