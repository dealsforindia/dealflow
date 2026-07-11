import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Shield, PenLine } from 'lucide-react';
import DealDetailsPane from './DealDetailsPane';
import { cleanTitle, resolveChannelName, categoryEmoji, fmt, fmtPrice, normalizeImageUrl, normalizeScore } from '../../utils/helpers';

const scoreColor = (s) => s === 0 ? "#52536A" : s >= 80 ? "#10b981" : s >= 60 ? "#f59e0b" : s >= 40 ? "#f97316" : "#ef4444";
const catColor = {
  Electronics:"#7B5CE8", Fashion:"#ec4899", "Home & Kitchen":"#f59e0b",
  Home:"#f59e0b", Beauty:"#f472b6", Sports:"#10b981",
  Banking:"#f59e0b", Food:"#f97316", Computers:"#06b6d4",
  General:"#9496B8", Grocery:"#10b981", Travel:"#06b6d4",
  Books:"#f59e0b", Kids:"#f97316", Gaming:"#7B5CE8", Watches:"#a78bfa",
  Pet:"#10b981",
};

const fmtAgo = (ts) => {
  if (!ts) return '';
  const d = Math.floor((Date.now()/1000) - ts);
  if (d < 60) return `${d}s ago`; 
  if (d < 3600) return `${Math.floor(d/60)}m ago`;
  return `${Math.floor(d/3600)}h ago`;
};

