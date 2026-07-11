import React from 'react';

function QuickReviewFooter({ currentIndex, totalDeals }) {
  return (
    <div className="quick-review-footer">
      <div>
        Deal {totalDeals > 0 ? currentIndex + 1 : 0} of {totalDeals}
      </div>
    </div>
  );
}

export default QuickReviewFooter;
