import { PublicDeal, CreditCardProfile, CardSavingsResult } from '../types';

export const SUPPORTED_CREDIT_CARDS: CreditCardProfile[] = [
  {
    id: 'amazon_pay_icici',
    name: 'Amazon Pay ICICI',
    bank: 'ICICI Bank',
    rewardText: '5% Unlimited Cashback on Amazon',
    colorGradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    borderColor: 'border-amber-500/40',
    accentColor: 'text-amber-400',
    cashbackPct: 5,
    stores: ['Amazon'],
  },
  {
    id: 'flipkart_axis',
    name: 'Flipkart Axis Bank',
    bank: 'Axis Bank',
    rewardText: '5% Unlimited Cashback on Flipkart & 4% on Swiggy',
    colorGradient: 'from-blue-500/20 via-sky-500/10 to-transparent',
    borderColor: 'border-blue-500/40',
    accentColor: 'text-blue-400',
    cashbackPct: 5,
    stores: ['Flipkart', 'Swiggy', 'Swiggy Instamart'],
  },
  {
    id: 'sbi_cashback',
    name: 'SBI Cashback Card',
    bank: 'SBI Card',
    rewardText: '5% Flat Cashback on All Online Shopping',
    colorGradient: 'from-sky-500/20 via-cyan-500/10 to-transparent',
    borderColor: 'border-cyan-500/40',
    accentColor: 'text-cyan-400',
    cashbackPct: 5,
    stores: ['All'],
    monthlyCap: 5000,
  },
  {
    id: 'hdfc_millennia',
    name: 'HDFC Millennia',
    bank: 'HDFC Bank',
    rewardText: '5% CashPoints on Amazon, Flipkart, Myntra, Swiggy',
    colorGradient: 'from-indigo-500/20 via-purple-500/10 to-transparent',
    borderColor: 'border-indigo-500/40',
    accentColor: 'text-indigo-400',
    cashbackPct: 5,
    stores: ['Amazon', 'Flipkart', 'Myntra', 'Swiggy', 'Swiggy Instamart'],
    monthlyCap: 1000,
  },
  {
    id: 'airtel_axis',
    name: 'Airtel Axis Bank',
    bank: 'Axis Bank',
    rewardText: '10% Cashback on Swiggy, Zomato, Blinkit',
    colorGradient: 'from-rose-500/20 via-pink-500/10 to-transparent',
    borderColor: 'border-rose-500/40',
    accentColor: 'text-rose-400',
    cashbackPct: 10,
    stores: ['Swiggy', 'Swiggy Instamart', 'Blinkit', 'Zepto'],
    monthlyCap: 500,
  },
  {
    id: 'axis_ace',
    name: 'Axis Ace Card',
    bank: 'Axis Bank',
    rewardText: '2% Flat Unlimited Cashback on All Spends',
    colorGradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    borderColor: 'border-emerald-500/40',
    accentColor: 'text-emerald-400',
    cashbackPct: 2,
    stores: ['All'],
  },
];

const LOCAL_STORAGE_KEY = 'dealflow_my_cards';

export function getSavedCards(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return ['amazon_pay_icici', 'sbi_cashback']; // default enabled
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : ['amazon_pay_icici', 'sbi_cashback'];
  } catch {
    return ['amazon_pay_icici', 'sbi_cashback'];
  }
}

export function saveSelectedCards(cardIds: string[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cardIds));
  } catch {}
}

export function calculateBestCardSavings(
  deal: PublicDeal,
  activeCardIds: string[]
): CardSavingsResult | null {
  const salePrice = deal.price || 0;
  if (salePrice <= 0 || !activeCardIds || activeCardIds.length === 0) return null;

  const store = (deal.store || '').toLowerCase();

  let bestCard: CreditCardProfile | null = null;
  let highestCashbackPct = 0;

  for (const card of SUPPORTED_CREDIT_CARDS) {
    if (!activeCardIds.includes(card.id)) continue;

    let applies = false;
    let rate = card.cashbackPct;

    if (card.stores.includes('All')) {
      applies = true;
    } else {
      for (const s of card.stores) {
        if (store.includes(s.toLowerCase())) {
          applies = true;
          // Specific rule: Flipkart Axis on Swiggy gives 4%
          if (card.id === 'flipkart_axis' && store.includes('swiggy')) {
            rate = 4;
          }
          break;
        }
      }
    }

    if (applies && rate > highestCashbackPct) {
      highestCashbackPct = rate;
      bestCard = card;
    }
  }

  if (!bestCard || highestCashbackPct <= 0) return null;

  const rawCashback = Math.round(salePrice * (highestCashbackPct / 100));
  const cashbackAmount = bestCard.monthlyCap ? Math.min(rawCashback, bestCard.monthlyCap) : rawCashback;
  const effectivePrice = Math.max(1, salePrice - cashbackAmount);

  return {
    cardName: bestCard.name,
    bank: bestCard.bank,
    cashbackPct: highestCashbackPct,
    cashbackAmount,
    effectivePrice,
    colorGradient: bestCard.colorGradient,
  };
}
