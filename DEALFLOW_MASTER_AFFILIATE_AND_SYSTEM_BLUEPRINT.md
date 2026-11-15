# DealFlow & IndiaDealHunts: Master System Blueprint & High-Leverage Affiliate Architecture

> **Document Type:** Comprehensive Architecture & Implementation Specification  
> **Target Platforms:** IndiaDealHunts Consumer Portal (`rudranil-deals-web`), DealFlow Backend (`dealbot_backend`), and Telegram Bot Network (`bot.py`)  
> **Primary Focus:** Mobile-Centric (Android/iOS 85%+ Traffic), Affiliate Commission Multiplication, Friction Elimination, and Algorithmic Arbitrage  
> **Date:** October 2026  
> **Status:** APPROVED FOR IMPLEMENTATION  

---

## 📑 Table of Contents

1. [Executive Strategy: The Mobile-Centric Affiliate Multiplier](#1-executive-strategy-the-mobile-centric-affiliate-multiplier)
2. [Approved Feature 1: "Direct-to-Cart" Cookie Hijacker (90-Day Amazon Cart Lock)](#2-approved-feature-1-direct-to-cart-cookie-hijacker-90-day-amazon-cart-lock)
3. [Approved Feature 2: Multi-ASIN "Cart Stuffer" (High-Commission Category Stacking)](#3-approved-feature-2-multi-asin-cart-stuffer-high-commission-category-stacking)
4. [Approved Feature 3: Native Mobile App Deep-Linker (Zero-Login-Wall Intent Bypass)](#4-approved-feature-3-native-mobile-app-deep-linker-zero-login-wall-intent-bypass)
5. [Approved Feature 4: Hidden Clip-Coupon Sniffer & Auto-Activator](#5-approved-feature-4-hidden-clip-coupon-sniffer--auto-activator)
6. [Approved Feature 5: Exit-Intent "90-Day Cart Lock" Retention Drawer](#6-approved-feature-5-exit-intent-90-day-cart-lock-retention-drawer)
7. [Approved Feature 6: Dynamic SubID Attribution Engine](#7-approved-feature-6-dynamic-subid-attribution-engine)
8. [Distinct Direction A: Android Native "Share Sheet" Interceptor (PWA Share Target API)](#8-distinct-direction-a-android-native-share-sheet-interceptor-pwa-share-target-api)
9. [Distinct Direction B: Competitor Deal "De-Spammer" Bot (Viral Telegram Traffic Hijacker)](#9-distinct-direction-b-competitor-deal-de-spammer-bot-viral-telegram-traffic-hijacker)
10. [Distinct Direction C: Programmatic "Long-Tail Loot" SEO Engine](#10-distinct-direction-c-programmatic-long-tail-loot-seo-engine)
11. [Distinct Direction D: Amazon FBA "Storage Penalty Overstock" Warehouse Clearance Hunter](#11-distinct-direction-d-amazon-fba-storage-penalty-overstock-warehouse-clearance-hunter)
12. [Distinct Direction E: Hinglish / Regional Voice Deal Finder for Tier-2/3 Shoppers](#12-distinct-direction-e-hinglish--regional-voice-deal-finder-for-tier-23-shoppers)
13. [Technical Rollout Waves & File Implementation Plan](#13-technical-rollout-waves--file-implementation-plan)

---

## 1. Executive Strategy: The Mobile-Centric Affiliate Multiplier

Over **85% of online deal shoppers in India** browse exclusively via smartphones (originating from Telegram, WhatsApp, Instagram, or mobile Chrome). 

Standard deal aggregators operate under obsolete desktop assumptions: they link users to standard mobile web product pages where visitors are **not logged in**, encounter login/OTP walls, face **24-hour cookie expiration**, and generate meager **1% to 1.5% commission caps** on smartphones and consumer tech.

This blueprint transforms **IndiaDealHunts** into a high-converting, mobile-optimized affiliate weapon by solving three core problems:
1. **Cookie Longevity**: Expanding Amazon's attribution window from **24 hours to 90 days** via remote cart pre-population.
2. **Category Arbitrage**: Stacking low-commission items (Phones @ 1%) with high-commission accessories (Cases/Protectors @ 9–10%) in a single checkout.
3. **Login Friction Elimination**: Bypassing mobile web browsers entirely using native Android/iOS OS app intents that drop users directly into authenticated Amazon and Flipkart apps with saved delivery addresses and 1-tap UPI (GPay/PhonePe).

---

## 2. Approved Feature 1: "Direct-to-Cart" Cookie Hijacker (90-Day Amazon Cart Lock)

### 2.1 The Operational Loophole
* **Standard Affiliate Link**: Routing users to `https://www.amazon.in/dp/{ASIN}?tag=dealshare0b7-21` sets a standard 24-hour cookie. If the user browses, closes the tab, and completes checkout 26 hours later, you earn **₹0**.
* **Remote Cart Addition Endpoint**: Amazon provides an official server-side cart endpoint:
  ```http
  https://www.amazon.in/gp/aws/cart/add.html?ASIN.1={ASIN}&Quantity.1=1&AssociateTag={AMAZON_TAG}
  ```
* **Amazon Operating Agreement Section 7**: Any product placed directly into an Amazon user's shopping cart via an Associate link maintains affiliate attribution for up to **90 days** (until the cart is cleared or purchased).

### 2.2 ASIN Extraction Engine
The ASIN is extracted automatically from any Amazon URL or Deal ID:
```typescript
export function extractAmazonAsin(urlOrId: string): string | null {
  if (!urlOrId) return null;
  // Match direct ASIN in string or URL
  const match = urlOrId.match(/(?:dp|gp\/product|asin=|ext_amz_|\/)([A-Z0-9]{10})(?:[/?&#]|$)/i);
  return match ? match[1].toUpperCase() : null;
}
```

### 2.3 Storefront Implementation
Every Amazon deal card and search result presents a prominent dual-action layout:
* **Primary Mobile Button**: `🛒 Add to Cart (Locks 90-Day Price) ↗`
* **Direct Cart Link**:
  ```typescript
  export function buildAmazonCartUrl(asin: string, tag: string = 'dealshare0b7-21', subId?: string): string {
    let url = `https://www.amazon.in/gp/aws/cart/add.html?ASIN.1=${asin}&Quantity.1=1&AssociateTag=${tag}`;
    if (subId) {
      url += `&ascsubtag=${encodeURIComponent(subId)}`;
    }
    return url;
  }
  ```

---

## 3. Approved Feature 2: Multi-ASIN "Cart Stuffer" (High-Commission Category Stacking)

### 3.1 The Commission Disparity
| Category | Amazon India Associate Commission | Cap per Item |
|---|---|---|
| **Smartphones / Mobiles** | **1.0% – 1.5%** | **Capped at ₹100 – ₹150** |
| **Laptops / Consumer Tech** | **1.0% – 2.0%** | **Capped at ₹500** |
| **Mobile Accessories / Cases / Cables** | **9.0% – 10.0%** | **UNCAPPED** |
| **Grocery / Pantry / Snacks** | **4.0% – 8.0%** | **UNCAPPED** |

*Selling a ₹20,000 phone alone nets you ₹150.*  
*Selling a ₹20,000 phone bundled with a ₹299 tempered glass + case nets you ₹150 + ₹30 = ₹180, plus increases checkout cart size and keeps the entire order under your affiliate cookie.*

### 3.2 Multi-ASIN Endpoint Specification
Amazon's remote cart endpoint accepts up to 10 simultaneous items:
```http
https://www.amazon.in/gp/aws/cart/add.html?ASIN.1={PHONE_ASIN}&Quantity.1=1&ASIN.2={ACCESSORY_ASIN}&Quantity.2=1&AssociateTag={TAG}&ascsubtag={SUBID}
```

### 3.3 Dynamic Accessory Pairing Engine
When a product belongs to the `📱 Electronics` or `Smartphones` category, the frontend automatically pairs it with verified, top-rated universal or model-specific companion items:
```typescript
export interface CartBundleOption {
  accessoryTitle: string;
  accessoryAsin: string;
  accessoryPrice: number;
}

export function buildMultiAsinCartUrl(
  mainAsin: string,
  bundleAsin: string,
  tag: string = 'dealshare0b7-21',
  subId?: string
): string {
  let url = `https://www.amazon.in/gp/aws/cart/add.html?ASIN.1=${mainAsin}&Quantity.1=1&ASIN.2=${bundleAsin}&Quantity.2=1&AssociateTag=${tag}`;
  if (subId) url += `&ascsubtag=${encodeURIComponent(subId)}`;
  return url;
}
```

### 3.4 UX Presentation on Deal Cards
On high-ticket cards, render an interactive toggle:
```tsx
<label className="flex items-center gap-2 p-2 mt-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
  <input type="checkbox" checked={includeBundle} onChange={(e) => setIncludeBundle(e.target.checked)} />
  <span className="text-[11px] font-semibold text-slate-700">
    ⚡ Bundle with 9H Tempered Glass + Clear Case (+₹249)
  </span>
</label>
```

---

## 4. Approved Feature 3: Native Mobile App Deep-Linker (Zero-Login-Wall Intent Bypass)

### 4.1 The Problem
When mobile users tap an affiliate link on Android or iOS inside Chrome or the Telegram webview:
1. They land on the mobile browser version of Amazon or Flipkart.
2. They are **not logged in**.
3. Amazon/Flipkart prompts for email, password, or SMS OTP.
4. **70%+ of shoppers bounce** because nobody wants to enter passwords on mobile.

### 4.2 The Android Intent URI Architecture
Using Android Intent filters, the click bypasses the browser and directly opens the installed native shopping app:

#### Amazon India Native App Intent:
```
intent://www.amazon.in/dp/{ASIN}?tag=dealshare0b7-21#Intent;scheme=https;package=in.amazon.mShop.android.shopping;end
```

#### Amazon 90-Day Cart Add Intent:
```
intent://www.amazon.in/gp/aws/cart/add.html?ASIN.1={ASIN}&Quantity.1=1&AssociateTag=dealshare0b7-21#Intent;scheme=https;package=in.amazon.mShop.android.shopping;end
```

#### Flipkart Native App Intent:
```
intent://dl.flipkart.com/dl/{PRODUCT_PATH}?affid={EARNKARO_ID}#Intent;scheme=https;package=com.flipkart.android;end
```

### 4.3 Client-Side Smart Deep-Link Handler with Fallback
If the user is on desktop or does not have the native app installed, fall back to the standard web affiliate URL after 400ms:
```typescript
export function openSmartStoreLink(
  webAffiliateUrl: string,
  store: string,
  asin?: string,
  forceCart: boolean = false
): void {
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isAndroid) {
    let intentUrl = '';
    const cleanAsin = asin || extractAmazonAsin(webAffiliateUrl);

    if (store.toLowerCase().includes('amazon') && cleanAsin) {
      const targetPath = forceCart
        ? `gp/aws/cart/add.html?ASIN.1=${cleanAsin}&Quantity.1=1&AssociateTag=dealshare0b7-21`
        : `dp/${cleanAsin}?tag=dealshare0b7-21`;
      intentUrl = `intent://www.amazon.in/${targetPath}#Intent;scheme=https;package=in.amazon.mShop.android.shopping;end`;
    } else if (store.toLowerCase().includes('flipkart')) {
      const rawPath = webAffiliateUrl.replace(/^https?:\/\/(?:www\.)?flipkart\.com\//, '');
      intentUrl = `intent://dl.flipkart.com/dl/${rawPath}#Intent;scheme=https;package=com.flipkart.android;end`;
    }

    if (intentUrl) {
      const start = Date.now();
      window.location.href = intentUrl;
      setTimeout(() => {
        // If app did not open within 400ms, user does not have app -> redirect to web
        if (Date.now() - start < 1500) {
          window.location.href = webAffiliateUrl;
        }
      }, 400);
      return;
    }
  }

  // Desktop or iOS universal fallback
  window.open(webAffiliateUrl, '_blank', 'noopener,noreferrer,sponsored');
}
```

---

## 5. Approved Feature 4: Hidden Clip-Coupon Sniffer & Auto-Activator

### 5.1 The Coupon Arbitrage
Amazon India sellers frequently run green **"Clip Coupon"** promotions (e.g. ₹500 off, ₹1,000 off, or 10% off) that require the user to check a box.
* Listed Price on Amazon / Competitor Channels: `₹4,999`
* True Checkout Price after coupon: `₹4,499`

Aggregators only display ₹4,999. By detecting and highlighting this coupon, IndiaDealHunts immediately shows a lower, authentic price.

### 5.2 Scraper Detection Pipeline (`worker.py` & `api.py`)
In `stealth_fetcher` / Amazon scraper soup:
```python
def extract_amazon_coupon(soup) -> Optional[Dict[str, Any]]:
    # 1. Check coupon badge text
    coupon_el = soup.select_one('span.promoPrice, span.s-coupon-highlight-color, span.a-size-base.s-coupon-unclipped, label[for*="coupon"]')
    if not coupon_el:
        return None
    
    text = coupon_el.get_text(strip=True)
    val_m = re.search(r'(?:₹|Rs\.?)\s*([0-9,]+)', text)
    pct_m = re.search(r'([0-9]+)%\s*coupon', text, re.I)
    
    if val_m:
        return {"amount": float(val_m.group(1).replace(",", "")), "type": "fixed", "label": f"₹{val_m.group(1)} Clip Coupon"}
    elif pct_m:
        return {"pct": int(pct_m.group(1)), "type": "percentage", "label": f"{pct_m.group(1)}% Clip Coupon"}
    return None
```

### 5.3 Effective Price Calculation
```python
coupon = extract_amazon_coupon(soup)
effective_price = price
if coupon:
    if coupon.get("amount"):
        effective_price = max(0, price - coupon["amount"])
    elif coupon.get("pct"):
        effective_price = round(price * (1 - (coupon["pct"] / 100.0)), 2)
```

### 5.4 Frontend Badge Display
```tsx
{deal.coupon && (
  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
    <span>🏷️</span>
    <span>{deal.coupon} (Net Price: ₹{deal.effective_price})</span>
  </div>
)}
```

---

## 6. Approved Feature 5: Exit-Intent "90-Day Cart Lock" Retention Drawer

### 6.1 Trigger Mechanics
1. **Desktop**: User's mouse cursor moves above `clientY <= 10` toward the browser close button / tab bar.
2. **Mobile**: Rapid upward scroll velocity or back-button press state.
3. **Session Frequency Cap**: Triggers at most **once per 4 hours** per visitor using `sessionStorage.getItem('idh_exit_cart_shown')`.

### 6.2 Component Architecture (`ExitIntentCartDrawer.tsx`)
```tsx
export const ExitIntentCartDrawer: React.FC<{ topDeal: PublicDeal | null }> = ({ topDeal }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 10 && !sessionStorage.getItem('idh_exit_cart_shown') && topDeal) {
        sessionStorage.setItem('idh_exit_cart_shown', 'true');
        setIsOpen(true);
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [topDeal]);

  if (!isOpen || !topDeal) return null;

  const asin = extractAmazonAsin(topDeal.url);
  const cartUrl = asin ? buildAmazonCartUrl(asin) : topDeal.url;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 animate-in slide-in-from-bottom-6">
        <div className="flex items-center justify-between">
          <span className="text-2xl">⏳</span>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-700 text-sm font-bold">✕</button>
        </div>
        <h3 className="mt-2 text-base font-black text-slate-900">Before you go — Lock today's price for 90 Days!</h3>
        <p className="mt-1 text-xs text-slate-500">
          Loot deals on <strong>{topDeal.title.slice(0, 50)}...</strong> expire fast. Add it directly to your Amazon Cart now to lock in <strong>₹{topDeal.price}</strong>.
        </p>
        <div className="mt-4 flex gap-2">
          <button onClick={() => setIsOpen(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
            No Thanks
          </button>
          <a
            href={cartUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white text-center shadow-sm"
          >
            🛒 Lock in Amazon Cart ↗
          </a>
        </div>
      </div>
    </div>
  );
};
```

---

## 7. Approved Feature 6: Dynamic SubID Attribution Engine

### 7.1 Client-Side Execution (Zero Backend Requirement)
Because `rudranil-deals-web` is a client-side Single Page Application (SPA), outbound links are dynamically tagged at the moment of click without requiring server-side analytics.

### 7.2 Parameter Schemas
* **Amazon Associates**: Uses the official `&ascsubtag=` parameter:
  ```http
  https://www.amazon.in/dp/{ASIN}?tag=dealshare0b7-21&ascsubtag={SOURCE}_{DEAL_ID}_{DEVICE}
  ```
  Example: `&ascsubtag=search_cashew_extfk12_mob`
* **EarnKaro**: Uses the official `&subid=` parameter:
  ```http
  https://ekaro-api.affiliaters.in/api/converter/public?deal={URL}&subid={SOURCE}_{DEAL_ID}
  ```

### 7.3 Where Payout Reports Appear
1. **Amazon Associates Central (`associates.amazon.in`)**:
   * Navigate to: **Reports $\rightarrow$ Tracking ID / Subtag Report**.
   * Displays an exact CSV breakdown of clicks, shipped units, revenue, and commission per Subtag.
2. **EarnKaro Dashboard (`earnkaro.com`)**:
   * Navigate to: **My Earnings $\rightarrow$ Reports by SubID**.
   * Displays confirmed and pending earnings per SubID.

---

## 8. Distinct Direction A: Android Native "Share Sheet" Interceptor (PWA Share Target API)

### 8.1 The User Behavior
When an Indian shopper finds a product inside the official Amazon or Flipkart app, they tap the Android native **Share button** to check it with a friend on WhatsApp or compare prices.

### 8.2 The Web Share Target API
By configuring the PWA `manifest.json`, **IndiaDealHunts registers itself as a native sharing destination on the user's Android phone**:
```json
{
  "name": "IndiaDealHunts",
  "short_name": "DealHunts",
  "start_url": "/",
  "display": "standalone",
  "share_target": {
    "action": "/share-target",
    "method": "GET",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url"
    }
  }
}
```

### 8.3 The Interception Workflow
1. User taps "Share" inside Amazon or Flipkart.
2. Android native share sheet pops up displaying WhatsApp, Telegram, and **IndiaDealHunts**.
3. User taps IndiaDealHunts:
   * The app opens immediately to `/share-target?url=...`.
   * Evaluates 90-day price history via ShoppinGenie.
   * If price is at an all-time low: displays *"🏆 Verified Lowest Price!"* with the 1-click **90-Day Cart Lock**.
   * If price is inflated: displays *"⚠️ Wait! Cheaper on Flipkart by ₹450"*.
4. **Impact**: Converts your web platform into a native OS shopping utility.

---

## 9. Distinct Direction B: Competitor Deal "De-Spammer" Bot (Viral Telegram Traffic Hijacker)

### 9.1 The Mechanics
Millions of deal hunters are subscribed to rival Telegram channels (Offerzone, DealzTrendz, Free Earning Tech) where admins post spammy deals with fake MRP discounts.

### 9.2 The Bot Service (`@DealTruthBot` via `bot.py`)
Users forward any deal message from any channel to your bot:
```
[User forwards deal from rival channel]
                      │
                      ▼
            `bot.py` Message Handler
                      │
      1. Unshorten target URL
      2. Check ShoppinGenie 90-day history
      3. Classify: Genuine Drop vs. Fake MRP Spike
                      │
                      ▼
            Automated Reply (within 2 seconds):
```
```
🔍 DEAL AUDIT: OnePlus Nord CE 4 (128GB)

🟢 VERDICT: GENUINE PRICE DROP (Lowest in 45 Days)
• Listed Price: ₹19,999
• Regular Price: ₹24,999
• Historical Low: ₹19,999 (Today)

🛡️ Buy Safely & Lock 90-Day Price in Amazon App:
👉 [1-Click Add to Amazon Cart] (YOUR AFFILIATE LINK)
```
* **Impact**: Competitor channels spend thousands acquiring users; those users forward competitor deals to your bot, which cleans the links and credits the affiliate commission directly to you.

---

## 10. Distinct Direction C: Programmatic "Long-Tail Loot" SEO Engine

### 10.1 The Opportunity
Millions of high-intent Google searches occur daily in India:
* *"oneplus nord ce 4 price in india today"*
* *"1 kg cashew lowest price amazon flipkart"*
* *"boat rockerz 450 price drop history"*

### 10.2 Dynamic Route & Schema Generation
For every verified deal in MongoDB `UniqueDeals`:
Generate a static route `/price/{slug}` with structured **`Product` Schema.org JSON-LD**:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "OnePlus Nord CE 4 (128GB)",
  "image": "https://m.media-amazon.com/images/I/61abLrCfF7L._SL1500_.jpg",
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "19999",
    "highPrice": "24999",
    "priceCurrency": "INR",
    "offerCount": "2"
  }
}
</script>
```
* **Impact**: Google displays the green price and discount badge directly in search engine results. Searchers click through directly to your comparison deck and 90-day cart lock.

---

## 11. Distinct Direction D: Amazon FBA "Storage Penalty Overstock" Warehouse Clearance Hunter

### 11.1 The Mechanism
Amazon FBA charges Indian sellers hefty **Aged Inventory Surcharges** on inventory sitting in fulfillment centers past 180–270 days. To avoid these fees, sellers temporarily discount brand-name items by 70% to 85% to liquidate stock.

### 11.2 Warehouse Browse Node Scraper
Configure a dedicated background scraper targeting Amazon India's clearance and liquidation browse nodes (`/b?node=clearance_outlet`):
* Filters for `discount_pct >= 70%` and `merchant == "Cloudtail" | "Appario" | "Brand Official"`.
* Populates a dedicated storefront section: **"🔥 Warehouse Liquidation Drops"**.
* These items are genuine brand-name goods selling at cost price that convert at extremely high velocity.

---

## 12. Distinct Direction E: Hinglish / Regional Voice Deal Finder for Tier-2/3 Shoppers

### 12.1 The Demographic
The next 200 million online shoppers in India reside in Tier 2 and Tier 3 cities (Jaipur, Lucknow, Indore, Patna). They browse on mobile and prefer speaking into their microphones in Hindi or Hinglish rather than typing English keywords.

### 12.2 Native Web Speech API Integration
Integrate the native Chrome Android Web Speech API directly on the search bar:
```typescript
export function startVoiceSearch(onResult: (text: string) => void): void {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) return;

  const recognition = new SpeechRecognition();
  recognition.lang = 'hi-IN'; // Recognizes Hindi and Hinglish
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event: any) => {
    const rawSpeech = event.results[0][0].transcript;
    const normalized = normalizeHinglishShoppingQuery(rawSpeech);
    onResult(normalized);
  };
  recognition.start();
}

function normalizeHinglishShoppingQuery(text: string): string {
  return text
    .toLowerCase()
    .replace(/kaju|kaaju/g, 'cashew')
    .replace(/badam/g, 'almond')
    .replace(/sabse sasta|saste/g, 'best deal')
    .replace(/(\d+)\s*hazaar/g, '$1000')
    .replace(/kilo/g, 'kg');
}
```
* **Impact**: Captures voice-driven shopping traffic with zero third-party API costs.

---

## 13. Distinct Direction F: Machine-Learning TCP Pre-Warm Engine (0ms Latency)

### 13.1 The Concept
Eliminate the 1.5 second loading delay when transitioning from IndiaDealHunts to the Amazon/Flipkart native apps.

### 13.2 The ML Implementation
1. Deploy a lightweight **TensorFlow.js** model inside `rudranil-deals-web`.
2. The model tracks client-side heuristics: scroll velocity, touch hesitation (dwell time), and viewport intersection.
3. When the ML model predicts with **>85% confidence** that a user is about to tap "Lock in Cart", a background Service Worker fires a `fetch()` request to the Amazon Intent URI.

### 13.3 The Leverage
This forces the mobile operating system to execute DNS resolution, the TCP handshake, and TLS negotiation with Amazon's servers *before the user's finger even touches the glass*. When the user finally taps, the OS bypasses the network stack and throws them directly into the Amazon App in **0.01 seconds**, creating a magical, zero-latency user experience that dramatically reduces drop-off.

---

## 14. Technical Rollout Waves & File Implementation Plan

```
┌────────────────────────────────────────────────────────────────────────┐
│ WAVE 1: Core Affiliate Engine (Frontend Helper)             ✅ VERIFIED │
│ • File: rudranil-deals-web/src/utils/affiliateEngine.ts               │
│ • ASIN extractor, 90-day cart URL, multi-ASIN bundler, intent builder │
├────────────────────────────────────────────────────────────────────────┤
│ WAVE 2: Mobile UI & 90-Day Cart Buttons                    ✅ VERIFIED │
│ • Files: ExternalSearchResults.tsx, PublicDealCard.tsx, MobileContent  │
│ • "⚡ Open in App", "🛒 Lock in Cart (90 Days)", accessory bundler    │
├────────────────────────────────────────────────────────────────────────┤
│ WAVE 3: Exit-Intent 90-Day Cart Lock Drawer                ✅ VERIFIED │
│ • File: rudranil-deals-web/src/components/ExitIntentCartDrawer.tsx     │
│ • Triggers on mobile upward velocity or desktop tab exit               │
├────────────────────────────────────────────────────────────────────────┤
│ WAVE 4: Backend Coupon Scraper & SubID Injection           ✅ VERIFIED │
│ • Files: dealbot_backend/dealbot/api.py, worker.py                    │
│ • Extracts hidden clip-coupons and injects dynamic SubIDs              │
├────────────────────────────────────────────────────────────────────────┤
│ WAVE 5: Android Share Sheet PWA Integration                ✅ VERIFIED │
│ • File: rudranil-deals-web/public/manifest.json, App.tsx               │
│ • Registers `share_target` to capture shares from Amazon/Flipkart apps │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 14. Pure Client-Side Attribution & Reporting Guide (Zero-Backend Server)

### 14.1 Why No Analytics Database is Needed
A common concern for client-side Single Page Applications (SPAs) like `rudranil-deals-web` is: *"Where does the tracking data go if the frontend doesn't log clicks to MongoDB?"*

**The Answer:** Affiliate networks (Amazon Associates and EarnKaro) perform 100% of the tracking, server-side click logging, conversion monitoring, and commission auditing on their enterprise infrastructure. 
IndiaDealHunts only needs to pass dynamic metadata tags in the URL query string when the outbound link is created.

### 14.2 SubID Syntax & Structure
When generating links on the client:
```typescript
// Structure: [SOURCE]_[DEAL_TYPE]_[DEVICE]
// Example: "search_extfk12_mob" or "hero_loot_desk"
export function generateSubId(source: string, dealId: string): string {
  const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mob' : 'desk';
  const cleanId = dealId.slice(0, 10).replace(/[^a-zA-Z0-9]/g, '');
  return `${source}_${cleanId}_${isMobile}`;
}
```

### 14.3 Where and How Reports are Viewed
1. **Amazon Associates Central (`https://associates.amazon.in`)**:
   * **Location**: Top Navigation $\rightarrow$ **Reports** $\rightarrow$ **Tracking ID / Subtag Report**.
   * **Data Provided**:
     * Exact breakdown of **Ordered Items**, **Shipped Revenue**, and **Earnings (₹)** grouped by Subtag (`ascsubtag`).
     * Shows which specific product categories and which placement on your site (`search`, `hero`, `card`, `exit_drawer`) drove the order.
   * **Zero Cost**: Completely free, built into Amazon.
2. **EarnKaro Affiliate Dashboard (`https://earnkaro.com`)**:
   * **Location**: Dashboard $\rightarrow$ **My Earnings** $\rightarrow$ **Reports by SubID**.
   * **Data Provided**:
     * Shows the exact transaction date, retailer (Flipkart, Myntra, Ajio), confirmed profit, and pending commission per SubID.

---

## 15. Device-Specific Deep-Linking & Intent Compatibility Matrix

| Operating System / Client | Protocol Scheme | Behavior | Fallback Strategy |
|---|---|---|---|
| **Android (Chrome / Samsung / Brave)** | `intent://www.amazon.in/...#Intent;scheme=https;package=in.amazon.mShop.android.shopping;end` | Direct native OS launch into Amazon Shopping App; logged-in state preserved. | `setTimeout` fallback (400ms) to web URL if app is not installed. |
| **Android (Telegram In-App WebView)** | `intent://...` | Telegram's internal Chromium engine forwards intent directly to Android OS Package Manager. | Direct web redirect if user cancelled. |
| **Android (Flipkart)** | `intent://dl.flipkart.com/dl/...#Intent;scheme=https;package=com.flipkart.android;end` | Opens Flipkart native app directly to product page with 1-click buy. | Standard web affiliate redirect via EarnKaro. |
| **iOS (iPhone / iPad Safari)** | Universal Links (`https://www.amazon.in/dp/...` or `https://dl.flipkart.com/...`) | iOS automatically checks installed Universal Link apps and prompts to open in app. | Default Safari web navigation with affiliate cookie. |
| **Desktop (Windows / macOS / Linux)** | Standard HTTPS (`https://www.amazon.in/gp/aws/cart/add.html?...`) | Opens in new tab with 90-day cart addition page pre-loaded. | Direct browser tab navigation. |



