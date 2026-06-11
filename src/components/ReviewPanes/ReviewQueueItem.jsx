import { useMemo, useState, useEffect } from 'react';
import { Check, ImageOff } from 'lucide-react';
import { calcDiscount, cleanTitle, fmt, fmtPrice, resolveChannelName, normalizeImageUrl, parseDesidimeStore, isDesidimeDeal } from '../../utils/helpers';

const CATEGORY_COLORS = {
  Fashion: 'var(--accent-purple)',
  Electronics: 'var(--accent-blue)',
  Footwear: 'var(--accent-amber)',
  General: 'var(--accent-green)',
  Home: 'var(--accent-cyan)',
  Grocery: 'var(--accent-green)',
  Beauty: 'var(--accent-pink, var(--accent-purple))',
};

function normalizeScore(score) {
  const n = Number(score);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n <= 10 ? n * 10 : n);
}

function ReviewQueueItem({ deal, isSelected, onClick }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = useMemo(() => normalizeImageUrl(deal), [deal]);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  const title = cleanTitle(deal);
  const price = fmtPrice(deal.price || deal.prices?.sale);
  const category = deal.category || deal.dealType || 'General';
  const channelName = isDesidimeDeal(deal)
    ? parseDesidimeStore(deal)
    : (deal.channelName || resolveChannelName(deal.channel || deal.source_channel));
  const ageStr = fmt(deal.ts);
  const score = normalizeScore(deal.score);
  const categoryColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.General;

  return (
    <button
      type="button"
      className={`queue-item premium-queue-item${isSelected ? ' selected' : ''}`}
      onClick={onClick}
      aria-pressed={isSelected}
    >
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
                onError={() => setImageFailed(true)}
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
    </button>
  );
}

export default ReviewQueueItem;
