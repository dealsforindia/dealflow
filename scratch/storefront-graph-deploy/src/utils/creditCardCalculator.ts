/**
 * creditCardCalculator.ts — Personalized Credit Card Price Calculator (Feature 14)
 * Calculates personalized effective prices and cashback for Indian deal hunters.
 */

export interface CreditCardProfile {
  id: string;
  name: string;
  bank: string;
  badgeColor: string;
  calculateCashback: (price: number, store: string) => { pct: number; amount: number; yourPrice: number };
}

export const POPULAR_CREDIT_CARDS: CreditCardProfile[] = [
  {
    id: "sbi_cashback",
    name: "SBI Cashback",
    bank: "SBI",
    badgeColor: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    calculateCashback: (price: number, _store: string) => {
      const pct = 5;
      const amount = Math.min(5000, Math.round(price * (pct / 100)));
      return { pct, amount, yourPrice: Math.max(0, price - amount) };
    },
  },
  {
    id: "amazon_pay_icici",
    name: "Amazon Pay ICICI",
    bank: "ICICI",
    badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    calculateCashback: (price: number, store: string) => {
      const s = store.toLowerCase();
      const pct = s.includes("amazon") ? 5 : 1;
      const amount = Math.round(price * (pct / 100));
      return { pct, amount, yourPrice: Math.max(0, price - amount) };
    },
  },
  {
    id: "flipkart_axis",
    name: "Flipkart Axis",
    bank: "Axis",
    badgeColor: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    calculateCashback: (price: number, store: string) => {
      const s = store.toLowerCase();
      const pct = (s.includes("flipkart") || s.includes("myntra") || s.includes("cleartrip")) ? 5 : 1.5;
      const amount = Math.round(price * (pct / 100));
      return { pct, amount, yourPrice: Math.max(0, price - amount) };
    },
  },
  {
    id: "hdfc_millennia",
    name: "HDFC Millennia",
    bank: "HDFC",
    badgeColor: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    calculateCashback: (price: number, store: string) => {
      const s = store.toLowerCase();
      const pct = (s.includes("amazon") || s.includes("flipkart") || s.includes("myntra") || s.includes("swiggy") || s.includes("zomato") || s.includes("tata cliq")) ? 5 : 1;
      const amount = Math.min(1000, Math.round(price * (pct / 100)));
      return { pct, amount, yourPrice: Math.max(0, price - amount) };
    },
  },
  {
    id: "airtel_axis",
    name: "Airtel Axis",
    bank: "Axis",
    badgeColor: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    calculateCashback: (price: number, store: string) => {
      const s = store.toLowerCase();
      const pct = (s.includes("swiggy") || s.includes("zomato") || s.includes("bigbasket") || s.includes("blinkit")) ? 10 : 1;
      const amount = Math.min(500, Math.round(price * (pct / 100)));
      return { pct, amount, yourPrice: Math.max(0, price - amount) };
    },
  },
];

const STORAGE_KEY = "dealflow_selected_card_id";

export function getSavedCreditCard(): CreditCardProfile | null {
  try {
    const savedId = localStorage.getItem(STORAGE_KEY);
    if (savedId) {
      return POPULAR_CREDIT_CARDS.find((c) => c.id === savedId) || null;
    }
  } catch {}
  return null;
}

export function saveCreditCard(cardId: string | null): void {
  try {
    if (!cardId) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, cardId);
    }
  } catch {}
}
