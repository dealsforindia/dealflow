import React, { useState, useEffect } from 'react';
import useStore from '../store';
import { cleanTitle } from '../utils/helpers';
import { PenLine, X, Sparkles, Check, Undo2 } from 'lucide-react';
import TelegramPreview from './ReviewPanes/TelegramPreview';
import { API_URL } from '../config';

function normalizeImageUrl(deal) {
  let imgUrl = deal?.img_url || deal?.img_path || deal?.image_url || deal?.image;
  if (!imgUrl) return null;
  if (imgUrl.startsWith('http://74.225.250.0/images/')) {
    imgUrl = imgUrl.replace('http://74.225.250.0/images/', '/images/');
  }
  if (imgUrl.includes('/images/')) {
    imgUrl = '/images/' + imgUrl.split('/images/')[1];
  }
  if (imgUrl.startsWith('/')) return API_URL + imgUrl;
  return imgUrl;
}

export default function EditDrawer({ deal, onClose, onApprove }) {
  const { editDeal, aiRewrite } = useStore();

  const [title, setTitle] = useState(deal.title || deal.prod_name || '');
  const [message, setMessage] = useState(deal.aff_text || deal.message || deal.original_text || '');
  const [price, setPrice] = useState(deal.price || '');
  const [originalPrice, setOriginalPrice] = useState(deal.original_price || '');
  const [affiliateLink, setAffiliateLink] = useState(deal.affiliate_link || '');
  const [isRewriting, setIsRewriting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [oneInstruction, setOneInstruction] = useState('');
  const [prevMessage, setPrevMessage] = useState(null); // for undo

  const dealType = deal.deal_type || deal.dealType || 'product';
  const isProduct = dealType === 'product';
  const imageUrl = normalizeImageUrl(deal);

  useEffect(() => {
    setIsDirty(
      title !== (deal.title || deal.prod_name || '') ||
      message !== (deal.aff_text || deal.message || deal.original_text || '') ||
      price !== (deal.price || '') ||
      originalPrice !== (deal.original_price || '') ||
      affiliateLink !== (deal.affiliate_link || '')
    );
  }, [title, message, price, originalPrice, affiliateLink, deal]);

  const handleAiRewrite = async () => {
    if (!oneInstruction.trim() && !message.trim()) return;
    setIsRewriting(true);
    setPrevMessage(message); // save for undo

    const result = await aiRewrite(
      deal.fp_hash,
      oneInstruction || 'Clean up and format nicely',
      message,
      dealType
    );

    if (result) {
      setMessage(result);
    }
    setIsRewriting(false);
  };

  const handleUndo = () => {
    if (prevMessage !== null) {
      setMessage(prevMessage);
      setPrevMessage(null);
    }
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
      <div className="edit-drawer" style={{ maxWidth: 960, width: '92vw' }}>
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-title">
            <PenLine size={16} strokeWidth={2.5} style={{marginRight:6, verticalAlign:'text-bottom'}} />
            {isProduct ? 'Edit Deal' : 'Edit Trick / Loot'}
            {isDirty && <span className="drawer-dirty-badge">Unsaved</span>}
          </div>
          <div className="drawer-header-actions">
            <span className="deal-channel-badge prominent" style={{ marginRight: '8px' }}>{deal.channel || deal.source_channel || 'Unknown'}</span>
            {deal.source === 'desidime' && <span className="desidime-source-badge" style={{ marginRight: 8 }}>DesiDime</span>}
            <button className="drawer-close-btn" onClick={onClose}><X size={16} strokeWidth={2.5}/></button>
          </div>
        </div>

        {/* Body — Two Column */}
        <div className="drawer-body" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
          {/* LEFT: Edit Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
            <div className="drawer-field">
              <label className="drawer-label">Affiliate Link</label>
              <input className="drawer-input" value={affiliateLink} onChange={e => setAffiliateLink(e.target.value)} placeholder="https://amzn.to/..." />
            </div>

            {/* Post text + AI controls */}
            <div className="drawer-field" style={{ flex: 1 }}>
              <div className="drawer-label-row">
                <label className="drawer-label">Post Text {dealType === 'trick' ? '(Full — never shortened)' : ''}</label>
              </div>

              {/* AI instruction bar */}
              <div className="ai-instruction-bar">
                <input
                  className="ai-instruction-input"
                  value={oneInstruction}
                  onChange={e => setOneInstruction(e.target.value)}
                  placeholder='AI instruction: "clean up", "add emojis", "format steps"…'
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
                {prevMessage !== null && (
                  <button
                    className="ai-rewrite-btn"
                    onClick={handleUndo}
                    style={{display:'flex',alignItems:'center',gap:'4px', background: 'rgba(248,113,113,0.1)', borderColor: 'rgba(248,113,113,0.3)', color: '#f87171'}}
                    title="Undo AI rewrite"
                  >
                    <Undo2 size={13} /> Undo
                  </button>
                )}
              </div>

              <textarea
                className="drawer-textarea"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Write or edit the post text here..."
                rows={dealType === 'trick' ? 18 : 12}
              />
              <div className="drawer-char-count">
                {message.length} chars
                {imageUrl ? ' · 1024 max (with image)' : ' · 4096 max'}
                {message.length > (imageUrl ? 1024 : 4096) && <span style={{ color: '#f87171', fontWeight: 700 }}> — OVER LIMIT</span>}
              </div>
            </div>
          </div>

          {/* RIGHT: Live TG Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'sticky', top: 0 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-ter)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              📱 Live Telegram Preview
            </label>
            <TelegramPreview
              text={message}
              imageUrl={imageUrl}
              channelName="@dealsforindiachannel"
            />

            {/* Affiliate status mini */}
            <div style={{
              padding: '10px 12px',
              borderRadius: 8,
              background: deal.affiliate_applied ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
              border: `1px solid ${deal.affiliate_applied ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
              fontSize: 11,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <span style={{ fontSize: 16 }}>{deal.affiliate_applied ? '✅' : '⚠️'}</span>
              <span style={{ color: deal.affiliate_applied ? 'var(--accent-green-lt)' : '#f59e0b', fontWeight: 700 }}>
                {deal.affiliate_applied ? 'Affiliated' : 'Not Affiliated'}
              </span>
            </div>
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
