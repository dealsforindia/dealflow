import { useEffect, useSyncExternalStore, type RefObject } from 'react';
import { lookupTargetUrl } from './publicLinks';

export interface ReviewEvidence {
  status: 'available' | 'unavailable' | 'blocked' | 'busy';
  store: string; product_id: string; source_url: string; checked_at: number;
  rating: number | null; rating_count: number | null; review_count: number | null;
  reviews: { text: string; title: string; rating: number | null; date: string | null; verified_purchase: boolean | null }[];
  message: string; method: string | null; cached: boolean;
}
const evidence = new Map<string, ReviewEvidence>();
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export function useReviewEvidence(id: string) { return useSyncExternalStore(subscribe, () => evidence.get(id), () => undefined); }

type ReviewLoadState = { status: 'queued' | 'loading' | 'done' | 'error'; message?: string };
const loads = new Map<string, ReviewLoadState>();
const requests = new Map<string, Promise<void>>();
const queue: { id: string; url: string; priority: boolean; finish: () => void }[] = [];
const viewers = new Map<string, Set<symbol>>();
let activeRequests = 0;
const notify = () => listeners.forEach(listener => listener());
const updateLoad = (id: string, state: ReviewLoadState) => { loads.set(id, state); notify(); };

// A page of cards must not produce a burst of simultaneous merchant requests.
function drainQueue() {
  while (activeRequests < 2 && queue.length) {
    const job = queue.shift()!;
    activeRequests++;
    updateLoad(job.id, { status: 'loading' });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    void collectReviewEvidence(job.id, job.url, controller.signal)
      .then(() => updateLoad(job.id, { status: 'done' }))
      .catch((failure: unknown) => updateLoad(job.id, {
        status: 'error',
        message: controller.signal.aborted ? 'The merchant took too long to respond.' : failure instanceof Error ? failure.message : 'Review collection is unavailable.',
      }))
      .finally(() => {
        clearTimeout(timeout);
        activeRequests--;
        requests.delete(job.id);
        job.finish();
        drainQueue();
      });
  }
}

export function ensureReviewEvidence(id: string, url: string, priority = false, retry = false): Promise<void> {
  const pending = requests.get(id);
  if (pending) {
    if (priority) {
      const index = queue.findIndex(job => job.id === id);
      if (index >= 0) {
        queue[index].priority = true;
        if (index > 0) queue.unshift(...queue.splice(index, 1));
      }
    }
    return pending;
  }
  if (!retry && (evidence.has(id) || loads.get(id)?.status === 'error')) return Promise.resolve();
  if (loads.size >= 256) {
    const idleId = [...loads.keys()].find(key => !requests.has(key));
    if (idleId) { loads.delete(idleId); evidence.delete(idleId); }
  }
  if (!url) {
    updateLoad(id, { status: 'error', message: 'No specific merchant product link is available for this offer.' });
    return Promise.resolve();
  }
  let finish!: () => void;
  const promise = new Promise<void>(resolve => { finish = resolve; });
  requests.set(id, promise);
  updateLoad(id, { status: 'queued' });
  const job = { id, url, priority, finish };
  if (priority) queue.unshift(job); else queue.push(job);
  drainQueue();
  return promise;
}

export function useAutomaticReviews(id: string, url: string, target?: RefObject<HTMLElement | null>) {
  const result = useReviewEvidence(id);
  const load = useSyncExternalStore(subscribe, () => loads.get(id), () => undefined);
  useEffect(() => {
    if (!target) { void ensureReviewEvidence(id, url, true); return; }
    const element = target.current;
    if (!element) return;
    if (!('IntersectionObserver' in window)) { void ensureReviewEvidence(id, url); return; }
    const viewer = Symbol(id);
    const release = () => {
      const interested = viewers.get(id);
      interested?.delete(viewer);
      if (interested?.size) return;
      viewers.delete(id);
      // Cancel work that has not started when its last visible card leaves view.
      // A product-details request has priority and must survive card unmounting.
      const index = queue.findIndex(job => job.id === id && !job.priority);
      if (index >= 0) {
        const [job] = queue.splice(index, 1);
        requests.delete(id);
        loads.delete(id);
        job.finish();
        notify();
      }
    };
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        const interested = viewers.get(id) || new Set<symbol>();
        interested.add(viewer);
        viewers.set(id, interested);
        void ensureReviewEvidence(id, url);
      } else release();
    }, { rootMargin: '80px 0px' });
    observer.observe(element);
    return () => { observer.disconnect(); release(); };
  }, [id, url, target]);
  return { result, load, retry: () => ensureReviewEvidence(id, url, true, true) };
}

export async function collectReviewEvidence(id: string, url: string, signal: AbortSignal): Promise<ReviewEvidence> {
  let source = url;
  // Existing public offer links conceal gateway URLs. Resolve via the read-only shopper lookup.
  if (/^\/out\//.test(url)) {
    const response = await fetch('/api/v1/deals/lookup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: lookupTargetUrl(url) }), signal });
    if (!response.ok) throw new Error('A specific merchant product link is needed to collect reviews.');
    const resolved = await response.json();
    source = resolved.raw_url || '';
  }
  const query = new URLSearchParams({ url: source, deal_id: id });
  const response = await fetch(`/api/v1/products/reviews?${query}`, { signal });
  if (!response.ok) throw new Error(response.status === 400 ? 'Reviews need a specific Amazon, Flipkart or Myntra product link.' : 'Review collection is temporarily unavailable. Please try again.');
  const result: ReviewEvidence = await response.json();
  if (!['available', 'unavailable', 'blocked', 'busy'].includes(result.status) || !Array.isArray(result.reviews)) throw new Error('The review service returned an unexpected response.');
  if (result.rating != null && (!Number.isFinite(result.rating) || result.rating <= 0 || result.rating > 5)) throw new Error('The review service returned an invalid rating.');
  const merchant = new URL(result.source_url);
  if (merchant.protocol !== 'https:' || !['www.amazon.in', 'www.flipkart.com', 'www.myntra.com'].includes(merchant.hostname)) throw new Error('The review source could not be verified.');
  if (!Number.isFinite(result.checked_at)) throw new Error('The review evidence has no valid collection timestamp.');
  if (evidence.size >= 256 && !evidence.has(id)) evidence.delete(evidence.keys().next().value!);
  evidence.set(id, result);
  listeners.forEach(listener => listener());
  return result;
}
