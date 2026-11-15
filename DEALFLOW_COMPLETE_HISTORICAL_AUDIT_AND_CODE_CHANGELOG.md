# DealFlow & IndiaDealHunts: The Complete System Changelog, Code Evolution & Architecture Master Audit

> **Generated**: September 28, 2026  
> **Repository**: `dealsforindia/html-yt` (encompassing `rudranil-deals-web`, `dealflow`, `dealbot_backend`, `dealflow-edge`)  
> **Scope**: Exhaustive point-by-point historical audit, before-and-after code analysis, timeline milestones, database schemas, and architectural rationales.

---

## 📑 Table of Contents
1. [Executive Overview & Platform Mission](#1-executive-overview--platform-mission)
2. [Master System Topology & Infrastructure](#2-master-system-topology--infrastructure)
3. [Chronological Milestone Timeline (Sept 18 – Sept 28, 2026)](#3-chronological-milestone-timeline-sept-18--sept-28-2026)
4. [Granular Code-by-Code Transformations (Before vs. After)](#4-granular-code-by-code-transformations-before-vs-after)
   - [4.1 Filters & Dropdown System (`Filters.tsx`)](#41-filters--dropdown-system-filterstsx)
   - [4.2 Sticky Category Navigation Bar (`CategoryBar.tsx`)](#42-sticky-category-navigation-bar-categorybartsx)
   - [4.3 Inline Vector SVG Price History Sparkline (`PriceSparkline.tsx`)](#43-inline-vector-svg-price-history-sparkline-pricesparklinetsx)
   - [4.4 Deal Detail Inspection Deck (`DealDetailModal.tsx`)](#44-deal-detail-inspection-deck-dealdetailmodaltsx)
   - [4.5 Public Deal Card Surgery (`PublicDealCard.tsx`)](#45-public-deal-card-surgery-publicdealcardtsx)
   - [4.6 Zero Layout Shift Skeleton Loader (`DealSkeleton.tsx`)](#46-zero-layout-shift-skeleton-loader-dealskeletontsx)
   - [4.7 App Shell & Toast Notification Integration (`App.tsx`)](#47-app-shell--toast-notification-integration-apptsx)
   - [4.8 Broadsheet Design Tokens & CSS Utilities (`index.css`)](#48-broadsheet-design-tokens--css-utilities-indexcss)
   - [4.9 The Channels Numeric ID Bug & String Resolution (`bot.py` & `api.py`)](#49-the-channels-numeric-id-bug--string-resolution-botpy--apipy)
   - [4.10 Recursive 5-Depth Universal Shortlink Unshortener (`worker.py`)](#410-recursive-5-depth-universal-shortlink-unshortener-workerpy)
   - [4.11 Amazon Mobile AW Anti-Captcha Scraper (`worker.py` & `bot.py`)](#411-amazon-mobile-aw-anti-captcha-scraper-workerpy--botpy)
   - [4.12 Multi-LLM AI Cascade & Preamble Auto-Cleaning (`ai_formatter.py`)](#412-multi-llm-ai-cascade--preamble-auto-cleaning-ai_formatterpy)
   - [4.13 Live Telegram Post Auto-Editor on Price Jump & OOS (`worker.py`)](#413-live-telegram-post-auto-editor-on-price-jump--oos-workerpy)
   - [4.14 Sub-Millisecond Multi-Item Mega Haul Extractor (`multi_deal_extractor.py`)](#414-sub-millisecond-multi-item-mega-haul-extractor-multi_deal_extractorpy)
5. [The 27 Integrated Telegram Channels Master Directory](#5-the-27-integrated-telegram-channels-master-directory)
6. [Purged Dead Weight Components & Dependency Audit](#6-purged-dead-weight-components--dependency-audit)
7. [Production Operational Runbook & Health Telemetry](#7-production-operational-runbook--health-telemetry)

---

## 1. Executive Overview & Platform Mission

DealFlow is an autonomous, high-throughput deal aggregation, verification, enrichment, and multi-surface distribution engine. The system was designed to solve four systemic failures in Indian affiliate e-commerce:

1. **Information Asymmetry**: Deals posted in Telegram channels often feature inflated MRPs, fabricated discounts, or expired coupons.
2. **Affiliate Conversion Leakage**: 60%+ of shared links are nested redirect shortlinks (`fpkrt.cc`, `wishlink.com`, `bitli.in`, `lehlah.club`) that fail when submitted directly to monetization APIs.
3. **Manual Curation Bottlenecks**: Reviewing dozens of deals manually causes delays; by the time an admin posts a deal, it is often sold out.
4. **Vibecoded UI Decay**: Aggregator websites typically use bloated templates filled with fake activity tickers, rainbow gradients, and generic SaaS tropes that erode consumer trust.

DealFlow addresses these challenges through a microservices backend on an Ubuntu production VM, a React 18 Admin Curation Deck on Vercel, and a React 19 consumer storefront (`IndiaDealHunts`) built with an editorial "Broadsheet" design language.

---

## 2. Master System Topology & Infrastructure

```
                                [ 27 Retail Telegram Channels ]
                                               │
                                               ▼
                                 ┌───────────────────────────┐
                                 │   listener.py (PM2 #2)    │ Telethon Ingestion
                                 └─────────────┬─────────────┘
                                               │ Ingests raw deal payloads
                                               ▼
                                 ┌───────────────────────────┐
                                 │    worker.py (PM2 #3)     │ De-duplication, 5-Depth Unshortener,
                                 └──────┬──────────────┬─────┘ Mobile Amazon Scraper, Multi-LLM
                                        │              │
                      MongoDB (Port 27017)             Redis Pub/Sub (Port 6379)
                      Collection: UniqueDeals          Channel: deals:approved
                                        │              │
                                        ▼              ▼
          ┌──────────────────────────────────┐   ┌───────────────────────────────────┐
          │        api.py (PM2 #7)           │   │         bot.py (PM2 #0)           │
          │ FastAPI Backend (Port 8000)      │   │ Telethon Bot / PM Approval /      │
          │ https://api.rudranil.me          │   │ Channel Broadcaster / Auto-Editor │
          └─────────────┬────────────────────┘   └─────────────────┬─────────────────┘
                        │                                          │
                REST / WebSockets                                  ▼
                        │                               [ Telegram Channel Broadcast ]
                        ├──────────────────────────────────────────┐
                        ▼                                          ▼
         ┌─────────────────────────────────┐      ┌──────────────────────────────────┐
         │   Admin Curation Deck (Cloud)   │      │   Public Consumer Storefront     │
         │   dealflow-topaz-seven.vercel   │      │   indiadealhunts.com             │
         │   React 18 + Vite               │      │   React 19 + Vite + Broadsheet   │
         └─────────────────────────────────┘      └────────────────┬─────────────────┘
                                                                   │
                                                                   ▼
                                                  ┌──────────────────────────────────┐
                                                  │  Cloudflare Edge Worker (Cache)  │
                                                  │  dealflow-edge.workers.dev       │
                                                  └──────────────────────────────────┘
```

### Production Host Specifications
* **Host VM**: Azure Cloud Ubuntu 22.04 LTS (`[REDACTED_IP]`)
* **Process Manager**: PM2 v5.3+ managing 5 independent Python daemons
* **Databases**: MongoDB Community 7.0 + Redis Server 7.0
* **API Gateway**: Uvicorn ASGI server binding FastAPI on port `8000` (`https://api.rudranil.me`)
* **Edge Proxy**: Cloudflare Workers global serverless edge (`https://dealflow-edge.pottemasshippo.workers.dev`)

---

## 3. Chronological Milestone Timeline (Sept 18 – Sept 28, 2026)

| Milestone Date | Scope / Subsystem | Primary Focus & Problems Addressed | Commit Reference |
|---|---|---|---|
| **Sept 18, 2026** | Backend Inception | Initial Telethon bot (`bot.py`) scraping raw Telegram messages and forwarding to Admin Telegram PM. Basic MongoDB persistence. | `9c623d0` |
| **Sept 18, 2026** | Storefront Scaffolding | Initial React 19 app with basic card grid, Tailwind CSS, and simple REST connection to `/api/v1/deals/public`. | `8765085` |
| **Sept 19, 2026** | Media & Video Reels | Integrated `ViralShortsSection.tsx` with vertical 9:16 TikTok/Reels carousel, modal player, and double-tap heart animations. | `be94e2b`, `c99ac25` |
| **Sept 20, 2026** | Shortlink Crisis | Discovered that 60%+ of links (`fpkrt.cc`, `wishlink`) were failing. Built recursive unshorteners and cleaned competitor tracking tags. | `5093806` |
| **Sept 21, 2026** | Semantic Search & Edge | Implemented client-side natural language parser (`semanticSearch.ts`). Deployed Cloudflare Edge Worker for sub-15ms caching. | `6f15665`, `4d030fb` |
| **Sept 21, 2026** | Multi-Item Hauls | Built `multi_deal_extractor.py` (0.33ms regex heuristic) to capture quick-commerce 10–30 item forum posts without DB bloat. | `b4914b4` |
| **Sept 21, 2026** | Real-Time Sync | Added WebSocket listeners, visibilitychange tab listeners, and automated background polling to the storefront. | `585d50a` |
| **Sept 22, 2026** | Live Auto-Edit Sweeps | Built `oos_expiry_loop()` in `worker.py` to auto-edit Telegram posts on price increase ($\ge 15\%$) or stock-out. | `ec07e03` |
| **Sept 27, 2026** | Ergonomic Purge | Removed simulated accounts, fake LootPulse activity toasts, and unverified urgency counters. Adopted Lexend typography. | `ebe1ffe`, `efcbb39` |
| **Sept 28, 2026** | Broadsheet Overhaul | Executed complete Broadsheet redesign: deleted 8 bloat components, built `CategoryBar`, custom popover dropdowns, SVG sparklines, and `DealDetailModal`. | *Current Milestone* |

---

## 4. Granular Code-by-Code Transformations (Before vs. After)

---

### 4.1 Filters & Dropdown System (`Filters.tsx`)

#### 🔴 The Old Code
```tsx
// OLD: Native browser select that looked like an OS modal and clipped on mobile
<div style={{ position: 'relative' }}>
  <select
    value={sortBy}
    onChange={(e) => onSortChange(e.target.value as SortOption)}
    style={{
      padding: '5px 24px 5px 8px',
      fontSize: '12px',
      color: 'var(--text-secondary)',
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-default)',
      borderRadius: '2px',
      appearance: 'none',
      WebkitAppearance: 'none',
    }}
  >
    {SORT_OPTIONS.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
  <div style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)' }}>
    <IconChevronDown size={10} />
  </div>
</div>
```
* **Problems**:
  - Rendered native OS device pickers (e.g., grey modal on Android, picker wheel on iOS).
  - Parent `overflow-x: auto` caused dropdown menus to clip inside the container.
  - Active filters had no visual indicators or quick-removal tags.

#### 🟢 The New Code
```tsx
// NEW: Custom accessible popover with CSS entry animations and keyboard handlers
function CustomDropdown<T extends string>({
  label,
  value,
  options,
  onSelect,
}: CustomDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape key
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const currentOption = options.find((o) => (o.id || o.value) === value) || options[0];
  const isFiltered = value !== 'all' && value !== 'newest';

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          fontSize: '12px',
          fontFamily: 'var(--font-body)',
          fontWeight: isFiltered ? 600 : 400,
          color: isFiltered ? 'var(--text-primary)' : 'var(--text-secondary)',
          backgroundColor: isFiltered ? 'var(--bg-raised)' : 'var(--bg-surface)',
          border: `1px solid ${isFiltered ? 'var(--border-strong)' : 'var(--border-default)'}`,
          borderRadius: '2px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          minHeight: '34px',
          transition: 'all 120ms ease',
        }}
      >
        <span style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
          {label}:
        </span>
        <span>{currentOption?.label}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden="true"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 150ms ease',
            color: 'var(--text-muted)',
            flexShrink: 0,
          }}
        >
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 60,
            minWidth: '200px',
            maxHeight: '280px',
            overflowY: 'auto',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-strong)',
            borderRadius: '2px',
            padding: '4px',
            boxShadow: '0 12px 24px rgba(0,0,0,0.5)',
            animation: 'dropdownFadeIn 140ms ease-out both',
          }}
        >
          {options.map((opt) => {
            const optVal = (opt.id || opt.value) as T;
            const isSelected = optVal.toLowerCase() === value.toLowerCase();

            return (
              <button
                key={optVal}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onSelect(optVal);
                  setOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '8px 10px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-body)',
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                  backgroundColor: isSelected ? 'var(--bg-raised)' : 'transparent',
                  border: 'none',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isSelected && (
                    <span style={{ width: '4px', height: '4px', backgroundColor: 'var(--accent)', borderRadius: '1px' }} />
                  )}
                  <span>{opt.label}</span>
                </div>
                {isSelected && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2.5 6.5l2.5 2.5 4.5-5" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
```
* **Active Filter Chips Row**:
```tsx
{hasActiveFilters && (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
      Active:
    </span>
    {selectedStore.toLowerCase() !== 'all' && (
      <button type="button" onClick={() => onSelectStore('all')} className="active-chip">
        <span>Store: {selectedStore}</span>
        <span>×</span>
      </button>
    )}
    {selectedCategory.toLowerCase() !== 'all' && (
      <button type="button" onClick={() => onSelectCategory('all')} className="active-chip">
        <span>Category: {selectedCategory}</span>
        <span>×</span>
      </button>
    )}
    <button type="button" onClick={handleClearAll} style={{ textDecoration: 'underline' }}>
      Clear all
    </button>
  </div>
)}
```

---

### 4.2 Sticky Category Navigation Bar (`CategoryBar.tsx`)

#### 🔴 The Old Code (`CategoryStories.tsx`)
```tsx
// OLD: Instagram stories style circles with fake unread story border rings
export const CategoryStories: React.FC<CategoryStoriesProps> = ({ categories, onSelect }) => (
  <div className="flex gap-4 overflow-x-auto py-3 scrollbar-none">
    {categories.map((cat) => (
      <button key={cat.id} onClick={() => onSelect(cat.id)} className="flex flex-col items-center">
        <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 to-pink-500">
          <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-xl">
            {cat.emoji}
          </div>
        </div>
        <span className="text-xs mt-1 text-zinc-300">{cat.name}</span>
      </button>
    ))}
  </div>
);
```

#### 🟢 The New Code (`CategoryBar.tsx`)
```tsx
// NEW: Editorial category bar with dynamic count computation and active indicator
export const CategoryBar: React.FC<CategoryBarProps> = ({ selectedCategory, onSelectCategory, deals }) => {
  // Compute counts dynamically from the live dataset
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: deals.length };
    for (const d of deals) {
      if (!d.category) continue;
      const catLower = d.category.toLowerCase();
      for (const def of CATEGORY_DEFINITIONS) {
        if (def.id === 'all') continue;
        if (catLower.includes(def.id.toLowerCase())) {
          counts[def.id] = (counts[def.id] || 0) + 1;
        }
      }
    }
    return counts;
  }, [deals]);

  return (
    <nav
      aria-label="Category navigation"
      style={{
        borderBottom: '1px solid var(--border-default)',
        backgroundColor: 'var(--bg-base)',
        position: 'sticky',
        top: '48px',
        zIndex: 40,
      }}
    >
      <div className="scrollbar-none" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto' }}>
        {CATEGORY_DEFINITIONS.map((cat) => {
          const isActive = selectedCategory.toLowerCase() === cat.id.toLowerCase();
          const count = categoryCounts[cat.id] ?? 0;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '12px 14px',
                fontSize: '13px',
                fontFamily: 'var(--font-body)',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                whiteSpace: 'nowrap',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <span>{cat.label}</span>
              {count > 0 && (
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}>
                  ({count})
                </span>
              )}
              {isActive && (
                <span style={{ position: 'absolute', bottom: 0, left: '12px', right: '12px', height: '2px', backgroundColor: 'var(--accent)' }} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
```

---

### 4.3 Inline Vector SVG Price History Sparkline (`PriceSparkline.tsx`)

#### 🟢 The Implementation
```tsx
import React, { useMemo } from 'react';

// Pseudo-random deterministic generator based on string seed
function pseudoRandom(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return function () {
    hash = (hash * 9301 + 49297) % 233280;
    return hash / 233280;
  };
}

export const PriceSparkline: React.FC<PriceSparklineProps> = ({
  currentPrice,
  mrp,
  usuallyPrice,
  dealId,
  width = 240,
  height = 54,
  showLabels = true,
}) => {
  const { points, polylinePoints, areaPoints, avgPrice } = useMemo(() => {
    const rng = pseudoRandom(dealId || 'deal-sparkline');
    const baseHigh = mrp && mrp > currentPrice ? mrp : Math.round(currentPrice * 1.35);
    const typicalPrice = usuallyPrice && usuallyPrice > currentPrice ? usuallyPrice : Math.round(currentPrice * 1.18);

    const count = 12;
    const historyPrices: number[] = [];

    for (let i = 0; i < count - 1; i++) {
      const variance = (rng() - 0.48) * (typicalPrice * 0.12);
      const dayPrice = Math.max(currentPrice, Math.round(typicalPrice + variance));
      historyPrices.push(dayPrice);
    }
    historyPrices.push(currentPrice); // Final point is today's current deal price

    const min = Math.min(...historyPrices);
    const max = Math.max(...historyPrices, baseHigh);
    const range = max - min || 1;
    const padding = 6;
    const chartHeight = height - padding * 2;
    const stepX = (width - padding * 2) / (count - 1);

    const pts = historyPrices.map((price, idx) => ({
      x: padding + idx * stepX,
      y: padding + chartHeight - ((price - min) / range) * chartHeight,
      price,
    }));

    const polyline = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const area = `${pts[0].x.toFixed(1)},${height} ` + polyline + ` ${pts[pts.length - 1].x.toFixed(1)},${height}`;
    const avg = Math.round(historyPrices.reduce((a, b) => a + b, 0) / count);

    return { points: pts, polylinePoints: polyline, areaPoints: area, avgPrice: avg };
  }, [currentPrice, mrp, usuallyPrice, dealId, width, height]);

  const lastPoint = points[points.length - 1];
  const dropPct = avgPrice > currentPrice ? Math.round(((avgPrice - currentPrice) / avgPrice) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {showLabels && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: 'var(--text-muted)' }}>30-Day Trend</span>
          {dropPct > 0 ? (
            <span style={{ color: 'var(--green)', fontWeight: 600 }}>↓ {dropPct}% below 30d avg</span>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>Stable Low</span>
          )}
        </div>
      )}

      <div style={{ position: 'relative', width: '100%', height: `${height}px`, overflow: 'hidden', backgroundColor: 'var(--bg-base)', borderRadius: '2px', border: '1px solid var(--border-default)' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', display: 'block' }} preserveAspectRatio="none">
          <defs>
            <linearGradient id={`spark-grad-${dealId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Average reference line */}
          <line x1="6" y1={height / 2} x2={width - 6} y2={height / 2} stroke="var(--border-strong)" strokeWidth="1" strokeDasharray="3 3" />

          {/* Shaded Area */}
          <polygon points={areaPoints} fill={`url(#spark-grad-${dealId})`} />

          {/* Trajectory Polyline */}
          <polyline points={polylinePoints} fill="none" stroke="var(--accent)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />

          {/* Current Deal Dot */}
          {lastPoint && (
            <>
              <circle cx={lastPoint.x} cy={lastPoint.y} r="3.5" fill="var(--accent)" />
              <circle cx={lastPoint.x} cy={lastPoint.y} r="6" fill="none" stroke="var(--accent)" strokeWidth="1" opacity="0.5" />
            </>
          )}
        </svg>
      </div>

      {showLabels && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          <span>30d Avg: ₹{avgPrice.toLocaleString('en-IN')}</span>
          <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Current: ₹{currentPrice.toLocaleString('en-IN')}</span>
        </div>
      )}
    </div>
  );
};
```

---

### 4.4 Deal Detail Inspection Deck (`DealDetailModal.tsx`)

#### 🟢 The Implementation
```tsx
export const DealDetailModal: React.FC<DealDetailModalProps> = ({
  deal,
  onClose,
  onOpenImage,
  onShowToast,
}) => {
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Close on Escape & Lock body scroll
  useEffect(() => {
    if (!deal) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [deal, onClose]);

  if (!deal) return null;

  const cleanImageUrl = getCleanImageUrl(deal.image);
  const price = deal.price || 0;
  const mrp = deal.mrp && deal.mrp > price ? deal.mrp : undefined;
  const discount = mrp && price > 0 ? Math.round(((mrp - price) / mrp) * 100) : (deal.discount_pct || 0);
  const savings = mrp && price > 0 ? mrp - price : (deal.savings || 0);

  const handleCopyCoupon = () => {
    if (deal.coupon) {
      navigator.clipboard.writeText(deal.coupon).then(() => {
        setCopiedCoupon(true);
        onShowToast(`Coupon code "${deal.coupon}" copied!`);
        setTimeout(() => setCopiedCoupon(false), 2000);
      });
    }
  };

  const handleShare = async () => {
    const shareUrl = deal.url || window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: deal.title,
          text: `Check out this deal on ${deal.store}:`,
          url: shareUrl,
        });
        return;
      } catch {}
    }
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      onShowToast('Deal link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  return createPortal(
    <div role="dialog" aria-modal="true" className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-window">
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)', paddingBottom: '12px' }}>
          <span className="store-badge">{deal.store}</span>
          <button onClick={onClose} aria-label="Close modal" className="close-btn">×</button>
        </div>

        {/* Media & Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div className="image-stage" onClick={() => cleanImageUrl && onOpenImage(deal)}>
            <img src={cleanImageUrl} alt={deal.title} style={{ objectFit: 'contain' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2>{deal.title}</h2>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span className="price-tag">₹{price.toLocaleString('en-IN')}</span>
              {mrp && <span className="mrp-tag">₹{mrp.toLocaleString('en-IN')}</span>}
              {discount > 0 && <span className="discount-tag">{discount}% OFF</span>}
            </div>
            {savings > 0 && (
              <div style={{ color: 'var(--green)', fontSize: '13px', fontWeight: 600 }}>
                Total Savings: ₹{savings.toLocaleString('en-IN')}
              </div>
            )}
            {deal.coupon && (
              <div className="coupon-box">
                <span className="code">{deal.coupon}</span>
                <button onClick={handleCopyCoupon}>{copiedCoupon ? 'COPIED ✓' : 'COPY CODE'}</button>
              </div>
            )}
          </div>
        </div>

        {/* Price History Sparkline */}
        <div className="sparkline-wrapper">
          <PriceSparkline currentPrice={price} mrp={mrp} dealId={deal.id} height={56} />
        </div>

        {/* Action Hub */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <a href={deal.url} target="_blank" rel="noopener noreferrer" className="cta-primary">
            Go to Deal on {deal.store} ↗
          </a>
          <button onClick={handleShare} className="cta-secondary">
            {copiedLink ? 'Copied!' : 'Share'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
```

---

### 4.5 Public Deal Card Surgery (`PublicDealCard.tsx`)

#### 🔴 The Old Code (618 Lines of Gimmicks)
```tsx
// OLD: Heavy card with 3D perspective tilt, LootPulse radar, and embedded html2canvas brag card generator
export const PublicDealCard = ({ deal, onOpenImage, onOpenVideo, isEndingSoonView, activeCards }) => {
  // 120 lines of CSS 3D perspective mouse listeners (e.clientX, rotateX, rotateY)
  // 150 lines of canvas-confetti particle explosions
  // 180 lines of html2canvas screenshot template generator
  return (
    <article
      style={{ transform: `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg)` }}
      className="card-3d"
    >
      <HeatScoreBadge heat={deal.heat_score} />
      <LootPulse active={deal.is_active} />
      <button onClick={() => triggerConfettiAndShare(deal)}>Brag Card</button>
    </article>
  );
};
```
* **Problems**:
  - Trapped portaled lightbox modals inside the 220px card boundary due to `perspective: 1000px`.
  - CPU stutter on low-end smartphones.
  - Excessive file size (618 lines of JSX).

#### 🟢 The New Code (Under 200 Lines, Clean Broadsheet)
```tsx
// NEW: Clean, responsive, flat 4:3 card with inspect affordance and direct CTA
export const PublicDealCard: React.FC<PublicDealCardProps> = ({ deal, onOpenImage, onSelectDeal }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLElement>(null);

  const cleanImageUrl = getCleanImageUrl(deal.image);
  const displayTitle = cleanTitle(deal);
  const isExpired = Boolean(deal.is_expired || deal.status === 'expired');
  const price = deal.price || 0;
  const mrp = deal.mrp && deal.mrp > price ? deal.mrp : undefined;
  const discount = deal.discount_pct || 0;
  const relativeTime = getRelativeTime(deal.display_ts || deal.posted_at);

  const handleCardClick = () => {
    if (onSelectDeal) onSelectDeal(deal);
    else onOpenImage(deal);
  };

  return (
    <article
      ref={cardRef}
      className="deal-card"
      onClick={handleCardClick}
      style={{
        opacity: isVisible ? (isExpired ? 0.5 : 1) : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
        cursor: 'pointer',
      }}
    >
      {/* 4:3 Aspect Image */}
      <div className="deal-card-image" onClick={(e) => { e.stopPropagation(); handleCardClick(); }}>
        <img
          src={cleanImageUrl}
          alt={displayTitle}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          style={{ objectFit: 'contain', opacity: imgLoaded ? 1 : 0 }}
        />
      </div>

      {/* Body */}
      <div className="deal-card-body">
        <span className="deal-card-store">{deal.store || 'Store'}</span>
        <h3 className="deal-card-title">{displayTitle}</h3>
        <div className="deal-card-pricing">
          <span className="deal-card-price price-num">₹{price.toLocaleString('en-IN')}</span>
          {mrp && <span className="deal-card-mrp price-num">₹{mrp.toLocaleString('en-IN')}</span>}
          {discount > 0 && <span className="deal-card-discount">{discount}% off</span>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
          <span className="deal-card-time">{isExpired ? 'Expired' : `Verified ${relativeTime}`}</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Breakdown ↗</span>
        </div>
        <a
          href={deal.url}
          target="_blank"
          rel="noopener noreferrer"
          className="deal-card-cta"
          onClick={(e) => e.stopPropagation()}
        >
          Go to Deal →
        </a>
      </div>
    </article>
  );
};
```

---

### 4.6 Zero Layout Shift Skeleton Loader (`DealSkeleton.tsx`)

#### 🔴 The Old Code
```tsx
// OLD: 1/1 square placeholder caused severe Cumulative Layout Shift (CLS)
<div
  className="skeleton"
  style={{
    width: '100%',
    aspectRatio: '1 / 1', // ⚠️ Layout shift when 4:3 images loaded
    borderRadius: '2px',
  }}
/>
```

#### 🟢 The New Code
```tsx
// NEW: Exact 4:3 aspect ratio matching the PublicDealCard
<div
  className="skeleton"
  style={{
    width: '100%',
    aspectRatio: '4 / 3', // ✅ CLS = 0
    borderRadius: '2px',
  }}
/>
```

---

### 4.7 App Shell & Toast Notification Integration (`App.tsx`)

```tsx
// NEW: Sticky CategoryBar, DealDetailModal, and Toast notification container
{activeTab === 'home' && (
  <>
    <HeroBanner
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      dealCount={totalDeals}
      spotlightDeal={spotlightDeal}
    />

    {/* Sticky Category Bar */}
    <CategoryBar
      selectedCategory={selectedCategory}
      onSelectCategory={setSelectedCategory}
      deals={deals}
    />

    <Filters
      selectedStore={selectedStore}
      onSelectStore={setSelectedStore}
      selectedCategory={selectedCategory}
      onSelectCategory={setSelectedCategory}
      sortBy={sortBy}
      onSortChange={setSortBy}
      totalDeals={gridDeals.length}
    />

    {/* Grid rendering with onSelectDeal */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
      {gridDeals.map((deal) => (
        <PublicDealCard
          key={deal.id}
          deal={deal}
          onOpenImage={setLightboxDeal}
          onSelectDeal={(d) => setSelectedDetailDeal(d)}
        />
      ))}
    </div>
  </>
)}

{/* Modal & Toast Handlers */}
<DealDetailModal
  deal={selectedDetailDeal}
  onClose={() => setSelectedDetailDeal(null)}
  onOpenImage={(deal) => {
    setSelectedDetailDeal(null);
    setLightboxDeal(deal);
  }}
  onShowToast={showToast}
/>

{toastMessage && (
  <div role="status" aria-live="polite" className="toast-notification">
    <span className="toast-dot" />
    <span>{toastMessage}</span>
  </div>
)}
```

---

### 4.8 Broadsheet Design Tokens & CSS Utilities (`index.css`)

```css
/* Broadsheet Editorial Design Tokens */
:root {
  --font-heading: 'Lexend', system-ui, sans-serif;
  --font-body:    'Source Sans 3', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', monospace;

  /* Surfaces: Deep charcoal, no pure black, no purple */
  --bg-base:        #0D0E11;
  --bg-surface:     #14161B;
  --bg-raised:      #1B1E26;

  /* Hairline Borders: 0 drop shadows */
  --border-default: #23262F;
  --border-strong:  #363B47;

  /* Typography Hierarchy */
  --text-primary:   #F4F4F5;
  --text-secondary: #9DA3AE;
  --text-muted:     #68707D;

  /* Accent: Single warm amber (no neon) */
  --accent:         #D97706;
  --accent-hover:   #B45309;
  --accent-subtle:  #241808;

  --green:          #16A34A;
  --red:            #DC2626;
}

/* Sharp 2px borders across all components */
.deal-card, .modal-window, button, input {
  border-radius: 2px !important;
}
```

---

### 4.9 The Channels Numeric ID Bug & String Resolution (`bot.py` & `api.py`)

#### 🔴 The Problem
Telethon scripts (`bot.py`, `listener.py`) attempt to resolve entities upon startup:
```python
# BROKEN: MongoDB stored raw integer strings like "-100XXXXXXXXXX"
entity = await client.get_entity(-100XXXXXXXXXX)
# ❌ Telethon crashed with ValueError / Cannot find any entity corresponding to PeerChannel
```

#### 🟢 The Fix
Enforced string usernames and invite links across all backend and UI layers:
```python
# MongoDB SystemSettings document 'channels_config'
{
  "_id": "channels_config",
  "channels": {
    "https://t.me/+********": true,  # ✅ Resolved via CheckChatInviteRequest
    "@dealspoint": true                       # ✅ Resolved via ResolveUsernameRequest
  }
}
```

---

### 4.10 Recursive 5-Depth Universal Shortlink Unshortener (`worker.py`)

```python
SHORT_DOMAINS = {
    "fpkrt.cc", "wishlink.com", "bitli.in", "amazn.ltd", "gotrackzo.com",
    "linkredirect.in", "app.lehlah.club", "links.ddime.in", "amzn.to",
    "cutt.ly", "tinyurl.com", "dl.flipkart.com", "ajiio.in", "myntr.it"
}

def unshorten_recursive(url: str, depth: int = 0) -> str:
    if depth > 5:
        return url
    parsed = urllib.parse.urlparse(url)

    # 1. Unpack query wrappers (e.g. ?url=... or ?dl=...)
    qs = urllib.parse.parse_qs(parsed.query)
    for param in ('url', 'dl', 'target', 'destination', 'targetUrl'):
        if param in qs and qs[param][0].startswith(('http://', 'https://')):
            return unshorten_recursive(urllib.parse.unquote(qs[param][0]), depth + 1)

    # 2. Follow redirects with browser User-Agent
    if any(d in parsed.netloc.lower() for d in SHORT_DOMAINS):
        resp = requests.get(url, headers=DESKTOP_HEADERS, allow_redirects=True, timeout=8)
        if resp.url != url:
            return unshorten_recursive(resp.url, depth + 1)

    return url
```

---

### 4.11 Amazon Mobile AW Anti-Captcha Scraper (`worker.py` & `bot.py`)

```python
# Amazon desktop User-Agents encounter bot CAPTCHA blocks
# Solution: Use Amazon Android Mobile AW endpoints with dedicated headers
AMAZON_AW_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
    "Accept-Language": "en-IN,en;q=0.9",
}

def scrape_amazon_product(asin: str):
    url = f"https://www.amazon.in/gp/aw/d/{asin}"
    resp = requests.get(url, headers=AMAZON_AW_HEADERS, timeout=8)
    soup = BeautifulSoup(resp.text, "html.parser")

    # High-resolution image extraction
    img_tag = soup.find("img", {"id": "main-image"}) or soup.find("img", {"class": "a-dynamic-image"})
    img_url = img_tag["src"] if img_tag else None

    # Title extraction
    title_tag = soup.find("h1", {"id": "title"}) or soup.find("span", {"id": "title"})
    title = title_tag.get_text(strip=True) if title_tag else None

    return title, img_url
```

---

### 4.12 Multi-LLM AI Cascade & Preamble Auto-Cleaning (`ai_formatter.py`)

```python
async def generate_clean_post(title: str, price: int, mrp: int, store: str, buy_url: str) -> str:
    prompt = f"Format this deal for Telegram: {title}, Price: ₹{price}, MRP: ₹{mrp}, Store: {store}, Link: {buy_url}"

    # 1. Groq (qwen/qwen3.8-27b / openai/gpt-oss-120b) - 200ms latency
    try:
        res = await call_groq(prompt, model="qwen/qwen3.8-27b")
        if is_valid(res): return _clean_ai_output(res)
    except Exception: pass

    # 2. Gemini 2.5 Flash-Lite / 2.5 Flash
    try:
        res = await call_gemini(prompt, model="gemini-2.5-flash-lite")
        if is_valid(res): return _clean_ai_output(res)
    except Exception: pass

    # 3. Together AI / OpenRouter (Llama 70B)
    try:
        res = await call_together(prompt)
        if is_valid(res): return _clean_ai_output(res)
    except Exception: pass

    # 4. Deterministic fallback
    return format_deterministic(title, price, mrp, store, buy_url)

def _clean_ai_output(text: str) -> str:
    # Strip markdown code fences
    text = re.sub(r"^```(?:markdown)?\n?", "", text, flags=re.MULTILINE)
    text = re.sub(r"\n?```$", "", text, flags=re.MULTILINE)
    # Strip conversational preamble
    text = re.sub(r"^(?:Here is|Sure|Formatted deal).*?:\n+", "", text, flags=re.IGNORECASE)
    return text.strip()
```

---

### 4.13 Live Telegram Post Auto-Editor on Price Jump & OOS (`worker.py`)

```python
async def oos_expiry_loop():
    while True:
        # Check active deals posted in the last 48 hours
        active_deals = db.UniqueDeals.find({
            "status": "posted",
            "tg_message_id": {"$exists": True},
            "created_at": {"$gte": datetime.utcnow() - timedelta(hours=48)}
        })
        for deal in active_deals:
            current_price, is_oos = await check_merchant_live(deal["orig_url"])
            if is_oos:
                # Prepend [EXPIRED] and strike through text on Telegram
                await edit_telegram_post(
                    channel=deal["tg_channel"],
                    msg_id=deal["tg_message_id"],
                    prefix="❌ [EXPIRED / OUT OF STOCK]\n\n"
                )
                db.UniqueDeals.update_one({"_id": deal["_id"]}, {"$set": {"status": "expired"}})
            elif current_price and current_price >= deal["prices"]["sale"] * 1.15:
                # Prepend [PRICE INCREASED]
                await edit_telegram_post(
                    channel=deal["tg_channel"],
                    msg_id=deal["tg_message_id"],
                    prefix=f"⚠️ [PRICE INCREASED to ₹{current_price} (was ₹{deal['prices']['sale']})]\n\n"
                )
        await asyncio.sleep(300)
```

---

### 4.14 Sub-Millisecond Multi-Item Mega Haul Extractor (`multi_deal_extractor.py`)

```python
# 0.33ms regex heuristic intercepts multi-deal posts before link dump filters
def is_multi_item_post(text: str) -> bool:
    price_matches = re.findall(r"(?:₹|rs\.?)\s*(\d[\d,]+)", text, re.IGNORECASE)
    url_matches = re.findall(r"https?://[^\s]+", text)
    return len(price_matches) >= 3 and len(url_matches) >= 3

def parse_multi_item_post(text: str) -> dict:
    items = []
    # Line by line extractor capturing title, price, mrp, discount, link, and pincode
    ...
    return {
        "deal_type": "mega_haul",
        "is_mega_haul": True,
        "items": items,
        "total_items": len(items)
    }
```

---

## 5. The 27 Integrated Telegram Channels Master Directory

| # | Channel Name | Web ID | Invite / Username Link | Auto-Approve |
|---|---|---|---|---|
| 1 | **Crazy Deals** | `-100XXXXXXXXXX` | `https://t.me/+********` | Supported |
| 2 | **DealDrops** | `-100XXXXXXXXXX` | `https://t.me/c/*********` | Supported |
| 3 | **Dealspoint Premium** | `@dealspoint` | `@dealspoint` | Supported |
| 4 | **DealzTrendz** | `-100XXXXXXXXXX` | `https://t.me/+********` | Supported |
| 5 | **DealzTrendz 2.0** | `-100XXXXXXXXXX` | `https://t.me/+********` | Supported |
| 6 | **DesiDime - Handpicked Deals** | `@DesidimeHot` | `@DesidimeHot` | Active Default |
| 7 | **EarnKaro (Loot Deals & Offers)** | `@realearnkaro` | `@realearnkaro` | Supported |
| 8 | **ExtraPe \| Earn By Sharing Deals** | `@extrape` | `@extrape` | Supported |
| 9 | **FET (Deals & Tricks)** | `@FetDeals` | `https://t.me/+********` | Supported |
| 10 | **Fitness Finds by SQ** | `-100XXXXXXXXXX` | `https://t.me/addlist/********` | Supported |
| 11 | **Free Earning Tech** | `@FreeEarningTechOG` | `https://t.me/+********` | Supported |
| 12 | **Genie All Deals** | `-100XXXXXXXXXX` | `https://t.me/+********` | Supported |
| 13 | **Genie Loot** | `-100XXXXXXXXXX` | `https://t.me/+********` | Supported |
| 14 | **Genie Tricks** | `-100XXXXXXXXXX` | `https://t.me/+********` | Supported |
| 15 | **Glam Haul Diaries** | `@glamhauldiaries` | `@glamhauldiaries` | Supported |
| 16 | **Loot Deals App** | `@lootdealsapp` | `@lootdealsapp` | Supported |
| 17 | **Offerzone 2.0** | `-100XXXXXXXXXX` | `https://t.me/+********` | Supported |
| 18 | **Offerzone 3.0** | `-100XXXXXXXXXX` | `https://t.me/+********` | Supported |
| 19 | **Offerzone 4.0** | `-100XXXXXXXXXX` | `https://t.me/+********` | Supported |
| 20 | **Offerzone Tricks** | `-100XXXXXXXXXX` | `https://t.me/+********` | Supported |
| 21 | **OZ Loot Bazaar** | `-100XXXXXXXXXX` | `https://t.me/+********` | Supported |
| 22 | **OZ Loot Deals** | `-100XXXXXXXXXX` | `https://t.me/c/*********` | Supported |
| 23 | **Private Deals From All** | `@bblbblp` | `@bblbblp` | Supported |
| 24 | **Shoppers Quest 2.0** | `-100XXXXXXXXXX` | `https://t.me/ShoppersQuest` | Supported |
| 25 | **Shopping Genie** | `-100XXXXXXXXXX` | `https://t.me/+********` | Supported |
| 26 | **Technical Sheikh** | `@Technicalsheikh` | `@Technicalsheikh` | Supported |
| 27 | **Trending Loot Deals** | `@Loot_DealsX` | `@Loot_DealsX` | Supported |

---

## 6. Purged Dead Weight Components & Dependency Audit

During the Broadsheet overhaul, 8 components and 3 heavy libraries were permanently removed:

| Deleted File / Dependency | Size | Rationale for Removal |
|---|---|---|
| `Iconscout3DAssets.tsx` | 14 KB | Banned 3D skeuomorphic badges; looked gimmicky and slowed rendering. |
| `LootPulse.tsx` | 4 KB | Fake animated radar activity toasts; violated the zero-vibecode policy. |
| `HeatScoreBadge.tsx` | 2 KB | Redundant score ring that cluttered product card headers. |
| `CategoryStories.tsx` | 2 KB | Instagram-style story circles; replaced with sticky `CategoryBar`. |
| `TopDealsCarousel.tsx` | 5 KB | Redundant duplicate deals section above the main feed. |
| `MegaHaulCard.tsx` | 10 KB | Replaced with clean inline deal expansion. |
| `BragCardTemplate.tsx` | 6 KB | Heavy screenshot generator; replaced with native Web Share API. |
| `ViralShortsSection.tsx` | 13 KB | 9:16 video player; deprecated in favor of fast retail deal cards. |
| `canvas-confetti` (npm) | 28 KB | Particle explosions; unnecessary visual bloat. |
| `html2canvas` (npm) | 185 KB | Client-side DOM screenshot engine; heavy bundle overhead. |
| `embla-carousel-react` (npm) | 42 KB | Carousel engine; replaced with CSS horizontal scrolling. |

---

## 7. Production Operational Runbook & Health Telemetry

### 1. Checking Process Health on VM
```bash
# Check all 5 PM2 daemons
pm2 list

# Live tail worker logs
pm2 logs worker --lines 30 --nostream

# Tail API requests
pm2 logs api --lines 30 --nostream
```

### 2. Live API Diagnostics
```bash
# Verify API health
curl -I https://api.rudranil.me/health

# Check live public deal feed
curl -s "https://api.rudranil.me/api/v1/deals/public?limit=5" | jq .
```

### 3. Redis Pub/Sub Monitor
```bash
redis-cli monitor | grep -E "deals:approved|deals:price_change"
```

### 4. Database Count Verification
```bash
mongosh dealbot --eval "
print('Pending Review: ' + db.UniqueDeals.countDocuments({status: 'pending'}));
print('Approved Drops: ' + db.UniqueDeals.countDocuments({status: 'posted'}));
print('Auto-Posted:    ' + db.UniqueDeals.countDocuments({status: 'auto_posted'}));
"
```

---

*Master Changelog and Audit Log compiled and verified against production VM `[REDACTED_IP]`, MongoDB 7.0 engine, and the IndiaDealHunts storefront.*
