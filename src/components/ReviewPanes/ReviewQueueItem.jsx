import { useMemo, useState } from 'react';
import { Check, ImageOff, ExternalLink, Heart, Share2 } from 'lucide-react';
import { calcDiscount, cleanTitle, fmt, fmtPrice, resolveChannelName, isDesidimeDeal, normalizeImageUrl, normalizeScore, parseDesidimeStore } from '../../utils/helpers';

const CATEGORY_COLORS = {
  Fashion: 'var(--accent-purple)',
  Electronics: 'var(--accent-blue)',
  Footwear: 'var(--accent-amber)',
  General: 'var(--accent-green)',
  Home: 'var(--accent-cyan)',
  Grocery: 'var(--accent-green)',
  Beauty: 'var(--accent-pink, var(--accent-purple))',
};

// Gradient pairs for discount badges
const DISCOUNT_GRADIENTS = [
  'linear-gradient(135deg, #a78bfa 0%, #6366f1 100%)',
  'linear-gradient(135deg, #60a5fa 0%, #f9a8d4 100%)',
  'linear-gradient(135deg, #6ee7b7 0%, #a7f3d0 100%)',
  'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
  'linear-gradient(135deg, #f472b6 0%, #c084fc 100%)',
];


function ReviewQueueItem({ deal, isSelected, onClick }) {
  const [failedImageUrl, setFailedImageUrl] = useState(null);
  const [liked, setLiked] = useState(false);
  const [shared, setShared] = useState(false);
  const imageUrl = useMemo(() => normalizeImageUrl(deal), [deal]);
  const imageFailed = imageUrl && failedImageUrl === imageUrl;

  const title = cleanTitle(deal);
  const price = fmtPrice(deal.price || deal.prices?.sale);
  const mrp = fmtPrice(deal.original_price || deal.prices?.mrp);
  const category = deal.category || deal.dealType || 'General';
  const channelName = isDesidimeDeal(deal)
    ? parseDesidimeStore(deal)
    : (deal.channelName || resolveChannelName(deal.channel || deal.source_channel));
  const ageStr = fmt(deal.ts);
  const score = normalizeScore(deal.score);
  const categoryColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.General;

  const discount = calcDiscount(
    deal.price || deal.prices?.sale,
    deal.original_price || deal.prices?.mrp
  );

  // Pick a gradient based on deal hash
  const gradientIdx = deal.fp_hash
    ? deal.fp_hash.charCodeAt(0) % DISCOUNT_GRADIENTS.length
    : 0;
  const badgeGradient = DISCOUNT_GRADIENTS[gradientIdx];

  const affiliateLink = deal.affiliate_link || '';

  const handleGetDeal = (e) => {
    e.stopPropagation();
    if (affiliateLink) {
      window.open(affiliateLink, '_blank', 'noopener,noreferrer');
    }
  };

  const handleLike = (e) => {
    e.stopPropagation();
    setLiked(!liked);
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const shareText = `${title} — ${price || 'Check price'}\n${affiliateLink || ''}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url: affiliateLink });
      } catch { /* cancelled */ }
    } else if (affiliateLink) {
      await navigator.clipboard.writeText(shareText);
      setShared(true);
      setTimeout(() => setShared(false), 1500);
    }
  };

  // Channel initial letter for the store icon
  const channelInitial = channelName ? channelName.charAt(0).toUpperCase() : '🏷';

  return (
    <button
      type="button"
      className={`queue-item premium-queue-item${isSelected ? ' selected' : ''}`}
      onClick={onClick}
      aria-pressed={isSelected}
    >
      {/* ── Desktop layout (unchanged) ── */}
      <div className="queue-item-desktop">
        <div className="checkbox-rail">
          <div className={`custom-checkbox ${isSelected ? 'checked' : ''}`}>
            {isSelected && <Check size={10} strokeWidth={3} />}
          </div>
        </div>

        <div className="queue-item-content">
          <div className="queue-item-header">
            <span className="queue-deal-id">#{deal.fp_hash?.substring(0, 7) || 'Unknown'} <span className="queue-item-age">{ageStr}</span></span>
            <span className="queue-category-pill" style={{ '--queue-category-color': categoryColor }}>
              {category}
            </span>
          </div>

          <div className="queue-item-body">
            <div className="queue-thumb-shell">
              {imageUrl && !imageFailed ? (
                <img
                  src={imageUrl}
                  alt=""
                  className="queue-item-thumb"
                  loading="lazy"
                  onError={() => setFailedImageUrl(imageUrl)}
                />
              ) : (
                <div className="queue-thumb-fallback">
                  <ImageOff size={18} />
                </div>
              )}
            </div>

            <div className="queue-item-details">
              <div className="queue-item-title">{title}</div>
              
              <div className="queue-item-bottom">
                <div className="queue-price-stack">
                  <span className="queue-item-price">{price || 'No price'}</span>
                  <span className="queue-channel-badge" title={channelName}>
                    {channelName}
                  </span>
                </div>
                <div className="queue-item-badges">
                  {isDesidimeDeal(deal) && (
                    <span className="queue-badge desidime" title="DesiDime deal">DD</span>
                  )}
                  {deal.deal_type === 'trick' && (
                    <span className="queue-badge trick" title="Trick / Loot">🎯</span>
                  )}
                  {deal.affiliate_applied === true && (
                    <span className="queue-badge affiliated" title="Affiliated">💰</span>
                  )}
                  {deal.affiliate_applied === false && (
                    <span className="queue-badge not-affiliated" title="Not Affiliated">⚠️</span>
                  )}
                  {score && score >= 90 && <span className="queue-fire-icon">🔥</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile "Hot Right Now" card layout ── */}
      <div className="queue-item-mobile-card">
        {/* Discount badge */}
        {discount ? (
          <div className="mob-discount-badge" style={{ background: badgeGradient }}>
            <span className="mob-discount-fire">🔥</span>
            <span className="mob-discount-text">-{Math.round(discount)}%</span>
          </div>
        ) : (
          <div className="mob-discount-badge mob-discount-no-price" style={{ background: badgeGradient }}>
            <span className="mob-discount-text" style={{ fontSize: 13 }}>DEAL</span>
          </div>
        )}

        {/* Card content */}
        <div className="mob-card-content">
          {/* Store + time row */}
          <div className="mob-card-store-row">
            <div className="mob-store-info">
              <span className="mob-store-icon" style={{ background: badgeGradient }}>
                {channelInitial}
              </span>
              <span className="mob-store-name">{channelName}</span>
              <span className="mob-store-verified">☑</span>
            </div>
            <span className="mob-card-time">· {ageStr}</span>
          </div>

          {/* Title */}
          <div className="mob-card-title">{title}</div>

          {/* Price row */}
          <div className="mob-card-price-row">
            <span className="mob-card-price">{price || 'Check price'}</span>
            {mrp && <span className="mob-card-mrp">{mrp}</span>}
          </div>

          {/* CTA + actions */}
          <div className="mob-card-actions-row">
            <button
              type="button"
              className="mob-get-deal-btn"
              onClick={handleGetDeal}
            >
              Get Deal <ExternalLink size={14} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              className={`mob-icon-btn${liked ? ' liked' : ''}`}
              onClick={handleLike}
              title="Like"
            >
              <Heart size={20} strokeWidth={liked ? 0 : 1.8} fill={liked ? '#e53e3e' : 'none'} />
            </button>
            <button
              type="button"
              className={`mob-icon-btn${shared ? ' shared' : ''}`}
              onClick={handleShare}
              title="Share"
            >
              <Share2 size={20} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </div>
    </button>
  );
}

export default ReviewQueueItem;
