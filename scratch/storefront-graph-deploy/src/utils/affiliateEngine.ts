/**
 * Core Affiliate & Deep-Linking Engine
 * Handles 90-Day Cart Locks, Multi-ASIN bundles, Native Mobile OS Intents, and Client-Side SubID Attribution.
 */
import { useState, useEffect } from 'react';
import { publicStoreUrl, lookupTargetUrl } from './publicLinks';

export const DEFAULT_AMAZON_TAG = 'rudranil0a-21';

/**
 * Generates an authentic Amazon India search URL with 100% affiliate attribution.
 */
export function buildAmazonSearchUrl(query: string, tag: string = DEFAULT_AMAZON_TAG): string {
  const cleanQ = encodeURIComponent(query.trim());
  return `https://www.amazon.in/s?k=${cleanQ}&tag=${tag}`;
}

/**
 * Robust device detector differentiating PC / Mac Desktop from Mobile Phones & Tablets.
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTouchPhone = ('ontouchstart' in window || navigator.maxTouchPoints > 0) && window.innerWidth < 768;
  return isMobileUA || isTouchPhone;
}

/**
 * Reactive React hook for device type tracking (Desktop vs Mobile).
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => isMobileDevice());

  useEffect(() => {
    const handleResize = () => setIsMobile(isMobileDevice());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

/**
 * Normalizes store URLs so Desktop PC users always land on full desktop experiences,
 * never mobile or app deep-link domains.
 */
