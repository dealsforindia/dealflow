import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
const source = readFileSync(new URL('../src/utils/shoppingIntelligence.ts', import.meta.url), 'utf8');
const evidenceSource = readFileSync(new URL('../src/utils/priceEvidence.ts', import.meta.url), 'utf8');
const evidenceModule = `data:text/javascript;base64,${Buffer.from(ts.transpileModule(evidenceSource, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText).toString('base64')}`;
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText.replace("from './priceEvidence'", `from '${evidenceModule}'`);
const { cleanHistory, productIdentity, offerIdentity, groupProducts, decisionFor, parseMission, shoppingMatch, validGtin } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const offer = { id: 'ext_gshop_1', title: 'OnePlus Nord CE4 8GB 128GB Celadon Marble', price: 19000, mrp: 25000, store: 'Amazon', url: 'https://www.amazon.in/dp/B0CX25NP84?tag=owner-21', image: null };
test('variants remain separate and identical merchant products group', () => {
  assert.equal(groupProducts([offer, { ...offer, id: 'another', url: 'https://www.amazon.in/dp/B0CX25NP84?tag=old-21' }]).length, 1);
  assert.equal(groupProducts([offer, { ...offer, id: 'variant', title: 'OnePlus Nord CE4 8GB 256GB', url: 'https://www.amazon.in/dp/B0CX25NP85' }]).length, 2);
  assert.equal(productIdentity(offer), 'amazon:B0CX25NP84');
});
test('positional backend IDs cannot collide across saved products', () => {
  assert.notEqual(offerIdentity(offer), offerIdentity({ ...offer, url: 'https://www.amazon.in/dp/B0CX25NP85' }));
  assert.equal(offerIdentity(offer), offerIdentity({ ...offer, url: 'https://www.amazon.in/dp/B0CX25NP84?tag=different-21' }));
});
test('no buy verdict is inferred from MRP or a history flag', () => {
  assert.equal(decisionFor({ ...offer, has_price_history: true }).label, 'Verify first');
  assert.equal(decisionFor({ ...offer, history: [[1700000000, 1000]] }).label, 'Verify first');
  assert.equal(decisionFor({ ...offer, price: NaN }).label, 'Check price');
  assert.equal(decisionFor({ ...offer, in_stock: false }).label, 'Unavailable');
});
test('history is normalized, deduplicated and invalid points rejected', () => {
  assert.deepEqual(cleanHistory([[1700000001, 900], [1700000000, 1000], [1700000000, 1100], [1700000002, -1], [NaN, 100]]), [[1700000000000, 1100], [1700000001000, 900]]);
  assert.deepEqual(cleanHistory({ bad: true }), []);
});
test('timing verdicts derive only from actual historical observations', () => {
  const history = [[1700000000, 18000], [1700000001, 20000]];
  const current = { price_verified: true, price_source: 'merchant_product_page', last_checked_at: Date.now() };
  assert.equal(decisionFor({ ...offer, ...current, price: 17000, history }).label, 'At recorded low');
  assert.equal(decisionFor({ ...offer, ...current, price: 19000, history }).label, 'Near recorded low');
  assert.equal(decisionFor({ ...offer, ...current, price: 22000, history }).label, 'Consider waiting');
  assert.equal(decisionFor({ ...offer, price: 17000, history }).label, 'Verify first');
  assert.equal(decisionFor({ ...offer, ...current, last_checked_at: Date.now() - 3600000, history }).label, 'Verify first');
});
test('natural-language budgets parse currency, k and lakh correctly', () => {
  assert.equal(parseMission('cpu under ₹20k').budget, 20000);
  assert.equal(parseMission('laptop below 1.5 lakh').budget, 150000);
  assert.equal(parseMission('SSD less than 7000').budget, 7000);
  assert.equal(parseMission('cpu').budget, null);
});

test('standalone CPU searches distinguish full computers and explicit accessory searches', () => {
  assert.equal(shoppingMatch('cpu', { ...offer, title: 'ASUS Vivobook S16 Gaming Grade CPU 16 GB RAM' }), 'related');
  assert.equal(shoppingMatch('processor', { ...offer, title: 'Assembled Desktop Intel Core i5 PC' }), 'related');
  assert.equal(shoppingMatch('cpu cooler', { ...offer, title: 'Thermalright CPU Cooler Fan' }), 'product');
  assert.equal(shoppingMatch('cpu', { ...offer, title: 'AMD Ryzen 5 5600 Processor' }), 'product');
});

test('duplicate merchant offers retain directory identity and enrich evidence', () => {
  const groups = groupProducts([
    { ...offer, source_type: 'database_verified' },
    { ...offer, id: 'lookup', source_type: 'google_shopping', history: [[1700000000, 20000], [1700000001, 18000]], in_stock: false },
  ]);
  assert.equal(groups[0].offers.length, 1);
  assert.equal(groups[0].offers[0].source_type, 'database_verified');
  assert.equal(cleanHistory(groups[0].offers[0].history).length, 2);
  assert.equal(groups[0].offers[0].in_stock, false);
});

test('CPU accessories are not represented as processor matches', () => {
  assert.equal(shoppingMatch('cpu under 20k', { ...offer, title: '120mm CPU cooling fan' }), 'related');
  assert.equal(shoppingMatch('processor', { ...offer, title: 'Power supply with 4+4 CPU cable' }), 'related');
  assert.equal(shoppingMatch('cpu under 20k', { ...offer, title: 'AMD Ryzen 5 7600 Desktop Processor' }), 'product');
});

test('Flipkart variants with distinct product IDs are never merged', () => {
  assert.notEqual(productIdentity({ ...offer, url: 'https://www.flipkart.com/phone/p/itm123?pid=MOB128' }), productIdentity({ ...offer, url: 'https://www.flipkart.com/phone/p/itm123?pid=MOB256' }));
});


test('merchant IDs and matching titles cannot establish cross-store identity', () => {
  const a = { ...offer, url: 'https://example.com/product/a', product_id: '123' };
  assert.notEqual(productIdentity(a), productIdentity({ ...a, store: 'Flipkart' }));
  const b = { ...a, product_id: undefined };
  assert.notEqual(productIdentity(b), productIdentity({ ...b, store: 'Flipkart' }));
});
test('only checksum-valid global barcodes allow cross-store grouping', () => {
  assert.equal(validGtin('4006381333931'), true);
  assert.equal(validGtin('4006381333932'), false);
  assert.equal(validGtin('00000000'), false);
  const a = { ...offer, gtin: '4006381333931' };
  assert.equal(productIdentity(a), productIdentity({ ...a, store: 'Flipkart', url: 'https://flipkart.com/other' }));
  assert.notEqual(productIdentity(a), productIdentity({ ...a, gtin: '4006381333932', store: 'Flipkart', url: 'https://flipkart.com/other' }));
});
