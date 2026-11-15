/**
 * DealFlow Saved Loot (Favorites / Bookmarks) Utility
 * Persists saved deal IDs to localStorage with cross-component reactivity
 */

import type { PublicDeal } from '../types';
import { publicDeal, isDisplayableOffer } from './publicLinks';

const STORAGE_KEY = 'dealflow_saved_deals_v1';
const SNAPSHOT_KEY = 'indiadealhunts_saved_offers_v1';
const EVENT_NAME = 'dealflow_saved_deals_changed';

export function getSavedDealIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string' && !!id) : [];
  } catch {
    return [];
  }
}

export function saveDealId(id: string): string[] {
  if (typeof window === 'undefined' || !id) return [];
  try {
    const current = getSavedDealIds();
    if (!current.includes(id)) {
      const next = [id, ...current];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next }));
      return next;
    }
    return current;
  } catch {
    return [];
  }
}

export function removeSavedDealId(id: string): string[] {
  if (typeof window === 'undefined' || !id) return [];
  try {
    const current = getSavedDealIds();
    const next = current.filter((item) => item !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next }));
    return next;
  } catch {
    return [];
  }
}

/** Saved cards remain available after pagination, filtering, and a page reload. */
export function getSavedDealSnapshots(): PublicDeal[] {
  if (typeof window === 'undefined') return [];
  try {
    const records = JSON.parse(localStorage.getItem(SNAPSHOT_KEY) || '[]');
    const ids = new Set(getSavedDealIds());
    return Array.isArray(records) ? records.filter(deal => deal && ids.has(deal.id) && isDisplayableOffer(deal)).map(publicDeal) : [];
  } catch { return []; }
}

export function rememberSavedDeals(deals: PublicDeal[]): void {
  if (typeof window === 'undefined') return;
  try {
    const ids = new Set(getSavedDealIds());
    const records = new Map(getSavedDealSnapshots().map(deal => [deal.id, deal]));
    for (const deal of deals) {
      if (ids.has(deal.id) && isDisplayableOffer(deal)) {
        const { id, title, price, mrp, discount_pct, store, image, url, category, posted_at, display_ts, fp_hash, coupon, is_expired, is_over, status } = publicDeal(deal);
        records.set(id, { id, title, price, mrp, discount_pct, store, image, url, category, posted_at, display_ts, fp_hash, coupon, is_expired, is_over, status });
      }
    }
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify([...records.values()].filter(deal => ids.has(deal.id))));
  } catch { /* Bookmarked IDs still work when snapshot storage is unavailable. */ }
}

export function toggleSavedDealId(id: string, deal?: PublicDeal): { isSaved: boolean; list: string[] } {
  const current = getSavedDealIds();
  const exists = current.includes(id);
  if (exists) {
    const next = removeSavedDealId(id);
    rememberSavedDeals([]);
    return { isSaved: false, list: next };
  } else {
    const next = saveDealId(id);
    if (deal) rememberSavedDeals([deal]);
    return { isSaved: true, list: next };
  }
}

export function isDealSaved(id: string): boolean {
  return getSavedDealIds().includes(id);
}

export function clearAllSavedDealIds(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SNAPSHOT_KEY);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: [] }));
  } catch {
    // Graceful fallback
  }
}

export function subscribeSavedDeals(callback: (ids: string[]) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustom = (e: Event) => {
    const custom = e as CustomEvent<string[]>;
    callback(custom.detail || getSavedDealIds());
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback(getSavedDealIds());
    }
  };

  window.addEventListener(EVENT_NAME, handleCustom);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(EVENT_NAME, handleCustom);
    window.removeEventListener('storage', handleStorage);
  };
}
