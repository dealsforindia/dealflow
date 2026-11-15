import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../src/utils/reviewEvidence.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const product = 'https://www.amazon.in/dp/B0BVZ8SSZL';
const evidence = { status: 'available', store: 'Amazon', product_id: 'B0BVZ8SSZL', source_url: product, checked_at: 1791180000, rating: 3.8, rating_count: null, review_count: null, reviews: [], message: 'Sample', method: 'html', cached: false };
function harness() {
  const calls = [], cleanups = [], observers = [];
  const exports = {};
  const context = {
    exports, URL, URLSearchParams, AbortController, setTimeout, clearTimeout,
    window: { IntersectionObserver: true },
    IntersectionObserver: class {
      constructor(callback) { this.callback = callback; observers.push(this); }
      observe() {} disconnect() {}
      visible(value) { this.callback([{ isIntersecting: value }]); }
    },
    require(name) {
      if (name === 'react') return { useEffect: fn => { const cleanup = fn(); if (cleanup) cleanups.push(cleanup); }, useSyncExternalStore: (_subscribe, snapshot) => snapshot() };
      if (name === './publicLinks') return { lookupTargetUrl: url => url };
      throw Error(`Unexpected dependency ${name}`);
    },
    fetch(url, { signal }) {
      return new Promise((resolve, reject) => {
        calls.push({ url: String(url), resolve: (data = evidence) => resolve({ ok: true, json: async () => data }), reject });
        signal.addEventListener('abort', () => reject(Error('Aborted')), { once: true });
      });
    },
  };
  vm.runInNewContext(compiled, context);
  return { ...exports, calls, cleanups, observers };
}
const settle = () => new Promise(resolve => setImmediate(resolve));

test('card and detail requests share one collection; completed evidence is reused', async () => {
  const h = harness();
  const card = h.ensureReviewEvidence('a', product);
  const detail = h.ensureReviewEvidence('a', product, true);
  assert.equal(card, detail); assert.equal(h.calls.length, 1);
  h.calls[0].resolve(); await card;
  await h.ensureReviewEvidence('a', product);
  assert.equal(h.calls.length, 1);
});

test('only two requests run; a opened product takes priority over waiting cards', async () => {
  const h = harness();
  const a = h.ensureReviewEvidence('a', product);
  const b = h.ensureReviewEvidence('b', product);
  const c = h.ensureReviewEvidence('c', product);
  const d = h.ensureReviewEvidence('d', product, true);
  assert.equal(h.calls.length, 2);
  h.calls[0].resolve(); await a; await settle();
  assert.match(h.calls[2].url, /deal_id=d/);
  h.calls[1].resolve(); await b; await settle();
  assert.match(h.calls[3].url, /deal_id=c/);
  h.calls[2].resolve(); h.calls[3].resolve(); await Promise.all([c, d]);
});

test('failed collections do not silently loop and can be retried explicitly', async () => {
  const h = harness();
  const first = h.ensureReviewEvidence('a', product);
  h.calls[0].reject(Error('Merchant unavailable')); await first;
  await h.ensureReviewEvidence('a', product); assert.equal(h.calls.length, 1);
  const retry = h.ensureReviewEvidence('a', product, true, true);
  assert.equal(h.calls.length, 2); h.calls[1].resolve(); await retry;
});

test('scrolling past waiting cards cancels their requests before they reach a merchant', async () => {
  const h = harness();
  const a = h.ensureReviewEvidence('a', product), b = h.ensureReviewEvidence('b', product);
  h.useAutomaticReviews('offscreen', product, { current: {} });
  h.observers[0].visible(true);
  h.observers[0].visible(false);
  h.calls[0].resolve(); h.calls[1].resolve(); await Promise.all([a, b]); await settle();
  assert.equal(h.calls.length, 2);
  h.observers[0].visible(true);
  assert.equal(h.calls.length, 3);
  h.calls[2].resolve(); await settle(); h.cleanups[0]();
});

test('untrusted sources and impossible ratings cannot populate the evidence cache', async () => {
  const h = harness();
  const invalidRating = h.collectReviewEvidence('a', product, new AbortController().signal);
  h.calls[0].resolve({ ...evidence, rating: 6 });
  await assert.rejects(invalidRating, /invalid rating/);
  const invalidSource = h.collectReviewEvidence('b', product, new AbortController().signal);
  h.calls[1].resolve({ ...evidence, source_url: 'https://example.com/product' });
  await assert.rejects(invalidSource, /source could not be verified/);
});
