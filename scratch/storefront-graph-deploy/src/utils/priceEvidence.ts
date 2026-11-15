/** Retrieval time is not observation time. Only dated merchant evidence is current. */
export function priceFreshness(data: { price_verified?: boolean; price_source?: string; last_checked_at?: number }, now = Date.now()) {
  const raw = Number(data.last_checked_at);
  const checked = raw < 1e11 ? raw * 1000 : raw;
  const verified = data.price_verified === true && data.price_source === 'merchant_product_page';
  if (!verified || !Number.isFinite(checked) || checked <= 0 || checked > now + 60000) return { current: false, checked: null, label: 'Current price unconfirmed' };
  if (now - checked > 15 * 60000) return { current: false, checked, label: 'Earlier merchant observation' };
  return { current: true, checked, label: 'Recently checked merchant price' };
}

export function normalizeLookup(data: Record<string, any>): Record<string, any> {
  const evidence = priceFreshness(data);
  const number = Number(data.price);
  const price = Number.isFinite(number) && number > 0 ? number : null;
  return { ...data, reported_price: price, price: evidence.current ? price : null,
    pendingLivePrice: !evidence.current || !price, price_evidence_label: evidence.label,
    price_verified: evidence.current, last_checked_at: evidence.checked ?? undefined,
    // Discounts must share the same observation as the price.
    mrp: evidence.current ? data.mrp : null, discount_pct: evidence.current ? data.discount_pct : null };
}