function ScoreRing({ score, size = 48 }) {
  const r = (size - 7) / 2, circ = 2 * Math.PI * r, color = scoreColor(score);
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4.5} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={4.5}
          strokeDasharray={`${(score / 100) * circ} ${circ}`} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 5px ${color}90)` }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span style={{ fontSize: size < 40 ? 9 : size < 52 ? 11 : 12, color, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>
          {score === 0 ? "?" : score}
        </span>
      </div>
    </div>
  );
}

function DealCard({ deal, tilt }) {
  const category = deal.category || deal.dealType || 'General';
  const dealType = deal.deal_type || deal.dealType || 'product';
  const accent = catColor[category] || "#7B5CE8";
  const aiScore = normalizeScore(deal.score) || 0;
  const sc = scoreColor(aiScore);
  const isUnrated = aiScore === 0;
  const channelName = deal.channelName || resolveChannelName(deal.channel || deal.source_channel);
  const title = cleanTitle(deal);
  const emoji = categoryEmoji(category);
  const salePrice = deal.price || deal.prices?.sale;
  const originalPrice = deal.original_price || deal.prices?.mrp;
  const discountPct = deal.discount_pct || deal.prices?.discount_pct;
  const signals = [];
  if (discountPct > 0) signals.push(`${Math.round(discountPct)}% off`);
  if (deal.affiliate_applied) signals.push("Affiliated");
  if (deal.coupon) signals.push(`Coupon: ${deal.coupon}`);

  return (
    <div className="w-full h-full rounded-3xl flex flex-col overflow-hidden select-none deal-swipe-card"
      style={{
        background: "var(--card)",
        border: `1px solid rgba(255,255,255,0.05)`,
        boxShadow: `0 0 0 1px rgba(0,0,0,0.4), 0 20px 60px rgba(0,0,0,0.5)${!isUnrated && aiScore >= 80 ? `, 0 0 40px ${sc}10` : ""}`,
        transform: tilt === "right" ? "rotate(3.5deg) translateX(6px)" : tilt === "left" ? "rotate(-3.5deg) translateX(-6px)" : tilt === "spam" ? "rotate(-1deg) translateY(-4px)" : "none",
        transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1)"
      }}>
      
      <div className="h-0.5 w-full flex-shrink-0" style={{ background: `linear-gradient(90deg,${accent}80 0%,transparent 100%)` }} />
      
      <div className="flex items-center px-5 py-3.5 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}30` }}>
            {channelName ? channelName[0].toUpperCase() : '📺'}
          </div>
          <span className="text-[11px] font-medium text-muted-foreground truncate">{channelName}</span>
          {dealType === "trick" && <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold flex-shrink-0" style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24" }}>TRICK</span>}
          {isUnrated && <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold flex-shrink-0" style={{ background: "rgba(68,69,94,0.3)", color: "#7C7E9E" }}>UNRATED</span>}
        </div>
        <ScoreRing score={aiScore} size={42} />
      </div>

      <div className="flex items-center justify-center flex-shrink-0 relative overflow-hidden" style={{ height: 172, background: `radial-gradient(ellipse at 50% 70%, ${accent}18 0%, transparent 65%)` }}>
        <div role="img" aria-label={category} style={{ fontSize: 84, lineHeight: 1, fontFamily: "'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif", filter: `drop-shadow(0 8px 24px ${accent}44)`, userSelect: "none" }}>{emoji}</div>
        <div className="absolute bottom-2.5 left-5 text-[10px] font-medium opacity-30 text-muted-foreground" style={{ fontFamily: "'JetBrains Mono',monospace" }}>{fmtAgo(deal.ts)}</div>
        <div className="absolute bottom-2.5 right-5">
          <span className="text-[10px] px-2 py-0.5 rounded-md font-medium" style={{ background: `${accent}14`, color: accent, border: `1px solid ${accent}20` }}>{category}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 px-5 py-4 flex-1 overflow-hidden">
        <h2 className="text-[13.5px] font-semibold text-foreground leading-snug" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{title}</h2>
        {salePrice > 0 ? (
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-[24px] font-bold leading-none" style={{ color: "#D8DAF0", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "-0.02em" }}>{fmtPrice(salePrice)}</span>
            {originalPrice > 0 && <span className="text-xs text-muted-foreground line-through">{fmtPrice(originalPrice)}</span>}
            {discountPct > 0 && <span className="text-xs font-bold" style={{ color: "#34d399" }}>{Math.round(discountPct)}% off</span>}
          </div>
        ) : <span className="text-lg font-bold" style={{ color: "#fbbf24", fontFamily: "'JetBrains Mono',monospace" }}>Trick / Loot</span>}
        
        {signals.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
            {signals.slice(0, 3).map(s => <span key={s} className="text-[10px] px-2 py-0.5 rounded-md font-medium" style={{ background: "rgba(255,255,255,0.04)", color: "#7C7E9E", border: "1px solid rgba(255,255,255,0.05)" }}>{s}</span>)}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SwipeReviewView({ deals, onApprove, onReject, onSpam, onEdit }) {
  const pending = deals.filter(d => d.status === "pending");
  const [exit, setExit] = useState(null);
  const [hover, setHover] = useState(null);
  const top = pending[0] || null, next1 = pending[1] || null, next2 = pending[2] || null;

  const doApprove = useCallback(() => { if (!top || exit) return; setExit("right"); setTimeout(() => { onApprove(top.fp_hash); setExit(null); }, 400); }, [top, exit, onApprove]);
  const doReject = useCallback(() => { if (!top || exit) return; setExit("left"); setTimeout(() => { onReject(top.fp_hash); setExit(null); }, 400); }, [top, exit, onReject]);
  const doSpam = useCallback(() => { if (!top || exit) return; setExit("up"); setTimeout(() => { onSpam(top.fp_hash); setExit(null); }, 400); }, [top, exit, onSpam]);

  if (!top) return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center px-8">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.12)" }}>✅</div>
      <div><p className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Queue is empty</p><p className="text-xs text-muted-foreground mt-1.5">All deals reviewed. New ones appear as the bot scrapes.</p></div>
    </div>
  );

  return (
    <div className="flex-1 flex overflow-hidden deal-swipe-card-container">
      {/* ── Card stack + action buttons ── */}
      <div className="flex flex-col items-center justify-center gap-5 px-6 py-6 overflow-hidden flex-shrink-0 w-full md:w-[430px]">
        <div className="flex items-center gap-2 self-stretch justify-between">
          <span className="text-[11px] text-muted-foreground"><span style={{ fontFamily: "'JetBrains Mono',monospace", color: "#D8DAF0", fontWeight: 600 }}>{pending.length}</span> pending</span>
          <div className="flex items-center gap-1">
            {pending.slice(0, Math.min(pending.length, 10)).map((d, i) => (
              <div key={d.fp_hash} className="rounded-full transition-all" style={{ width: i === 0 ? 16 : 4, height: 4, background: i === 0 ? scoreColor(normalizeScore(d.score) || 0) : "rgba(255,255,255,0.07)" }} />
            ))}
            {pending.length > 10 && <span className="text-[9px] text-muted-foreground ml-0.5" style={{ fontFamily: "'JetBrains Mono',monospace" }}>+{pending.length - 10}</span>}
          </div>
        </div>

        <div className="relative w-full card-stack" style={{ height: 450 }}>
          {next2 && <div className="absolute inset-x-5 top-5 bottom-0" style={{ transformOrigin: "top center", opacity: 0.28, pointerEvents: "none", zIndex: 1, transform: "scale(0.90)" }}><DealCard deal={next2} /></div>}
          {next1 && <div className="absolute inset-x-2.5 top-2.5 bottom-0" style={{ transformOrigin: "top center", opacity: 0.52, pointerEvents: "none", zIndex: 2, transform: "scale(0.955)" }}><DealCard deal={next1} /></div>}
          <motion.div
            key={top.fp_hash}
            className={`absolute inset-0 z-10 ${exit === "right" ? "fly-right" : exit === "left" ? "fly-left" : exit === "up" ? "fly-up" : ""}`}
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}>
            <DealCard deal={top} tilt={hover === "approve" ? "right" : hover === "reject" ? "left" : hover === "spam" ? "spam" : null} />
          </motion.div>
          <AnimatePresence>
            {hover === "approve" && <motion.div key="app-ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="absolute inset-0 z-20 rounded-3xl pointer-events-none" style={{ background: "rgba(16,185,129,0.04)", border: "2px solid rgba(16,185,129,0.35)" }} />}
            {hover === "reject" && <motion.div key="rej-ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="absolute inset-0 z-20 rounded-3xl pointer-events-none" style={{ background: "rgba(239,68,68,0.04)", border: "2px solid rgba(239,68,68,0.25)" }} />}
            {hover === "spam" && <motion.div key="spam-ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="absolute inset-0 z-20 rounded-3xl pointer-events-none" style={{ background: "rgba(245,158,11,0.04)", border: "2px solid rgba(245,158,11,0.25)" }} />}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 w-full">
          <motion.button onMouseEnter={() => setHover("reject")} onMouseLeave={() => setHover(null)} onClick={doReject}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 420, damping: 26 }}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold"
            style={{ background: hover === "reject" ? "rgba(224,84,84,0.14)" : "rgba(224,84,84,0.08)", color: "#f87171", border: `1px solid ${hover === "reject" ? "rgba(224,84,84,0.3)" : "rgba(224,84,84,0.15)"}`, transition: "background 0.15s,border 0.15s" }}>
            <X size={15} strokeWidth={2.5} /> Reject
          </motion.button>
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            <motion.button onMouseEnter={() => setHover("spam")} onMouseLeave={() => setHover(null)} onClick={doSpam}
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 420, damping: 26 }}
              className="w-11 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(251,191,36,0.08)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.15)" }}>
              <Shield size={14} />
            </motion.button>
            <motion.button onClick={() => onEdit(top)}
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 420, damping: 26 }}
              className="w-11 h-10 rounded-xl flex items-center justify-center border border-border text-muted-foreground hover:text-foreground" style={{ transition: "color 0.15s" }}>
              <PenLine size={14} />
            </motion.button>
          </div>
          <motion.button onMouseEnter={() => setHover("approve")} onMouseLeave={() => setHover(null)} onClick={doApprove}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 420, damping: 26 }}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold"
            style={{ background: hover === "approve" ? "rgba(52,211,153,0.16)" : "rgba(52,211,153,0.09)", color: "#34d399", border: `1px solid ${hover === "approve" ? "rgba(52,211,153,0.32)" : "rgba(52,211,153,0.18)"}`, boxShadow: hover === "approve" ? "0 0 28px rgba(52,211,153,0.18)" : "none", transition: "background 0.15s,border 0.15s,box-shadow 0.15s" }}>
            <Check size={15} strokeWidth={2.5} /> Approve
          </motion.button>
        </div>
        {top.verdict && <p className="text-[11px] text-muted-foreground text-center leading-relaxed max-w-[280px] mx-auto hidden md:block" style={{ opacity: 0.5 }}>{top.verdict}</p>}
      </div>

      {/* ── Detail panel (desktop only) ── */}
      <div className="hidden md:flex flex-1 flex-col border-l border-border overflow-hidden swipe-review-details-pane">
        <DealDetailsPane deal={top} onEdit={onEdit} onApprove={onApprove} onReject={onReject} onSpam={onSpam} />
      </div>
    </div>
  );
}
