import React, { useState, useEffect } from 'react';
import useStore from '../store';
import { cleanTitle } from '../utils/helpers';
import { PenLine, X, Sparkles, Check } from 'lucide-react';

const MOCK_REWRITES = {
  product: (deal, instruction) => {
    const base = `🔥 ${cleanTitle(deal.title)}\n\n✅ Price: ₹${Number(deal.price || 0).toLocaleString('en-IN')} (Was ₹${Number(deal.original_price || 0).toLocaleString('en-IN')})\n\n📦 ${deal.category || 'Electronics'}\n\n🛒 Buy now → ${deal.affiliate_link || 'link in bio'}\n\n#Deals #Sale #${(deal.category || 'Tech').replace(/\s/g, '')}`;
    if (instruction?.toLowerCase().includes('short')) return base.split('\n\n').slice(0, 3).join('\n\n');
    if (instruction?.toLowerCase().includes('urgent')) return `⚡ LIMITED TIME! ` + base;
    return base;
  },
  trick: (deal, instruction) => {
    const cleaned = (deal.message || '')
      .split('\n')
      .filter(line =>
        !line.includes('Forwarded from') &&
        !line.startsWith('— @') &&
        !line.includes('watermark') &&
        !line.match(/^@\w+$/)
      )
      .join('\n')
      .trim();
    const base = `💡 ${cleanTitle(deal.title)}\n\n${cleaned}\n\n✅ Verified & working!\n\nShare with your group 👆`;
    if (instruction?.toLowerCase().includes('short')) return `💡 ${cleanTitle(deal.title)}\n\n${cleaned.split('\n').slice(0, 6).join('\n')}`;
    if (instruction?.toLowerCase().includes('urgent')) return `⚡ Act fast! ` + base;
    return base;
  }
};

export default function EditDrawer({ deal, onClose, onApprove }) {
  const { editDeal, settings } = useStore();

  const [title, setTitle] = useState(deal.title || '');
  const [message, setMessage] = useState(deal.message || '');
  const [price, setPrice] = useState(deal.price || '');
  const [originalPrice, setOriginalPrice] = useState(deal.original_price || '');
  const [affiliateLink, setAffiliateLink] = useState(deal.affiliate_link || '');
  const [isRewriting, setIsRewriting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [oneInstruction, setOneInstruction] = useState('');

  const isProduct = (deal.dealType || 'product') === 'product';

  useEffect(() => {
    setIsDirty(
      title !== (deal.title || '') ||
      message !== (deal.message || '') ||
      price !== (deal.price || '') ||
      originalPrice !== (deal.original_price || '') ||
      affiliateLink !== (deal.affiliate_link || '')
    );
  }, [title, message, price, originalPrice, affiliateLink, deal]);

  const handleAiRewrite = async () => {
    setIsRewriting(true);
    await new Promise(r => setTimeout(r, 900));
    const rewritten = MOCK_REWRITES[deal.dealType || 'product'](deal, oneInstruction);
    setMessage(rewritten);
    setIsRewriting(false);
  };

  const handleSaveAndApprove = () => {
    editDeal(deal.fp_hash, { title, message, price: price || deal.price, original_price: originalPrice || deal.original_price, affiliate_link: affiliateLink || deal.affiliate_link });
    onApprove({ ...deal, title, message, price, original_price: originalPrice, affiliate_link: affiliateLink });
  };

  const handleSaveOnly = () => {
    editDeal(deal.fp_hash, { title, message, price, original_price: originalPrice, affiliate_link: affiliateLink });
    onClose();
  };

  return (
    <div className="drawer-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="edit-drawer">
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-title">
            <PenLine size={16} strokeWidth={2.5} style={{marginRight:6, verticalAlign:'text-bottom'}} /> {isProduct ? 'Edit Deal' : 'Edit Trick / Loot'}
            {isDirty && <span className="drawer-dirty-badge">Unsaved</span>}
          </div>
          <div className="drawer-header-actions">
            <span className="deal-channel-badge prominent" style={{ marginRight: '8px' }}>{deal.channel || 'Unknown'}</span>
            <button className="drawer-close-btn" onClick={onClose}><X size={16} strokeWidth={2.5}/></button>
          </div>
        </div>

        {/* Body */}
        <div className="drawer-body">
          {/* Title */}
          <div className="drawer-field">
            <label className="drawer-label">Title / Headline</label>
            <input className="drawer-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Deal title..." />
          </div>

          {/* Price row */}
          {isProduct && (
            <div className="drawer-field-row">
              <div className="drawer-field">
                <label className="drawer-label">Sale Price (₹)</label>
                <input className="drawer-input" type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="18999" />
              </div>
              <div className="drawer-field">
                <label className="drawer-label">Original Price (₹)</label>
                <input className="drawer-input" type="number" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} placeholder="24900" />
              </div>
            </div>
          )}

          {/* Affiliate link */}
          {isProduct && (
            <div className="drawer-field">
              <label className="drawer-label">Affiliate Link</label>
              <input className="drawer-input" value={affiliateLink} onChange={e => setAffiliateLink(e.target.value)} placeholder="https://amzn.to/..." />
            </div>
          )}

          {/* Post text + AI controls */}
          <div className="drawer-field" style={{ flex: 1 }}>
            <div className="drawer-label-row">
              <label className="drawer-label">Post Text</label>
            </div>

            {/* One-instruction bar */}
            <div className="ai-instruction-bar">
              <input
                className="ai-instruction-input"
                value={oneInstruction}
                onChange={e => setOneInstruction(e.target.value)}
                placeholder='One instruction: "make shorter", "remove watermark", "add urgency"…'
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAiRewrite(); } }}
              />
              <button
                className={`ai-rewrite-btn${isRewriting ? ' loading' : ''}`}
                onClick={handleAiRewrite}
                disabled={isRewriting}
                style={{display:'flex',alignItems:'center',gap:'4px'}}
              >
                {isRewriting
                  ? <><span className="ai-spinner" />Rewriting…</>
                  : <><Sparkles size={14} strokeWidth={2}/> AI Rewrite</>
                }
              </button>
            </div>

            <textarea
              className="drawer-textarea"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Write or edit the post text here..."
              rows={12}
            />
            <div className="drawer-char-count">{message.length} chars · Press Enter in instruction box to rewrite</div>
          </div>
        </div>

        {/* Footer */}
        <div className="drawer-footer">
          <button className="drawer-btn cancel" onClick={onClose}>Cancel</button>
          <button className="drawer-btn save-only" onClick={handleSaveOnly} disabled={!isDirty}>Save Draft</button>
          <button className="drawer-btn approve" onClick={handleSaveAndApprove} style={{display:'flex',alignItems:'center',gap:'4px'}}><Check size={14} strokeWidth={3}/> Save & Approve</button>
        </div>
      </div>
    </div>
  );
}
