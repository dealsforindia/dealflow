import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
const source = readFileSync(new URL('../src/utils/checkout.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
const { calculateCheckout, checkoutAmount } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const input = { delivery: 50, instantDiscount: 100, cashback: 200, eligibilityConfirmed: true };

test('later cashback never reduces what is paid at checkout', () => {
  assert.deepEqual(calculateCheckout(1000, input), { subtotal: 900, payNow: 950, cashback: 200, afterCashback: 750, discount: 100, capped: false });
});
test('unknown delivery produces a partial calculation, not a complete total', () => {
  const result = calculateCheckout(1000, { ...input, delivery: null });
  assert.equal(result.subtotal, 900);
  assert.equal(result.payNow, null);
  assert.equal(result.afterCashback, null);
  assert.equal(calculateCheckout(1000, { ...input, delivery: 0 }).payNow, 900);
});
test('unconfirmed eligibility excludes instant discounts and cashback', () => {
  assert.deepEqual(calculateCheckout(1000, { ...input, eligibilityConfirmed: false }), { subtotal: 1000, payNow: 1050, cashback: 0, afterCashback: 1050, discount: 0, capped: false });
});
test('invalid prices and negative or malformed amounts cannot yield a total', () => {
  for (const price of [null, 0, -1, NaN, Infinity]) assert.equal(calculateCheckout(price, input), null);
  assert.equal(calculateCheckout(1000, { ...input, delivery: -1 }), null);
  assert.equal(calculateCheckout(1000, { ...input, instantDiscount: NaN }), null);
  assert.equal(calculateCheckout(1000, { ...input, cashback: -1 }), null);
  assert.equal(checkoutAmount(''), null);
  assert.equal(checkoutAmount('0'), 0);
  assert.equal(checkoutAmount('20.25'), 20.25);
  for (const value of ['-1', '1e3', '12foo', '1.234']) assert.equal(Number.isNaN(checkoutAmount(value)), true);
});
test('overstated discounts are capped, with delivery still payable', () => {
  const result = calculateCheckout(1000, { ...input, instantDiscount: 1200 });
  assert.equal(result.payNow, 50);
  assert.equal(result.cashback, 0);
  assert.equal(result.afterCashback, 50);
  assert.equal(result.capped, true);
});
test('decimal arithmetic is rounded to currency precision', () => {
  assert.equal(calculateCheckout(100.3, { ...input, delivery: 0.2, instantDiscount: 0.1, cashback: 0 }).payNow, 100.4);
});
