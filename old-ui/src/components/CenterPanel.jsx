import { useState, useEffect, useRef, useMemo } from 'react';
import useStore from '../store';
import { cleanTitle, resolveChannelName, categoryEmoji, fmtPrice, isDesidimeDeal, normalizeImageUrl } from '../utils/helpers';
import EditDrawer from './EditDrawer';
import ComposeDrawer from './ComposeDrawer';
import { ShoppingBag, Sparkles, ExternalLink, Check, Tag, CheckSquare, ArrowLeft, LayoutList, Layers } from 'lucide-react';
import ReviewQueueList from './ReviewPanes/ReviewQueueList';
import DealDetailsPane from './ReviewPanes/DealDetailsPane';
import AiInsightsPane from './ReviewPanes/AiInsightsPane';
import QuickReviewFooter from './ReviewPanes/QuickReviewFooter';
import SwipeReviewView from './ReviewPanes/SwipeReviewView';
import '../ReviewPanel.css';

function DealImage({ deal, size = 52 }) {
  const [err, setErr] = useState(false);
  const emoji = categoryEmoji(deal.category || deal.dealType);
  const imgUrl = normalizeImageUrl(deal);

  useEffect(() => { setErr(false); }, [imgUrl]);

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
        {posted.map((deal, idx) => {
          const chName = deal.channelName || resolveChannelName(deal.channel);
          const title = cleanTitle(deal);
          return (
            <div key={`${deal.fp_hash}-${idx}`} className="deal-card posted-card">
              <div className="card-top">
                <DealImage deal={deal} size={48} />
                <div className="card-info">
                  <div className="card-title-row">
                    <span className="card-title">{title}</span>
                    <span className="card-time">{deal.ts ? new Date(deal.ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                  </div>
                  <div className="card-price-row">
                    {deal.price && <span className="price">{fmtPrice(deal.price)}</span>}
                    {deal.original_price && <span className="mrp">{fmtPrice(deal.original_price)}</span>}
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

const REVIEW_TABS = [
  { id: 'Products', label: 'Products', icon: ShoppingBag },
  { id: 'Tricks & Loot', label: 'Tricks & Loot', icon: Sparkles },
  { id: 'Posted', label: 'Posted', icon: CheckSquare },
];

export default function CenterPanel({ initialSubTab, initialChannelFilter, onConsumeInitial }) {
  const { deals, approveDeal, rejectDeal, editDeal, addToast, setFilter } = useStore();

  const [subTab, setSubTab] = useState('Products');
  const [viewMode, setViewMode] = useState(window.innerWidth < 768 ? 'card' : 'list');
  const [selectedDealId, setSelectedDealId] = useState(null);
  const [editingDeal, setEditingDeal] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  useEffect(() => {
    let consumed = false;
    if (initialSubTab) {
      setSubTab(initialSubTab);
      consumed = true;
    }
    if (initialChannelFilter) {
      setFilter(initialChannelFilter);
      consumed = true;
    }
    if (consumed) onConsumeInitial?.();
  }, [initialSubTab, initialChannelFilter, onConsumeInitial, setFilter]);

  // Telegram-only deals — DesiDime has its own tab
  const telegramDeals = useMemo(
    () => deals.filter(d => !isDesidimeDeal(d)),
    [deals]
  );

  const allPending = useMemo(
    () => telegramDeals.filter(d => d.status === 'pending'),
    [telegramDeals]
  );

  const products = useMemo(
    () => allPending.filter(d => (d.dealType || 'product') === 'product'),
    [allPending]
  );

  const tricks = useMemo(
    () => allPending.filter(d => (d.dealType || 'product') === 'trick'),
    [allPending]
  );

  const visibleDeals = subTab === 'Products' ? products
    : subTab === 'Tricks & Loot' ? tricks
    : telegramDeals.filter(d => d.status === 'posted');

  const selectedDeal = useMemo(
    () => visibleDeals.find(d => d.fp_hash === selectedDealId) || null,
    [visibleDeals, selectedDealId]
  );

  const selectedIndex = useMemo(
    () => filteredDeals.findIndex(d => d.fp_hash === selectedDealId),
    [selectedDealId, filteredDeals]
  );

  const tabs = REVIEW_TABS.map(t => ({
    ...t,
    count: t.id === 'Products' ? products.length
      : t.id === 'Tricks & Loot' ? tricks.length
      : telegramDeals.filter(d => d.status === 'posted').length,
  }));



  const handleApprove = async (hash) => {
    await approveDeal(hash);
  };
  const handleReject = async (hash) => {
    await rejectDeal(hash);
  };
  const handleSpam = async (hash) => {
    await rejectDeal(hash);
    addToast('Marked as Spam', 'error');
  };

  return (
    <div className="center-panel panel center-panel-v2">
      <div className="review-page-header">
        <div className="review-subtabs">
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              type="button"
              className={`review-subtab${subTab === id ? ' active' : ''}`}
              onClick={() => { setSubTab(id); setSelectedDealId(null); }}
            >
              <Icon size={14} />
              <span>{label}</span>
              <span className="review-subtab-count">{count}</span>
            </button>
          ))}
        </div>
        <div className="view-mode-toggle" style={{ display: 'flex', gap: 4, background: 'var(--bg-card)', padding: 4, borderRadius: 8, border: '1px solid var(--border-subtle)', marginLeft: 'auto' }}>
          <button className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} style={{ padding: '6px 12px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, background: viewMode === 'list' ? 'var(--accent-blue-15)' : 'transparent', color: viewMode === 'list' ? 'var(--accent-blue)' : 'var(--text-muted)', border: 'none', cursor: 'pointer' }}>
            <LayoutList size={14} /> List
          </button>
          <button className={`view-toggle-btn ${viewMode === 'card' ? 'active' : ''}`} onClick={() => setViewMode('card')} style={{ padding: '6px 12px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, background: viewMode === 'card' ? 'var(--accent-blue-15)' : 'transparent', color: viewMode === 'card' ? 'var(--accent-blue)' : 'var(--text-muted)', border: 'none', cursor: 'pointer' }}>
            <Layers size={14} /> Swipe
          </button>
        </div>
      </div>

      {subTab === 'Posted' ? (
        <PostedList deals={telegramDeals} onFilterChannel={(ch) => setFilter(ch)} />
      ) : visibleDeals.length === 0 ? (
        <div className="review-empty-state">
          <div className="empty-icon">
            {subTab === 'Tricks & Loot' ? <Sparkles size={40} strokeWidth={1} /> : <ShoppingBag size={40} strokeWidth={1} />}
          </div>
          <div className="empty-title">No {subTab.toLowerCase()} pending</div>
          <div className="empty-sub">New Telegram deals will appear here in real time.</div>
        </div>
      ) : viewMode === 'card' ? (
        <SwipeReviewView
          deals={visibleDeals}
          onApprove={handleApprove}
          onReject={handleReject}
          onSpam={handleSpam}
          onEdit={setEditingDeal}
        />
      ) : (
        <div className="review-v2-body">
          <div className="review-v2-container">
            <ReviewQueueList
              deals={visibleDeals}
              selectedDealId={selectedDealId}
              onSelectDeal={(deal) => { setSelectedDealId(deal.fp_hash); setMobileDetailOpen(true); }}
              onCompose={() => setShowCompose(true)}
              title="Review Queue"
              onFilteredDealsChange={setFilteredDeals}
            />
            <DealDetailsPane
              deal={selectedDeal}
              onApprove={handleApprove}
              onReject={handleReject}
              onSpam={handleSpam}
              onEdit={setEditingDeal}
            />
            <AiInsightsPane deal={selectedDeal} />
          </div>

          {/* Mobile detail slide-up overlay */}
          {mobileDetailOpen && selectedDeal && (
            <div className="mobile-detail-overlay">
              <div className="mobile-detail-header">
                <button type="button" className="mobile-back-btn" onClick={() => setMobileDetailOpen(false)}>
                  <ArrowLeft size={18} /> Back
                </button>
                <span className="mobile-detail-title">Deal Details</span>
              </div>
              <div className="mobile-detail-body">
                <DealDetailsPane
                  deal={selectedDeal}
                  onApprove={(hash) => { handleApprove(hash); setMobileDetailOpen(false); }}
                  onReject={(hash) => { handleReject(hash); setMobileDetailOpen(false); }}
                  onSpam={(hash) => { handleSpam(hash); setMobileDetailOpen(false); }}
                  onEdit={(d) => { setEditingDeal(d); setMobileDetailOpen(false); }}
                />
              </div>
            </div>
          )}

          <QuickReviewFooter
            currentIndex={Math.max(0, selectedIndex)}
            totalDeals={filteredDeals.length || visibleDeals.length}
          />
        </div>
      )}

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

      {showCompose && (
        <ComposeDrawer onClose={() => setShowCompose(false)} />
      )}
    </div>
  );
}
