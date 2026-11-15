import React, { useState, useMemo } from 'react';

interface ApplianceProfile {
  id: string;
  name: string;
  icon: string;
  threeStarUnitsPerYear: number;
  fiveStarUnitsPerYear: number;
  defaultThreeStarPrice: number;
  defaultFiveStarPrice: number;
  defaultDailyHours: number;
  seasonDaysPerYear: number;
}

const APPLIANCE_PROFILES: ApplianceProfile[] = [
  {
    id: 'ac_1_5_ton',
    name: '1.5 Ton Inverter Split AC',
    icon: '❄️',
    threeStarUnitsPerYear: 980, // typical ISEER 3.8
    fiveStarUnitsPerYear: 750, // typical ISEER 5.0+
    defaultThreeStarPrice: 33500,
    defaultFiveStarPrice: 41000,
    defaultDailyHours: 8,
    seasonDaysPerYear: 210, // ~7 months of summer/monsoon
  },
  {
    id: 'refrigerator_double_door',
    name: '260L Frost-Free Refrigerator',
    icon: '🧊',
    threeStarUnitsPerYear: 245,
    fiveStarUnitsPerYear: 180,
    defaultThreeStarPrice: 24000,
    defaultFiveStarPrice: 29500,
    defaultDailyHours: 24,
    seasonDaysPerYear: 365,
  },
  {
    id: 'storage_geyser_25l',
    name: '25L Storage Water Geyser',
    icon: '♨️',
    threeStarUnitsPerYear: 480,
    fiveStarUnitsPerYear: 340,
    defaultThreeStarPrice: 6500,
    defaultFiveStarPrice: 9200,
    defaultDailyHours: 2,
    seasonDaysPerYear: 150, // ~5 winter months
  },
  {
    id: 'washing_machine_7kg',
    name: '7kg Front Load Washing Machine',
    icon: '🧺',
    threeStarUnitsPerYear: 220,
    fiveStarUnitsPerYear: 150,
    defaultThreeStarPrice: 27000,
    defaultFiveStarPrice: 32500,
    defaultDailyHours: 1.5,
    seasonDaysPerYear: 300,
  },
];

interface DiscomSlab {
  id: string;
  state: string;
  discom: string;
  ratePerKwh: number; // in INR
}

const INDIAN_DISCOMS: DiscomSlab[] = [
  { id: 'bescom', state: 'Karnataka', discom: 'BESCOM (Bengaluru)', ratePerKwh: 7.75 },
  { id: 'msedcl', state: 'Maharashtra', discom: 'MSEDCL (Mumbai/Pune)', ratePerKwh: 9.80 },
  { id: 'tneb', state: 'Tamil Nadu', discom: 'TNEB (Chennai)', ratePerKwh: 6.90 },
  { id: 'bses_delhi', state: 'Delhi NCR', discom: 'BSES / Tata Power', ratePerKwh: 6.50 },
  { id: 'wbsedcl', state: 'West Bengal', discom: 'WBSEDCL / CESC', ratePerKwh: 8.20 },
  { id: 'uppcl', state: 'Uttar Pradesh', discom: 'UPPCL (Noida/Lucknow)', ratePerKwh: 7.50 },
  { id: 'tsspdcl', state: 'Telangana', discom: 'TSSPDCL (Hyderabad)', ratePerKwh: 7.90 },
];

