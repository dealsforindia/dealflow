import { useEffect, useState, useMemo, useRef } from 'react';
import { Globe } from 'lucide-react';
import useDealStore from '../store/useDealStore';
import ReviewQueueList from './ReviewPanes/ReviewQueueList';
import DealDetailsPane from './ReviewPanes/DealDetailsPane';
import AiInsightsPane from './ReviewPanes/AiInsightsPane';
import QuickReviewFooter from './ReviewPanes/QuickReviewFooter';
import '../ReviewPanel.css';

const DESIDIME_TABS = [
  { id: 'pending', label: 'Pending' },
  { id: 'posted', label: 'Posted' },
];

function DesidimePanel() {
  const { desidimeDeals, fetchDesidimeDeals, approveDeal, rejectDeal, markSpam, addToast } = useDealStore();
  const [subTab, setSubTab] = useState('pending');
  const [selectedDealId, setSelectedDealId] = useState(null);
  const [loading, setLoading] = useState(false);
  const filteredDealsRef = useRef([]);

  const loadDeals = () => {
    setLoading(true);
    return fetchDesidimeDeals().finally(() => setLoading(false));
  };

  useEffect(() => {
    // Only fetch on first mount if no cached data
    if (desidimeDeals.length === 0) loadDeals();
  }, []);

  const pendingDeals = useMemo(
    () => desidimeDeals.filter(d => d.status === 'pending' || d.status === 'pending_approval'),
    [desidimeDeals]
  );

  const postedDeals = useMemo(
    () => desidimeDeals.filter(d => d.status === 'posted' || d.status === 'auto_posted'),
    [desidimeDeals]
  );

  const visibleDeals = subTab === 'pending' ? pendingDeals : postedDeals;

  const selectedDeal = useMemo(
    () => visibleDeals.find(d => d.fp_hash === selectedDealId) || null,
    [visibleDeals, selectedDealId]
  );

  const selectedIndex = filteredDealsRef.current.findIndex(d => d.fp_hash === selectedDealId);

  useEffect(() => {
    const handler = async (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (subTab !== 'pending') return;

      const list = filteredDealsRef.current;
      const idx = list.findIndex(d => d.fp_hash === selectedDealId);
      const deal = list[idx];
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
        await loadDeals();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        await rejectDeal(deal.fp_hash);
        await loadDeals();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        await markSpam(deal.fp_hash);
        addToast('Marked as Spam', 'error');
        await loadDeals();
      } else if (e.code === 'Enter') {
        e.preventDefault();
        const link = deal.affiliate_link || deal.aff_link;
        if (link) window.open(link, '_blank');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedDealId, subTab, approveDeal, rejectDeal, markSpam, addToast]);

  const handleAction = async (action, hash) => {
    await action(hash);
    setSelectedDealId(null);
    await loadDeals();
  };

  return (
    <div className="center-panel-v2 desidime-panel">
      <div className="review-page-header desidime-header">
        <div className="desidime-header-top">
          <div className="desidime-brand">
            <Globe size={18} />
            <div>
              <h2>DesiDime Deals</h2>
              <p>Scraped from desidime.com · review before posting</p>
            </div>
          </div>
          <div className="desidime-stats">
            <span className="desidime-stat pending">{pendingDeals.length} pending</span>
            <span className="desidime-stat posted">{postedDeals.length} posted</span>
          </div>
        </div>
        <div className="review-subtabs desidime-tabs">
          {DESIDIME_TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className={`review-subtab desidime-tab${subTab === id ? ' active' : ''}`}
              onClick={() => { setSubTab(id); setSelectedDealId(null); }}
            >
              <span>{label}</span>
              <span className="review-subtab-count">
                {id === 'pending' ? pendingDeals.length : postedDeals.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {visibleDeals.length === 0 && !loading ? (
        <div className="review-empty-state desidime-empty">
          <Globe size={44} strokeWidth={1.2} />
          <div className="empty-title">
            {subTab === 'pending' ? 'No pending DesiDime deals' : 'No posted DesiDime deals yet'}
          </div>
          <div className="empty-sub">
            {subTab === 'pending'
              ? 'Deals appear when desidime_bot.py scrapes desidime.com/new'
              : 'Approved deals will show up here after posting'}
          </div>
          <button type="button" className="desidime-refresh-btn" onClick={loadDeals}>
            Refresh
          </button>
        </div>
      ) : (
        <div className="review-v2-body">
          <div className="review-v2-container">
            <ReviewQueueList
              deals={visibleDeals}
              selectedDealId={selectedDealId}
              onSelectDeal={(deal) => setSelectedDealId(deal.fp_hash)}
              onRefresh={loadDeals}
              loading={loading}
              title="DesiDime Queue"
              hideChannelFilter
              emptyMessage={subTab === 'pending' ? 'No pending DesiDime deals' : 'No posted deals'}
              onFilteredDealsChange={(list) => { filteredDealsRef.current = list; }}
            />
            <DealDetailsPane
              deal={selectedDeal}
              onApprove={(hash) => handleAction(approveDeal, hash)}
              onReject={(hash) => handleAction(rejectDeal, hash)}
              onSpam={(hash) => handleAction(markSpam, hash)}
            />
            <AiInsightsPane deal={selectedDeal} />
          </div>
          {subTab === 'pending' && visibleDeals.length > 0 && (
            <QuickReviewFooter
              currentIndex={Math.max(0, selectedIndex)}
              totalDeals={filteredDealsRef.current.length || visibleDeals.length}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default DesidimePanel;
