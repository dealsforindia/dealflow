import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast, Toaster } from "sonner";
import {
  Check, X, Search, Sun, Moon, Zap, Tag, Settings2, Radio,
  CheckSquare, Plus, PenLine, Upload, Sparkles,
  Undo2, ExternalLink, Shield,
  Clock, TrendingUp, Flame, RefreshCw, CheckCircle2,
  Maximize2, Copy, Link as LinkIcon, FileText,
  Globe, ArrowUpRight, ShoppingCart, Percent,
  Layers, Send, CheckCheck
} from "lucide-react";

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

interface AppSettings {
  outputChannel: string; stylePrompt: string; dedupHours: number; maxPerCycle: number;
}

// ─── Data & Helpers ───────────────────────────────────────────────────────────
const extractEmoji = (cat: string) => cat.split(" ")[0] || "🛍️";
const extractCatName = (cat: string) => cat.split(" ").slice(1).join(" ") || cat;

const ID_TO_URL: Record<string, string> = {
  "-1001837130426": "https://t.me/+emveIa6ZQxoxYjAx",       // Crazy Deals
  "-1002260825044": "https://t.me/c/2260825044",             // DealDrops
  "-1002072521956": "https://t.me/dealspoint",               // Dealspoint Premium
  "-1001346861267": "https://t.me/+OylJYrIZZHBzZjRi",       // DealzTrendz
  "-1001782814661": "https://t.me/+fJX-MfWphoNiZDU6",       // DealzTrendz 2.0
  "-1001218727546": "https://t.me/DesidimeHot",              // DesiDime - Handpicked Deals
  "-1001480964161": "https://t.me/realearnkaro",             // EarnKaro
  "-1001389782464": "https://t.me/extrape",                  // ExtraPe
  "-1001921484161": "https://t.me/+tcoZTg6IJWl4ZDRI",       // FET (Deals & Tricks)
  "-1002152564226": "https://t.me/addlist/RBY7rxcO-T03MjE1",// Fitness Finds by SQ
  "-1001423395942": "https://t.me/+VNdMZqz_NhKNNXvsG",      // Free Earning Tech
  "-1002617619168": "https://t.me/+VNdMZqz_NhKNNXvsG",      // Free Earning Tech (Alt)
  "-1001955834193": "https://t.me/+JpTJUwE9J9A1NDE1",       // Genie All Deals
  "-1001268661047": "https://t.me/c/1944516766",             // Genie Loot
  "-1001667757195": "https://t.me/+Io8OVRMkSVs5YzI1",       // Genie Tricks
  "-1002365543574": "https://t.me/glamhauldiaries",          // Glam Haul Diaries
  "-1001589506039": "https://t.me/LootDealsApp",             // Loot Deals App
  "-1001315464303": "https://t.me/+LQ3FigpMfmAyZGJl",       // Offerzone 2.0
  "-1001707571730": "https://t.me/+kTvbwlaPbH1mM2E1",       // Offerzone 3.0
  "-1002393042058": "https://t.me/+FpXKV70NYNY0NzQ1",       // Offerzone 4.0
  "-1001702197669": "https://t.me/+uV5wcTkUWJEwM2Y1",       // Offerzone Tricks
  "-1003866659228": "https://t.me/+4DwYqc6QfXhiMTI1",       // OZ Loot Bazaar
  "-1003516611384": "https://t.me/c/2157774706",             // OZ Loot Deals
  "-1003871814319": "https://t.me/bblbblp",                  // Private Deals From All
  "-1001927095270": "https://t.me/addlist/RBY7rxcO-T03MjE1",// Shoppers Quest 2.0
  "-1001786042652": "https://t.me/+958_Lu4ZoUxM2E9",        // Shopping Genie
  "-1001450755585": "https://t.me/Loot_DealsX",             // Trending Loot Deals
  "-1001357275556": "https://t.me/Technicalsheikh",          // Technical Sheikh
  "-1001900048971": "https://t.me/realearnkaro",             // EarnKaro Official
  "-1001447952139": "https://t.me/ShoppersQuest",            // Shoppers Quest
};

const toChName = (ch?: string): string => {
  if (!ch) return "Unknown";
  if (ch.includes("emveIa6ZQxoxYjAx")) return "Crazy Deals";
  if (ch.includes("2260825044")) return "DealDrops";
  if (ch.includes("@dealspoint") || ch.includes("dealspoint")) return "Dealspoint Premium";
  if (ch.includes("OylJYrIZZHBzZjRi")) return "DealzTrendz";
  if (ch.includes("fJX-MfWphoNiZDU6")) return "DealzTrendz 2.0";
  if (ch.includes("@DesidimeHot") || ch.includes("DesidimeHot")) return "DesiDime Handpicked Deals";
  if (ch.includes("@realearnkaro") || ch.includes("realearnkaro")) return "EarnKaro";
  if (ch.includes("@extrape") || ch.includes("extrape")) return "ExtraPe";
  if (ch.includes("tcoZTg6IJWl4ZDRI")) return "FET (Deals & Tricks)";
  if (ch.includes("RBY7rxcO-T03MjE1")) return "Fitness Finds & Shoppers Quest";
  if (ch.includes("VNdMZqz_NhKNNXvsG")) return "Free Earning Tech";
  if (ch.includes("JpTJUwE9J9A1NDE1")) return "Genie All Deals";
  if (ch.includes("1268661047")) return "Genie Loot";
  if (ch.includes("Io8OVRMkSVs5YzI1")) return "Genie Tricks";
  if (ch.includes("@glamhauldiaries") || ch.includes("glamhauldiaries")) return "Glam Haul Diaries";
  if (ch.includes("@lootdealsapp") || ch.includes("lootdealsapp")) return "Loot Deals App";
  if (ch.includes("LQ3FigpMfmAyZGJl")) return "Offerzone 2.0";
  if (ch.includes("kTvbwlaPbH1mM2E1")) return "Offerzone 3.0";
  if (ch.includes("FpXKV70NYNY0NzQ1")) return "Offerzone 4.0";
  if (ch.includes("uV5wcTkUWJEwM2Y1")) return "Offerzone Tricks";
  if (ch.includes("4DwYqc6QfXhiMTI1")) return "OZ Loot Bazaar";
  if (ch.includes("3516611384")) return "OZ Loot Deals";
  if (ch.includes("@bblbblp") || ch.includes("bblbblp")) return "Private Deals From All";
  if (ch.includes("958_Lu4ZoUxM2E9")) return "Shopping Genie";
  if (ch.includes("@Technicalsheikh") || ch.includes("Technicalsheikh")) return "Technical Sheikh";
  if (ch.includes("@Loot_DealsX") || ch.includes("Loot_DealsX")) return "Trending Loot Deals";
  if (ch.includes("offerzone")) return "Offerzone";
  if (ch.includes("desidime")) return "Desidime";
  if (ch.includes("shopquest")) return "Shoppers Quest";
  
  if (ch.startsWith("@")) return ch.substring(1);
  return ch;
};

