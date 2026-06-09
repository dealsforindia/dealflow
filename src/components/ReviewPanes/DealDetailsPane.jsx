import React from 'react';
import { ExternalLink, Copy, MoreHorizontal } from 'lucide-react';

function DealDetailsPane({ deal, onApprove, onReject }) {
  if (!deal) return <div className="deal-details-pane" style={{ justifyContent: 'center', alignItems: 'center', color: 'var(--text-ter)' }}>No deal selected</div>;

  const title = deal.title || deal.prod_name || 'Unknown Title';
  const price = deal.price ? `₹${deal.price}` : 'N/A';
  const mrp = deal.original_price ? `₹${deal.original_price}` : '';
  const discount = (deal.price && deal.original_price) ? Math.round((1 - (deal.price / deal.original_price)) * 100) : null;
  const channelName = deal.channel || 'System';
  const category = deal.category || 'General';
  const brand = deal.brand || 'Brand';
  
  // Placeholders as requested
  const profit = "₹196";
  const epc = "₹24.3";
  const convRate = "3.8%";
  const revenue = "₹4,823";
  const stock = "High";
  const cookieDuration = "7 Days";
  
  const handleCopyLink = () => {
    if (deal.affiliate_link) {
      navigator.clipboard.writeText(deal.affiliate_link);
    }
  };

  return (
    <div className="deal-details-pane">
      {/* ── STICKY HEADER ── */}
      <div className="details-sticky-header">
        <div className="details-header-meta">
          <span style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>{brand}</span>
          <span>•</span>
          <span style={{ color: 'var(--text-ter)' }}>{category}</span>
        </div>
        <div className="details-header-top">
          <div className="details-title">{title}</div>
        </div>
        <div className="details-header-top" style={{ marginTop: '4px' }}>
          <div className="details-price-row">
            <span className="details-price">{price}</span>
            {mrp && <span className="details-mrp">{mrp}</span>}
            {discount > 0 && <span className="details-discount">{discount}% OFF</span>}
          </div>
          <div className="details-header-meta" style={{ gap: '16px', alignItems: 'center' }}>
            <span>Posted 1h ago</span>
            <span>Channel <strong style={{color: 'var(--accent-blue)'}}>{channelName}</strong></span>
            <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              Deal ID: #{deal.fp_hash ? deal.fp_hash.substring(0,6) : 'Unknown'}
              <Copy size={14} style={{ cursor: 'pointer' }} onClick={handleCopyLink} />
              <MoreHorizontal size={14} style={{ cursor: 'pointer' }} />
            </span>
          </div>
        </div>
      </div>

      <div className="details-scroll-content">
        {/* ── IMAGE AREA ── */}
        <div className="details-image-area">
          <div className="details-thumbs">
            <img src={deal.img_path || 'https://via.placeholder.com/60'} alt="Thumb 1" className="details-thumb-img active" />
            <img src="https://via.placeholder.com/60?text=2" alt="Thumb 2" className="details-thumb-img" />
            <img src="https://via.placeholder.com/60?text=3" alt="Thumb 3" className="details-thumb-img" />
            <img src="https://via.placeholder.com/60?text=4" alt="Thumb 4" className="details-thumb-img" />
          </div>
          <img src={deal.img_path || 'https://via.placeholder.com/600'} alt="Main Product" className="details-main-img" />
        </div>

        {/* ── METRICS GRID ── */}
        <div className="metrics-grid">
          <div className="metric-box"><span className="metric-label">Profit</span><span className="metric-value">{profit} <span style={{fontSize: '11px', color: 'var(--text-sec)', fontWeight: 'normal'}}>(78%)</span></span></div>
          <div className="metric-box"><span className="metric-label">EPC</span><span className="metric-value">{epc}</span></div>
          <div className="metric-box"><span className="metric-label">Est. Revenue</span><span className="metric-value">{revenue}</span></div>
          <div className="metric-box"><span className="metric-label">Conv. Rate</span><span className="metric-value" style={{color: 'var(--accent-green)'}}>{convRate}</span></div>
          
          <div className="metric-box"><span className="metric-label">Category</span><span className="metric-value" style={{fontWeight: 'normal'}}>{category}</span></div>
          <div className="metric-box"><span className="metric-label">Stock</span><span className="metric-value" style={{color: 'var(--accent-green)', fontWeight: 'normal'}}>{stock}</span></div>
          <div className="metric-box"><span className="metric-label">Channel</span><span className="metric-value" style={{fontWeight: 'normal', color: 'var(--accent-blue)'}}>{channelName}</span></div>
          <div className="metric-box"><span className="metric-label">Source</span><span className="metric-value" style={{fontWeight: 'normal'}}>Myntra</span></div>
        </div>

        {/* ── AI SUMMARY ── */}
        <div className="ai-summary-box">
          High margin fashion deal. Oversized trendy t-shirt from {brand}. Good for summer collection promotions.
        </div>

        {/* ── DEAL INFORMATION TABLE ── */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>Deal Information</div>
          <div className="info-table">
            <div className="info-row"><span className="info-row-label">Affiliate Link</span><a href={deal.affiliate_link || '#'} target="_blank" rel="noreferrer" className="info-row-value info-row-link">{deal.affiliate_link || 'None'} <ExternalLink size={12}/></a></div>
            <div className="info-row"><span className="info-row-label">Source</span><span className="info-row-value">Myntra</span></div>
            <div className="info-row"><span className="info-row-label">Tracking ID</span><span className="info-row-value">dealflow-25</span></div>
            <div className="info-row"><span className="info-row-label">Channel</span><span className="info-row-value">{channelName}</span></div>
            <div className="info-row"><span className="info-row-label">Payout</span><span className="info-row-value">{profit}</span></div>
            <div className="info-row"><span className="info-row-label">Posted At</span><span className="info-row-value">Today, 10:05 AM</span></div>
            <div className="info-row"><span className="info-row-label">Cookie Duration</span><span className="info-row-value">{cookieDuration}</span></div>
            <div className="info-row"><span className="info-row-label">Message ID</span><span className="info-row-value">123456</span></div>
            <div className="info-row"><span className="info-row-label">Return Policy</span><span className="info-row-value">15 Days Returnable</span></div>
            <div className="info-row"><span className="info-row-label">Deal Type</span><span className="info-row-value" style={{color: 'var(--accent-cyan)'}}>Product Deal</span></div>
            <div className="info-row"><span className="info-row-label">Shipping</span><span className="info-row-value">Free Delivery</span></div>
            <div className="info-row"><span className="info-row-label">Priority</span><span className="info-row-value" style={{color: 'var(--accent-green)'}}>• High</span></div>
          </div>
        </div>

        {/* ── ACTIVITY TIMELINE ── */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>Activity Timeline</div>
          <div className="timeline-area">
            <div className="timeline-item"><span className="timeline-time">10:05 AM</span><span className="timeline-desc">Scraped from source</span></div>
            <div className="timeline-item"><span className="timeline-time">10:05 AM</span><span className="timeline-desc">AI Analyzed and Scored</span></div>
            <div className="timeline-item"><span className="timeline-time">10:06 AM</span><span className="timeline-desc">Added To Queue</span></div>
          </div>
        </div>

      </div>

      {/* ── ACTION BAR ── */}
      <div className="action-bar">
        <button className="action-btn action-btn-reject" onClick={() => onReject(deal.fp_hash)}>
          <span style={{marginRight: 'auto', paddingLeft: '8px'}}>Reject Deal</span>
          <span className="action-shortcut" style={{marginRight: '8px'}}>R</span>
        </button>
        <button className="action-btn action-btn-spam">
          <span style={{marginRight: 'auto', paddingLeft: '8px'}}>Mark as Spam</span>
          <span className="action-shortcut" style={{marginRight: '8px'}}>S</span>
        </button>
        <button className="action-btn action-btn-approve" onClick={() => onApprove(deal.fp_hash)}>
          <span style={{marginRight: 'auto', paddingLeft: '8px'}}>Approve Deal</span>
          <span className="action-shortcut" style={{marginRight: '8px'}}>A</span>
        </button>
      </div>
    </div>
  );
}

export default DealDetailsPane;
