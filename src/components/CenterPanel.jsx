import React, { useState, useEffect, useRef, useCallback } from 'react';
import useStore, { CHANNEL_NAME_MAP } from '../store';
import { cleanTitle, fmt, resolveChannelName, categoryEmoji, fmtPrice, calcDiscount } from '../utils/helpers';
import { WS_URL, API_URL } from '../config';
import EditDrawer from './EditDrawer';
import ComposeDrawer from './ComposeDrawer';
import {
  Inbox, ShoppingBag, Sparkles, ExternalLink, Check, PenLine, X,
  ChevronDown, ChevronUp, Filter, XCircle, Tag, Zap, Search, CheckSquare
} from 'lucide-react';
import ReviewQueueList from './ReviewPanes/ReviewQueueList';
import DealDetailsPane from './ReviewPanes/DealDetailsPane';
import AiInsightsPane from './ReviewPanes/AiInsightsPane';
import QuickReviewFooter from './ReviewPanes/QuickReviewFooter';
import '../ReviewPanel.css';

// ── CATEGORY EMOJI (Fallback) ──
function DealImage({ deal, size = 52 }) { /* Kept for PostedList */
  const [err, setErr] = useState(false);
  const emoji = categoryEmoji(deal.category || deal.dealType);
  let imgUrl = deal.img_url || deal.img_path || deal.image_url || deal.image || deal.photo || deal.photo_url || deal.img || deal.thumbnail;
  if (imgUrl && typeof imgUrl === 'string' && imgUrl.includes('/dealbot/images/')) {
    imgUrl = '/images/' + imgUrl.split('/dealbot/images/')[1];
  }

  if (imgUrl && imgUrl.startsWith('http://74.225.250.0/images/')) {
    imgUrl = imgUrl.replace('http://74.225.250.0/images/', '/images/');
  }
  if (imgUrl && imgUrl.includes('/images/')) {
    imgUrl = '/images/' + imgUrl.split('/images/')[1];
  } else if (imgUrl && imgUrl.includes('\\images\\')) {
    imgUrl = '/images/' + imgUrl.split('\\images\\')[1];
  }
  if (imgUrl && imgUrl.startsWith('/')) {
    imgUrl = API_URL + imgUrl;
  }

  if (imgUrl && !err) {
    return (
      <img
        src={imgUrl}
        alt=""
        style={{ width: size, height: size, objectFit: 'cover', borderRadius: 8 }}
        onError={() => setErr(true)}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: 8,
      background: 'var(--bg-hover)',
      border: '1px solid var(--border-card)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.45, flexShrink: 0,
    }}>
      {emoji}
    </div>
  );
}

// ── RAW POST EXPANDER ──
function RawPostExpander({ deal }) {
  const [open, setOpen] = useState(false);
  const text = deal.aff_text || deal.message || '';
  if (!text) return null;
  return (
    <div className="raw-expander">
      <button
        className="raw-toggle"
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
      >
        {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        {open ? 'Hide' : 'See raw Telegram post'}
      </button>
      {open && (
        <div className="raw-content">
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '11px', lineHeight: 1.4, color: 'var(--text-sec)' }}>
            {text}
          </pre>
        </div>
      )}
    </div>
  );
}

