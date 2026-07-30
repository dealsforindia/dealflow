import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast, Toaster } from "sonner";
import {
  Check, X, Search, Sun, Moon, Zap, Tag, Settings2, Radio,
  CheckSquare, Rss, Plus, PenLine, Upload, Sparkles,
  Undo2, ExternalLink, Shield,
  Clock, TrendingUp, Flame, RefreshCw, CheckCircle2,
  ToggleLeft, ToggleRight, Maximize2, Copy, Link, FileText,
} from "lucide-react";
const pendingDealsRaw: any = {};
const dailyStatsRaw: any = { date: new Date().toISOString().split('T')[0], posted: 0, checked: 0, dup: 0, unrated: 0, affiliate: 0, auto_posted: 0, scam: 0 };

// ─── Types ────────────────────────────────────────────────────────────────────
type DealStatus = "pending" | "approved" | "rejected" | "draft";
type DealType = "product" | "trick";
type Tab = "Review" | "DesiDime" | "Posted" | "Channels" | "Settings";

interface Deal {
  id: string; title: string; price: number; mrp: number; discount: number;
  category: string; catEmoji: string; channel: string; channelRaw: string;
  score: number; ts: number; status: DealStatus; dealType: DealType;
  affiliate: boolean; coupon: string | null; imgUrl: string;
  platforms: string[]; originalText: string; affText: string;
  verdict: string; signals: string[];
}

interface RawDeal {
  aff_text: string; prices: { mrp: number | null; sale: number | null; discount_pct: number | null };
  prod_name: string; category: string; platforms: string[]; coupon: string | null;
  bank_offers: string[]; flash: unknown; img_path: string | null; ts: number;
  original_text: string; source_channel: string; affiliate_applied: boolean;
  original_msg_link: string; deal_type: string; score: number | null;
  img_url?: string;
}

interface PostedEntry {
  id: string; title: string; catEmoji: string; price: number; discount: number;
  channel: string; postedAt: number; affiliate: boolean;
}

interface AppSettings {
  outputChannel: string; stylePrompt: string; dedupHours: number; maxPerCycle: number;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const extractEmoji = (cat: string) => cat.split(" ")[0] || "🛍️";
const extractCatName = (cat: string) => cat.split(" ").slice(1).join(" ") || cat;
const toChName = (ch: string) => {
  if (!ch) return "";
  const clean = ch.replace(/^@/, "");
  if (/^-?\d+$/.test(clean)) return clean;
  return clean.split(/[_-]/).map(w => w[0]?.toUpperCase() + w.slice(1)).join(" ");
};
const buildVerdict = (s: number | null) =>
  s === null ? "Unrated — review manually." :
  s >= 8 ? "Strong deal — high confidence score." :
  s >= 6 ? "Decent deal — worth reviewing." :
  s >= 4 ? "Borderline — check if genuine." : "Low quality — likely spam.";
const buildSignals = (d: RawDeal): string[] => {
  const s: string[] = [];
  if (d.prices.discount_pct && d.prices.discount_pct > 0) s.push(`${Math.round(d.prices.discount_pct)}% off`);
  if (d.affiliate_applied) s.push("Affiliated");
  if (d.coupon) s.push(`Coupon: ${d.coupon}`);
  if (d.bank_offers?.length > 0) s.push(`${d.bank_offers.length} bank offer${d.bank_offers.length > 1 ? "s" : ""}`);
  if (d.platforms?.[0]) s.push(d.platforms[0]);
  if (d.flash) s.push("Flash sale");
  return s.slice(0, 4);
};

const rawEntries = Object.entries(pendingDealsRaw as Record<string, RawDeal>)
  .sort(([, a], [, b]) => {
    if (a.score === null && b.score === null) return b.ts - a.ts;
    if (a.score === null) return 1;
    if (b.score === null) return -1;
    return b.score - a.score;
  }).slice(0, 120);

const API_BASE = import.meta.env.VITE_API_URL || "";

const BASE_DEALS: Deal[] = rawEntries.map(([id, d]) => ({
  id, title: d.prod_name || "Untitled Deal",
  price: d.prices.sale ?? 0, mrp: d.prices.mrp ?? 0,
  discount: d.prices.discount_pct ?? 0,
  category: extractCatName(d.category), catEmoji: extractEmoji(d.category),
  channel: toChName(d.source_channel), channelRaw: d.source_channel,
  score: d.score !== null ? Math.min(100, Math.round(d.score * 10)) : 0,
  ts: Math.floor(d.ts), status: "pending",
  dealType: (d.deal_type === "trick" ? "trick" : "product") as DealType,
  affiliate: d.affiliate_applied, coupon: d.coupon,
  imgUrl: (() => {
    // Prefer img_url if it's a full http URL
    if ((d as RawDeal & { img_url?: string }).img_url?.startsWith("http")) return (d as RawDeal & { img_url?: string }).img_url!;
    if (!d.img_path) return "";
    // img_path may be full server path like /home/.../images/foo.jpg or relative like images/foo.jpg
    const fname = d.img_path.includes("/images/") ? "images/" + d.img_path.split("/images/").pop() : d.img_path;
    return `${API_BASE}/${fname}`;
  })(), platforms: d.platforms || [],
  originalText: d.original_text || "", affText: d.aff_text || d.original_text || "",
  verdict: buildVerdict(d.score), signals: buildSignals(d),
}));

const DAILY_STATS = dailyStatsRaw as {
  date: string; posted: number; checked: number; dup: number;
  unrated: number; affiliate: number; auto_posted: number; scam: number;
};

const rawChannels = Array.from(new Set(rawEntries.map(([, d]) => d.source_channel)));
const CHANNELS = rawChannels.slice(0, 12).map((ch, i) => {
  const colors = ["#E63946","#06b6d4","#10b981","#f59e0b","#ec4899","#f97316","#7C3AED","#6ee7b7","#fbbf24","#fb7185","#67e8f9","#86efac"];
  const count = rawEntries.filter(([, d]) => d.source_channel === ch).length;
  return { id: ch, name: toChName(ch), active: true, deals: count, color: colors[i % colors.length] };
});

// ─── Utils ────────────────────────────────────────────────────────────────────
const fmt = (p: number) => p === 0 ? "Free" : `₹${p.toLocaleString("en-IN")}`;
const fmtAgo = (ts: number) => {
  const d = Math.floor(Date.now() / 1000 - ts);
  if (d < 60) return `${d}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  return `${Math.floor(d / 3600)}h ago`;
};
const fmtTime = (ts: number) => new Date(ts * 1000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
const fmtDate = (ts: number) => new Date(ts * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const scoreColor = (s: number) => s === 0 ? "#9CA3AF" : s >= 75 ? "#16a34a" : s >= 50 ? "#f59e0b" : "#dc2626";
const catColor: Record<string, string> = {
  Electronics: "#7C3AED", Fashion: "#ec4899", "Home & Kitchen": "#f59e0b",
  Home: "#f59e0b", Beauty: "#f472b6", Sports: "#10b981", Banking: "#f59e0b",
  Food: "#f97316", Computers: "#06b6d4", General: "#9496B8", Grocery: "#10b981",
  Travel: "#06b6d4", Books: "#f59e0b", Kids: "#f97316", Gaming: "#7C3AED",
};
const discBg = (pct: number) => pct >= 70 ? "#dc2626" : pct >= 40 ? "#ea580c" : "#16a34a";
const extractUrls = (text: string): string[] => [...(text.match(/https?:\/\/[^\s]+/g) || [])];
const stripAffTag = (url: string): string => {
  try {
    const u = new URL(url);
    u.searchParams.delete("tag");
    u.searchParams.delete("ref");
    u.searchParams.delete("smid");
    return u.toString();
  } catch { return url; }
};
const aiRewriteSim = (text: string, inst: string): string => {
  const i = inst.toLowerCase();
  if (i.includes("short") || i.includes("concise")) return text.split("\n").slice(0, 8).join("\n");
  if (i.includes("emoji")) return "🔥 " + text;
  if (i.includes("clean")) return text.replace(/#\S+/g, "").replace(/\n{3,}/g, "\n\n").trim();
  return text + "\n\n⚡ Limited time — grab it fast!";
};

const STYLES = `
  @keyframes slideUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
  @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
  @keyframes spin{to{transform:rotate(360deg);}}
  @keyframes slideRight{from{opacity:0;transform:translateX(100%);}to{opacity:1;transform:translateX(0);}}
  .slide-up{animation:slideUp 0.28s cubic-bezier(0.16,1,0.3,1) both;}
  .fade-in{animation:fadeIn 0.18s ease both;}
  .slide-right{animation:slideRight 0.26s cubic-bezier(0.16,1,0.3,1) both;}
  .ai-spin{width:12px;height:12px;border:2px solid rgba(0,0,0,0.1);border-top-color:#E63946;border-radius:50%;animation:spin 0.7s linear infinite;display:inline-block;vertical-align:middle;}
  .dark .ai-spin{border-color:rgba(255,255,255,0.1);border-top-color:#E63946;}
  input[type=range]{accent-color:#E63946;}
  .mobile-nav{min-height:60px;padding-bottom:env(safe-area-inset-bottom,0px);}
  .tg-text{white-space:pre-wrap;word-break:break-word;font-size:12.5px;line-height:1.65;font-family:'Inter',sans-serif;}
`;

const WS_URL = import.meta.env.VITE_WS_URL || `${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}/ws`;

// ─── API Helpers ──────────────────────────────────────────────────────────────
function mapRawToDeal(d: RawDeal & { fp_hash?: string }, fallbackId?: string): Deal {
  const id = d.fp_hash ?? fallbackId ?? String(d.ts);
  return {
    id, title: d.prod_name || "Untitled Deal",
    price: d.prices.sale ?? 0, mrp: d.prices.mrp ?? 0,
    discount: d.prices.discount_pct ?? 0,
    category: extractCatName(d.category), catEmoji: extractEmoji(d.category),
    channel: toChName(d.source_channel), channelRaw: d.source_channel,
    score: d.score !== null ? Math.min(100, Math.round(d.score * 10)) : 0,
    ts: Math.floor(d.ts), status: "pending" as DealStatus,
    dealType: (d.deal_type === "trick" ? "trick" : "product") as DealType,
    affiliate: d.affiliate_applied, coupon: d.coupon,
    imgUrl: (() => {
      // Try img_url first — if it's an external CDN URL (Amazon, Flipkart etc.), use directly
      if (d.img_url && !d.img_url.includes("74.225.250.0")) return d.img_url;
      // For local server images, extract the filename and use our proxy
      if (d.img_url?.includes("74.225.250.0")) {
        const match = d.img_url.match(/\/images\/(.+)$/);
        if (match) return `${API_BASE}/images/${match[1]}`;
      }
      if (!d.img_path) return "";
      const fname = d.img_path.includes("/images/") ? "images/" + d.img_path.split("/images/").pop() : d.img_path;
      return `${API_BASE}/${fname}`;
    })(),
    platforms: d.platforms || [],
    originalText: d.original_text || "", affText: d.aff_text || d.original_text || "",
    verdict: buildVerdict(d.score), signals: buildSignals(d),
  };
}

async function fetchPendingDeals(): Promise<Deal[]> {
  const res = await fetch(`${API_BASE}/api/v1/deals/pending?limit=120`);
  if (!res.ok) throw new Error("Failed to fetch deals");
  const data = await res.json();
  let rows: (RawDeal & { fp_hash?: string })[];
  if (data && typeof data === "object" && Array.isArray(data.deals)) {
    rows = data.deals;
  } else if (Array.isArray(data)) {
    rows = data;
  } else {
    rows = Object.entries(data as Record<string, RawDeal>).map(([k, v]) => ({ ...v, fp_hash: k }));
  }
  return rows.map((d, i) => mapRawToDeal(d, String(i))).sort((a, b) => {
    if (a.score === 0 && b.score === 0) return b.ts - a.ts;
    if (a.score === 0) return 1;
    if (b.score === 0) return -1;
    return b.score - a.score;
  });
}

async function fetchDailyStats() {
  try {
    const res = await fetch(`${API_BASE}/api/v1/stats`);
    if (!res.ok) return DAILY_STATS;
    return await res.json();
  } catch { return DAILY_STATS; }
}

async function apiApprove(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/deals/${id}/approve`, { method: "PUT" });
    return res.ok;
  } catch { return false; }
}

async function apiReject(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/deals/${id}/reject`, { method: "PUT" });
    return res.ok;
  } catch { return false; }
}

async function apiEdit(id: string, changes: Record<string, unknown>): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/deals/${id}/edit`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes),
    });
    return res.ok;
  } catch { return false; }
}

