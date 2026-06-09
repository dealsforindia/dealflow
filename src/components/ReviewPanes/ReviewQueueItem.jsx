import React from 'react';

const CATEGORY_COLORS = {
  Fashion: 'var(--accent-purple)',
  Electronics: 'var(--accent-blue)',
  Footwear: 'var(--accent-amber)',
  General: 'var(--accent-green)',
  Home: 'var(--accent-cyan)'
};

function ReviewQueueItem({ deal, isSelected, onClick }) {
  const title = deal.title || deal.prod_name || 'Unknown Item';
  const price = deal.price ? `₹${deal.price}` : 'N/A';
  const category = deal.category || 'General';
  const channelName = deal.channel || 'System';
  
  // Calculate relative age
  const ageStr = deal.ts ? getRelativeTime(deal.ts * 1000) : '1h ago';
  const score = deal.score ? Math.round(deal.score * 10) : 95; // Assuming score out of 10, scale to 100

  return (
    <div className={`queue-item ${isSelected ? 'selected' : ''}`} onClick={onClick}>
      <div className="queue-item-score">{score}</div>
      <img src={deal.img_path || 'https://via.placeholder.com/48'} alt="Thumb" className="queue-item-thumb" />
      <div className="queue-item-details">
        <div className="queue-item-meta" style={{ marginBottom: '4px' }}>
          <span style={{ color: CATEGORY_COLORS[category] || CATEGORY_COLORS.General, fontWeight: 600 }}>{category}</span>
          <span className="queue-item-age">{ageStr}</span>
        </div>
        <div className="queue-item-title">{title}</div>
        <div className="queue-item-meta">
          <span className="queue-item-price">{price}</span>
          <span className="queue-item-channel">{channelName}</span>
        </div>
      </div>
    </div>
  );
}

function getRelativeTime(ts) {
  const diff = Date.now() - ts;
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return '<1h ago';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours/24)}d ago`;
}

export default ReviewQueueItem;
