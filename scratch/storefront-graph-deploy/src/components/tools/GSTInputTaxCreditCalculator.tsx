import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';

interface HSNCategoryPreset {
  id: string;
  name: string;
  hsn: string;
  rate: number;
  icon: string;
  sampleItems: string;
}

const HSN_PRESETS: HSNCategoryPreset[] = [
  {
    id: 'laptops',
    name: 'Laptops, Desktops & Computer Hardware',
    hsn: '8471',
    rate: 18,
    icon: '💻',
    sampleItems: 'MacBook, Dell XPS, ThinkPad, SSDs, RAM, Keyboards',
  },
  {
    id: 'phones',
    name: 'Smartphones & Mobile Accessories',
    hsn: '8517',
    rate: 18,
    icon: '📱',
    sampleItems: 'iPhone, Galaxy S24, OnePlus, Fast Chargers, Cables',
  },
  {
    id: 'monitors',
    name: 'Monitors, Displays & Projectors',
    hsn: '8528',
    rate: 18,
    icon: '🖥️',
    sampleItems: '4K Monitors, Ultrawide Displays, ViewSonic Projectors',
  },
  {
    id: 'furniture',
    name: 'Ergonomic Office Chairs & Work Desks',
    hsn: '9403',
    rate: 18,
    icon: '🪑',
    sampleItems: 'Featherlite, Green Soul Chairs, Standing Desks',
  },
  {
    id: 'appliances_heavy',
    name: 'Commercial Air Conditioners & Heavy Electronics',
    hsn: '8415',
    rate: 28,
    icon: '❄️',
    sampleItems: 'Inverter Split ACs, Commercial Chillers (28% GST)',
  },
  {
    id: 'apparel_high',
    name: 'Business Attire & Branded Apparel (> ₹1,000)',
    hsn: '6205',
    rate: 12,
    icon: '👔',
    sampleItems: 'Blazers, Formal Shirts, Corporate Uniforms',
  },
  {
    id: 'pantry',
    name: 'Office Pantry & Packaged Refreshments',
    hsn: '2101',
    rate: 12,
    icon: '☕',
    sampleItems: 'Coffee Beans, Green Tea, Biscuits, Mineral Water',
  },
];

