import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

function QuickReviewFooter({ currentIndex, totalDeals }) {
  return (
    <div className="quick-review-footer">
      <div className="quick-nav-hints">
        <div className="quick-nav-hint">
          <span className="quick-nav-key"><ArrowUp size={10} /><ArrowDown size={10} /></span> Navigate
        </div>
        <div className="quick-nav-hint">
          <span className="quick-nav-key">A</span> Approve
        </div>
        <div className="quick-nav-hint">
          <span className="quick-nav-key">R</span> Reject
        </div>
        <div className="quick-nav-hint">
          <span className="quick-nav-key">S</span> Spam
        </div>
        <div className="quick-nav-hint">
          <span className="quick-nav-key">Enter</span> Open link
        </div>
      </div>
      <div>
        Deal {totalDeals > 0 ? currentIndex + 1 : 0} of {totalDeals}
      </div>
    </div>
  );
}

export default QuickReviewFooter;
