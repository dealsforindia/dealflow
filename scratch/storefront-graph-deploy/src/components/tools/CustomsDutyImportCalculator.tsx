import React, { useState, useMemo } from 'react';

export interface CustomsPreset {
  name: string;
  hsn: string;
  category: string;
  bcdPercent: number; // Basic Customs Duty %
  igstPercent: number; // IGST %
  description: string;
  bisRequired: boolean;
  notes: string;
}

const PRESETS: CustomsPreset[] = [
  {
    name: 'Laptop / Notebook PC',
    hsn: '8471 30 10',
    category: 'Computing',
    bcdPercent: 0, // 0% under WTO Information Technology Agreement (ITA-1)
    igstPercent: 18,
    description: 'Portable computers under 10kg with keyboard & display',
    bisRequired: true,
    notes: '0% Basic Customs Duty under ITA-1. Only 18% IGST + 10% SWS (on BCD = ₹0) applies. Requires BIS registration for commercial import, personal single unit allowed.',
  },
  {
    name: 'Mechanical Keyboards & PC Peripherals',
    hsn: '8471 60 40',
    category: 'Computer Peripherals',
    bcdPercent: 7.5,
    igstPercent: 18,
    description: 'Custom mechanical keyboards, keycaps, switches, mice',
    bisRequired: true,
    notes: '7.5% BCD + 10% SWS + 18% IGST. Frequently imported from Epomaker, Keychron, Drop, or AliExpress via freight forwarders.',
  },
  {
    name: 'Smartphones & Handsets',
    hsn: '8517 13 00',
    category: 'Mobile Devices',
    bcdPercent: 20, // Reduced to 15% in Union Budget 2024, but 20% on certain CBU models
    igstPercent: 18,
    description: 'Cellular mobile smartphones and cellular phones',
    bisRequired: true,
    notes: 'Union Budget 2024 reduced BCD on mobile phones and PCBA to 15%. Combined with SWS & 18% IGST, effective landing duty is ~37.4%.',
  },
  {
    name: 'Audiophile Headphones / IEMs',
    hsn: '8518 30 00',
    category: 'Audio',
    bcdPercent: 15,
    igstPercent: 18,
    description: 'In-ear monitors, studio headphones, DACs, amplifiers',
    bisRequired: false,
    notes: '15% BCD + 1.5% SWS + 18% IGST on (CIF + BCD + SWS). Effective duty rate is ~37.4%. DACs may attract 7.5-10% depending on tariff line.',
  },
  {
    name: 'Smartwatches & Fitness Bands',
    hsn: '8517 62 90',
    category: 'Wearables',
    bcdPercent: 20,
    igstPercent: 18,
    description: 'Wrist-worn smart bands and connected smartwatches',
    bisRequired: true,
    notes: '20% BCD + 2% SWS + 18% IGST. Effective duty ~43.9%. Requires WPC ETA approval if imported commercially for wireless transmission.',
  },
  {
    name: 'Camera Lenses & Optical Parts',
    hsn: '9002 11 00',
    category: 'Photography',
    bcdPercent: 10,
    igstPercent: 18,
    description: 'Interchangeable camera lenses for DSLR / Mirrorless',
    bisRequired: false,
    notes: '10% BCD + 10% SWS + 18% IGST. Effective duty rate ~30.98%.',
  },
  {
    name: 'Printed Books & Periodicals',
    hsn: '4901 10 10',
    category: 'Literature',
    bcdPercent: 0,
    igstPercent: 0, // Exempt
    description: 'Printed books, textbooks, educational literature',
    bisRequired: false,
    notes: 'Completely exempt from BCD and IGST (0%). Only nominal postal handling / examination fee applies.',
  },
  {
    name: 'Designer Perfumes & Fragrances',
    hsn: '3303 00 10',
    category: 'Luxury & Beauty',
    bcdPercent: 20,
    igstPercent: 28, // Highest GST slab for luxury cosmetics
    description: 'Perfumes and toilet waters',
    bisRequired: false,
    notes: '20% BCD + 10% SWS (2%) + 28% IGST on CIF+BCD+SWS. Effective duty rate is ~56.16%. Highest tax bracket.',
  },
  {
    name: 'Wristwatches (Mechanical / Quartz)',
    hsn: '9102 11 00',
    category: 'Watches',
    bcdPercent: 20,
    igstPercent: 18,
    description: 'Analog, automatic, and quartz wristwatches',
    bisRequired: false,
    notes: '20% BCD + 10% SWS + 18% IGST. Effective duty is ~43.96% on assessed CIF.',
  },
];

