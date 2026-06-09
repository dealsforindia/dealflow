import { useMemo, useState } from 'react';
import {
  Check,
  Clipboard,
  Copy,
  ExternalLink,
  ImageOff,
  Link2,
  MessageSquareText,
  PenLine,
  ShieldAlert,
  Tag,
  Maximize2,
  MoreHorizontal,
  X,
} from 'lucide-react';
import { API_URL } from '../../config';
import { calcDiscount, cleanTitle, fmt, fmtPrice, resolveChannelName } from '../../utils/helpers';

function normalizeImageUrl(deal) {
  let imgUrl = deal?.img_path || deal?.img_url || deal?.image_url || deal?.image || deal?.photo || deal?.photo_url || deal?.img || deal?.thumbnail;
  if (!imgUrl) return null;
  if (imgUrl.startsWith('http://74.225.250.0/images/')) {
    imgUrl = imgUrl.replace('http://74.225.250.0/images/', '/images/');
  }
  if (imgUrl.startsWith('/')) return API_URL + imgUrl;
  return imgUrl;
}

function normalizeScore(score) {
  const n = Number(score);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n <= 10 ? n * 10 : n);
}

function InfoItem({ label, value, href }) {
  if (!value) return null;
  return (
    <div className="info-row">
      <span className="info-row-label">{label}</span>
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" className="info-row-value info-row-link">
          <span>{value}</span>
          <ExternalLink size={12} />
        </a>
      ) : (
        <span className="info-row-value">{value}</span>
      )}
    </div>
  );
}

function MetricCard({ label, value, tone, sub }) {
  return (
    <div className={`metric-box${tone ? ` ${tone}` : ''}`}>
      <span className="metric-label">{label}</span>
      <span className="metric-value">{value || 'Not available'}</span>
      {sub ? <span className="metric-sub">{sub}</span> : null}
    </div>
  );
}

