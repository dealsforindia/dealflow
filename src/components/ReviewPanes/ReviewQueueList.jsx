import { useRef, useEffect, useState, useMemo } from 'react';
import { SlidersHorizontal, Plus, Search, X, RefreshCw } from 'lucide-react';
import ReviewQueueItem from './ReviewQueueItem';
import useDealStore, { CHANNEL_NAME_MAP } from '../../store/useDealStore';
import { resolveChannelName, dealQueueKey } from '../../utils/helpers';

function ReviewQueueList({
  deals,
  selectedDealId,
  onSelectDeal,
  onCompose,
  onRefresh,
  loading = false,
  title = 'Review Queue',
  hideChannelFilter = false,
  emptyMessage = 'Queue is empty',
  onFilteredDealsChange,
}) {
  const containerRef = useRef(null);
  const { channelConfig, activeFilter, setFilter, clearFilter, dealsLoading } = useDealStore();
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState('latest');

  const channelCounts = useMemo(() => {
    const counts = {};
    deals.forEach(d => {
      const ch = d.channel || d.source_channel || d.channel_title || '';
      if (ch) counts[ch] = (counts[ch] || 0) + 1;
    });
    return counts;
  }, [deals]);

  const filterChannels = useMemo(() => {
    const allChannels = new Set();
    deals.forEach(d => {
      const ch = d.channel || d.source_channel || d.channel_title;
      if (ch) allChannels.add(ch);
    });
    channelConfig.forEach(c => allChannels.add(c.channel));
    return [...allChannels].map(ch => ({
      id: ch,
      name: resolveChannelName(ch),
      count: channelCounts[ch] || 0,
    })).sort((a, b) => b.count - a.count);
  }, [deals, channelConfig, channelCounts]);

  const filteredDeals = useMemo(() => {
    let result = deals;

    if (!hideChannelFilter && activeFilter) {
      result = result.filter(d =>
        (d.channel || d.source_channel || d.channel_title) === activeFilter
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d =>
        (d.prod_name || d.title || '').toLowerCase().includes(q) ||
        (d.aff_text || d.message || '').toLowerCase().includes(q) ||
        (d.category || '').toLowerCase().includes(q) ||
        (d.store || '').toLowerCase().includes(q)
      );
    }

    if (sortMode === 'oldest') {
      result = [...result].sort((a, b) => (a.ts || 0) - (b.ts || 0));
    } else if (sortMode === 'score') {
      result = [...result].sort((a, b) => (b.score || 0) - (a.score || 0));
    }

    return result;
  }, [deals, activeFilter, searchQuery, sortMode, hideChannelFilter]);

  useEffect(() => {
    onFilteredDealsChange?.(filteredDeals);
  }, [filteredDeals, onFilteredDealsChange]);

  // Auto-select first deal when list changes and nothing selected
  useEffect(() => {
    if (filteredDeals.length === 0) return;
    const stillVisible = filteredDeals.some(d => d.fp_hash === selectedDealId);
    if (!selectedDealId || !stillVisible) {
      onSelectDeal?.(filteredDeals[0]);
    }
  }, [filteredDeals, selectedDealId, onSelectDeal]);

  // Scroll selected item into view
  useEffect(() => {
    if (!containerRef.current || !selectedDealId) return;
    const idx = filteredDeals.findIndex(d => d.fp_hash === selectedDealId);
    if (idx >= 0 && containerRef.current.children[idx]) {
      containerRef.current.children[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedDealId, filteredDeals]);

  const activeFilterName = activeFilter ? resolveChannelName(activeFilter) : null;

  const cycleSortMode = () => {
    const modes = ['latest', 'oldest', 'score'];
    setSortMode(modes[(modes.indexOf(sortMode) + 1) % modes.length]);
  };

  const sortLabels = { latest: 'Latest', oldest: 'Oldest', score: 'Top Score' };
  const isLoading = loading || dealsLoading;

  return (
    <div className="review-queue-pane">
      <div className="queue-header">
        <div className="queue-header-left">
          <span className="queue-header-title">{title}</span>
          <span className="queue-header-count">
            {filteredDeals.length}{filteredDeals.length !== deals.length ? ` / ${deals.length}` : ''}
          </span>
        </div>
        <div className="queue-header-actions">
          <button type="button" className="queue-sort-btn" onClick={cycleSortMode}>
            {sortLabels[sortMode]}
          </button>
          {!hideChannelFilter && (
            <div className="queue-filter-wrapper">
              <button
                type="button"
                className="queue-filter-btn"
                title="Filter by channel"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                style={activeFilter ? { borderColor: 'rgba(99,102,241,0.4)', color: '#a5b4fc' } : {}}
              >
                <SlidersHorizontal size={14} />
              </button>
              {showFilterDropdown && (
                <div className="queue-filter-dropdown">
                  <button
                    className={`filter-dropdown-item ${!activeFilter ? 'active' : ''}`}
                    onClick={() => { clearFilter(); setShowFilterDropdown(false); }}
                  >
                    All Channels
                    <span className="filter-dropdown-count">{deals.length}</span>
                  </button>
                  {filterChannels.map(ch => (
                    <button
                      key={ch.id}
                      className={`filter-dropdown-item ${activeFilter === ch.id ? 'active' : ''}`}
                      onClick={() => { setFilter(ch.id); setShowFilterDropdown(false); }}
                    >
                      {ch.name}
                      <span className="filter-dropdown-count">{ch.count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {onRefresh && (
            <button type="button" className="queue-filter-btn" onClick={onRefresh} title="Refresh">
              <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
            </button>
          )}
          {onCompose && (
            <button type="button" className="queue-sort-btn queue-new-btn" onClick={onCompose} title="Compose deal">
              <Plus size={13} /> New
            </button>
          )}
        </div>
      </div>

      {!hideChannelFilter && activeFilterName && (
        <div className="queue-active-filter">
          <span>{activeFilterName}</span>
          <button onClick={clearFilter} title="Clear filter">×</button>
        </div>
      )}

      <div className="queue-search-wrap">
        <Search size={14} className="queue-search-icon" />
        <input
          className="queue-search-input"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search deals..."
        />
        {searchQuery && (
          <button type="button" className="queue-search-clear" onClick={() => setSearchQuery('')}>
            <X size={14} />
          </button>
        )}
      </div>

      <div className="queue-list" ref={containerRef}>
        {deals.length === 0 && isLoading && (
          <>
            {[...Array(6)].map((_, i) => (
              <div key={`sk-${i}`} className="queue-skeleton">
                <div className="queue-skeleton-thumb" />
                <div className="queue-skeleton-lines">
                  <div className="queue-skeleton-line wide" />
                  <div className="queue-skeleton-line narrow" />
                </div>
              </div>
            ))}
          </>
        )}
        {filteredDeals.length === 0 && !isLoading && (
          <div className="queue-empty">
            {searchQuery || activeFilter ? 'No deals match your filter' : emptyMessage}
          </div>
        )}
        {filteredDeals.map((deal, idx) => (
          <ReviewQueueItem
            key={dealQueueKey(deal, idx)}
            deal={deal}
            isSelected={deal.fp_hash === selectedDealId}
            onClick={() => onSelectDeal?.(deal)}
          />
        ))}
        {isLoading && deals.length > 0 && (
          <div className="queue-loading-more">Loading more deals…</div>
        )}
      </div>
    </div>
  );
}

export default ReviewQueueList;
