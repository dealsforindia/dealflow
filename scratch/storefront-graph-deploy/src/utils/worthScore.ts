import { PublicDeal } from '../types';

export interface WorthScoreResult {
  score: number;
  label: string;
  colorClass: string;
  bgClass: string;
  badgeClass: string;
}

export function calculateWorthScore(deal: Partial<PublicDeal>): WorthScoreResult {
  const price = deal.price || 0;
  let discount = deal.discount_pct || 0;
  // Guard against fake 100% discount with non-zero price
  if (discount >= 100 && price > 0) {
    discount = (deal.mrp && deal.mrp > price) ? Math.round(((deal.mrp - price) / deal.mrp) * 100) : 0;
  }
  
  const discountFactor = Math.max(0.05, 1 - Math.min(95, discount) / 100);
  const mrp = deal.mrp && deal.mrp > price 
    ? deal.mrp 
    : (discount > 0 && price > 0 ? Math.round(price / discountFactor) : price);

  if (!discount && mrp > price && price > 0) {
    discount = Math.round(((mrp - price) / mrp) * 100);
  }
  const savings = Math.max(0, mrp - price);

  // 100% Transparent Formula Based Purely On Verified Deal Metrics:
  // Base score directly proportional to discount percentage
  let baseScore = Math.min(60, discount * 0.7);

  // Additional points for verified absolute rupee savings
  if (savings >= 10000) baseScore += 25;
  else if (savings >= 5000) baseScore += 20;
  else if (savings >= 2000) baseScore += 15;
  else if (savings >= 1000) baseScore += 10;
  else if (savings >= 500) baseScore += 5;

  // Coupon bonus
  if (deal.coupon) baseScore += 5;

  // Store trust tier bonus
  const store = (deal.store || '').toLowerCase();
  if (store.includes('amazon') || store.includes('flipkart') || store.includes('myntra')) {
    baseScore += 5;
  }

  // Final score bounded 50 - 99
  const finalScore = Math.min(99, Math.max(50, Math.round(baseScore)));

  if (finalScore >= 90) {
    return {
      score: finalScore,
      label: 'Top Loot',
      colorClass: 'text-emerald-400',
      bgClass: 'bg-emerald-500/15 border-emerald-500/30',
      badgeClass: 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-extrabold',
    };
  } else if (finalScore >= 80) {
    return {
      score: finalScore,
      label: 'Excellent',
      colorClass: 'text-teal-300',
      bgClass: 'bg-teal-500/15 border-teal-500/30',
      badgeClass: 'bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold',
    };
  } else if (finalScore >= 70) {
    return {
      score: finalScore,
      label: 'Worth Buying',
      colorClass: 'text-cyan-300',
      bgClass: 'bg-cyan-500/15 border-cyan-500/30',
      badgeClass: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold',
    };
  } else {
    return {
      score: finalScore,
      label: 'Good Offer',
      colorClass: 'text-slate-300',
      bgClass: 'bg-slate-500/15 border-slate-500/30',
      badgeClass: 'bg-slate-500/20 text-slate-300 border border-slate-500/30 font-medium',
    };
  }
}

