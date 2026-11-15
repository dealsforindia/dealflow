import { useModalSurface } from '../utils/useModalSurface';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, Bell, Bookmark, Check, Copy, Heart, Image, Layers, MoreHorizontal, Repeat2, Share2, ShoppingBag, ShoppingCart, Star, X } from 'lucide-react';
import { useAutomaticReviews } from '../utils/reviewEvidence';
import { PublicDeal } from '../types';
import { getCleanImageUrl } from '../utils/imageUrl';
import { isDealSaved, toggleSavedDealId } from '../utils/savedDeals';
import { shareDeal, copyDealLink } from '../utils/shareDeal';
import { playTactileClick, playSuccessChime } from '../utils/audio';
import { openGoogleShoppingModal } from '../utils/googleShopping';
import { extractAmazonAsin, buildAmazonCartUrl, buildMultiAsinCartUrl, generateSubId, openSmartStoreLink, getRecommendedBundle } from '../utils/affiliateEngine';
interface PublicDealCardProps {
  deal: PublicDeal; index?: number; isSaved?: boolean; isComparing?: boolean; 
  onOpenImage?: (deal: PublicDeal) => void; onSelectDeal?: (deal: PublicDeal) => void;
  onToggleSave?: (deal: PublicDeal) => void; onToggleCompare?: (deal: PublicDeal) => void;
  onOpenPriceAlert?: (deal: PublicDeal) => void;
  onOpenExchange?: (deal: PublicDeal) => void; onShowToast?: (msg: string) => void;
}
function relativeTime(timestamp?: number) {
  if (!timestamp) return 'Time unavailable';
  const minutes = Math.max(0, Math.floor((Date.now() - (timestamp > 1e11 ? timestamp : timestamp * 1000)) / 60000));
  return minutes < 1 ? 'Just added' : minutes < 60 ? `${minutes}m ago` : minutes < 1440 ? `${Math.floor(minutes / 60)}h ago` : `${Math.floor(minutes / 1440)}d ago`;
}
const money = (value: number) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
export const PublicDealCard: React.FC<PublicDealCardProps> = ({ deal, index = 0, isSaved: suppliedSaved, isComparing = false, onOpenImage, onSelectDeal, onToggleSave, onToggleCompare, onOpenPriceAlert, onOpenExchange, onShowToast }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const [localSaved, setLocalSaved] = useState(() => isDealSaved(deal.id));
  const [menuOpen, setMenuOpen] = useState(false);
  const [multiSheetOpen, setMultiSheetOpen] = useState(false);
  const [includeBundle, setIncludeBundle] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const sheet = useModalSurface(menuOpen, () => setMenuOpen(false));
  const multiSheetRef = useModalSurface(multiSheetOpen, () => setMultiSheetOpen(false));
  const saved = suppliedSaved ?? localSaved;
  const card = useRef<HTMLElement>(null);
  const { result: reviewEvidence, load: reviewLoad } = useAutomaticReviews(deal.id, deal.url || '', card);
  const effectiveRating = reviewEvidence?.rating ?? deal.rating ?? null;
  const effectiveRatingCount = reviewEvidence?.rating_count ?? deal.rating_count ?? deal.review_count ?? null;
  const rawStore = deal.store || 'Store';
  const store = /static[\s_-]?assets/i.test(rawStore) ? 'Flipkart' : rawStore;
  const title = deal.title?.replace(/^[\s\u{1F300}-\u{1FAFF}\u2600-\u27BF\uFE0F]+/u, '').trim() || `${store} offer`;
  const price = Number(deal.price ?? deal.sale_price ?? deal.prices?.sale) || 0;
  const rawMrp = deal.mrp ?? deal.prices?.mrp ?? null;
  const mrp = rawMrp && rawMrp > price && price > 0 ? rawMrp : null;
  const discount = deal.discount_pct ?? (mrp ? Math.round((mrp - price) / mrp * 100) : null);
  const expired = Boolean(deal.is_expired || deal.is_over || deal.status === 'expired');
  const isMulti = Boolean(deal.is_multi_deal && deal.multi_items && deal.multi_items.length >= 2);
  // This upstream soundbar photo is a phone advertisement, so show an honest fallback.
  const photo = deal.image?.includes('amz_B0H4VQX4CC.jpg') ? null : getCleanImageUrl(deal.image);
  const asin = /amazon/i.test(store) ? extractAmazonAsin(deal.url || deal.id) : null;
  const subId = generateSubId('card', deal.id);
  const bundle = asin ? getRecommendedBundle(deal.category, price) : null;
  useEffect(() => { setImageFailed(false); }, [photo]);
  function save() {
    playTactileClick();
    if (onToggleSave) onToggleSave(deal);
    else { const next = toggleSavedDealId(deal.id, deal).isSaved; setLocalSaved(next); if (next) playSuccessChime(); onShowToast?.(next ? 'Saved to your shortlist' : 'Removed from saved deals'); }
  }
  const details = () => { playTactileClick(); (onSelectDeal || onOpenImage)?.(deal); };
  const action = (callback: () => void) => { setMenuOpen(false); callback(); };
  function cart() {
    if (!asin) return;
    const url = includeBundle && bundle ? buildMultiAsinCartUrl(asin, bundle.asin, undefined, subId) : buildAmazonCartUrl(asin, undefined, subId);
    openSmartStoreLink(url, 'amazon', asin, true, subId);
  }
  const handleViewDeal = () => {
    let targetUrl = deal.url;
    if (!targetUrl || targetUrl.includes('.css') || targetUrl.includes('static-assets-web')) {
      targetUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(title)}`;
    }
    openSmartStoreLink(targetUrl, store, asin || undefined, false, subId);
  };
  return <article ref={card} style={{ '--card-delay': `${Math.min(index % 40, 7) * 35}ms` } as React.CSSProperties} className={`commerce-card commerce-card-reveal${expired ? ' is-expired' : ''}${isComparing ? ' is-comparing' : ''}`}>
    <div className="commerce-card-photo">
      <button type="button" className="commerce-photo-button" onClick={details} aria-label={`View details for ${title}`}>
        {photo && !imageFailed ? <img src={photo} alt={title} loading="lazy" decoding="async" onError={() => setImageFailed(true)} /> : <span className="commerce-image-fallback"><Image size={30} strokeWidth={1.2} /><span>Offer Preview</span></span>}
      </button>
      <span className={`commerce-store commerce-store-${store.toLowerCase().replace(/[^a-z]/g, '')}`}>{store}</span>
      <button type="button" className={`commerce-card-save${saved ? ' is-saved' : ''}`} aria-label={`${saved ? 'Unsave' : 'Save'} ${title}`} aria-pressed={saved} onClick={save}><Bookmark className="desktop-save-icon" size={18} fill={saved ? 'currentColor' : 'none'} /><Heart className="mobile-save-icon" size={20} fill={saved ? 'currentColor' : 'none'} /></button>
      {expired ? (
        <span className="commerce-discount">Ended</span>
      ) : isMulti ? (
        <span
          className="commerce-discount"
          style={{
            background: 'linear-gradient(135deg, #4338ca, #6d28d9)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            fontWeight: 700,
            boxShadow: '0 2px 8px rgba(79, 70, 229, 0.35)',
          }}
        >
          📦 Multiple Deals ({deal.multi_items?.length} Items)
        </span>
      ) : discount != null && discount > 0 ? (
        <span className="commerce-discount">{discount}% below MRP</span>
      ) : deal.sellout_prediction?.urgency_label && (
        <span className="commerce-discount is-urgent" title="Estimated by the deal model, not merchant-confirmed stock">
          Estimate: {deal.sellout_prediction.urgency_label}
        </span>
      )}
    </div>
    <div className="commerce-card-body">
      <button type="button" className="commerce-card-title" onClick={details}>{title}</button>
      <button type="button" className={`commerce-card-rating${effectiveRating == null ? ' is-unrated' : ''}`} onClick={details} aria-label={effectiveRating != null ? `Customer rating ${effectiveRating} out of 5. View review evidence` : `Customer reviews for ${title}`} title={reviewEvidence?.message || reviewLoad?.message || (effectiveRating != null ? `Rating: ${effectiveRating} ★${effectiveRatingCount != null ? ` (${effectiveRatingCount.toLocaleString('en-IN')} reviews)` : ''}` : 'Customer review evidence from the merchant')}>
        <Star size={13} fill={effectiveRating != null ? 'currentColor' : 'none'} />
        <span>{effectiveRating != null ? <>{effectiveRating.toFixed(1)}{effectiveRatingCount != null ? ` (${effectiveRatingCount.toLocaleString('en-IN')})` : ' / 5'}</> : reviewEvidence?.reviews.length ? `${reviewEvidence.reviews.length} review excerpts` : (reviewLoad?.status === 'loading' || reviewLoad?.status === 'queued') ? 'Checking reviews…' : 'Verified Deal'}</span>
      </button>
      <div className="commerce-card-price"><strong>{price > 0 ? money(price) : (isMulti ? 'Multiple prices' : 'Check price')}</strong>{mrp && <s>{money(mrp)}</s>}</div>
      <p className="commerce-card-note">{expired ? 'This offer has ended' : (isMulti ? `${deal.multi_items?.length} items with direct links` : 'Confirm price at checkout')}</p>
      <div className="commerce-card-actions">
        {isMulti ? (
          <button
            type="button"
            className="commerce-store-button"
            style={{
              background: 'linear-gradient(135deg, #3730a3, #6366f1)',
              color: '#ffffff',
              border: 'none',
              boxShadow: '0 2px 10px rgba(99, 102, 241, 0.35)',
              fontWeight: 650,
            }}
            aria-label={`More Buy Now Options for ${deal.multi_items?.length} items`}
            onClick={() => {
              playTactileClick();
              setMultiSheetOpen(true);
            }}
            disabled={expired}
          >
            <span>⚡ More Buy Now Options ({deal.multi_items?.length}) ▾</span>
          </button>
        ) : (
          <button
            type="button"
            className="commerce-store-button"
            aria-label={`View at ${store}`}
            onClick={handleViewDeal}
            disabled={expired || !deal.url}
          >
            <span><span className="commerce-store-prefix">View at </span>{store}</span>
            <ArrowUpRight size={16} />
          </button>
        )}
        <button ref={trigger} type="button" className="commerce-card-more" aria-label={`More options for ${title}`} aria-haspopup="dialog" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
          <MoreHorizontal size={20} />
        </button>
      </div>
      <div className="commerce-card-meta"><span>Listed {relativeTime(deal.display_ts || deal.posted_at)}</span><button type="button" onClick={details}>Details <span aria-hidden="true">↗</span></button></div>
    </div>
    {menuOpen && createPortal(<div className="commerce-sheet-backdrop" onClick={() => setMenuOpen(false)}><div ref={sheet} className="commerce-product-sheet" role="dialog" aria-modal="true" aria-label={`Shopping options for ${title}`} onClick={event => event.stopPropagation()}>
      <div className="commerce-sheet-handle" aria-hidden="true" />
      <header><div><small>SHOPPING OPTIONS</small><h2>{title}</h2></div><button type="button" aria-label="Close shopping options" onClick={() => setMenuOpen(false)}><X size={22} /></button></header>
      <div className="commerce-sheet-options">
        <button type="button" onClick={() => action(details)}><Layers size={19} /><span>Details & price evidence</span><ArrowUpRight size={16} /></button>
        <button type="button" onClick={() => action(() => openGoogleShoppingModal(title))}><ShoppingBag size={19} /><span>Compare across stores (Google Radar)</span><ArrowUpRight size={16} /></button>
        {onToggleCompare && <button type="button" onClick={() => action(() => onToggleCompare(deal))}>{isComparing ? <Check size={19} /> : <Layers size={19} />}<span>{isComparing ? 'Remove from comparison' : 'Add to comparison'}</span></button>}
        {onOpenPriceAlert && <button type="button" onClick={() => action(() => onOpenPriceAlert(deal))}><Bell size={19} /><span>Set a price alert</span></button>}
        {onOpenExchange && <button type="button" onClick={() => action(() => onOpenExchange(deal))}><Repeat2 size={19} /><span>Exchange calculator</span></button>}
        {onOpenImage && <button type="button" onClick={() => action(() => onOpenImage(deal))}><Image size={19} /><span>View product photo</span></button>}
        {asin && !expired && <button type="button" onClick={() => action(cart)}><ShoppingCart size={19} /><span>Open Amazon cart{includeBundle ? ' with add-on' : ''}</span><ArrowUpRight size={16} /></button>}
      </div>
      {bundle && <label className="commerce-bundle"><input type="checkbox" checked={includeBundle} onChange={event => setIncludeBundle(event.target.checked)} /><span>Optional add-on: {bundle.name}<small>Estimate {money(bundle.price)} · confirm final price at Amazon</small></span></label>}
      <div className="commerce-share-row"><button type="button" onClick={() => action(async () => { const result = await shareDeal(deal); if (result === 'copied') onShowToast?.('Deal link copied — paste it anywhere'); if (result === 'failed') onShowToast?.('Could not share this link. Please try again.'); })}><Share2 size={17} />Share</button><button type="button" onClick={() => action(async () => { const copied = await copyDealLink(deal); onShowToast?.(copied ? 'Deal link copied' : 'Could not copy this link'); })}><Copy size={16} />Copy link</button></div>
    </div></div>, document.body)}
    {multiSheetOpen && isMulti && createPortal(<div className="commerce-sheet-backdrop" onClick={() => setMultiSheetOpen(false)}><div ref={multiSheetRef} className="commerce-product-sheet" role="dialog" aria-modal="true" aria-label={`Multiple deals options for ${title}`} onClick={event => event.stopPropagation()} style={{ maxHeight: '82vh', overflowY: 'auto' }}>
      <div className="commerce-sheet-handle" aria-hidden="true" />
      <header>
        <div>
          <small style={{ color: '#6366f1', fontWeight: 700, letterSpacing: '0.05em' }}>📦 MULTIPLE DEALS AVAILABLE ({deal.multi_items?.length} OPTIONS)</small>
          <h2>{title}</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>Select any item or variant below to purchase directly with discount:</p>
        </div>
        <button type="button" aria-label="Close options" onClick={() => setMultiSheetOpen(false)}><X size={22} /></button>
      </header>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px 0' }}>
        {deal.multi_items?.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '12px 14px', borderRadius: '12px', backgroundColor: 'var(--surface-2, #f8fafc)', border: '1px solid var(--border-subtle, #e2e8f0)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 650, fontSize: '14px', color: 'var(--text-primary, #0f172a)' }}>{item.label}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                {item.price ? <span style={{ fontWeight: 700, color: 'var(--color-primary, #0066cc)', fontSize: '13px' }}>₹{item.price.toLocaleString('en-IN')}</span> : null}
                {item.discount ? <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: '#dcfce7', color: '#15803d' }}>Flat {item.discount}% OFF</span> : null}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #0066cc, #2563eb)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 650,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
                onClick={() => {
                  playTactileClick();
                  openSmartStoreLink(item.url, store, undefined, false, subId);
                }}
              >
                <span>🛍️ Buy {item.label.split(' ')[0]} ↗</span>
              </button>
              <button
                type="button"
                aria-label={`Copy link for ${item.label}`}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle, #cbd5e1)',
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary, #64748b)',
                  cursor: 'pointer',
                }}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(item.url);
                    onShowToast?.(`Link copied for ${item.label}`);
                  } catch {
                    onShowToast?.('Could not copy link');
                  }
                }}
              >
                <Copy size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div></div>, document.body)}
  </article>;
};
