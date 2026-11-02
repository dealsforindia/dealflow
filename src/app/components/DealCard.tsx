import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, X, SlidersHorizontal, MoreHorizontal, ExternalLink, Copy, Download, Link as LinkIcon, Square, CheckSquare } from "lucide-react";
import { StoreLogo } from "./StoreLogo";
import { Category3DPlaceholder } from "./Iconscout3DAssets";
import { playApprove, playReject, playCopy } from "../utils/soundFX";
import { toast } from "sonner";

export interface Deal {
  id: string;
  title: string;
  price: number;
  isFree?: boolean;
  mrp: number;
  discount: number;
  category: string;
  catEmoji: string;
  channel: string;
  channelRaw: string;
  score: number;
  ts: number;
  status: "publishing" | "pending" | "approved" | "rejected" | "draft" | "auto_posted";
  dealType: "product" | "trick";
  affiliate: boolean;
  coupon: string | null;
  couponDiscount?: number | null;
  effectivePrice?: number | null;
  imgUrl: string;
  telegramImgUrl?: string;
  storeImgUrl?: string;
  uploadedImgUrl?: string;
  platforms: string[];
  originalText: string;
  affText: string;
  verdict: string;
  signals: string[];
  clusterCount?: number;
  clusterChannels?: { name: string; channel: string; price?: number; ts?: number }[];
  bestPrice?: number;
  bestChannel?: string;
  liveOnWeb?: boolean;
  liveOnTelegram?: boolean;
  desidimeTemperature?: number;
  isCommunityVerified?: boolean;
  pendingRedirection?: boolean;
  [key: string]: any;
}

const fmt = (p: number, explicitlyFree = false) =>
  !Number.isFinite(p) || p <= 0
    ? p === 0 && explicitlyFree
      ? "Free"
      : "Price unavailable"
    : `₹${Math.round(p).toLocaleString("en-IN")}`;

