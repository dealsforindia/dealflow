import { useRef, useEffect } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import ReviewQueueItem from './ReviewQueueItem';

function ReviewQueueList({ deals, selectedIndex, onSelect }) {
  const containerRef = useRef(null);
  
  // Auto-scroll to selected item if it's out of view
  useEffect(() => {
    if (containerRef.current) {
      const selectedEl = containerRef.current.children[selectedIndex];
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  return (
    <div className="review-queue-pane">
      <div className="queue-header">
        <div>
          <span className="queue-header-title">Review Queue</span>
          <span className="queue-header-count">{deals.length}</span>
        </div>
        <div className="queue-header-actions">
          <button type="button" className="queue-sort-btn">Latest First</button>
          <button type="button" className="queue-filter-btn" title="Filter queue">
            <SlidersHorizontal size={14} />
          </button>
        </div>
      </div>
      <div className="queue-list" ref={containerRef}>
        {deals.map((deal, idx) => (
          <ReviewQueueItem 
            key={deal.fp_hash} 
            deal={deal} 
            isSelected={idx === selectedIndex} 
            onClick={() => onSelect(idx)}
          />
        ))}
      </div>
    </div>
  );
}

export default ReviewQueueList;
