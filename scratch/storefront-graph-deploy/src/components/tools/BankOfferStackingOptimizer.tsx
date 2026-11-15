import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';

interface PaymentMethodOffer {
  id: string;
  name: string;
  bank: string;
  type: 'instant_discount' | 'cashback' | 'smartbuy_voucher' | 'reward_points';
  ratePercent: number;
  minSpend: number;
  maxCap: number; // 0 = unlimited
  processingFee: number; // e.g. ₹99 + GST on some banks
  specialCondition?: string;
  icon: string;
  badge: string;
}

const POPULAR_OFFERS: PaymentMethodOffer[] = [
  {
    id: 'amazon_pay_icici',
    name: 'Amazon Pay ICICI Credit Card',
    bank: 'ICICI Bank',
    type: 'cashback',
    ratePercent: 5.0,
    minSpend: 0,
    maxCap: 0, // Unlimited!
    processingFee: 0,
    specialCondition: '5% unlimited direct Amazon Pay cashback for Prime members, 3% for non-Prime',
    icon: '💳',
    badge: 'UNLIMITED 5%',
  },
  {
    id: 'flipkart_axis',
    name: 'Flipkart Axis Bank Credit Card',
    bank: 'Axis Bank',
    type: 'cashback',
    ratePercent: 5.0,
    minSpend: 0,
    maxCap: 0, // Unlimited!
    processingFee: 0,
    specialCondition: 'Flat 5% direct cashback credited directly to next monthly statement',
    icon: '💳',
    badge: 'UNLIMITED 5%',
  },
  {
    id: 'hdfc_sale_instant',
    name: 'HDFC Bank Festive Instant Discount',
    bank: 'HDFC Bank',
    type: 'instant_discount',
    ratePercent: 10.0,
    minSpend: 5000,
    maxCap: 1750,
    processingFee: 0,
    specialCondition: '10% instant price drop at checkout up to max ₹1,750 on orders above ₹5,000',
    icon: '🏦',
    badge: 'FESTIVE 10%',
  },
  {
    id: 'sbi_card_sale',
    name: 'SBI Credit Card Instant 10% Offer',
    bank: 'State Bank of India',
    type: 'instant_discount',
    ratePercent: 10.0,
    minSpend: 4999,
    maxCap: 1500,
    processingFee: 99, // ₹99 fee on certain sales
    specialCondition: '10% instant discount up to ₹1,500 (note: ₹99 processing fee applies on sale events)',
    icon: '🔷',
    badge: 'INSTANT 10%',
  },
  {
    id: 'onecard_instant',
    name: 'OneCard Metal Credit Card',
    bank: 'Federal / SBM',
    type: 'instant_discount',
    ratePercent: 7.5,
    minSpend: 2500,
    maxCap: 1000,
    processingFee: 0,
    specialCondition: '7.5% instant discount up to ₹1,000 + 5X reward points on top 2 categories',
    icon: '🪙',
    badge: 'ONECARD 7.5%',
  },
  {
    id: 'hdfc_infinia_smartbuy',
    name: 'HDFC Infinia SmartBuy (Gyftr Gift Card)',
    bank: 'HDFC Bank',
    type: 'smartbuy_voucher',
    ratePercent: 16.6,
    minSpend: 500,
    maxCap: 9999,
    processingFee: 0,
    specialCondition: 'Buy Amazon Shopping Voucher on SmartBuy with 5X reward points (16.6% return value)',
    icon: '👑',
    badge: 'SUPER ELITE 16.6%',
  },
  {
    id: 'axis_airtel',
    name: 'Airtel Axis Bank Credit Card',
    bank: 'Axis Bank',
    type: 'cashback',
    ratePercent: 10.0,
    minSpend: 0,
    maxCap: 500,
    processingFee: 0,
    specialCondition: '10% cashback on Swiggy, Zomato, and BigBasket up to ₹500/month',
    icon: '⚡',
    badge: 'QUICK COMMERCE 10%',
  },
  {
    id: 'hsbc_live_plus',
    name: 'HSBC Live+ (Cashback Credit Card)',
    bank: 'HSBC India',
    type: 'cashback',
    ratePercent: 10.0,
    minSpend: 1000,
    maxCap: 1000,
    processingFee: 0,
    specialCondition: '10% accelerated cashback on dining and groceries up to ₹1,000 monthly',
    icon: '🔴',
    badge: 'GROCERY 10%',
  },
];