export function normalizeUrlForDevice(url: string, isMobile: boolean): string {
  if (!url) return url;
  if (!isMobile) {
    let clean = url;
    // dl.flipkart.com/dl/... -> www.flipkart.com/...
    clean = clean.replace(/^https?:\/\/dl\.flipkart\.com\/dl\//i, 'https://www.flipkart.com/');
    // m.flipkart.com -> www.flipkart.com
    clean = clean.replace(/^https?:\/\/m\.flipkart\.com\//i, 'https://www.flipkart.com/');
    // m.myntra.com -> www.myntra.com
    clean = clean.replace(/^https?:\/\/m\.myntra\.com\//i, 'https://www.myntra.com/');
    // m.amazon.in -> www.amazon.in
    clean = clean.replace(/^https?:\/\/m\.amazon\.(in|com)\//i, 'https://www.amazon.$1/');
    // /gp/aw/d/ -> /dp/
    clean = clean.replace(/\/gp\/aw\/d\//i, '/dp/');
    return clean;
  }
  return url;
}

/**
 * Extracts a 10-character ASIN from any standard Amazon URL or string.
 */
export function extractAmazonAsin(urlOrId: string): string | null {
  if (!urlOrId) return null;
  // Match direct ASIN in string or URL
  const match = urlOrId.match(/(?:dp|gp\/product|asin=|ext_amz_|\/)([A-Z0-9]{10})(?:[/?&#]|$)/i);
  return match ? match[1].toUpperCase() : null;
}

/**
 * Generates the "90-Day Cart Lock" URL via the Amazon AWS Cart Add Endpoint.
 */
export function buildAmazonCartUrl(asin: string, tag: string = DEFAULT_AMAZON_TAG, subId?: string): string {
  let url = `https://www.amazon.in/gp/aws/cart/add.html?ASIN.1=${asin}&Quantity.1=1&AssociateTag=${tag}`;
  if (subId) {
    url += `&ascsubtag=${encodeURIComponent(subId)}`;
  }
  return url;
}

/**
 * Generates a Multi-ASIN Cart Bundle URL (e.g. Phone + Cable / Case).
 */
export function buildMultiAsinCartUrl(
  mainAsin: string,
  bundleAsin: string,
  tag: string = DEFAULT_AMAZON_TAG,
  subId?: string
): string {
  let url = `https://www.amazon.in/gp/aws/cart/add.html?ASIN.1=${mainAsin}&Quantity.1=1&ASIN.2=${bundleAsin}&Quantity.2=1&AssociateTag=${tag}`;
  if (subId) url += `&ascsubtag=${encodeURIComponent(subId)}`;
  return url;
}

/**
 * Dynamically generates a SubID for tracking placement and device without a database.
 * Format: [SOURCE]_[DEAL_ID]_[DEVICE]
 */
export function generateSubId(source: string, dealId: string): string {
  if (typeof window === 'undefined') return `${source}_${(dealId || 'deal').slice(0, 10)}_ssr`;

  const isMobile = isMobileDevice() ? 'mob' : 'desk';
  const cleanId = (dealId || 'deal').slice(0, 10).replace(/[^a-zA-Z0-9]/g, '');
  return `${source}_${cleanId || 'id'}_${isMobile}`;
}

/**
 * Appends SubID parameter to any web URL based on retailer domain.
 */
export function injectSubIdToUrl(url: string, subId: string): string {
  if (!url) return url;
  try {
    const parsed = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'https://indiadealhunts.com');
    if (parsed.hostname.includes('amazon.')) {
      parsed.searchParams.set('ascsubtag', subId);
    } else {
      parsed.searchParams.set('subid', subId);
    }
    return parsed.toString();
  } catch {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}subid=${encodeURIComponent(subId)}`;
  }
}

export interface CompanionAccessory {
  id: string;
  name: string;
  asin: string;
  price: number;
  badge: string;
}

export const COMPANION_ACCESSORIES: Record<string, CompanionAccessory> = {
  cable: {
    id: 'cable',
    name: 'Braided 65W Fast Type-C Cable',
    asin: 'B0CHVR643F',
    price: 199,
    badge: '⚡ Recommended Accessory',
  },
  stuffer: {
    id: 'stuffer',
    name: '₹499 Free Delivery Stuffer (Snack/Dry Fruits 100g)',
    asin: 'B08L9S8R6L',
    price: 110,
    badge: '📦 Avoid ₹40 Delivery Fee',
  },
};

/**
 * Recommends an accessory bundle based on product category & price.
 */
export function getRecommendedBundle(category?: string, price?: number): CompanionAccessory | null {
  const cat = (category || '').toLowerCase();
  // If under ₹499 and positive, recommend delivery fee stuffer
  if (price && price > 0 && price < 490) {
    return COMPANION_ACCESSORIES.stuffer;
  }
  // If electronics / gadgets / phone, recommend fast cable / accessory
  if (cat.includes('elect') || cat.includes('phone') || cat.includes('mobile') || cat.includes('watch') || cat.includes('laptop')) {
    return COMPANION_ACCESSORIES.cable;
  }
  return null;
}

/**
 * Device-Aware Store Link Opener
 * - Desktop PC/Mac: Strips mobile URL artifacts, never triggers popup window mode,
 *   and opens a full new tab in the desktop browser at complete resolution.
 * - Mobile Phones (Android): Uses native app intents (Amazon / Flipkart) with 400ms web fallback.
 * - Mobile Phones (iOS): Direct navigation letting Universal Links seamlessly route into installed apps.
 */
export function openSmartStoreLink(
  webAffiliateUrl: string,
  store: string,
  asin?: string,
  forceCart: boolean = false,
  subId?: string
): void {
  if (typeof window === 'undefined') return;

  webAffiliateUrl = publicStoreUrl(webAffiliateUrl);
  if (!webAffiliateUrl) return;

  const isMobile = isMobileDevice();
  const rawUrl = subId ? injectSubIdToUrl(webAffiliateUrl, subId) : webAffiliateUrl;
  const targetWebUrl = normalizeUrlForDevice(rawUrl, isMobile);

  // 1. MOBILE ROUTING (Android Native App Intents / iOS Deep Links)
  if (isMobile) {
    const isAndroid = /Android/i.test(navigator.userAgent || '');
    if (isAndroid) {
      let intentUrl = '';
      const cleanAsin = asin || extractAmazonAsin(webAffiliateUrl);

      if (store.toLowerCase().includes('amazon') && cleanAsin && /^https:\/\/(?:www\.|m\.)?amazon\.in\//i.test(targetWebUrl)) {
        // Preserve the actual affiliate query and every item in a cart bundle.
        const destination = new URL(targetWebUrl);
        const targetPath = `${destination.pathname.replace(/^\//, '')}${destination.search}`;
        intentUrl = `intent://www.amazon.in/${targetPath}#Intent;scheme=https;package=in.amazon.mShop.android.shopping;end`;
      } else if (store.toLowerCase().includes('flipkart') && /^https:\/\/(?:www\.|dl\.)?flipkart\.com\//i.test(targetWebUrl)) {
        const rawPath = targetWebUrl.replace(/^https?:\/\/(?:www\.|dl\.)?flipkart\.com\/(?:dl\/)?/, '');
        intentUrl = `intent://dl.flipkart.com/dl/${rawPath}#Intent;scheme=https;package=com.flipkart.android;end`;
      }

      if (intentUrl) {
        const start = Date.now();
        window.location.href = intentUrl;

        // If native app doesn't open within 400ms, fallback to mobile web
        setTimeout(() => {
          if (Date.now() - start < 1500) {
            window.location.href = targetWebUrl;
          }
        }, 400);
        return;
      }
    }

    // iOS or generic mobile browser
    window.location.href = targetWebUrl;
    return;
  }

  // 2. DESKTOP PC / MAC ROUTING:
  // Never pass non-standard windowFeatures to window.open! Chromium interprets unrecognized
  // features (such as 'sponsored') as POPUP WINDOW mode and restricts the window to ~516px width,
  // which forces responsive e-commerce stores to render their mobile web version!
  // Instead, open a full, standard desktop tab via a simulated clean anchor click.
  const destinationUrl = lookupTargetUrl(targetWebUrl);
  try {
    const a = document.createElement('a');
    a.href = destinationUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch {
    window.open(destinationUrl, '_blank');
  }
}
