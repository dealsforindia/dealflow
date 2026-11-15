import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { resolveStoreRedirect, merchantDestination, unavailableOfferPage } from '../server/storeRedirect.mjs';
const source = readFileSync(new URL('../src/utils/publicLinks.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
const publicModule = `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`;
const { publicStoreUrl, publicShareUrl, publicDeal, selectTickerDeals, lookupTargetUrl } = await import(publicModule);
const offer = { id: 'real', title: 'CPU', price: 12500, mrp: 14000, url: 'https://www.amazon.in/dp/B012345678?tag=affiliate-21', posted_at: 1700000000 };
test('merchant affiliate destinations remain intact; private redirects stay on the website', () => {
  assert.equal(publicStoreUrl(offer.url), offer.url);
  assert.equal(publicStoreUrl('https://api.rudranil.me/r/deal_1?subid=hero'), '/out/deal_1?subid=hero');
  assert.equal(lookupTargetUrl('/out/deal_1'), 'https://api.rudranil.me/r/deal_1');
  for (const value of ['javascript:alert(1)', '#', '', 'not a URL', '/out/deal_1/unexpected', 'https://api.rudranil.me/admin']) assert.equal(publicStoreUrl(value), '');
  assert.equal(publicShareUrl('/out/deal_1'), 'https://indiadealhunts.vercel.app/out/deal_1');
});

test('nested haul and comparison links receive the same public normalization', () => {
  const result = publicDeal({ ...offer, items: [{ id: 'item', buy_url: 'https://api.rudranil.me/r/item_1', sale_price: 123 }], arbitrage: { winnerStore: 'Amazon', stores: [{ store: 'Amazon', price: 123, url: 'https://api.rudranil.me/r/item_1' }] } });
  assert.equal(result.items[0].buy_url, '/out/item_1');
  assert.equal(result.items[0].sale_price, 123);
  assert.equal(result.arbitrage.stores[0].url, '/out/item_1');
});

test('Android routing preserves bundle items and affiliate parameters, while directory routes remain web links', async () => {
  const affiliateSource = readFileSync(new URL('../src/utils/affiliateEngine.ts', import.meta.url), 'utf8');
  const affiliateCompiled = ts.transpileModule(affiliateSource, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText.replace(/import \{ useState, useEffect \} from 'react';/, '').replace("from './publicLinks'", `from '${publicModule}'`);
  const { openSmartStoreLink } = await import(`data:text/javascript;base64,${Buffer.from(affiliateCompiled).toString('base64')}`);
  const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'window'), navigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator'), timerDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'setTimeout');
  const fakeWindow = { location: { href: '', origin: 'https://indiadealhunts.vercel.app' }, innerWidth: 390 };
  Object.defineProperty(globalThis, 'window', { configurable: true, value: fakeWindow });
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { userAgent: 'Android', maxTouchPoints: 1 } });
  Object.defineProperty(globalThis, 'setTimeout', { configurable: true, value: () => 0 });
  try {
    openSmartStoreLink('https://www.amazon.in/gp/aws/cart/add.html?ASIN.1=B012345678&ASIN.2=B087654321&AssociateTag=original-21', 'Amazon', 'B012345678', true, 'hero');
    assert.match(fakeWindow.location.href, /ASIN\.2=B087654321/);
    assert.match(fakeWindow.location.href, /AssociateTag=original-21/);
    assert.match(fakeWindow.location.href, /ascsubtag=hero/);
    openSmartStoreLink('https://api.rudranil.me/r/deal_1', 'Flipkart', undefined, false, 'hero');
    assert.equal(fakeWindow.location.href, 'https://indiadealhunts.vercel.app/out/deal_1?subid=hero');
  } finally {
    for (const [key, descriptor] of [['window', windowDescriptor], ['navigator', navigatorDescriptor], ['setTimeout', timerDescriptor]]) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key); }
  }
});
test('the strip excludes expired, duplicate, pending and invalid offers without inventing metadata', () => {
  const result = selectTickerDeals([offer, offer, { ...offer, id: 'expired', is_over: true }, { ...offer, id: 'pending', status: 'pending_approval' }, { ...offer, id: 'bad', price: NaN }, { ...offer, id: 'no-link', url: '#' }]);
  assert.deepEqual(result, [offer]);
  assert.equal(result[0].posted_at, 1700000000);
  assert.deepEqual(selectTickerDeals(), []);
});
test('the public redirect forwards a confirmed destination and affiliate placement', async () => {
  let requested;
  const result = await resolveStoreRedirect('deal_1', new URLSearchParams('subid=hero&other=ignored'), async url => { requested = url; return { status: 302, headers: new Headers({ location: offer.url }) }; });
  assert.equal(requested.search, '?subid=hero');
  assert.deepEqual(result, { status: 302, location: offer.url });
});
test('unresolved redirects and infrastructure errors never expose raw backend pages', async () => {
  for (const status of [200, 404, 500]) {
    const result = await resolveStoreRedirect('deal_1', undefined, async () => ({ status, headers: new Headers() }));
    assert.equal(result.location, undefined);
    assert.equal(result.status, status === 404 ? 404 : 503);
  }
  assert.equal((await resolveStoreRedirect('../bad')).status, 404);
  assert.equal((await resolveStoreRedirect('deal_1', undefined, async () => { throw new Error('secret infrastructure message'); })).status, 503);
  assert.equal(unavailableOfferPage.includes('api.rudranil'), false);
  for (const url of ['http://www.amazon.in/product', 'https://api.rudranil.me/r/x', 'https://127.0.0.1/', 'https://10.0.0.1/', 'javascript:alert(1)']) assert.equal(merchantDestination(url), null);
});