const fmtAgo = (ts: number) => {
  const d = Math.floor(Date.now() / 1000 - ts);
  if (d < 60) return `${d}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  const h = Math.floor(d / 3600);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

function getTitleAndSpecs(rawTitle: string, category?: string, originalText?: string) {
  let clean = (rawTitle || "").replace(/^[👉🔥⚡🛍️🎁🛒📦💥📢🏷️✨🚨📌▶️➔➡*_\-•—\s"']+/g, "").trim();
  clean = clean.replace(/\[.*?\]\(.*?\)/g, "").replace(/\[.*?\]/g, "").trim();

  // 1. Check for parenthesized specs
  const parenMatch = clean.match(/^([^(]+)\s*\(([^)]+)\)$/);
  if (parenMatch && parenMatch[1].trim().length > 3) {
    return {
      title: parenMatch[1].trim(),
      specs: parenMatch[2].trim(),
    };
  }

  // 2. Check for bracketed specs
  const bracketMatch = clean.match(/^([^[]+)\s*\[([^\]]+)\]$/);
  if (bracketMatch && bracketMatch[1].trim().length > 3) {
    return {
      title: bracketMatch[1].trim(),
      specs: bracketMatch[2].trim(),
    };
  }

  // 3. Check for pipe separator
  if (clean.includes(" | ")) {
    const parts = clean.split(" | ");
    return {
      title: parts[0].trim(),
      specs: parts.slice(1).join(" | ").trim(),
    };
  }

  // 4. Check for dash separator
  if (clean.includes(" - ") && clean.indexOf(" - ") > 6) {
    const parts = clean.split(" - ");
    return {
      title: parts[0].trim(),
      specs: parts.slice(1).join(" - ").trim(),
    };
  }

  // 5. Check for comma specifications
  const commaIdx = clean.indexOf(", ");
  if (commaIdx > 8 && commaIdx < clean.length - 4) {
    return {
      title: clean.slice(0, commaIdx).trim(),
      specs: clean.slice(commaIdx + 2).trim(),
    };
  }

  // 6. Look for specs keywords in title (e.g. 128GB, 1400W, 14 inch, etc.)
  const specRegex = /\b(\d+\s*(?:GB|TB|MB|W|Watt|ml|Litre|L|kg|g|inch|mm|cm|Hz|mAh|pack(?:\s+of\s+\d+)?|pcs|touch|wireless|bluetooth))\b/i;
  const specMatch = clean.match(specRegex);
  if (specMatch && specMatch.index && specMatch.index > 8) {
    return {
      title: clean.slice(0, specMatch.index).replace(/[,|\-]\s*$/, "").trim(),
      specs: clean.slice(specMatch.index).trim(),
    };
  }

  // 7. Check original text for a specs line
  if (originalText) {
    const lines = originalText.split("\n").map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (line !== clean && line.length > 3 && line.length < 40 && !line.includes("http") && !line.includes("₹") && !line.includes("Rs")) {
        return {
          title: clean,
          specs: line.replace(/^[👉🔥⚡🛍️🎁🛒📦💥📢🏷️✨🚨📌•—\-\s]+/g, "").trim(),
        };
      }
    }
  }

  return {
    title: clean || "Featured Deal",
    specs: category && category !== "General" ? `${category} · Verified Drop` : "Product URL",
  };
}

export function DealCard({
  deal,
  onApprove,
  onReject,
  onEdit,
  selected,
  onToggleSelect,
  bulkMode,
  isActive,
}: {
  deal: Deal;
  onApprove: (id: string, changes?: Partial<Deal>) => void;
  onReject: (id: string) => void;
  onEdit: (d: Deal) => void;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  bulkMode?: boolean;
  isActive?: boolean;
}) {
  const [imgErr, setImgErr] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const displayPrice = deal.bestPrice && deal.bestPrice < deal.price ? Math.round(deal.bestPrice) : Math.round(deal.price);
  const { title: mainTitle, specs: specsSubtitle } = getTitleAndSpecs(deal.title, deal.category, deal.originalText);

  // Derive store name
  const rawStore = deal.platforms?.[0] || deal.channel || "Direct";
  let storeName = "Direct";
  const low = (rawStore + " " + (deal.affText || "")).toLowerCase();
  if (low.includes("amazon") || low.includes("amzn")) storeName = "Amazon";
  else if (low.includes("bigbasket") || low.includes("bb")) storeName = "BigBasket";
  else if (low.includes("myntra") || low.includes("myntr")) storeName = "Myntra";
  else if (low.includes("flipkart") || low.includes("fkrt")) storeName = "Flipkart";
  else if (low.includes("croma")) storeName = "Croma";
  else if (low.includes("nykaa")) storeName = "Nykaa";
  else if (low.includes("ajio")) storeName = "AJIO";
  else if (low.includes("swiggy")) storeName = "Swiggy";
  else if (low.includes("blinkit")) storeName = "Blinkit";
  else if (low.includes("zepto")) storeName = "Zepto";
  else if (low.includes("shopsy")) storeName = "Shopsy";
  else if (deal.channel && deal.channel !== "Unknown") storeName = deal.channel;

  // Extract external URL
  const urlMatch = (deal.affText || deal.originalText || "").match(/https?:\/\/[^\s"'<>]+/);
  const productUrl = urlMatch ? urlMatch[0] : "";

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (productUrl) {
      navigator.clipboard.writeText(productUrl);
      playCopy();
      toast.success("🔗 Product link copied!");
    } else {
      toast.info("No external link found");
    }
    setMenuOpen(false);
  };

  const handleCopyPost = (e: React.MouseEvent) => {
    e.stopPropagation();
    const postText = deal.affText || deal.originalText || `${deal.title} @ ₹${deal.price}`;
    navigator.clipboard.writeText(postText);
    playCopy();
    toast.success("📋 Deal post copied!");
    setMenuOpen(false);
  };

  const handleOpenStore = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (productUrl) {
      window.open(productUrl, "_blank", "noopener,noreferrer");
    } else {
      toast.info("No external link found");
    }
    setMenuOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.18 }}
      className={`pro-card bg-white border rounded-2xl p-3.5 flex flex-col justify-between transition-all group relative ${
        selected
          ? "border-[#5B50E6] ring-2 ring-[#5B50E6]/20 bg-indigo-50/10 shadow-md"
          : "border-gray-200/90 hover:border-gray-300 hover:shadow-md"
      }`}
    >
      <div>
        {/* Card Header (Store Logo + Store Name + Product URL + Time + Menu) */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <StoreLogo store={storeName} className="w-6 h-6" />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-gray-900 leading-tight truncate max-w-[120px]">
                {storeName}
              </span>
              {productUrl ? (
                <a
                  href={productUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="text-[11px] text-gray-400 hover:text-[#5B50E6] leading-tight truncate mt-0.5"
                >
                  Product URL
                </a>
              ) : (
                <span className="text-[11px] text-gray-400 leading-tight truncate mt-0.5">
                  Product URL
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0 text-gray-400 relative">
            <span className="text-[11px] whitespace-nowrap">{fmtAgo(deal.ts)}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
              title="More options"
            >
              <MoreHorizontal size={15} />
            </button>

            {/* Context Dropdown Menu */}
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                  }}
                />
                <div
                  className="absolute right-0 top-7 z-50 w-36 bg-white border border-gray-200 rounded-xl shadow-lg p-1 text-xs flex flex-col gap-0.5"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-gray-700 hover:bg-gray-50 text-left cursor-pointer"
                  >
                    <LinkIcon size={12} className="text-gray-400" />
                    <span>Copy Link</span>
                  </button>
                  <button
                    onClick={handleCopyPost}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-gray-700 hover:bg-gray-50 text-left cursor-pointer"
                  >
                    <Copy size={12} className="text-gray-400" />
                    <span>Copy Post</span>
                  </button>
                  <button
                    onClick={handleOpenStore}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-gray-700 hover:bg-gray-50 text-left cursor-pointer"
                  >
                    <ExternalLink size={12} className="text-gray-400" />
                    <span>Open Store</span>
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(deal);
                    }}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-gray-700 hover:bg-gray-50 text-left cursor-pointer"
                  >
                    <SlidersHorizontal size={12} className="text-gray-400" />
                    <span>Tune Deal</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Media Showcase */}
        <div
          className="w-full h-44 my-2.5 rounded-xl bg-[#F8F9FA] flex items-center justify-center p-3 relative overflow-hidden cursor-zoom-in group/img"
          onClick={() => onEdit(deal)}
        >
          {deal.imgUrl && !imgErr ? (
            <img
              src={deal.imgUrl}
              alt={deal.title}
              className="max-h-full max-w-full object-contain filter drop-shadow-xs transition-transform duration-200 group-hover/img:scale-105"
              loading="lazy"
              onError={() => setImgErr(true)}
            />
          ) : (
            <Category3DPlaceholder category={deal.category} />
          )}

          {/* Bulk Selection Checkbox Overlay */}
          {(bulkMode || selected) && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect?.(deal.id);
              }}
              className={`absolute top-2 left-2 z-20 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                selected
                  ? "bg-[#5B50E6] text-white shadow-sm"
                  : "bg-white/90 border border-gray-300 text-gray-400 hover:border-gray-400"
              }`}
            >
              {selected ? <Check size={13} strokeWidth={3} /> : null}
            </button>
          )}
        </div>

        {/* Product Title and Specs */}
        <div className="min-w-0">
          <h4
            className="text-sm font-bold text-gray-900 line-clamp-1 hover:text-[#5B50E6] transition-colors cursor-pointer"
            onClick={() => onEdit(deal)}
            title={deal.title}
          >
            {mainTitle}
          </h4>
          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
            {specsSubtitle}
          </p>
        </div>

        {/* Price Row */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-base font-extrabold text-gray-900 tracking-tight">
            {fmt(displayPrice, deal.isFree)}
          </span>
          {deal.mrp > displayPrice && (
            <span className="text-xs text-gray-400 line-through">
              {fmt(deal.mrp)}
            </span>
          )}
          {deal.discount > 0 && (
            <span className="ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/60">
              {Math.round(deal.discount)}% OFF
            </span>
          )}
        </div>
      </div>

      {/* Bottom Action Buttons Row */}
      <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center gap-2" onClick={e => e.stopPropagation()}>
        {deal.status === "pending" ? (
          <>
            <button
              type="button"
              onClick={() => {
                playReject();
                onReject(deal.id);
              }}
              className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center cursor-pointer"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={() => onEdit(deal)}
              className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <SlidersHorizontal size={13} className="text-gray-500" />
              <span>Tune</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playApprove();
                onApprove(deal.id);
              }}
              className="flex-[1.2] py-1.5 px-3 rounded-lg text-xs font-bold text-white bg-[#5B50E6] hover:bg-[#4E43D8] transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Check size={14} strokeWidth={2.5} />
              <span>Approve</span>
            </button>
          </>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 flex items-center gap-1">
              <Check size={12} strokeWidth={2.5} /> {deal.status === "approved" ? "Approved" : deal.status}
            </span>
            <button
              type="button"
              onClick={() => onEdit(deal)}
              className="text-xs font-medium text-gray-600 hover:text-gray-900 px-2 py-1 bg-gray-100 rounded-lg cursor-pointer"
            >
              View
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
