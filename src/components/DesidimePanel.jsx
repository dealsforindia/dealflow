import { useEffect, useState } from 'react';
import { Globe, RefreshCw, Check, X, ExternalLink, ImageOff, ShieldAlert, PenLine } from 'lucide-react';
import useDealStore from '../store/useDealStore';
import { fmt, fmtPrice, cleanTitle } from '../utils/helpers';
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

function DesidimePanel() {
  const { desidimeDeals, fetchDesidimeDeals, approveDeal, rejectDeal, markSpam } = useDealStore();
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchDesidimeDeals().finally(() => setLoading(false));
  }, []);

  const pendingDeals = desidimeDeals.filter(d => d.status === 'pending' || d.status === 'pending_approval');
  const postedDeals = desidimeDeals.filter(d => d.status === 'posted' || d.status === 'auto_posted');

  const deal = selectedDeal;
  const imageUrl = deal ? normalizeImageUrl(deal) : null;

  return (
    <div className="center-panel-v2">
      <div className="review-v2-container" style={{ gridTemplateColumns: '360px 1fr' }}>
        {/* Left: DesiDime Queue */}
        <div className="review-queue-pane">
          <div className="queue-header">
            <div>
              <span className="queue-header-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Globe size={16} style={{ color: '#fb923c' }} />
                DesiDime
              </span>
              <span className="queue-header-count">{pendingDeals.length} pending · {postedDeals.length} posted</span>
            </div>
            <button className="queue-sort-btn" onClick={() => { setLoading(true); fetchDesidimeDeals().finally(() => setLoading(false)); }}>
              <RefreshCw size={13} className={loading ? 'spin' : ''} />
            </button>
          </div>

          <div className="queue-list">
            {desidimeDeals.length === 0 && !loading && (
              <div style={{ textAlign: 'center', color: 'var(--text-ter)', padding: 40 }}>
                <Globe size={32} style={{ opacity: 0.4, marginBottom: 10 }} />
                <div style={{ fontSize: 13, fontWeight: 600 }}>No DesiDime deals yet</div>
                <div style={{ fontSize: 11, marginTop: 4 }}>Deals will appear when desidime_bot.py runs</div>
              </div>
            )}

            {desidimeDeals.map(d => {
              const isSelected = selectedDeal?.fp_hash === d.fp_hash;
              const isPending = d.status === 'pending' || d.status === 'pending_approval';
              const title = cleanTitle(d);
              const img = normalizeImageUrl(d);
              const price = d.price || d.prices?.sale;

              return (
                <button
                  key={d.fp_hash}
                  className={`premium-queue-item${isSelected ? ' selected' : ''}`}
                  onClick={() => setSelectedDeal(d)}
                  type="button"
                >
                  <div className="queue-item-content">
                    <div className="queue-item-header">
                      <span className="queue-deal-id">
                        <span className="desidime-source-badge" style={{ fontSize: 9, padding: '1px 4px' }}>DD</span>
                      </span>
                      <span className="queue-item-age">{fmt(d.ts) || '—'}</span>
                    </div>
                    <div className="queue-item-body">
                      <div className="queue-thumb-shell">
                        {img ? <img src={img} alt="" className="queue-item-thumb" /> : <div className="queue-thumb-fallback"><ImageOff size={18} /></div>}
                      </div>
                      <div className="queue-item-details">
                        <div className="queue-item-title">{title}</div>
                        <div className="queue-item-bottom">
                          <div className="queue-price-stack">
                            <span className="queue-item-price">{price ? fmtPrice(price) : 'No price'}</span>
                            <span className="queue-channel-badge">{d.platforms?.[0] || d.store || 'DesiDime'}</span>
                          </div>
                          <div className="queue-item-badges">
                            <span className={`queue-badge ${isPending ? 'not-affiliated' : 'affiliated'}`}>
                              {isPending ? '⏳' : '✅'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Deal Details */}
        <div className="deal-details-pane">
          {!deal ? (
            <div className="details-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
              <Globe size={40} style={{ color: '#fb923c', opacity: 0.5 }} />
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>DesiDime Deals</div>
              <div style={{ fontSize: 12, color: 'var(--text-ter)' }}>Select a deal from the left to view details</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="details-sticky-header">
                <div className="details-tabbar">
                  <div className="details-tabs">
                    <button type="button" className="details-tab active">DesiDime Deal</button>
                  </div>
                  <div className="details-toolbar">
                    <span className="desidime-source-badge"><Globe size={11} /> DesiDime</span>
                    <span className="details-id">#{deal.fp_hash?.substring(0, 8)}</span>
                  </div>
                </div>
              </div>

              <div className="details-scroll-content">
                {/* Post preview */}
                <section className="raw-tg-bubble">
                  <div className="raw-tg-bubble-header">
                    <div className="raw-tg-bubble-avatar" style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}>D</div>
                    <span className="raw-tg-bubble-channel">DesiDime · {deal.platforms?.[0] || deal.store || ''}</span>
                  </div>
                  {imageUrl && <img src={imageUrl} alt="" className="raw-tg-bubble-image" />}
                  <div className="raw-tg-bubble-text">{deal.aff_text || deal.original_text || deal.prod_name}</div>
                </section>

                {/* Affiliate status */}
                <div className={`affiliate-status-section ${deal.affiliate_applied ? 'affiliated' : 'not-affiliated'}`}>
                  <span className="affiliate-status-icon">{deal.affiliate_applied ? '✅' : '⚠️'}</span>
                  <div className="affiliate-status-text">
                    <strong>{deal.affiliate_applied ? 'Affiliated' : 'Not Affiliated'}</strong>
                    <span>{deal.affiliate_applied ? 'Links converted via EarnKaro' : 'Direct link — no affiliate'}</span>
                  </div>
                </div>

                {/* Price & Meta */}
                <section className="details-copy-card">
                  <h2 className="details-title">{cleanTitle(deal)}</h2>
                  <div className="details-price-row">
                    <span className="details-price">{fmtPrice(deal.price || deal.prices?.sale) || 'No price'}</span>
                    {deal.prices?.mrp ? <span className="details-mrp">MRP {fmtPrice(deal.prices.mrp)}</span> : null}
                    {deal.coupon && <span className="details-discount">🏷️ {deal.coupon}</span>}
                  </div>
                  <div className="details-subline">
                    <span>Store: <strong>{deal.platforms?.[0] || deal.store || 'Unknown'}</strong></span>
                    <span>Scraped {fmt(deal.ts) || 'recently'}</span>
                    {deal.original_msg_link && (
                      <a href={deal.original_msg_link} target="_blank" rel="noreferrer" style={{ color: '#fb923c', textDecoration: 'none', fontSize: 11 }}>
                        View on DesiDime →
                      </a>
                    )}
                  </div>
                </section>
              </div>

              {/* Action bar */}
              {(deal.status === 'pending' || deal.status === 'pending_approval') && (
                <div className="action-bar">
                  <button className="action-btn action-btn-reject" onClick={() => { rejectDeal(deal.fp_hash); setSelectedDeal(null); fetchDesidimeDeals(); }}>
                    <X size={16} /><span>Reject</span>
                  </button>
                  <button className="action-btn action-btn-spam" onClick={() => { markSpam(deal.fp_hash); setSelectedDeal(null); fetchDesidimeDeals(); }}>
                    <ShieldAlert size={16} /><span>Spam</span>
                  </button>
                  <button className="action-btn action-btn-approve" onClick={() => { approveDeal(deal.fp_hash); setSelectedDeal(null); fetchDesidimeDeals(); }}>
                    <Check size={16} /><span>Approve & Post</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DesidimePanel;
