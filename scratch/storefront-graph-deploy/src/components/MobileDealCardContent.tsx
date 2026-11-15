import { useEffect, useRef, useState } from 'react';
import { Bookmark, Check, ChevronRight, Copy, GitCompareArrows, MoreHorizontal, Send, ShoppingBag, Zap, ShoppingCart, Plus, CheckSquare, Square } from 'lucide-react';
import { PublicDeal } from '../types';
import { copyDealLink, shareToTelegram, shareToWhatsApp } from '../utils/shareDeal';
import {
  extractAmazonAsin,
  buildAmazonCartUrl,
  buildMultiAsinCartUrl,
  generateSubId,
  openSmartStoreLink,
  getRecommendedBundle,
} from '../utils/affiliateEngine';

interface Props {
  deal: PublicDeal; title: string; image?: string | null; store: string;
  price: number; mrp?: number; discount: number; expired: boolean;
  saved: boolean; comparing: boolean; time: string; 
  onSave: (event: React.MouseEvent) => void; onDetails: () => void;
  onCompare?: () => void; onToast?: (text: string) => void;
}

/** Phone-specific presentation; all existing card actions remain available. */
export function MobileDealCardContent(props: Props) {
  const { deal, title, image, store, price, mrp, discount, expired, saved, comparing, time, onSave, onDetails, onCompare, onToast } = props;
  const [imageFailed, setImageFailed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [includeBundle, setIncludeBundle] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setImageFailed(false); setMenuOpen(false); setIncludeBundle(false); }, [image, deal.id]);

  useEffect(() => {
    if (!menuOpen) return;
    const dismiss = (e: PointerEvent) => { if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false); };
    const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', escape); };
  }, [menuOpen]);

  const isAmazon = store.toLowerCase().includes('amazon');
  const asin = isAmazon ? extractAmazonAsin(deal.url || deal.id) : null;
  const subId = generateSubId('mob', deal.id);
  const bundle = asin ? getRecommendedBundle(deal.category, price) : null;

  const handleLockInCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!asin) return;
    const cartUrl = includeBundle && bundle
      ? buildMultiAsinCartUrl(asin, bundle.asin, undefined, subId)
      : buildAmazonCartUrl(asin, undefined, subId);
    openSmartStoreLink(cartUrl, 'amazon', asin, true, subId);
  };

  const handleOpenInApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = deal.original_text || deal.aff_text || '';
    const couponMatch = text.match(/\b([A-Z0-9]{5,12})\b/g);
    const possibleCoupon = couponMatch ? couponMatch.find(c => c.length >= 5 && !/^\d+$/.test(c) && !['HTTP', 'HTTPS', 'PRICE', 'DISCOUNT'].includes(c)) : null;
    if (possibleCoupon && navigator.clipboard) {
      navigator.clipboard.writeText(possibleCoupon).catch(() => {});
      if (onToast) onToast(`Copied '${possibleCoupon}' to clipboard! Paste at checkout.`);
    }
    openSmartStoreLink(deal.url, store, asin || undefined, false, subId);
  };

  const money = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  return <div className="mobile-deal-card" onClick={e => e.stopPropagation()}>
    <div className="phone-card-head"><span className={`phone-store store-${store.toLowerCase().replace(/\W/g, '')}`}>{store}</span>
      <button type="button" className="phone-card-save" aria-label={`${saved ? 'Unsave' : 'Save'} ${title}`} aria-pressed={saved} onClick={onSave}><Bookmark size={19} fill={saved ? 'currentColor' : 'none'} /></button>
    </div>
    <button type="button" className="phone-card-image" onClick={onDetails} aria-label={`Open details for ${title}`}>
      {image && !imageFailed ? <img src={image} alt={title} loading="lazy" onError={() => setImageFailed(true)} /> : <div className="phone-image-missing"><ShoppingBag size={30} /><span>Offer Preview</span></div>}
      {expired ? <span className="phone-discount is-expired">Expired</span> : deal.sellout_prediction?.urgency_label ? <span className="phone-discount is-urgent">{deal.sellout_prediction.urgency_label}</span> : discount > 0 && <span className="phone-discount">{discount}% off MRP</span>}
    </button>
    <div className="phone-card-body">
      <button type="button" className="phone-card-title" onClick={onDetails}>{title}</button>
      <div className="phone-price">{price > 0 ? money(price) : 'Check price'}{mrp && <s>{money(mrp)}</s>}</div>
      <p className="phone-card-note">{mrp && price > 0 ? `Save ${money(mrp - price)} vs MRP` : 'Confirm price at store'}</p>
      <div className="phone-card-actions">
        <button type="button" className="phone-details" onClick={onDetails}>Details <ChevronRight size={15} /></button>
        <div className="phone-card-menu" ref={menuRef}>
          <button type="button" className="phone-more" aria-label={`More actions for ${title}`} aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)}><MoreHorizontal size={21} /></button>
          {menuOpen && <div className="phone-action-menu" role="group" aria-label="Deal actions">
            {onCompare && <button type="button" onClick={() => { onCompare(); setMenuOpen(false); }}>{comparing ? <Check size={16} /> : <GitCompareArrows size={16} />}{comparing ? 'Remove comparison' : 'Compare deal'}</button>}
            <button type="button" onClick={() => { shareToWhatsApp(deal); setMenuOpen(false); }}><Send size={16} />WhatsApp</button>
            <button type="button" onClick={() => { shareToTelegram(deal); setMenuOpen(false); }}><Send size={16} />Telegram</button>
            <button type="button" onClick={async () => { const copied = await copyDealLink(deal); onToast?.(copied ? 'Deal link copied' : 'Could not copy link'); setMenuOpen(false); }}><Copy size={16} />Copy link</button>
          </div>}
        </div>
      </div>

      {/* Multi-ASIN Accessory Bundle Toggle for Amazon Products */}
      {asin && bundle && (
        <div
          className={`phone-bundle-chip ${includeBundle ? 'is-active' : ''}`}
          onClick={() => setIncludeBundle(prev => !prev)}
          role="button"
          tabIndex={0}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {includeBundle ? <CheckSquare size={13} color="#854d0e" /> : <Square size={13} color="#a16207" />}
            <span>Optional accessory · Check price</span>
          </div>
        </div>
      )}

      {/* Dual-Action Mobile Area: 90-Day Cart Lock + Zero-Login Intent Bypass */}
      <div className="phone-cta-row">
        {asin ? (
          <>
            <button
              type="button"
              className={`phone-store-btn-cart${expired ? ' is-expired' : ''}`}
              onClick={handleLockInCart}
              title="Add to Amazon cart; confirm the final price there"
            >
              <ShoppingCart size={15} />
              <span>{includeBundle ? 'Add bundle to cart' : 'Add to Amazon cart'}</span>
            </button>
            <button
              type="button"
              className="phone-store-btn-app"
              onClick={handleOpenInApp}
            >
              <Zap size={14} color="#f59e0b" fill="#f59e0b" />
              <span>⚡ Open in Amazon App</span>
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className={`phone-store-link${expired ? ' is-expired' : ''}`}
              onClick={handleOpenInApp}
            >
              <Zap size={14} />
              <span>⚡ Open in {store} App</span>
              <ChevronRight size={14} />
            </button>
          </>
        )}
      </div>

      <span className="phone-card-time">Posted {time}</span>
    </div>
  </div>;
}

