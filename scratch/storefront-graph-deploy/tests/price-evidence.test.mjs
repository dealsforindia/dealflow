import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
const source = readFileSync(new URL('../src/utils/priceEvidence.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { priceFreshness, normalizeLookup } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const now = 1800000000000;
test('retrieving an old quote never promotes it to a current merchant price', () => {
  assert.equal(normalizeLookup({ price: 499, title: 'CPU', history: [[1700000000, 499]] }).price, null);
  assert.equal(priceFreshness({ last_checked_at: now }, now).current, false);
  assert.equal(priceFreshness({ price_source: 'merchant_product_page', price_verified: true, last_checked_at: now - 3600000 }, now).current, false);
});
test('confirmed prices accept seconds or milliseconds but reject future check times', () => {
  const quote = { price_source: 'merchant_product_page', price_verified: true, last_checked_at: now / 1000 };
  assert.equal(priceFreshness(quote, now).current, true);
  assert.equal(priceFreshness({ ...quote, last_checked_at: now }, now).current, true);
  assert.equal(priceFreshness({ ...quote, last_checked_at: now + 120000 }, now).current, false);
});
test('unconfirmed prices cannot leave a stale MRP or discount beside a missing price', () => {
  const quote = normalizeLookup({ price: 499, mrp: 999, discount_pct: 50, price_verified: false });
  assert.equal(quote.price, null); assert.equal(quote.mrp, null); assert.equal(quote.discount_pct, null);
  assert.equal(quote.reported_price, 499); assert.equal(quote.pendingLivePrice, true);
});
