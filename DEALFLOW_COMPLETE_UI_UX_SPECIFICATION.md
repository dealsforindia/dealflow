# 🎨 DealFlow Complete UI/UX & Design System Specification

This specification documents the complete visual, architectural, interactive, and component-level UI/UX design across the entire DealFlow platform, including:
1. **The Public Consumer Storefront (`rudranil-deals-web` / `dealsforindia/indiadealhunts`)**
2. **The Admin Curation Deck (`dealflow` / `tg-setup` / `dealsforindia/dealflow`)**
3. **The Telegram Native Admin PM Interface (`bot.py`)**
4. **The Telegram Public Channel Broadcast Format (`@dealsforindiachannel`)**

---

## 1. Design Philosophies & Dual Horizon Paradigm

DealFlow is engineered with two contrasting, purpose-built visual personalities:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DEALFLOW DUAL HORIZON                           │
├───────────────────────────────────┬────────────────────────────────────┤
│   CONSUMER STOREFRONT (PUBLIC)    │      ADMIN CURATION DECK (B2B)     │
│   "Broadsheet Editorial"          │      "Cyberpunk Mission Control"   │
├───────────────────────────────────┼────────────────────────────────────┤
│ • Grounded in newspaper craft     │ • High-density telemetry cockpit   │
│ • Sharp 2px corners, hairline     │ • Glassmorphism, blurred surfaces  │
│   1px borders, zero drop shadows  │ • Glowing status rings, live pulses│
│ • Warm Amber (#D97706), Charcoal  │ • Cyan, Emerald, Purple accents    │
│ • High-legibility editorial types │ • Deep Jet Black (#08080C)         │
│ • Zero CLS, instant page utility  │ • WebSocket live streaming feeds   │
└───────────────────────────────────┴────────────────────────────────────┘
```

---

## 2. Global Design System Tokens

### 2.1 Consumer Storefront Tokens ("Broadsheet" System)

| Token Name | Value | Role / Usage |
|---|---|---|
| `--bg-canvas` | `#0D0E11` (Pitch Charcoal) | Primary application background |
| `--bg-surface` | `#14161B` (Elevated Charcoal Slate) | Card backgrounds, popover panels, sticky bars |
| `--bg-surface-elevated` | `#1A1D24` | Active tabs, hover states, input fields |
| `--border-hairline` | `#23262F` (1px solid) | Grid borders, card borders, dividers |
| `--border-active` | `#363B47` | Hovered borders, active focus rings |
| `--accent-amber` | `#D97706` (Warm Ochre / Amber) | Brand identity, primary CTAs, active indicators |
| `--accent-amber-hover` | `#F59E0B` (Bright Amber) | Hovered buttons, highlighted prices |
| `--accent-amber-subtle`| `rgba(217, 119, 6, 0.12)` | Badge backgrounds, sparkline gradient fill |
| `--text-primary` | `#F4F4F5` (Zinc 100) | Headings, sale prices, active labels |
| `--text-secondary` | `#A1A1AA` (Zinc 400) | Product descriptions, subheadings, labels |
| `--text-muted` | `#68707D` (Slate 500) | Timestamps, strikethrough MRP, footer text |
| `--accent-green` | `#10B981` (Emerald) | Verified tags, drop percentage metrics |
| `--radius-sharp` | `2px` | All cards, buttons, dropdowns, modal windows |
| `--font-brand` | `'Lexend', sans-serif` | Brand mark, section headers, hero titles |
| `--font-body` | `'Source Sans 3', sans-serif` | Product titles, editorial text, tooltips |
| `--font-mono` | `'JetBrains Mono', monospace` | Prices, discount %, timestamps, coupon codes |

### 2.2 Store Brand Visual Badges

| Merchant / Store | Brand Color | Pill Background | Text Color | Icon / Emblem |
|---|---|---|---|---|
| **Amazon India** | `#FF9900` | `rgba(255, 153, 0, 0.12)` | `#FFB84D` | Shopping Cart / `a` smile |
| **Flipkart** | `#2874F0` | `rgba(40, 116, 240, 0.12)` | `#60A5FA` | Delivery Bag / Shopping Trolley |
| **Myntra** | `#FF3F6C` | `rgba(255, 63, 108, 0.12)` | `#F472B6` | `M` Fashion Emblem |
| **AJIO** | `#2C4152` | `rgba(44, 65, 82, 0.25)` | `#93C5FD` | AJIO Bag / Fashion Tag |
| **DesiDime** | `#E21B22` | `rgba(226, 27, 34, 0.12)` | `#F87171` | Deal Flame / `D` |
| **Swiggy Instamart** | `#FC8019` | `rgba(252, 128, 25, 0.12)` | `#FB923C` | Lightning Grocery Bolt |
| **Shopsy** | `#E91E63` | `rgba(233, 30, 99, 0.12)` | `#F472B6` | Shopping Basket |

---

## 3. Screen-by-Screen Specification: Public Consumer Storefront (`rudranil-deals-web`)

### 3.1 Top Navigation & Header (`Navbar.tsx`)
```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│  🔴 LIVE RADAR · 847 TRACKED     INDIA DEAL HUNTS /       [🔍 Search 840+ deals...   /]   [✈ Join]│
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
* **Height**: `64px` fixed, sticky at top (`top: 0`, `z-index: 50`) with `backdrop-filter: blur(12px)`.
* **Left Section**:
  - Live Radar Pill: `#14161B` surface with `1px solid #23262F`. Contains a pulsing emerald beacon (`w-2 h-2 rounded-full animate-ping`) alongside static emerald dot and uppercase mono counter: `LIVE RADAR · 847 DEALS TRACKED`.
* **Brand Core**:
  - Monogram: Bold `INDIA DEAL HUNTS` in Lexend (`18px`, weight `800`, letter-spacing `-0.02em`, color `#F4F4F5`).
  - Warm amber slash divider (`/`) in `#D97706`.
  - Sub-brand badge: `EDITORIAL LOOT DESK` in muted mono (`10px`).
* **Middle Section (Search Bar)**:
  - Container: Width `320px` to `480px` responsive, height `38px`, `#14161B` background with `1px solid #23262F`.
  - Icon: Neutral zinc magnifying glass (`15px`).
  - Placeholder: `"Search 840+ verified deals, products, stores..."`.
  - Hotkey Badge: Sharp `2px` pill displaying `/` in JetBrains Mono (`10px`, color `#68707D`). Pressing `/` instantly focuses the input.
  - Active State: Border transitions to `#D97706` with subtle amber focus glow.
* **Right Section**:
  - `Join Telegram` CTA: Amber outlined pill with Telegram paper plane icon and `✈ Join 45K+ Hunters`.
  - Mobile Menu Hamburger: Renders on screens `< 768px`.

---

### 3.2 Category Navigation Bar (`CategoryBar.tsx`)
```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│  [All Deals (847)]  [📱 Electronics (312)]  [👗 Fashion (184)]  [🏠 Home (125)]  [🍎 Grocery (64)]│
│  ═════════════════ (sliding amber active indicator)                                              │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
* **Position**: Sticky below top navbar (`top: 64px`, `z-index: 40`), background `#0D0E11` with `border-b: 1px solid #23262F`.
* **Scroll Ergonomics**: Horizontal overflow (`overflow-x-auto`) with hidden scrollbars, hardware-accelerated momentum scrolling.
* **Pill Geometry**:
  - Sharp `2px` corners, height `36px`, padding `0 14px`.
  - Inactive State: Transparent background, text `#A1A1AA`, hover state background `#14161B` and text `#F4F4F5`.
  - Active State: Background `#1A1D24`, text `#F4F4F5`, font-weight `600`.
* **Animated Underline Indicator**:
  - `2px` high solid amber line (`#D97706`) anchored to the bottom, animated via CSS transforms to slide under the active category button smoothly.
* **Dynamic Deal Counts**: Every category pill dynamically computes live item counts (`All Deals (847)`, `📱 Electronics (312)`, `👗 Fashion (184)`, `🏠 Home & Kitchen (125)`, `💄 Beauty (89)`, `🍎 Grocery (64)`, `⌚ Watches (43)`).

---

### 3.3 Hero Spotlight & Loot Radar (`HeroBanner.tsx`)
```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│  #1 VERIFIED LOOT DROP OF THE DAY                                                                │
│  ┌───────────────────────┬────────────────────────────────────────────────────────────────────┐  │
│  │                       │  SONY WH-1000XM5 WIRELESS NOISE CANCELING HEADPHONES              │  │
│  │      [PRODUCT]        │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  │
│  │       [PHOTO]         │  ₹19,990  ~~₹34,990~~  [ -43% OFF ]  (Save ₹15,000)                │  │
│  │        (4:3)          │  30-Day Trend: [~~~~~📉~~~~~] ↓ 28% below 30d avg                 │  │
│  │                       │  [ ⚡ GRAB SPOTLIGHT DEAL → ]      [ 🔍 Inspect Breakdown ]        │  │
│  └───────────────────────┴────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
* **Surface**: Full-width bordered card with `#14161B` background, `1px solid #23262F`, and `2px` radius.
* **Badge**: Small uppercase mono tag: `★ EDITORIAL SPOTLIGHT · VERIFIED 18M AGO`.
* **Media Stage (Left)**: Fixed `4:3` responsive aspect ratio container, `#0D0E11` dark backdrop, zero image distortion.
* **Content Stage (Right)**:
  - Product Title: Heading in Lexend (`22px`, weight `700`, line-height `1.3`, color `#F4F4F5`).
  - Pricing Row: Massive price in JetBrains Mono (`28px`, bold, `#F4F4F5`), strikethrough MRP (`16px`, `#68707D`), and amber discount pill (`-43% OFF`).
  - Savings Callout: Green text (`Total Savings: ₹15,000`).
  - Price Sparkline: Embedded 30-day vector trajectory showing sharp drop curve.
  - CTAs: Primary warm amber button (`⚡ Grab Spotlight Deal →`, height `46px`) + secondary neutral button (`Inspect Breakdown`).

---

### 3.4 Custom Popover Filter Deck (`Filters.tsx`)
```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Filter by: [ Store: All Stores ▾ ]  [ Category: All ▾ ]  [ Sort: ⏰ Newest Drops First ▾ ]      │
│  Active: [ Amazon × ] [ Electronics × ] [ Clear all ]                                            │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
* **Trigger Buttons**:
  - Replaces native `<select>` dropdowns with custom glassmorphic button triggers.
  - Height `36px`, background `#14161B`, border `1px solid #23262F`, sharp `2px` corners.
  - Hover: Border `#363B47`. Active: Amber chevron rotation (`rotate-180`).
* **Animated Popover Panels**:
  - Surface: `#14161B` background with `1px solid #363B47`, sharp `2px` corners, elevated z-index (`z-50`).
  - Entrance: Micro-scale fade (`opacity: 0 → 1`, `translateY: -4px → 0px`, `120ms ease-out`).
  - Items: List items with hover highlight `#1A1D24`, active checkmark (`✓`), and item counts (`Amazon (420)`).
* **Active Filter Chips Ribbon**:
  - Appears below filters when active filters exist.
  - Chips: `#1A1D24` background, `1px solid #23262F`, text `#A1A1AA` with amber hover border and clickable `×` dismiss button.
  - `Clear all` link in amber (`#D97706`).

---

### 3.5 The Broadsheet Deal Card (`PublicDealCard.tsx`)
```
┌─────────────────────────────────────────┐
│ [AMAZON]             -74% OFF   12m ago │
├─────────────────────────────────────────┤
│                                         │
│             PRODUCT IMAGE               │
│          (4:3 Aspect Ratio)             │
│            Object-Contain               │
│                                         │
├─────────────────────────────────────────┤
│ boAt Airdopes 141 Bluetooth Wireless    │
│ TWS Earbuds (42H Playtime, Low Latency) │
├─────────────────────────────────────────┤
│ ₹899  ~~₹4,490~~         Save ₹3,591    │
├─────────────────────────────────────────┤
│ [ 📈 30d Trend: ───────📉  ↓31% avg ]   │
├─────────────────────────────────────────┤
│ ✓ Verified Loot            Breakdown ↗  │
├─────────────────────────────────────────┤
│ [          GO TO DEAL →               ] │
└─────────────────────────────────────────┘
```
* **Container**:
  - Background: `#14161B` (Elevated Charcoal Slate).
  - Border: `1px solid #23262F`, sharp `2px` radius.
  - Hover State: Border transitions to `#363B47` with subtle `translateY(-2px)` elevation. Zero drop shadows.
* **Top Meta Row**:
  - Store Badge: Store brand pill (e.g., `AMAZON` in warm amber).
  - Discount Pill: Warm amber background `rgba(217, 119, 6, 0.12)`, text `#D97706` in JetBrains Mono bold (`-74% OFF`).
  - Timestamp: Muted mono (`12m ago`).
* **Image Stage**:
  - Ratio: Strict **`aspect-[4/3]`** container with `#0D0E11` pitch charcoal backing.
  - Sizing: `object-fit: contain`, padding `12px`. Zero distortion, zero blurred duplicate halos, zero clipping.
  - Fallback: Crisp SVG package icon if image fails to load.
* **Product Title**:
  - Typography: Source Sans 3 (`14px`, weight `600`, line-height `1.35`, color `#F4F4F5`).
  - Clamping: Strict 2-line clamp (`line-clamp-2`), fixed height `38px` ensuring uniform card heights.
* **Pricing Row**:
  - Sale Price: JetBrains Mono bold (`17px`, color `#F4F4F5`).
  - Strikethrough MRP: JetBrains Mono (`12px`, color `#68707D`, line-through).
  - Savings Tag: Green label (`Save ₹3,591`).
* **Price Trend Sparkline Area**:
  - Embedded vector SVG sparkline showing historical price movement.
  - Drop badge: `↓ 31% below 30d avg` in green mono.
* **Verification & Inspection Row**:
  - Left: Emerald checkmark with `✓ Verified Loot`.
  - Right: Accessible inspection trigger: `Breakdown ↗` (opens `DealDetailModal`).
* **Primary Action CTA**:
  - Full-width button, height `38px`, sharp `2px` radius.
  - Background: `#D97706` (transitions to `#F59E0B` on hover).
  - Text: `GO TO DEAL →` in Lexend bold (`12px`, uppercase, tracking `0.05em`, color `#0D0E11`).

---

### 3.6 Inline Vector Price History Sparkline (`PriceSparkline.tsx`)
* **Rendering**: Pure inline vector `<svg>` (0 dependencies, 0 charting library overhead).
* **ViewBox**: `0 0 160 36`.
* **Visual Components**:
  - Area Fill: Linear gradient (`stop-color: #D97706`, `stop-opacity: 0.2` to `0.0`).
  - Trend Path: Solid amber line (`stroke: #D97706`, `stroke-width: 1.5`, `stroke-linecap: round`).
  - Reference Line: Dashed 30-day average line (`stroke: #363B47`, `stroke-dasharray: 2 2`).
  - Spot Marker: Pulse dot at final price coordinate (`r: 2.5`, `fill: #D97706`).
* **Telemetry**: Calculates difference between current sale price and 30-day baseline, displaying `↓ X% below 30d avg` in emerald.

---

### 3.7 Deal Detail & Savings Breakdown Modal (`DealDetailModal.tsx`)
```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ [AMAZON]  Electronics > Audio                      [Verified Loot]           [×] │
├──────────────────────────────────────┬───────────────────────────────────────────┤
│                                      │ boAt Airdopes 141 Wireless Earbuds        │
│                                      │                                           │
│            PRODUCT PHOTO             │ ₹899  ~~₹4,490~~  [ -74% OFF ]            │
│                 (4:3)                │ Total Savings: ₹3,591                     │
│           Click to Zoom 🔍           │ ───────────────────────────────────────── │
│                                      │ PROMO CODE: [ BOAT50     ]  [ COPY CODE ] │
│                                      │ ───────────────────────────────────────── │
│                                      │ 30-DAY PRICE HISTORY (SPARKLINE)          │
│                                      │ Highest: ₹4,490 | Lowest: ₹899            │
│                                      │ [~~~~~~~~~~~~~~~~📉~~~~~~~~~~~~~~~~~~~~~] │
├──────────────────────────────────────┴───────────────────────────────────────────┤
│ [ ⚡ GO TO STORE (AFFILIATE LINK) ↗ ]   [ 🔗 Share Deal ]   [ ⚠️ Report Expired ]  │
└──────────────────────────────────────────────────────────────────────────────────┘
```
* **Backdrop**: Fixed dark overlay (`rgba(0,0,0,0.85)` with `backdrop-filter: blur(6px)`), portaled to `document.body`.
* **Modal Frame**: Max-width `720px`, `#14161B` surface, `1px solid #363B47`, sharp `2px` corners.
* **Left Column (Media)**: High-resolution `4:3` container with click-to-zoom affordance (`cursor: zoom-in` triggers `ImageModal`).
* **Right Column (Details & Breakdown)**:
  - Full unabridged product title.
  - Price matrix: Sale price (`26px` bold mono), list price, percentage off, absolute rupee savings.
  - Coupon Code Box: Dashed border with one-click copy button (changes to `COPIED ✓` in emerald for 2 seconds and triggers floating toast).
  - Price History Section: High-res sparkline with numerical metrics (Highest Recorded, Lowest Recorded, 30d Median).
  - Editorial Verification Note: `"Verified via official Amazon product feed. Confirmed active across 4 independent sources."`
* **Footer Actions**:
  - Primary CTA: `GO TO DEAL ON [STORE] ↗` (opens affiliate link in new tab).
  - Secondary: `Share Deal` (triggers Web Share API or copies clean share link).
  - Tertiary: `Report Expired` (flags deal for re-checking).

---

### 3.8 Instant Deal Lookup Tool (`DealLookupModal.tsx`)
* **Purpose**: Allows users to paste any product URL from Amazon, Flipkart, Myntra, or DesiDime to instantly check for secret coupons, price drop history, or verified loot drops.
* **Layout**: Centered modal with large URL input field, store auto-detector badge, and `"Search Deal Database"` CTA.
* **Result View**: Displays product card with current price, best historical price, and whether the deal is currently live or expired.

---

### 3.9 Credit Card Cashback Calculator (`CardCalculatorModal.tsx`)
* **Purpose**: Helps users calculate additional savings with bank cards (HDFC, ICICI, SBI, Axis, Flipkart Axis, Amazon Pay ICICI).
* **UI Structure**:
  - Deal Price Input (pre-populated from active deal).
  - Card Selector Dropdown with bank emblems.
  - Instant Net Effective Price display: `Original: ₹899 - 5% Cashback (₹45) = Net ₹854`.

---

### 3.10 Zero-CLS Skeletons (`DealSkeleton.tsx`)
* **Guarantee**: Cumulative Layout Shift (CLS) = 0.
* **Geometry**: Exactly matches `PublicDealCard` dimensions:
  - `minmax(220px, 1fr)` grid with `16px` gap.
  - Top meta pill skeleton (`h-4 w-16`).
  - Image skeleton: Fixed **`aspect-[4/3]`** container with `#1A1D24` background.
  - Title skeletons: Two lines (`h-3.5 w-full` and `h-3.5 w-3/4`).
  - Price skeleton: Bold block (`h-5 w-24`).
  - CTA skeleton: Button placeholder (`h-9 w-full`).
* **Animation**: Subtle flat pulse (`opacity: 0.6` to `0.3`, duration `1.4s ease-in-out infinite`).

---

### 3.11 Mobile Thumb Dock (`ThumbDeck.tsx` & `FloatingDock.tsx`)
```
┌────────────────────────────────────────────────────────────────────────┐
│  [ 🔥 Deals ]      [ 🔍 Search ]      [ 🏷️ Stores ]      [ ✈ Join ]    │
└────────────────────────────────────────────────────────────────────────┘
```
* **Position**: Fixed at bottom of mobile viewports (`bottom: 0`, `z-index: 45`).
* **Height**: `56px` + `env(safe-area-inset-bottom)`.
* **Backdrop**: `#14161B` with `backdrop-filter: blur(16px)`, `border-t: 1px solid #23262F`.
* **Ergonomics**: 4 thumb-friendly touch targets (min `44px` height). Active item glows in warm amber.
* **Bottom Clearance**: Feed container has `pb-24` ensuring the lowest cards scroll completely past the dock.

---

## 4. Screen-by-Screen Specification: Admin Curation Deck (`dealflow` / `tg-setup`)

### 4.1 Header Bar & Live Cockpit Navigation
```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│  ⚡ DEALFLOW CURATION DECK   [🟢 Online: api.rudranil.me]   [Select Mode: OFF]   [42 Pending]     │
│  [ REVIEW (42) ]    [ CHANNELS (27) ]    [ SMART RULES ]    [ VIDEO STUDIO ]    [ SETTINGS ]     │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
* **Aesthetic**: Deep Cyberpunk Cockpit (`#08080C` background, subtle blue/cyan ambient glows, glassmorphism).
* **System Health Pill**: Real-time WebSocket connection status:
  - `🟢 Online: api.rudranil.me` (WebSocket connected, latency `< 45ms`).
  - `🟡 Connecting...` or `🔴 Offline (Reconnecting)`.
* **Select Mode Switch**: Toggle that enables multi-card checkboxes across the review grid.
* **Primary Navigation Tabs**:
  - `Review (N)`: Pending curation stream.
  - `Channels (27)`: Real-time telemetry and channel health monitoring.
  - `Smart Rules`: Auto-approval condition deck.
  - `Video Studio`: Automated Remotion short-form video generator.
  - `Settings`: Multi-LLM keys and affiliate tags.

---

### 4.2 Review Deck Cards with Live Telegram Preview
```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [Genie Loot]  https://t.me/+********                             scraped 2m ago   [☑ Select]     │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────┐  ┌───────────────────────────────────────────────────────────────┐ │
│ │                           │  │ 💬 TELEGRAM POST PREVIEW (Generated by Multi-LLM Cascade)    │ │
│ │                           │  │                                                               │ │
│ │       SCRAPED IMAGE       │  │ 🔥 *LOOT DEAL ON BOAT AIRDOPES 141* 🔥                        │ │
│ │       (Zero-Halos)        │  │                                                               │ │
│ │     aspect-[4/3] fit      │  │ 💰 Flat 74% OFF on Wireless Earbuds!                          │ │
│ │                           │  │ 🏷 MRP: ₹4,490  👉 *Loot Price: ₹899*                         │ │
│ │                           │  │                                                               │ │
│ │                           │  │ 🛒 Buy Here: https://deals.example.com/amzn/airdopes          │ │
│ │                           │  │ ⚠️ Price can change anytime!                                  │ │
│ └───────────────────────────┘  └───────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Store: [AMAZON]   Category: [Audio]   Price: ₹899   MRP: ₹4,490   Discount: 74%                  │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [ 🚀 APPROVE & BROADCAST ]   [ 🗑️ SKIP / REJECT ]   [ ✏️ TUNE AI & EDIT ]   [ 🔍 STORE SCRAPE ]  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
* **Channel Source Header**:
  - Channel Avatar: Initial badge (`G` for Genie Loot, `D` for DesiDime, `O` for Offerzone).
  - Source Title: Extracted dynamically from MongoDB (`Genie Loot`, `DealzTrendz 2.0`).
  - Invite Link: Clickable link (`https://t.me/+...`).
* **Live Telegram Post Preview Bubble**:
  - Rendered inside a dark Telegram-styled message bubble (`#1E232E` background, rounded `12px` border).
  - Displays formatted Markdown with bold headings, emojis, bullet points, and live converted affiliate links (`https://amzn.to/...` or EarnKaro redirect).
* **Action Toolbar**:
  - `🚀 Approve & Broadcast` (Emerald `#10B981`): Publishes deal to Redis `deals:approved`, pushes to Telegram `@dealsforindiachannel`, and archives to MongoDB as `posted`.
  - `🗑️ Skip / Reject` (Rose `#EF4444`): Marks deal as `rejected` in MongoDB and removes it from the pending view.
  - `✏️ Tune AI & Edit` (Amber `#F59E0B`): Opens the Live AI Prompt Tuning Modal.
  - `🔍 Store Scrape` (Cyan `#06B6D4`): Invokes `/scrape-image` to bypass anti-bot blocks, fetch high-res product photos, and scrape spot prices.

---

### 4.3 Live AI Prompt Tuning & Edit Modal (`EditModal.tsx`)
```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│  EDIT & TUNE DEAL: boAt Airdopes 141                                                         [×] │
├─────────────────────────────────────────────────┬────────────────────────────────────────────────┤
│  FIELD EDITOR                                   │  LIVE TELEGRAM PREVIEW (REAL-TIME)             │
│                                                 │                                                │
│  Product Title:                                 │  ┌──────────────────────────────────────────┐  │
│  [ boAt Airdopes 141 Wireless Earbuds         ] │  │ 💬 DealzTrendz                    14:32  │  │
│                                                 │  │                                          │  │
│  Current Price (₹):      MRP (₹):               │  │ [PRODUCT PHOTO]                          │  │
│  [ 899             ]     [ 4490             ]   │  │                                          │  │
│                                                 │  │ 🔥 *MASSIVE PRICE DROP*                  │  │
│  Store URL:                                     │  │ boAt Airdopes 141 Wireless Earbuds       │  │
│  [ https://www.amazon.in/dp/B09N3ZNHTY       ]  │  │ 🏷 Deal Price: ₹899 (MRP: ₹4,490)        │  │
│                                                 │  │ 🛒 https://amzn.to/3ZXy7k               │  │
│  AI REWRITE PROMPTS:                            │  └──────────────────────────────────────────┘  │
│  [ 🔥 Add Urgency ]     [ ✂️ Make Concise ]     │                                                │
│  [ 💰 Highlight % ]     [ ✨ Clean Markdown ]   │                                                │
│                                                 │                                                │
│  Custom AI Prompt:                              │                                                │
│  [ Focus on battery life and gaming mode...   ] │                                                │
│  [ ⚡ REGENERATE WITH GROQ / GEMINI ]           │                                                │
├─────────────────────────────────────────────────┴────────────────────────────────────────────────┤
│  [ 🚀 SAVE & BROADCAST TO TELEGRAM ]            [ 💾 SAVE DRAFT ]              [ CANCEL ]        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
* **Dual-Pane Split**:
  - Left: Interactive form inputs for title, price, MRP, affiliate URL, category, and AI prompt controls.
  - Right: Live Telegram Post preview bubble that updates in real time as fields or AI outputs are generated.
* **One-Click AI Preset Chips**:
  - `🔥 Add Urgency`: Injects scarcity phrasing (`"HURRY! Price error likely to expire in minutes!"`).
  - `✂️ Make Concise`: Trims text down to essential title, price, and affiliate link.
  - `💰 Highlight %`: Emphasizes savings and discount math (`"Flat 74% OFF - Save ₹3,591"`).
  - `✨ Clean Markdown`: Enforces standard Telegram bolding, emoji accents, and link formatting.
* **Multi-LLM Integration**:
  - Curators can enter custom instructions into the prompt box.
  - Clicking `⚡ Regenerate` calls `/api/v1/deals/{fp_hash}/ai-rewrite` across Groq (Qwen 3.8 27B / GPT-OSS), Gemini (2.5 Flash), or Together AI.

---

### 4.4 Floating Bulk Selection Dock
```
┌────────────────────────────────────────────────────────────────────────┐
│  [☑ 14 Deals Selected]    [ 🚀 Approve All (14) ]    [ 🗑️ Skip All ]    [ Clear ] │
└────────────────────────────────────────────────────────────────────────┘
```
* **Trigger**: Activates automatically whenever `Select Mode` is toggled on and $\ge 1$ deal card is checked.
* **Position**: Floating bottom-center (`bottom: 24px`, `z-index: 100`), glassmorphic `#14161B` panel with emerald accent ring.
* **Batch Operations**:
  - `🚀 Approve All (N)`: Concurrently approves all selected deals via background worker and broadcasts to Telegram.
  - `🗑️ Skip All (N)`: Rejects all selected deals in MongoDB in a single transaction.

---

### 4.5 Channels Telemetry & Link Healing Hub (`ChannelsTab.tsx`)
```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│  CHANNELS TELEMETRY & STREAM HEALTH (27 ACTIVE CHANNELS)                                         │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│  Channel Name           Link / Handle             24h Deals   Health Status       Auto-Post      │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│  Genie Loot             https://t.me/+********        48       🟢 Healthy          [ ON  | off ]  │
│  DealzTrendz 2.0        https://t.me/+********        34       🟢 Healthy          [ on  | OFF ]  │
│  Offerzone 4.0          https://t.me/+********        29       🟢 Healthy          [ on  | OFF ]  │
│  DesiDime Hot Deals     @DesidimeHot                 62       🟢 Healthy          [ ON  | off ]  │
│  Glam Haul Diaries      @glamhauldiaries             18       🟡 Slow Stream      [ on  | OFF ]  │
│  Private Deals From All @bblbblp                      0       🔴 Dead Link Warn   [ ✏️ Update ]  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
* **Channel Grid**: Full directory of all 27 integrated Telegram channels and scrapers.
* **Auto-Post Toggle**: Allows admins to enable/disable auto-approval per channel. Auto-posted deals bypass manual curation and publish immediately.
* **Stream Health Badges**:
  - `🟢 Healthy`: Active messages received within the last 30 minutes.
  - `🟡 Slow Stream`: No messages received in 6 hours.
  - `🔴 Dead Link Warning`: Scraper encountered Telegram `InviteHashExpired` or private link rotation.
* **1-Click Update Invite Link Modal**: Curators can paste the new invite URL (`https://t.me/+...`) and submit. MongoDB updates immediately and alerts `listener.py` via Redis without server restarts.

---

## 5. Screen-by-Screen Specification: Telegram Native Interfaces

### 5.1 Legacy Admin PM Approval Bot (`bot.py`)
```
┌────────────────────────────────────────────────────────────────────────┐
│  [PHOTO ATTACHMENT: High-Resolution Product Image]                     │
│                                                                        │
│  🔥 *Genie Loot Drop!*                                                 │
│                                                                        │
│  *boAt Airdopes 141 Bluetooth Wireless Earbuds*                        │
│  🏷 Deal Price: *₹899*  ~~₹4,490~~  (74% OFF)                          │
│                                                                        │
│  🛒 Store: Amazon India                                                │
│  🔗 Link: https://deals.example.com/amzn/airdopes                      │
│  📡 Source: Genie Loot (t.me/+********)                                │
├────────────────────────────────────────────────────────────────────────┤
│  [ 🚀 Post to Channel ]               [ 🗑️ Skip / Dismiss ]            │
└────────────────────────────────────────────────────────────────────────┘
```
* **Mechanism**: Sent directly to Admin's private Telegram chat ID via Telethon.
* **Inline Keyboards**:
  - `[ 🚀 Post to Channel ]` (`callback_data: post_{hash}`): Broadcasts to `@dealsforindiachannel`, updates MongoDB `UniqueDeals.status = "posted"`.
  - `[ 🗑️ Skip / Dismiss ]` (`callback_data: skip_{hash}`): Dismisses deal, updates MongoDB `status = "rejected"`.
* **In-Place Caption Editing**: Upon clicking either button, the bot edits the Telegram message caption in place (`"✅ POSTED by Admin"` or `"❌ DISMISSED"`), preventing duplicate button presses.

---

### 5.2 Public Channel Broadcast Format (`@dealsforindiachannel`)
```
🔥 *LOOT DEAL: 74% OFF ON BOAT AIRDOPES 141* 🔥

boAt Airdopes 141 Bluetooth Truly Wireless in Ear Earbuds with 42H Playtime, Beast Mode, ASAP Charge, IWP Technology.

💰 *Deal Price: ₹899*
🏷 MRP: ~~₹4,490~~
⚡ *Flat 74% Instant Discount!*

🛒 *Buy on Amazon:*
👉 https://deals.example.com/amzn/airdopes

━━━━━━━━━━━━━━━━━━━━
📢 Join @dealsforindiachannel for fastest loot alerts!
#Amazon #Audio #LootDeals
```
* **Attached Photo**: Clean high-res product photo scraped from Amazon/Flipkart (zero watermarks).
* **Typography**: Rich Telegram Markdown formatting (`*bold*`, `~~strikethrough~~`, `_italics_`).
* **Affiliate Monetization**: All links tagged with Amazon Associate tag (`[REDACTED_TAG]`) or EarnKaro affiliate redirect.
* **Channel Branding**: Uniform footer and store hashtags on every post.

---

## 6. Accessibility & Mobile Ergonomics Matrix

| Ergonomic Requirement | Implementation Detail | Status |
|---|---|---|
| **Thumb Zone Accessibility** | All critical interactive triggers (CTAs, mobile navigation dock, filter pills) placed within bottom `60%` of mobile viewport. | ✅ Enforced |
| **Minimum Touch Target** | Every button, link, and popover item adheres to minimum `44px × 44px` touch bounding box. | ✅ Enforced |
| **Zero Layout Shift (CLS)** | Skeletons and image frames strictly enforce `aspect-[4/3]` matching final hydrated deal media. CLS = `0.00`. | ✅ Enforced |
| **Keyboard Navigation** | Global hotkey `/` focuses search; `Esc` closes modals; `Tab` / `Shift+Tab` cycles through focusable elements. | ✅ Enforced |
| **Screen Reader Semantics** | All interactive modals have `role="dialog"`, `aria-modal="true"`, and descriptive `aria-label` tags. | ✅ Enforced |
| **Contrast Ratios** | Text elements achieve minimum `4.5:1` WCAG AA contrast ratio against dark `#0D0E11` and `#14161B` surfaces. | ✅ Enforced |

---

*Master DealFlow UI/UX & Design Specification compiled on September 28, 2026.*
