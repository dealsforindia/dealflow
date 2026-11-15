import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';

interface BankConfig {
  id: string;
  name: string;
  annualRate: number; // in percent
  processingFee: number; // flat in INR
  processingFeeRate: number; // percent of loan
  minTenure: number;
}

const INDIAN_BANKS: BankConfig[] = [
  { id: 'hdfc', name: 'HDFC Bank', annualRate: 15.0, processingFee: 199, processingFeeRate: 0, minTenure: 3 },
  { id: 'icici', name: 'ICICI Bank', annualRate: 14.5, processingFee: 199, processingFeeRate: 0, minTenure: 3 },
  { id: 'sbi', name: 'State Bank of India (SBI)', annualRate: 14.0, processingFee: 250, processingFeeRate: 0, minTenure: 3 },
  { id: 'axis', name: 'Axis Bank', annualRate: 15.0, processingFee: 199, processingFeeRate: 0, minTenure: 3 },
  { id: 'kotak', name: 'Kotak Mahindra Bank', annualRate: 15.5, processingFee: 199, processingFeeRate: 0, minTenure: 3 },
  { id: 'onecard', name: 'OneCard / Federal Bank', annualRate: 13.5, processingFee: 99, processingFeeRate: 0, minTenure: 3 },
];

const TENURES = [3, 6, 9, 12, 18, 24];