async function apiAiRewrite(id: string, instruction: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/deals/${id}/ai-rewrite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instruction }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.text || data.rewritten_text || null;
  } catch { return null; }
}

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 36 }: { score: number; size?: number }) {
  const r = (size - 6) / 2, circ = 2 * Math.PI * r, color = scoreColor(score);
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={4} className="text-border" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={4}
          strokeDasharray={`${(score / 100) * circ} ${circ}`} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${color}80)` }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span style={{ fontSize: size < 40 ? 9 : 11, color, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>
          {score === 0 ? "?" : score}
        </span>
      </div>
    </div>
  );
}

// ─── Image Lightbox ───────────────────────────────────────────────────────────
function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-[70] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.94)" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}>
      <motion.img src={src} alt="" className="max-w-[94vw] max-h-[88dvh] object-contain rounded-2xl"
        style={{ boxShadow: "0 0 60px rgba(0,0,0,0.5)" }}
        initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 24, stiffness: 300 }}
        onClick={e => e.stopPropagation()} />
      <button className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center bg-white/10 text-white"
        onClick={onClose}><X size={16} /></button>
      <p className="absolute bottom-5 text-xs text-white/40">Tap anywhere to close</p>
    </motion.div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ deal, onClose, onSaveDraft, onSaveApprove }: {
  deal: Deal;
  onClose: () => void;
  onSaveDraft: (changes: Partial<Deal>) => void;
  onSaveApprove: (changes: Partial<Deal>) => void;
}) {
  const [title, setTitle] = useState(deal.title);
  const [price, setPrice] = useState(String(deal.price || ""));
  const [mrp, setMrp] = useState(String(deal.mrp || ""));
  const [text, setText] = useState(deal.affText);
  const [imgUrl, setImgUrl] = useState(deal.imgUrl);
  const [imgFile, setImgFile] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [instruction, setInstruction] = useState("");
  const [rewriting, setRewriting] = useState(false);
  const [prev, setPrev] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const previewSrc = imgFile || imgUrl || null;
  const isDirty = title !== deal.title || price !== String(deal.price || "") || imgUrl !== deal.imgUrl;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => { setImgFile(ev.target?.result as string); setZoom(1); };
    reader.readAsDataURL(f);
  };

  const doRewrite = async () => {
    if (!instruction.trim()) return;
    setRewriting(true); setPrev(text);
    // Try real API first, fall back to local simulation
    const result = await apiAiRewrite(deal.id, instruction);
    if (result) {
      setText(result);
    } else {
      setText(aiRewriteSim(text, instruction));
    }
    setInstruction(""); setRewriting(false);
  };

  const changes: Partial<Deal> = {
    title, imgUrl: imgFile || imgUrl,
    price: Number(price) || deal.price,
    mrp: Number(mrp) || deal.mrp,
    affText: text,
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <AnimatePresence>{lightbox && previewSrc && <ImageLightbox src={previewSrc} onClose={() => setLightbox(false)} />}</AnimatePresence>
      <motion.div
        className="w-full md:max-w-2xl max-h-[94dvh] flex flex-col rounded-t-3xl md:rounded-3xl overflow-hidden"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 320 }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border flex-shrink-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(230,57,70,0.1)" }}>
            <PenLine size={14} style={{ color: "#E63946" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">Edit Deal</p>
            <p className="text-[11px] text-muted-foreground truncate">{deal.channel} · {fmtAgo(deal.ts)}</p>
          </div>
          {isDirty && <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}>Unsaved</span>}
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center bg-secondary text-muted-foreground">
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col md:flex-row gap-0 md:gap-0 h-full">
            {/* Left: form */}
            <div className="flex-1 px-5 py-4 flex flex-col gap-4">

              {/* Image section */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Product Image</label>
                {/* Preview */}
                <div className="relative rounded-2xl overflow-hidden bg-secondary mb-3 cursor-zoom-in"
                  style={{ aspectRatio: "4/3", maxHeight: 220 }}
                  onClick={() => previewSrc && setLightbox(true)}>
                  {previewSrc ? (
                    <img src={previewSrc} alt="" className="w-full h-full"
                      style={{ objectFit: "contain", transform: `scale(${zoom})`, transformOrigin: "center center", transition: "transform 0.15s" }}
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <span style={{ fontSize: 48, fontFamily: "'Segoe UI Emoji',sans-serif" }}>{deal.catEmoji}</span>
                      <span className="text-xs">No image</span>
                    </div>
                  )}
                  {previewSrc && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity" style={{ background: "rgba(0,0,0,0.18)" }}>
                      <Maximize2 size={20} className="text-white" />
                    </div>
                  )}
                  {/* Remove */}
                  {previewSrc && (
                    <button onClick={e => { e.stopPropagation(); setImgFile(null); setImgUrl(""); setZoom(1); }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(0,0,0,0.6)" }}>
                      <X size={11} className="text-white" />
                    </button>
                  )}
                </div>

                {/* Zoom slider */}
                {previewSrc && (
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] text-muted-foreground w-6 flex-shrink-0">🔍</span>
                    <input type="range" min={0.5} max={2.5} step={0.05} value={zoom}
                      onChange={e => setZoom(Number(e.target.value))} className="flex-1" />
                    <span className="text-[10px] font-mono text-muted-foreground w-8 flex-shrink-0 text-right">{zoom.toFixed(1)}×</span>
                  </div>
                )}

                {/* Upload / URL */}
                <div className="flex gap-2">
                  <input value={imgUrl} onChange={e => setImgUrl(e.target.value)}
                    placeholder="https://image-url.com/photo.jpg"
                    className="flex-1 px-3 py-2 rounded-xl text-xs text-foreground border border-border bg-input focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground" />
                  <button onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-border text-foreground hover:bg-secondary transition-colors">
                    <Upload size={11} /> Upload
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-foreground border border-border bg-input focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>

              {/* Price */}
              {deal.dealType === "product" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Sale Price (₹)</label>
                    <input type="number" value={price} onChange={e => setPrice(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm text-foreground border border-border bg-input focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">MRP (₹)</label>
                    <input type="number" value={mrp} onChange={e => setMrp(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm text-foreground border border-border bg-input focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono" />
                  </div>
                </div>
              )}

              {/* AI Rewrite + Post Text */}
              <div>
                <div className="flex items-end justify-between mb-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Post Text (Affiliate)</label>
                  <span className="text-[10px] font-mono text-muted-foreground">{text.length} chars</span>
                </div>
                <div className="flex gap-2 mb-2">
                  <input value={instruction} onChange={e => setInstruction(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && doRewrite()}
                    placeholder='"make shorter", "add emojis", "clean up"…'
                    className="flex-1 px-3 py-2 rounded-xl text-xs text-foreground border border-border bg-input focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground" />
                  <button onClick={doRewrite} disabled={rewriting || !instruction.trim()}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold disabled:opacity-40 transition-all"
                    style={{ background: "rgba(230,57,70,0.08)", color: "#E63946", border: "1px solid rgba(230,57,70,0.2)" }}>
                    {rewriting ? <><span className="ai-spin" /> Rewriting…</> : <><Sparkles size={11} />AI</>}
                  </button>
                  {prev && <button onClick={() => { setText(prev); setPrev(null); }}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold border border-border text-red-500 transition-colors">
                    <Undo2 size={11} />Undo
                  </button>}
                </div>
                <textarea value={text} onChange={e => setText(e.target.value)} rows={5}
                  className="w-full px-3.5 py-3 rounded-xl text-xs text-foreground border border-border bg-input focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none tg-text" />
              </div>

              {/* Non-affiliate original text + links */}
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                <div className="flex items-center gap-2 px-3 py-2 border-b border-border" style={{ background: "var(--secondary)" }}>
                  <FileText size={11} className="text-muted-foreground" />
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex-1">Non-affiliate Original Text</span>
                  <button onClick={() => { navigator.clipboard.writeText(deal.originalText); toast.success("Copied!", { duration: 1200 }); }}
                    className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors">
                    <Copy size={9} /> Copy
                  </button>
                </div>
                <div className="px-3 py-2.5 max-h-24 overflow-y-auto">
                  <p className="tg-text text-muted-foreground" style={{ fontSize: 11 }}>
                    {deal.originalText || "No original text available."}
                  </p>
                </div>
                {/* Extracted raw links */}
                {extractUrls(deal.originalText).length > 0 && (
                  <div className="border-t border-border px-3 py-2 flex flex-col gap-1.5">
                    <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Link size={8} />Raw Links</p>
                    {extractUrls(deal.originalText).slice(0, 3).map((url, i) => {
                      const clean = stripAffTag(url);
                      return (
                        <div key={i} className="flex items-center gap-2 rounded-lg px-2 py-1.5" style={{ background: "var(--secondary)" }}>
                          <span className="text-[10px] text-foreground font-mono flex-1 truncate">{clean}</span>
                          <button onClick={() => { navigator.clipboard.writeText(clean); toast.success("Link copied!", { duration: 1200 }); }}
                            className="flex-shrink-0 p-1 rounded-md hover:bg-border transition-colors">
                            <Copy size={9} className="text-muted-foreground" />
                          </button>
                          <a href={clean} target="_blank" rel="noreferrer"
                            className="flex-shrink-0 p-1 rounded-md hover:bg-border transition-colors">
                            <ExternalLink size={9} className="text-muted-foreground" />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right: live card preview (desktop) */}
            <div className="hidden md:flex w-52 flex-shrink-0 flex-col gap-3 p-4 border-l border-border bg-secondary/50">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Card Preview</p>
              <div className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm">
                <div className="relative bg-gray-50" style={{ aspectRatio: "1/1" }}>
                  {previewSrc ? (
                    <img src={previewSrc} alt="" className="w-full h-full"
                      style={{ objectFit: "contain", padding: 8, transform: `scale(${zoom})`, transformOrigin: "center center" }}
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl"
                      style={{ fontFamily: "'Segoe UI Emoji',sans-serif", background: `${catColor[deal.category] || "#E63946"}10` }}>
                      {deal.catEmoji}
                    </div>
                  )}
                  {deal.discount > 0 && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-white text-[10px] font-bold"
                      style={{ background: discBg(deal.discount) }}>{Math.round(deal.discount)}% OFF</div>
                  )}
                </div>
                <div className="p-2.5 flex flex-col gap-1.5">
                  <p className="text-[11px] font-semibold text-foreground leading-snug line-clamp-2">{title || "Deal title…"}</p>
                  {Number(price) > 0 && (
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-foreground font-mono">{fmt(Number(price))}</span>
                      {Number(mrp) > 0 && <span className="text-[10px] text-muted-foreground line-through">{fmt(Number(mrp))}</span>}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-[10px] text-muted-foreground leading-relaxed">Zoom slider changes how the image fills the card.</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-t border-border flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground border border-border hover:border-foreground/20 transition-colors">Cancel</button>
          <button onClick={() => { onSaveDraft(changes); onClose(); }} disabled={!isDirty}
            className="px-4 py-2 rounded-xl text-sm font-semibold border border-border text-foreground disabled:opacity-40 hover:bg-secondary transition-colors">
            Save Draft
          </button>
          <button onClick={() => { onSaveApprove(changes); onClose(); }}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold text-white transition-all active:scale-[0.98]"
            style={{ background: "#16a34a", boxShadow: "0 4px 16px rgba(22,163,74,0.25)" }}>
            <Check size={14} strokeWidth={2.5} /> Save & Approve
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Deal Card (SaveKaro style) ───────────────────────────────────────────────
function DealCard({ deal, onApprove, onReject, onEdit }: {
  deal: Deal; onApprove: (id: string) => void;
  onReject: (id: string) => void; onEdit: (d: Deal) => void;
}) {
  const [imgErr, setImgErr] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const accent = catColor[deal.category] || "#9496B8";

  return (
    <motion.div layout
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", damping: 22, stiffness: 280 }}
      className="bg-card rounded-2xl overflow-hidden flex flex-col"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)", border: "1px solid var(--border)" }}>

      <AnimatePresence>{lightbox && deal.imgUrl && <ImageLightbox src={deal.imgUrl} onClose={() => setLightbox(false)} />}</AnimatePresence>

      {/* Image */}
      <div className="relative overflow-hidden cursor-zoom-in flex-shrink-0"
        style={{ height: 158, background: deal.imgUrl && !imgErr ? `radial-gradient(ellipse at 50% 80%, ${accent}20 0%, transparent 68%)` : `${accent}0D` }}
        onClick={() => !imgErr && deal.imgUrl && setLightbox(true)}>
        {deal.imgUrl && !imgErr ? (
          <>
            {/* Full product image — main visual */}
            <img src={deal.imgUrl} alt={deal.title}
              className="absolute inset-0 w-full h-full object-contain"
              style={{ padding: "8px", zIndex: 2 }}
              onError={() => setImgErr(true)} />

            {/* Subtle blurred bg for color fill behind transparent PNGs */}
            <img src={deal.imgUrl} alt="" aria-hidden
              className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: 0.12, filter: "blur(18px) saturate(1.4)", zIndex: 0 }}
              onError={() => setImgErr(true)} />

            {/* Dot grid texture */}
            <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle, ${accent}12 1px, transparent 1px)`, backgroundSize: "22px 22px", opacity: 0.3, zIndex: 1 }} />

            {/* Emoji badge — small, bottom-left */}
            <div className="absolute bottom-2.5 left-3 text-2xl leading-none z-10"
              style={{ fontFamily: "'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif",
                filter: `drop-shadow(0 2px 8px ${accent}66)`, userSelect: "none" }}>
              {deal.catEmoji}
            </div>

            {/* Expand hint overlay on hover */}
            <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              style={{ background: "rgba(0,0,0,0.25)" }}>
              <Maximize2 size={22} className="text-white/80" />
            </div>

            {/* Age + category badges */}
            <div className="absolute bottom-2.5 right-3 z-10">
              <span className="text-[10px] px-2 py-0.5 rounded-md font-medium"
                style={{ background: `${accent}16`, color: accent, border: `1px solid ${accent}28` }}>
                {deal.category}
              </span>
            </div>
            <div className="absolute top-2.5 right-3 z-10 text-[10px] font-medium text-muted-foreground"
              style={{ fontFamily: "'JetBrains Mono',monospace", opacity: 0.45 }}>{fmtAgo(deal.ts)}</div>
          </>
        ) : (
          <>
            {/* Dot grid texture */}
            <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle, ${accent}12 1px, transparent 1px)`, backgroundSize: "22px 22px", opacity: 0.3, zIndex: 1 }} />
            <div className="w-full h-full flex items-center justify-center" style={{ fontSize: 52, fontFamily: "'Segoe UI Emoji','Apple Color Emoji',sans-serif" }}>
              {deal.catEmoji}
            </div>
          </>
        )}

        {/* Discount badge */}
        {deal.discount > 0 && (
          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-lg text-white font-bold leading-none"
            style={{ background: discBg(deal.discount), fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }}>
            {Math.round(deal.discount)}% OFF
          </div>
        )}

        {/* Score */}
        <div className="absolute top-2 right-2 z-10">
          <ScoreRing score={deal.score} size={32} />
        </div>

        {/* Trick badge */}
        {deal.dealType === "trick" && (
          <div className="absolute bottom-2 left-2 z-10 px-1.5 py-0.5 rounded-md text-[9px] font-bold"
            style={{ background: "#fef3c7", color: "#92400e" }}>TRICK</div>
        )}

        {/* Affiliate */}
        {deal.affiliate && (
          <div className="absolute bottom-2 right-2 z-10 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center" title="Affiliated">
            <Zap size={9} className="text-white" strokeWidth={2.5} />
          </div>
        )}

        {/* Status overlay */}
        {deal.status === "approved" && (
          <div className="absolute inset-0 z-20 flex items-center justify-center" style={{ background: "rgba(22,163,74,0.82)" }}>
            <Check size={36} className="text-white" strokeWidth={3} />
          </div>
        )}
        {deal.status === "rejected" && (
          <div className="absolute inset-0 z-20 flex items-center justify-center" style={{ background: "rgba(220,38,38,0.82)" }}>
            <X size={36} className="text-white" strokeWidth={3} />
          </div>
        )}
        {deal.status === "draft" && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-1" style={{ background: "rgba(245,158,11,0.82)" }}>
            <FileText size={28} className="text-white" />
            <span className="text-white text-[11px] font-bold">Draft</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 gap-2">
        <p className="text-[12.5px] font-semibold text-foreground leading-snug"
          style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {deal.title}
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-2 flex-wrap">
          {deal.price > 0 ? (
            <>
              <span className="text-[16px] font-bold text-foreground leading-none"
                style={{ fontFamily: "'JetBrains Mono',monospace", letterSpacing: "-0.02em" }}>
                {fmt(deal.price)}
              </span>
              {deal.mrp > 0 && deal.mrp > deal.price && (
                <span className="text-[11px] text-muted-foreground line-through">{fmt(deal.mrp)}</span>
              )}
            </>
          ) : (
            <span className="text-sm font-bold" style={{ color: "#f59e0b" }}>Trick / Loot</span>
          )}
        </div>

        {/* Coupon */}
        {deal.coupon && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md w-fit"
            style={{ background: "#fef9c3", border: "1px dashed #fbbf24" }}>
            <Tag size={8} style={{ color: "#92400e" }} />
            <span className="text-[10px] font-bold font-mono" style={{ color: "#92400e" }}>{deal.coupon}</span>
          </div>
        )}

        {/* Channel + time */}
        <div className="flex items-center gap-1.5 mt-auto">
          <div className="w-4 h-4 rounded-md flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0"
            style={{ background: accent }}>{deal.channel[0]}</div>
          <span className="text-[10px] text-muted-foreground truncate flex-1">{deal.channel}</span>
          <span className="text-[10px] text-muted-foreground flex-shrink-0">{fmtAgo(deal.ts)}</span>
        </div>

        {/* Actions */}
        {deal.status === "pending" ? (
          <div className="flex gap-1.5 pt-1">
            <button onClick={() => onReject(deal.id)}
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
              style={{ background: "#fef2f2", border: "1px solid #fecaca" }} title="Reject">
              <X size={13} style={{ color: "#dc2626" }} strokeWidth={2.5} />
            </button>
            <button onClick={() => onEdit(deal)}
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95 border border-border bg-secondary text-muted-foreground hover:text-foreground" title="Edit">
              <PenLine size={12} />
            </button>
            <button onClick={() => onApprove(deal.id)}
              className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-xl text-xs font-bold transition-all active:scale-95"
              style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>
              <Check size={12} strokeWidth={2.5} /> Approve
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 pt-1">
            <span className="flex-1 text-center text-[11px] font-bold py-1.5 rounded-xl"
              style={{
                background: deal.status === "approved" ? "#f0fdf4" : "#fef2f2",
                color: deal.status === "approved" ? "#16a34a" : "#dc2626",
              }}>
              {deal.status === "approved" ? "✓ Approved" : "✗ Rejected"}
            </span>
            <button onClick={() => onEdit(deal)}
              className="w-8 h-8 rounded-xl flex items-center justify-center border border-border bg-secondary text-muted-foreground" title="Edit">
              <PenLine size={12} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Review / Grid View ───────────────────────────────────────────────────────
function ReviewView({ deals, onApprove, onReject, onEdit, dark }: {
  deals: Deal[]; onApprove: (id: string) => void;
  onReject: (id: string) => void; onEdit: (d: Deal) => void; dark: boolean;
}) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"score" | "latest" | "discount">("score");
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");

  let visible = deals.filter(d => {
    if (filter !== "all" && d.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return d.title.toLowerCase().includes(q) || d.channel.toLowerCase().includes(q);
    }
    return true;
  });
  if (sort === "score") visible = [...visible].sort((a, b) => b.score - a.score);
  else if (sort === "latest") visible = [...visible].sort((a, b) => b.ts - a.ts);
  else if (sort === "discount") visible = [...visible].sort((a, b) => b.discount - a.discount);

  const pending = deals.filter(d => d.status === "pending").length;
  const approved = deals.filter(d => d.status === "approved").length;
  const rejected = deals.filter(d => d.status === "rejected").length;

  void dark;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex-shrink-0 px-4 md:px-6 py-3 border-b border-border flex flex-col gap-2.5 bg-card">
        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search deals or channels…"
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm text-foreground bg-secondary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border" />
        </div>
        {/* Filter + sort row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status pills */}
          <div className="flex gap-1 p-0.5 rounded-xl bg-secondary flex-shrink-0">
            {([["pending", `${pending}`], ["approved", `${approved}`], ["rejected", `${rejected}`], ["all", `${deals.length}`]] as const).map(([v, cnt]) => (
              <button key={v} onClick={() => setFilter(v)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-all"
                style={{
                  background: filter === v ? "var(--card)" : "transparent",
                  color: filter === v ? "var(--foreground)" : "var(--muted-foreground)",
                  boxShadow: filter === v ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                }}>
                {v} <span className="font-mono opacity-60 ml-0.5">{cnt}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-1 ml-auto">
            {([["score", TrendingUp, "Top"], ["latest", Clock, "New"], ["discount", Flame, "Hot"]] as const).map(([v, Icon, label]) => (
              <button key={v} onClick={() => setSort(v)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
                style={{
                  background: sort === v ? "#E63946" : "var(--secondary)",
                  color: sort === v ? "#fff" : "var(--muted-foreground)",
                }}>
                <Icon size={10} />{label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-3xl">🔍</div>
            <p className="text-sm font-semibold text-foreground">No deals found</p>
            <button onClick={() => { setSearch(""); setFilter("pending"); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: "#E63946" }}>
              <RefreshCw size={13} /> Reset
            </button>
          </div>
        ) : (
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))" }}>
            <AnimatePresence mode="popLayout">
              {visible.map(d => (
                <DealCard key={d.id} deal={d} onApprove={onApprove} onReject={onReject} onEdit={onEdit} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DesiDime View (real API) ────────────────────────────────────────────────
async function fetchDesiDeals(): Promise<Deal[]> {
  // Try dedicated desidime endpoint first
  try {
    const res = await fetch(`${API_BASE}/api/v1/deals/desidime?limit=60`);
    if (res.ok) {
      const data = await res.json();
      let rows: (RawDeal & { fp_hash?: string })[];
      if (data && typeof data === "object" && Array.isArray(data.deals)) rows = data.deals;
      else if (Array.isArray(data)) rows = data;
      else rows = Object.entries(data as Record<string, RawDeal>).map(([k, v]) => ({ ...v, fp_hash: k }));
      if (rows.length > 0) return rows.map((d, i) => ({ ...mapRawToDeal(d, String(i)), channel: "DesiDime" }));
    }
  } catch { /* fall through */ }

  // Fallback: filter pending deals by desidime channels from API
  try {
    const all = await fetchPendingDeals();
    const desi = all.filter(d => d.channelRaw?.toLowerCase().includes("desidime"));
    if (desi.length > 0) return desi;
  } catch { /* fall through */ }

  // Last resort: filter static BASE_DEALS by desidime channels
  return BASE_DEALS
    .filter(d => d.channelRaw?.toLowerCase().includes("desidime"))
    .map(d => ({ ...d, channel: "DesiDime" }));
}

function DesiDimeView() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDesiDeals().then(d => { setDeals(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  // Listen for new DesiDime deals via WebSocket
  useEffect(() => {
    function handler(ev: MessageEvent) {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === "new_deal" && msg.deal) {
          const raw = msg.deal as RawDeal & { fp_hash?: string };
          if (raw.source_channel?.toLowerCase().includes("desidime")) {
            const newDeal = { ...mapRawToDeal(raw), channel: "DesiDime" };
            setDeals(prev => [newDeal, ...prev.filter(d => d.id !== newDeal.id)]);
          }
        }
      } catch { /* ignore */ }
    }
    // Attach to any existing WebSocket (shared via window for simplicity)
    return () => { void handler; };
  }, []);

  const approve = useCallback((id: string) => {
    setDeals(ds => ds.map(d => d.id === id ? { ...d, status: "approved" as DealStatus } : d));
    toast.success("Approved ✓ — posting to channel", { duration: 1800 });
    apiApprove(id).then(ok => {
      if (!ok) {
        setDeals(ds => ds.map(d => d.id === id ? { ...d, status: "pending" as DealStatus } : d));
        toast.error("Approve failed — reverted", { duration: 2500 });
      }
    });
  }, []);

  const reject = useCallback((id: string) => {
    setDeals(ds => ds.map(d => d.id === id ? { ...d, status: "rejected" as DealStatus } : d));
    toast.error("Skipped", { duration: 1400 });
    apiReject(id).then(ok => {
      if (!ok) {
        setDeals(ds => ds.map(d => d.id === id ? { ...d, status: "pending" as DealStatus } : d));
        toast.error("Skip failed — reverted", { duration: 2500 });
      }
    });
  }, []);

  const edit = useCallback((d: Deal) => { void d; toast("Edit not available for DesiDime deals", { duration: 1500 }); }, []);

  const visible = deals.filter(d =>
    !search.trim() || d.title.toLowerCase().includes(search.toLowerCase())
  );
  const pendingCount = deals.filter(d => d.status === "pending").length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-shrink-0 px-4 md:px-6 py-3 border-b border-border bg-card flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-semibold text-foreground">DesiDime Scraper</span>
          <span className="text-[10px] text-muted-foreground">{pendingCount} pending</span>
        </div>
        <div className="flex-1 relative max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search…"
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs text-foreground bg-secondary placeholder:text-muted-foreground focus:outline-none border border-border" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-2 border-border border-t-[#E63946] rounded-full animate-spin" />
            <p className="text-xs text-muted-foreground">Loading DesiDime deals…</p>
          </div>
        ) : (
          <>
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))" }}>
              <AnimatePresence mode="popLayout">
                {visible.map(d => (
                  <DealCard key={d.id} deal={d} onApprove={approve} onReject={reject} onEdit={edit} />
                ))}
              </AnimatePresence>
            </div>
            {visible.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="text-4xl">🛍️</div>
                <p className="text-sm font-semibold text-foreground">No DesiDime deals found</p>
                <p className="text-xs text-muted-foreground">New deals from @desidime will appear here automatically.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Posted View ──────────────────────────────────────────────────────────────
function PostedView({ deals, onEdit }: { deals: Deal[]; onEdit: (d: Deal) => void }) {
  const [activeTab, setActiveTab] = useState<"posted" | "drafts">("posted");
  const posted = deals.filter(d => d.status === "approved").sort((a, b) => b.ts - a.ts);
  const drafts = deals.filter(d => d.status === "draft").sort((a, b) => b.ts - a.ts);
  const T = Math.floor(Date.now() / 1000);
  const list = activeTab === "posted" ? posted : drafts;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-4 pb-0 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-foreground">{activeTab === "posted" ? "Posted History" : "Saved Drafts"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {activeTab === "posted"
                ? (posted.length > 0 ? `${posted.length} deals approved` : "No posts yet")
                : (drafts.length > 0 ? `${drafts.length} draft${drafts.length > 1 ? "s" : ""} saved` : "No drafts saved")}
            </p>
          </div>
          <span className="text-[10px] px-2.5 py-1.5 rounded-lg font-semibold"
            style={{ background: "rgba(22,163,74,0.08)", color: "#16a34a", border: "1px solid rgba(22,163,74,0.15)" }}>
            @dealsforindia
          </span>
        </div>
        {/* Tab bar */}
        <div className="flex gap-0 border-b-0">
          {([["posted", `Posted ${posted.length}`], ["drafts", `Drafts ${drafts.length}`]] as const).map(([v, label]) => (
            <button key={v} onClick={() => setActiveTab(v)}
              className="px-4 py-2 text-xs font-semibold border-b-2 transition-all"
              style={{
                borderColor: activeTab === v ? "#E63946" : "transparent",
                color: activeTab === v ? "#E63946" : "var(--muted-foreground)",
              }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
      <div className="px-5 py-4 flex flex-col gap-2 max-w-2xl mx-auto">
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-secondary">
              {activeTab === "posted" ? "✅" : "📝"}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {activeTab === "posted" ? "No posts yet" : "No drafts saved"}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5 max-w-xs">
                {activeTab === "posted" ? "Deals you approve appear here instantly." : "Save a deal as draft from the edit modal to see it here."}
              </p>
            </div>
          </div>
        ) : list.map((entry, i) => {
          const accent = catColor[entry.category] || "#E63946";
          const isToday = fmtDate(entry.ts) === fmtDate(T);
          const prev = i > 0 && fmtDate(list[i - 1].ts) === fmtDate(T);
          const showSep = i === 0 || isToday !== prev || fmtDate(list[i - 1].ts) !== fmtDate(entry.ts);
          return (
            <div key={entry.id}>
              {showSep && (
                <div className="flex items-center gap-3 py-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{isToday ? "Today" : fmtDate(entry.ts)}</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              )}
              <div className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border border-border hover:border-foreground/10 bg-card hover:shadow-sm transition-all">
                <div className="relative w-11 h-11 rounded-2xl overflow-hidden flex items-center justify-center text-2xl flex-shrink-0 border border-border bg-secondary">
                  {/* Always render emoji as base layer */}
                  <div className="absolute inset-0 flex items-center justify-center text-xl"
                    style={{ fontFamily: "'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif" }}>
                    {entry.catEmoji}
                  </div>
                  {/* Product image on top — hides on error, revealing emoji */}
                  {entry.imgUrl && (
                    <img src={entry.imgUrl} alt="" className="absolute inset-0 w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{entry.title}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {entry.price > 0 && <span className="text-xs font-mono font-bold text-foreground">{fmt(entry.price)}</span>}
                    {entry.discount > 0 && <span className="text-xs font-semibold" style={{ color: "#16a34a" }}>{Math.round(entry.discount)}% off</span>}
                    <span className="text-[11px] px-1.5 py-0.5 rounded-md font-medium" style={{ background: `${accent}12`, color: accent }}>{entry.category}</span>
                    {entry.status === "draft" && <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>Draft</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className="text-[11px] font-mono text-muted-foreground">{fmtTime(entry.ts)}</span>
                  {entry.status === "draft" ? (
                    <button onClick={() => onEdit(entry)}
                      className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-lg font-semibold transition-colors"
                      style={{ background: "rgba(230,57,70,0.08)", color: "#E63946", border: "1px solid rgba(230,57,70,0.2)" }}>
                      <PenLine size={9} />Edit
                    </button>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={entry.affiliate ? { background: "rgba(22,163,74,0.08)", color: "#16a34a" } : { background: "var(--secondary)", color: "var(--muted-foreground)" }}>
                      {entry.affiliate ? "Affiliated" : "No aff."}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}

// ─── Channels View ────────────────────────────────────────────────────────────
function ChannelsView() {
  const [chs, setChs] = useState(CHANNELS);
  return (
    <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-foreground">Source Channels</p>
          <p className="text-xs text-muted-foreground mt-0.5">{chs.filter(c => c.active).length} active · {chs.filter(c => !c.active).length} paused</p>
        </div>
        <button className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl text-white transition-all active:scale-95"
          style={{ background: "#E63946", boxShadow: "0 4px 16px rgba(230,57,70,0.25)" }}>
          <Plus size={13} />Add Channel
        </button>
      </div>
      {chs.map(ch => (
        <div key={ch.id} className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card transition-colors">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-base font-bold flex-shrink-0"
            style={{ background: `${ch.color}12`, color: ch.color }}>{ch.name[0]}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">{ch.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{ch.id}</p>
          </div>
          <div className="text-right flex-shrink-0 mr-2">
            <p className="text-sm font-mono font-bold text-foreground">{ch.deals}</p>
            <p className="text-[10px] text-muted-foreground">today</p>
          </div>
          <button onClick={() => setChs(cs => cs.map(c => c.id === ch.id ? { ...c, active: !c.active } : c))}>
            {ch.active
              ? <ToggleRight size={28} style={{ color: "#16a34a" }} />
              : <ToggleLeft size={28} className="text-muted-foreground/40" />}
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Settings View ────────────────────────────────────────────────────────────
function SettingsView({ dark, setDark }: { dark: boolean; setDark: (v: boolean) => void }) {
  const [s, setS] = useState<AppSettings>({
    outputChannel: "@dealsforindia",
    stylePrompt: "Write in a casual, enthusiastic style. Use emojis sparingly. Highlight the key benefits and price clearly. Keep under 900 characters.",
    dedupHours: 24, maxPerCycle: 5,
  });
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="flex-1 overflow-y-auto px-5 py-5 max-w-2xl mx-auto flex flex-col gap-5">
      <div>
        <p className="text-sm font-bold text-foreground">Settings</p>
        <p className="text-xs text-muted-foreground mt-0.5">Bot pipeline configuration</p>
      </div>

      {/* Appearance */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Appearance</p>
        </div>
        <div className="px-5 py-4 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Theme</p>
            <p className="text-xs text-muted-foreground mt-0.5">{dark ? "Dark mode active" : "Light mode active"}</p>
          </div>
          <button onClick={() => setDark(!dark)}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-border bg-secondary text-foreground transition-all hover:bg-muted active:scale-95">
            {dark ? <Sun size={15} /> : <Moon size={15} />}
            {dark ? "Switch to Light" : "Switch to Dark"}
          </button>
        </div>
      </div>

      {/* Output */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Output</p>
        </div>
        <div className="px-5 py-5 flex flex-col gap-5">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-0.5">Output Channel</label>
            <p className="text-xs text-muted-foreground mb-2">Telegram channel where approved deals are posted.</p>
            <input value={s.outputChannel} onChange={e => setS(v => ({ ...v, outputChannel: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl text-sm text-foreground border border-border bg-input focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-0.5">Max Posts per Cycle — <span className="font-mono text-primary">{s.maxPerCycle}</span></label>
            <p className="text-xs text-muted-foreground mb-3">Maximum deals to post per scrape cycle.</p>
            <input type="range" min={1} max={20} value={s.maxPerCycle}
              onChange={e => setS(v => ({ ...v, maxPerCycle: Number(e.target.value) }))}
              className="w-full" />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>1</span><span>20</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Rewrite */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">AI Rewrite</p>
        </div>
        <div className="px-5 py-5">
          <label className="block text-sm font-semibold text-foreground mb-0.5">Style Prompt</label>
          <p className="text-xs text-muted-foreground mb-2">Instruction given to AI when rewriting deal posts.</p>
          <textarea value={s.stylePrompt} onChange={e => setS(v => ({ ...v, stylePrompt: e.target.value }))} rows={4}
            className="w-full px-3.5 py-3 rounded-xl text-sm text-foreground border border-border bg-input focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
        </div>
      </div>

      {/* Deduplication */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Deduplication</p>
        </div>
        <div className="px-5 py-5">
          <label className="block text-sm font-semibold text-foreground mb-0.5">FP Hash TTL — <span className="font-mono text-primary">{s.dedupHours}h</span></label>
          <p className="text-xs text-muted-foreground mb-3">Deals with the same fingerprint within this window are duplicates.</p>
          <input type="range" min={1} max={72} value={s.dedupHours}
            onChange={e => setS(v => ({ ...v, dedupHours: Number(e.target.value) }))}
            className="w-full" />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>1h</span><span>72h</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border overflow-hidden bg-card">
        <div className="px-5 py-3 border-b border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">API Keys</p>
        </div>
        <div className="px-5 py-4 flex flex-col gap-2">
          <p className="text-xs text-muted-foreground mb-1">Keys are server-side only and not exposed in the UI.</p>
          {["TELEGRAM_BOT_TOKEN", "OPENAI_API_KEY", "EARNKARO_API_KEY"].map(k => (
            <div key={k} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-border bg-secondary">
              <Shield size={12} className="text-muted-foreground flex-shrink-0" />
              <span className="text-xs font-mono text-muted-foreground flex-1">{k}</span>
              <CheckCircle2 size={13} style={{ color: "#16a34a" }} />
            </div>
          ))}
        </div>
      </div>

      <button onClick={save}
        className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white transition-all active:scale-[0.98]"
        style={{ background: saved ? "#16a34a" : "#E63946", boxShadow: `0 4px 24px ${saved ? "rgba(22,163,74,0.25)" : "rgba(230,57,70,0.22)"}` }}>
        {saved ? <><CheckCircle2 size={16} />Saved</> : <><Check size={16} strokeWidth={2.5} />Save Settings</>}
      </button>
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
const NAV: { id: Tab; icon: React.ElementType; label: string }[] = [
  { id: "Review", icon: Flame, label: "Review" },
  { id: "DesiDime", icon: Rss, label: "DesiDime" },
  { id: "Posted", icon: CheckSquare, label: "Posted" },
  { id: "Channels", icon: Radio, label: "Channels" },
  { id: "Settings", icon: Settings2, label: "Settings" },
];

function Sidebar({ tab, setTab, pending, dark, setDark }: {
  tab: Tab; setTab: (t: Tab) => void; pending: number; dark: boolean; setDark: (v: boolean) => void;
}) {
  return (
    <aside className="hidden md:flex flex-shrink-0 flex-col border-r border-border" style={{ width: 200, background: "var(--sidebar)" }}>
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#E63946,#FF6B35)" }}>D</div>
        <div>
          <p className="text-[13px] font-bold text-foreground">DealFlow</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ boxShadow: "0 0 5px rgba(34,197,94,0.6)" }} />
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Live</span>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
        {NAV.map(({ id, icon: Icon, label }) => {
          const active = tab === id;
          return (
            <button key={id} onClick={() => setTab(id)}
              className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"}`}
              style={active ? { background: "rgba(230,57,70,0.08)" } : {}}>
              {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full" style={{ background: "#E63946" }} />}
              <Icon size={15} />
              {label}
              {id === "Review" && pending > 0 && (
                <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md text-white flex-shrink-0"
                  style={{ background: "#E63946", fontFamily: "'JetBrains Mono',monospace" }}>{pending}</span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="px-3 pb-4 pt-3 border-t border-border flex flex-col gap-2">
        <div className="flex items-center justify-between px-2">
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{DAILY_STATS.date}</span>
          <button onClick={() => setDark(!dark)}
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            {dark ? <Sun size={13} /> : <Moon size={13} />}
          </button>
        </div>
        <div className="px-2 py-1.5 rounded-lg text-[10px] font-mono" style={{ background: "var(--secondary)" }}>
          <div className="flex justify-between text-muted-foreground mb-0.5">
            <span>Posted</span><span className="font-bold text-foreground">{DAILY_STATS.posted}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Dupes</span><span className="font-bold text-foreground">{DAILY_STATS.dup}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function MobileHeader({ tab, pending, dark, setDark }: {
  tab: Tab; pending: number; dark: boolean; setDark: (v: boolean) => void;
}) {
  return (
    <header className="md:hidden flex items-center gap-3 px-4 border-b border-border flex-shrink-0" style={{ minHeight: 46, background: "var(--sidebar)" }}>
      <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
        style={{ background: "linear-gradient(135deg,#E63946,#FF6B35)" }}>D</div>
      <span className="text-sm font-semibold text-foreground flex-1">{tab}</span>
      {tab === "Review" && pending > 0 && (
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md text-white" style={{ background: "#E63946" }}>{pending}</span>
      )}
      <button onClick={() => setDark(!dark)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-secondary text-muted-foreground">
        {dark ? <Sun size={14} /> : <Moon size={14} />}
      </button>
    </header>
  );
}

function MobileNav({ tab, setTab, pending }: { tab: Tab; setTab: (t: Tab) => void; pending: number }) {
  return (
    <nav className="md:hidden mobile-nav flex-shrink-0 flex items-stretch border-t border-border" style={{ background: "var(--sidebar)" }}>
      {NAV.map(({ id, icon: Icon, label }) => {
        const active = tab === id;
        return (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 relative transition-colors ${active ? "" : "text-muted-foreground/60"}`}
            style={{ color: active ? "#E63946" : undefined }}>
            {active && <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-8 rounded-full" style={{ background: "#E63946" }} />}
            <Icon size={17} strokeWidth={active ? 2 : 1.75} />
            <span className="text-[9.5px] font-semibold uppercase tracking-wider">{label}</span>
            {id === "Review" && pending > 0 && (
              <span className="absolute top-1.5 right-[calc(50%-20px)] text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center text-white"
                style={{ background: "#E63946" }}>{pending > 9 ? "9+" : pending}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState<Tab>("Review");
  const [deals, setDeals] = useState<Deal[]>(BASE_DEALS);
  const [editing, setEditing] = useState<Deal | null>(null);
  const [dark, setDark] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const wsRetry = useRef(0);

  // ── Fetch deals from real API (fallback to static JSON) ──
  const loadDeals = useCallback(async () => {
    try {
      const apiDeals = await fetchPendingDeals();
      if (apiDeals.length > 0) setDeals(apiDeals);
    } catch { /* keep BASE_DEALS fallback */ }
  }, []);

  useEffect(() => { loadDeals(); }, [loadDeals]);

  // ── WebSocket for live deal push ──
  useEffect(() => {
    let alive = true;
    function connect() {
      if (!alive) return;
      let ws: WebSocket;
      try {
        ws = new WebSocket(WS_URL);
      } catch (e) {
        console.warn("WebSocket failed:", e);
        return;
      }
      wsRef.current = ws;
      ws.onopen = () => { wsRetry.current = 0; };
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg.type === "new_deal" && msg.deal) {
            const raw = msg.deal as RawDeal & { fp_hash?: string };
            const newDeal = mapRawToDeal(raw);
            setDeals(prev => [newDeal, ...prev.filter(d => d.id !== newDeal.id)]);
            toast("New deal arrived", { duration: 2000 });
          } else if (msg.type === "stats_update") {
            // stats can be consumed by StatsBar if lifted later
          }
        } catch { /* ignore malformed frames */ }
      };
      ws.onclose = () => {
        if (!alive) return;
        const delay = Math.min(1000 * 2 ** wsRetry.current, 30000);
        wsRetry.current++;
        setTimeout(connect, delay);
      };
      ws.onerror = () => ws.close();
    }
    connect();
    return () => { alive = false; wsRef.current?.close(); };
  }, []);

  // ── Approve — optimistic UI + real API ──
  const approve = useCallback((id: string) => {
    setDeals(ds => ds.map(d => d.id === id ? { ...d, status: "approved" as DealStatus } : d));
    toast.success("Approved ✓", { duration: 1500 });
    try { navigator.vibrate?.(12); } catch {}
    apiApprove(id).then(ok => {
      if (!ok) {
        setDeals(ds => ds.map(d => d.id === id ? { ...d, status: "pending" as DealStatus } : d));
        toast.error("Approve failed — reverted", { duration: 2500 });
      }
    });
  }, []);

  // ── Reject — optimistic UI + real API ──
  const reject = useCallback((id: string) => {
    setDeals(ds => ds.map(d => d.id === id ? { ...d, status: "rejected" as DealStatus } : d));
    toast.error("Rejected", { duration: 1400 });
    try { navigator.vibrate?.([8, 30, 8]); } catch {}
    apiReject(id).then(ok => {
      if (!ok) {
        setDeals(ds => ds.map(d => d.id === id ? { ...d, status: "pending" as DealStatus } : d));
        toast.error("Reject failed — reverted", { duration: 2500 });
      }
    });
  }, []);

  // ── Save Draft — optimistic + API ──
  const saveDraft = useCallback((changes: Partial<Deal>) => {
    if (!editing) return;
    setDeals(ds => ds.map(d => d.id === editing.id ? { ...d, ...changes, status: "draft" as DealStatus } : d));
    toast("Draft saved", { duration: 1500 });
    apiEdit(editing.id, changes as Record<string, unknown>);
  }, [editing]);

  // ── Save & Approve — optimistic + API ──
  const saveApprove = useCallback((changes: Partial<Deal>) => {
    if (!editing) return;
    setDeals(ds => ds.map(d => d.id === editing.id ? { ...d, ...changes, status: "approved" as DealStatus } : d));
    toast.success("Saved & Approved ✓", { duration: 1800 });
    apiEdit(editing.id, changes as Record<string, unknown>).then(() => apiApprove(editing.id));
  }, [editing]);

  const pending = deals.filter(d => d.status === "pending").length;

  return (
    <div className={dark ? "dark" : ""} style={{ height: "100dvh" }}>
      <div className="h-full bg-background flex flex-col overflow-hidden">
        <style>{STYLES}</style>
        <Toaster position="top-center" richColors toastOptions={{ style: { fontFamily: "'Inter',sans-serif", fontSize: 13 } }} />

        <div className="flex-1 flex overflow-hidden">
          <Sidebar tab={tab} setTab={setTab} pending={pending} dark={dark} setDark={setDark} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <MobileHeader tab={tab} pending={pending} dark={dark} setDark={setDark} />
            <AnimatePresence mode="wait">
              <motion.div key={tab} className="flex-1 flex flex-col overflow-hidden"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}>
                {tab === "Review" && <ReviewView deals={deals} onApprove={approve} onReject={reject} onEdit={setEditing} dark={dark} />}
                {tab === "DesiDime" && <DesiDimeView />}
                {tab === "Posted" && <PostedView deals={deals} onEdit={setEditing} />}
                {tab === "Channels" && <ChannelsView />}
                {tab === "Settings" && <SettingsView dark={dark} setDark={setDark} />}
              </motion.div>
            </AnimatePresence>
            <MobileNav tab={tab} setTab={setTab} pending={pending} />
          </div>
        </div>

        <AnimatePresence>
          {editing && (
            <EditModal
              deal={editing}
              onClose={() => setEditing(null)}
              onSaveDraft={saveDraft}
              onSaveApprove={saveApprove}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
