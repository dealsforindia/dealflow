import type { PublicDeal } from '../types';

/** Coupon text describes activation; coupon_discount is often an amount in rupees. */
export function couponOffer(deal: Pick<PublicDeal, 'coupon' | 'store'>) {
  const text = (deal.coupon || '').trim();
  if (!text) return null;
  const percent = text.match(/(\d+(?:\.\d+)?)\s*%/);
  const amount = text.match(/(?:₹|rs\.?|inr)\s*(\d[\d,]*(?:\.\d+)?)/i);
  const code = /^[a-z0-9][a-z0-9_-]{2,29}$/i.test(text) && /[a-z]/i.test(text)
    && !/^(coupon|apply|collect|discount|none|na)$/i.test(text);
  if (code) return { kind: 'code' as const, code: text, label: text };
  const value = percent ? Number(percent[1]) : amount ? Number(amount[1].replace(/,/g, '')) : null;
  const label = percent && value && value < 100 ? `${value}% coupon`
    : amount && value ? `₹${value.toLocaleString('en-IN')} coupon` : text;
  return { kind: 'activation' as const, label, code: null };
}