export const BankOfferStackingOptimizer: React.FC = () => {
  const [cartAmount, setCartAmount] = useState<number>(32999);
  const [selectedPlatform, setSelectedPlatform] = useState<'amazon' | 'flipkart' | 'quick_commerce'>('amazon');
  const [hasPrime, setHasPrime] = useState<boolean>(true);
  const [includeVoucherRoute, setIncludeVoucherRoute] = useState<boolean>(true);

  // Real Stacking Engine
  const rankedOffers = useMemo(() => {
    const amount = Math.max(0, cartAmount);

    return POPULAR_OFFERS.map((offer) => {
      let isEligible = true;
      let ineligibilityReason = '';

      if (amount < offer.minSpend) {
        isEligible = false;
        ineligibilityReason = `Cart ₹${amount.toLocaleString('en-IN')} is below min spend of ₹${offer.minSpend.toLocaleString('en-IN')}`;
      }

      // Compute raw percentage benefit
      let effectiveRate = offer.ratePercent;
      if (offer.id === 'amazon_pay_icici' && !hasPrime) {
        effectiveRate = 3.0; // 3% for non-Prime
      }

      let grossSavings = (amount * effectiveRate) / 100;
      if (offer.maxCap > 0 && grossSavings > offer.maxCap) {
        grossSavings = offer.maxCap;
      }

      // Deduct processing fee with 18% GST if applicable
      const totalFee = offer.processingFee > 0 ? Math.round(offer.processingFee * 1.18) : 0;
      const netSavings = isEligible ? Math.max(0, grossSavings - totalFee) : 0;
      const finalPrice = isEligible ? amount - netSavings : amount;
      const effectiveDiscountPercent = amount > 0 ? (netSavings / amount) * 100 : 0;

      return {
        ...offer,
        effectiveRate,
        isEligible,
        ineligibilityReason,
        grossSavings: Math.round(grossSavings),
        totalFee,
        netSavings: Math.round(netSavings),
        finalPrice: Math.round(finalPrice),
        effectiveDiscountPercent: Math.round(effectiveDiscountPercent * 10) / 10,
      };
    }).sort((a, b) => b.netSavings - a.netSavings);
  }, [cartAmount, hasPrime]);

  const bestOffer = rankedOffers[0];
  const secondBestOffer = rankedOffers[1];
  const deltaSavings = bestOffer && secondBestOffer ? bestOffer.netSavings - secondBestOffer.netSavings : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0D1527] rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">💳</span>
            <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 dark:text-[#F1F5F9] m-0">
              Bank Offer &amp; Credit Card Stacking Optimizer
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              INSTANT VS CASHBACK
            </span>
          </div>
          <p className="text-xs text-slate-500 m-0 leading-relaxed">
            Eliminate the confusion between capped 10% instant bank discounts and 5% unlimited cashback on high-ticket purchases.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-[#070A11] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 cursor-pointer">
            <input
              type="checkbox"
              checked={hasPrime}
              onChange={(e) => setHasPrime(e.target.checked)}
              className="rounded text-blue-600"
            />
            <span className="font-semibold">Amazon Prime Active (5%)</span>
          </label>
        </div>
      </div>

      {/* Cart Size & Target Store Selector */}
      <div className="bg-white dark:bg-[#0D1527] rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-6">
            <span className="text-xs font-mono uppercase font-bold text-slate-500 block mb-1.5">
              Enter Total Checkout Cart Amount
            </span>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono text-base">
                ₹
              </span>
              <input
                type="number"
                min="500"
                step="500"
                value={cartAmount || ''}
                onChange={(e) => setCartAmount(Number(e.target.value))}
                placeholder="e.g. 32999"
                className="w-full h-11 pl-9 pr-4 rounded-xl border border-slate-300 dark:border-white/20 text-base font-mono font-bold text-slate-900 dark:text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>
          </div>

          <div className="md:col-span-6">
            <span className="text-xs font-mono uppercase font-bold text-slate-500 block mb-1.5">
              Quick Pre-Fill Basket Value
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[4999, 12999, 29999, 54999, 89999].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setCartAmount(val)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
                    cartAmount === val
                      ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold'
                      : 'bg-slate-50 dark:bg-[#070A11] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:bg-[#111C33]'
                  }`}
                >
                  ₹{val.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Winner Card Recommendation */}
      {bestOffer && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 dark:bg-[#0D1527]/20 text-white font-mono font-bold text-[11px] uppercase tracking-wider backdrop-blur-xs">
                🏆 #1 HIGHEST SAVINGS PAYMENT METHOD
              </span>
              <span className="text-xs font-mono text-emerald-200">
                Saves ₹{bestOffer.netSavings.toLocaleString('en-IN')}
              </span>
            </div>

            <h4 className="text-2xl font-heading font-black tracking-tight text-white m-0">
              {bestOffer.name}
            </h4>

            <p className="text-xs text-white/90 max-w-xl leading-relaxed m-0">
              {bestOffer.specialCondition}
            </p>

            {deltaSavings > 0 && (
              <span className="inline-block text-[11px] font-mono text-emerald-100 bg-white/10 dark:bg-[#0D1527]/10 px-2 py-0.5 rounded-lg">
                Beats the 2nd best card ({secondBestOffer?.name}) by ₹{deltaSavings.toLocaleString('en-IN')}!
              </span>
            )}
          </div>

          <div className="bg-white/10 dark:bg-[#0D1527]/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex flex-col items-center justify-center shrink-0 min-w-[190px]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-200">
              FINAL PAYABLE AMOUNT
            </span>
            <span className="text-3xl font-mono font-black text-white">
              ₹{bestOffer.finalPrice.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-mono font-bold text-emerald-300 mt-0.5">
              Net {bestOffer.effectiveDiscountPercent}% Off Cart
            </span>
          </div>
        </div>
      )}

      {/* Comprehensive Ranked Matrix */}
      <div className="bg-white dark:bg-[#0D1527] rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
          <span className="text-xs font-mono uppercase font-bold text-slate-500">
            All Available Card &amp; Voucher Routes (Ranked by Net Rupees Saved)
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Simulated for ₹{cartAmount.toLocaleString('en-IN')} cart
          </span>
        </div>

        <div className="space-y-2">
          {rankedOffers.map((offer, idx) => {
            const isWinner = idx === 0 && offer.isEligible;
            return (
              <div
                key={offer.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isWinner
                    ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                    : offer.isEligible
                    ? 'bg-white dark:bg-[#0D1527] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:border-white/20'
                    : 'bg-slate-50/70 dark:bg-[#070A11]/70 border-slate-200 dark:border-white/10 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{offer.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-[#F1F5F9]">
                        {offer.name}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#111C33] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10">
                        {offer.badge}
                      </span>
                      {isWinner && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white font-mono">
                          BEST DEAL
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 block mt-0.5">
                      {offer.bank} • {offer.type === 'instant_discount' ? 'Instant Price Drop' : offer.type === 'smartbuy_voucher' ? 'Gyftr Voucher 5X Points' : 'Statement Cashback'}
                    </span>
                    {!offer.isEligible && (
                      <span className="text-[11px] text-rose-600 font-medium block mt-0.5">
                        ⚠️ {offer.ineligibilityReason}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-white/5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs text-slate-400">Total Savings:</span>
                    <span
                      className={`text-base font-mono font-bold ${
                        isWinner ? 'text-emerald-700' : offer.isEligible ? 'text-slate-900 dark:text-[#F1F5F9]' : 'text-slate-400'
                      }`}
                    >
                      {offer.isEligible ? `₹${offer.netSavings.toLocaleString('en-IN')}` : '₹0'}
                    </span>
                  </div>
                  {offer.isEligible && (
                    <span className="text-[11px] font-mono text-slate-500">
                      Final: ₹{offer.finalPrice.toLocaleString('en-IN')} ({offer.effectiveDiscountPercent}%)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pro-Tips & Traps Card */}
      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
        <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
          <span>💡</span>
          <span>Pro-Shopper Golden Rules for Festive Sales:</span>
        </div>
        <ul className="text-[11px] text-blue-800 space-y-1 list-disc pl-4 leading-relaxed">
          <li><strong>High-Value Purchases (&gt; ₹35,000):</strong> Unlimited 5% cashback cards (Amazon Pay ICICI / Flipkart Axis) beat 10% instant bank discounts because instant offers are artificially capped at ₹1,500 to ₹1,750!</li>
          <li><strong>Processing Fee Trap:</strong> Watch out for bank offers that charge ₹99 + 18% GST (₹117 total) fee on instant discounts. On a ₹5,000 cart, a ₹500 discount with ₹117 fee drops your real saving to only ₹383!</li>
          <li><strong>SmartBuy Gyftr Gift Cards:</strong> If you hold HDFC Infinia or Diners Black, buying Amazon Shopping Vouchers via SmartBuy yields 16.6% to 9.9% net return in reward points!</li>
        </ul>
      </div>
    </div>
  );
};
