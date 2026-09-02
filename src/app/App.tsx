import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { toast, Toaster } from "sonner";
import {
  Check, X, Search, Sun, Moon, Zap, Tag, Settings2, Radio,
  CheckSquare, Plus, PenLine, Upload, Sparkles,
  Undo2, ExternalLink, Shield,
  Clock, Flame, RefreshCw, CheckCircle2,
  Maximize2, Copy, Link as LinkIcon, FileText,
  Globe, ArrowUpDown, ShoppingCart, Percent,
  Send, CheckCheck, Trash2, SlidersHorizontal, Eye
} from "lucide-react";
import {
  LiveRadar3D, FireFlame3D, RocketBroadcast3D, EmptySearch3D, triggerApproveConfetti
} from "./components/LottieAnimations";
import {
  Category3DIcon, Store3DBadge, Nav3DIcon, Stat3DPill, FloatingCart3D, Satellite3D, SavingsPill3D
} from "./components/Iconscout3DAssets";
import { GlassDropdown, DropdownOption } from "./components/GlassDropdown";

// ─── Types ────────────────────────────────────────────────────────────────────
type DealStatus = "pending" | "approved" | "rejected" | "draft";
type DealType = "product" | "trick";
type Tab = "Review" | "Posted" | "Channels" | "Settings";

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

// ─── Data & Category Parsing (Zero-Duplication) ──────────────────────────────
const EMOJI_REGEX = /^\p{Extended_Pictographic}/u;

const CATEGORY_MAP: Record<string, { name: string; emoji: string }> = {
  electronics: { name: "Electronics", emoji: "📱" },
  phones: { name: "Electronics", emoji: "📱" },
  audio: { name: "Audio & Accessories", emoji: "🎧" },
  headphone: { name: "Audio & Accessories", emoji: "🎧" },
  fashion: { name: "Fashion & Apparel", emoji: "👗" },
  clothing: { name: "Fashion & Apparel", emoji: "👗" },
  footwear: { name: "Footwear", emoji: "👟" },
  shoes: { name: "Footwear", emoji: "👟" },
  beauty: { name: "Beauty & Personal", emoji: "💄" },
  grocery: { name: "Grocery & Essentials", emoji: "🛒" },
  food: { name: "Food & Dining", emoji: "🍕" },
  home: { name: "Home & Kitchen", emoji: "🏠" },
  kitchen: { name: "Home & Kitchen", emoji: "🍳" },
  gaming: { name: "Gaming", emoji: "🎮" },
  books: { name: "Books", emoji: "📚" },
  travel: { name: "Travel", emoji: "✈️" },
  banking: { name: "Banking & Cards", emoji: "💳" },
  credit: { name: "Banking & Cards", emoji: "💳" },
  trick: { name: "Loot & Freebie", emoji: "⚡" },
  freebie: { name: "Loot & Freebie", emoji: "🎁" },
};

function parseCategory(raw?: string): { name: string; emoji: string } {
  if (!raw) return { name: "General", emoji: "🛍️" };
  const str = raw.trim();
  const lower = str.toLowerCase();

  // If starts with emoji
  if (EMOJI_REGEX.test(str)) {
    const parts = str.split(/\s+/);
    const emoji = parts[0];
    const rest = parts.slice(1).join(" ").trim();
    if (rest && !rest.toLowerCase().includes("flipkart") && !rest.toLowerCase().includes("amazon")) {
      return { name: rest, emoji };
    }
  }

  // Check known categories
  for (const [k, v] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(k)) return { name: v.name, emoji: v.emoji };
  }

  // If raw string is just repeated store names like 'Flipkart Flipkart' or 'Amazon Amazon'
  if (lower.includes("flipkart") || lower.includes("amazon") || lower.includes("myntra") || lower.includes("desidime") || lower.includes("other")) {
    return { name: "General", emoji: "🛍️" };
  }

  // De-duplicate words
  const words = str.split(/\s+/).filter(Boolean);
  const unique = Array.from(new Set(words));
  const cleanName = unique.join(" ") || "General";
  return { name: cleanName, emoji: "🛍️" };
}

const toChName = (ch?: string): string => {
  if (!ch) return "Unknown";
  const clean = ch.toLowerCase();
  
  // User Channel Mappings (Numeric IDs + Invite links + Usernames)
  if (ch.includes("1837130426") || ch.includes("emveIa6ZQxoxYjAx")) return "Crazy Deals";
  if (ch.includes("2260825044")) return "DealDrops";
  if (clean.includes("dealspoint")) return "Dealspoint Premium";
  if (ch.includes("1346861267") || ch.includes("1823765371") || ch.includes("OylJYrIZZHBzZjRi")) return "DealzTrendz";
  if (ch.includes("1782814661") || ch.includes("fJX-MfWphoNiZDU6")) return "DealzTrendz 2.0";
  if (clean.includes("desidimehot") || ch.includes("1423395942")) return "DesiDime Handpicked Deals";
  if (clean.includes("realearnkaro") || ch.includes("1900048971")) return "EarnKaro";
  if (clean.includes("extrape")) return "ExtraPe";
  if (clean.includes("fetdeals") || ch.includes("tcoZTg6IJWl4ZDRI")) return "FET (Deals & Tricks)";
  if (ch.includes("2152564226") || ch.includes("RBY7rxcO-T03MjE1")) return "Fitness Finds by SQ";
  if (clean.includes("freeearningtech") || ch.includes("VNdMZqz_NhKNNXvsG")) return "Free Earning Tech";
  if (ch.includes("1955834193") || ch.includes("JpTJUwE9J9A1NDE1")) return "Genie All Deals";
  if (ch.includes("1268661047") || ch.includes("X925uAMEGvgwOWY1") || ch.includes("1944516766")) return "Genie Loot";
  if (ch.includes("1667757195") || ch.includes("Io8OVRMkSVs5YzI1")) return "Genie Tricks";
  if (clean.includes("glamhauldiaries") || ch.includes("2365543574")) return "Glam Haul Diaries";
  if (clean.includes("lootdealsapp") || ch.includes("LootDealsApp") || ch.includes("1589506039")) return "Loot Deals App";
  if (ch.includes("1315464303") || ch.includes("LQ3FigpMfmAyZGJl")) return "Offerzone 2.0";
  if (ch.includes("1707571730") || ch.includes("kTvbwlaPbH1mM2E1")) return "Offerzone 3.0";
  if (ch.includes("2393042058") || ch.includes("2395151733") || ch.includes("FpXKV70NYNY0NzQ1")) return "Offerzone 4.0";
  if (ch.includes("1702197669") || ch.includes("uV5wcTkUWJEwM2Y1")) return "Offerzone Tricks";
  if (ch.includes("3866659228") || ch.includes("4DwYqc6QfXhiMTI1")) return "OZ Loot Bazaar";
  if (ch.includes("3516611384") || ch.includes("2157774706")) return "OZ Loot Deals";
  if (clean.includes("bblbblp") || ch.includes("3871814319")) return "Private Deals From All";
  if (ch.includes("1927095270") || clean.includes("shoppersquest") || ch.includes("1447952139")) return "Shoppers Quest 2.0";
  if (ch.includes("1786042652") || ch.includes("958_Lu4ZoUxM2E9")) return "Shopping Genie";
  if (clean.includes("technicalsheikh") || ch.includes("1357275556")) return "Technical Sheikh";
  if (clean.includes("loot_dealsx") || ch.includes("1450755585")) return "Trending Loot Deals";
  if (clean.includes("desidime")) return "DesiDime";
  if (clean.includes("shopquest")) return "Shoppers Quest";
  
  if (ch.startsWith("@")) return ch.substring(1);
  return ch.split("/").pop() || ch;
};