function DealDetailsPane({ deal, onApprove, onReject, onSpam, onEdit }) {
  const [imageFailed, setImageFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  const imageUrl = useMemo(() => normalizeImageUrl(deal), [deal]);

  if (!deal) {
    return (
      <div className="deal-details-pane details-empty">
        <div className="empty-icon"><Clipboard size={36} strokeWidth={1.4} /></div>
        <div className="empty-title">Select a deal</div>
        <div className="empty-sub">Queue details will appear here.</div>
      </div>
    );
  }

  const title = cleanTitle(deal);
  const salePrice = deal.price || deal.prices?.sale;
  const mrp = deal.original_price || deal.prices?.mrp;
  const discount = deal.discount_pct || deal.prices?.discount_pct || calcDiscount(salePrice, mrp);
  const channelName = deal.channelName || resolveChannelName(deal.channel || deal.source_channel);
  const source = deal.source || 'telegram';
  const category = deal.category || deal.dealType || 'General';
  const rawText = deal.aff_text || deal.message || '';
  const affiliateLink = deal.affiliate_link || '';
  const displayId = deal.fp_hash ? deal.fp_hash.substring(0, 8) : 'Unknown';

  const handleCopyLink = async () => {
    if (!affiliateLink) return;
    try {
      await navigator.clipboard.writeText(affiliateLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  const handleOpenLink = () => {
    if (affiliateLink) window.open(affiliateLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="deal-details-pane premium-details-pane">
      <div className="details-sticky-header">
        <div className="details-tabbar">
          <div className="details-tabs">
            <button type="button" className="details-tab active">Deal Details</button>
            <button type="button" className="details-tab">History</button>
          </div>
          <div className="details-toolbar">
            <span className="details-id">Deal ID: #{displayId}</span>
            <button type="button" className="icon-action" onClick={handleCopyLink} disabled={!affiliateLink} title="Copy affiliate link">
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
            <button type="button" className="icon-action" onClick={handleOpenLink} disabled={!affiliateLink} title="Open affiliate link">
              <ExternalLink size={16} />
            </button>
            <button type="button" className="icon-action" onClick={() => onEdit?.(deal)} title="Edit deal">
              <PenLine size={16} />
            </button>
            <button type="button" className="icon-action" title="More actions">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="details-scroll-content">
        <section className="details-hero-grid">
          <div className="details-image-card">
            <div className="details-thumb-strip">
              <div className="details-thumb-img active">
                {imageUrl && !imageFailed ? <img src={imageUrl} alt="" /> : <ImageOff size={14} />}
              </div>
              {imageUrl && !imageFailed ? (
                <div className="details-thumb-img ghost"><img src={imageUrl} alt="" /></div>
              ) : null}
            </div>
            <div className="details-main-image-shell">
              {imageUrl && !imageFailed ? (
                <img
                  src={imageUrl}
                  alt=""
                  className="details-main-img"
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <div className="details-image-fallback">
                  <ImageOff size={36} />
                  <span>No product image</span>
                </div>
              )}
              <button type="button" className="image-expand-btn" title="Open image">
                <Maximize2 size={14} />
              </button>
            </div>
          </div>

          <div className="details-copy-card">
            <div className="details-header-meta">
              {deal.brand ? <span>{deal.brand}</span> : null}
              <button type="button" className="inline-link" onClick={handleOpenLink} disabled={!affiliateLink}>
                <ExternalLink size={13} />
              </button>
              <span className="details-pill strong"><Tag size={12} />{category}</span>
            </div>
            <h2 className="details-title">{title}</h2>
            <div className="details-subline">
              <span>Posted {fmt(deal.ts) || 'recently'}</span>
              <span>Channel <strong>{channelName}</strong></span>
            </div>
            <div className="details-price-row">
              <span className="details-price">{fmtPrice(salePrice) || 'No price'}</span>
              {mrp ? <span className="details-mrp">MRP {fmtPrice(mrp)}</span> : null}
              {discount ? <span className="details-discount">{Math.round(Number(discount))}% OFF</span> : null}
            </div>
            <div className="metrics-grid compact hero-metrics">
              <MetricCard label="Profit" value="₹240" sub="↑ 12%" tone="positive" />
              <MetricCard label="EPC" value="₹12.4" sub="↑ 8%" tone="positive" />
              <MetricCard label="Revenue" value="₹1.2M" sub="↑ 15%" tone="positive" />
              <MetricCard label="Conv Rate" value="4.2%" sub="↑ 0.5%" tone="positive" />
              <MetricCard label="Category" value={category} />
              <MetricCard label="Stock" value="In Stock" tone="neutral" />
            </div>
          </div>
        </section>

        {rawText ? (
          <section className="ai-summary-box">
            {rawText.length > 180 ? `${rawText.slice(0, 180).trim()}...` : rawText}
          </section>
        ) : null}

        <section className="detail-section">
          <div className="section-title">
            <Link2 size={15} />
            Affiliate Information
          </div>
          <div className="info-table premium-info-table">
            <InfoItem label="Affiliate Link" value={affiliateLink || 'Not available'} href={affiliateLink || null} />
            <InfoItem label="Source" value={source} />
            <InfoItem label="Channel" value={channelName} />
            <InfoItem label="Category" value={category} />
            <InfoItem label="Brand" value={deal.brand} />
            <InfoItem label="Posted At" value={fmt(deal.ts)} />
            <InfoItem label="Deal Type" value={deal.dealType || 'product'} />
            <InfoItem label="Message ID" value={deal.message_id || deal.msg_id} />
            <InfoItem label="Fingerprint" value={deal.fp_hash} />
          </div>
        </section>

        {rawText ? (
          <section className="detail-section">
            <div className="section-title">
              <MessageSquareText size={15} />
              Original Telegram Post
            </div>
            <div className="raw-post-card">{rawText}</div>
          </section>
        ) : null}

        <section className="detail-section">
          <div className="section-title">
            <ShieldAlert size={15} />
            Activity Timeline
          </div>
          <div className="timeline-area">
            <div className="timeline-item">
              <span className="timeline-time">{fmt(deal.ts) || 'Unknown'}</span>
              <span className="timeline-desc">Added to review queue</span>
            </div>
            <div className="timeline-item">
              <span className="timeline-time">Current</span>
              <span className="timeline-desc">Waiting for reviewer decision</span>
            </div>
          </div>
        </section>
      </div>

      <div className="action-bar">
        <button className="action-btn action-btn-reject" onClick={() => onReject(deal.fp_hash)}>
          <X size={16} />
          <span>Reject Deal</span>
          <span className="action-shortcut">R</span>
        </button>
        <button className="action-btn action-btn-spam" onClick={() => (onSpam || onReject)(deal.fp_hash)}>
          <ShieldAlert size={16} />
          <span>Mark as Spam</span>
          <span className="action-shortcut">S</span>
        </button>
        <button className="action-btn action-btn-approve" onClick={() => onApprove(deal.fp_hash)}>
          <Check size={16} />
          <span>Approve Deal</span>
          <span className="action-shortcut">A</span>
        </button>
      </div>
    </div>
  );
}

export default DealDetailsPane;
