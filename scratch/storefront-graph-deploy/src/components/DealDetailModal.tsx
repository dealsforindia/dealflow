import { useModalSurface } from '../utils/useModalSurface';
import { publicShareUrl, publicStoreUrl } from '../utils/publicLinks';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { Star, Sparkles } from 'lucide-react';
import { PublicDeal } from '../types';
import { getCleanImageUrl } from '../utils/imageUrl';
import { ProductPriceHistory } from './ProductPriceHistory';
import { ProductReviews } from './ProductReviews';
import { couponOffer } from '../utils/couponOffer';
import { analyzeArbitrage } from '../utils/arbitrage';
import { openGoogleShoppingModal } from '../utils/googleShopping';
import { copyDealLink } from '../utils/shareDeal';
import { isDealSaved, toggleSavedDealId } from '../utils/savedDeals';
import {
  extractAmazonAsin,
  buildAmazonCartUrl,
  buildMultiAsinCartUrl,
  generateSubId,
  openSmartStoreLink,
  getRecommendedBundle,
  useIsMobile,
} from '../utils/affiliateEngine';

interface DealDetailModalProps {
  deal: PublicDeal | null;
  onClose: () => void;
  onOpenImage?: (deal: PublicDeal) => void;
  onShowToast?: (msg: string) => void;
  onToggleSave?: (deal: PublicDeal) => void;
  onOpenTool?: (toolId: string) => void;
}

function getStoreDisplayName(store?: string): string {
  const s = (store || '').trim();
  const low = s.toLowerCase();
  if (!s || ['store', 'retail deal', 'unknown', 'deals', 'none'].includes(low)) {
    return 'Verified Store';
  }
  if (low === 'amazon' || low === 'amazon india') return 'Amazon India';
  if (low === 'flipkart') return 'Flipkart';
  if (low === 'myntra') return 'Myntra';
  if (low === 'ajio') return 'AJIO';
  if (low === 'blinkit') return 'Blinkit';
  if (low === 'swiggy') return 'Swiggy Instamart';
  if (low === 'zepto') return 'Zepto';
  return s;
}

