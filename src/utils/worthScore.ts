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
  const mrp = deal.mrp || (deal.discount_pct && price ? Math.round(price / (1 - deal.discount_pct / 100)) : price);
  const discount = deal.discount_pct || (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);
  const savings = Math.max(0, mrp - price);

  // Hash ID for deterministic variability
  let idHash = 0;
  if (deal.id) {
    for (let i = 0; i < deal.id.length; i++) {
      idHash = (idHash * 31 + deal.id.charCodeAt(i)) % 100;
    }
  }

  // Base score from discount percentage (40% discount -> 60 base, 80% discount -> 88 base)
  let baseScore = 50 + (discount * 0.45);

  // Boost for high absolute rupee savings
  if (savings >= 10000) baseScore += 12;
  else if (savings >= 3000) baseScore += 8;
  else if (savings >= 1000) baseScore += 5;
  else if (savings >= 500) baseScore += 3;

  // Boost for trusted stores
  const store = (deal.store || '').toLowerCase();
  if (store.includes('amazon') || store.includes('flipkart') || store.includes('myntra')) {
    baseScore += 3;
  }

  // Small hash perturbation (+/- 3) for authentic variation
  const variation = (idHash % 7) - 3;
  let finalScore = Math.round(Math.min(99, Math.max(62, baseScore + variation)));

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
  } else if (finalScore >= 72) {
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
      label: 'Good Buy',
      colorClass: 'text-slate-300',
      bgClass: 'bg-slate-500/15 border-slate-500/30',
      badgeClass: 'bg-slate-500/20 text-slate-300 border border-slate-500/30 font-medium',
    };
  }
}

/**
 * Deterministic remaining minutes for "Ending Soon" countdowns
 */
export function getEndingSoonMins(dealId: string): number {
  let hash = 0;
  for (let i = 0; i < dealId.length; i++) {
    hash = (hash * 33 + dealId.charCodeAt(i)) % 90;
  }
  return (hash % 45) + 3; // 3 to 48 minutes remaining
}
