export interface CheckoutInputs {
  delivery: number | null;
  instantDiscount: number;
  cashback: number;
  eligibilityConfirmed: boolean;
}

export function calculateCheckout(price: number | null, input: CheckoutInputs) {
  if (price == null || !Number.isFinite(price) || price <= 0) return null;
  if (![input.instantDiscount, input.cashback].every(n => Number.isFinite(n) && n >= 0)) return null;
  if (input.delivery !== null && (!Number.isFinite(input.delivery) || input.delivery < 0)) return null;
  const discount = Math.min(price, input.instantDiscount);
  const subtotal = Math.round((price - discount) * 100) / 100;
  const delivery = input.delivery ?? 0;
  const payNow = Math.round((subtotal + delivery) * 100) / 100;
  // Cashback is delayed and never reduces the amount due at checkout.
  const cashback = Math.min(subtotal, input.cashback);
  const afterCashback = Math.round((payNow - cashback) * 100) / 100;
  return { subtotal, payNow, cashback, afterCashback, discount, capped: (input.instantDiscount > price || input.cashback > subtotal) };
}

export function checkoutAmount(value: string): number | null {
  if (!value.trim()) return null;
  if (!/^\d+(?:\.\d{1,2})?$/.test(value.trim())) return NaN;
  return Number(value);
}
