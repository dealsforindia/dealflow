import { useId, useState } from 'react';
import { Calculator, ChevronDown } from 'lucide-react';
import { calculateCheckout, checkoutAmount } from '../utils/checkout';
import { IntelligenceOffer } from '../utils/shoppingIntelligence';

const money = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

export function CheckoutPlanner({ offer }: { offer: IntelligenceOffer }) {
  const [delivery, setDelivery] = useState('');
  const [discount, setDiscount] = useState('');
  const [cashback, setCashback] = useState('');
  const id = useId();
  const result = calculateCheckout(offer.price, {
    delivery: checkoutAmount(delivery), instantDiscount: checkoutAmount(discount) ?? 0,
    cashback: checkoutAmount(cashback) ?? 0, eligibilityConfirmed: true,
  });
  const missingPrice = offer.price == null || !Number.isFinite(offer.price) || offer.price <= 0;
  return <details className="mine-checkout">
    <summary><span><Calculator size={16} /> Calculate your checkout</span><ChevronDown size={16} /></summary>
    <div className="mine-checkout-body">
      <p>Estimate your final savings with coupon codes, bank cards, and delivery fees.</p>
      {offer.coupon && <p>Detected coupon: <strong>{offer.coupon}</strong></p>}
      <div className="mine-checkout-inputs">
        <label htmlFor={`${id}-discount`}>Instant discount (₹)<input id={`${id}-discount`} inputMode="decimal" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="e.g. 500 (card/coupon)" /></label>
        <label htmlFor={`${id}-delivery`}>Delivery fee (₹)<input id={`${id}-delivery`} inputMode="decimal" value={delivery} onChange={e => setDelivery(e.target.value)} placeholder="0 if free delivery" /></label>
        <label htmlFor={`${id}-cashback`}>Cashback / rewards (₹)<input id={`${id}-cashback`} inputMode="decimal" value={cashback} onChange={e => setCashback(e.target.value)} placeholder="e.g. 200 Amazon Pay" /></label>
      </div>
      <div className="mine-checkout-total" aria-live="polite">
        {!result ? <p>{missingPrice ? 'Confirm listed price at store to calculate checkout.' : 'Enter valid positive numbers.'}</p> : <>
          <div><span>Pay at checkout</span><strong>{money(result.payNow ?? result.subtotal)}</strong></div>
          {result.discount > 0 && <p className="text-emerald-500 font-medium">✨ You save {money(result.discount)} instantly at payment.</p>}
          {result.cashback > 0 && <p>{money(result.cashback)} post-purchase cashback (Effective cost: <strong>{money(result.afterCashback ?? result.subtotal)}</strong>)</p>}
        </>}
      </div>
    </div>
  </details>;
}