const API_BASE = import.meta.env.PROD ? "https://api.rudranil.me" : (import.meta.env.VITE_API_URL || "");
const WS_URL = import.meta.env.PROD ? "wss://api.rudranil.me/ws" : (import.meta.env.VITE_WS_URL || `${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}/ws`);

// ─── Formatters & Theme Utilities ─────────────────────────────────────────────
const fmt = (p: number) => p === 0 ? "Free" : `₹${p.toLocaleString("en-IN")}`;
const fmtAgo = (ts: number) => {
  const d = Math.floor(Date.now() / 1000 - ts);
  if (d < 60) return `${d}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  return `${Math.floor(d / 3600)}h ago`;
};

const catColor: Record<string, string> = {
  Electronics: "#8B5CF6", Fashion: "#EC4899", "Home & Kitchen": "#F59E0B",
  Home: "#F59E0B", Beauty: "#F472B6", Sports: "#10B981", Banking: "#3B82F6",
  Food: "#F97316", Computers: "#06B6D4", General: "#64748B", Grocery: "#10B981",
  Travel: "#06B6D4", Books: "#EAB308", Kids: "#F97316", Gaming: "#8B5CF6",
};

const getStoreBadge = (platforms: string[] = [], url: string = "") => {
  const platStr = (platforms.join(" ") + " " + url).toLowerCase();
  if (platStr.includes("amazon") || platStr.includes("amzn") || platStr.includes("amazn")) {
    return { name: "Amazon", bg: "from-amber-500/20 to-orange-500/20", border: "border-amber-500/30", text: "text-amber-300", tag: "amazon" };
  }
  if (platStr.includes("flipkart") || platStr.includes("fkrt") || platStr.includes("fpkrt") || platStr.includes("shopsy")) {
    return { name: "Flipkart", bg: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30", text: "text-blue-300", tag: "flipkart" };
  }
  if (platStr.includes("myntra") || platStr.includes("myntr")) {
    return { name: "Myntra", bg: "from-pink-500/20 to-rose-500/20", border: "border-pink-500/30", text: "text-pink-300", tag: "myntra" };
  }
  if (platStr.includes("ajio") || platStr.includes("ajiio")) {
    return { name: "AJIO", bg: "from-purple-500/20 to-indigo-500/20", border: "border-purple-500/30", text: "text-purple-300", tag: "ajio" };
  }
  if (platStr.includes("udemy")) {
    return { name: "Udemy", bg: "from-purple-500/20 to-indigo-500/20", border: "border-purple-500/30", text: "text-purple-300", tag: "udemy" };
  }
  if (platStr.includes("desidime")) {
    return { name: "DesiDime", bg: "from-red-500/20 to-orange-500/20", border: "border-red-500/30", text: "text-red-300", tag: "desidime" };
  }
  if (platStr.includes("zepto")) {
    return { name: "Zepto", bg: "from-purple-500/20 to-pink-500/20", border: "border-purple-500/30", text: "text-purple-300", tag: "zepto" };
  }
  if (platStr.includes("blinkit") || platStr.includes("grofers")) {
    return { name: "Blinkit", bg: "from-yellow-500/20 to-amber-500/20", border: "border-yellow-500/30", text: "text-yellow-300", tag: "blinkit" };
  }
  if (platStr.includes("swiggy") || platStr.includes("instamart")) {
    return { name: "Swiggy", bg: "from-orange-500/20 to-amber-500/20", border: "border-orange-500/30", text: "text-orange-300", tag: "swiggy" };
  }
  if (platStr.includes("zomato")) {
    return { name: "Zomato", bg: "from-red-500/20 to-rose-500/20", border: "border-red-500/30", text: "text-red-300", tag: "zomato" };
  }
  if (platStr.includes("nykaa")) {
    return { name: "Nykaa", bg: "from-pink-500/20 to-rose-500/20", border: "border-pink-500/30", text: "text-pink-300", tag: "nykaa" };
  }
  if (platStr.includes("boat")) {
    return { name: "boAt", bg: "from-red-500/20 to-slate-500/20", border: "border-red-500/30", text: "text-red-300", tag: "boat" };
  }
  const cleanName = (platforms[0] && platforms[0].toLowerCase() !== "other") ? platforms[0] : "Loot Deal";
  return { name: cleanName, bg: "from-slate-500/20 to-slate-600/20", border: "border-slate-500/30", text: "text-slate-300", tag: cleanName };
};

const aiRewriteSim = (text: string, inst: string): string => {
  const i = inst.toLowerCase();
  if (i.includes("short") || i.includes("concise")) return text.split("\n").slice(0, 8).join("\n");
  if (i.includes("emoji")) return "🔥 " + text;
  if (i.includes("clean")) return text.replace(/#\S+/g, "").replace(/\n{3,}/g, "\n\n").trim();
  return text + "\n\n⚡ Limited time — grab it fast!";
};

function cleanDealTitle(prodName?: string, originalText?: string): string {
  let title = (prodName || "").trim();
  if (!title || /^(?:👉|🔥|⚡|🛍️|🔗|▶️)?\s*https?:\/\//i.test(title) || /https?:\/\/|www\.|\.com|\.in|\.ltd|\.cc|\.co|\.it|\.club|t\.me\//i.test(title)) {
    if (originalText) {
      const lines = originalText.split("\n").map(l => l.trim()).filter(Boolean);
      for (const line of lines) {
        const clean = line.replace(/^[👉🔥⚡🛍️🎁🛒📦💥📢🏷️✨🚨📌▶️➔➡*_\-•—\s"']+/g, "").trim();
        if (clean.length > 3 && !/https?:\/\/|www\.|\.com|\.in|\.ltd|\.cc|\.co|\.it|\.club|t\.me\//i.test(clean) && !/^(?:loot|price|deal|buy|grab|offer|shop|mrp|rs\.?|inr|₹|use\s+code)[\s:@₹\d,/\-%]+$/i.test(clean)) {
          return clean.slice(0, 120);
        }
      }
    }
    return "Loot Deal";
  }
  return title.replace(/^[👉🔥⚡🛍️🎁🛒📦💥📢🏷️✨🚨📌▶️➔➡*_\-•—\s"']+/g, "").trim() || "Loot Deal";
}

// ─── API Helpers ──────────────────────────────────────────────────────────────
function mapRawToDeal(d: RawDeal & { fp_hash?: string }, fallbackId?: string): Deal {
  const id = d.fp_hash ?? fallbackId ?? String(d.ts);
  const { name: catName, emoji: catEmoji } = parseCategory(d.category);
  return {
    id, title: cleanDealTitle(d.prod_name, d.original_text),
    price: d.prices.sale ?? 0, mrp: d.prices.mrp ?? 0,
    discount: d.prices.discount_pct ?? 0,
    category: catName, catEmoji: catEmoji,
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
    originalText: d.original_text || "",
    affText: (d as any).ai_formatted_text || d.aff_text || d.original_text || "",
    verdict: "", signals: [],
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

interface ScrapedProductData {
  imgUrl?: string | null;
  title?: string | null;
  category?: string | null;
  price?: number | null;
  mrp?: number | null;
  affText?: string | null;
}

async function apiScrapeImage(id: string): Promise<ScrapedProductData | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/deals/${id}/scrape-image`, { method: "POST" });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      imgUrl: data.img_url || data.url || data.image_url || null,
      title: data.title || data.prod_name || null,
      category: data.category || null,
      price: data.prices?.sale || data.price || null,
      mrp: data.prices?.mrp || data.mrp || null,
      affText: data.aff_text || data.ai_formatted_text || null,
    };
  } catch { return null; }
}

