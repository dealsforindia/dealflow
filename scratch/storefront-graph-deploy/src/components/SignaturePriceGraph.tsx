import React from 'react';

interface SignaturePriceGraphProps {
  currentPrice: number;
  regularPrice?: number;
  mrp?: number;
}

// A reference price is not historical evidence. Keep this comparison useful
// without inventing dates, a trend line, or a lowest-price claim.
export const SignaturePriceGraph: React.FC<SignaturePriceGraphProps> = ({ currentPrice, regularPrice, mrp }) => {
  const reference = regularPrice && regularPrice > currentPrice ? regularPrice : mrp && mrp > currentPrice ? mrp : null;
  const label = regularPrice && regularPrice > currentPrice ? 'Supplied regular price' : 'Merchant MRP';
  const money = (price: number) => `₹${price.toLocaleString('en-IN')}`;
  return <div className="mt-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#070A11] p-4">
    <div className="flex items-center justify-between gap-3 mb-4">
      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Price comparison</span>
      {reference && <span className="text-xs font-semibold text-blue-700">{Math.round((1 - currentPrice / reference) * 100)}% below reference</span>}
    </div>
    {reference ? <div className="space-y-4">
      <div><div className="flex justify-between gap-3 text-xs text-slate-500 mb-2"><span>{label}</span><span>{money(reference)}</span></div><div className="h-2 rounded-full bg-slate-200 dark:bg-[#172440]" /></div>
      <div><div className="flex justify-between gap-3 text-xs font-semibold text-slate-800 dark:text-[#F8FAFC] mb-2"><span>Listed price</span><span>{money(currentPrice)}</span></div><div className="h-2 rounded-full bg-blue-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.max(0, Math.min(100, currentPrice / reference * 100))}%` }} /></div></div>
    </div> : <p className="text-xs text-slate-500">A comparable reference price has not been supplied.</p>}
    <p className="mt-4 text-[11px] leading-relaxed text-slate-500">Reference prices do not establish a historical discount. Open product intelligence to inspect recorded price observations.</p>
  </div>;
};
