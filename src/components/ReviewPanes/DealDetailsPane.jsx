import { useMemo, useState, useEffect, useRef } from 'react';
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
  Upload,
  Search,
  Trash2,
  RefreshCw,
  Globe,
} from 'lucide-react';
import { API_URL } from '../../config';
import { calcDiscount, cleanTitle, fmt, fmtPrice, resolveChannelName, normalizeImageUrl } from '../../utils/helpers';
import useDealStore from '../../store/useDealStore';

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
  const [retryLoading, setRetryLoading] = useState(false);
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const fileInputRef = useRef(null);
  const imageUrl = useMemo(() => normalizeImageUrl(deal), [deal]);
  const { retryAffiliate, scrapeImage, uploadImage, markSpam } = useDealStore();

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

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
  const dealType = deal.deal_type || deal.dealType || 'product';
  const rawText = deal.original_text || deal.aff_text || deal.message || '';
  const affText = deal.aff_text || deal.message || '';
  const affiliateLink = deal.affiliate_link || '';
  const displayId = deal.fp_hash ? deal.fp_hash.substring(0, 8) : 'Unknown';
  const isAffiliated = deal.affiliate_applied === true;
  const expandedUrls = deal.expanded_urls || {};
  const originalMsgLink = deal.original_msg_link || '';

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

  const handleRetryAffiliate = async () => {
    setRetryLoading(true);
    await retryAffiliate(deal.fp_hash);
    setRetryLoading(false);
  };

  const handleScrapeImage = async () => {
    setScrapeLoading(true);
    await scrapeImage(deal.fp_hash);
    setScrapeLoading(false);
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadImage(deal.fp_hash, file);
  };

  const handleSpam = () => {
    if (onSpam) onSpam(deal.fp_hash);
    else markSpam(deal.fp_hash);
  };

  const channelInitial = channelName ? channelName.charAt(0).toUpperCase() : '📺';
  const postTime = deal.ts ? new Date(deal.ts * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className="deal-details-pane premium-details-pane">
      <div className="details-sticky-header">
        <div className="details-tabbar">
          <div className="details-tabs">
            <button type="button" className="details-tab active">Deal Details</button>
            <button type="button" className="details-tab">History</button>
          </div>
          <div className="details-toolbar">
            <span className="details-id">#{displayId}</span>
            {deal.source === 'desidime' && <span className="desidime-source-badge"><Globe size={11} /> DesiDime</span>}
            {dealType === 'trick' && <span className="details-pill" style={{ color: '#f59e0b', borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.08)' }}>🎯 Trick</span>}
            <button type="button" className="icon-action" onClick={handleCopyLink} disabled={!affiliateLink} title="Copy affiliate link">
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
            <button type="button" className="icon-action" onClick={handleOpenLink} disabled={!affiliateLink} title="Open affiliate link">
              <ExternalLink size={16} />
            </button>
            <button type="button" className="icon-action" onClick={() => onEdit?.(deal)} title="Edit deal">
              <PenLine size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="details-scroll-content">
        {/* ── SECTION 1: RAW TELEGRAM POST ── */}
        <section className="raw-tg-bubble">
          <div className="raw-tg-bubble-header">
            <div className="raw-tg-bubble-avatar">{channelInitial}</div>
            <span className="raw-tg-bubble-channel">{channelName || source}</span>
            <span className="raw-tg-bubble-time">{postTime}</span>
          </div>
          <div className="raw-tg-bubble-label">📨 Raw Telegram Post</div>
          {imageUrl && !imageFailed && (
            <img
              src={imageUrl}
              alt=""
              className="raw-tg-bubble-image"
              onError={() => setImageFailed(true)}
            />
          )}
          <div className="raw-tg-bubble-text">{rawText || '(No text)'}</div>
        </section>

        {/* ── SECTION 2: AFTER AFFILIATE CONVERSION ── */}
        {affText && affText !== rawText && (
          <section className="raw-tg-bubble">
            <div className="raw-tg-bubble-label">📤 After Affiliate Conversion</div>
            <div className="raw-tg-bubble-text">{affText}</div>
          </section>
        )}

        {/* ── SECTION 3: AFFILIATE STATUS ── */}
        <div className={`affiliate-status-section ${isAffiliated ? 'affiliated' : 'not-affiliated'}`}>
          <span className="affiliate-status-icon">{isAffiliated ? '✅' : '⚠️'}</span>
          <div className="affiliate-status-text">
            <strong>{isAffiliated ? 'Affiliated via EarnKaro' : 'Not Affiliated'}</strong>
            <span>{isAffiliated ? 'Links have been converted' : 'EarnKaro conversion did not apply'}</span>
          </div>
          {!isAffiliated && (
            <button className="retry-affiliate-btn" onClick={handleRetryAffiliate} disabled={retryLoading}>
              <RefreshCw size={12} /> {retryLoading ? 'Retrying…' : 'Retry'}
            </button>
          )}
        </div>

        {/* ── SECTION 4: IMAGE + CONTROLS ── */}
        <section className="details-image-card">
          <div className="details-thumb-strip">
            <div className="details-thumb-img active">
              {imageUrl && !imageFailed ? <img src={imageUrl} alt="" /> : <ImageOff size={14} />}
            </div>
          </div>
          <div>
            <div className="details-main-image-shell">
              {imageUrl && !imageFailed ? (
                <img
                  src={imageUrl}
                  alt=""
                  className="details-main-img"
                  onError={() => setImageFailed(true)}
                  onClick={() => window.open(imageUrl, '_blank', 'noopener,noreferrer')}
                  style={{ cursor: 'pointer' }}
                />
              ) : (
                <div className="details-image-fallback">
                  <ImageOff size={36} />
                  <span>No product image</span>
                </div>
              )}
              <button
                type="button"
                className="image-expand-btn"
                title="Open image"
                onClick={() => imageUrl && window.open(imageUrl, '_blank', 'noopener,noreferrer')}
              >
                <Maximize2 size={14} />
              </button>
            </div>
            <div className="image-controls-bar">
              <button className="image-control-btn primary" onClick={() => fileInputRef.current?.click()}>
                <Upload size={13} /> Replace
              </button>
              <button className="image-control-btn" onClick={handleScrapeImage} disabled={scrapeLoading}>
                <Search size={13} /> {scrapeLoading ? 'Scraping…' : 'Scrape from URL'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleUploadImage}
              />
            </div>
          </div>
        </section>

        {/* ── SECTION 5: TITLE + PRICE + META ── */}
        <section className="details-copy-card">
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
            {originalMsgLink && (
              <a href={originalMsgLink} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontSize: 11 }}>
                View Original →
              </a>
            )}
          </div>
          <div className="details-price-row">
            <span className="details-price">{fmtPrice(salePrice) || 'No price'}</span>
            {mrp ? <span className="details-mrp">MRP {fmtPrice(mrp)}</span> : null}
            {discount ? <span className="details-discount">{Math.round(Number(discount))}% OFF</span> : null}
          </div>
          <div className="metrics-grid compact hero-metrics">
            <MetricCard label="Score" value={deal.score != null ? `${deal.score}/10` : 'N/A'} tone={deal.score >= 7 ? 'positive' : ''} />
            <MetricCard label="Type" value={dealType === 'trick' ? '🎯 Trick' : '🛍️ Product'} />
            <MetricCard label="Category" value={category} />
            <MetricCard label="Source" value={source === 'desidime' ? '🟠 DesiDime' : '📱 Telegram'} />
            <MetricCard label="Platform" value={deal.platforms?.join(', ') || 'Unknown'} />
            <MetricCard label="Coupon" value={deal.coupon || 'None'} />
          </div>
        </section>

        {/* ── SECTION 6: LINKS CHAIN ── */}
        {Object.keys(expandedUrls).length > 0 && (
          <section className="detail-section">
            <div className="section-title">
              <Link2 size={15} />
              Link Chain
            </div>
            <div className="link-chain-list">
              {Object.entries(expandedUrls).map(([short, expanded], i) => (
                <div key={i} className="link-chain-item">
                  <span className="link-chain-label">Original</span>
                  <a href={short} target="_blank" rel="noreferrer" className="link-chain-url">{short}</a>
                  <span className="link-chain-arrow">→</span>
                  <span className="link-chain-label">Expanded</span>
                  <a href={expanded} target="_blank" rel="noreferrer" className="link-chain-url">{expanded}</a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── SECTION 7: DEAL INFO ── */}
        <section className="detail-section">
          <div className="section-title">
            <Link2 size={15} />
            Deal Information
          </div>
          <div className="info-table premium-info-table">
            <InfoItem label="Affiliate Link" value={affiliateLink || 'Not available'} href={affiliateLink || null} />
            <InfoItem label="Source" value={source} />
            <InfoItem label="Channel" value={channelName} />
            <InfoItem label="Category" value={category} />
            <InfoItem label="Brand" value={deal.brand} />
            <InfoItem label="Posted At" value={fmt(deal.ts)} />
            <InfoItem label="Deal Type" value={dealType} />
            <InfoItem label="Message ID" value={deal.message_id || deal.msg_id} />
            <InfoItem label="Fingerprint" value={deal.fp_hash} />
          </div>
        </section>

        {/* ── SECTION 8: TIMELINE ── */}
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
        <button className="action-btn action-btn-spam" onClick={handleSpam}>
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