export const ApplianceEnergyCostCalculatorTool: React.FC = () => {
  const [selectedApplianceId, setSelectedApplianceId] = useState<string>('ac_1_5_ton');
  const [selectedDiscomId, setSelectedDiscomId] = useState<string>('bescom');

  const appliance = useMemo(() => {
    return APPLIANCE_PROFILES.find((a) => a.id === selectedApplianceId) || APPLIANCE_PROFILES[0];
  }, [selectedApplianceId]);

  const discom = useMemo(() => {
    return INDIAN_DISCOMS.find((d) => d.id === selectedDiscomId) || INDIAN_DISCOMS[0];
  }, [selectedDiscomId]);

  // Customizable inputs
  const [threeStarPrice, setThreeStarPrice] = useState<number>(appliance.defaultThreeStarPrice);
  const [fiveStarPrice, setFiveStarPrice] = useState<number>(appliance.defaultFiveStarPrice);
  const [dailyHours, setDailyHours] = useState<number>(appliance.defaultDailyHours);
  const [electricityRate, setElectricityRate] = useState<number>(discom.ratePerKwh);
  const [customRateEnabled, setCustomRateEnabled] = useState<boolean>(false);

  // Sync defaults when appliance profile changes
  const handleApplianceChange = (id: string) => {
    setSelectedApplianceId(id);
    const app = APPLIANCE_PROFILES.find((a) => a.id === id) || APPLIANCE_PROFILES[0];
    setThreeStarPrice(app.defaultThreeStarPrice);
    setFiveStarPrice(app.defaultFiveStarPrice);
    setDailyHours(app.defaultDailyHours);
  };

  // Sync electricity rate when Discom changes
  const handleDiscomChange = (id: string) => {
    setSelectedDiscomId(id);
    const d = INDIAN_DISCOMS.find((item) => item.id === id) || INDIAN_DISCOMS[0];
    if (!customRateEnabled) {
      setElectricityRate(d.ratePerKwh);
    }
  };

  // Calculations
  const analysis = useMemo(() => {
    const rate = electricityRate;
    const upfrontDiff = Math.max(0, fiveStarPrice - threeStarPrice);

    // Scale units per year based on user daily usage hours vs default
    const usageFactor = dailyHours / appliance.defaultDailyHours;
    const annualUnits3Star = Math.round(appliance.threeStarUnitsPerYear * usageFactor);
    const annualUnits5Star = Math.round(appliance.fiveStarUnitsPerYear * usageFactor);

    const annualBill3Star = Math.round(annualUnits3Star * rate);
    const annualBill5Star = Math.round(annualUnits5Star * rate);
    const annualSavings = Math.max(0, annualBill3Star - annualBill5Star);

    // Payback period
    const paybackYears = annualSavings > 0 ? (upfrontDiff / annualSavings) : 999;
    const paybackMonths = Math.round(paybackYears * 12);

    // 5-Year Total Cost of Ownership (Purchase Price + 5 Years Electricity)
    const fiveYearTco3Star = threeStarPrice + (annualBill3Star * 5);
    const fiveYearTco5Star = fiveStarPrice + (annualBill5Star * 5);
    const netFiveYearSavings = fiveYearTco3Star - fiveYearTco5Star;

    // Environmental Impact: ~0.82 kg CO2 per kWh of coal electricity in India
    const annualCo2Kg = Math.round((annualUnits3Star - annualUnits5Star) * 0.82);
    const fiveYearCo2Kg = annualCo2Kg * 5;

    const isWorthBuying5Star = paybackYears <= 4.0;

    return {
      upfrontDiff,
      annualUnits3Star,
      annualUnits5Star,
      annualBill3Star,
      annualBill5Star,
      annualSavings,
      paybackYears: Math.round(paybackYears * 10) / 10,
      paybackMonths,
      fiveYearTco3Star,
      fiveYearTco5Star,
      netFiveYearSavings,
      annualCo2Kg,
      fiveYearCo2Kg,
      isWorthBuying5Star,
    };
  }, [appliance, dailyHours, electricityRate, threeStarPrice, fiveStarPrice]);

  return (
    <div className="w-full bg-white dark:bg-[#0D1527] rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-sm p-5 md:p-7 text-slate-800 dark:text-[#F8FAFC]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <h3 className="font-heading font-extrabold text-lg sm:text-xl text-slate-900 dark:text-[#F1F5F9] tracking-tight">
              Appliance 5-Year Electricity &amp; BEE Star Payback
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              ROI CALCULATOR
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Reveals whether paying ₹5,000 to ₹10,000 more for a 5-Star appliance will actually recover its cost in electricity bills.
          </p>
        </div>
      </div>

      {/* Appliance Category Selector */}
      <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {APPLIANCE_PROFILES.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => handleApplianceChange(p.id)}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedApplianceId === p.id
                ? 'bg-blue-50/60 border-blue-400 ring-2 ring-blue-400/20 shadow-xs'
                : 'bg-slate-50/50 dark:bg-[#070A11]/50 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:bg-[#111C33]'
            }`}
          >
            <div className="text-lg mb-1">{p.icon}</div>
            <div className="text-xs font-bold text-slate-900 dark:text-[#F1F5F9] leading-tight">{p.name}</div>
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Price Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/40 dark:bg-[#070A11]/40">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                3-Star {appliance.name} Price
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2.5 text-xs text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  step="500"
                  value={threeStarPrice}
                  onChange={(e) => setThreeStarPrice(Number(e.target.value))}
                  className="w-full h-9 pl-6 pr-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1527] text-xs font-mono font-bold text-slate-900 dark:text-[#F1F5F9]"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/20">
              <label className="text-xs font-bold text-emerald-950 block mb-1">
                5-Star {appliance.name} Price
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2.5 text-xs text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  step="500"
                  value={fiveStarPrice}
                  onChange={(e) => setFiveStarPrice(Number(e.target.value))}
                  className="w-full h-9 pl-6 pr-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1527] text-xs font-mono font-bold text-emerald-800"
                />
              </div>
            </div>
          </div>

          {/* Daily Usage Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                Daily Usage Hours
              </label>
              <span className="text-sm font-extrabold font-mono text-slate-900 dark:text-[#F1F5F9]">
                {dailyHours} Hours / Day
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="24"
              step="0.5"
              value={dailyHours}
              onChange={(e) => setDailyHours(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-[#172440] rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>Light (2-4 hrs)</span>
              <span>Medium (8 hrs)</span>
              <span>Heavy (16-24 hrs)</span>
            </div>
          </div>

          {/* State Electricity Board */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide block mb-1.5">
                Your State Discom Rate
              </label>
              <select
                value={selectedDiscomId}
                onChange={(e) => handleDiscomChange(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1527] text-xs font-medium text-slate-800 dark:text-[#F8FAFC]"
              >
                {INDIAN_DISCOMS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.state}: {d.discom} (₹{d.ratePerKwh}/unit)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide block mb-1.5">
                Tariff (₹ / kWh Unit)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  step="0.1"
                  min="2"
                  max="20"
                  value={electricityRate}
                  onChange={(e) => {
                    setCustomRateEnabled(true);
                    setElectricityRate(Number(e.target.value));
                  }}
                  className="w-full h-10 pl-7 pr-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1527] text-xs font-mono font-bold text-slate-900 dark:text-[#F1F5F9]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Output: Verdict & 5-Year TCO (5 cols) */}
        <div className="lg:col-span-5 bg-slate-50/80 dark:bg-[#070A11]/80 rounded-2xl border border-slate-200/80 dark:border-white/10 p-5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider block mb-1">
              Break-Even Payback Period
            </span>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-heading font-black tracking-tight ${
                analysis.isWorthBuying5Star ? 'text-emerald-700' : 'text-amber-700'
              }`}>
                {analysis.paybackYears <= 10 ? `${analysis.paybackYears} Years` : '> 10 Years'}
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                ({analysis.paybackMonths} months to recover ₹{analysis.upfrontDiff.toLocaleString('en-IN')})
              </span>
            </div>

            {/* 5-Year Total Cost Comparison */}
            <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-white/10 flex flex-col gap-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>Annual Electricity (3-Star)</span>
                <span className="font-mono font-bold text-slate-900 dark:text-[#F1F5F9]">
                  ₹{analysis.annualBill3Star.toLocaleString('en-IN')} / yr ({analysis.annualUnits3Star} units)
                </span>
              </div>
              <div className="flex justify-between items-center text-emerald-700">
                <span>Annual Electricity (5-Star)</span>
                <span className="font-mono font-bold">
                  ₹{analysis.annualBill5Star.toLocaleString('en-IN')} / yr ({analysis.annualUnits5Star} units)
                </span>
              </div>
              <div className="flex justify-between items-center font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg">
                <span>Annual Power Savings</span>
                <span className="font-mono">
                  +₹{analysis.annualSavings.toLocaleString('en-IN')} / year
                </span>
              </div>

              {/* 5-Year Total Cost of Ownership */}
              <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex justify-between items-center text-slate-700 dark:text-slate-200">
                <span>5-Yr Total Outflow (3-Star)</span>
                <span className="font-mono font-bold">₹{analysis.fiveYearTco3Star.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-200">
                <span>5-Yr Total Outflow (5-Star)</span>
                <span className="font-mono font-bold">₹{analysis.fiveYearTco5Star.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-extrabold text-slate-900 dark:text-[#F1F5F9] pt-1 border-t border-slate-300 dark:border-white/20">
                <span>5-Year Net Pocket Savings</span>
                <span className={`font-mono text-base ${analysis.netFiveYearSavings >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {analysis.netFiveYearSavings >= 0 ? '+' : ''}₹{analysis.netFiveYearSavings.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Verdict Box */}
          <div className="mt-5 p-3 rounded-xl bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 text-xs">
            <div className="font-bold text-slate-900 dark:text-[#F1F5F9] mb-1 flex items-center gap-1.5">
              <span>{analysis.isWorthBuying5Star ? '✅ 5-Star Recommended:' : '⚠️ 3-Star May Be Sufficient:'}</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {analysis.isWorthBuying5Star
                ? `At ${dailyHours} hours/day usage, the 5-star appliance will recover its ₹${analysis.upfrontDiff.toLocaleString('en-IN')} premium in ${analysis.paybackYears} years and save you ₹${analysis.netFiveYearSavings.toLocaleString('en-IN')} over 5 years, plus preventing ${analysis.fiveYearCo2Kg}kg of CO2.`
                : `Because your daily usage is only ${dailyHours} hours, it will take over ${analysis.paybackYears} years to recover the upfront price difference. A 3-star model is more economical for light use.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