const buildVerdict = (s: number | null) =>
  s === null ? "Unrated — review manually." :
  s >= 8 ? "🔥 Exceptional deal — prime recommendation." :
  s >= 6 ? "⚡ Strong deal — high confidence." :
  s >= 4 ? "👀 Decent discount — worth reviewing." : "⚠️ Low score — check genuine price.";

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

const API_BASE = import.meta.env.PROD ? "https://api.rudranil.me" : (import.meta.env.VITE_API_URL || "");

const BASE_DEALS: Deal[] = [];

const DAILY_STATS = dailyStatsRaw as {
  date: string; posted: number; checked: number; dup: number;
  unrated: number; affiliate: number; auto_posted: number; scam: number;
};

// ─── Formatting & Colors ──────────────────────────────────────────────────────
const fmt = (p: number) => p === 0 ? "Free" : `₹${p.toLocaleString("en-IN")}`;
const fmtAgo = (ts: number) => {
  const d = Math.floor(Date.now() / 1000 - ts);
  if (d < 60) return `${d}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  return `${Math.floor(d / 3600)}h ago`;
};

const scoreColor = (s: number) => s === 0 ? "#64748B" : s >= 75 ? "#10B981" : s >= 50 ? "#F59E0B" : "#EF4444";

const catColor: Record<string, string> = {
  Electronics: "#8B5CF6", Fashion: "#EC4899", "Home & Kitchen": "#F59E0B",
  Home: "#F59E0B", Beauty: "#F472B6", Sports: "#10B981", Banking: "#3B82F6",
  Food: "#F97316", Computers: "#06B6D4", General: "#64748B", Grocery: "#10B981",
  Travel: "#06B6D4", Books: "#EAB308", Kids: "#F97316", Gaming: "#8B5CF6",
};

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

const getStoreBadge = (platforms: string[] = [], url: string = "") => {
  const platStr = (platforms.join(" ") + " " + url).toLowerCase();
  if (platStr.includes("amazon") || platStr.includes("amzn")) {
    return { name: "Amazon", bg: "from-amber-500/20 to-orange-500/20", border: "border-amber-500/30", text: "text-amber-300" };
  }
  if (platStr.includes("flipkart") || platStr.includes("fkrt")) {
    return { name: "Flipkart", bg: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30", text: "text-blue-300" };
  }
  if (platStr.includes("myntra")) {
    return { name: "Myntra", bg: "from-pink-500/20 to-rose-500/20", border: "border-pink-500/30", text: "text-pink-300" };
  }
  if (platStr.includes("ajio")) {
    return { name: "AJIO", bg: "from-purple-500/20 to-indigo-500/20", border: "border-purple-500/30", text: "text-purple-300" };
  }
  if (platStr.includes("desidime")) {
    return { name: "DesiDime", bg: "from-red-500/20 to-orange-500/20", border: "border-red-500/30", text: "text-red-300" };
  }
  return { name: platforms[0] || "Store", bg: "from-slate-500/20 to-slate-600/20", border: "border-slate-500/30", text: "text-slate-300" };
};

const aiRewriteSim = (text: string, inst: string): string => {
  const i = inst.toLowerCase();
  if (i.includes("short") || i.includes("concise")) return text.split("\n").slice(0, 8).join("\n");
  if (i.includes("emoji")) return "🔥 " + text;
  if (i.includes("clean")) return text.replace(/#\S+/g, "").replace(/\n{3,}/g, "\n\n").trim();
  return text + "\n\n⚡ Limited time — grab it fast!";
};

const WS_URL = import.meta.env.PROD ? "wss://api.rudranil.me/ws" : (import.meta.env.VITE_WS_URL || `${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}/ws`);

// ─── API Helpers ──────────────────────────────────────────────────────────────
function mapRawToDeal(d: RawDeal & { fp_hash?: string }, fallbackId?: string): Deal {
  const id = d.fp_hash ?? fallbackId ?? String(d.ts);
  return {
    id, title: d.prod_name || "Untitled Deal",
    price: d.prices.sale ?? 0, mrp: d.prices.mrp ?? 0,
    discount: d.prices.discount_pct ?? 0,
    category: extractCatName(d.category), catEmoji: extractEmoji(d.category),
    channel: toChName(d.source_channel), channelRaw: d.source_channel,
    score: (d.score !== null && d.score !== undefined) ? Math.min(100, Math.round(d.score * 10)) : 0,
    ts: Math.floor(d.ts), status: "pending" as DealStatus,
    dealType: (d.deal_type === "trick" ? "trick" : "product") as DealType,
    affiliate: d.affiliate_applied, coupon: d.coupon,
    imgUrl: (() => {
      if (d.img_url && !d.img_url.includes("74.225.250.0")) return d.img_url;
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
  const [pendingRes, recentRes] = await Promise.all([
    fetch(`${API_BASE}/api/v1/deals/pending?limit=1000`).catch(() => null),
    fetch(`${API_BASE}/api/v1/deals/recent?limit=300`).catch(() => null),
  ]);

  let rows: (RawDeal & { fp_hash?: string; _forceStatus?: DealStatus })[] = [];
  if (pendingRes?.ok) {
    const data = await pendingRes.json();
    const list = Array.isArray(data?.deals) ? data.deals : Array.isArray(data) ? data : [];
    rows = rows.concat(list.map((d: any) => ({ ...d, _forceStatus: "pending" as DealStatus })));
  }
  if (recentRes?.ok) {
    const data = await recentRes.json();
    const list = Array.isArray(data?.deals) ? data.deals : Array.isArray(data) ? data : [];
    rows = rows.concat(list.map((d: any) => ({ ...d, _forceStatus: "approved" as DealStatus })));
  }

  return rows.map((d, i) => {
    const deal = mapRawToDeal(d, String(i));
    if (d._forceStatus) deal.status = d._forceStatus;
    return deal;
  }).sort((a, b) => b.ts - a.ts);
}

function mapChangesToBackend(changes: Record<string, unknown>): Record<string, unknown> {
  const mapped: Record<string, unknown> = {};
  if ("title" in changes) mapped.prod_name = changes.title;
  if ("affText" in changes) mapped.aff_text = changes.affText;
  if ("imgUrl" in changes) mapped.img_url = changes.imgUrl;
  if ("price" in changes || "mrp" in changes) {
    mapped.prices = {
      sale: changes.price != null ? Number(changes.price) : undefined,
      mrp: changes.mrp != null ? Number(changes.mrp) : undefined,
    };
  }
  if ("coupon" in changes) mapped.coupon = changes.coupon;
  if ("category" in changes) mapped.category = changes.category;
  for (const k of ["prod_name", "aff_text", "img_url", "prices", "message"]) {
    if (k in changes && !(k in mapped)) mapped[k] = changes[k];
  }
  return mapped;
}

async function apiApprove(id: string, changes?: Record<string, unknown>): Promise<boolean> {
  try {
    const payload = changes ? mapChangesToBackend(changes) : {};
    const res = await fetch(`${API_BASE}/api/v1/deals/${id}/approve`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch { return false; }
}

async function apiReject(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/deals/${id}/reject`, { method: "PUT" });
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

