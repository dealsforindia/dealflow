import React, { useState, useEffect, useRef, useCallback } from 'react';
import useStore, { CHANNEL_NAME_MAP } from '../store';
import { cleanTitle, fmt, resolveChannelName, categoryEmoji, fmtPrice, calcDiscount } from '../utils/helpers';
import { WS_URL, API_URL } from '../config';
import EditDrawer from './EditDrawer';
import {
  Inbox, ShoppingBag, Sparkles, ExternalLink, Check, PenLine, X,
  ChevronDown, ChevronUp, Filter, XCircle, Tag, Zap, Search, CheckSquare
} from 'lucide-react';

// ── Category emoji for image placeholder
function DealImage({ deal, size = 52 }) {
  const [err, setErr] = useState(false);
  const emoji = categoryEmoji(deal.category || deal.dealType);
  let imgUrl = deal.img_url || deal.image_url || deal.image || deal.photo || deal.photo_url || deal.img || deal.thumbnail;

  if (imgUrl && imgUrl.startsWith('http://74.225.250.0/images/')) {
    imgUrl = imgUrl.replace('http://74.225.250.0/images/', '/images/');
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

// ── Raw post expander
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
        <pre className="raw-text">{text.trim()}</pre>
      )}
    </div>
  );
}

// ── Single deal card
function DealCard({ deal, focused, onFocus, onApprove, onReject, onEdit, onFilterChannel, selected, onToggleSelect }) {
  const isProduct  = (deal.dealType || 'product') === 'product';
  const title      = cleanTitle(deal);
  const chName     = CHANNEL_NAME_MAP[deal.channel] || CHANNEL_NAME_MAP[deal.source_channel] || resolveChannelName(deal.channel || deal.source_channel);
  const salePrice  = deal.price   ? Number(deal.price)          : null;
  const mrpPrice   = deal.original_price ? Number(deal.original_price) : null;
  const discount   = deal.discount_pct || calcDiscount(salePrice, mrpPrice);
  const isPosted   = deal.status === 'posted';
  const isRejected = deal.status === 'rejected';

  return (
    <div
      className={`deal-card${focused ? ' focused' : ''}${isPosted ? ' posted' : ''}${isRejected ? ' rejected' : ''}`}
      onClick={onFocus}
    >
      {/* Left accent bar */}
      <div className={`deal-accent ${isProduct ? 'product' : 'trick'}`} />

      {/* Bulk Select Checkbox */}
      {!isPosted && !isRejected && (
        <div className="deal-select-box" onClick={e => { e.stopPropagation(); onToggleSelect && onToggleSelect(deal.fp_hash); }}>
          {selected ? <CheckSquare size={16} className="selected" /> : <div className="checkbox-empty" />}
        </div>
      )}

      {/* Image */}
      <div className="deal-thumb" onClick={e => e.stopPropagation()}>
        <DealImage deal={deal} size={52} />
      </div>

      {/* Content */}
      <div className="deal-body">
        {/* Meta row */}
        <div className="deal-meta-row">
          <span
            className="deal-ch-badge"
            onClick={(e) => { e.stopPropagation(); onFilterChannel && onFilterChannel(deal.channel || deal.source_channel); }}
            title={`Filter by ${chName}`}
          >
            {chName}
          </span>
          <span className="deal-time">{fmt(deal.ts)}</span>
          {deal.category && (
            <span
              className="deal-cat-tag"
              title={deal.category}
            >
              {categoryEmoji(deal.category)} {deal.category.replace(/[^\w\s]/g, '').trim()}
            </span>
          )}
          <span className={`deal-src-badge ${deal.source === 'desidime' ? 'dd' : 'tg'}`}>
            {deal.source === 'desidime' ? 'DD' : 'TG'}
          </span>
          {deal.flash && <span className="deal-flash-badge"><Zap size={9} /> FLASH</span>}
        </div>

        {/* Title */}
        <div className="deal-title">{title}</div>

        {/* Price row */}
        <div className="deal-price-row">
          {salePrice && salePrice > 0 ? (
            <>
              <span
                className="deal-price"
                style={{ cursor: deal.affiliate_link ? 'pointer' : 'default' }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (deal.affiliate_link) window.open(deal.affiliate_link, '_blank');
                }}
                title={deal.affiliate_link ? 'Open affiliate link' : ''}
              >
                ₹{salePrice.toLocaleString('en-IN')}
                {deal.affiliate_link && <ExternalLink size={10} style={{ marginLeft: 3, opacity: 0.6 }} />}
              </span>
              {mrpPrice && mrpPrice > salePrice && (
                <span className="deal-mrp">₹{mrpPrice.toLocaleString('en-IN')}</span>
              )}
              {discount && <span className="deal-disc">-{discount}%</span>}
            </>
          ) : (
            <span className="deal-no-price">{isProduct ? 'Price not extracted' : 'Trick / Loot'}</span>
          )}
          {deal.coupon && (
            <span className="deal-coupon" title="Coupon code">
              <Tag size={9} /> {deal.coupon}
            </span>
          )}
          {deal.platforms?.length > 0 && (
            <span className="deal-platform">{deal.platforms[0]}</span>
          )}
        </div>

        {/* Raw expander */}
        {!isRejected && <RawPostExpander deal={deal} />}
      </div>

      {/* Actions */}
      {!isPosted && !isRejected ? (
        <div className="deal-actions" onClick={e => e.stopPropagation()}>
          <button className="btn-approve" onClick={() => onApprove(deal.fp_hash)} title="Approve (Space)">
            <Check size={13} strokeWidth={2.5} /> APPROVE
          </button>
          <button className="btn-edit" onClick={() => onEdit(deal)} title="Edit (E)">
            <PenLine size={12} strokeWidth={2} /> EDIT
          </button>
          <button className="btn-reject" onClick={() => onReject(deal.fp_hash)} title="Reject (Backspace)">
            <X size={12} strokeWidth={2.5} /> REJECT
          </button>
        </div>
      ) : isPosted ? (
        <div className="deal-actions">
          <div className="deal-posted-badge">✓ Posted</div>
        </div>
      ) : (
        <div className="deal-actions">
          <div className="deal-rejected-badge">✕ Rejected</div>
        </div>
      )}
    </div>
  );
}