interface CurrencyRate {
  code: string;
  symbol: string;
  name: string;
  rateToInr: number; // Approximate CBIC exchange rate
}

const CURRENCIES: CurrencyRate[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rateToInr: 86.5 },
  { code: 'EUR', symbol: '€', name: 'Euro', rateToInr: 92.0 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rateToInr: 110.5 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateToInr: 0.58 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateToInr: 1.0 },
];

export const CustomsDutyImportCalculator: React.FC = () => {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [foreignItemPrice, setForeignItemPrice] = useState<number>(499);
  const [foreignShippingCost, setForeignShippingCost] = useState<number>(35);
  const [isInsuranceKnown, setIsInsuranceKnown] = useState<boolean>(false);
  const [foreignInsuranceCost, setForeignInsuranceCost] = useState<number>(0);

  // Custom overrides
  const [useCustomRates, setUseCustomRates] = useState<boolean>(false);
  const [customBcd, setCustomBcd] = useState<number>(0);
  const [customIgst, setCustomIgst] = useState<number>(18);
  const [customHsn, setCustomHsn] = useState<string>('8471 30 10');

  // Carrier type
  const [carrierType, setCarrierType] = useState<'india_post' | 'courier_dhl_fedex'>('courier_dhl_fedex');
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  const activePreset = PRESETS[selectedPresetIndex];
  const curr = CURRENCIES.find((c) => c.code === selectedCurrency) || CURRENCIES[0];

  const bcdRate = useCustomRates ? customBcd : activePreset.bcdPercent;
  const igstRate = useCustomRates ? customIgst : activePreset.igstPercent;
  const hsnCode = useCustomRates ? customHsn : activePreset.hsn;

  // Valuation Math as per Indian Customs Act, 1962:
  // FOB = Foreign Item Price converted to INR
  // Freight = Shipping cost in INR (capped at 20% of FOB as per Customs Valuation Rules)
  // Insurance = Actual if known, else 1.125% of FOB
  // CIF (Assessable Value) = FOB + Freight + Insurance
  // Basic Customs Duty (BCD) = CIF * (bcdRate / 100)
  // Social Welfare Surcharge (SWS) = BCD * 10% (10% on BCD amount)
  // Total Sub-duty = BCD + SWS
  // Base for IGST = CIF + BCD + SWS
  // IGST = Base for IGST * (igstRate / 100)
  // Total Customs & Taxes = BCD + SWS + IGST
  // Carrier Clearance Fee = ₹100 for India Post, ~₹850 + 18% GST for DHL/FedEx/Aramex (₹1,003)
  // Total Landed Cost = FOB + Actual Shipping in INR + Total Customs & Taxes + Clearance Fee

  const calculation = useMemo(() => {
    const rate = curr.rateToInr;
    const fobInr = Math.max(0, foreignItemPrice * rate);
    const shippingInr = Math.max(0, foreignShippingCost * rate);

    // Rule: Freight for assessable value capped at 20% of FOB
    const freightForCustoms = Math.min(shippingInr, fobInr * 0.2);

    // Insurance: 1.125% of FOB if unknown
    const insuranceInr = isInsuranceKnown
      ? Math.max(0, foreignInsuranceCost * rate)
      : fobInr * 0.01125;

    // CIF (Assessable Value)
    const cifAssessableValue = fobInr + freightForCustoms + insuranceInr;

    // BCD
    const bcdAmount = cifAssessableValue * (bcdRate / 100);

    // SWS (10% of BCD)
    const swsAmount = bcdAmount * 0.1;

    // IGST Base
    const igstBase = cifAssessableValue + bcdAmount + swsAmount;
    const igstAmount = igstBase * (igstRate / 100);

    // Total Customs & Duties
    const totalGovernmentDuty = bcdAmount + swsAmount + igstAmount;

    // Carrier Fee
    const carrierFee = carrierType === 'india_post' ? 100 : 850 * 1.18; // 850 + 18% GST = 1003

    // Final Landed Cost
    const totalLandedCostInr = fobInr + shippingInr + totalGovernmentDuty + carrierFee;
    const effectiveDutyRateOnFob = fobInr > 0 ? (totalGovernmentDuty / fobInr) * 100 : 0;
    const extraOverRetailPrice = totalLandedCostInr - fobInr;

    return {
      fobInr,
      shippingInr,
      freightForCustoms,
      insuranceInr,
      cifAssessableValue,
      bcdAmount,
      swsAmount,
      igstBase,
      igstAmount,
      totalGovernmentDuty,
      carrierFee,
      totalLandedCostInr,
      effectiveDutyRateOnFob,
      extraOverRetailPrice,
    };
  }, [
    foreignItemPrice,
    foreignShippingCost,
    foreignInsuranceCost,
    isInsuranceKnown,
    curr.rateToInr,
    bcdRate,
    igstRate,
    carrierType,
  ]);

  const handleCopySummary = () => {
    const text = `=== INDIAN CUSTOMS DUTY & IMPORT TAX BREAKDOWN ===
Item: ${activePreset.name} (HSN: ${hsnCode})
Original Price: ${curr.symbol}${foreignItemPrice} (${curr.code}) = ₹${Math.round(calculation.fobInr).toLocaleString('en-IN')}
Shipping: ${curr.symbol}${foreignShippingCost} = ₹${Math.round(calculation.shippingInr).toLocaleString('en-IN')}
Assessable Value (CIF): ₹${Math.round(calculation.cifAssessableValue).toLocaleString('en-IN')}
--------------------------------------------------
1. Basic Customs Duty (${bcdRate}%): ₹${Math.round(calculation.bcdAmount).toLocaleString('en-IN')}
2. Social Welfare Surcharge (10% of BCD): ₹${Math.round(calculation.swsAmount).toLocaleString('en-IN')}
3. IGST (${igstRate}% on CIF + Duties): ₹${Math.round(calculation.igstAmount).toLocaleString('en-IN')}
Total Gov Taxes & Customs: ₹${Math.round(calculation.totalGovernmentDuty).toLocaleString('en-IN')}
Carrier Clearance Fee (${carrierType === 'india_post' ? 'India Post' : 'Express Courier'}): ₹${Math.round(calculation.carrierFee).toLocaleString('en-IN')}
--------------------------------------------------
TOTAL LANDED COST IN INDIA: ₹${Math.round(calculation.totalLandedCostInr).toLocaleString('en-IN')}
Effective Duty on Item: ${calculation.effectiveDutyRateOnFob.toFixed(1)}%
Generated via IndiaDealHunts Customs & Import Lab`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white dark:bg-[#0D1527] p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛃</span>
              <h3 className="font-heading font-black text-lg text-slate-900 dark:text-[#F1F5F9] tracking-tight">
                Cross-Border Tech Import &amp; Customs Duty Sentinel
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                CBIC TARIFF 2024-25
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-2xl">
              Buying mechanical keyboards, laptops, IEMs, or electronics from AliExpress, Epomaker, Drop, or Amazon US?
              Compute exact Basic Customs Duty (BCD), 10% Social Welfare Surcharge, IGST, and courier clearance fees before shipping.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white cursor-pointer shadow-xs active:scale-95"
            >
              <span>{copiedSummary ? '✓ Copied' : '📋 Copy Customs Memo'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preset Selector Grid */}
      <div className="bg-white dark:bg-[#0D1527] p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Product Category (Official HSN Slabs)
            </span>
          </div>
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={useCustomRates}
              onChange={(e) => setUseCustomRates(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Custom HSN &amp; Duty Rates</span>
          </label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {PRESETS.map((preset, idx) => {
            const isSelected = !useCustomRates && selectedPresetIndex === idx;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  setSelectedPresetIndex(idx);
                  setUseCustomRates(false);
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:border-white/20 hover:bg-slate-50 dark:bg-[#070A11]'
                }`}
              >
                <div>
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                    {preset.category}
                  </div>
                  <div className="font-bold text-xs text-slate-800 dark:text-[#F8FAFC] line-clamp-1 mt-0.5">
                    {preset.name}
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-slate-500">BCD {preset.bcdPercent}%</span>
                  <span className="font-mono font-bold text-indigo-700">IGST {preset.igstPercent}%</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Preset Details Note */}
        {!useCustomRates && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200/80 dark:border-white/10 flex items-start gap-3 text-xs">
            <span className="text-base mt-0.5">📌</span>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 dark:text-[#F8FAFC]">{activePreset.name}</span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400">
                  HSN {activePreset.hsn}
                </span>
                {activePreset.bisRequired && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 font-semibold">
                    ⚠️ BIS Certification Mandatory
                  </span>
                )}
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11.5px]">
                {activePreset.notes}
              </p>
            </div>
          </div>
        )}

        {/* Custom Overrides Form if active */}
        {useCustomRates && (
          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-3">
            <div className="font-bold text-xs text-indigo-900">Custom Tariff &amp; HSN Override</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">HSN Tariff Code</label>
                <input
                  type="text"
                  value={customHsn}
                  onChange={(e) => setCustomHsn(e.target.value)}
                  placeholder="e.g. 8471 30 10"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-white/20 text-xs font-mono bg-white dark:bg-[#0D1527]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Basic Customs Duty (BCD %)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={customBcd}
                  onChange={(e) => setCustomBcd(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-white/20 text-xs font-mono bg-white dark:bg-[#0D1527]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">IGST Rate (%)</label>
                <select
                  value={customIgst}
                  onChange={(e) => setCustomIgst(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-white/20 text-xs font-mono bg-white dark:bg-[#0D1527]"
                >
                  <option value={0}>0% (Books / Exempt)</option>
                  <option value={5}>5% (Concessional)</option>
                  <option value={12}>12% (Standard Low)</option>
                  <option value={18}>18% (Standard Electronics)</option>
                  <option value={28}>28% (Luxury / Cosmetics / Gaming)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Inputs & Calculation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Inputs */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-[#0D1527] p-5 rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-xs space-y-4">
            <div className="font-bold text-sm text-slate-800 dark:text-[#F8FAFC] flex items-center gap-2">
              <span>💵</span>
              <span>Purchase Price &amp; Currency</span>
            </div>

            {/* Currency Picker */}
            <div className="grid grid-cols-5 gap-1.5">
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setSelectedCurrency(c.code)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                    selectedCurrency === c.code
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-[#111C33]'
                  }`}
                >
                  {c.symbol} {c.code}
                </button>
              ))}
            </div>

            {/* Foreign Price */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                <span>Item Price ({curr.code})</span>
                <span className="font-mono text-indigo-700 font-extrabold text-sm">
                  {curr.symbol} {foreignItemPrice.toLocaleString()} (≈ ₹{Math.round(calculation.fobInr).toLocaleString('en-IN')})
                </span>
              </div>
              <input
                type="number"
                min="1"
                step="any"
                value={foreignItemPrice}
                onChange={(e) => setForeignItemPrice(Math.max(0, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 font-mono text-sm bg-slate-50/50 dark:bg-[#070A11]/50 focus:bg-white dark:bg-[#0D1527] focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Foreign Shipping */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                <span>International Shipping / Freight ({curr.code})</span>
                <span className="font-mono text-slate-600 dark:text-slate-400 text-xs">
                  {curr.symbol} {foreignShippingCost} (≈ ₹{Math.round(calculation.shippingInr).toLocaleString('en-IN')})
                </span>
              </div>
              <input
                type="number"
                min="0"
                step="any"
                value={foreignShippingCost}
                onChange={(e) => setForeignShippingCost(Math.max(0, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 font-mono text-sm bg-slate-50/50 dark:bg-[#070A11]/50 focus:bg-white dark:bg-[#0D1527] focus:border-indigo-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Indian Customs caps assessable freight at 20% of FOB value if actual freight is disproportionate.
              </p>
            </div>

            {/* Insurance Checkbox */}
            <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-2">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInsuranceKnown}
                  onChange={(e) => setIsInsuranceKnown(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>I have an official insurance invoice (otherwise default 1.125% applies)</span>
              </label>

              {isInsuranceKnown && (
                <div>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={foreignInsuranceCost}
                    onChange={(e) => setForeignInsuranceCost(Math.max(0, Number(e.target.value)))}
                    placeholder={`Insurance in ${curr.code}`}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 font-mono text-xs bg-slate-50/50 dark:bg-[#070A11]/50"
                  />
                </div>
              )}
            </div>

            {/* Shipping Carrier Type */}
            <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                Shipping Carrier / Delivery Channel
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCarrierType('courier_dhl_fedex')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    carrierType === 'courier_dhl_fedex'
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:bg-[#070A11]'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-800 dark:text-[#F8FAFC]">DHL / FedEx / UPS</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Express courier handling (₹850 + 18% GST)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCarrierType('india_post')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    carrierType === 'india_post'
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:bg-[#070A11]'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-800 dark:text-[#F8FAFC]">India Post (EMS)</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">SpeedPost postal presentation (₹100 flat)</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form: Complete Itemized Ledger */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="text-xs uppercase tracking-wider font-mono text-indigo-400 font-bold">
                  Final Landed Cost in India
                </div>
                <div className="text-2xl sm:text-3xl font-heading font-black tracking-tight mt-0.5 text-white">
                  ₹{Math.round(calculation.totalLandedCostInr).toLocaleString('en-IN')}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                  +{calculation.effectiveDutyRateOnFob.toFixed(1)}% Tax Impact
                </span>
                <div className="text-[11px] text-slate-400 font-mono mt-1">
                  Extra ₹{Math.round(calculation.extraOverRetailPrice).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Step-by-Step Indian Customs Math */}
            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">1. FOB Item Cost:</span>
                <span>₹{Math.round(calculation.fobInr).toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">2. Freight for Assessment:</span>
                <span>₹{Math.round(calculation.freightForCustoms).toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">3. Notional Insurance (1.125%):</span>
                <span>₹{Math.round(calculation.insuranceInr).toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between items-center text-indigo-300 font-bold pt-1 border-t border-slate-800">
                <span>Assessable CIF Value:</span>
                <span>₹{Math.round(calculation.cifAssessableValue).toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">4. Basic Customs Duty ({bcdRate}%):</span>
                <span>₹{Math.round(calculation.bcdAmount).toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">5. Social Welfare Surcharge (10% on BCD):</span>
                <span>₹{Math.round(calculation.swsAmount).toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">6. IGST ({igstRate}% on CIF + Duties):</span>
                <span>₹{Math.round(calculation.igstAmount).toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between items-center text-amber-300 font-bold pt-1 border-t border-slate-800">
                <span>Total Customs Duty &amp; Taxes:</span>
                <span>₹{Math.round(calculation.totalGovernmentDuty).toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between items-center text-slate-400 text-[11px]">
                <span>7. Carrier Clearance / Documentation Fee:</span>
                <span>₹{Math.round(calculation.carrierFee).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Verdict Box */}
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs space-y-1">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <span>💡</span>
                <span>Import Reality Check</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {calculation.effectiveDutyRateOnFob < 25
                  ? 'Favorable tax slab. Products like laptops (0% BCD) carry minimal customs duty, making international purchases cost-effective.'
                  : calculation.effectiveDutyRateOnFob < 45
                  ? 'Standard electronics import overhead (~35-44%). Check if local Indian warranty is supported before buying.'
                  : 'High-tariff luxury or cosmetic bracket (>50%). Consider waiting for official Indian distributors or festive discounts.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pro Tips & Legal Safeguards */}
      <div className="bg-amber-50/60 border border-amber-200/80 p-5 rounded-2xl text-xs space-y-2 text-amber-900">
        <div className="font-bold flex items-center gap-2">
          <span>⚖️</span>
          <span>Important Indian Customs Regulations &amp; Personal Import Exemptions</span>
        </div>
        <ul className="space-y-1.5 text-[11.5px] text-amber-800/90 list-disc list-inside">
          <li>
            <strong>Gift Exemption Abolished:</strong> The ₹5,000 duty-free gift exemption was officially withdrawn via Customs Notification No. 50/2017. All parcels labeled as gifts now attract standard commercial tariff rates.
          </li>
          <li>
            <strong>KYC &amp; ID Proof:</strong> Express couriers (DHL/FedEx) will withhold delivery until you upload your Indian Passport, Aadhaar, or Voter ID to their KYC portal.
          </li>
          <li>
            <strong>BIS Compulsory Registration Scheme (CRS):</strong> Electronics with batteries, power adapters, or wireless modules (smartphones, laptops, smartwatches) must adhere to BIS norms. Personal imports of 1 unit for individual use are generally permitted under customs discretion.
          </li>
          <li>
            <strong>Wireless / Drone Restrictions:</strong> Drones and high-power radio transmitters require prior WPC (Wireless Planning &amp; Coordination) ETA licenses or DGCA import permits.
          </li>
        </ul>
      </div>
    </div>
  );
};