export const EMICalculatorTool: React.FC = () => {
  // User Inputs
  const [productPrice, setProductPrice] = useState<number>(45000);
  const [downPayment, setDownPayment] = useState<number>(0);
  const [selectedTenure, setSelectedTenure] = useState<number>(6);
  const [selectedBankId, setSelectedBankId] = useState<string>('hdfc');
  const [isNoCostEmi, setIsNoCostEmi] = useState<boolean>(true);
  const [customInterestRate, setCustomInterestRate] = useState<number>(14.5);
  const [useCustomRate, setUseCustomRate] = useState<boolean>(false);

  const selectedBank = useMemo(() => {
    return INDIAN_BANKS.find((b) => b.id === selectedBankId) || INDIAN_BANKS[0];
  }, [selectedBankId]);

  const interestRate = useCustomRate ? customInterestRate : selectedBank.annualRate;

  // Calculation Engine
  const calculations = useMemo(() => {
    const loanAmount = Math.max(0, productPrice - downPayment);
    if (loanAmount <= 0) {
      return {
        monthlyEmi: 0,
        totalInterest: 0,
        upfrontDiscount: 0,
        gstOnInterest: 0,
        bankProcessingFeeTotal: 0,
        netEffectiveCost: productPrice,
        extraCostOverSticker: 0,
        amortization: [],
      };
    }

    const monthlyRate = interestRate / 12 / 100;
    const n = selectedTenure;

    // Standard reducing balance formula: EMI = P * r * (1+r)^n / ((1+r)^n - 1)
    const factor = Math.pow(1 + monthlyRate, n);
    const standardEmi = (loanAmount * monthlyRate * factor) / (factor - 1);

    // Amortization Schedule
    let remainingPrincipal = loanAmount;
    let totalInterest = 0;
    const schedule: Array<{
      month: number;
      openingBalance: number;
      emi: number;
      interest: number;
      gst: number;
      principal: number;
      closingBalance: number;
    }> = [];

    for (let m = 1; m <= n; m++) {
      const monthInterest = remainingPrincipal * monthlyRate;
      const monthGst = monthInterest * 0.18; // 18% GST charged by Indian banks on credit card EMI interest
      const monthPrincipal = standardEmi - monthInterest;
      const closing = Math.max(0, remainingPrincipal - monthPrincipal);

      totalInterest += monthInterest;
      schedule.push({
        month: m,
        openingBalance: Math.round(remainingPrincipal),
        emi: Math.round(standardEmi),
        interest: Math.round(monthInterest),
        gst: Math.round(monthGst),
        principal: Math.round(monthPrincipal),
        closingBalance: Math.round(closing),
      });

      remainingPrincipal = closing;
    }

    // No-Cost EMI mechanics: Merchant gives an upfront instant discount equal to total interest charged
    const upfrontDiscount = isNoCostEmi ? totalInterest : 0;
    const totalGstOnInterest = schedule.reduce((sum, row) => sum + row.gst, 0);

    // Bank processing fee: usually flat (e.g. ₹199) + 18% GST
    const baseFee = selectedBank.processingFee + (loanAmount * selectedBank.processingFeeRate) / 100;
    const feeGst = baseFee * 0.18;
    const bankProcessingFeeTotal = Math.round(baseFee + feeGst);

    // Net actual outflow for shopper
    // In No-Cost EMI: Pay sticker price + GST on interest + Processing fee with GST
    const netEffectiveCost = isNoCostEmi
      ? Math.round(productPrice + totalGstOnInterest + bankProcessingFeeTotal)
      : Math.round(productPrice + totalInterest + totalGstOnInterest + bankProcessingFeeTotal);

    const extraCostOverSticker = netEffectiveCost - productPrice;

    return {
      monthlyEmi: Math.round(standardEmi),
      totalInterest: Math.round(totalInterest),
      upfrontDiscount: Math.round(upfrontDiscount),
      gstOnInterest: Math.round(totalGstOnInterest),
      bankProcessingFeeTotal,
      netEffectiveCost,
      extraCostOverSticker,
      amortization: schedule,
    };
  }, [productPrice, downPayment, selectedTenure, interestRate, isNoCostEmi, selectedBank]);

  return (
    <div className="w-full bg-white dark:bg-[#0D1527] rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-sm p-5 md:p-7 text-slate-800 dark:text-[#F8FAFC]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">💳</span>
            <h3 className="font-heading font-extrabold text-lg sm:text-xl text-slate-900 dark:text-[#F1F5F9] tracking-tight">
              India No-Cost EMI & Hidden Cost Analyzer
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              REALITY CHECK
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Calculates 18% GST on interest & bank processing fees that Indian banks quietly charge even on &ldquo;0% Interest&rdquo; schemes.
          </p>
        </div>

        {/* No-Cost Toggle */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#111C33] p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsNoCostEmi(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isNoCostEmi ? 'bg-white dark:bg-[#0D1527] text-slate-900 dark:text-[#F1F5F9] shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:text-[#F8FAFC]'
            }`}
          >
            No-Cost EMI (0%)
          </button>
          <button
            type="button"
            onClick={() => setIsNoCostEmi(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              !isNoCostEmi ? 'bg-white dark:bg-[#0D1527] text-slate-900 dark:text-[#F1F5F9] shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:text-[#F8FAFC]'
            }`}
          >
            Standard Interest
          </button>
        </div>
      </div>

      {/* Main Grid: Controls & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5">
        {/* Left: Input Controls (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Product Price */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="emi-product-price" className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                Product Price (MRP or Deal Price)
              </label>
              <span className="text-sm font-extrabold font-mono text-slate-900 dark:text-[#F1F5F9]">
                ₹{productPrice.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              id="emi-product-price"
              type="range"
              min="2000"
              max="250000"
              step="500"
              value={productPrice}
              onChange={(e) => setProductPrice(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-[#172440] rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>₹2,000</span>
              <span>₹50,000</span>
              <span>₹1,00,000</span>
              <span>₹2,50,000</span>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 mr-1">Presets:</span>
            {[15000, 30000, 55000, 85000, 130000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setProductPrice(val)}
                className={`px-2.5 py-1 text-xs rounded-lg border font-mono transition-colors ${
                  productPrice === val
                    ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                    : 'bg-white dark:bg-[#0D1527] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:bg-[#070A11]'
                }`}
              >
                ₹{val >= 100000 ? `${val / 100000}L` : `${val / 1000}k`}
              </button>
            ))}
          </div>

          {/* Tenure Selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide block mb-2">
              Select Tenure (Months)
            </label>
            <div className="grid grid-cols-6 gap-2">
              {TENURES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTenure(t)}
                  className={`py-2 px-1 rounded-xl text-center border font-bold text-xs transition-all ${
                    selectedTenure === t
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                      : 'bg-white dark:bg-[#0D1527] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:bg-[#070A11]'
                  }`}
                >
                  <div>{t}M</div>
                  <div className="text-[10px] opacity-75 font-normal mt-0.5">
                    ₹{Math.round(productPrice / t).toLocaleString('en-IN')}/m
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Bank Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="emi-bank-select" className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide block mb-1.5">
                Issuing Credit Card Bank
              </label>
              <select
                id="emi-bank-select"
                value={selectedBankId}
                onChange={(e) => {
                  setSelectedBankId(e.target.value);
                  setUseCustomRate(false);
                }}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1527] text-xs font-medium text-slate-800 dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {INDIAN_BANKS.map((bank) => (
                  <option key={bank.id} value={bank.id}>
                    {bank.name} ({bank.annualRate}% p.a.)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="emi-down-payment" className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide block mb-1.5">
                Down Payment (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">₹</span>
                <input
                  id="emi-down-payment"
                  type="number"
                  min="0"
                  max={productPrice}
                  step="500"
                  value={downPayment || ''}
                  placeholder="0"
                  onChange={(e) => setDownPayment(Math.min(productPrice, Math.max(0, Number(e.target.value))))}
                  className="w-full h-10 pl-7 pr-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1527] text-xs font-medium text-slate-800 dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Analysis & Cost Verdict (5 cols) */}
        <div className="lg:col-span-5 bg-slate-50/80 dark:bg-[#070A11]/80 rounded-2xl border border-slate-200/80 dark:border-white/10 p-5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider block mb-1">
              Monthly Outflow
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-heading font-black text-slate-900 dark:text-[#F1F5F9] tracking-tight">
                ₹{calculations.monthlyEmi.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-500 font-semibold">/ month for {selectedTenure} mos</span>
            </div>

            {/* Hidden Cost Breakdown */}
            <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-white/10 flex flex-col gap-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>Sticker Product Price</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-[#F1F5F9]">
                  ₹{productPrice.toLocaleString('en-IN')}
                </span>
              </div>

              {isNoCostEmi && (
                <div className="flex justify-between items-center text-emerald-700">
                  <span>Upfront Merchant Discount</span>
                  <span className="font-mono font-semibold">
                    -₹{calculations.upfrontDiscount.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>Bank Interest ({interestRate}% p.a.)</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-[#F1F5F9]">
                  +₹{calculations.totalInterest.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between items-center text-rose-600 font-medium">
                <span className="flex items-center gap-1">
                  <span>18% GST on Interest</span>
                  <span className="text-[10px] cursor-help" title="Indian banks charge non-refundable 18% GST on monthly credit card interest">ℹ️</span>
                </span>
                <span className="font-mono font-bold">
                  +₹{calculations.gstOnInterest.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between items-center text-rose-600 font-medium">
                <span className="flex items-center gap-1">
                  <span>Bank Processing Fee + GST</span>
                  <span className="text-[10px] cursor-help" title="Flat bank fee of ₹199-250 + 18% GST charged upfront">ℹ️</span>
                </span>
                <span className="font-mono font-bold">
                  +₹{calculations.bankProcessingFeeTotal.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-300/80 dark:border-white/20 flex justify-between items-center text-sm font-extrabold text-slate-900 dark:text-[#F1F5F9]">
                <span>Net Actual Amount Paid</span>
                <span className="font-mono text-base text-blue-700">
                  ₹{calculations.netEffectiveCost.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Reality Verdict Pill */}
          <div className="mt-5 p-3 rounded-xl bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-[#F1F5F9] mb-1">
              <span>{calculations.extraCostOverSticker > 0 ? '⚠️ Hidden Extra Cost:' : '✅ Zero Extra Cost:'}</span>
              <span className="text-rose-600 font-mono font-extrabold">
                ₹{calculations.extraCostOverSticker.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {isNoCostEmi
                ? `Even with "0% Interest", you will pay ₹${calculations.extraCostOverSticker.toLocaleString('en-IN')} extra in non-refundable government GST and bank processing charges.`
                : `Taking standard EMI adds ₹${calculations.extraCostOverSticker.toLocaleString('en-IN')} to your final purchase bill.`}
            </p>
          </div>
        </div>
      </div>

      {/* Amortization Table Accordion */}
      <details className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 group">
        <summary className="cursor-pointer text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:text-[#F1F5F9] flex items-center justify-between list-none">
          <span className="flex items-center gap-2">
            <span>📊 View Month-by-Month Bank Amortization Schedule</span>
            <span className="text-[10px] font-mono bg-slate-100 dark:bg-[#111C33] text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
              {calculations.amortization.length} payments
            </span>
          </span>
          <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
        </summary>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="py-2 px-3">Mo</th>
                <th className="py-2 px-3">Opening</th>
                <th className="py-2 px-3">Principal</th>
                <th className="py-2 px-3">Interest</th>
                <th className="py-2 px-3">18% GST</th>
                <th className="py-2 px-3">Total Due</th>
                <th className="py-2 px-3 text-right">Closing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {calculations.amortization.map((row) => (
                <tr key={row.month} className="hover:bg-slate-50 dark:bg-[#070A11] transition-colors">
                  <td className="py-2 px-3 font-bold text-slate-700 dark:text-slate-200">{row.month}</td>
                  <td className="py-2 px-3 text-slate-600 dark:text-slate-400">₹{row.openingBalance.toLocaleString('en-IN')}</td>
                  <td className="py-2 px-3 text-emerald-700 font-semibold">₹{row.principal.toLocaleString('en-IN')}</td>
                  <td className="py-2 px-3 text-amber-600">₹{row.interest.toLocaleString('en-IN')}</td>
                  <td className="py-2 px-3 text-rose-600">₹{row.gst.toLocaleString('en-IN')}</td>
                  <td className="py-2 px-3 font-bold text-slate-900 dark:text-[#F1F5F9]">₹{(row.emi + row.gst).toLocaleString('en-IN')}</td>
                  <td className="py-2 px-3 text-right text-slate-500">₹{row.closingBalance.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
};
