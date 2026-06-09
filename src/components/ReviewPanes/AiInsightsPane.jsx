import React from 'react';
import { CheckCircle2 } from 'lucide-react';

function AiInsightsPane({ deal }) {
  if (!deal) return <div className="ai-insights-pane"></div>;
  
  const score = deal.score ? Math.round(deal.score * 10) : 95;
  const isExcellent = score >= 90;

  return (
    <div className="ai-insights-pane">
      
      {/* ── SCORE RING ── */}
      <div>
        <div className="ai-header">
          <span className="ai-header-title">AI Deal Score</span>
          <span className="ai-badge">AI</span>
        </div>
        <div className="score-ring-container" style={{ marginTop: '24px' }}>
          <div className="score-circle">
            <div className="score-value">{score}<span>/100</span></div>
          </div>
          <div className="score-text-area">
            <div className="score-title" style={{ color: isExcellent ? 'var(--accent-green)' : 'var(--accent-amber)' }}>
              {isExcellent ? 'Excellent Deal' : 'Good Deal'}
            </div>
            <div className="score-desc">
              High profit potential with low risk and high demand.
            </div>
          </div>
        </div>
      </div>

      {/* ── WHY THIS DEAL IS GOOD ── */}
      <div>
        <div style={{ fontSize: '13px', color: 'var(--text-sec)', marginBottom: '16px' }}>Why this deal is good</div>
        <div className="insights-list">
          <div className="insight-item">
            <CheckCircle2 size={16} /> <span>High profit margin (78%)</span>
            <span className="impact-badge" style={{color: 'var(--accent-green)', background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)'}}>Impact: High</span>
          </div>
          <div className="insight-item">
            <CheckCircle2 size={16} /> <span>Popular brand with high trust</span>
            <span className="impact-badge" style={{color: 'var(--accent-green)', background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)'}}>Impact: High</span>
          </div>
          <div className="insight-item">
            <CheckCircle2 size={16} /> <span>High stock availability</span>
            <span className="impact-badge" style={{color: 'var(--accent-amber)', background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.2)'}}>Impact: Med</span>
          </div>
          <div className="insight-item">
            <CheckCircle2 size={16} /> <span>Strong conversion potential</span>
            <span className="impact-badge" style={{color: 'var(--accent-green)', background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)'}}>Impact: High</span>
          </div>
          <div className="insight-item">
            <CheckCircle2 size={16} /> <span>Low return & cancellation risk</span>
            <span className="impact-badge" style={{color: 'var(--text-sec)', background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)'}}>Impact: Low</span>
          </div>
        </div>
      </div>

      {/* ── RISK FACTORS ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Risk Factors</span>
          <span style={{ fontSize: '11px', color: 'var(--accent-green)' }}>Low</span>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-sec)' }}>No major risks detected</div>
      </div>

      {/* ── SIMILAR DEALS PERFORMANCE ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Similar Deals Performance</span>
          <span style={{ fontSize: '11px', color: 'var(--accent-purple)', cursor: 'pointer' }}>View All</span>
        </div>
        
        <div className="similar-deals-box">
          <div className="similar-stat">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span className="similar-stat-label">Avg. Conversion Rate</span>
              <span className="similar-stat-val" style={{color: 'var(--accent-green)'}}>3.6% <span className="similar-stat-trend">↑ 12%</span></span>
            </div>
            {/* Tiny sparkline placeholder using an SVG */}
            <svg width="60" height="20" viewBox="0 0 60 20">
              <polyline fill="none" stroke="var(--accent-green)" strokeWidth="1.5" points="0,15 10,12 20,16 30,8 40,10 50,2 60,6"/>
            </svg>
          </div>
          <div style={{ height: '1px', background: 'var(--border-dim)' }}></div>
          <div className="similar-stat">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span className="similar-stat-label">Avg. Revenue/Deal</span>
              <span className="similar-stat-val">₹4,210 <span className="similar-stat-trend">↑ 8%</span></span>
            </div>
            <svg width="60" height="20" viewBox="0 0 60 20">
              <polyline fill="none" stroke="var(--accent-green)" strokeWidth="1.5" points="0,10 10,14 20,8 30,12 40,4 50,6 60,2"/>
            </svg>
          </div>
        </div>
      </div>

    </div>
  );
}

export default AiInsightsPane;
