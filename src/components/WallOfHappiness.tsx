import React, { useState } from 'react';
import { Heart, CheckCircle2, ShieldCheck, MessageCircle, Send, Smartphone, Apple, Home, Shirt, Sparkles } from 'lucide-react';

interface ProofItem {
  id: string;
  author: string;
  city: string;
  product: string;
  store: string;
  lootedPrice: number;
  regularPrice: number;
  savings: number;
  imageUrl: string;
  comment: string;
  category: 'electronics' | 'grocery' | 'fashion' | 'home';
  date: string;
}

const proofs: ProofItem[] = [
  {
    id: '1',
    author: 'Aakash M.',
    city: 'Bengaluru',
    product: 'Larah by Borosil Stainless Steel Bottle (700ml)',
    store: 'Amazon India',
    lootedPrice: 271,
    regularPrice: 1499,
    savings: 1228,
    imageUrl: 'https://m.media-amazon.com/images/I/417Vj5lRL+L._SY300_SX300_QL70_ML2_.jpg',
    comment: 'Saw the alert at 9 PM on Telegram, ordered immediately. Delivered today! Brand new in box, vacuum insulation works great. Unbelievable deal.',
    category: 'home',
    date: '14 Sept 2026',
  },
  {
    id: '2',
    author: 'Pooja S.',
    city: 'Pune',
    product: 'Swiggy Instamart Snacks & Cold Drink Haul',
    store: 'Swiggy Instamart',
    lootedPrice: 34,
    regularPrice: 280,
    savings: 246,
    imageUrl: 'https://rukminim2.flixcart.com/image/300/300/xif0q/minutes_enrichment_original/-enriched-original-SCBG9UNZMAGMGFE5_0.jpg',
    comment: 'Used the "Noice" and "Farmley" keyword loot trick from the Offers tab. Cart crashed to ₹34! Delivered in 11 minutes.',
    category: 'grocery',
    date: '14 Sept 2026',
  },
  {
    id: '3',
    author: 'Rohan V.',
    city: 'Delhi NCR',
    product: 'boAt Wave Sigma 3 Curv Smartwatch',
    store: 'Amazon India',
    lootedPrice: 899,
    regularPrice: 3999,
    savings: 3100,
    imageUrl: 'https://m.media-amazon.com/images/I/61G4w2yq6ZL._SL1500_.jpg',
    comment: 'Legit steal. Got the coupon math alert from IndiaDealHunts and checked out before it sold out. Working smoothly with Bluetooth calling.',
    category: 'electronics',
    date: '13 Sept 2026',
  },
  {
    id: '4',
    author: 'Sneha K.',
    city: 'Mumbai',
    product: 'Everyuth Naturals Walnut Scrub Set of 2',
    store: 'Flipkart',
    lootedPrice: 210,
    regularPrice: 420,
    savings: 210,
    imageUrl: 'https://rukminim2.flixcart.com/image/300/300/xif0q/minutes_enrichment_original/-enriched-original-SCBG9UNZMAGMGFE5_0.jpg',
    comment: 'Always used Everyuth scrub. Getting 2 packs for ₹210 is basically buy 1 get 1 free. Stocked up for 6 months.',
    category: 'grocery',
    date: '13 Sept 2026',
  },
  {
    id: '5',
    author: 'Vikram D.',
    city: 'Hyderabad',
    product: 'Liberty Meta-1 Men Casual Sandals',
    store: 'Flipkart',
    lootedPrice: 229,
    regularPrice: 999,
    savings: 770,
    imageUrl: 'https://rukminim2.flixcart.com/image/300/300/xif0q/sandal/s/i/0/6-meta-1-6-liberty-black-original-imahhtm5ywfev3ye.jpeg',
    comment: 'Flat 75% off on genuine Liberty footwear. Extremely comfortable for daily wear. Thanks for the lightning-fast alert!',
    category: 'fashion',
    date: '12 Sept 2026',
  },
  {
    id: '6',
    author: 'Divya R.',
    city: 'Jaipur',
    product: 'Larah by Borosil Opalware Dinner Set (27 Pcs)',
    store: 'Amazon India',
    lootedPrice: 999,
    regularPrice: 2995,
    savings: 1996,
    imageUrl: 'https://m.media-amazon.com/images/I/71Y+z8o8xQL._SL1500_.jpg',
    comment: 'Ordered for Diwali gifting. Heavy packaging, zero breakage. Sells at ₹1,800+ everywhere else. True loot.',
    category: 'home',
    date: '12 Sept 2026',
  },
];

const WHATSAPP_CHANNEL_URL = 'https://whatsapp.com/channel/0029VaHCuZs2v1IkBRgH9w3z';
const TELEGRAM_CHANNEL_URL = 'https://t.me/dealsforindiachannel';

