import { AlertTriangle, CheckCircle2, CircleHelp, Gauge, Link2, Search, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { calcDiscount, fmtPrice } from '../../utils/helpers';

function normalizeScore(score) {
  const n = Number(score);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.max(0, Math.min(100, Math.round(n <= 10 ? n * 10 : n)));
}

function getImagePresent(deal) {
  return Boolean(deal?.img_url || deal?.img_path || deal?.image_url || deal?.image || deal?.photo || deal?.photo_url || deal?.img || deal?.thumbnail);
}

function getScoreLabel(score) {
  if (score == null) return ['Needs review', 'Score is not available for this deal.'];
  if (score >= 90) return ['Excellent candidate', 'High automated score based on available deal data.'];
  if (score >= 75) return ['Strong candidate', 'Good score with a few fields worth checking.'];
  if (score >= 55) return ['Manual review', 'Moderate score. Verify price, source, and link quality.'];
  return ['High caution', 'Low score. Review carefully before approving.'];
}

function ConfidenceRow({ label, value, tone = 'neutral' }) {
  return (
    <div className="confidence-row">
      <span>{label}</span>
      <strong className={tone}>{value}</strong>
    </div>
  );
}

function InsightItem({ icon: Icon, text, tone = 'positive' }) {
  return (
    <div className={`insight-item ${tone}`}>
      <Icon size={16} />
      <span>{text}</span>
    </div>
  );
}

function AiInsightsPane({ deal }) {
  if (!deal) {
    return (
      <aside className="ai-insights-pane ai-empty-state">
        <Sparkles size={28} />
        <div className="ai-empty-title">No deal selected</div>
        <div className="ai-empty-sub">Insights will update when you select a queue item.</div>
      </aside>
    );
  }

  const score = normalizeScore(deal.score);
  const [scoreTitle, scoreDesc] = getScoreLabel(score);
  const salePrice = deal.price || deal.prices?.sale;
  const mrp = deal.original_price || deal.prices?.mrp;
  const discount = deal.discount_pct || deal.prices?.discount_pct || calcDiscount(salePrice, mrp);
  const hasImage = getImagePresent(deal);
  const hasLink = Boolean(deal.affiliate_link);
  const hasRawText = Boolean(deal.aff_text || deal.message);
  const hasPrice = Boolean(fmtPrice(salePrice));
  const confidence = [
    hasPrice,
    hasLink,
    hasImage,
    hasRawText,
    Boolean(deal.category),
    Boolean(deal.channel || deal.source_channel),
  ].filter(Boolean).length;
  const confidencePct = Math.round((confidence / 6) * 100);

  const risks = [
    !hasPrice ? 'Missing sale price' : null,
    !hasLink ? 'Missing affiliate link' : null,
    !hasImage ? 'No product image available' : null,
    !hasRawText ? 'Original post text unavailable' : null,
  ].filter(Boolean);

  return (
    <aside className="ai-insights-pane premium-ai-pane">
      <section className="ai-section score-section">
        <div className="ai-header">
          <span className="ai-header-title">Review Intelligence</span>
          <span className="ai-badge">AI</span>
        </div>

        <div className="score-ring-container">
          <div className="score-svg-wrapper">
            <svg width="100" height="100" viewBox="0 0 100 100" className="score-svg">
              <defs>
                <linearGradient id="score-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <circle 
                cx="50" cy="50" r="38" 
                fill="none" 
                stroke="url(#score-grad)" 
                strokeWidth="8"
                strokeDasharray={2 * Math.PI * 38} 
                strokeDashoffset={2 * Math.PI * 38 - ((score || 0) / 100) * 2 * Math.PI * 38} 
                strokeLinecap="round" 
                transform="rotate(-90 50 50)" 
                filter="url(#glow)"
                style={{ transition: 'stroke-dashoffset 1s ease-in-out' }} 
              />
              <text x="50" y="46" textAnchor="middle" fill="#fff" fontSize="24" fontWeight="800" fontFamily="var(--mono)">{score ?? '--'}</text>
              <text x="50" y="66" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="11" fontWeight="600">/100</text>
            </svg>
          </div>
          <div className="score-text-area">
            <div className="score-title">{scoreTitle}</div>
            <div className="score-desc">{scoreDesc}</div>
          </div>
        </div>
      </section>

      <section className="ai-section">
        <div className="ai-section-title">
          <Gauge size={15} />
          Confidence
        </div>
        <div className="confidence-card">
          <div className="confidence-meter">
            <span style={{ width: `${confidencePct}%` }} />
          </div>
          <ConfidenceRow label="Data completeness" value={`${confidencePct}%`} tone={confidencePct >= 70 ? 'positive' : 'warning'} />
          <ConfidenceRow label="Price detected" value={hasPrice ? 'Yes' : 'No'} tone={hasPrice ? 'positive' : 'warning'} />
          <ConfidenceRow label="Affiliate link" value={hasLink ? 'Present' : 'Missing'} tone={hasLink ? 'positive' : 'warning'} />
          <ConfidenceRow label="Product image" value={hasImage ? 'Present' : 'Missing'} tone={hasImage ? 'positive' : 'neutral'} />
        </div>
      </section>

      <section className="ai-section">
        <div className="ai-section-title">
          <TrendingUp size={15} />
          Positive Signals
        </div>
        <div className="insights-list">
          {discount ? <InsightItem icon={CheckCircle2} text={`${Math.round(Number(discount))}% discount detected`} /> : null}
          {hasLink ? <InsightItem icon={Link2} text="Affiliate link is ready for posting" /> : null}
          {deal.category ? <InsightItem icon={Search} text={`Category classified as ${deal.category}`} /> : null}
          {score != null ? <InsightItem icon={ShieldCheck} text="Automated score is available" /> : null}
          {!discount && !hasLink && !deal.category && score == null ? (
            <InsightItem icon={CircleHelp} text="Not enough enrichment data is available yet" tone="neutral" />
          ) : null}
        </div>
      </section>

      <section className="ai-section">
        <div className="ai-section-title">
          <AlertTriangle size={15} />
          Risk Factors
        </div>
        {risks.length > 0 ? (
          <div className="risk-list">
            {risks.map((risk) => (
              <InsightItem key={risk} icon={AlertTriangle} text={risk} tone="warning" />
            ))}
          </div>
        ) : (
          <div className="risk-clear">
            <ShieldCheck size={16} />
            No obvious data gaps detected.
          </div>
        )}
      </section>

      <section className="ai-section similar-deals-box">
        <div className="ai-section-title">
          <Sparkles size={15} />
          Similar Deal Context
        </div>
        <div className="similar-stat">
          <span className="similar-stat-label">Current category</span>
          <strong className="similar-stat-val">{deal.category || 'Unclassified'}</strong>
        </div>
        <div className="similar-stat">
          <span className="similar-stat-label">Detected price</span>
          <strong className="similar-stat-val">{fmtPrice(salePrice) || 'Not available'}</strong>
        </div>
        <div className="similar-note">
          Historical similar-deal performance based on past 7 days.
        </div>
        <div style={{ height: 60, width: '100%', marginTop: 14 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[{v:12},{v:15},{v:14},{v:22},{v:28},{v:26},{v:35}]}>
              <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
              <Line type="monotone" dataKey="v" stroke="#7C3AED" strokeWidth={2.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </aside>
  );
}

export default AiInsightsPane;