export const GSTInputTaxCreditCalculator: React.FC = () => {
  const [invoiceAmount, setInvoiceAmount] = useState<number>(64999);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('laptops');
  const [customRate, setCustomRate] = useState<number>(0);
  const [isCustomRate, setIsCustomRate] = useState<boolean>(true);
  const [isInterState, setIsInterState] = useState<boolean>(true); // IGST vs CGST+SGST
  const [businessType, setBusinessType] = useState<'individual' | 'corporate'>('corporate');
  const [taxSlab, setTaxSlab] = useState<number>(25); // 25% or 30% corporate income tax
  const [claimDepreciation, setClaimDepreciation] = useState<boolean>(false);
  const [eligibleItc, setEligibleItc] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  const selectedPreset = HSN_PRESETS.find((p) => p.id === selectedPresetId) || HSN_PRESETS[0];
  const effectiveGstRate = isCustomRate ? customRate : selectedPreset.rate;

  // Real Indian GST Math
  const breakdown = useMemo(() => {
    const total = Math.max(0, invoiceAmount);
    const rateDecimal = effectiveGstRate / 100;
    
    // In e-commerce, the listed price is inclusive of GST
    const basePrice = total / (1 + rateDecimal);
    const totalGst = total - basePrice;
    
    const igst = isInterState ? totalGst : 0;
    const cgst = isInterState ? 0 : totalGst / 2;
    const sgst = isInterState ? 0 : totalGst / 2;

    // ITC Savings (Direct refund / tax liability offset)
    const itcSavings = eligibleItc ? totalGst : 0;

    // Income tax depreciation benefit on the Base Price (Asset Cost)
    // Section 32 allows 40% depreciation on computers, 15% on general plant
    const depRate = selectedPresetId === 'laptops' || selectedPresetId === 'monitors' ? 0.40 : 0.15;
    const year1Depreciation = claimDepreciation ? basePrice * depRate : 0;
    const incomeTaxSaving = claimDepreciation ? year1Depreciation * (taxSlab / 100) : 0;

    const netEffectiveOutflow = total - itcSavings - incomeTaxSaving;
    const totalSavingsRupees = total - netEffectiveOutflow;
    const totalSavingsPercent = total > 0 ? (totalSavingsRupees / total) * 100 : 0;

    return {
      total,
      basePrice: Math.round(basePrice),
      totalGst: Math.round(totalGst),
      igst: Math.round(igst),
      cgst: Math.round(cgst),
      sgst: Math.round(sgst),
      itcSavings: Math.round(itcSavings),
      depRatePercent: depRate * 100,
      year1Depreciation: Math.round(year1Depreciation),
      incomeTaxSaving: Math.round(incomeTaxSaving),
      netEffectiveOutflow: Math.round(netEffectiveOutflow),
      totalSavingsRupees: Math.round(totalSavingsRupees),
      totalSavingsPercent: Math.round(totalSavingsPercent * 10) / 10,
    };
  }, [invoiceAmount, effectiveGstRate, isInterState, selectedPresetId, claimDepreciation, taxSlab, eligibleItc]);

  const handleCopySummary = () => {
    const text = `GST INPUT TAX CREDIT BREAKDOWN (INDIA)
Product / Category: ${selectedPreset.name} (HSN ${selectedPreset.hsn})
Retail / Listed Invoice Price: ₹${breakdown.total.toLocaleString('en-IN')} (Inclusive of ${effectiveGstRate}% GST)
Base Asset Price (Pre-Tax): ₹${breakdown.basePrice.toLocaleString('en-IN')}
Total GST to Claim via GSTR-3B: ₹${breakdown.totalGst.toLocaleString('en-IN')} (${isInterState ? `IGST ₹${breakdown.igst.toLocaleString('en-IN')}` : `CGST ₹${breakdown.cgst.toLocaleString('en-IN')} + SGST ₹${breakdown.sgst.toLocaleString('en-IN')}`})
Year-1 Income Tax Depreciation Saving (${breakdown.depRatePercent}% rate @ ${taxSlab}% slab): ₹${breakdown.incomeTaxSaving.toLocaleString('en-IN')}
--------------------------------------------------
FINAL NET EFFECTIVE COST TO BUSINESS: ₹${breakdown.netEffectiveOutflow.toLocaleString('en-IN')}
TOTAL COMBINED TAX BENEFIT: ₹${breakdown.totalSavingsRupees.toLocaleString('en-IN')} (${breakdown.totalSavingsPercent}% Total Savings)
Generated via IndiaDealHunts GST Engine`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Tool Header Banner */}
      <div className="bg-white dark:bg-[#0D1527] rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🧾</span>
            <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 dark:text-[#F1F5F9] m-0">
              GST Business Invoice &amp; Input Tax Credit (ITC) Engine
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              PLANNING SCENARIO
            </span>
          </div>
          <p className="text-xs text-slate-500 m-0 leading-relaxed">
            Calculate your true post-tax cost when buying electronics and office gear on Amazon Business, Flipkart Wholesale, or Croma with your GSTIN.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopySummary}
          className="self-start md:self-center px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <span>{copiedSummary ? '✓ Copied Summary' : '📋 Copy CA Breakdown'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Config Column */}
        <div className="lg:col-span-6 space-y-5">
          {/* 1. Listed Price Input */}
          <div className="bg-white dark:bg-[#0D1527] rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
            <label className="block">
              <span className="text-xs font-mono uppercase font-bold text-slate-500">
                Item Listed Price on Store (Inclusive of GST)
              </span>
              <div className="relative mt-2">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono text-base">
                  ₹
                </span>
                <input
                  type="number"
                  min="100"
                  step="500"
                  value={invoiceAmount || ''}
                  onChange={(e) => setInvoiceAmount(Number(e.target.value))}
                  placeholder="e.g. 64999"
                  className="w-full h-11 pl-9 pr-4 rounded-xl border border-slate-300 dark:border-white/20 text-base font-mono font-bold text-slate-900 dark:text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>
            </label>

            {/* Quick Price Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {[19999, 39999, 64999, 89999, 124999].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setInvoiceAmount(amt)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer border ${
                    invoiceAmount === amt
                      ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                      : 'bg-slate-50 dark:bg-[#070A11] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:bg-[#111C33]'
                  }`}
                >
                  ₹{amt.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>

          {/* 2. HSN Category Slabs */}
          <div className="bg-white dark:bg-[#0D1527] rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase font-bold text-slate-500">
                Select HSN Product Category
              </span>
              <button
                type="button"
                onClick={() => setIsCustomRate(!isCustomRate)}
                className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                {isCustomRate ? 'Example HSN presets' : 'Custom GST %'}
              </button>
            </div>

            {isCustomRate ? (
              <div className="pt-1">
                <div className="flex items-center gap-3">
                  {[5, 12, 18, 28].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setCustomRate(rate)}
                      className={`flex-1 py-2.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                        customRate === rate
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-[#070A11] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:bg-[#111C33]'
                      }`}
                    >
                      {rate}% GST
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {HSN_PRESETS.map((preset) => {
                  const isSelected = preset.id === selectedPresetId;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedPresetId(preset.id)}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/80 border-blue-300 shadow-2xs'
                          : 'bg-white dark:bg-[#0D1527] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:border-white/20'
                      }`}
                    >
                      <span className="text-lg mt-0.5">{preset.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-[#F1F5F9] truncate">
                            {preset.name}
                          </span>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#111C33] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 shrink-0">
                            {preset.rate}% example rate
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono block truncate mt-0.5">
                          HSN {preset.hsn} • {preset.sampleItems}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Business Context & Tax Parameters */}
          <div className="bg-white dark:bg-[#0D1527] rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
            <span className="text-xs font-mono uppercase font-bold text-slate-500 block">
              Business &amp; Tax Configuration
            </span>

            {/* Interstate vs Intrastate */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsInterState(true)}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                  isInterState
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 dark:bg-[#070A11] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:bg-[#111C33]'
                }`}
              >
                Inter-State (IGST 100%)
              </button>
              <button
                type="button"
                onClick={() => setIsInterState(false)}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                  !isInterState
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 dark:bg-[#070A11] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:bg-[#111C33]'
                }`}
              >
                Intra-State (CGST + SGST)
              </button>
            </div>

            {/* Income Tax Depreciation Checkbox */}
            <label className="flex gap-3 items-center p-3 rounded-xl border border-slate-200 dark:border-white/10 text-xs mb-3"><input type="checkbox" checked={eligibleItc} onChange={event => setEligibleItc(event.target.checked)} />I have confirmed eligibility to claim the entered GST as input credit.</label>
            <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
            <div>
                <span className="text-xs font-bold text-slate-800 dark:text-[#F8FAFC] block">
                  Add Year-1 Income Tax Depreciation (Sec 32)
                </span>
                <span className="text-[11px] text-slate-500">
                  {breakdown.depRatePercent}% asset write-off against business profits
                </span>
              </div>
              <input
                type="checkbox"
                checked={claimDepreciation}
                onChange={(e) => setClaimDepreciation(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 cursor-pointer"
              />
            </div>

            {claimDepreciation && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-600 dark:text-slate-400">Your Income Tax Slab:</span>
                <div className="flex items-center gap-1.5">
                  {[22, 25, 30].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setTaxSlab(s)}
                      className={`px-2 py-1 rounded-lg text-xs font-mono font-bold border transition-colors cursor-pointer ${
                        taxSlab === s
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-50 dark:bg-[#070A11] text-slate-500 border-slate-200 dark:border-white/10'
                      }`}
                    >
                      {s}%
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Executive Summary Column */}
        <div className="lg:col-span-6 space-y-5">
          {/* Main Hero Cost Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-slate-800">
            <div className="absolute top-0 right-0 w-44 h-44 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  ESTIMATED ECONOMIC COST
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {breakdown.totalSavingsPercent}% TOTAL TAX OFFSET
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-mono font-black tracking-tight text-white">
                    ₹{breakdown.netEffectiveOutflow.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm font-mono text-slate-400 line-through">
                    ₹{breakdown.total.toLocaleString('en-IN')}
                  </span>
                </div>
                <span className="text-xs text-slate-300 font-medium block mt-1">
                  You save a total of{' '}
                  <strong className="text-emerald-400 font-bold">
                    ₹{breakdown.totalSavingsRupees.toLocaleString('en-IN')}
                  </strong>{' '}
                  via GST input credit and year-1 asset depreciation.
                </span>
              </div>

              {/* Progress Savings Bar */}
              <div className="space-y-1.5 pt-2">
                <div className="h-2 w-full bg-slate-700/60 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-400"
                    style={{ width: `${(breakdown.itcSavings / breakdown.total) * 100}%` }}
                    title="GST Input Tax Credit"
                  />
                  {claimDepreciation && (
                    <div
                      className="h-full bg-blue-400"
                      style={{ width: `${(breakdown.incomeTaxSaving / breakdown.total) * 100}%` }}
                      title="Income Tax Depreciation"
                    />
                  )}
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                    GST ITC: ₹{breakdown.itcSavings.toLocaleString('en-IN')}
                  </span>
                  {claimDepreciation && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                      Depreciation: ₹{breakdown.incomeTaxSaving.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown Matrix Table */}
          <div className="bg-white dark:bg-[#0D1527] rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
            <span className="text-xs font-mono uppercase font-bold text-slate-500 block pb-1 border-b border-slate-100 dark:border-white/5">
              Scenario invoice breakdown
            </span>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 text-slate-600 dark:text-slate-400">
                <span>Gross Retail Invoice Amount:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-[#F1F5F9]">
                  ₹{breakdown.total.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 text-slate-600 dark:text-slate-400">
                <span>Base Asset Cost (Tax Exclusive):</span>
                <span className="font-mono font-bold text-slate-800 dark:text-[#F8FAFC]">
                  ₹{breakdown.basePrice.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 text-emerald-700 bg-emerald-50/60 px-2.5 py-1.5 rounded-lg border border-emerald-100 font-medium">
                <span>
                  {isInterState
                    ? `IGST (${effectiveGstRate}%) potential credit:`
                    : `CGST + SGST (${effectiveGstRate}%) potential credit:`}
                </span>
                <span className="font-mono font-extrabold text-emerald-800">
                  - ₹{breakdown.itcSavings.toLocaleString('en-IN')}
                </span>
              </div>

              {claimDepreciation && (
                <div className="flex items-center justify-between py-1 text-blue-700 bg-blue-50/60 px-2.5 py-1.5 rounded-lg border border-blue-100 font-medium">
                  <span>
                    Sec 32 Depreciation Tax Shield ({breakdown.depRatePercent}% @ {taxSlab}%):
                  </span>
                  <span className="font-mono font-extrabold text-blue-800">
                    - ₹{breakdown.incomeTaxSaving.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-slate-900 dark:text-[#F1F5F9] font-bold text-sm">
                <span>Estimated economic cost:</span>
                <span className="font-mono text-base text-blue-700">
                  ₹{breakdown.netEffectiveOutflow.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* CA Advice & Invoicing Checklist */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
              <span>⚠️</span>
              <span>Input Tax Credit Eligibility Criteria (Sec 16):</span>
            </div>
            <ul className="text-[11px] text-amber-800 space-y-1 list-disc pl-4 leading-relaxed">
              <li>Ensure the seller provides a GST Tax Invoice matching your registered GSTIN legal name.</li>
              <li>The seller must upload the invoice in GSTR-1 so it reflects in your monthly GSTR-2B.</li>
              <li>Section 17(5) blocked credits: Motor vehicles (&lt;13 seater) and personal items are ineligible unless used exclusively for business operations.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
