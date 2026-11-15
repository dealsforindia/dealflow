import { PublicDeal } from '../types';
import { publicShareUrl } from './publicLinks';

/**
 * Formats source-reported offer summaries and public storefront links.
 */

export function formatDealShareText(deal: PublicDeal): string {
  const price = deal.price ? `₹${deal.price.toLocaleString('en-IN')}` : 'Lightning Deal';
  const mrp = deal.mrp && deal.price && deal.mrp > deal.price ? ` (MRP: ₹${deal.mrp.toLocaleString('en-IN')})` : '';
  const discount = deal.discount_pct ? `\n🏷️ *Discount:* ${deal.discount_pct}% OFF` : '';
  const savings = deal.mrp && deal.price && deal.mrp > deal.price ? ` (Save ₹${(deal.mrp - deal.price).toLocaleString('en-IN')})` : '';
  const store = deal.store || 'Store';
  const shareUrl = publicShareUrl(deal.url);

  return `*IndiaDealHunts find*\n\n${deal.title}\n\nListed price: ${price}${mrp}${discount}${savings}\nStore: ${store}\n\nView offer: ${shareUrl}\n\nConfirm price, stock and offer eligibility at checkout. MRP is a reference price.`;
}

export function shareToWhatsApp(deal: PublicDeal): void {
  const text = formatDealShareText(deal);
  const encoded = encodeURIComponent(text);
  const url = `https://api.whatsapp.com/send?text=${encoded}`;
  
  try {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch {
    window.open(url, '_blank');
  }
}

export function shareToTelegram(deal: PublicDeal): void {
  const text = formatDealShareText(deal);
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(publicShareUrl(deal.url));
  const url = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
  
  try {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch {
    window.open(url, '_blank');
  }
}

/** Opens the device share chooser; unsupported browsers fall back to copying. */
export async function shareDeal(deal: PublicDeal): Promise<'shared' | 'copied' | 'cancelled' | 'failed'> {
  const url = publicShareUrl(deal.url);
  if (!url) return 'failed';
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title: deal.title || 'IndiaDealHunts find', text: 'Found on IndiaDealHunts. Confirm price and availability at the store.', url });
      return 'shared';
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return 'cancelled';
    }
  }
  return await copyDealLink(deal) ? 'copied' : 'failed';
}

export async function copyDealLink(deal: PublicDeal): Promise<boolean> {
  try {
    const link = publicShareUrl(deal.url);
    if (!link) return false;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(link);
      return true;
    }
    // Fallback for older browsers
    const input = document.createElement('textarea');
    input.value = link;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    return true;
  } catch {
    return false;
  }
}