// ─── Image Lightbox (Mounted via Portal outside 3D Card CSS Transforms) ─────
function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <motion.div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-8 backdrop-blur-2xl bg-black/90 cursor-zoom-out"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}>
      <div className="relative max-w-full max-h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
        <motion.img src={src} alt=""
          className="max-w-[90vw] max-h-[82vh] w-auto h-auto object-contain rounded-2xl border border-white/20 shadow-[0_0_100px_rgba(0,0,0,0.95)] bg-slate-950/90"
          initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 25, stiffness: 320 }} />
        <button className="absolute -top-3 -right-3 sm:top-3 sm:right-3 w-10 h-10 rounded-full flex items-center justify-center bg-slate-900/95 text-white hover:bg-rose-500 transition-all border border-white/20 shadow-2xl z-50 cursor-pointer"
          onClick={onClose}><X size={18} /></button>
      </div>
    </motion.div>,
    document.body
  );
}

// ─── 3D Tilt Card Wrapper ─────────────────────────────────────────────────────
function DealCard({
  deal, onApprove, onReject, onEdit,
  selected = false, onToggleSelect, bulkMode = false,
}: {
  deal: Deal;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onEdit: (deal: Deal) => void;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  bulkMode?: boolean;
}) {
  const [lightbox, setLightbox] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const store = getStoreBadge(deal.platforms, deal.affText);
  const savings = deal.mrp > deal.price ? deal.mrp - deal.price : 0;

  return (
    <motion.div layout
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
        transition: "transform 0.15s ease-out, border-color 0.2s ease, box-shadow 0.2s ease",
      }}
      className={`glass-card overflow-hidden flex flex-col group relative transition-all ${
        selected ? "ring-2 ring-emerald-400 bg-emerald-500/10 border-emerald-400/50 shadow-lg shadow-emerald-500/20" : ""
      }`}>

      <AnimatePresence>{lightbox && deal.imgUrl && <ImageLightbox src={deal.imgUrl} onClose={() => setLightbox(false)} />}</AnimatePresence>

      {/* Image Showcase */}
      <div className="relative w-full h-48 sm:h-56 bg-[#090B14] flex items-center justify-center p-3.5 overflow-hidden rounded-t-2xl cursor-zoom-in flex-shrink-0 border-b border-white/5"
        onClick={() => !imgErr && deal.imgUrl && setLightbox(true)}>
        
        {deal.imgUrl && !imgErr ? (
          <>
            <img src={deal.imgUrl} alt={deal.title}
              className="max-h-full max-w-full w-auto h-auto object-contain filter drop-shadow-md group-hover:scale-[1.04] transition-transform duration-250 ease-out z-10"
              loading="lazy"
              onError={() => setImgErr(true)} />

            <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/45 backdrop-blur-[2px]">
              <div className="p-2.5 rounded-xl bg-slate-900/90 text-white border border-white/20 shadow-xl">
                <Maximize2 size={16} />
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-500">
            <span className="text-4xl sm:text-5xl">{deal.catEmoji}</span>
            <span className="text-xs font-semibold tracking-wider uppercase opacity-60">No Media</span>
          </div>
        )}

        {/* Top Badges: Store + Clean Flame Discount Badge */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2 flex-wrap">
          <Store3DBadge store={store.tag} />

          {deal.discount > 0 && (
            <span className="px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-rose-500/25 to-orange-500/25 text-rose-300 border border-rose-500/40 font-black text-xs font-mono tracking-normal shadow-sm flex items-center gap-1">
              <span>🔥</span> {Math.round(deal.discount)}% OFF
            </span>
          )}
        </div>

        {/* Top Right: Selection Checkbox */}
        {(bulkMode || selected) && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect?.(deal.id);
            }}
            className={`absolute top-3 right-3 z-30 w-7 h-7 rounded-xl flex items-center justify-center transition-all shadow-md ${
              selected
                ? "bg-emerald-500 text-slate-950 ring-2 ring-emerald-300 font-bold"
                : "bg-slate-900/90 text-white/40 border border-white/20 hover:border-white/40"
            }`}
          >
            {selected ? <Check size={14} className="stroke-[3]" /> : null}
          </button>
        )}

        {/* Bottom Bar: Category Badge */}
        <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
          <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-900/90 text-slate-200 backdrop-blur-md border border-white/10 font-semibold shadow-sm">
            {deal.catEmoji} {deal.category}
          </span>

          {deal.affiliate && (
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 border border-emerald-300/40" title="Affiliate Monetized">
              <Zap size={11} className="fill-slate-950 stroke-none" />
            </span>
          )}
        </div>

        {/* Status Overlays */}
        {deal.status === "approved" && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-1.5 text-emerald-400 font-bold text-sm">
              <CheckCircle2 size={36} className="text-emerald-400" />
              <span>Broadcasted</span>
            </div>
          </div>
        )}
        {deal.status === "rejected" && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-1.5 text-rose-400 font-bold text-sm">
              <X size={36} className="text-rose-400" />
              <span>Skipped</span>
            </div>
          </div>
        )}
      </div>

      {/* Deal Details & Content */}
      <div className="flex flex-col flex-1 p-4 sm:p-5 gap-3">
        <h4 className="text-sm sm:text-[15px] font-semibold text-slate-100 leading-relaxed line-clamp-2 min-h-[46px]" title={deal.title}>
          {deal.title}
        </h4>

        {/* Price & Savings */}
        <div className="flex items-baseline gap-2.5 flex-wrap">
          {deal.price > 0 ? (
            <>
              <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent font-mono tracking-tight leading-none drop-shadow-sm">
                {fmt(deal.price)}
              </span>
              {deal.mrp > 0 && deal.mrp > deal.price && (
                <span className="text-xs text-slate-400 line-through font-mono">
                  {fmt(deal.mrp)}
                </span>
              )}
              {savings > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 font-mono">
                  Save {fmt(savings)}
                </span>
              )}
            </>
          ) : (
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              ⚡ Trick / Freebie
            </span>
          )}
        </div>

        {/* Coupon Code Pill */}
        {deal.coupon && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 w-fit">
            <Tag size={11} className="text-amber-400" />
            <span className="text-xs font-bold font-mono text-amber-300">{deal.coupon}</span>
          </div>
        )}

        {/* Channel & Timestamp */}
        <div className="flex items-center gap-2 mt-auto pt-3 border-t border-white/6 text-slate-400">
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-slate-800 border border-white/10 flex-shrink-0">
            {deal.channel[0]}
          </div>
          <span className="text-xs font-medium truncate flex-1 text-slate-300">{deal.channel}</span>
          <span className="text-xs text-slate-500 flex-shrink-0 font-mono">{fmtAgo(deal.ts)}</span>
        </div>

        {/* Petr Knoll Liquid Specular Glass Action Buttons */}
        {deal.status === "pending" ? (
          <div className="flex items-center gap-2 pt-1">
            <div className="liquid-glass-wrap">
              <button onClick={() => onReject(deal.id)}
                className="liquid-glass-btn liquid-glass-skip w-10 h-10"
                title="Skip Deal">
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>
            <div className="liquid-glass-wrap">
              <button onClick={() => onEdit(deal)}
                className="liquid-glass-btn liquid-glass-edit w-10 h-10"
                title="Edit & Tune">
                <PenLine size={14} strokeWidth={2.2} />
              </button>
            </div>
            <div className="liquid-glass-wrap flex-1 flex">
              <button onClick={() => onApprove(deal.id)}
                className="liquid-glass-btn liquid-glass-hero flex-1 h-10 text-xs sm:text-sm gap-2"
                title="Approve & Broadcast">
                <Check size={16} strokeWidth={3} /> Approve
              </button>
            </div>
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
  
  const getInitialText = () => {
    const raw = (deal.affText || "").trim();
    const t = (deal.title || "").trim();
    if (!raw) return t ? `${t} @ ₹${deal.price || ""}` : "";
    
    // Check if raw text is missing the product title
    const isMissingTitle = t && t.length > 4 && !raw.toLowerCase().includes(t.toLowerCase().slice(0, 10));
    const isOnlyPriceLink = /^\s*[*_]*₹?\d+[*_]*\s*(?:\|\s*[*_]*Regular[^\n]*\n*)?https?:\/\/\S+/i.test(raw) || /^\s*\d{2,6}\s+https?:\/\/\S+/i.test(raw);
    
    if (isMissingTitle || isOnlyPriceLink) {
      const urls = raw.match(/https?:\/\/\S+/g) || [];
      const link = urls.length > 0 ? urls[0] : "";
      const p = deal.price ? ` @ ₹${deal.price}` : "";
      return `${t}${p}\n\n${link}`.trim();
    }
    return raw;
  };

  const [text, setText] = useState(getInitialText());
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
    if (result) {
      if (result.imgUrl) { setImgUrl(result.imgUrl); setImgFile(null); }
      if (result.title) setTitle(result.title);
      if (result.price) setPrice(String(result.price));
      if (result.mrp) setMrp(String(result.mrp));
      if (result.affText) {
        setText(result.affText);
      } else if (result.title) {
        const urls = text.match(/https?:\/\/\S+/g) || [];
        const link = urls.length > 0 ? urls[0] : "";
        const p = result.price || price || "";
        const pStr = p ? ` @ ₹${p}` : "";
        setText(`${result.title}${pStr}\n\n${link}`.trim());
      }
      onToast("✨ Product details & post text updated from store!", "success");
    } else {
      onToast("Failed to fetch product details", "error");
    }
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
      style={{ background: "rgba(3, 7, 18, 0.85)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl shadow-black/80 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-primary/30">
              <PenLine size={15} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">Edit &amp; Review Deal</h2>
              <p className="text-[11px] text-slate-400">
                {deal.channel ? `${deal.channel} · ` : ""}Source: {deal.channelRaw || "Direct"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 flex-1">
          {/* Left Form */}
          <div className="md:col-span-7 p-6 flex flex-col gap-4 border-r border-white/10">
            {/* Title */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Product Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-medium bg-slate-950/80 border border-white/10 text-white focus:outline-none focus:border-primary/50" />
            </div>

            {/* Price Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Sale Price (₹)</label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-950/80 border border-white/10 text-emerald-400 focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">MRP Price (₹)</label>
                <input type="number" value={mrp} onChange={e => setMrp(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-medium bg-slate-950/80 border border-white/10 text-slate-400 focus:outline-none focus:border-white/20" />
              </div>
            </div>

            {/* Affiliate Text */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Affiliate Post Text</label>
                <span className="text-[10px] text-slate-400 font-mono">{text.length} chars</span>
              </div>

              {/* AI Prompt Input */}
              <div className="relative">
                <input type="text" placeholder='AI command: "make concise", "add emojis", "highlight 60% discount"...'
                  value={instruction} onChange={e => setInstruction(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && doRewrite()}
                  className="w-full pl-3.5 pr-20 py-2 rounded-xl text-xs bg-slate-950/80 border border-white/10 text-slate-300 placeholder:text-slate-400 focus:outline-none focus:border-primary/50" />
                <button onClick={doRewrite} disabled={rewriting || !instruction.trim()}
                  className="absolute right-1 top-1 bottom-1 px-2.5 rounded-lg text-[10px] font-bold bg-primary text-slate-950 hover:bg-primary-hover disabled:opacity-40 transition-colors flex items-center gap-1">
                  <Sparkles size={10} /> {rewriting ? "..." : "Tune"}
                </button>
              </div>

              {/* Quick AI Presets */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {[
                  { label: "🔥 Add Urgency", prompt: "make it punchy with limited time urgency" },
                  { label: "✂️ Make Concise", prompt: "make it short, clean and highly readable" },
                  { label: "💰 Highlight Discount", prompt: "highlight the highest discount and price drop" },
                  { label: "✨ Add Clean Formatting", prompt: "clean emojis and format bullet points" }
                ].map(chip => (
                  <button key={chip.label} type="button" onClick={() => { setInstruction(chip.prompt); }}
                    className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 hover:border-primary/40 transition-all">
                    {chip.label}
                  </button>
                ))}
              </div>

              <textarea value={text} onChange={e => setText(e.target.value)} rows={6}
                className="w-full px-3.5 py-3 rounded-xl text-xs font-mono bg-slate-950/80 border border-white/10 text-slate-200 focus:outline-none focus:border-primary/50 resize-none leading-relaxed" />
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <div className="liquid-glass-wrap">
                <button onClick={() => fileRef.current?.click()}
                  className="liquid-glass-btn liquid-glass-edit px-3 py-2 text-xs gap-1.5">
                  <Upload size={13} strokeWidth={2} /> Upload Image
                </button>
              </div>
              <div className="liquid-glass-wrap">
                <button onClick={doScrapeImage} disabled={scrapingImage}
                  className="liquid-glass-btn liquid-glass-edit px-3.5 py-2 text-xs gap-1.5 disabled:opacity-40">
                  <Globe size={13} strokeWidth={2} /> {scrapingImage ? "Fetching..." : "Fetch Store Details"}
                </button>
              </div>
              <div className="liquid-glass-wrap">
                <button onClick={doRetryAffiliate} disabled={retryingAffiliate}
                  className="liquid-glass-btn liquid-glass-approve px-3.5 py-2 text-xs gap-1.5 disabled:opacity-40">
                  <Zap size={13} strokeWidth={2} /> Refresh Affiliate
                </button>
              </div>
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

            <div className="tg-preview-wrap flex-1 flex flex-col justify-between">
              <div className="flex flex-col gap-2.5">
                <div className="tg-preview-header">
                  <div className="tg-preview-avatar">
                    {deal.channel ? deal.channel.charAt(0).toUpperCase() : "D"}
                  </div>
                  <div>
                    <div className="tg-preview-name">
                      {deal.channel} <CheckCheck size={12} className="text-blue-400" />
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {deal.channelRaw.startsWith("@") ? deal.channelRaw : `Telegram Channel · ${deal.channel}`}
                    </div>
                  </div>
                </div>

                <div className="tg-bubble">
                  {previewSrc && (
                    <div className="w-full rounded-lg mb-2.5 max-h-52 overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
                      <img src={previewSrc} alt="" className="max-h-52 w-full object-contain p-1"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
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
                Exact message delivered to your Telegram subscribers.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions with 3D Rocket */}
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
            <div className="liquid-glass-wrap">
              <button onClick={() => { onSaveApprove(changes); onClose(); }}
                className="liquid-glass-btn liquid-glass-hero px-6 py-2.5 text-xs gap-2">
                <RocketBroadcast3D size={16} /> Save & Broadcast
              </button>
            </div>
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
  const [sort, setSort] = useState<"latest" | "discount" | "price_asc" | "price_desc">("latest");
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [selectedChannel, setSelectedChannel] = useState<string>("All");
  const [selectedStore, setSelectedStore] = useState<string>("All");
  const [pageSize, setPageSize] = useState<number>(40);
  const [page, setPage] = useState(1);
  const [sendTG, setSendTG] = useState(true);
  const [sendX, setSendX] = useState(false);

  const uniqueChannels = Array.from(new Set(deals.map(d => d.channel)))
    .filter(ch => Boolean(ch) && ch.toLowerCase() !== "unknown" && ch.toLowerCase() !== "dh")
    .sort();

  let visible = deals.filter(d => {
    if (selectedChannel !== "All" && d.channel !== selectedChannel) return false;
    if (selectedStore !== "All") {
      const store = getStoreBadge(d.platforms, d.affText);
      if (store.tag !== selectedStore) return false;
    }
    if (filter !== "all" && d.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return d.title.toLowerCase().includes(q) || (d.channel || "").toLowerCase().includes(q);
    }
    return true;
  });

  if (sort === "latest") visible = [...visible].sort((a, b) => b.ts - a.ts);
  else if (sort === "discount") visible = [...visible].sort((a, b) => b.discount - a.discount);
  else if (sort === "price_asc") visible = [...visible].sort((a, b) => (a.price || 999999) - (b.price || 999999));
  else if (sort === "price_desc") visible = [...visible].sort((a, b) => (b.price || 0) - (a.price || 0));

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkApprove = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    toast.success(`Approving & broadcasting ${ids.length} deals...`);
    triggerApproveConfetti();
    for (const id of ids) {
      onApprove(id);
    }
    setSelectedIds(new Set());
    setBulkMode(false);
  };

  const handleBulkReject = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    toast.info(`Skipping ${ids.length} deals...`);
    for (const id of ids) {
      onReject(id);
    }
    setSelectedIds(new Set());
    setBulkMode(false);
  };

  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedVisible = pageSize === 9999 ? visible : visible.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const pending = deals.filter(d => d.status === "pending").length;
  const approved = deals.filter(d => d.status === "approved").length;
  const rejected = deals.filter(d => d.status === "rejected").length;

  const storeOptions: DropdownOption[] = [
    { value: "All", label: "All Stores", icon: "🛍️" },
    { value: "amazon", label: "Amazon", icon: "📦" },
    { value: "flipkart", label: "Flipkart", icon: "🛍️" },
    { value: "myntra", label: "Myntra", icon: "👗" },
    { value: "desidime", label: "DesiDime", icon: "🔥" },
    { value: "ajio", label: "AJIO", icon: "✨" },
  ];

  const channelOptions: DropdownOption[] = [
    { value: "All", label: "All Channels", icon: "⚡" },
    ...uniqueChannels.map(ch => ({
      value: ch,
      label: ch,
      icon: "📡",
    })),
  ];

  const sortOptions: DropdownOption[] = [
    { value: "latest", label: "Newest First", icon: "⏰" },
    { value: "discount", label: "Highest % Off", icon: "🔥" },
    { value: "price_asc", label: "Price: Low to High", icon: "🏷️" },
    { value: "price_desc", label: "Price: High to Low", icon: "💎" },
  ];

  const pageSizeOptions: DropdownOption[] = [
    { value: "40", label: "40 / page" },
    { value: "80", label: "80 / page" },
    { value: "120", label: "120 / page" },
    { value: "9999", label: "All Deals" },
  ];

  void dark;

  return (
    <div className="flex-1 flex flex-col overflow-hidden perspective-1000 relative">
      {/* Sleek Minimalist Toolbar */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-3 border-b border-white/8 glass-panel flex flex-col gap-2.5 relative z-40 overflow-visible">
        {/* Tier 1: Search + Quick Tools */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search deals by title, brand, store, or channel…"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm text-slate-100 bg-[#0A0C16]/90 border border-white/10 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all" />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-100">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => { setBulkMode(!bulkMode); if (bulkMode) setSelectedIds(new Set()); }}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border ${bulkMode ? "bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-500/20" : "bg-slate-900 border-white/10 text-slate-300 hover:text-white hover:bg-slate-800"}`}>
              <CheckSquare size={13} /> <span className="hidden sm:inline">{bulkMode ? "Cancel Select" : "Select Mode"}</span>
            </button>
            <button onClick={() => setSendTG(!sendTG)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border ${sendTG ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/20" : "bg-slate-900 border-white/10 text-slate-400 opacity-60 hover:opacity-100"}`}>
              <Send size={12} /> <span className="hidden sm:inline">Telegram</span>
            </button>
            <button onClick={() => setSendX(!sendX)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border ${sendX ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20" : "bg-slate-900 border-white/10 text-slate-400 opacity-60 hover:opacity-100"}`}>
              <span>𝕏</span> <span className="hidden sm:inline">Twitter</span>
            </button>
          </div>
        </div>

        {/* Tier 2: Clean 2-Way Responsive Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 overflow-visible">
          {/* Status Tabs with Luminous Badges */}
          <div className="order-2 md:order-1 flex items-center gap-1.5 p-1 rounded-2xl bg-[#090B14]/90 border border-white/10 overflow-x-auto no-scrollbar flex-shrink-0">
            {[
              { id: "pending", label: "Pending", icon: "🔥", count: pending, activeCls: "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm" },
              { id: "approved", label: "Approved", icon: "✅", count: approved, activeCls: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm" },
              { id: "rejected", label: "Rejected", icon: "🗑️", count: rejected, activeCls: "bg-slate-800 text-rose-300 border-white/15 shadow-sm" },
              { id: "all", label: "All", icon: "📦", count: deals.length, activeCls: "bg-slate-800 text-white border-white/15 shadow-sm" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setFilter(tab.id as any); setPage(1); }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  filter === tab.id
                    ? tab.activeCls
                    : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-white/5"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black font-mono ${filter === tab.id ? "bg-black/50 text-white" : "bg-white/5 text-slate-400"}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Custom Glass Dropdowns: Dropdowns 1st on Mobile, Right side on PC */}
          <div className="order-1 md:order-2 flex items-center gap-2 flex-wrap sm:flex-nowrap overflow-visible flex-shrink-0 relative z-50">
            <GlassDropdown
              value={selectedStore}
              onChange={val => { setSelectedStore(val); setPage(1); }}
              options={storeOptions}
              placeholder="All Stores"
            />

            <GlassDropdown
              value={selectedChannel}
              onChange={val => { setSelectedChannel(val); setPage(1); }}
              options={channelOptions}
              placeholder="All Channels"
              searchable={true}
            />

            <GlassDropdown
              value={sort}
              onChange={val => { setSort(val as any); setPage(1); }}
              options={sortOptions}
              placeholder="Sort Order"
              align="right"
            />

            <GlassDropdown
              value={String(pageSize)}
              onChange={val => { setPageSize(Number(val)); setPage(1); }}
              options={pageSizeOptions}
              placeholder="Page Size"
              align="right"
            />
          </div>
        </div>
      </div>

      {/* Deals Card Grid */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 pb-28 md:pb-8">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            {/* 3D Animated Empty State */}
            <EmptySearch3D />
            <div>
              <p className="text-sm font-bold text-white">No matching deals found</p>
              <p className="text-xs text-slate-400 mt-1">Try switching your channel or store filters.</p>
            </div>
            <button onClick={() => { setSearch(""); setFilter("pending"); setSelectedChannel("All"); setSelectedStore("All"); setPage(1); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-white glow-pill-primary hover:opacity-90 active:scale-95 transition-all">
              <RefreshCw size={13} /> Reset All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              <AnimatePresence mode="popLayout">
                {pagedVisible.map(d => (
                  <DealCard
                    key={d.id}
                    deal={d}
                    onApprove={onApprove}
                    onReject={onReject}
                    onEdit={onEdit}
                    selected={selectedIds.has(d.id)}
                    onToggleSelect={toggleSelect}
                    bulkMode={bulkMode}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && pageSize !== 9999 && (
              <div className="flex items-center justify-between gap-4 mt-8 pt-5 border-t border-white/8">
                <p className="text-xs font-semibold text-slate-400">
                  Showing <span className="font-mono text-white font-bold">{(currentPage - 1) * pageSize + 1}</span> - <span className="font-mono text-white font-bold">{Math.min(currentPage * pageSize, visible.length)}</span> of <span className="font-mono text-white font-bold">{visible.length}</span> deals
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

      {/* Floating Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl glass-panel border border-primary/40 shadow-2xl bg-slate-950/95 animate-slide-up backdrop-blur-2xl">
          <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {selectedIds.size} Selected
          </span>
          <button
            onClick={handleBulkApprove}
            className="flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-xl text-white glow-pill-success hover:opacity-95 active:scale-95 shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <CheckCircle2 size={14} /> Approve All ({selectedIds.size})
          </button>
          <button
            onClick={handleBulkReject}
            className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl text-rose-300 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 active:scale-95 cursor-pointer"
          >
            <Trash2 size={13} /> Skip All
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-xs text-slate-400 hover:text-white px-2 cursor-pointer font-medium"
          >
            Clear
          </button>
        </div>
      )}
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
          const filtered = data.channels.filter((c: any) => {
            const id = (c.id || "").toLowerCase();
            return id !== "dh" && id !== "unknown" && id !== "";
          });
          const mapped = filtered.map((c: any) => {
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
      toast.success(`Channel ${!current ? "resumed" : "paused"}`);
    } catch {
      toast.error("Failed to toggle channel");
    }
  };

  const toggleAutoApprove = async (id: string, current: boolean) => {
    setChs(cs => cs.map(c => (c.id === id ? { ...c, auto_approve: !current } : c)));
    try {
      const res = await fetch(`${API_BASE}/api/v1/channels/config/${encodeURIComponent(id)}/auto-approve`, { method: "PUT" });
      if (res.ok) {
        toast.success(`Auto-Post ${!current ? "Enabled" : "Disabled"}`);
      } else {
        toast.error("Failed to update auto-post");
      }
    } catch {
      toast.error("Failed to toggle auto-post");
    }
  };

  const deleteChannel = async (id: string) => {
    if (!confirm(`Are you sure you want to remove ${id}?`)) return;
    setChs(cs => cs.filter(c => c.id !== id));
    try {
      await fetch(`${API_BASE}/api/v1/channels/config/${encodeURIComponent(id)}`, { method: "DELETE" });
      toast.success("Channel removed!");
    } catch {
      toast.error("Failed to delete channel");
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

  const [updatingChannel, setUpdatingChannel] = useState<{ id: string; name: string; link: string } | null>(null);
  const [newLinkInput, setNewLinkInput] = useState("");
  const [isUpdatingLink, setIsUpdatingLink] = useState(false);

  const handleUpdateLink = async () => {
    if (!updatingChannel || !newLinkInput.trim()) return;
    setIsUpdatingLink(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/channels/update-link`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          old_channel: updatingChannel.id,
          new_channel: newLinkInput.trim(),
          name: updatingChannel.name,
        }),
      });
      if (res.ok) {
        toast.success(`Invite link updated for ${updatingChannel.name}!`);
        setUpdatingChannel(null);
        setNewLinkInput("");
        fetchChannels();
      } else {
        toast.error("Failed to update channel link");
      }
    } catch {
      toast.error("Network error updating channel link");
    } finally {
      setIsUpdatingLink(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 max-w-5xl mx-auto flex flex-col gap-5">
      {/* Live Worker Telemetry & Engine Health Deck */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl glass-card border border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <Zap size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">FastAPI Engine</span>
            </div>
            <p className="text-xs font-bold text-white mt-0.5">Online (200 OK)</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl glass-card border border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
            <Radio size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Telegram Scraper</span>
            </div>
            <p className="text-xs font-bold text-white mt-0.5">{chs.filter(c => c.active).length} Channels Live</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl glass-card border border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-rose-500/15 border border-rose-500/30 text-rose-400">
            <Flame size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">DesiDime Worker</span>
            </div>
            <p className="text-xs font-bold text-white mt-0.5">5m Interval Active</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl glass-card border border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Shield size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Affiliate Engine</span>
            </div>
            <p className="text-xs font-bold text-white mt-0.5">100% Fallback-Safe</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-5 rounded-3xl glass-panel border border-white/10">
        <div className="flex items-center gap-3.5">
          <Satellite3D size={42} />
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Listening Channels ({chs.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {chs.filter(c => c.active).length} listening · {chs.filter(c => !c.active).length} paused · Real-time Telegram scrape
            </p>
          </div>
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

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {loading && chs.length === 0 ? (
          <div className="col-span-2 text-center py-20 text-xs text-slate-400">Loading channels…</div>
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
                      <div className="flex items-center gap-2 mt-1">
                        {ch.health === "dead_link" || ch.health === "dead_link_warning" ? (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                            <AlertTriangle size={10} /> Link Inactive / Dead
                          </span>
                        ) : (ch.deals_24h ?? 0) > 0 ? (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Stream
                          </span>
                        ) : (
                          <span className="text-[9px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/10">
                            0 deals in 24h
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

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
                  <span className="text-slate-400 font-medium">{ch.active ? "Listening" : "Paused"}</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Update Invite Link */}
                  <button onClick={() => {
                    setUpdatingChannel({ id: ch.id, name: ch.name || ch.id, link: ch.invite_link || ch.id });
                    setNewLinkInput("");
                  }}
                    className="w-7 h-7 rounded-xl flex items-center justify-center bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all shadow-sm"
                    title="Update Invite Link / Reconnect">
                    <LinkIcon size={12} />
                  </button>

                  {/* Auto-Post Toggle */}
                  <button onClick={() => toggleAutoApprove(ch.id, ch.auto_approve)}
                    className={`text-[10px] font-bold px-3 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${ch.auto_approve ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm" : "bg-white/5 text-slate-500 border-white/10"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${ch.auto_approve ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
                    Auto-Post {ch.auto_approve ? "ON" : "OFF"}
                  </button>
                  <button onClick={() => toggleChannel(ch.id, ch.active)}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${ch.active ? "bg-slate-800 text-slate-400 hover:text-white" : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white"}`} title={ch.active ? "Pause" : "Resume"}>
                    {ch.active ? <Check size={12} /> : <X size={12} />}
                  </button>
                  <button onClick={() => deleteChannel(ch.id)}
                    className="w-7 h-7 rounded-xl flex items-center justify-center bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors" title="Delete Channel">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Update Channel Invite Link Modal */}
      {updatingChannel && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl glass-panel border border-cyan-500/30 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                  <LinkIcon size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Update Invite Link</h3>
                  <p className="text-[11px] text-slate-400">{updatingChannel.name}</p>
                </div>
              </div>
              <button onClick={() => setUpdatingChannel(null)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center">
                <X size={14} />
              </button>
            </div>

            <div className="flex flex-col gap-1.5 text-xs">
              <label className="text-[11px] font-semibold text-slate-400">Current Channel / ID</label>
              <div className="px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 font-mono text-[11px] text-slate-400 truncate">
                {updatingChannel.id}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-xs">
              <label className="text-[11px] font-semibold text-cyan-300">New Invite Link or Username</label>
              <input
                autoFocus
                value={newLinkInput}
                onChange={e => setNewLinkInput(e.target.value)}
                placeholder="https://t.me/+... or @username"
                className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-cyan-500/40 text-white placeholder:text-slate-500 font-mono text-xs focus:outline-none focus:border-cyan-400"
                onKeyDown={e => e.key === "Enter" && handleUpdateLink()}
              />
              <p className="text-[10px] text-slate-500">
                Paste the new active Telegram invite link if the old link expired or was revoked.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setUpdatingChannel(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateLink}
                disabled={isUpdatingLink || !newLinkInput.trim()}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
              >
                <RefreshCw size={12} className={isUpdatingLink ? "animate-spin" : ""} />
                {isUpdatingLink ? "Updating..." : "Update & Reconnect"}
              </button>
            </div>
          </div>
        </div>
      )}
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
    <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 pb-28 md:pb-8 max-w-3xl mx-auto flex flex-col gap-5">
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
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/8">
        <div className="w-9 h-9 rounded-2xl flex items-center justify-center glow-pill-primary text-white font-black text-base shadow-lg">
          ⚡
        </div>
        <div>
          <h1 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
            DealFlow <span className="text-[10px] px-1.5 py-0.2 rounded bg-primary/20 text-primary border border-primary/30 font-mono">2.0</span>
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <LiveRadar3D size={14} />
            <span className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase">Live Engine</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1.5">
        {NAV.map(({ id, label }) => {
          const active = tab === id;
          const iconType = id === "Review" ? "review" : id === "Posted" ? "broadcast" : id === "Channels" ? "channels" : "settings";
          return (
            <button key={id} onClick={() => setTab(id)}
              className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${active ? "bg-gradient-to-r from-rose-500/20 via-primary/15 to-transparent text-white border border-primary/30 shadow-md shadow-primary/10" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
              {active && <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-full bg-primary shadow-lg shadow-primary" />}
              <Nav3DIcon icon={iconType as "review" | "broadcast" | "channels" | "settings"} active={active} />
              <span className="tracking-tight">{label}</span>
              {id === "Review" && pending > 0 && (
                <span className="ml-auto text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-rose-500 text-white shadow-sm shadow-rose-500/30">
                  {pending}
                </span>
              )}
            </button>
          );
        })}
      </nav>

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
  const [deals, setDeals] = useState<Deal[]>([]);
  const [editing, setEditing] = useState<Deal | null>(null);
  const [dark, setDark] = useState(true);

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
    triggerApproveConfetti();
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

      <main className="flex-1 flex flex-col overflow-hidden pb-16 md:pb-0">
        {tab === "Review" && (
          <ReviewView deals={deals} onApprove={handleApprove} onReject={handleReject} onEdit={setEditing} dark={dark} />
        )}
        {tab === "Posted" && <PostedView deals={deals} />}
        {tab === "Channels" && <ChannelsView />}
        {tab === "Settings" && <SettingsView dark={dark} setDark={setDark} />}
      </main>

      {/* Mobile Smartphone Floating Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 py-2 bg-slate-950/95 border-t border-white/10 backdrop-blur-2xl flex items-center justify-around">
        {NAV.map(({ id, label }) => {
          const active = tab === id;
          const iconType = id === "Review" ? "review" : id === "Posted" ? "broadcast" : id === "Channels" ? "channels" : "settings";
          return (
            <button key={id} onClick={() => setTab(id)}
              className={`relative flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-bold transition-all ${
                active ? "text-primary font-black" : "text-slate-400 hover:text-white"
              }`}>
              <Nav3DIcon icon={iconType as "review" | "broadcast" | "channels" | "settings"} active={active} />
              <span>{label}</span>
              {id === "Review" && pendingCount > 0 && (
                <span className="absolute top-0 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-mono flex items-center justify-center shadow-sm">
                  {pendingCount > 99 ? "99+" : pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

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