export const WallOfHappiness: React.FC = () => {
  const [selectedCat, setSelectedCat] = useState<'all' | 'electronics' | 'grocery' | 'fashion' | 'home'>('all');

  const filteredProofs = selectedCat === 'all' ? proofs : proofs.filter((p) => p.category === selectedCat);

  const categories = [
    { key: 'all', label: 'All Unboxings', icon: Sparkles },
    { key: 'electronics', label: 'Tech & Audio', icon: Smartphone },
    { key: 'grocery', label: 'Quick Grocery', icon: Apple },
    { key: 'home', label: 'Home & Living', icon: Home },
    { key: 'fashion', label: 'Fashion', icon: Shirt },
  ];

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-xs font-bold text-rose-400 mb-3">
          <Heart className="w-3.5 h-3.5 fill-rose-400 shrink-0" aria-hidden="true" />
          <span>Community Wall of Happiness</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold font-brand text-white tracking-tight mb-3">
          Real Deliveries, Real Savings
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Photos and unboxing stories shared by our WhatsApp & Telegram subscribers who caught our verified flash price drops.
        </p>

        {/* Live Community Savings Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 max-w-2xl mx-auto">
          <div className="p-4 rounded-2xl border border-white/10 bg-[#111827]">
            <div className="text-xl sm:text-2xl font-price font-bold text-emerald-400">₹5,40,000+</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Saved by Members</div>
          </div>
          <div className="p-4 rounded-2xl border border-white/10 bg-[#111827]">
            <div className="text-xl sm:text-2xl font-price font-bold text-white">9,300+</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Deals Verified</div>
          </div>
          <div className="p-4 rounded-2xl border border-white/10 bg-[#111827] col-span-2 sm:col-span-1">
            <div className="text-xl sm:text-2xl font-price font-bold text-amber-400">100%</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Authentic Shelf Drops</div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills with Lucide Vector Icons */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap mb-8" role="group" aria-label="Filter unboxing proofs">
        {categories.map((c) => {
          const Icon = c.icon;
          const isSelected = selectedCat === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setSelectedCat(c.key as any)}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 focus-ring ${
                isSelected
                  ? 'bg-emerald-500 text-black font-extrabold shadow-lg shadow-emerald-500/20 active:scale-95'
                  : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
              aria-pressed={isSelected}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* Proof Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProofs.map((p) => (
          <article
            key={p.id}
            className="rounded-3xl border border-white/10 bg-[#111827] p-5 hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/5 card-elevation flex flex-col justify-between"
            aria-label={`Unboxing proof by ${p.author} for ${p.product}`}
          >
            <div>
              {/* Card Header: Author, City & Verified Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-black font-bold text-xs flex items-center justify-center shadow-sm">
                    {p.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-xs sm:text-sm flex items-center gap-1">
                      <span>{p.author}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                    </div>
                    <div className="text-[11px] text-slate-400">{p.city} • {p.date}</div>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-md bg-white/5 text-slate-300 text-[11px] font-semibold border border-white/10">
                  {p.store}
                </span>
              </div>

              {/* Product Photo Stage with Aspect Ratio Lock */}
              <div className="relative aspect-[16/10] bg-white rounded-2xl p-3 flex items-center justify-center overflow-hidden mb-3.5 shadow-inner">
                <img
                  src={p.imageUrl}
                  alt={p.product}
                  className="max-h-full max-w-full object-contain filter drop-shadow"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://m.media-amazon.com/images/I/417Vj5lRL+L._SY300_SX300_QL70_ML2_.jpg';
                  }}
                />
                <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-bold shadow-md">
                  Saved ₹{p.savings.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Product Title */}
              <h3 className="font-semibold text-white text-sm line-clamp-1 mb-1.5">
                {p.product}
              </h3>

              {/* Price Row */}
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-base font-price font-bold text-emerald-400">
                  Looted at ₹{p.lootedPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-500 line-through font-mono">
                  MRP ₹{p.regularPrice.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Shopper Feedback Quote */}
              <blockquote className="text-xs text-slate-300 italic leading-relaxed bg-white/[0.03] p-3 rounded-xl border border-white/5">
                "{p.comment}"
              </blockquote>
            </div>

            {/* Bottom Status */}
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Verified Delivered</span>
              </span>
              <span>Telegram Alert Proof</span>
            </div>
          </article>
        ))}
      </div>

      {/* Share Your Loot CTA */}
      <div className="mt-12 rounded-3xl border border-white/10 bg-gradient-to-b from-[#111827] to-[#0B0F19] p-6 sm:p-10 text-center max-w-3xl mx-auto shadow-2xl">
        <h2 className="text-xl sm:text-2xl font-bold font-brand text-white tracking-tight mb-2">
          Caught a Loot Drop? Share Your Delivery!
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto mb-6 leading-relaxed">
          Send your unboxing picture or order screenshot to our Telegram admin to get featured on the Wall of Happiness.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <a
            href={TELEGRAM_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs sm:text-sm tracking-tight flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg shadow-sky-500/20 focus-ring"
            aria-label="Submit loot proof on Telegram"
          >
            <Send className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Submit Loot Proof on Telegram</span>
          </a>
          <a
            href={WHATSAPP_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs sm:text-sm tracking-tight flex items-center gap-2 transition-all active:scale-95 cursor-pointer focus-ring"
            aria-label="Join WhatsApp Community"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
            <span>Join WhatsApp Community</span>
          </a>
        </div>
      </div>
    </div>
  );
};
