import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { toast, Toaster } from "sonner";
import {
  Check, X, Search, Sun, Moon, Zap, Tag, Settings2, Radio,
  CheckSquare, Plus, PenLine, Upload, Sparkles, Download,
  Undo2, ExternalLink, Shield,
  Clock, Flame, RefreshCw, CheckCircle2,
  Maximize2, Copy, Link as LinkIcon, FileText,
  Globe, ArrowUpDown, ShoppingCart, Percent,
  Send, CheckCheck, Trash2, SlidersHorizontal, Eye,
  LayoutGrid, List, Columns, Smartphone, Layers, CornerDownLeft, Command,
  Volume2, VolumeX, Keyboard, TrendingUp
} from "lucide-react";
import {
  LiveRadar3D, FireFlame3D, RocketBroadcast3D, EmptySearch3D, triggerApproveConfetti
} from "./components/LottieAnimations";
import {
  Category3DIcon, Store3DBadge, Nav3DIcon, Stat3DPill, FloatingCart3D, Satellite3D, SavingsPill3D,
  Category3DPlaceholder, StudioWand3D, AllCaughtUp3D, EmptyFilter3D
} from "./components/Iconscout3DAssets";
import { GlassDropdown, DropdownOption } from "./components/GlassDropdown";
import {
  playApprove, playReject, playCopy, playTick,
  isSoundMuted, toggleSound
} from "./utils/soundFX";

// ─── Types ────────────────────────────────────────────────────────────────────
type DealStatus = "pending" | "approved" | "rejected" | "draft";
type DealType = "product" | "trick";
type Tab = "Review" | "Posted" | "Channels" | "Settings";

interface Deal {
  id: string; title: string; price: number; mrp: number; discount: number;
  category: string; catEmoji: string; channel: string; channelRaw: string;
  score: number; ts: number; status: DealStatus; dealType: DealType;
  affiliate: boolean; coupon: string | null; imgUrl: string;
  telegramImgUrl?: string;
  storeImgUrl?: string;
  uploadedImgUrl?: string;
  platforms: string[]; originalText: string; affText: string;
  verdict: string; signals: string[];
  clusterCount?: number;
  clusterChannels?: { name: string; channel: string; price?: number; ts?: number }[];
  bestPrice?: number;
  bestChannel?: string;
  affiliateWarn?: string;
}

interface RawDeal {
  aff_text: string; prices: { mrp: number | null; sale: number | null; discount_pct: number | null };
  prod_name: string; category: string; platforms: string[]; coupon: string | null;
  bank_offers: string[]; flash: unknown; img_path: string | null; ts: number;
  original_text: string; source_channel: string; affiliate_applied: boolean;
  original_msg_link: string; deal_type: string; score: number | null;
  img_url?: string;
  telegram_img_url?: string;
  store_img_url?: string;
  uploaded_img_url?: string;
  cluster_count?: number;
  cluster_channels?: { name: string; channel: string; price?: number; ts?: number }[];
  best_price?: number;
  best_channel?: string;
  affiliate_warn?: string;
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
      const u = d.img_url;
      if (u && !u.includes("74.225.250.0")) return u;
      if (u?.includes("74.225.250.0")) {
        const match = u.match(/\/images\/(.+)$/);
        if (match) return `${API_BASE}/images/${match[1]}`;
      }
      if (!d.img_path) return "";
      const fname = d.img_path.includes("/images/") ? "images/" + d.img_path.split("/images/").pop() : d.img_path;
      return `${API_BASE}/${fname}`;
    })(),
    telegramImgUrl: (() => {
      const u = d.telegram_img_url || d.img_url;
      if (u && !u.includes("74.225.250.0")) return u;
      if (u?.includes("74.225.250.0")) {
        const match = u.match(/\/images\/(.+)$/);
        if (match) return `${API_BASE}/images/${match[1]}`;
      }
      return "";
    })(),
    storeImgUrl: (() => {
      const u = d.store_img_url;
      if (u && !u.includes("74.225.250.0")) return u;
      if (u?.includes("74.225.250.0")) {
        const match = u.match(/\/images\/(.+)$/);
        if (match) return `${API_BASE}/images/${match[1]}`;
      }
      return "";
    })(),
    uploadedImgUrl: (() => {
      const u = d.uploaded_img_url;
      if (u && !u.includes("74.225.250.0")) return u;
      if (u?.includes("74.225.250.0")) {
        const match = u.match(/\/images\/(.+)$/);
        if (match) return `${API_BASE}/images/${match[1]}`;
      }
      return "";
    })(),
    platforms: d.platforms || [],
    originalText: d.original_text || "",
    affText: (d as any).ai_formatted_text || d.aff_text || d.original_text || "",
    verdict: "", signals: [],
    clusterCount: d.cluster_count || 1,
    clusterChannels: d.cluster_channels || [],
    bestPrice: d.best_price,
    bestChannel: d.best_channel,
    affiliateWarn: d.affiliate_warn,
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

async function apiUpdateDeal(id: string, changes: Record<string, unknown>): Promise<boolean> {
  try {
    const payload = mapChangesToBackend(changes);
    const res = await fetch(`${API_BASE}/api/v1/deals/${id}/edit`, {
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

function downloadImage(url?: string | null, filename: string = "deal-product.jpg") {
  if (!url) return;
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.target = "_blank";
    a.rel = "noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Downloading product asset...");
  } catch {
    window.open(url, "_blank");
  }
}

interface ScrapedProductData {
  imgUrl?: string | null;
  store_img_url?: string | null;
  telegram_img_url?: string | null;
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
    const storeImg = data.store_img_url || data.img_url || data.url || data.image_url || null;
    return {
      imgUrl: storeImg,
      store_img_url: storeImg,
      telegram_img_url: data.telegram_img_url || null,
      title: data.title || data.prod_name || null,
      category: data.category || null,
      price: data.prices?.sale || data.price || null,
      mrp: data.prices?.mrp || data.mrp || null,
      affText: data.aff_text || data.ai_formatted_text || null,
    };
  } catch { return null; }
}

async function apiQuickDrop(url: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/deals/quick-drop`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function fetchPromos(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/deals/promos?limit=50`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.promos) ? data.promos : [];
  } catch { return []; }
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

const getStoreAura = (tag: string) => {
  const t = tag.toLowerCase();
  if (t === "amazon") return "from-amber-500/90 via-orange-500/60 to-transparent";
  if (t === "flipkart") return "from-blue-500/90 via-amber-400/70 to-transparent";
  if (t === "myntra") return "from-pink-500/90 via-rose-400/60 to-transparent";
  if (t === "ajio") return "from-purple-500/90 via-indigo-400/60 to-transparent";
  if (t === "desidime") return "from-red-500/90 via-orange-500/60 to-transparent";
  return "from-emerald-500/70 via-teal-500/40 to-transparent";
};