// ── POSTED LIST ──
function PostedList({ deals, onFilterChannel }) {
  const posted = deals.filter(d => d.status === 'posted').sort((a, b) => (b.ts || 0) - (a.ts || 0));
  if (posted.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon"><CheckSquare size={40} strokeWidth={1} /></div>
        <div className="empty-title">No deals posted today</div>
      </div>
    );
  }
  return (
    <div className="posted-list-wrapper">
      <div className="board posted-board">
        {posted.map(deal => {
          const chName = CHANNEL_NAME_MAP[deal.channel] || resolveChannelName(deal.channel);
          const title  = cleanTitle(deal);
          return (
            <div key={deal.fp_hash} className="deal-card posted-card">
              <div className="card-top">
                <DealImage deal={deal} size={48} />
                <div className="card-info">
                  <div className="card-title-row">
                    <span className="card-title">{title}</span>
                    <span className="card-time">{deal.ts ? new Date(deal.ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                  </div>
                  <div className="card-price-row">
                    {deal.price && <span className="price">₹{fmtPrice(deal.price)}</span>}
                    {deal.original_price && <span className="mrp">₹{fmtPrice(deal.original_price)}</span>}
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <div className="card-badges">
                  {deal.category && <span className="badge category-badge">{categoryEmoji(deal.category)} {deal.category}</span>}
                  <span className="badge channel-badge" onClick={(e) => { e.stopPropagation(); onFilterChannel(deal.channel); }}>
                    <Tag size={10} style={{ marginRight: 3 }} />
                    {chName}
                  </span>
                </div>
                <div className="card-actions">
                  <span className="posted-status"><Check size={11} strokeWidth={3} /> Posted</span>
                  <a href={deal.affiliate_link || '#'} target="_blank" rel="noreferrer" className="action-icon-btn link" onClick={e => e.stopPropagation()}>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


export default function CenterPanel({ initialSubTab, initialChannelFilter, onConsumeInitial }) {
  const { deals, dealsLoading, approveDeal, rejectDeal, editDeal, addToast, activeFilter, setFilter, clearFilter } = useStore();

  const [subTab,     setSubTab]     = useState('Products');
  const [focusIdx,   setFocusIdx]   = useState(0);
  const [editingDeal,setEditingDeal]= useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [chFilter,   setChFilter]   = useState(null);
  const [srcFilter,  setSrcFilter]  = useState(null);
  const [showFilters,setShowFilters]= useState(false);
  const [searchQuery,setSearchQuery]= useState('');

  // Consume initial navigation from topbar/sidebar
  useEffect(() => {
    if (initialSubTab) { setSubTab(initialSubTab); onConsumeInitial?.(); }
    if (initialChannelFilter) { setChFilter(initialChannelFilter); onConsumeInitial?.(); }
  }, [initialSubTab, initialChannelFilter, onConsumeInitial]);

  // Apply filters
  const allPending = deals.filter(d => d.status === 'pending');
  const products   = allPending.filter(d => (d.dealType || 'product') === 'product');
  const tricks     = allPending.filter(d => (d.dealType || 'product') === 'trick');

  const applyFilters = (arr) => {
    let filtered = arr;
    if (chFilter) filtered = filtered.filter(d => (d.channel || d.source_channel) === chFilter);
    if (srcFilter) filtered = filtered.filter(d => (d.source || 'telegram') === srcFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(d => 
        (d.prod_name || '').toLowerCase().includes(q) || 
        (d.aff_text || '').toLowerCase().includes(q) || 
        (d.message || '').toLowerCase().includes(q)
      );
    }
    return filtered;
  };

  const visibleDeals = subTab === 'Products' ? applyFilters(products)
                     : subTab === 'Tricks & Loot' ? applyFilters(tricks)
                     : deals.filter(d => d.status === 'posted');

  const activeFiltersCount = (chFilter ? 1 : 0) + (srcFilter ? 1 : 0) + (searchQuery ? 1 : 0);

  // Keyboard shortcuts (V2)
  useEffect(() => {
    const handler = async (e) => {
      if (editingDeal || document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const currentDeals = subTab === 'Products' ? applyFilters(products)
                         : subTab === 'Tricks & Loot' ? applyFilters(tricks)
                         : [];
      const deal = currentDeals[focusIdx];

      if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) {
        return;
      }

      if (e.code === 'ArrowDown') {
        e.preventDefault();
        setFocusIdx(i => Math.min(currentDeals.length - 1, i + 1));
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setFocusIdx(i => Math.max(0, i - 1));
      } else if (deal) {
        if (e.key === 'a' || e.key === 'A') {
          e.preventDefault();
          await approveDeal(deal.fp_hash);
          setFocusIdx(i => Math.min(i, currentDeals.length - 2));
        } else if (e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          await rejectDeal(deal.fp_hash);
          setFocusIdx(i => Math.min(i, currentDeals.length - 2));
        } else if (e.key === 's' || e.key === 'S') {
          e.preventDefault();
          await rejectDeal(deal.fp_hash); // Treat Spam as Reject for now
          addToast("Marked as Spam", "error");
          setFocusIdx(i => Math.min(i, currentDeals.length - 2));
        } else if (e.code === 'Enter') {
          e.preventDefault();
          if (deal.affiliate_link) window.open(deal.affiliate_link, '_blank');
        } else if (e.key === 'e' || e.key === 'E') {
          e.preventDefault(); 
          setEditingDeal(deal);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [focusIdx, subTab, products, tricks, editingDeal, chFilter, srcFilter, searchQuery]);

  const tabs = [
    { id: 'Products',      label: 'Products',      count: applyFilters(products).length },
    { id: 'Tricks & Loot', label: 'Tricks & Loot', count: applyFilters(tricks).length },
    { id: 'Posted',        label: '✓ Posted',       count: deals.filter(d => d.status === 'posted').length },
  ];

  const handleApprove = async (hash) => {
    await approveDeal(hash);
    setFocusIdx(i => Math.min(i, visibleDeals.length - 2));
  };
  const handleReject = async (hash) => {
    await rejectDeal(hash);
    setFocusIdx(i => Math.min(i, visibleDeals.length - 2));
  };
  const handleSpam = async (hash) => {
    await rejectDeal(hash);
    addToast("Marked as Spam", "error");
    setFocusIdx(i => Math.min(i, visibleDeals.length - 2));
  };

  const selectedDeal = visibleDeals[focusIdx];

  return (
    <div className={`center-panel panel center-panel-v2`}>
      {subTab === 'Posted' ? (
        <PostedList deals={deals} onFilterChannel={(ch) => setChFilter(ch)} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          
          {visibleDeals.length === 0 ? (
            <div className="empty-state" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div className="empty-icon" style={{ marginBottom: '16px' }}>
                {subTab === 'Tricks & Loot' ? <Sparkles size={40} strokeWidth={1} /> : <ShoppingBag size={40} strokeWidth={1} />}
              </div>
              <div className="empty-title" style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                {chFilter || srcFilter ? 'No deals match this filter' : `No ${subTab.toLowerCase()} pending`}
              </div>
              <div className="empty-sub" style={{ color: 'var(--text-sec)', marginBottom: '24px' }}>
                {chFilter || srcFilter ? (
                  <button className="link-btn" style={{ color: 'var(--accent-blue)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => { setChFilter(null); setSrcFilter(null); }}>
                    Clear filters
                  </button>
                ) : 'New deals will appear here in real time.'}
              </div>
            </div>
          ) : (
            <div className="review-v2-container">
              {/* Left Pane */}
              <ReviewQueueList 
                deals={visibleDeals} 
                selectedIndex={focusIdx} 
                onSelect={setFocusIdx}
                onCompose={() => setShowCompose(true)}
              />

              {/* Center Pane */}
              <DealDetailsPane 
                deal={selectedDeal} 
                onApprove={handleApprove} 
                onReject={handleReject} 
                onSpam={handleSpam}
                onEdit={setEditingDeal}
              />

              {/* Right Pane */}
              <AiInsightsPane 
                deal={selectedDeal} 
              />
            </div>
          )}

          {visibleDeals.length > 0 && (
            <QuickReviewFooter 
              currentIndex={focusIdx} 
              totalDeals={visibleDeals.length} 
            />
          )}
        </div>
      )}

      {/* Edit drawer */}
      {editingDeal && (
        <EditDrawer
          deal={editingDeal}
          onClose={() => setEditingDeal(null)}
          onApprove={async (changes) => {
            await editDeal(editingDeal.fp_hash, changes);
            await approveDeal(editingDeal.fp_hash);
            setEditingDeal(null);
          }}
        />
      )}

      {/* Compose drawer */}
      {showCompose && (
        <ComposeDrawer onClose={() => setShowCompose(false)} />
      )}
    </div>
  );
}
