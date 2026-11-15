# IndiaDealHunts — Consumer Web Storefront

High-performance, mobile-first deal discovery portal built with **React 19**, **Vite**, and **Tailwind CSS v4**.

* **Production URL**: [indiadealhunts.vercel.app](https://indiadealhunts.vercel.app/)
* **Repository**: [dealsforindia/indiadealhunts](https://github.com/dealsforindia/indiadealhunts)
* **Backend Origin**: `https://api.rudranil.me`
* **Cloudflare Edge Gateway**: `https://dealflow-edge.pottemasshippo.workers.dev`

---

## 🌟 Key Features

### 1. Mobile-First 2-Column Experience
* **High Scanning Density**: Standard 2-column mobile layout (`grid-cols-2`, `gap-2.5`, `px-2.5`) matching native Indian e-commerce apps (Flipkart, Myntra, Amazon).
* **De-Cluttered Unified Feed**: Instant "Recent Verified Drops" feed directly beneath category stories, eliminating redundant promotional carousels.
* **Touch-Optimized Cards**: Square product image presentation (`aspect-square sm:aspect-[4/3]`), compact store badges, clean discount tags (`XX% OFF`), prominent green pricing, and 1-tap WhatsApp deal sharing.
* **Fluid 60fps Scrolling**: Zero desktop hover transforms on touchscreens; native tactile `active:scale-[0.98]` feedback.

### 2. On-Device Edge Semantic Search
* **Natural Query Parser (`src/utils/semanticSearch.ts`)**: Parses price constraints (`under 1000`, `between 500 and 1500`), discount thresholds (`70% off`), store names (`amazon`, `flipkart`), and loot flags (`loot`, `glitch`).
* **Synonym Expansion Engine**: Built-in 40+ synonym dictionary covering Indian tech and fashion terms (e.g. `earbuds` $\leftrightarrow$ `tws` $\leftrightarrow$ `airdopes`).
* **Zero Backend Overhead**: Sub-millisecond vector/constraint matching in the client browser with 0% server CPU impact.

### 3. Edge Acceleration & Fallback
* Directly interfaces with the **Cloudflare Edge Gateway Worker**, achieving sub-15ms cached API responses (`CF-Cache-Status: HIT`) with automatic transparent fallback to the origin FastAPI server.

### 4. Interactive Tools
* **Link Deal Lookup Modal**: Paste any Amazon, Flipkart, or Myntra link to verify historical pricing, discount veracity, and seller credibility.
* **Instant Price Drop Alerts**: Register interest or email alerts for items tracked across Indian e-commerce platforms.
* **Card Cashback Calculator**: Highlights personalized credit card discounts and net checkout prices.

### 5. Multi-Item Mega-Hauls & Local Quick-Commerce Support
* **Full-Width Interactive Card (`src/components/MegaHaulCard.tsx`)**: Dedicated presentation for clearance hauls and quick-commerce posts (Zepto, Instamart, Blinkit) containing 10–30 sub-items.
* **Live Location & Pincode Filter**: City/pincode selection pills with per-city deal counts and 6-digit live pincode search.
* **Independent Sub-Item Buy Decks**: Individual price tags, MRP strikethroughs, discount tags, and direct merchant checkout links for every product in the haul.

---

## 🛠️ Development & Build

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Type check
npm run check

# Build production bundle
npm run build
```

---

## 🚀 Deployment

Pushing to the `main` branch automatically triggers production deployment on **Vercel**.
