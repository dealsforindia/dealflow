import { useState, useEffect, useRef, useMemo } from 'react';
import useStore from '../store';
import { cleanTitle, resolveChannelName, categoryEmoji, fmtPrice, isDesidimeDeal } from '../utils/helpers';
import { API_URL } from '../config';
import EditDrawer from './EditDrawer';
import ComposeDrawer from './ComposeDrawer';
import { ShoppingBag, Sparkles, ExternalLink, Check, Tag, CheckSquare } from 'lucide-react';
import ReviewQueueList from './ReviewPanes/ReviewQueueList';
import DealDetailsPane from './ReviewPanes/DealDetailsPane';
import AiInsightsPane from './ReviewPanes/AiInsightsPane';
import QuickReviewFooter from './ReviewPanes/QuickReviewFooter';
import '../ReviewPanel.css';

function DealImage({ deal, size = 52 }) {
  const [err, setErr] = useState(false);
  const emoji = categoryEmoji(deal.category || deal.dealType);
  let imgUrl = deal.img_url || deal.img_path || deal.image_url || deal.image || deal.photo || deal.photo_url || deal.img || deal.thumbnail;
  if (imgUrl && typeof imgUrl === 'string' && imgUrl.includes('/dealbot/images/')) {
    imgUrl = '/images/' + imgUrl.split('/dealbot/images/')[1];
  }
  if (imgUrl && imgUrl.startsWith('http://74.225.250.0/images/')) {
    imgUrl = imgUrl.replace('http://74.225.250.0/images/', '/images/');
  }
  if (imgUrl && imgUrl.startsWith('images/')) {
    imgUrl = '/images/' + imgUrl.slice(7);
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
  const [selectedDealId, setSelectedDealId] = useState(null);
  const [editingDeal, setEditingDeal] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const filteredDealsRef = useRef([]);

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
      onConsumeInitial?.();
    }
    if (initialChannelFilter) {
      setFilter(initialChannelFilter);
      onConsumeInitial?.();
    }
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
    () => filteredDealsRef.current.findIndex(d => d.fp_hash === selectedDealId),
    [selectedDealId, visibleDeals]
  );

  const tabs = REVIEW_TABS.map(t => ({
    ...t,
    count: t.id === 'Products' ? products.length
      : t.id === 'Tricks & Loot' ? tricks.length
      : telegramDeals.filter(d => d.status === 'posted').length,
  }));

  useEffect(() => {
    const handler = async (e) => {
      if (editingDeal || ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (subTab === 'Posted') return;

      const list = filteredDealsRef.current;
      const idx = list.findIndex(d => d.fp_hash === selectedDealId);
      const deal = list[idx];
      if (!deal && list.length > 0) {
        setSelectedDealId(list[0].fp_hash);
        return;
      }
      if (!deal) return;

      if (e.code === 'ArrowDown') {
        e.preventDefault();
        const next = list[Math.min(idx + 1, list.length - 1)];
        if (next) setSelectedDealId(next.fp_hash);
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        const prev = list[Math.max(idx - 1, 0)];
        if (prev) setSelectedDealId(prev.fp_hash);
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        await approveDeal(deal.fp_hash);
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        await rejectDeal(deal.fp_hash);
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        await rejectDeal(deal.fp_hash);
        addToast('Marked as Spam', 'error');
      } else if (e.code === 'Enter') {
        e.preventDefault();
        if (deal.affiliate_link) window.open(deal.affiliate_link, '_blank');
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        setEditingDeal(deal);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedDealId, subTab, editingDeal, approveDeal, rejectDeal, addToast]);

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
        <p className="review-page-subtitle">Telegram channel deals · DesiDime deals are in the DesiDime tab</p>
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
      ) : (
        <div className="review-v2-body">
          <div className="review-v2-container">
            <ReviewQueueList
              deals={visibleDeals}
              selectedDealId={selectedDealId}
              onSelectDeal={(deal) => setSelectedDealId(deal.fp_hash)}
              onCompose={() => setShowCompose(true)}
              title="Review Queue"
              onFilteredDealsChange={(list) => { filteredDealsRef.current = list; }}
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
          <QuickReviewFooter
            currentIndex={Math.max(0, selectedIndex)}
            totalDeals={filteredDealsRef.current.length || visibleDeals.length}
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