export const DealDetailModal: React.FC<DealDetailModalProps> = ({
  deal,
  onClose,
  onOpenImage,
  onShowToast,
  onToggleSave,
  onOpenTool,
}) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [copyLink, setCopyLink] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [includeBundle, setIncludeBundle] = useState(false);

  const isAmazon = (deal?.store || '').toLowerCase().includes('amazon');
  const asin = isAmazon && deal ? extractAmazonAsin(deal.url || deal.id) : null;
  const subId = deal ? generateSubId('modal', deal.id) : '';
  const bundle = asin && deal ? getRecommendedBundle(deal.category, deal.price || 0) : null;

  const handleLockInCart = () => {
    if (!asin || !deal) return;
    const cartUrl = includeBundle && bundle
      ? buildMultiAsinCartUrl(asin, bundle.asin, undefined, subId)
      : buildAmazonCartUrl(asin, undefined, subId);
    openSmartStoreLink(cartUrl, 'amazon', asin, true, subId);
  };

  const handleOpenStore = () => {
    if (!deal) return;
    openSmartStoreLink(deal.url, deal.store || 'Store', asin || undefined, false, subId);
  };
  const isMobile = useIsMobile();

  const [visible, setVisible] = useState(false);
  const [saved, setSaved] = useState(() => (deal ? isDealSaved(deal.id) : false));

  const arbitrage = useMemo(() => (deal ? analyzeArbitrage(deal) : null), [deal]);

  useEffect(() => {
    if (deal) {
      setImgLoaded(false);
      setImgError(false);
      setCopiedCoupon(false);
      setCopyLink(false);
      setReportSent(false);
      setSaved(isDealSaved(deal.id));
      // Small delay for entrance animation
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [deal]);

  const handleToggleFavorite = () => {
    if (!deal) return;
    if (onToggleSave) {
      onToggleSave(deal);
      setSaved(isDealSaved(deal.id));
    } else {
      const { isSaved: next } = toggleSavedDealId(deal.id, deal);
      setSaved(next);
      onShowToast?.(next ? 'Saved to Loot Bookmarks!' : 'Removed from saved deals');
    }
  };

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 200);
  }, [onClose]);

  const dialogRef = useModalSurface(!!deal, handleClose);

  if (!deal) return null;

  const cleanImage = getCleanImageUrl(deal.image);
  const price = Number(deal.price ?? deal.sale_price ?? deal.prices?.sale) || 0;
  const rawMrp = deal.mrp ?? deal.prices?.mrp;
  const mrp = (rawMrp && rawMrp > price) ? rawMrp : undefined;
  const discount = deal.discount_pct || (mrp ? Math.round((mrp - price) / mrp * 100) : 0);
  const savings = mrp ? mrp - price : 0;
  const storeName = getStoreDisplayName(deal.store);
  const coupon = couponOffer(deal);

  const gstItcAmount = price > 0 ? Math.round(price - price / 1.18) : 0;

  const catLower = (deal.category || '').toLowerCase();
  const titleLower = (deal.title || '').toLowerCase();
  const isTechOrAppliance =
    catLower.includes('electron') ||
    catLower.includes('mobile') ||
    catLower.includes('laptop') ||
    catLower.includes('appliance') ||
    /\b(phone|smartphone|smartphones|laptop|macbook|monitor|printer|tablet|ipad|ac|refrigerator|washing machine|smartwatch)\b/i.test(titleLower);
  const isB2BEligible = isTechOrAppliance && price >= 1500;
  const isFashion = catLower.includes('fashion') || /\b(shoes|sneakers|shirt|t-shirt|jeans|dress|saree|kurta|trousers|sandals|handbag|jacket)\b/i.test(titleLower);
  const isGroceryBeauty = catLower.includes('grocery') || catLower.includes('beauty') || /\b(face wash|cream|shampoo|soap|atta|oil|tea|coffee|biscuit|dry fruits)\b/i.test(titleLower);

  const handleCopyCoupon = () => {
    if (coupon?.kind !== 'code') return;
    if (!navigator.clipboard?.writeText) { onShowToast?.('Clipboard unavailable. Select and copy the code.'); return; }
    navigator.clipboard.writeText(coupon.code).then(() => {
      setCopiedCoupon(true);
      setTimeout(() => setCopiedCoupon(false), 2000);
      onShowToast?.('Coupon copied!');
    }).catch(() => onShowToast?.('Could not copy the coupon. Select and copy the code.'));
  };

  const handleShare = () => {
    const text = `${deal.title}\n₹${price.toLocaleString('en-IN')} on ${storeName}\n${publicShareUrl(deal.url)}`;
    if (navigator.share) {
      navigator.share({ title: deal.title, text, url: publicShareUrl(deal.url) }).catch(() => {});
    } else {
      navigator.clipboard.writeText(publicShareUrl(deal.url)).then(() => {
        setCopyLink(true);
        setTimeout(() => setCopyLink(false), 2000);
        onShowToast?.('Deal link copied!');
      }).catch(() => {});
    }
  };

  const handleReportExpired = () => {
    setReportSent(true);
    onShowToast?.('Marked as expired in this view. Confirm availability with the store.');
  };

  return createPortal(
    <div
      className="deal-detail-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Deal details: ${deal.title}`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        backgroundColor: visible ? 'rgba(15, 23, 42, 0.45)' : 'rgba(0, 0, 0, 0)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        transition: 'background-color 200ms ease',
      }}
    >
      <motion.div
        ref={dialogRef}
        className="pro-card deal-detail-sheet"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: '740px',
          maxHeight: 'min(92vh, calc(100dvh - 1.5rem))',
          overflow: 'hidden',
          overscrollBehavior: 'contain',
          borderRadius: '16px',
          backgroundColor: 'var(--bg-surface-card)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
        }}
      >
        {/* Header */}
        <div className="deal-detail-sheet-head" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--surface-2)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 700,
              color: '#2563EB',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              {storeName}
            </span>
            {(() => {
              const cat = deal.category?.trim();
              if (!cat) return null;
              const sLower = storeName.toLowerCase().replace(/india|in|\.com|\.in/g, '').trim();
              const cLower = cat.toLowerCase();
              if (cLower === sLower || cLower.includes(sLower) || sLower.includes(cLower)) return null;
              return (
                <>
                  <span style={{ color: '#94A3B8', fontSize: '10px' }}>›</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    {cat}
                  </span>
                </>
              );
            })()}
            <span className="deal-source-badge" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 8px',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              fontWeight: 700,
              color: '#059669',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <motion.path
                  d="M5 12l4 4L19 6"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                />
              </svg>
              Directory offer
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => openGoogleShoppingModal(deal.title)}
              title="Compare price across Amazon, Flipkart, Myntra & Google Shopping Radar"
              aria-label="Scan other stores for this product"
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: '8px',
                color: '#1D4ED8',
                cursor: 'pointer',
                transition: 'all 120ms ease',
                fontSize: '15px',
              }}
            >
              🛍️
            </button>

            <button
              type="button"
              onClick={handleToggleFavorite}
              title={saved ? 'Saved in Loot Bookmarks' : 'Save deal'}
              aria-label={saved ? "Remove from bookmarks" : "Save deal to bookmarks"}
              aria-pressed={saved}
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: saved ? '#FEF3C7' : '#FFFFFF',
                border: `1px solid ${saved ? '#FDE68A' : '#E2E8F0'}`,
                borderRadius: '8px',
                color: saved ? '#D97706' : '#64748B',
                cursor: 'pointer',
                transition: 'all 120ms ease',
              }}
            >
              {saved ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#D97706">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>

            <button
              onClick={handleClose}
              aria-label="Close deal details"
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--bg-surface-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 120ms ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#0F172A';
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#CBD5E1';
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#F1F5F9';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#64748B';
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F0';
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFFFFF';
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Body: Two-column with scrollable container */}
        <div className="deal-detail-layout" style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(180px, 260px) 1fr',
          gap: '0',
          flex: 1,
          minHeight: 0,
          touchAction: 'pan-y',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
        }}>
          {/* Left: Sticky Image & Quick Highlights Column */}
          <div style={{
            position: 'sticky',
            top: 0,
            alignSelf: 'start',
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--surface-2)',
          }}>
            <button
              onClick={() => onOpenImage && onOpenImage(deal)}
              className="deal-detail-media"
              aria-label={onOpenImage ? "Click to zoom" : "Product image"}
              style={{
                aspectRatio: '4 / 3',
                backgroundColor: 'var(--surface-2)',
                border: 'none',
                cursor: onOpenImage ? 'zoom-in' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                position: 'relative',
              }}
            >
              {!imgError && cleanImage ? (
                <img
                  src={cleanImage}
                  alt={deal.title}
                  loading="lazy"
                  onLoad={() => setImgLoaded(true)}
                  onError={() => setImgError(true)}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    opacity: imgLoaded ? 1 : 0,
                    transition: 'opacity 150ms ease',
                  }}
                />
              ) : (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#94A3B8' }}>
                  {deal.store}
                </span>
              )}
              {onOpenImage && (
                <span style={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  color: '#94A3B8',
                  letterSpacing: '0.04em',
                }}>
                  🔍 Click to zoom
                </span>
              )}
            </button>
            {/* Quick Trust Highlights on Left Column */}
            <div className="hidden sm:flex" style={{
              padding: '12px 14px',
              borderTop: '1px solid var(--border-subtle)',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '11px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: 650 }}>
                <span>🛡️</span>
                <span>Verified {storeName}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                <span>⚡</span>
                <span>Direct merchant drop</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#D97706', fontWeight: 650 }}>
                  <span>🔥</span>
                  <span>{discount}% price drop</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Details */}
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Full title */}
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '16px',
              fontWeight: 700,
              lineHeight: 1.4,
              color: 'var(--text-primary)',
              margin: 0,
            }}>
              {deal.title}
            </h2>

            {/* Brand & Ratings Metadata */}
            {(deal.brand || deal.rating != null) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {deal.brand && (
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#2563EB',
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}>
                    {deal.brand}
                  </span>
                )}
                {deal.rating != null && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    backgroundColor: '#FEF3C7',
                    border: '1px solid #FDE68A',
                    borderRadius: '6px',
                    color: '#92400E',
                    fontSize: '12px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                  }}>
                    <Star size={13} fill="#F59E0B" stroke="#F59E0B" />
                    <span>{deal.rating.toFixed(1)}</span>
                    {(deal.rating_count != null || deal.review_count != null) && (
                      <span style={{ fontSize: '11px', color: '#B45309', fontWeight: 500 }}>
                        ({(deal.rating_count ?? deal.review_count)?.toLocaleString('en-IN')})
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Price matrix */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontVariantNumeric: 'tabular-nums',
                  fontSize: '26px',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  lineHeight: 1,
                }}>
                  ₹{price.toLocaleString('en-IN')}
                </span>
                {mrp && (
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontVariantNumeric: 'tabular-nums',
                    fontSize: '13px',
                    color: '#94A3B8',
                    textDecoration: 'line-through',
                  }}>
                    ₹{mrp.toLocaleString('en-IN')}
                  </span>
                )}
                {discount > 0 && discount < 100 && (
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#DC2626',
                    padding: '2px 8px',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: '6px',
                  }}>
                    -{discount}% OFF
                  </span>
                )}
              </div>
              {savings > 0 && (
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#059669',
                }}>
                  Savings vs MRP: ₹{savings.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Key Features & Highlights */}
            {deal.highlights && deal.highlights.length > 0 && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: 'var(--surface-2, #F8FAFC)',
                border: '1px solid var(--border-subtle, #E2E8F0)',
              }}>
                <span style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: 'var(--text-secondary, #64748B)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}>
                  <Sparkles size={13} color="#2563EB" /> Key Highlights
                </span>
                <ul style={{
                  margin: 0,
                  paddingLeft: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                  lineHeight: 1.45,
                }}>
                  {deal.highlights.slice(0, 4).map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Coupon code */}
            {coupon && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                  {coupon.kind === 'code' ? 'PROMO CODE' : 'STORE COUPON'}
                </span>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  backgroundColor: '#EFF6FF',
                  border: '1px dashed #3B82F6',
                  borderRadius: '8px',
                  width: 'fit-content',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#1D4ED8',
                    letterSpacing: '0.08em',
                  }}>
                    {coupon.label}
                  </span>
                  {coupon.kind === 'code' && <button
                    onClick={handleCopyCoupon}
                    aria-label={`Copy coupon ${deal.coupon}`}
                    style={{
                      padding: '4px 10px',
                      backgroundColor: copiedCoupon ? '#ECFDF5' : '#FFFFFF',
                      border: `1px solid ${copiedCoupon ? '#A7F3D0' : '#CBD5E1'}`,
                      borderRadius: '6px',
                      color: copiedCoupon ? '#059669' : '#0F172A',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                    }}
                  >
                    {copiedCoupon ? 'COPIED ✓' : 'COPY CODE'}
                  </button>}
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {coupon.kind === 'activation' ? 'Collect or apply the coupon on the product page. Confirm eligibility and the final price at checkout.' : 'Apply this code at checkout. Confirm its terms and the final price at the store.'}
                </span>
              </div>
            )}

            {/* Universal Multi-Deal Options Deck */}
            {deal.is_multi_deal && deal.multi_items && deal.multi_items.length >= 2 && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                padding: '16px',
                borderRadius: '14px',
                backgroundColor: 'rgba(99, 102, 241, 0.05)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 800, color: '#4338ca' }}>
                    📦 MULTIPLE DEALS INSIDE ({deal.multi_items.length} ITEMS)
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', backgroundColor: '#e0e7ff', color: '#4338ca' }}>
                    Direct Links
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                  This curated drop includes multiple direct purchase options. Pick any item below to shop with verified discounts:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                  {deal.multi_items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--surface-primary, #ffffff)',
                        border: '1px solid var(--border-subtle, #e2e8f0)',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 650, fontSize: '13.5px', color: 'var(--text-primary)' }}>
                          {item.label}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          {item.price ? (
                            <span style={{ fontWeight: 700, color: '#0066cc', fontSize: '12.5px' }}>
                              ₹{item.price.toLocaleString('en-IN')}
                            </span>
                          ) : null}
                          {item.discount ? (
                            <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '1px 5px', borderRadius: '4px', backgroundColor: '#dcfce7', color: '#15803d' }}>
                              Flat {item.discount}% OFF
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <button
                        type="button"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '7px 12px',
                          borderRadius: '7px',
                          background: 'linear-gradient(135deg, #0066cc, #2563eb)',
                          color: '#ffffff',
                          border: 'none',
                          fontSize: '12.5px',
                          fontWeight: 650,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                        onClick={() => openSmartStoreLink(item.url, deal.store || 'Store', undefined, false, subId)}
                      >
                        <span>🛍️ Buy {item.label.split(' ')[0]} ↗</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verified Multi-Store Price History & Trends Graph */}
            <ProductPriceHistory url={deal.url} dealId={deal.fp_hash || deal.id} currentPrice={price} mrp={mrp} />
            <ProductReviews url={deal.url} id={deal.id} />

            {/* Multi-Store Real-Time Live Check Matrix */}
            {arbitrage && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: 'var(--surface-2)',
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Compare store listings
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#059669',
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}>
                    Store links
                  </span>
                </div>

                {/* Store Quotes Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {arbitrage.quotes.map((q, idx) => (
                    <div
                      key={idx}
                      className="deal-compare-row"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        backgroundColor: q.isVerifiedDeal ? '#FFFFFF' : '#F1F5F9',
                        border: `1px solid ${q.isVerifiedDeal ? '#A7F3D0' : '#E2E8F0'}`,
                        boxShadow: q.isVerifiedDeal ? '0 1px 2px rgba(16, 185, 129, 0.1)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {q.store}
                        </span>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '9.5px',
                          fontWeight: 700,
                          color: q.isVerifiedDeal ? '#065F46' : '#475569',
                          backgroundColor: q.isVerifiedDeal ? '#ECFDF5' : '#E2E8F0',
                          border: `1px solid ${q.isVerifiedDeal ? '#A7F3D0' : '#CBD5E1'}`,
                          padding: '1px 5px',
                          borderRadius: '4px',
                        }}>
                          {q.badge}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {q.price !== undefined ? (
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '13px',
                            fontWeight: 800,
                            color: '#059669',
                          }}>
                            ₹{q.price.toLocaleString('en-IN')}
                          </span>
                        ) : null}
                        {q.store === 'Google Shopping' ? (
                          <button
                            type="button"
                            onClick={() => openGoogleShoppingModal(deal?.title || '')}
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '10.5px',
                              fontWeight: 700,
                              color: '#2563EB',
                              backgroundColor: '#EFF6FF',
                              border: '1px solid #DBEAFE',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span>{q.actionText}</span>
                            <span style={{ fontSize: '9px', backgroundColor: '#DBEAFE', padding: '1px 4px', borderRadius: '4px' }}>IN-APP</span>
                          </button>
                        ) : (
                          <a
                            href={publicStoreUrl(q.url) || undefined}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '10.5px',
                              fontWeight: 700,
                              color: q.isVerifiedDeal ? '#059669' : '#2563EB',
                              textDecoration: 'none',
                              backgroundColor: q.isVerifiedDeal ? '#F0FDF4' : '#EFF6FF',
                              border: `1px solid ${q.isVerifiedDeal ? '#BBF7D0' : '#DBEAFE'}`,
                              padding: '3px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                            }}
                          >
                            {q.actionText}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <p style={{
                  fontSize: '10.5px',
                  fontFamily: 'var(--font-body)',
                  color: 'var(--text-secondary)',
                  margin: '2px 0 0',
                  lineHeight: 1.4,
                }}>
                  {arbitrage.verdict}
                </p>
              </div>
            )}

            {/* ── Apple Verified Deal Authenticity Card ── */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              padding: '16px',
              borderRadius: '16px',
              backgroundColor: 'var(--surface-2)',
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#0066CC',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}>✓</span>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Check before buying
                  </span>
                </div>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#0066CC',
                }}>
                  {storeName}
                </span>
              </div>

              <div style={{
                fontSize: '12.5px',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                fontFamily: 'var(--font-body)',
              }}>
                {savings > 0 ? (
                  <span>
                    You save <strong style={{ color: '#0066CC' }}>₹{savings.toLocaleString('en-IN')}</strong> ({discount}% below MRP). MRP is a merchant reference; inspect recorded history separately.
                  </span>
                ) : (
                  <span>
                    This directory offer links to the merchant. Confirm price and availability before buying.
                  </span>
                )}
              </div>
            </div>

            {isMobile && (
              <div className="deal-detail-secondary-actions">
                {asin && <button type="button" onClick={handleLockInCart}>Add to Amazon cart</button>}
                {bundle && <label><input type="checkbox" checked={includeBundle} onChange={e => setIncludeBundle(e.target.checked)} /> Include accessory · Check price</label>}
                <button type="button" onClick={() => openGoogleShoppingModal(deal.title)}>Compare stores</button>
                <button type="button" onClick={handleShare}>{copyLink ? 'Copied!' : 'Copy link'}</button>
                <button type="button" onClick={handleReportExpired} disabled={reportSent}>{reportSent ? 'Marked expired' : 'Report expired offer'}</button>
              </div>
            )}

            {/* Editorial verification note */}
            <p style={{
              fontSize: '11px',
              fontFamily: 'var(--font-body)',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              margin: 0,
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '10px',
            }}>
              Source-reported offer from {storeName}. Prices, stock and delivery costs may change.
            </p>
          </div>
        </div>

        {isMobile && <div className="deal-detail-mobile-buy"><button type="button" onClick={handleOpenStore}>View deal on {storeName} ↗</button></div>}
        {/* Desktop actions */}
        <div className="deal-detail-desktop-actions" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 18px max(14px, env(safe-area-inset-bottom))',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--surface-2)',
          flexWrap: 'wrap',
          flexShrink: 0,
          position: 'relative',
          zIndex: 10,
          boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.04)',
        }}>
          {asin ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {bundle && (
                <button
                  type="button"
                  onClick={() => setIncludeBundle(!includeBundle)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '0 12px',
                    height: '42px',
                    backgroundColor: includeBundle ? '#FEF08A' : '#FEFCE8',
                    border: `1px solid ${includeBundle ? '#EAB308' : '#FEF08A'}`,
                    borderRadius: '9999px',
                    color: '#854D0E',
                    fontSize: '11.5px',
                    fontWeight: includeBundle ? 700 : 500,
                    cursor: 'pointer',
                  }}
                  title="Add accessory bundle or delivery saver"
                >
                  <span>{includeBundle ? '☑️' : '◻️'}</span>
                  <span>Optional accessory · Check price</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleLockInCart}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0 20px',
                  height: '42px',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '13px',
                  fontWeight: 700,
                  borderRadius: '9999px',
                  backgroundColor: '#F59E0B',
                  color: '#FFFFFF',
                  border: 'none',
                  boxShadow: '0 2px 6px rgba(245, 158, 11, 0.3)',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#D97706';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#F59E0B';
                }}
                title="Add to Amazon cart; confirm the final price there"
              >
                <span>🛒 {includeBundle ? 'Add bundle to cart' : 'Add to Amazon cart'}</span>
              </button>
              <button
                type="button"
                onClick={handleOpenStore}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '0 16px',
                  height: '42px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '12.5px',
                  fontWeight: 650,
                  borderRadius: '9999px',
                  backgroundColor: 'var(--surface-2)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-strong)',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#F1F5F9';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#F8FAFC';
                }}
              >
                <span>{isMobile ? "⚡ Open App" : "View on Amazon ↗"}</span>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 10L10 2M10 2H4M10 2V8" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleOpenStore}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0 24px',
                height: '42px',
                fontFamily: 'var(--font-heading)',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '9999px',
                flexShrink: 0,
                backgroundColor: '#0066CC',
                color: '#FFFFFF',
                border: 'none',
                boxShadow: '0 1px 3px rgba(0, 102, 204, 0.25)',
                transition: 'all 0.15s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0071E3';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0066CC';
              }}
            >
              <span>{isMobile ? `⚡ Open in ${storeName} App` : `⚡ View Deal on ${storeName} ↗`}</span>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 10L10 2M10 2H4M10 2V8" />
              </svg>
            </button>
          )}

          <button
            type="button"
            onClick={() => openGoogleShoppingModal(deal.title)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0 14px',
              height: '42px',
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '9999px',
              color: '#1D4ED8',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 120ms ease',
            }}
            title="Scan all Indian stores on Google Shopping Radar"
          >
            <span>🛍️ Scan Stores</span>
            <span style={{ fontSize: '9px', backgroundColor: '#DBEAFE', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>IN-APP</span>
          </button>

          <button
            onClick={handleShare}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '0 14px',
              height: '42px',
              backgroundColor: 'var(--bg-surface-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '9999px',
              color: copyLink ? '#059669' : '#475569',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 120ms ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <circle cx="10" cy="2" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
              <circle cx="10" cy="10" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
              <circle cx="2" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M8.5 2.7L3.5 5.3M8.5 9.3L3.5 6.7" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
            {copyLink ? 'Copied!' : 'Copy Link'}
          </button>

          <button
            onClick={handleReportExpired}
            disabled={reportSent}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '0 14px',
              height: '42px',
              backgroundColor: 'var(--bg-surface-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '9999px',
              color: reportSent ? '#94A3B8' : '#64748B',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              cursor: reportSent ? 'default' : 'pointer',
              opacity: reportSent ? 0.6 : 1,
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            {reportSent ? '⚠ Marked expired' : '⚠ Mark expired here'}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};
