import { useRef, useEffect, useState, useMemo } from 'react';
import { SlidersHorizontal, Plus, Search, X } from 'lucide-react';
import ReviewQueueItem from './ReviewQueueItem';
import useDealStore, { CHANNEL_NAME_MAP } from '../../store/useDealStore';
import { resolveChannelName } from '../../utils/helpers';

function ReviewQueueList({ deals, selectedIndex, onSelect, onCompose }) {
  const containerRef = useRef(null);
  const { channelConfig, activeFilter, setFilter, clearFilter, dealsLoading } = useDealStore();
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState('latest'); // 'latest' | 'oldest' | 'score'

  // Auto-scroll to selected item if it's out of view
  useEffect(() => {
    if (containerRef.current) {
      const selectedEl = containerRef.current.children[selectedIndex];
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Count deals per channel for the filter dropdown
  const channelCounts = useMemo(() => {
    const counts = {};
    deals.forEach(d => {
      const ch = d.channel || d.source_channel || d.channel_title || '';
      if (ch) counts[ch] = (counts[ch] || 0) + 1;
    });
    return counts;
  }, [deals]);

  // Unique channels for the dropdown
  const filterChannels = useMemo(() => {
    const allChannels = new Set();
    deals.forEach(d => {
      const ch = d.channel || d.source_channel || d.channel_title;
      if (ch) allChannels.add(ch);
    });
    // Also include channels from config
    channelConfig.forEach(c => allChannels.add(c.channel));
    return [...allChannels].map(ch => ({
      id: ch,
      name: resolveChannelName(ch),
      count: channelCounts[ch] || 0,
    })).sort((a, b) => b.count - a.count);
  }, [deals, channelConfig, channelCounts]);

  // Apply filters
  const filteredDeals = useMemo(() => {
    let result = deals;

    // Channel filter
    if (activeFilter) {
      result = result.filter(d =>
        (d.channel || d.source_channel || d.channel_title) === activeFilter
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d =>
        (d.prod_name || d.title || '').toLowerCase().includes(q) ||
        (d.aff_text || d.message || '').toLowerCase().includes(q) ||
        (d.category || '').toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortMode === 'oldest') {
      result = [...result].sort((a, b) => (a.ts || 0) - (b.ts || 0));
    } else if (sortMode === 'score') {
      result = [...result].sort((a, b) => (b.score || 0) - (a.score || 0));
    }
    // 'latest' is default (already sorted newest first from store)

    return result;
  }, [deals, activeFilter, searchQuery, sortMode]);

  const activeFilterName = activeFilter ? resolveChannelName(activeFilter) : null;

  const cycleSortMode = () => {
    const modes = ['latest', 'oldest', 'score'];
    const nextIdx = (modes.indexOf(sortMode) + 1) % modes.length;
    setSortMode(modes[nextIdx]);
  };

  const sortLabels = { latest: 'Latest First', oldest: 'Oldest First', score: 'Top Score' };

  return (
    <div className="review-queue-pane">
      <div className="queue-header">
        <div>
          <span className="queue-header-title">Review Queue</span>
          <span className="queue-header-count">{filteredDeals.length}{activeFilter ? ` / ${deals.length}` : ''}</span>
        </div>
        <div className="queue-header-actions">
          <button type="button" className="queue-sort-btn" onClick={cycleSortMode}>
            {sortLabels[sortMode]}
          </button>
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
          {onCompose && (
            <button type="button" className="queue-sort-btn" onClick={onCompose} style={{ color: '#a5b4fc' }} title="Compose deal manually">
              <Plus size={13} /> New
            </button>
          )}
        </div>
      </div>

      {/* Active filter chip */}
      {activeFilterName && (
        <div className="queue-active-filter">
          <span>📡 {activeFilterName}</span>
          <button onClick={clearFilter} title="Clear filter">×</button>
        </div>
      )}

      {/* Search bar */}
      <div style={{ padding: '4px 14px 0' }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-ter)' }} />
          <input
            className="queue-search-input"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search deals..."
            style={{ margin: 0, width: '100%' }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', border: 0, background: 'none', color: 'var(--text-ter)', cursor: 'pointer', padding: 0 }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="queue-list" ref={containerRef}>
        {deals.length === 0 && dealsLoading && (
          <>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="queue-item" style={{ padding: '14px 16px', opacity: 0.5 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 8, background: 'var(--bg-card)', animation: 'pulse 1.5s infinite' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ width: '70%', height: 12, borderRadius: 4, background: 'var(--bg-card)', marginBottom: 8, animation: 'pulse 1.5s infinite' }} />
                    <div style={{ width: '40%', height: 10, borderRadius: 4, background: 'var(--bg-card)', animation: 'pulse 1.5s infinite' }} />
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
        {filteredDeals.length === 0 && !dealsLoading && (
          <div style={{ textAlign: 'center', color: 'var(--text-ter)', padding: 40, fontSize: 12 }}>
            {searchQuery || activeFilter ? 'No deals match your filter' : 'Queue is empty'}
          </div>
        )}
        {filteredDeals.map((deal, idx) => (
          <ReviewQueueItem
            key={deal.fp_hash}
            deal={deal}
            isSelected={idx === selectedIndex}
            onClick={() => onSelect(idx)}
          />
        ))}
        {dealsLoading && deals.length > 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-ter)', padding: '12px 0', fontSize: 11 }}>
            Loading more deals…
          </div>
        )}
      </div>
    </div>
  );
}

export default ReviewQueueList;