// ── Posted feed
function PostedList({ deals, onFilterChannel }) {
  const posted = deals.filter(d => d.status === 'posted').sort((a, b) => (b.ts || 0) - (a.ts || 0));
  if (!posted.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon"><Inbox size={40} strokeWidth={1} /></div>
        <div className="empty-title">Nothing posted yet</div>
        <div className="empty-sub">Approved deals will appear here</div>
      </div>
    );
  }
  return (
    <div className="board">
      {posted.map(deal => {
        const chName   = CHANNEL_NAME_MAP[deal.channel] || CHANNEL_NAME_MAP[deal.source_channel] || resolveChannelName(deal.channel || deal.source_channel);
        const discount = deal.discount_pct || calcDiscount(deal.price, deal.original_price);
        const price    = deal.price ? Number(deal.price) : null;
        return (
          <div key={deal.fp_hash} className="deal-card posted" style={{ cursor: 'default' }}>
            <div className={`deal-accent ${(deal.dealType || 'product') === 'product' ? 'product' : 'trick'}`} />
            <div className="deal-thumb"><DealImage deal={deal} size={52} /></div>
            <div className="deal-body">
              <div className="deal-meta-row">
                <span className="deal-ch-badge" style={{ cursor: 'pointer' }} onClick={() => onFilterChannel(deal.channel)}>
                  {chName}
                </span>
                <span className="deal-time">{fmt(deal.ts)}</span>
              </div>
              <div className="deal-title">{cleanTitle(deal)}</div>
              <div className="deal-price-row">
                {price && price > 0 && <span className="deal-price">₹{price.toLocaleString('en-IN')}</span>}
                {discount && <span className="deal-disc">-{discount}%</span>}
                {deal.affiliate_link && (
                  <a href={deal.affiliate_link} target="_blank" rel="noreferrer" className="deal-aff-link" onClick={e => e.stopPropagation()}>
                    <ExternalLink size={11} /> Link
                  </a>
                )}
              </div>
            </div>
            <div className="deal-actions">
              <div className="deal-posted-badge">✓ Posted</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main CenterPanel
export default function CenterPanel({ initialSubTab, initialChannelFilter, onConsumeInitial }) {
  const { deals, dealsLoading, approveDeal, rejectDeal, editDeal, addToast, activeFilter, setFilter, clearFilter } = useStore();

  const [subTab,     setSubTab]     = useState('Products');
  const [focusIdx,   setFocusIdx]   = useState(0);
  const [editingDeal,setEditingDeal]= useState(null);
  const [chFilter,   setChFilter]   = useState(null);
  const [srcFilter,  setSrcFilter]  = useState(null); // 'telegram' | 'desidime' | null
  const [showFilters,setShowFilters]= useState(false);
  const [searchQuery,setSearchQuery]= useState('');
  const [selectedDeals,setSelectedDeals] = useState(new Set());
  const boardRef = useRef(null);

  const handleToggleSelect = (hash) => {
    setSelectedDeals(prev => {
      const next = new Set(prev);
      if (next.has(hash)) next.delete(hash);
      else next.add(hash);
      return next;
    });
  };

  const handleBulkApprove = async () => {
    for (const hash of selectedDeals) {
      await approveDeal(hash);
    }
    addToast(`Bulk approved ${selectedDeals.size} deals`);
    setSelectedDeals(new Set());
  };

  const handleBulkReject = async () => {
    for (const hash of selectedDeals) {
      await rejectDeal(hash);
    }
    addToast(`Bulk rejected ${selectedDeals.size} deals`, "error");
    setSelectedDeals(new Set());
  };

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

  // Keyboard shortcuts
  useEffect(() => {
    const handler = async (e) => {
      if (editingDeal) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const currentDeals = subTab === 'Products' ? applyFilters(products)
                         : subTab === 'Tricks & Loot' ? applyFilters(tricks)
                         : [];
      const deal = currentDeals[focusIdx];

      if (e.code === 'Space' && deal) {
        e.preventDefault();
        await approveDeal(deal.fp_hash);
        setFocusIdx(i => Math.min(i, currentDeals.length - 2));
      } else if (e.code === 'Backspace' && deal) {
        e.preventDefault();
        await rejectDeal(deal.fp_hash);
        setFocusIdx(i => Math.min(i, currentDeals.length - 2));
      } else if (e.key === 'e' || e.key === 'E') {
        if (deal) { e.preventDefault(); setEditingDeal(deal); }
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setFocusIdx(i => Math.min(currentDeals.length - 1, i + 1));
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setFocusIdx(i => Math.max(0, i - 1));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [focusIdx, subTab, products, tricks, editingDeal, chFilter, srcFilter]);

  // Scroll focused card into view
  useEffect(() => {
    const el = boardRef.current?.querySelector('.deal-card.focused');
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [focusIdx]);

  const handleFilterChannel = (chId) => {
    setChFilter(chId === chFilter ? null : chId);
    setSubTab('Products');
    setFocusIdx(0);
  };

  const tabs = [
    { id: 'Products',      label: 'Products',      count: applyFilters(products).length },
    { id: 'Tricks & Loot', label: 'Tricks & Loot', count: applyFilters(tricks).length },
    { id: 'Posted',        label: '✓ Posted',       count: deals.filter(d => d.status === 'posted').length },
  ];

  return (
    <div className="center-panel">
      {/* Header */}
      <div className="center-header">
        <div>
          <div className="center-title">Review Board</div>
          <div className="center-subtitle">
            {dealsLoading ? (
              <>{allPending.length} loaded, fetching more…</>
            ) : (
              <>{allPending.length} pending</>
            )}
            <span className={`live-dot ${true ? 'live' : ''}`} />
            {true ? 'Live' : 'Offline'}
          </div>
        </div>

        {/* Filter controls */}
        <div className="header-actions">
          <div className="filter-group">
            <div className="header-search">
              <Search size={14} color="var(--text-ter)" />
              <input 
                type="text" 
                placeholder="Search deals..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            {/* Channel filter dropdown */}
            <div className="filter-dropdown">
              <button
                className={`filter-btn ${chFilter ? 'active' : ''}`}
                onClick={() => setShowFilters(f => !f)}
              >
                <Filter size={12} strokeWidth={2} />
                Channel {chFilter && `· ${CHANNEL_NAME_MAP[chFilter] || resolveChannelName(chFilter)}`}
                <ChevronDown size={11} />
              </button>
              {showFilters && (
                <div className="filter-dropdown-menu">
                  <div
                    className={`filter-option ${!chFilter ? 'selected' : ''}`}
                    onClick={() => { setChFilter(null); setShowFilters(false); setFocusIdx(0); }}
                  >
                    All Channels
                  </div>
                  {Object.entries(CHANNEL_NAME_MAP).map(([id, name]) => (
                    <div
                      key={id}
                      className={`filter-option ${chFilter === id ? 'selected' : ''}`}
                      onClick={() => { setChFilter(id); setShowFilters(false); setFocusIdx(0); }}
                    >
                      {name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Source filter */}
            <div className="filter-dropdown">
              <button
                className={`filter-btn ${srcFilter ? 'active' : ''}`}
                onClick={() => setSrcFilter(s => s === 'telegram' ? 'desidime' : s === 'desidime' ? null : 'telegram')}
              >
                Source {srcFilter ? `· ${srcFilter === 'telegram' ? 'TG' : 'DD'}` : ''}
              </button>
            </div>

            {/* Clear filters */}
            {activeFiltersCount > 0 && (
              <button
                className="filter-clear"
                onClick={() => { setChFilter(null); setSrcFilter(null); setFocusIdx(0); }}
                title="Clear all filters"
              >
                <XCircle size={13} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="subtabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`subtab${subTab === t.id ? ' active' : ''}`}
            onClick={() => { setSubTab(t.id); setFocusIdx(0); }}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`tab-badge ${t.id === 'Posted' ? 'green' : t.id === 'Tricks & Loot' ? 'purple' : 'amber'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Active filter pill */}
      {(chFilter || srcFilter) && (
        <div className="active-filter-bar">
          {chFilter && (
            <span className="filter-pill">
              {CHANNEL_NAME_MAP[chFilter] || resolveChannelName(chFilter)}
              <button onClick={() => { setChFilter(null); setFocusIdx(0); }}><X size={10} /></button>
            </span>
          )}
          {srcFilter && (
            <span className="filter-pill">
              {srcFilter === 'telegram' ? 'Telegram only' : 'DesiDime only'}
              <button onClick={() => { setSrcFilter(null); setFocusIdx(0); }}><X size={10} /></button>
            </span>
          )}
        </div>
      )}

      {/* Board */}
      {subTab === 'Posted' ? (
        <PostedList deals={deals} onFilterChannel={handleFilterChannel} />
      ) : (
        <>
          <div className="board" ref={boardRef}>
            {visibleDeals.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  {subTab === 'Tricks & Loot' ? <Sparkles size={40} strokeWidth={1} /> : <ShoppingBag size={40} strokeWidth={1} />}
                </div>
                <div className="empty-title">
                  {chFilter || srcFilter ? 'No deals match this filter' : `No ${subTab.toLowerCase()} pending`}
                </div>
                <div className="empty-sub">
                  {chFilter || srcFilter ? (
                    <button className="link-btn" onClick={() => { setChFilter(null); setSrcFilter(null); }}>
                      Clear filters
                    </button>
                  ) : 'New deals will appear here in real time'}
                </div>
              </div>
            ) : (
              visibleDeals.map((deal, i) => (
                <DealCard
                  key={deal.fp_hash}
                  deal={deal}
                  focused={i === focusIdx}
                  onFocus={() => setFocusIdx(i)}
                  onApprove={approveDeal}
                  onReject={rejectDeal}
                  onEdit={setEditingDeal}
                  onFilterChannel={handleFilterChannel}
                  selected={selectedDeals.has(deal.fp_hash)}
                  onToggleSelect={handleToggleSelect}
                />
              ))
            )}
          </div>

          {/* Bulk Action Bar */}
          {selectedDeals.size > 0 && (
            <div className="bulk-action-bar">
              <span className="bulk-count">{selectedDeals.size} Selected</span>
              <div className="bulk-actions">
                <button className="pill-btn approve" onClick={handleBulkApprove}>
                  <Check size={13} strokeWidth={2.5} /> Approve All
                </button>
                <button className="pill-btn reject" onClick={handleBulkReject}>
                  <X size={12} strokeWidth={2.5} /> Reject All
                </button>
              </div>
            </div>
          )}

          {/* Keyboard shortcuts bar */}
          {visibleDeals.length > 0 && (
            <div className="kb-bar">
              <span className="kb-item"><kbd>↑↓</kbd> Navigate</span>
              <span className="kb-item"><kbd>Space</kbd> Approve</span>
              <span className="kb-item"><kbd>⌫</kbd> Reject</span>
              <span className="kb-item"><kbd>E</kbd> Edit</span>
              <div style={{ flex: 1 }} />
              <span className="kb-pos">{focusIdx + 1} / {visibleDeals.length}</span>
            </div>
          )}
        </>
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
    </div>
  );
}