// ─── Senior Pro Deal Card (Responsive Mobile Horizontal + Desktop Specular Grid) ───
function DealCard({
  deal, onApprove, onReject, onEdit,
  selected = false, onToggleSelect, bulkMode = false,
  isActive = false,
}: {
  deal: Deal;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onEdit: (deal: Deal) => void;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  bulkMode?: boolean;
  isActive?: boolean;
}) {
  const [lightbox, setLightbox] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const [copied, setCopied] = useState(false);
  const store = getStoreBadge(deal.platforms, deal.affText);
  const savings = deal.mrp > deal.price ? deal.mrp - deal.price : 0;
  const isSuperLoot = (deal.discount >= 70) || (savings >= 1500);
  const isUnder299 = deal.price > 0 && deal.price <= 299;
  const isFresh = (Date.now() / 1000 - deal.ts) < 900;

  const handleCopyPost = (e: React.MouseEvent) => {
    e.stopPropagation();
    const postText = deal.affText || deal.originalText || `${deal.title} @ ₹${deal.price}`;
    navigator.clipboard.writeText(postText);
    setCopied(true);
    playCopy();
    toast.success("📋 Deal post copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenStore = (e: React.MouseEvent) => {
    e.stopPropagation();
    const urlMatch = (deal.affText || deal.originalText || "").match(/https?:\/\/\S+/);
    const targetUrl = urlMatch ? urlMatch[0] : "";
    if (targetUrl) {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    } else {
      toast.info("No external store link found in deal");
    }
  };

  const handleApproveWithSound = (id: string) => {
    playApprove();
    onApprove(id);
  };

  const handleRejectWithSound = (id: string) => {
    playReject();
    onReject(id);
  };

  return (
    <motion.div layout
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`pro-card rounded-2xl overflow-hidden flex flex-col group relative transition-all ${
        selected ? "ring-2 ring-indigo-400 bg-indigo-500/10 border-indigo-400/50 shadow-lg shadow-indigo-500/20" : ""
      } ${isActive ? "ring-2 ring-emerald-400/90 shadow-[0_0_30px_rgba(16,185,129,0.35)] scale-[1.01] bg-emerald-500/[0.04]" : ""}`}>

      {/* Brand-Reactive Top Border Accent Line */}
      <div className={`absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r ${getStoreAura(store.tag)} z-30 opacity-90`} />

      <AnimatePresence>{lightbox && deal.imgUrl && <ImageLightbox src={deal.imgUrl} onClose={() => setLightbox(false)} />}</AnimatePresence>

      {/* ─── MOBILE LAYOUT: Compact Modern Split Specimen (sm:hidden) ─── */}
      <div className="flex sm:hidden p-2.5 gap-2.5 items-center">
        {/* Left: Square Media Box */}
        <div
          className="relative w-24 h-24 rounded-xl bg-[#080911] border border-white/8 flex items-center justify-center p-1.5 flex-shrink-0 cursor-zoom-in overflow-hidden"
          onClick={() => !imgErr && deal.imgUrl && setLightbox(true)}
        >
          {deal.imgUrl && !imgErr ? (
            <img src={deal.imgUrl} alt="" className="w-full h-full object-contain" onError={() => setImgErr(true)} />
          ) : (
            <Category3DPlaceholder category={deal.category} />
          )}

          {deal.discount > 0 && (
            <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950 font-mono text-[9px] font-black shadow-sm">
              {Math.round(deal.discount)}%
            </span>
          )}

          {deal.imgUrl && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                downloadImage(deal.imgUrl, `${deal.title.slice(0, 20)}.jpg`);
              }}
              className="absolute bottom-1 right-1 w-5 h-5 rounded-md bg-black/70 text-white/80 hover:text-white flex items-center justify-center backdrop-blur-md"
              title="Download"
            >
              <Download size={10} />
            </button>
          )}

          {(bulkMode || selected) && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onToggleSelect?.(deal.id); }}
              className={`absolute top-1 right-1 w-5 h-5 rounded-md flex items-center justify-center ${
                selected ? "bg-indigo-500 text-white" : "bg-black/80 border border-white/20 text-white/40"
              }`}
            >
              {selected ? <Check size={10} strokeWidth={3} /> : null}
            </button>
          )}
        </div>

        {/* Right: Content & Inline Action Strip */}
        <div className="flex-1 min-w-0 flex flex-col justify-between h-24">
          <div>
            <div className="flex items-center gap-1.5 justify-between">
              <div className="flex items-center gap-1 min-w-0">
                <Store3DBadge store={store.tag} />
                <Category3DIcon category={deal.category} size={13} />
                <span className="text-[10px] text-slate-400 truncate max-w-[80px]">{deal.channel}</span>
              </div>
              <span className="text-[9px] text-slate-500 font-mono flex-shrink-0">{fmtAgo(deal.ts)}</span>
            </div>

            <h4
              className="font-heading text-xs font-bold text-slate-100 line-clamp-1 leading-snug mt-1 hover:text-indigo-300 transition-colors cursor-pointer tracking-tight"
              onClick={() => onEdit(deal)}
              title={deal.title}
            >
              {deal.title}
            </h4>

            {/* Price Row */}
            <div className="flex items-center justify-between gap-1 mt-0.5">
              <div className="flex items-baseline gap-1.5">
                <span className="pro-price text-sm font-black text-emerald-300 tabular-nums">{fmt(deal.price)}</span>
                {deal.mrp > deal.price && (
                  <span className="text-[10px] text-slate-500 line-through font-mono tabular-nums">{fmt(deal.mrp)}</span>
                )}
              </div>
              {savings > 0 && <SavingsPill3D amount={savings} />}
            </div>
          </div>

          {/* Inline Touch Buttons (Thumb-friendly, 28px height) */}
          <div className="flex items-center gap-1.5 mt-auto" onClick={e => e.stopPropagation()}>
            {deal.status === "pending" ? (
              <>
                <button
                  onClick={() => handleRejectWithSound(deal.id)}
                  className="h-7 px-2.5 rounded-lg flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 border border-white/10 active:scale-95 text-[11px] font-bold cursor-pointer"
                  title="Skip"
                >
                  <X size={12} strokeWidth={2.5} />
                </button>
                <button
                  onClick={() => onEdit(deal)}
                  className="h-7 px-2.5 rounded-lg flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 active:scale-95 text-[11px] font-bold cursor-pointer flex-1 gap-1"
                  title="Edit & Tune"
                >
                  <PenLine size={11} /> <span>Tune</span>
                </button>
                <button
                  onClick={() => handleApproveWithSound(deal.id)}
                  className="h-7 px-3 rounded-lg text-[11px] font-black text-slate-950 flex items-center justify-center gap-1 bg-gradient-to-r from-emerald-400 to-teal-400 hover:brightness-105 active:scale-95 shadow-sm shadow-emerald-500/20 cursor-pointer flex-1"
                  title="Approve"
                >
                  <Check size={13} strokeWidth={3} /> <span>Post</span>
                </button>
              </>
            ) : (
              <span className={`text-[10px] font-bold py-0.5 px-2 rounded-md border flex-1 text-center ${
                deal.status === "approved" ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : "bg-slate-800 text-slate-400 border-white/10"
              }`}>
                {deal.status === "approved" ? "✓ Posted" : "✕ Skipped"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ─── DESKTOP/TABLET LAYOUT: Luxury Specimen Showcase Card (hidden sm:flex) ─── */}
      <div className="hidden sm:flex flex-col flex-1">
        {/* Header */}
        <div className="px-3.5 py-2.5 flex items-center justify-between gap-2 border-b border-white/6 bg-white/[0.02]">
          <div className="flex items-center gap-2 min-w-0">
            <Store3DBadge store={store.tag} />
            <Category3DIcon category={deal.category} size={15} />
            <span className="text-[11px] font-medium text-zinc-300 truncate max-w-[170px]">{deal.channel}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isFresh && (
              <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE
              </span>
            )}
            <span className="text-[10px] text-zinc-400 font-mono">{fmtAgo(deal.ts)}</span>
          </div>
        </div>

        {/* Media Showcase */}
        <div
          className="relative w-full h-48 bg-[#080911] flex items-center justify-center p-3 overflow-hidden cursor-zoom-in border-b border-white/6 group/img"
          onClick={() => !imgErr && deal.imgUrl && setLightbox(true)}
        >
          {deal.imgUrl && !imgErr ? (
            <>
              <img src={deal.imgUrl} alt={deal.title} className="max-h-full max-w-full object-contain filter drop-shadow-md group-hover/img:scale-105 transition-transform duration-200 ease-out" loading="lazy" onError={() => setImgErr(true)} />
              <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                <div className="p-2 rounded-lg bg-slate-900/90 text-white border border-white/20 shadow-xl">
                  <Maximize2 size={14} />
                </div>
              </div>
            </>
          ) : (
            <Category3DPlaceholder category={deal.category} />
          )}

          {/* Loot Badges in Media Box */}
          <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5">
            {isSuperLoot && (
              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-red-500 to-amber-500 text-white font-mono text-[9px] font-black shadow-md shadow-red-500/30 flex items-center gap-1">
                <span>🔥</span> SUPER LOOT
              </span>
            )}
            {isUnder299 && !isSuperLoot && (
              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-mono text-[9px] font-black shadow-md shadow-cyan-500/30 flex items-center gap-1">
                <span>⚡</span> UNDER ₹299
              </span>
            )}
            {deal.discount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-slate-950 font-mono text-[10px] font-black shadow-md shadow-amber-500/25 flex items-center gap-1">
                {Math.round(deal.discount)}% OFF
              </span>
            )}
            {deal.imgUrl && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); downloadImage(deal.imgUrl, `${deal.title.slice(0, 24).replace(/[^\w]/g, "_")}.jpg`); }}
                className="w-7 h-7 rounded-lg bg-black/60 hover:bg-black/90 text-white/70 hover:text-emerald-300 border border-white/15 flex items-center justify-center backdrop-blur-md transition-all active:scale-90 cursor-pointer shadow-lg"
                title="Download Asset"
              >
                <Download size={12} />
              </button>
            )}
          </div>

          {/* Quick Action Floating Bar on Card Hover */}
          <div
            className="absolute bottom-2 inset-x-2 z-30 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleCopyPost}
              className="px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-black/90 text-white hover:text-emerald-300 hover:bg-black border border-white/20 backdrop-blur-md shadow-xl flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              title="Copy formatted deal post"
            >
              {copied ? <Check size={11} className="text-emerald-400 stroke-[3]" /> : <Copy size={11} />}
              <span>{copied ? "Copied!" : "Copy Post"}</span>
            </button>
            <button
              type="button"
              onClick={handleOpenStore}
              className="px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-black/90 text-white hover:text-blue-300 hover:bg-black border border-white/20 backdrop-blur-md shadow-xl flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              title="Open product link"
            >
              <ExternalLink size={11} />
              <span>Store</span>
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onEdit(deal); }}
              className="px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-black/90 text-white hover:text-amber-300 hover:bg-black border border-white/20 backdrop-blur-md shadow-xl flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              title="Edit & Tune"
            >
              <PenLine size={11} />
              <span>Tune</span>
            </button>
          </div>

          {(bulkMode || selected) && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onToggleSelect?.(deal.id); }}
              className={`absolute top-2.5 left-2.5 z-30 w-6 h-6 rounded-lg flex items-center justify-center transition-all shadow-md ${
                selected ? "bg-indigo-500 text-white ring-2 ring-indigo-300 font-bold" : "bg-slate-900/90 text-white/40 border border-white/20 hover:border-white/40"
              }`}
            >
              {selected ? <Check size={12} className="stroke-[3]" /> : null}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-3.5 flex flex-col flex-1 justify-between gap-3 bg-gradient-to-b from-[#111322]/50 via-[#0C0E1A]/60 to-[#070810]/80">
          <div>
            <h4 className="font-heading text-[13.5px] font-bold text-zinc-100 line-clamp-2 leading-snug hover:text-indigo-300 transition-colors cursor-pointer tracking-tight" onClick={() => onEdit(deal)} title={deal.title}>
              {deal.title}
            </h4>
            <div className="flex items-center justify-between gap-2 mt-2 flex-wrap">
              {deal.price > 0 ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="pro-price text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-400 tabular-nums">{fmt(deal.price)}</span>
                    {deal.mrp > deal.price && <span className="text-xs text-zinc-500 line-through font-mono tabular-nums">{fmt(deal.mrp)}</span>}
                  </div>
                  {savings > 0 && <SavingsPill3D amount={savings} />}
                </>
              ) : (
                <span className="text-xs font-black text-amber-400 flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg"><span>⚡</span> Freebie Loot</span>
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 border-t border-white/6" onClick={e => e.stopPropagation()}>
            {deal.status === "pending" ? (
              <div className="flex items-center gap-2">
                <button onClick={() => handleRejectWithSound(deal.id)} className="h-9 px-3 rounded-xl flex items-center justify-center bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 border border-white/[0.08] active:scale-95 transition-all text-xs font-semibold cursor-pointer" title="Skip">
                  <X size={14} strokeWidth={2.5} /><span className="ml-1">Skip</span>
                </button>
                <button onClick={() => onEdit(deal)} className="h-9 px-3 rounded-xl flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white border border-white/[0.08] active:scale-95 transition-all text-xs font-semibold cursor-pointer flex-1" title="Edit & Tune">
                  <PenLine size={13} /><span className="ml-1.5">Edit & Tune</span>
                </button>
                <button onClick={() => handleApproveWithSound(deal.id)} className="h-9 px-4 rounded-xl text-xs font-black text-slate-950 flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:brightness-105 active:scale-95 shadow-md shadow-emerald-500/20 cursor-pointer flex-1 transition-all" title="Approve & Broadcast">
                  <Check size={15} strokeWidth={3} /><span>Approve</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <div className={`flex-1 text-center text-xs font-bold py-1.5 rounded-xl border ${deal.status === "approved" ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : "bg-slate-800/80 text-slate-300 border-white/10"}`}>
                  {deal.status === "approved" ? "✓ Broadcasted to Telegram" : "✕ Deal Skipped"}
                </div>
                <button onClick={() => onEdit(deal)} className="h-8 px-3 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-zinc-400 hover:text-white text-xs font-medium cursor-pointer">
                  <PenLine size={12} className="mr-1" /> View
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Linear-Style High-Density Table Row Component ───
function DealTableRow({
  deal, selected, bulkMode, isActive,
  onApprove, onReject, onEdit, onToggleSelect,
}: {
  deal: Deal;
  selected?: boolean;
  bulkMode?: boolean;
  isActive?: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onEdit: (deal: Deal) => void;
  onToggleSelect?: (id: string) => void;
}) {
  const store = getStoreBadge(deal.platforms, deal.affText);
  return (
    <div
      onClick={() => onEdit(deal)}
      className={`pro-table-row px-4 py-2 flex items-center gap-3.5 cursor-pointer group select-none ${
        isActive ? "pro-table-row-active" : ""
      } ${selected ? "bg-emerald-500/10" : ""}`}
    >
      {/* Checkbox */}
      {bulkMode && (
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => {
            e.stopPropagation();
            onToggleSelect?.(deal.id);
          }}
          className="w-4 h-4 rounded border-white/20 bg-slate-900 text-emerald-500 focus:ring-0 cursor-pointer flex-shrink-0"
        />
      )}

      {/* Thumbnail */}
      <div className="w-10 h-10 rounded-lg bg-[#080911] border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
        {deal.imgUrl ? (
          <img src={deal.imgUrl} alt={deal.title} className="w-full h-full object-contain p-0.5" />
        ) : (
          <Category3DIcon category={deal.category} size={18} />
        )}
      </div>

      {/* Store */}
      <div className="w-20 flex-shrink-0">
        <Store3DBadge store={store.tag} />
      </div>

      {/* Product Title */}
      <div className="flex-1 min-w-0">
        <span className="pro-title truncate block text-xs sm:text-[13px] group-hover:text-emerald-300 transition-colors">
          {deal.title}
        </span>
      </div>

      {/* Price & Discount */}
      <div className="w-28 sm:w-32 flex-shrink-0 text-right flex flex-col items-end">
        <div className="flex items-center gap-1.5">
          <span className="pro-price text-sm font-bold text-emerald-300">
            {fmt(deal.price)}
          </span>
          {deal.discount > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
              {Math.round(deal.discount)}%
            </span>
          )}
        </div>
        {deal.mrp > 0 && deal.mrp > deal.price && (
          <span className="text-[10px] text-zinc-500 line-through font-mono">
            {fmt(deal.mrp)}
          </span>
        )}
      </div>

      {/* Channel Source & Time */}
      <div className="hidden md:flex w-36 flex-shrink-0 items-center gap-1.5 text-xs text-zinc-400">
        <div className="w-3.5 h-3.5 rounded-full bg-slate-800 text-[8px] font-bold text-white flex items-center justify-center">
          {deal.channel[0]}
        </div>
        <span className="truncate flex-1 text-[11px]">{deal.channel}</span>
        <span className="text-[10px] text-zinc-500 font-mono">{fmtAgo(deal.ts)}</span>
      </div>

      {/* Quick Action Buttons */}
      <div className="w-20 sm:w-24 flex-shrink-0 flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
        {deal.status === "pending" ? (
          <>
            <button
              onClick={() => onReject(deal.id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 border border-white/10 transition-all active:scale-95 cursor-pointer"
              title="Skip"
            >
              <X size={13} />
            </button>
            <button
              onClick={() => onApprove(deal.id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 border border-emerald-500/40 transition-all active:scale-95 shadow-sm cursor-pointer"
              title="Approve"
            >
              <Check size={13} strokeWidth={2.5} />
            </button>
          </>
        ) : (
          <span className={`text-[11px] font-semibold ${deal.status === "approved" ? "text-emerald-300" : "text-slate-400"}`}>
            {deal.status === "approved" ? "✓ Posted" : "✕ Skipped"}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── 3-Pane Split Inspector Desk (Zero-Modal Workflow) ─────────────────────────
interface SplitPaneInspectorProps {
  deal: Deal | null;
  onApprove: (id: string, changes?: Partial<Deal>) => void;
  onReject: (id: string) => void;
  onUpdateDeal: (id: string, changes: Partial<Deal>) => void;
  onToast: (msg: string, type?: "success" | "error" | "info") => void;
}

function SplitPaneInspector({ deal, onApprove, onReject, onUpdateDeal, onToast }: SplitPaneInspectorProps) {
  if (!deal) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-zinc-500 border border-white/8 rounded-2xl bg-[#090B14]/80 backdrop-blur-xl">
        <Columns size={36} className="text-zinc-600 mb-3" />
        <h4 className="text-sm font-bold text-zinc-300">No Deal Selected</h4>
        <p className="text-xs text-zinc-500 max-w-xs mt-1">
          Click any deal from the left stream to inspect, live-tune, and broadcast immediately without popups.
        </p>
      </div>
    );
  }

  const [title, setTitle] = useState(deal.title);
  const [price, setPrice] = useState(String(deal.price || ""));
  const [mrp, setMrp] = useState(String(deal.mrp || ""));
  const [text, setText] = useState(deal.affText || deal.title || "");
  const [imgUrl, setImgUrl] = useState(deal.imgUrl || "");
  const [rewriting, setRewriting] = useState(false);
  const [scraping, setScraping] = useState(false);

  // Synchronize state when selected deal changes
  useEffect(() => {
    setTitle(deal.title);
    setPrice(String(deal.price || ""));
    setMrp(String(deal.mrp || ""));
    setText(deal.affText || deal.title || "");
    setImgUrl(deal.imgUrl || "");
  }, [deal.id]);

  const handleAiPreset = async (presetPrompt: string) => {
    setRewriting(true);
    onToast(`Applying AI tune: ${presetPrompt}...`, "info");
    try {
      const res = await apiAiRewrite(deal.id, presetPrompt);
      if (res) {
        setText(res);
        onUpdateDeal(deal.id, { affText: res });
        onToast("AI tune applied!", "success");
      }
    } catch {
      onToast("AI tuning failed", "error");
    } finally {
      setRewriting(false);
    }
  };

  const handleScrapeStore = async () => {
    setScraping(true);
    onToast("Scraping store details...", "info");
    try {
      const res = await apiScrapeImage(deal.id);
      if (res) {
        if (res.imgUrl) setImgUrl(res.imgUrl);
        if (res.title) setTitle(res.title);
        if (res.price) setPrice(String(res.price));
        if (res.mrp) setMrp(String(res.mrp));
        if (res.affText) setText(res.affText);
        onUpdateDeal(deal.id, {
          title: res.title || title,
          price: res.price ? Number(res.price) : deal.price,
          mrp: res.mrp ? Number(res.mrp) : deal.mrp,
          imgUrl: res.imgUrl || imgUrl,
          affText: res.affText || text,
        });
        onToast("✨ Product details updated from store!", "success");
      }
    } catch {
      onToast("Store scrape failed", "error");
    } finally {
      setScraping(false);
    }
  };

  const store = getStoreBadge(deal.platforms, deal.affText);

  return (
    <div className="h-full flex flex-col pro-split-inspector rounded-2xl overflow-hidden border border-white/8 shadow-2xl">
      {/* Top Header */}
      <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <Store3DBadge store={store.tag} />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white truncate max-w-[200px]">{deal.channel}</span>
            <span className="text-[10px] text-zinc-500 font-mono">{fmtAgo(deal.ts)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleScrapeStore}
            disabled={scraping}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/5 hover:bg-white/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            title="Fetch Store Details"
          >
            <RefreshCw size={11} className={scraping ? "animate-spin" : ""} /> Store
          </button>
        </div>
      </div>

      {/* Scrollable Inspector Body */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5">
        {/* Live Telegram Preview Bubble */}
        <div className="tg-bubble rounded-xl p-3 border border-white/10 bg-slate-950/70 shadow-inner">
          <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-white/6 text-xs text-zinc-300 font-bold">
            <div className="w-4 h-4 rounded-full bg-slate-800 text-[9px] font-bold text-white flex items-center justify-center">
              {deal.channel[0]}
            </div>
            <span className="truncate">{deal.channel}</span>
            <CheckCheck size={12} className="text-blue-400 ml-0.5" />
            <span className="text-[9px] text-emerald-400 font-mono ml-auto">Live Preview</span>
          </div>

          {/* Photo */}
          {imgUrl && (
            <div className="w-full h-36 rounded-lg bg-black/40 border border-white/8 mb-2.5 overflow-hidden flex items-center justify-center">
              <img src={imgUrl} alt="" className="max-h-full max-w-full object-contain p-1" />
            </div>
          )}

          {/* Message Text Rendering */}
          <div className="tg-bubble-text text-xs text-zinc-200 leading-relaxed font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
            {text.split("\n").slice(0, 10).join("\n")
              .replace(/\*\*(.+?)\*\*/g, (_, m) => `<b>${m}</b>`)
              .split(/(https?:\/\/\S+)/g)
              .map((part, i) =>
                /^https?:\/\//.test(part)
                  ? <a key={i} href={part} className="tg-bubble-link" target="_blank" rel="noreferrer">{part.length > 25 ? part.slice(0, 25) + "…" : part}</a>
                  : <span key={i} dangerouslySetInnerHTML={{ __html: part }} />
              )
            }
          </div>
        </div>

        {/* 1-Click AI Tuning Presets */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>✨ 1-Click AI Tuning</span>
            {rewriting && <span className="text-emerald-400 animate-pulse font-bold">Tuning...</span>}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { label: "🔥 Urgency", prompt: "Add urgency, limited time and deal emojis" },
              { label: "✂️ Concise", prompt: "Make concise, strip clutter, keep link and price" },
              { label: "💰 Highlight % Off", prompt: "Emphasize maximum discount percentage and savings" },
              { label: "✨ Format", prompt: "Format clean bullet points with verified emojis" },
            ].map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleAiPreset(p.prompt)}
                disabled={rewriting}
                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white/5 hover:bg-emerald-500/20 text-zinc-300 hover:text-emerald-300 border border-white/10 hover:border-emerald-500/30 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price & MRP Inline Inputs */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">Sale Price (₹)</label>
            <input
              type="number"
              value={price}
              onChange={e => {
                setPrice(e.target.value);
                onUpdateDeal(deal.id, { price: Number(e.target.value) || 0 });
              }}
              className="w-full px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono text-emerald-400 bg-slate-950/80 border border-white/10 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">MRP Price (₹)</label>
            <input
              type="number"
              value={mrp}
              onChange={e => {
                setMrp(e.target.value);
                onUpdateDeal(deal.id, { mrp: Number(e.target.value) || 0 });
              }}
              className="w-full px-2.5 py-1.5 rounded-lg text-xs font-mono text-zinc-400 bg-slate-950/80 border border-white/10 focus:outline-none focus:border-white/20"
            />
          </div>
        </div>

        {/* Message Editor Textarea */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between">
            <span>Edit Broadcast Message</span>
            <span>{text.length} chars</span>
          </label>
          <textarea
            value={text}
            rows={4}
            onChange={e => {
              setText(e.target.value);
              onUpdateDeal(deal.id, { affText: e.target.value });
            }}
            className="w-full p-2.5 rounded-xl text-xs font-mono text-zinc-200 bg-slate-950/90 border border-white/10 focus:outline-none focus:border-emerald-500/40 resize-none"
          />
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="p-3 border-t border-white/8 bg-slate-950/90 flex items-center gap-2">
        <button
          onClick={() => onReject(deal.id)}
          className="px-3 py-2.5 rounded-xl text-xs font-bold bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 border border-white/10 flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
        >
          <X size={14} /> Skip
        </button>
        <button
          onClick={() => {
            onApprove(deal.id, {
              title,
              price: Number(price) || deal.price,
              mrp: Number(mrp) || deal.mrp,
              affText: text,
              imgUrl,
            });
            triggerApproveConfetti();
          }}
          className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 hover:from-emerald-300 hover:to-teal-300 flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/30 active:scale-95 transition-all cursor-pointer"
        >
          <Check size={15} strokeWidth={3} /> Broadcast Deal Now
        </button>
      </div>
    </div>
  );
}



// ─── Raycast Command Palette Modal ─────────────────────────────────────────────
interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  deals: Deal[];
  uniqueChannels: string[];
  onSelectStore: (store: string) => void;
  onSelectChannel: (channel: string) => void;
  onSelectViewMode: (mode: "grid" | "table" | "split") => void;
  onSelectMobileMode: (mode: "stream" | "swipe") => void;
  onQuickDrop: () => void;
  onEditDeal: (deal: Deal) => void;
  onApproveDeal: (id: string) => void;
}

function CommandPaletteModal({
  isOpen, onClose, deals, uniqueChannels,
  onSelectStore, onSelectChannel, onSelectViewMode, onSelectMobileMode,
  onQuickDrop, onEditDeal, onApproveDeal,
}: CommandPaletteModalProps) {
  const [query, setQuery] = useState("");

  if (!isOpen) return null;

  const stores = ["Amazon", "Flipkart", "Myntra", "DesiDime", "AJIO"];
  const filteredStores = stores.filter(s => s.toLowerCase().includes(query.toLowerCase()));
  const filteredChannels = uniqueChannels.filter(c => c.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
  const matchingDeals = deals
    .filter(d => d.title.toLowerCase().includes(query.toLowerCase()) || d.channel.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 6);

  return (
    <div className="fixed inset-0 z-[999999] flex items-start justify-center pt-20 p-4 backdrop-blur-2xl bg-black/75" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -10 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-xl rounded-2xl pro-command-palette overflow-hidden border border-white/12 shadow-2xl flex flex-col"
      >
        {/* Search Bar */}
        <div className="p-3.5 border-b border-white/10 flex items-center gap-3">
          <Search size={16} className="text-zinc-400 flex-shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command, store, channel, or deal title..."
            className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none font-medium"
          />
          <span className="text-[10px] font-mono text-zinc-500 px-2 py-0.5 rounded bg-white/5 border border-white/10">
            ESC to close
          </span>
        </div>

        {/* Command Body */}
        <div className="max-h-[60vh] overflow-y-auto p-2 flex flex-col gap-3">
          {/* Quick Actions */}
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 px-2 mb-1 block">
              Quick Actions
            </span>
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => { onQuickDrop(); onClose(); }}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-zinc-200 hover:bg-emerald-500/15 hover:text-emerald-300 flex items-center gap-2.5 text-left transition-colors cursor-pointer"
              >
                <Zap size={13} className="text-emerald-400" />
                <span>⚡ Quick Drop URL (Ingest & Scrape Store)</span>
              </button>
              <button
                onClick={() => { onSelectViewMode("split"); onClose(); }}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-zinc-200 hover:bg-white/10 flex items-center gap-2.5 text-left transition-colors cursor-pointer"
              >
                <Columns size={13} className="text-cyan-400" />
                <span>📐 Switch to Split-Pane Command Desk</span>
              </button>
              <button
                onClick={() => { onSelectViewMode("table"); onClose(); }}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-zinc-200 hover:bg-white/10 flex items-center gap-2.5 text-left transition-colors cursor-pointer"
              >
                <List size={13} className="text-amber-400" />
                <span>⚡ Switch to Linear Dense Table</span>
              </button>
              <button
                onClick={() => { onSelectViewMode("grid"); onClose(); }}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-zinc-200 hover:bg-white/10 flex items-center gap-2.5 text-left transition-colors cursor-pointer"
              >
                <LayoutGrid size={13} className="text-purple-400" />
                <span>🖼️ Switch to Showcase Grid</span>
              </button>
              <button
                onClick={() => { onSelectMobileMode("swipe"); onClose(); }}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-zinc-200 hover:bg-white/10 flex items-center gap-2.5 text-left transition-colors cursor-pointer sm:hidden"
              >
                <Smartphone size={13} className="text-emerald-400" />
                <span>🎴 Switch to Mobile Swipe Deck Mode</span>
              </button>
            </div>
          </div>

          {/* Store Filters */}
          {filteredStores.length > 0 && (
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 px-2 mb-1 block">
                Filter by Store
              </span>
              <div className="grid grid-cols-2 gap-1">
                {filteredStores.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => { onSelectStore(s.toLowerCase()); onClose(); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 hover:bg-white/10 flex items-center gap-2 text-left transition-colors cursor-pointer"
                  >
                    <span>🛍️</span> {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Channel Filters */}
          {filteredChannels.length > 0 && (
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 px-2 mb-1 block">
                Filter by Stream Channel
              </span>
              <div className="flex flex-col gap-0.5">
                {filteredChannels.map((c, idx) => (
                  <button
                    key={idx}
                    onClick={() => { onSelectChannel(c); onClose(); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 hover:bg-white/10 flex items-center gap-2 text-left transition-colors cursor-pointer"
                  >
                    <span>📡</span> <span className="truncate">{c}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matching Deals */}
          {query.trim().length > 1 && matchingDeals.length > 0 && (
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 px-2 mb-1 block">
                Matching Deals
              </span>
              <div className="flex flex-col gap-1">
                {matchingDeals.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => { onEditDeal(d); onClose(); }}
                    className="px-3 py-2 rounded-xl bg-white/[0.02] hover:bg-white/10 border border-white/5 flex items-center justify-between gap-3 cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="text-sm">{d.catEmoji}</span>
                      <span className="text-xs font-medium text-zinc-200 truncate group-hover:text-emerald-300">
                        {d.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="pro-price text-xs font-bold text-emerald-400">
                        {fmt(d.price)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onApproveDeal(d.id);
                          onClose();
                        }}
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/40"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
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
  const [telegramImg, setTelegramImg] = useState(deal.telegramImgUrl || deal.imgUrl || "");
  const [storeImg, setStoreImg] = useState(deal.storeImgUrl || "");
  const [uploadedImg, setUploadedImg] = useState(deal.uploadedImgUrl || "");
  const [imgUrl, setImgUrl] = useState(deal.imgUrl || deal.telegramImgUrl || "");
  const [imgFile, setImgFile] = useState<string | null>(null);
  const [instruction, setInstruction] = useState("");
  const [rewriting, setRewriting] = useState(false);
  const [prev, setPrev] = useState<string | null>(null);
  const [retryingAffiliate, setRetryingAffiliate] = useState(false);
  const [scrapingImage, setScrapingImage] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const previewSrc = imgFile || imgUrl || null;
  const isDirty = title !== deal.title || price !== String(deal.price || "") || imgUrl !== deal.imgUrl || text !== deal.affText || imgFile !== null;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    
    // 1. Instant local preview with zero network delay
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setImgFile(dataUrl);
      setImgUrl(dataUrl);
      setUploadedImg(dataUrl);
    };
    reader.readAsDataURL(f);

    // 2. Upload to server
    const fd = new FormData();
    fd.append("file", f);
    try {
      onToast("Uploading image to server...", "info");
      const res = await fetch(`${API_BASE}/api/v1/deals/${deal.id}/image`, { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        const serverImg = data.img_url || data.uploaded_img_url;
        if (serverImg) {
          setImgUrl(serverImg);
          setUploadedImg(serverImg);
        }
        onToast("Image uploaded to server successfully!", "success");
      } else {
        onToast("Uploaded to local preview (server returned non-200)", "info");
      }
    } catch {
      onToast("Network issue uploading to server, keeping local preview", "info");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
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
    try {
      const result = await apiScrapeImage(deal.id);
      if (result) {
        const newStoreImg = result.store_img_url || result.imgUrl;
        if (newStoreImg) {
          setStoreImg(newStoreImg);
          setImgUrl(newStoreImg);
          setImgFile(null);
        }
        if (result.telegram_img_url && !telegramImg) {
          setTelegramImg(result.telegram_img_url);
        }
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
        onToast("✨ Scraped store photo & details! Switch between Telegram & Store photo anytime above.", "success");
      } else {
        onToast("Failed to fetch product details", "error");
      }
    } catch {
      onToast("Store scrape error", "error");
    } finally {
      setScrapingImage(false);
    }
  };

  const changes: Partial<Deal> = {
    title,
    imgUrl: uploadedImg || imgFile || imgUrl,
    telegramImgUrl: telegramImg,
    storeImgUrl: storeImg,
    uploadedImgUrl: uploadedImg,
    price: Number(price) || deal.price,
    mrp: Number(mrp) || deal.mrp,
    affText: text,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-xl"
      style={{ background: "rgba(3, 7, 18, 0.85)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      
      <div className="relative w-full max-w-4xl h-[94vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-2xl border border-white/10 bg-[#0A0C16]/95 backdrop-blur-2xl shadow-2xl shadow-black/80 flex flex-col overflow-hidden">
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10 bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <StudioWand3D size={36} />
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-white tracking-wide truncate">Edit &amp; Tune Deal</h2>
              <p className="text-[11px] text-slate-400 truncate">
                {deal.channel ? `${deal.channel} · ` : ""}Source: {deal.channelRaw || "Direct"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex-shrink-0">
            <X size={17} />
          </button>
        </div>

        {/* Scrollable Body Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-0">
          {/* Left Form */}
          <div className="md:col-span-7 p-4 sm:p-6 flex flex-col gap-4 border-r border-white/10">
            {/* Title */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Product Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-slate-950/80 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50" />
            </div>

            {/* Price Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Sale Price (₹)</label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-950/80 border border-white/10 text-emerald-400 focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">MRP Price (₹)</label>
                <input type="number" value={mrp} onChange={e => setMrp(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-slate-950/80 border border-white/10 text-slate-400 focus:outline-none focus:border-white/20" />
              </div>
            </div>

            {/* Dual Image Choice Selector + Download Action */}
            {(telegramImg || storeImg || uploadedImg || imgFile) && (
              <div className="flex flex-col gap-2 p-3 rounded-2xl bg-slate-950/80 border border-white/8 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <span>🖼️</span> Active Broadcast Photo:
                  </span>
                  {previewSrc && (
                    <button
                      type="button"
                      onClick={() => downloadImage(previewSrc, `${title.slice(0, 24).replace(/[^\w]/g, "_")}.jpg`)}
                      className="text-[10px] text-zinc-400 hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer font-semibold px-2 py-0.5 rounded-lg bg-white/5 border border-white/10"
                      title="Download active photo to device"
                    >
                      <Download size={11} />
                      <span>Download</span>
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {telegramImg && (
                    <button
                      type="button"
                      onClick={() => { setImgUrl(telegramImg); setImgFile(null); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                        imgUrl === telegramImg && !imgFile
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/60 ring-2 ring-emerald-500/30 shadow-md"
                          : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-slate-200"
                      }`}
                    >
                      <img src={telegramImg} alt="" className="w-5 h-5 rounded object-cover" />
                      <span>📸 Telegram Photo</span>
                    </button>
                  )}
                  {storeImg && (
                    <button
                      type="button"
                      onClick={() => { setImgUrl(storeImg); setImgFile(null); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                        imgUrl === storeImg && !imgFile
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/60 ring-2 ring-emerald-500/30 shadow-md"
                          : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-slate-200"
                      }`}
                    >
                      <img src={storeImg} alt="" className="w-5 h-5 rounded object-cover" />
                      <span>🛍️ Store Product Photo</span>
                    </button>
                  )}
                  {(uploadedImg || imgFile) && (
                    <button
                      type="button"
                      onClick={() => { if (uploadedImg) setImgUrl(uploadedImg); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                        (imgUrl === uploadedImg || imgFile)
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/60 ring-2 ring-emerald-500/30 shadow-md"
                          : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-slate-200"
                      }`}
                    >
                      <img src={imgFile || uploadedImg} alt="" className="w-5 h-5 rounded object-cover" />
                      <span>⬆️ Custom Upload</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Affiliate Text */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Affiliate Post Text</label>
                <span className="text-[10px] text-slate-400 font-mono">{text.length} chars</span>
              </div>

              {/* AI Prompt Input */}
              <div className="relative">
                <input type="text" placeholder='AI tune command: "make concise", "highlight discount"...'
                  value={instruction} onChange={e => setInstruction(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && doRewrite()}
                  className="w-full pl-3.5 pr-20 py-2 rounded-xl text-xs bg-slate-950/80 border border-white/10 text-slate-300 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50" />
                <button onClick={doRewrite} disabled={rewriting || !instruction.trim()}
                  className="absolute right-1 top-1 bottom-1 px-2.5 rounded-lg text-[10px] font-bold bg-emerald-400 text-slate-950 hover:bg-emerald-300 disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer">
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
                    className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 hover:border-emerald-500/40 transition-all cursor-pointer">
                    {chip.label}
                  </button>
                ))}
              </div>

              <textarea value={text} onChange={e => setText(e.target.value)} rows={6}
                className="w-full px-3.5 py-3 rounded-xl text-xs font-mono bg-slate-950/80 border border-white/10 text-slate-200 focus:outline-none focus:border-emerald-500/50 resize-none leading-relaxed" />
            </div>

            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <button onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors cursor-pointer">
                <Upload size={12} /> Upload Image
              </button>
              <button onClick={doScrapeImage} disabled={scrapingImage}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-40 transition-colors cursor-pointer">
                <Globe size={12} /> {scrapingImage ? "Fetching..." : "Fetch Store Details"}
              </button>
              <button onClick={doRetryAffiliate} disabled={retryingAffiliate}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-40 transition-colors cursor-pointer">
                <Zap size={12} /> Refresh Affiliate
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </div>
          </div>

          {/* Right Live Telegram Mockup */}
          <div className="md:col-span-5 p-4 sm:p-5 flex flex-col gap-3 bg-slate-950/70 border-t md:border-t-0 border-white/10">
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

        {/* Sticky Footer Actions with 3D Rocket */}
        <div className="sticky bottom-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 border-t border-white/10 bg-[#060810]/95 backdrop-blur-xl">
          <button onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/5 border border-white/10 transition-colors cursor-pointer">
            Cancel
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => { onSaveDraft(changes); onClose(); }} disabled={!isDirty}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors disabled:opacity-40 cursor-pointer">
              Save Draft
            </button>
            <button onClick={() => { onSaveApprove(changes); onClose(); }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white glow-pill-success hover:opacity-90 active:scale-95 transition-all shadow-lg flex items-center gap-2 cursor-pointer">
              <RocketBroadcast3D size={16} /> Save & Broadcast
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Review View ──────────────────────────────────────────────────────────────
// ─── Review View ──────────────────────────────────────────────────────────────
function ReviewView({ deals, onApprove, onReject, onEdit, onAddDeal, onRefresh, dark }: {
  deals: Deal[]; onApprove: (id: string) => void;
  onReject: (id: string) => void; onEdit: (d: Deal) => void;
  onAddDeal: (deal: Deal) => void; onRefresh?: () => void; dark: boolean;
}) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"latest" | "discount" | "price_asc" | "price_desc">("latest");
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "promos" | "all">("pending");
  const [selectedChannel, setSelectedChannel] = useState<string>("All");
  const [selectedStore, setSelectedStore] = useState<string>("All");
  const [pageSize, setPageSize] = useState<number>(40);
  const [page, setPage] = useState(1);
  const [sendTG, setSendTG] = useState(true);
  const [sendX, setSendX] = useState(false);
  const [promos, setPromos] = useState<any[]>([]);
  const [isDropping, setIsDropping] = useState(false);
  const [quickDropModal, setQuickDropModal] = useState(false);
  const [modalUrl, setModalUrl] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table" | "split">("grid");
  const [mobileMode, setMobileMode] = useState<"stream" | "swipe">("stream");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [selectedSplitId, setSelectedSplitId] = useState<string | null>(null);
  const [smartPreset, setSmartPreset] = useState<string>("all");
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [soundMuted, setSoundMutedState] = useState<boolean>(isSoundMuted());

  const handleToggleSound = () => {
    const next = toggleSound();
    setSoundMutedState(next);
    toast.info(next ? "🔇 Audio haptics muted" : "🔊 Audio haptics enabled");
  };

  useEffect(() => {
    fetchPromos().then(setPromos);
  }, []);

  // Cmd+K / Ctrl+K Universal Command Palette
  useEffect(() => {
    const handleCmdK = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleCmdK);
    return () => window.removeEventListener("keydown", handleCmdK);
  }, []);


  const handleQuickDrop = async (url: string) => {
    const cleanUrl = url.trim();
    if (!cleanUrl || isDropping) return;
    setIsDropping(true);
    toast.loading("⚡ Ingesting, unshortening & scraping store details...", { id: "quickdrop" });
    try {
      const res = await apiQuickDrop(cleanUrl);
      if (res?.success) {
        triggerApproveConfetti();
        toast.success(`🎉 Ingested: ${res.prod_name || "New Deal"}!`, { id: "quickdrop" });
        const newDeal: Deal = {
          id: res.fp_hash,
          title: cleanDealTitle(res.prod_name, res.message),
          price: res.price || res.prices?.sale || 0,
          mrp: res.mrp || res.prices?.mrp || 0,
          discount: res.discount || res.prices?.discount_pct || 0,
          category: res.category || "General",
          catEmoji: "🛍️",
          channel: "Quick Drop",
          channelRaw: "manual_drop",
          score: 100,
          ts: Math.floor(Date.now() / 1000),
          status: "pending",
          dealType: "product",
          affiliate: true,
          coupon: null,
          imgUrl: res.img_url || "",
          platforms: ["Manual"],
          originalText: cleanUrl,
          affText: res.message || cleanUrl,
          verdict: "Manual Quick Drop",
          signals: [],
          clusterCount: 1,
        };
        onAddDeal(newDeal);
        setSearch("");
        setModalUrl("");
        setQuickDropModal(false);
        setFilter("pending");
        setPage(1);
      } else {
        toast.error("Failed to ingest URL. Please verify the store link.", { id: "quickdrop" });
      }
    } catch {
      toast.error("Network error during Quick Drop", { id: "quickdrop" });
    } finally {
      setIsDropping(false);
    }
  };

  const isSearchUrl = search.trim().startsWith("http://") || search.trim().startsWith("https://");

  const uniqueChannels = Array.from(new Set(deals.map(d => d.channel)))
    .filter(ch => Boolean(ch) && ch.toLowerCase() !== "unknown" && ch.toLowerCase() !== "dh")
    .sort();

  let visible = deals.filter(d => {
    if (selectedChannel !== "All" && d.channel !== selectedChannel) return false;
    if (selectedStore !== "All") {
      const store = getStoreBadge(d.platforms, d.affText);
      if (store.tag !== selectedStore) return false;
    }
    if (filter !== "all" && filter !== "promos" && d.status !== filter) return false;
    if (search.trim() && !isSearchUrl) {
      const q = search.toLowerCase();
      return d.title.toLowerCase().includes(q) || (d.channel || "").toLowerCase().includes(q);
    }
    if (smartPreset === "super_loot") {
      const isSuper = (d.discount >= 70) || (d.mrp - d.price >= 1500);
      if (!isSuper) return false;
    } else if (smartPreset === "under_499") {
      if (!(d.price > 0 && d.price <= 499)) return false;
    } else if (smartPreset === "electronics") {
      const cat = d.category.toLowerCase();
      if (!cat.includes("electronics") && !cat.includes("audio") && !cat.includes("computer") && !cat.includes("gaming")) return false;
    } else if (smartPreset === "fashion") {
      const cat = d.category.toLowerCase();
      if (!cat.includes("fashion") && !cat.includes("footwear") && !cat.includes("beauty")) return false;
    } else if (smartPreset === "grocery") {
      const cat = d.category.toLowerCase();
      if (!cat.includes("grocery") && !cat.includes("food")) return false;
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
    playApprove();
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
    playReject();
    for (const id of ids) {
      onReject(id);
    }
    setSelectedIds(new Set());
    setBulkMode(false);
  };

  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedVisible = pageSize === 9999 ? visible : visible.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const selectedSplitDeal = pagedVisible.find(d => d.id === selectedSplitId) || pagedVisible[0] || null;

  const pending = deals.filter(d => d.status === "pending").length;
  const approved = deals.filter(d => d.status === "approved").length;
  const rejected = deals.filter(d => d.status === "rejected").length;

  // Velocity and Smart Curation Telemetry
  const superLootCount = deals.filter(d => (filter === "all" || d.status === filter) && ((d.discount >= 70) || (d.mrp - d.price >= 1500))).length;
  const under499Count = deals.filter(d => (filter === "all" || d.status === filter) && d.price > 0 && d.price <= 499).length;
  const approvedToday = deals.filter(d => d.status === "approved" && (Date.now() / 1000 - d.ts) < 86400).length;
  const totalQueueSavings = visible.reduce((acc, d) => acc + (d.mrp > d.price ? d.mrp - d.price : 0), 0);
  const avgDiscount = visible.length > 0 ? Math.round(visible.reduce((acc, d) => acc + (d.discount || 0), 0) / visible.length) : 0;

  useEffect(() => {
    setActiveIndex(-1);
  }, [page, smartPreset, filter, selectedChannel, selectedStore]);

  // Pro Curation Keyboard Shortcuts: J, K, A, X, E, C, O
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex(prev => {
          const next = Math.min(pagedVisible.length - 1, prev + 1);
          playTick();
          return next;
        });
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex(prev => {
          const next = Math.max(0, prev - 1);
          playTick();
          return next;
        });
      } else if (e.key.toLowerCase() === "a") {
        if (activeIndex >= 0 && activeIndex < pagedVisible.length) {
          e.preventDefault();
          const targetDeal = pagedVisible[activeIndex];
          if (targetDeal.status === "pending") {
            playApprove();
            onApprove(targetDeal.id);
          }
        }
      } else if (e.key.toLowerCase() === "x") {
        if (activeIndex >= 0 && activeIndex < pagedVisible.length) {
          e.preventDefault();
          const targetDeal = pagedVisible[activeIndex];
          if (targetDeal.status === "pending") {
            playReject();
            onReject(targetDeal.id);
          }
        }
      } else if (e.key.toLowerCase() === "e") {
        if (activeIndex >= 0 && activeIndex < pagedVisible.length) {
          e.preventDefault();
          onEdit(pagedVisible[activeIndex]);
        }
      } else if (e.key.toLowerCase() === "c") {
        if (activeIndex >= 0 && activeIndex < pagedVisible.length) {
          e.preventDefault();
          const d = pagedVisible[activeIndex];
          const postText = d.affText || d.originalText || `${d.title} @ ₹${d.price}`;
          navigator.clipboard.writeText(postText);
          playCopy();
          toast.success("📋 Deal post copied!");
        }
      } else if (e.key.toLowerCase() === "o") {
        if (activeIndex >= 0 && activeIndex < pagedVisible.length) {
          e.preventDefault();
          const d = pagedVisible[activeIndex];
          const urlMatch = (d.affText || d.originalText || "").match(/https?:\/\/\S+/);
          if (urlMatch) window.open(urlMatch[0], "_blank");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, pagedVisible, onApprove, onReject, onEdit]);

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
      {/* Sleek Senior Minimalist Toolbar */}
      <div className="flex-shrink-0 px-3 sm:px-6 py-2.5 sm:py-3 border-b border-white/8 glass-panel flex flex-col gap-2.5 relative z-40 overflow-visible">
        {/* Tier 1: Search + Essential Actions */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            {isSearchUrl ? (
              <Zap size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 fill-emerald-400 animate-pulse" />
            ) : (
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            )}
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              onKeyDown={e => {
                if (e.key === "Enter" && isSearchUrl && !isDropping) {
                  e.preventDefault();
                  handleQuickDrop(search);
                }
              }}
              placeholder={isSearchUrl ? "⚡ Press Enter to Quick-Drop deal..." : "Search deals or paste product URL…"}
              className={`w-full pl-9 pr-8 sm:pr-28 py-2 rounded-xl text-xs sm:text-sm text-slate-100 bg-[#0A0C16]/90 border transition-all ${
                isSearchUrl 
                  ? "border-emerald-500/60 ring-2 ring-emerald-500/30"
                  : "border-white/10 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
              }`}
            />
            {isSearchUrl ? (
              <button
                type="button"
                disabled={isDropping}
                onClick={() => handleQuickDrop(search)}
                className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Zap size={11} className="fill-slate-950" />
                <span className="hidden sm:inline">Drop</span>
              </button>
            ) : search ? (
              <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-100 p-1">
                <X size={13} />
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => setQuickDropModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border bg-indigo-500/15 text-indigo-300 border-indigo-500/30 hover:border-indigo-400 active:scale-95 cursor-pointer shadow-sm"
              title="Quick Drop"
            >
              <Zap size={13} className="fill-indigo-400 text-indigo-400" />
              <span className="hidden md:inline">Quick Drop</span>
            </button>
            <button
              onClick={() => { setBulkMode(!bulkMode); if (bulkMode) setSelectedIds(new Set()); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                bulkMode
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/25"
                  : "bg-white/[0.04] border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08]"
              }`}
              title="Select Mode"
            >
              <CheckSquare size={13} />
              <span className="hidden md:inline">{bulkMode ? "Cancel" : "Select"}</span>
            </button>
            <button
              onClick={() => setSendTG(!sendTG)}
              className={`hidden sm:flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                sendTG
                  ? "bg-emerald-600/90 text-white border-emerald-500 shadow-sm"
                  : "bg-white/[0.04] border-white/10 text-slate-400 opacity-60"
              }`}
            >
              <Send size={11} /> <span>TG</span>
            </button>
            <button
              onClick={handleToggleSound}
              className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer active:scale-95 ${
                soundMuted
                  ? "bg-white/[0.04] border-white/10 text-slate-400 opacity-60 hover:opacity-100"
                  : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-sm"
              }`}
              title={soundMuted ? "Audio Haptics Muted (Click to enable)" : "Audio Haptics Enabled (Click to mute)"}
            >
              {soundMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
              <span className="hidden lg:inline">{soundMuted ? "Muted" : "Audio"}</span>
            </button>
          </div>
        </div>

        {/* ─── MOBILE CONTROLS (2-Tier High-Efficiency Layout on sm:hidden) ─── */}
        <div className="flex sm:hidden flex-col gap-2">
          {/* Mobile Tier 1: Quick Filter Dropdowns + View Switcher */}
          <div className="flex items-center justify-between gap-1.5 overflow-visible">
            <div className="flex items-center gap-1.5 overflow-visible flex-1 min-w-0">
              <GlassDropdown
                value={selectedStore}
                onChange={val => { setSelectedStore(val); setPage(1); }}
                options={storeOptions}
                placeholder="Store"
                className="flex-1 min-w-0"
              />
              <GlassDropdown
                value={selectedChannel}
                onChange={val => { setSelectedChannel(val); setPage(1); }}
                options={channelOptions}
                placeholder="Channel"
                searchable={true}
                className="flex-1 min-w-0"
              />
              <GlassDropdown
                value={sort}
                onChange={val => { setSort(val as any); setPage(1); }}
                options={sortOptions}
                placeholder="Sort"
                align="right"
              />
            </div>

            {/* View Switcher Pill */}
            <div className="flex items-center p-0.5 rounded-full bg-[#080913]/90 border border-white/15 shadow-inner flex-shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                  viewMode === "grid" ? "bg-white/20 text-white shadow-sm border border-white/25" : "text-zinc-400"
                }`}
                title="Cards View"
              >
                <LayoutGrid size={13} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                  viewMode === "table" ? "bg-white/20 text-white shadow-sm border border-white/25" : "text-zinc-400"
                }`}
                title="List View"
              >
                <List size={13} />
              </button>
            </div>
          </div>

          {/* Mobile Tier 2: Status Tabs Horizontal Scroll Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth flex-nowrap py-0.5" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {[
              { id: "pending", label: "Pending", count: pending },
              { id: "approved", label: "Approved", count: approved },
              { id: "rejected", label: "Rejected", count: rejected },
              { id: "promos", label: "Promos", count: promos.length },
              { id: "all", label: "All", count: deals.length },
            ].map(tab => (
              <Stat3DPill
                key={tab.id}
                id={tab.id}
                label={tab.label}
                count={tab.count}
                active={filter === tab.id}
                onClick={() => { setFilter(tab.id as any); setPage(1); }}
              />
            ))}
          </div>
        </div>

        {/* ─── DESKTOP/TABLET CONTROLS (Spacious 2-Tier on hidden sm:flex) ─── */}
        <div className="hidden sm:flex flex-col gap-3">
          {/* Tier 2: View Switcher (The Pill!) + Store/Channel Dropdowns */}
          <div className="flex items-center justify-between gap-2 overflow-visible">
            <div className="flex items-center p-0.5 rounded-full bg-[#080913]/90 border border-white/15 shadow-inner flex-shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white/20 text-white shadow-md border border-white/25 scale-[1.02]"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
                title="Cards Showcase View"
              >
                <LayoutGrid size={13} />
                <span className="text-[11px] font-bold">Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white/20 text-white shadow-md border border-white/25 scale-[1.02]"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
                title="Dense List View"
              >
                <List size={13} />
                <span className="text-[11px] font-bold">List</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("split")}
                className={`hidden lg:flex px-3 py-1.5 rounded-full transition-all items-center gap-1.5 cursor-pointer ${
                  viewMode === "split"
                    ? "bg-emerald-500/30 text-emerald-300 shadow-md border border-emerald-400/40 scale-[1.02]"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
                title="3-Pane Split Inspector Desk"
              >
                <Columns size={13} />
                <span className="text-[11px] font-bold">Inspector</span>
              </button>
            </div>

            {/* Quick Filter Dropdowns */}
            <div className="flex items-center gap-1.5 overflow-visible flex-shrink-0">
              <GlassDropdown
                value={selectedStore}
                onChange={val => { setSelectedStore(val); setPage(1); }}
                options={storeOptions}
                placeholder="Store"
              />
              <GlassDropdown
                value={selectedChannel}
                onChange={val => { setSelectedChannel(val); setPage(1); }}
                options={channelOptions}
                placeholder="Channel"
                searchable={true}
              />
              <GlassDropdown
                value={sort}
                onChange={val => { setSort(val as any); setPage(1); }}
                options={sortOptions}
                placeholder="Sort"
                align="right"
              />
              <div className="hidden md:block">
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

          {/* Tier 3: Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth flex-nowrap py-0.5" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {[
              { id: "pending", label: "Pending", count: pending },
              { id: "approved", label: "Approved", count: approved },
              { id: "rejected", label: "Rejected", count: rejected },
              { id: "promos", label: "Promos", count: promos.length },
              { id: "all", label: "All", count: deals.length },
            ].map(tab => (
              <Stat3DPill
                key={tab.id}
                id={tab.id}
                label={tab.label}
                count={tab.count}
                active={filter === tab.id}
                onClick={() => { setFilter(tab.id as any); setPage(1); }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ─── CURATOR VELOCITY & SMART PRESET PULSE BAR ─── */}
      <div className="flex-shrink-0 px-3 sm:px-6 py-2 bg-[#090B14]/90 border-b border-white/6 flex items-center justify-between gap-3 flex-wrap relative z-30">
        {/* Left: Velocity Metrics */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-bold">
            <TrendingUp size={12} className="text-emerald-400" />
            <span>{approvedToday} Approved Today</span>
          </div>
          {totalQueueSavings > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium">
              <span>💰</span>
              <span>₹{totalQueueSavings.toLocaleString("en-IN")} Savings In View</span>
            </div>
          )}
          {avgDiscount > 0 && (
            <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium">
              <span>🔥</span>
              <span>Avg {avgDiscount}% Off</span>
            </div>
          )}
        </div>

        {/* Right: Smart Filter Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 mr-1 hidden xl:inline">Presets:</span>
          {[
            { id: "all", label: "All Deals" },
            { id: "super_loot", label: "🔥 Super Loot", count: superLootCount },
            { id: "under_499", label: "⚡ Under ₹499", count: under499Count },
            { id: "electronics", label: "📱 Tech" },
            { id: "fashion", label: "👗 Fashion" },
            { id: "grocery", label: "🛒 Grocery" },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => { setSmartPreset(p.id); setPage(1); }}
              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 active:scale-95 ${
                smartPreset === p.id
                  ? "bg-white/20 text-white border border-white/30 shadow-sm"
                  : "bg-white/[0.03] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] border border-white/5"
              }`}
            >
              <span>{p.label}</span>
              {p.count !== undefined && (
                <span className="text-[9px] font-mono opacity-80 font-normal">({p.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Deals Card Grid / Linear Table / Split Inspector */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 pb-28 md:pb-8">
        {filter === "promos" ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/8 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎟️</span>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Promo & Cashback Stream</h3>
                  <p className="text-[11px] text-slate-400">Auto-filtered UPI, referral, cashback, and app loot offers</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                {promos.length} Active Offers
              </span>
            </div>

            {promos.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center gap-2 text-slate-500">
                <span className="text-4xl">🎟️</span>
                <p className="font-bold text-slate-300">No Promos Captured Yet</p>
                <p className="text-xs text-slate-500">Incoming UPI, GPay, or cashback broadcasts will be routed here automatically.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {promos.map((p, idx) => (
                  <div key={idx} className="glass-card p-4 rounded-2xl flex flex-col gap-3 border border-amber-500/20 bg-gradient-to-b from-amber-500/[0.04] to-transparent hover:border-amber-500/40 transition-all">
                    <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
                      <span className="flex items-center gap-1.5 truncate max-w-[160px]">
                        <Tag size={12} className="text-amber-400 flex-shrink-0" />
                        <span className="truncate">{p.channel_title || p.channel}</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">{fmtAgo(p.ts || p.processed_ts)}</span>
                    </div>
                    <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-mono line-clamp-4 bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
                      {p.text}
                    </p>
                    <div className="mt-auto pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono">Promo Loot</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(p.text);
                          toast.success("Promo text copied!");
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                      >
                        <Copy size={12} /> Copy Offer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : visible.length === 0 ? (
          filter === "pending" && !search.trim() && selectedChannel === "All" && selectedStore === "All" ? (
            <AllCaughtUp3D onRefresh={onRefresh} />
          ) : (
            <EmptyFilter3D onClear={() => { setSearch(""); setFilter("pending"); setSelectedChannel("All"); setSelectedStore("All"); setPage(1); }} />
          )
        ) : viewMode === "split" ? (
          /* 3-Pane Command Desk (Split Inspector View) */
          <div className="pro-split-container flex-1 h-[calc(100vh-210px)] min-h-[550px]">
            {/* Left Stream (~55% width) */}
            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-2">
              {pagedVisible.map((d) => {
                const isSel = (selectedSplitDeal?.id === d.id);
                const storeBadge = getStoreBadge(d.platforms, d.affText);
                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedSplitId(d.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 select-none ${
                      isSel
                        ? "bg-emerald-500/10 border-emerald-400/50 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-400/40"
                        : "bg-white/[0.02] border-white/6 hover:border-white/15 hover:bg-white/[0.04]"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-11 h-11 rounded-lg bg-[#080911] border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {d.imgUrl ? (
                        <img src={d.imgUrl} alt="" className="w-full h-full object-contain p-0.5" />
                      ) : (
                        <Category3DIcon category={d.category} size={20} />
                      )}
                    </div>

                    {/* Center Details */}
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <Store3DBadge store={storeBadge.tag} />
                        <span className="text-[10px] text-zinc-400 truncate">{d.channel}</span>
                        <span className="text-[10px] text-zinc-500 font-mono ml-auto">{fmtAgo(d.ts)}</span>
                      </div>
                      <h5 className="text-xs font-semibold text-zinc-200 truncate group-hover:text-emerald-300">
                        {d.title}
                      </h5>
                      <div className="flex items-center gap-2">
                        <span className="pro-price text-xs font-bold text-emerald-400">
                          {fmt(d.price)}
                        </span>
                        {d.mrp > 0 && d.mrp > d.price && (
                          <span className="text-[10px] text-zinc-500 line-through font-mono">
                            {fmt(d.mrp)}
                          </span>
                        )}
                        {d.discount > 0 && (
                          <span className="text-[9px] font-bold px-1 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            {Math.round(d.discount)}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right Inline Action */}
                    <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => onReject(d.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 border border-white/10 cursor-pointer transition-all active:scale-95"
                        title="Skip"
                      >
                        <X size={13} />
                      </button>
                      <button
                        onClick={() => onApprove(d.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 border border-emerald-500/40 shadow-sm cursor-pointer transition-all active:scale-95"
                        title="Approve"
                      >
                        <Check size={13} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Sticky Inspector (~45% width) */}
            <div className="hidden lg:block w-[420px] xl:w-[460px] flex-shrink-0 h-full">
              <SplitPaneInspector
                deal={selectedSplitDeal}
                onApprove={(id, customChanges) => {
                  if (customChanges) {
                    const target = deals.find(d => d.id === id);
                    if (target) Object.assign(target, customChanges);
                  }
                  onApprove(id);
                }}
                onReject={onReject}
                onUpdateDeal={(id, changes) => {
                  const target = deals.find(d => d.id === id);
                  if (target) Object.assign(target, changes);
                }}
                onToast={toast as any}
              />
            </div>
          </div>
        ) : viewMode === "table" ? (
          /* Linear-Style High-Density Table View */
          <div className="rounded-2xl border border-white/8 bg-gradient-to-b from-[#111320]/90 to-[#0A0C16]/90 backdrop-blur-xl overflow-hidden shadow-2xl">
            <div className="px-4 py-2.5 bg-white/[0.03] border-b border-white/8 flex items-center gap-3.5 text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">
              {bulkMode && <div className="w-4 flex-shrink-0" />}
              <div className="w-10 flex-shrink-0 text-center">Media</div>
              <div className="w-20 flex-shrink-0">Store</div>
              <div className="flex-1">Product Title</div>
              <div className="w-28 sm:w-32 text-right">Price / Off</div>
              <div className="hidden md:block w-36">Channel</div>
              <div className="w-20 sm:w-24 text-right">Actions</div>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {pagedVisible.map((d) => (
                <DealTableRow
                  key={d.id}
                  deal={d}
                  selected={selectedIds.has(d.id)}
                  onToggleSelect={toggleSelect}
                  bulkMode={bulkMode}
                  onApprove={onApprove}
                  onReject={onReject}
                  onEdit={onEdit}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Gallery Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
            <AnimatePresence mode="popLayout">
              {pagedVisible.map((d) => (
                <DealCard
                  key={d.id}
                  deal={d}
                  onApprove={onApprove}
                  onReject={onReject}
                  onEdit={onEdit}
                  selected={selectedIds.has(d.id)}
                  onToggleSelect={toggleSelect}
                  bulkMode={bulkMode}
                  isActive={pagedVisible[activeIndex]?.id === d.id}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination Controls */}
        {visible.length > 0 && filter !== "promos" && totalPages > 1 && pageSize !== 9999 && (
          <div className="flex items-center justify-between gap-4 mt-8 pt-5 border-t border-white/8">
            <p className="text-xs font-semibold text-slate-400">
              Showing <span className="font-mono text-white font-bold">{(currentPage - 1) * pageSize + 1}</span> - <span className="font-mono text-white font-bold">{Math.min(currentPage * pageSize, visible.length)}</span> of <span className="font-mono text-white font-bold">{visible.length}</span> deals
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-white/10 bg-white/5 text-white hover:bg-white/10 disabled:opacity-40 transition-colors cursor-pointer">
                Previous
              </button>
              <span className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 text-white border border-white/15">
                Page {currentPage} of {totalPages}
              </span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-white/10 bg-white/5 text-white hover:bg-white/10 disabled:opacity-40 transition-colors cursor-pointer">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dedicated Quick Drop Glass Modal */}
      <AnimatePresence>
        {quickDropModal && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 backdrop-blur-2xl bg-black/85">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg rounded-3xl glass-card border border-emerald-500/30 p-6 flex flex-col gap-4 shadow-2xl bg-gradient-to-b from-[#0F1424] to-[#090C16]"
            >
              <div className="flex items-center justify-between border-b border-white/8 pb-3">
                <div className="flex items-center gap-2.5">
                  <FloatingCart3D size={38} />
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                      Quick Drop Deal
                    </h3>
                    <p className="text-[11px] text-slate-400">Paste any store link → instant unshorten, scrape & affiliate</p>
                  </div>
                </div>
                <button
                  onClick={() => { setQuickDropModal(false); setModalUrl(""); }}
                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Supported Store Icons Pill */}
              <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-slate-400 font-mono">
                <span className="text-slate-500 mr-1">Supported:</span>
                <Store3DBadge store="Amazon" />
                <Store3DBadge store="Flipkart" />
                <Store3DBadge store="Myntra" />
                <Store3DBadge store="AJIO" />
                <Store3DBadge store="DesiDime" />
                <Store3DBadge store="Blinkit" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Product / Shortlink URL</label>
                <div className="relative">
                  <LinkIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    autoFocus
                    value={modalUrl}
                    onChange={e => setModalUrl(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && modalUrl.trim() && !isDropping) {
                        e.preventDefault();
                        handleQuickDrop(modalUrl);
                      }
                    }}
                    placeholder="https://amzn.in/... or https://fkrt.cc/..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-slate-950/80 border border-white/15 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setQuickDropModal(false); setModalUrl(""); }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!modalUrl.trim() || isDropping}
                  onClick={() => handleQuickDrop(modalUrl)}
                  className="px-5 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/30 active:scale-95 disabled:opacity-40 cursor-pointer"
                >
                  {isDropping ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" /> Ingesting...
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} /> Drop & Ingest Deal
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

      {/* Floating Keyboard Navigation HUD (Desktop Pro Mode) */}
      <div className="hidden lg:flex fixed bottom-4 right-6 z-40 items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/90 border border-emerald-500/30 shadow-2xl backdrop-blur-xl text-[11px] font-mono text-zinc-300 pointer-events-none">
        <div className="flex items-center gap-1 text-emerald-400 font-bold">
          <Keyboard size={13} />
          <span>Pro</span>
        </div>
        <span className="text-zinc-600">•</span>
        <span className="text-zinc-400"><kbd className="px-1 py-0.5 rounded bg-white/10 text-white text-[10px]">J</kbd>/<kbd className="px-1 py-0.5 rounded bg-white/10 text-white text-[10px]">K</kbd> Nav</span>
        <span className="text-zinc-600">•</span>
        <span className="text-emerald-300"><kbd className="px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">A</kbd> Post</span>
        <span className="text-zinc-600">•</span>
        <span className="text-rose-300"><kbd className="px-1 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px]">X</kbd> Skip</span>
        <span className="text-zinc-600">•</span>
        <span className="text-amber-300"><kbd className="px-1 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">E</kbd> Tune</span>
        <span className="text-zinc-600">•</span>
        <span className="text-cyan-300"><kbd className="px-1 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px]">C</kbd> Copy</span>
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
        <div className="flex items-center gap-3">
          <RocketBroadcast3D size={36} />
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Broadcasted Deals History ({postedDeals.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Live timeline of deals sent to Telegram & X</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {postedDeals.map(d => (
          <div key={d.id} className="p-4 rounded-2xl glass-card flex items-center gap-4 border border-white/8 hover:border-white/15">
            {d.imgUrl ? (
              <img src={d.imgUrl} alt="" className="w-14 h-14 rounded-xl object-contain bg-slate-950/80 p-1 border border-white/10 flex-shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 flex-shrink-0">
                <Category3DIcon category={d.category} size={28} />
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
              className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                active 
                  ? "bg-indigo-500/15 text-white border border-indigo-500/30 shadow-sm shadow-indigo-500/10" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}>
              {active && <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-full bg-indigo-500 shadow-md shadow-indigo-500" />}
              <Nav3DIcon icon={iconType as "review" | "broadcast" | "channels" | "settings"} active={active} />
              <span className="tracking-tight">{label}</span>
              {id === "Review" && pending > 0 && (
                <span className="ml-auto text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-sm">
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

  const handleApprove = async (id: string, changes?: Partial<Deal>) => {
    triggerApproveConfetti();
    setDeals(prev => prev.map(d => d.id === id ? { ...d, ...(changes || {}), status: "approved" } : d));
    toast.success("Deal approved & broadcasted!");
    await apiApprove(id, changes);
  };

  const handleSaveDraft = async (id: string, changes: Partial<Deal>) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, ...changes } : d));
    toast.success("Deal draft updated!");
    await apiUpdateDeal(id, changes);
  };

  const handleReject = async (id: string) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, status: "rejected" } : d));
    toast.info("Deal skipped");
    await apiReject(id);
  };

  const handleAddDeal = (deal: Deal) => {
    setDeals(prev => [deal, ...prev]);
  };

  const pendingCount = deals.filter(d => d.status === "pending").length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#07080E] text-white relative">
      <div className="ambient-mesh" />
      <Toaster position="top-right" richColors theme="dark" />
      <Sidebar tab={tab} setTab={setTab} pending={pendingCount} dark={dark} setDark={setDark} />

      <main className="flex-1 flex flex-col overflow-hidden pb-16 md:pb-0 relative z-10">
        {tab === "Review" && (
          <ReviewView deals={deals} onApprove={handleApprove} onReject={handleReject} onEdit={setEditing} onAddDeal={handleAddDeal} onRefresh={loadDeals} dark={dark} />
        )}
        {tab === "Posted" && <PostedView deals={deals} />}
        {tab === "Channels" && <ChannelsView />}
        {tab === "Settings" && <SettingsView dark={dark} setDark={setDark} />}
      </main>

      {/* Mobile Smartphone Floating Bottom Navigation Capsule */}
      <nav className="md:hidden fixed bottom-1.5 left-2 right-2 z-40 px-2 py-1 bg-slate-950/92 border border-white/12 backdrop-blur-2xl rounded-2xl shadow-2xl flex items-center justify-around">
        {NAV.map(({ id, label }) => {
          const active = tab === id;
          const iconType = id === "Review" ? "review" : id === "Posted" ? "broadcast" : id === "Channels" ? "channels" : "settings";
          return (
            <button key={id} onClick={() => setTab(id)}
              className={`relative flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-bold transition-all ${
                active ? "text-indigo-400 font-black" : "text-slate-400 hover:text-white"
              }`}>
              <Nav3DIcon icon={iconType as "review" | "broadcast" | "channels" | "settings"} active={active} />
              <span className="text-[9.5px] tracking-tight">{label}</span>
              {id === "Review" && pendingCount > 0 && (
                <span className="absolute -top-0.5 right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[9px] font-mono font-bold flex items-center justify-center shadow-sm">
                  {pendingCount > 99 ? "99+" : pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {editing && (
        <EditModal
          deal={editing}
          onClose={() => setEditing(null)}
          onSaveDraft={async (chg) => {
            await handleSaveDraft(editing.id, chg);
            setEditing(null);
          }}
          onSaveApprove={async (chg) => {
            await handleApprove(editing.id, chg);
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