async function apiRetryAffiliate(id: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/deals/${id}/retry-affiliate`, { method: "POST" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.text || data.affiliate_text || null;
  } catch { return null; }
}

async function apiScrapeImage(id: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/deals/${id}/scrape-image`, { method: "POST" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url || data.image_url || null;
  } catch { return null; }
}

// ─── Score Gauge ──────────────────────────────────────────────────────────────
function ScoreRing({ score = 0, size = 38 }: { score?: number; size?: number; verdict?: string }) {
  if (!score || isNaN(score) || score === 0) return null;
  const r = (size - 6) / 2, circ = 2 * Math.PI * r, color = scoreColor(score);
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={3.5} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={3.5}
          strokeDasharray={`${(score / 100) * circ} ${circ}`} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color}99)` }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span style={{ fontSize: size < 40 ? 10 : 12, color, fontFamily: "'JetBrains Mono',monospace", fontWeight: 800 }}>
          {score}
        </span>
      </div>
    </div>
  );
}

// ─── Image Lightbox ───────────────────────────────────────────────────────────
function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-2xl"
      style={{ background: "rgba(3, 4, 8, 0.92)" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}>
      <motion.img src={src} alt="" className="max-w-[92vw] max-h-[86dvh] object-contain rounded-2xl border border-white/10"
        style={{ boxShadow: "0 0 80px rgba(0,0,0,0.8)" }}
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 320 }}
        onClick={e => e.stopPropagation()} />
      <button className="absolute top-5 right-5 w-11 h-11 rounded-full flex items-center justify-center bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/15"
        onClick={onClose}><X size={18} /></button>
      <p className="absolute bottom-6 text-xs text-white/40 font-medium">Click anywhere outside to dismiss</p>
    </motion.div>
  );
}

// ─── Modern Deal Card ─────────────────────────────────────────────────────────
function DealCard({ deal, onApprove, onReject, onEdit }: {
  deal: Deal; onApprove: (id: string) => void;
  onReject: (id: string) => void; onEdit: (d: Deal) => void;
}) {
  const [imgErr, setImgErr] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const accent = catColor[deal.category] || "#64748B";
  const store = getStoreBadge(deal.platforms, deal.affText);
  const savings = deal.mrp && deal.price && deal.mrp > deal.price ? deal.mrp - deal.price : 0;

  return (
    <motion.div layout
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: "spring", damping: 24, stiffness: 300 }}
      className="glass-card rounded-2xl overflow-hidden flex flex-col group relative"
      style={{
        borderTop: `2px solid ${accent}`,
      }}>

      <AnimatePresence>{lightbox && deal.imgUrl && <ImageLightbox src={deal.imgUrl} onClose={() => setLightbox(false)} />}</AnimatePresence>

      {/* Image Showcase */}
      <div className="relative overflow-hidden cursor-zoom-in flex-shrink-0 bg-slate-950/60"
        style={{ height: 168 }}
        onClick={() => !imgErr && deal.imgUrl && setLightbox(true)}>
        
        {deal.imgUrl && !imgErr ? (
          <>
            {/* Main Product Image */}
            <img src={deal.imgUrl} alt={deal.title}
              className="absolute inset-0 w-full h-full object-contain p-3 z-10 group-hover:scale-105 transition-transform duration-300 ease-out"
              onError={() => setImgErr(true)} />

            {/* Ambient Background Glow */}
            <img src={deal.imgUrl} alt="" aria-hidden
              className="absolute inset-0 w-full h-full object-cover opacity-15 filter blur-xl saturate-200 z-0"
              onError={() => setImgErr(true)} />

            {/* Expand Hover Hint */}
            <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-[2px]">
              <div className="p-2 rounded-xl bg-black/60 text-white/90 border border-white/10 shadow-lg">
                <Maximize2 size={16} />
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-500">
            <span className="text-4xl filter drop-shadow-md">{deal.catEmoji}</span>
            <span className="text-[10px] font-medium tracking-wider uppercase opacity-60">No Media</span>
          </div>
        )}

        {/* Top Badges: Store + Discount */}
        <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 flex-wrap">
          {/* Store Brand Badge */}
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold bg-gradient-to-r ${store.bg} border ${store.border} ${store.text} backdrop-blur-md shadow-sm`}>
            {store.name}
          </span>

          {/* Glowing Discount Flame Pill */}
          {deal.discount > 0 && (
            <span className="px-2 py-0.5 rounded-lg text-white font-extrabold text-[10px] flex items-center gap-0.5 glow-pill-primary font-mono tracking-tight">
              <Flame size={10} className="fill-white" />
              {Math.round(deal.discount)}% OFF
            </span>
          )}
        </div>

        {/* Top Right: AI Quality Score */}
        <div className="absolute top-2 right-2 z-20">
          <ScoreRing score={deal.score} size={34} />
        </div>

        {/* Bottom Bar: Category & Affiliate */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between pointer-events-none">
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950/80 text-slate-300 backdrop-blur-md border border-white/10 font-semibold shadow-sm">
            {deal.catEmoji} {deal.category}
          </span>

          {deal.affiliate && (
            <span className="w-5 h-5 rounded-full bg-emerald-500/90 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 border border-emerald-300/40" title="Affiliate Monetized">
              <Zap size={10} className="fill-white" />
            </span>
          )}
        </div>

        {/* Status Overlays */}
        {deal.status === "approved" && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-emerald-950/85 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-1 text-emerald-400 font-bold text-xs">
              <CheckCircle2 size={32} className="text-emerald-400 drop-shadow-lg" />
              <span>Broadcasted</span>
            </div>
          </div>
        )}
        {deal.status === "rejected" && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-rose-950/85 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-1 text-rose-400 font-bold text-xs">
              <X size={32} className="text-rose-400 drop-shadow-lg" />
              <span>Skipped</span>
            </div>
          </div>
        )}
      </div>

      {/* Deal Details & Content */}
      <div className="flex flex-col flex-1 p-3.5 gap-2.5">
        <h4 className="text-[13px] font-semibold text-white/95 leading-snug line-clamp-2 min-h-[36px]" title={deal.title}>
          {deal.title}
        </h4>

        {/* Price & Savings Delta */}
        <div className="flex items-baseline gap-2 flex-wrap">
          {deal.price > 0 ? (
            <>
              <span className="text-[18px] font-extrabold text-emerald-400 font-mono tracking-tight leading-none">
                {fmt(deal.price)}
              </span>
              {deal.mrp > 0 && deal.mrp > deal.price && (
                <span className="text-[11px] text-slate-400 line-through font-mono">
                  {fmt(deal.mrp)}
                </span>
              )}
              {savings > 0 && (
                <span className="text-[10px] font-semibold text-emerald-300/80 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  Save ₹{savings.toLocaleString("en-IN")}
                </span>
              )}
            </>
          ) : (
            <span className="text-xs font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              ⚡ Trick / Freebie
            </span>
          )}
        </div>

        {/* Coupon Code Pill */}
        {deal.coupon && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 w-fit">
            <Tag size={10} className="text-amber-400" />
            <span className="text-[10px] font-bold font-mono text-amber-300">{deal.coupon}</span>
          </div>
        )}

        {/* Channel & Timestamp */}
        <div className="flex items-center gap-2 mt-auto pt-2 border-t border-white/5 text-slate-400">
          <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-extrabold text-white flex-shrink-0"
            style={{ background: accent }}>
            {deal.channel[0]}
          </div>
          <span className="text-[11px] font-medium truncate flex-1 text-slate-300">{deal.channel}</span>
          <span className="text-[10px] text-slate-500 flex-shrink-0 font-mono">{fmtAgo(deal.ts)}</span>
        </div>

        {/* Action Buttons */}
        {deal.status === "pending" ? (
          <div className="flex items-center gap-1.5 pt-1">
            <button onClick={() => onReject(deal.id)}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-rose-500/10 border border-rose-500/25 text-rose-400 hover:bg-rose-500 hover:text-white transition-all active:scale-95 shadow-sm"
              title="Skip Deal">
              <X size={15} strokeWidth={2.5} />
            </button>
            <button onClick={() => onEdit(deal)}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/5 border border-white/10 text-slate-300 hover:bg-white/15 hover:text-white transition-all active:scale-95 shadow-sm"
              title="Edit & Tune">
              <PenLine size={13} />
            </button>
            <button onClick={() => onApprove(deal.id)}
              className="flex-1 h-9 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 glow-pill-success hover:opacity-95 transition-all active:scale-95 shadow-md">
              <Check size={14} strokeWidth={3} /> Approve
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 pt-1">
            <div className={`flex-1 text-center text-[11px] font-bold py-1.5 rounded-xl border ${deal.status === "approved" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-rose-500/15 text-rose-400 border-rose-500/30"}`}>
              {deal.status === "approved" ? "✓ Approved" : "✗ Skipped"}
            </div>
            <button onClick={() => onEdit(deal)}
              className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors" title="Edit">
              <PenLine size={12} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Edit Modal (Live Telegram Preview) ────────────────────────────────────────
interface EditModalProps {
  deal: Deal;
  onClose: () => void;
  onSaveDraft: (changes: Partial<Deal>) => void;
  onSaveApprove: (changes: Partial<Deal>) => void;
  onToast: (msg: string, type?: "success" | "error" | "info") => void;
}

function EditModal({ deal, onClose, onSaveDraft, onSaveApprove, onToast }: EditModalProps) {
  const [title, setTitle] = useState(deal.title);
  const [price, setPrice] = useState(String(deal.price || ""));
  const [mrp, setMrp] = useState(String(deal.mrp || ""));
  const [text, setText] = useState(deal.affText);
  const [imgUrl, setImgUrl] = useState(deal.imgUrl);
  const [imgFile, setImgFile] = useState<string | null>(null);
  const [instruction, setInstruction] = useState("");
  const [rewriting, setRewriting] = useState(false);
  const [prev, setPrev] = useState<string | null>(null);
  const [retryingAffiliate, setRetryingAffiliate] = useState(false);
  const [scrapingImage, setScrapingImage] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const previewSrc = imgFile || imgUrl || null;
  const isDirty = title !== deal.title || price !== String(deal.price || "") || imgUrl !== deal.imgUrl || text !== deal.affText;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setImgFile(ev.target?.result as string); };
    reader.readAsDataURL(f);

    const fd = new FormData();
    fd.append("file", f);
    try {
      const res = await fetch(`${API_BASE}/api/v1/deals/${deal.id}/image`, { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        setImgUrl(data.img_url);
        onToast("Image uploaded!", "success");
      }
    } catch {
      onToast("Image upload failed", "error");
    }
  };

  const doRewrite = async () => {
    if (!instruction.trim()) return;
    setRewriting(true);
    setPrev(text);
    const result = await apiAiRewrite(deal.id, instruction);
    setText(result ?? aiRewriteSim(text, instruction));
    setInstruction("");
    setRewriting(false);
  };

  const doRetryAffiliate = async () => {
    setRetryingAffiliate(true);
    const result = await apiRetryAffiliate(deal.id);
    if (result) { setText(result); onToast("Affiliate link updated", "success"); }
    else onToast("Retry affiliate failed", "error");
    setRetryingAffiliate(false);
  };

  const doScrapeImage = async () => {
    setScrapingImage(true);
    const result = await apiScrapeImage(deal.id);
    if (result) { setImgUrl(result); setImgFile(null); onToast("Image scraped", "success"); }
    else onToast("Image scrape failed", "error");
    setScrapingImage(false);
  };

  const changes: Partial<Deal> = {
    title, imgUrl: imgFile || imgUrl,
    price: Number(price) || deal.price,
    mrp: Number(mrp) || deal.mrp,
    affText: text,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl"
      style={{ background: "rgba(4, 5, 10, 0.85)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      
      <div className="w-full max-w-4xl max-h-[92dvh] flex flex-col rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center glow-pill-primary">
              <PenLine size={16} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Edit & Review Deal</h3>
              <p className="text-[11px] text-slate-400">{deal.channel} · Source: {deal.channelRaw}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ScoreRing score={deal.score} size={32} />
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/10">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Body Split View */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-0">
          {/* Left Form Controls */}
          <div className="md:col-span-7 p-5 flex flex-col gap-4 border-r border-white/10">
            {/* Title */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Product Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium bg-slate-900/90 border border-white/10 text-white focus:outline-none focus:border-primary/50 transition-colors" />
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Sale Price (₹)</label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono font-bold bg-slate-900/90 border border-white/10 text-emerald-400 focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">MRP Price (₹)</label>
                <input type="number" value={mrp} onChange={e => setMrp(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono bg-slate-900/90 border border-white/10 text-slate-400 focus:outline-none focus:border-white/20" />
              </div>
            </div>

            {/* AI Rewriter */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Affiliate Post Text</label>
                <span className="text-[10px] font-mono text-slate-500">{text.length} chars</span>
              </div>
              <div className="flex gap-2 mb-2">
                <input value={instruction} onChange={e => setInstruction(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && doRewrite()}
                  placeholder='AI command: "make concise", "add emojis", "highlight 60% discount"…'
                  className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-900/90 border border-white/10 text-white focus:outline-none focus:border-primary/50" />
                <button onClick={doRewrite} disabled={rewriting || !instruction.trim()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold glow-pill-primary text-white disabled:opacity-40">
                  {rewriting ? <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> : <Sparkles size={12} />}
                  Tune
                </button>
                {prev && (
                  <button onClick={() => { setText(prev); setPrev(null); }}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-400">
                    <Undo2 size={12} /> Undo
                  </button>
                )}
              </div>
              <textarea value={text} onChange={e => setText(e.target.value)} rows={6}
                className="w-full px-3.5 py-3 rounded-xl text-xs font-mono bg-slate-900/90 border border-white/10 text-slate-200 focus:outline-none focus:border-primary/50 resize-none leading-relaxed" />
            </div>

            {/* Quick Media & Link Tools */}
            <div className="flex items-center gap-2 pt-1">
              <button onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors">
                <Upload size={12} /> Upload Image
              </button>
              <button onClick={doScrapeImage} disabled={scrapingImage}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-40 transition-colors">
                <Globe size={12} /> Scrape Media
              </button>
              <button onClick={doRetryAffiliate} disabled={retryingAffiliate}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-40 transition-colors">
                <Zap size={12} /> Refresh Affiliate
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </div>
          </div>

          {/* Right Live Telegram Mockup */}
          <div className="md:col-span-5 p-5 flex flex-col gap-3 bg-slate-950/70">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Live Telegram Post Preview</span>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Rendering
              </span>
            </div>

            {/* Mockup Card */}
            <div className="tg-preview-wrap flex-1 flex flex-col justify-between">
              <div className="flex flex-col gap-2.5">
                <div className="tg-preview-header">
                  <div className="tg-preview-avatar">D</div>
                  <div>
                    <div className="tg-preview-name">
                      DealzTrendz <CheckCheck size={12} className="text-blue-400" />
                    </div>
                    <div className="text-[10px] text-slate-400">@dealsforindiachannel</div>
                  </div>
                </div>

                <div className="tg-bubble">
                  {previewSrc && (
                    <img src={previewSrc} alt="" className="w-full rounded-lg mb-2.5 max-h-44 object-cover border border-white/10"
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  )}
                  <div className="tg-bubble-text">
                    {text.split("\n").slice(0, 14).join("\n")
                      .replace(/\*\*(.+?)\*\*/g, (_, m) => `<b>${m}</b>`)
                      .split(/(https?:\/\/\S+)/g)
                      .map((part, i) =>
                        /^https?:\/\//.test(part)
                          ? <a key={i} href={part} className="tg-bubble-link" target="_blank" rel="noreferrer">{part.length > 30 ? part.slice(0, 30) + "…" : part}</a>
                          : <span key={i} dangerouslySetInnerHTML={{ __html: part }} />
                      )
                    }
                  </div>
                  <div className="tg-bubble-time">
                    {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} ✓✓
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 text-center mt-2">
                This is the exact layout delivered to your Telegram followers.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-slate-950/80">
          <button onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/5 border border-white/10 transition-colors">
            Cancel
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => { onSaveDraft(changes); onClose(); }} disabled={!isDirty}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors disabled:opacity-40">
              Save Draft
            </button>
            <button onClick={() => { onSaveApprove(changes); onClose(); }}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white glow-pill-success hover:opacity-90 active:scale-95 transition-all shadow-lg flex items-center gap-1.5">
              <Check size={14} strokeWidth={3} /> Save & Broadcast
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Review View ──────────────────────────────────────────────────────────────
function ReviewView({ deals, onApprove, onReject, onEdit, dark }: {
  deals: Deal[]; onApprove: (id: string) => void;
  onReject: (id: string) => void; onEdit: (d: Deal) => void; dark: boolean;
}) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"score" | "latest" | "discount">("latest");
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [selectedChannel, setSelectedChannel] = useState<string>("All");
  const [page, setPage] = useState(1);
  const [sendTG, setSendTG] = useState(true);
  const [sendX, setSendX] = useState(false);
  const PAGE_SIZE = 100;

  const uniqueChannels = Array.from(new Set(deals.map(d => d.channel))).filter(Boolean).sort();

  let visible = deals.filter(d => {
    if (selectedChannel !== "All" && d.channel !== selectedChannel) return false;
    if (filter !== "all" && d.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return d.title.toLowerCase().includes(q) || (d.channel || "").toLowerCase().includes(q);
    }
    return true;
  });

  if (sort === "score") visible = [...visible].sort((a, b) => b.score - a.score);
  else if (sort === "latest") visible = [...visible].sort((a, b) => b.ts - a.ts);
  else if (sort === "discount") visible = [...visible].sort((a, b) => b.discount - a.discount);

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedVisible = visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const pending = deals.filter(d => d.status === "pending").length;
  const approved = deals.filter(d => d.status === "approved").length;
  const rejected = deals.filter(d => d.status === "rejected").length;

  void dark;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top Glass Filter Toolbar */}
      <div className="flex-shrink-0 px-5 py-4 border-b border-white/8 glass-panel flex flex-col gap-3.5">
        {/* Top Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search deals by title, brand, or channel name…"
              className="w-full pl-10 pr-12 py-2.5 rounded-2xl text-xs font-medium text-white bg-slate-900/80 border border-white/10 placeholder:text-slate-500 focus:outline-none focus:border-primary/50 transition-all shadow-inner" />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Broadcast Destination Controls */}
          <div className="flex items-center gap-2">
            <button onClick={() => setSendTG(!sendTG)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all border shadow-sm ${sendTG ? "glow-pill-success text-white border-emerald-400/40 scale-[1.02]" : "bg-white/5 border-white/10 text-slate-400 opacity-60"}`}>
              <Send size={12} /> Telegram
            </button>
            <button onClick={() => setSendX(!sendX)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all border shadow-sm ${sendX ? "glow-pill-accent text-white border-indigo-400/40 scale-[1.02]" : "bg-white/5 border-white/10 text-slate-400 opacity-60"}`}>
              <span>𝕏</span> Twitter
            </button>
          </div>
        </div>

        {/* Filter Pills + Channel Selector + Sorting */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-900/90 border border-white/8">
            {([["pending", `${pending}`, "🔥"], ["approved", `${approved}`, "✅"], ["rejected", `${rejected}`, "🗑️"], ["all", `${deals.length}`, "📁"]] as const).map(([v, cnt, icon]) => (
              <button key={v} onClick={() => { setFilter(v); setPage(1); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${filter === v ? "bg-gradient-to-r from-rose-500 to-primary text-white shadow-md shadow-rose-500/20" : "text-slate-400 hover:text-white"}`}>
                <span>{icon}</span>
                <span>{v}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${filter === v ? "bg-black/30 text-white" : "bg-white/5 text-slate-400"}`}>{cnt}</span>
              </button>
            ))}
          </div>

          {/* Right Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Styled Channel Filter Dropdown */}
            <div className="relative">
              <select
                value={selectedChannel}
                onChange={(e) => { setSelectedChannel(e.target.value); setPage(1); }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/90 text-white border border-white/10 focus:outline-none focus:border-primary/50 cursor-pointer appearance-none pr-8">
                <option value="All">⚡ All Channels ({deals.length})</option>
                {uniqueChannels.map(ch => (
                  <option key={ch} value={ch}>{ch}</option>
                ))}
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</div>
            </div>

            {/* Sort options */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-900/90 border border-white/8">
              {([["latest", Clock, "Newest"], ["score", TrendingUp, "Top Score"], ["discount", Flame, "Highest %"]] as const).map(([v, Icon, label]) => (
                <button key={v} onClick={() => { setSort(v); setPage(1); }}
                  className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold transition-all ${sort === v ? "bg-white/15 text-white shadow-sm border border-white/10" : "text-slate-400 hover:text-white"}`}>
                  <Icon size={11} /> {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Deals Card Grid */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl">
              🔍
            </div>
            <div>
              <p className="text-sm font-bold text-white">No matching deals found</p>
              <p className="text-xs text-slate-400 mt-1">Try switching channel filters or resetting your search.</p>
            </div>
            <button onClick={() => { setSearch(""); setFilter("pending"); setSelectedChannel("All"); setPage(1); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-white glow-pill-primary hover:opacity-90 active:scale-95 transition-all">
              <RefreshCw size={13} /> Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
              <AnimatePresence mode="popLayout">
                {pagedVisible.map(d => (
                  <DealCard key={d.id} deal={d} onApprove={onApprove} onReject={onReject} onEdit={onEdit} />
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-4 mt-8 pt-4 border-t border-white/8">
                <p className="text-xs font-semibold text-slate-400">
                  Showing <span className="font-mono text-white font-bold">{(currentPage - 1) * PAGE_SIZE + 1}</span> - <span className="font-mono text-white font-bold">{Math.min(currentPage * PAGE_SIZE, visible.length)}</span> of <span className="font-mono text-white font-bold">{visible.length}</span> deals
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="px-4 py-2 rounded-xl text-xs font-bold border border-white/10 bg-white/5 text-white hover:bg-white/10 disabled:opacity-40 transition-colors">
                    Previous
                  </button>
                  <span className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 text-white border border-white/15">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-xl text-xs font-bold border border-white/10 bg-white/5 text-white hover:bg-white/10 disabled:opacity-40 transition-colors">
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Channels View ────────────────────────────────────────────────────────────
function ChannelsView() {
  const [chs, setChs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newChannelInput, setNewChannelInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const saveAlias = async (id: string, newName: string) => {
    if (!newName.trim()) { setEditingId(null); return; }
    setChs(prev => prev.map(c => c.id === id ? { ...c, name: newName } : c));
    setEditingId(null);
    try {
      await fetch(`${API_BASE}/api/v1/channels/alias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: newName })
      });
      toast.success("Channel name saved!");
    } catch {
      toast.error("Failed to save alias");
    }
  };

  const fetchChannels = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/channels`);
      if (res.ok) {
        const data = await res.json();
        if (data.channels && Array.isArray(data.channels)) {
          const mapped = data.channels.map((c: any) => {
            const fallback = c.id.split('/').pop() || c.id;
            const pretty = toChName(c.id);
            return {
              ...c,
              name: (pretty !== fallback && pretty !== "Unknown") ? pretty : c.name
            };
          });
          setChs(mapped);
        }
      }
    } catch (err) {
      console.error("Failed to fetch channels:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChannels();
    const int = setInterval(fetchChannels, 30000);
    return () => clearInterval(int);
  }, [fetchChannels]);

  const toggleChannel = async (id: string, current: boolean) => {
    setChs(cs => cs.map(c => (c.id === id ? { ...c, active: !current } : c)));
    try {
      await fetch(`${API_BASE}/api/v1/channels/config/${encodeURIComponent(id)}/toggle`, { method: "PUT" });
    } catch (err) {
      toast.error("Failed to toggle channel");
    }
  };

  const toggleAutoApprove = async (id: string, current: boolean) => {
    setChs(cs => cs.map(c => (c.id === id ? { ...c, auto_approve: !current } : c)));
    try {
      await fetch(`${API_BASE}/api/v1/channels/config/${encodeURIComponent(id)}/auto-approve`, { method: "PUT" });
    } catch (err) {
      toast.error("Failed to toggle auto-approve");
    }
  };

  const addChannel = async () => {
    if (!newChannelInput.trim()) return;
    const ch = newChannelInput.trim();
    try {
      const res = await fetch(`${API_BASE}/api/v1/channels/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: ch })
      });
      if (res.ok) {
        setNewChannelInput("");
        setShowAdd(false);
        fetchChannels();
        toast.success("Channel added successfully!");
      }
    } catch {
      toast.error("Error adding channel");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 max-w-4xl mx-auto flex flex-col gap-5">
      {/* Header Banner */}
      <div className="flex items-center justify-between p-5 rounded-3xl glass-panel border border-white/10">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>📡</span> Source Telegram Channels ({chs.length})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {chs.filter(c => c.active).length} listening · {chs.filter(c => !c.active).length} paused
          </p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-2xl text-white glow-pill-primary hover:opacity-90 active:scale-95 transition-all shadow-md">
          <Plus size={14} /> {showAdd ? "Close" : "Add Channel"}
        </button>
      </div>

      {showAdd && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl glass-panel border border-primary/30 animate-slide-up">
          <input value={newChannelInput} onChange={e => setNewChannelInput(e.target.value)}
            placeholder="Invite link: https://t.me/+... or username: @offerzone"
            className="flex-1 px-3.5 py-2.5 rounded-xl text-xs font-mono text-white bg-slate-950/80 border border-white/10 focus:outline-none focus:border-primary/50"
            onKeyDown={e => e.key === "Enter" && addChannel()} />
          <button onClick={addChannel}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white glow-pill-primary hover:opacity-90 active:scale-95">
            Connect
          </button>
        </div>
      )}

      {/* Channel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {loading && chs.length === 0 ? (
          <div className="col-span-2 text-center py-20 text-xs text-slate-400">Loading live channels…</div>
        ) : (
          chs.map(ch => (
            <div key={ch.id} className="p-4 rounded-2xl glass-card flex flex-col justify-between gap-3 border border-white/8 hover:border-white/15">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-extrabold text-white flex-shrink-0 glow-pill-accent">
                  {(ch.name || ch.id || "C")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0"
                  onDoubleClick={() => { setEditingId(ch.id); setEditName(ch.name || ch.id); }}
                  title="Double-click to edit name">
                  {editingId === ch.id ? (
                    <div className="flex items-center gap-2">
                      <input autoFocus value={editName} onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") saveAlias(ch.id, editName);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        onBlur={() => saveAlias(ch.id, editName)}
                        className="w-full px-2 py-1 rounded-lg text-xs font-bold text-white bg-slate-900 border border-primary/50 focus:outline-none" />
                      <button onClick={() => saveAlias(ch.id, editName)} className="text-emerald-400 hover:text-emerald-300">
                        <Check size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="cursor-pointer group flex flex-col" onClick={() => { setEditingId(ch.id); setEditName(ch.name || ch.id); }}>
                      <p className="text-xs font-bold text-white group-hover:text-primary transition-colors flex items-center gap-1.5">
                        {ch.name || ch.id}
                        <PenLine size={10} className="opacity-0 group-hover:opacity-100 text-slate-400" />
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5">{ch.id}</p>
                    </div>
                  )}
                </div>

                {/* 24h Deal Count Metric */}
                <div className="flex flex-col items-end flex-shrink-0">
                  <span className="text-base font-extrabold font-mono text-white">
                    {ch.deals_24h ?? 0}
                  </span>
                  <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">24h Deals</span>
                </div>
              </div>

              {/* Controls Footer */}
              <div className="flex items-center justify-between pt-2.5 border-t border-white/5 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${ch.active ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
                  <span className="text-slate-400 font-medium">{ch.active ? "Active" : "Paused"}</span>
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={() => toggleAutoApprove(ch.id, ch.auto_approve)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${ch.auto_approve ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" : "bg-white/5 text-slate-500 border-white/10"}`}>
                    Auto-Post {ch.auto_approve ? "ON" : "OFF"}
                  </button>
                  <button onClick={() => toggleChannel(ch.id, ch.active)}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${ch.active ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white" : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white"}`}>
                    {ch.active ? <X size={12} /> : <Check size={12} />}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Posted Deals View ────────────────────────────────────────────────────────
function PostedView({ deals }: { deals: Deal[] }) {
  const postedDeals = deals.filter(d => d.status === "approved");

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 max-w-4xl mx-auto flex flex-col gap-4">
      <div className="p-5 rounded-3xl glass-panel border border-white/10 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>🚀</span> Broadcasted Deals History ({postedDeals.length})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Live timeline of deals sent to Telegram & X</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {postedDeals.map(d => (
          <div key={d.id} className="p-4 rounded-2xl glass-card flex items-center gap-4 border border-white/8 hover:border-white/15">
            {d.imgUrl ? (
              <img src={d.imgUrl} alt="" className="w-14 h-14 rounded-xl object-contain bg-slate-950/80 p-1 border border-white/10 flex-shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl bg-white/5 border border-white/10 flex-shrink-0">
                {d.catEmoji}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white truncate">{d.title}</h4>
              <div className="flex items-center gap-3 mt-1 text-[11px]">
                <span className="font-bold font-mono text-emerald-400">{fmt(d.price)}</span>
                <span className="text-slate-500 font-mono">{fmtAgo(d.ts)}</span>
                <span className="text-slate-400 font-semibold">{d.channel}</span>
              </div>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(d.affText); toast.success("Copied post text!"); }}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors border border-white/10" title="Copy Post">
              <Copy size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Settings View ────────────────────────────────────────────────────────────
function SettingsView({ dark, setDark }: { dark: boolean; setDark: (v: boolean) => void }) {
  const [s, setS] = useState<AppSettings>({
    outputChannel: "@dealsforindia",
    stylePrompt: "Write in a casual, enthusiastic style. Highlight key discount clearly.",
    dedupHours: 24, maxPerCycle: 40,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/settings`);
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setS(prev => ({
              ...prev,
              outputChannel: data.settings.CURATED_CHANNEL || prev.outputChannel,
              stylePrompt: data.settings.AI_STYLE_PROMPT || prev.stylePrompt,
              dedupHours: data.settings.FP_TTL_HOURS || prev.dedupHours,
              maxPerCycle: data.settings.MAX_POSTS_CYCLE || prev.maxPerCycle,
            }));
          }
        }
      } catch {}
    })();
  }, []);

  const save = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          CURATED_CHANNEL: s.outputChannel,
          AI_STYLE_PROMPT: s.stylePrompt,
          FP_TTL_HOURS: s.dedupHours,
          MAX_POSTS_CYCLE: s.maxPerCycle,
        }),
      });
      if (res.ok) {
        setSaved(true);
        toast.success("Settings saved to VM!");
        setTimeout(() => setSaved(false), 2500);
      }
    } catch {
      toast.error("Error saving settings");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 max-w-3xl mx-auto flex flex-col gap-5">
      <div className="p-5 rounded-3xl glass-panel border border-white/10">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span>⚙️</span> DealFlow Pipeline Settings
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Configure scraping limits, destination channels, and AI prompt instructions</p>
      </div>

      <div className="p-5 rounded-3xl glass-card flex flex-col gap-4 border border-white/10">
        <div>
          <label className="block text-xs font-bold text-white mb-1.5">Broadcast Output Channel</label>
          <input value={s.outputChannel} onChange={e => setS(v => ({ ...v, outputChannel: e.target.value }))}
            className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono text-white bg-slate-950/80 border border-white/10 focus:outline-none focus:border-primary/50" />
        </div>

        <div>
          <label className="block text-xs font-bold text-white mb-1.5">AI Formatting Instruction Prompt</label>
          <textarea value={s.stylePrompt} onChange={e => setS(v => ({ ...v, stylePrompt: e.target.value }))} rows={4}
            className="w-full px-3.5 py-3 rounded-xl text-xs bg-slate-950/80 border border-white/10 text-white focus:outline-none focus:border-primary/50 resize-none leading-relaxed" />
        </div>

        <button onClick={save}
          className="mt-2 py-3 rounded-2xl text-xs font-bold text-white glow-pill-primary hover:opacity-90 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2">
          <Check size={14} strokeWidth={3} /> Save Configuration
        </button>
      </div>
    </div>
  );
}

// ─── Sidebar Navigation ───────────────────────────────────────────────────────
const NAV: { id: Tab; icon: React.ElementType; label: string }[] = [
  { id: "Review", icon: Flame, label: "Review Deck" },
  { id: "Posted", icon: CheckSquare, label: "Broadcasted" },
  { id: "Channels", icon: Radio, label: "Channels" },
  { id: "Settings", icon: Settings2, label: "Settings" },
];

function Sidebar({ tab, setTab, pending, dark, setDark }: {
  tab: Tab; setTab: (t: Tab) => void; pending: number; dark: boolean; setDark: (v: boolean) => void;
}) {
  return (
    <aside className="hidden md:flex flex-shrink-0 flex-col border-r border-white/8 glass-panel" style={{ width: 220, background: "rgba(9, 10, 16, 0.85)" }}>
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/8">
        <div className="w-9 h-9 rounded-2xl flex items-center justify-center glow-pill-primary text-white font-black text-base shadow-lg">
          ⚡
        </div>
        <div>
          <h1 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
            DealFlow <span className="text-[10px] px-1.5 py-0.2 rounded bg-primary/20 text-primary border border-primary/30 font-mono">2.0</span>
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase">Live Engine</span>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV.map(({ id, icon: Icon, label }) => {
          const active = tab === id;
          return (
            <button key={id} onClick={() => setTab(id)}
              className={`relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${active ? "bg-gradient-to-r from-rose-500/20 to-primary/10 text-white border border-primary/30 shadow-md shadow-primary/5" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
              {active && <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-primary shadow-lg shadow-primary" />}
              <Icon size={16} className={active ? "text-primary" : "text-slate-400"} />
              <span>{label}</span>
              {id === "Review" && pending > 0 && (
                <span className="ml-auto text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white shadow-sm">
                  {pending}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Monitor Footer */}
      <div className="p-4 border-t border-white/8 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Engine VM</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Online
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 flex flex-col gap-1 text-[10px] font-mono text-slate-400">
          <div className="flex justify-between">
            <span>Workers</span>
            <span className="text-white font-bold">5 Active</span>
          </div>
          <div className="flex justify-between">
            <span>Live Sync</span>
            <span className="text-emerald-400">100% OK</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Main App Entry ───────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState<Tab>("Review");
  const [deals, setDeals] = useState<Deal[]>(BASE_DEALS);
  const [editing, setEditing] = useState<Deal | null>(null);
  const [dark, setDark] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  const loadDeals = useCallback(async () => {
    try {
      const apiDeals = await fetchPendingDeals();
      setDeals(apiDeals);
    } catch (e) {
      console.error("Failed to load deals", e);
    }
  }, []);

  useEffect(() => {
    loadDeals();
    const timer = setInterval(loadDeals, 30000);
    return () => clearInterval(timer);
  }, [loadDeals]);

  // Real-time WebSocket connection
  useEffect(() => {
    let ws: WebSocket;
    const connect = () => {
      try {
        ws = new WebSocket(WS_URL);
        ws.onopen = () => console.log("WebSocket connected to DealFlow Engine");
        ws.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.event === "new_deal" || data.event === "deal_approved") loadDeals();
          } catch {}
        };
        ws.onclose = () => setTimeout(connect, 3000);
      } catch {}
    };
    connect();
    return () => { ws?.close(); };
  }, [loadDeals]);

  const handleApprove = async (id: string) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, status: "approved" } : d));
    toast.success("Deal approved & broadcasted!");
    await apiApprove(id);
  };

  const handleReject = async (id: string) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, status: "rejected" } : d));
    toast.info("Deal skipped");
    await apiReject(id);
  };

  const pendingCount = deals.filter(d => d.status === "pending").length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#07080E] text-white">
      <Toaster position="top-right" richColors theme="dark" />
      <Sidebar tab={tab} setTab={setTab} pending={pendingCount} dark={dark} setDark={setDark} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {tab === "Review" && (
          <ReviewView deals={deals} onApprove={handleApprove} onReject={handleReject} onEdit={setEditing} dark={dark} />
        )}
        {tab === "Posted" && <PostedView deals={deals} />}
        {tab === "Channels" && <ChannelsView />}
        {tab === "Settings" && <SettingsView dark={dark} setDark={setDark} />}
      </main>

      {/* Edit Deal Modal */}
      {editing && (
        <EditModal deal={editing} onClose={() => setEditing(null)}
          onSaveDraft={(chg) => setDeals(prev => prev.map(d => d.id === editing.id ? { ...d, ...chg } : d))}
          onSaveApprove={(chg) => {
            handleApprove(editing.id);
            setEditing(null);
          }}
          onToast={(msg, type) => {
            if (type === "success") toast.success(msg);
            else if (type === "error") toast.error(msg);
            else toast.info(msg);
          }}
        />
      )}
    </div>
  );
}
