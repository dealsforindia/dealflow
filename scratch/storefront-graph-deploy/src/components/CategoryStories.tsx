import { PUBLIC_API_BASE, PUBLIC_EDGE_BASE, publicStoreUrl, lookupTargetUrl, isDisplayableOffer } from '../utils/publicLinks';
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { TrendingDown, Tag, Headphones, Shirt, ShoppingBasket, House } from 'lucide-react';
import { getCleanImageUrl } from '../utils/imageUrl';
import type { CategoryStoryCollection, StoriesResponse, PublicDeal } from '../types';
import { StoryModal } from './StoryModal';

interface CategoryStoriesProps {
  onSelectCategoryFilter?: (catFilter: string) => void;
  deals?: PublicDeal[];
}

const EDGE_API = PUBLIC_EDGE_BASE;
const API_BASE = PUBLIC_API_BASE;

// High-confidence fallback curated stories in case backend or worker is cold
const FALLBACK_STORIES: CategoryStoryCollection[] = [
  {
    id: 'loot70',
    title: '70%+ Steals',
    emoji: '⚡',
    ring_color: 'from-amber-400 via-rose-500 to-purple-600',
    badge: 'HOTTEST',
    category_filter: 'loot70',
    items: [
      {
        id: 'real-loot-1',
        title: 'Zepto Mega Grocery & Grooming Haul (Multiple Pincodes)',
        price: 19,
        mrp: 2999,
        discount_pct: 95,
        store: 'Zepto',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
        url: '/out/zepto_beardo_teeth_whitening_haul_2166146',
      },
      {
        id: 'real-loot-2',
        title: 'POPWINGS Women’s Dresses & Tops @ Up to 87% OFF',
        price: 149,
        mrp: 1299,
        discount_pct: 89,
        store: 'Amazon',
        image: '/deal-images/card_865d888c914c_1789622993.jpg',
        url: '/out/865d888c914c',
      },
      {
        id: 'real-loot-3',
        title: 'Kamiliant Hard Body Set of 3 Luggage Trolleys',
        price: 3899,
        mrp: 29630,
        discount_pct: 87,
        store: 'Flipkart',
        image: '/deal-images/desc0_4fa9ee834664_1788697536.jpeg',
        url: '/out/4fa9ee834664',
      },
      {
        id: 'real-loot-4',
        title: 'boAt Airdopes 141 (42 Hours Playtime, ENx Tech)',
        price: 899,
        mrp: 4490,
        discount_pct: 80,
        store: 'Amazon',
        image: '/deal-images/desc0_c9685166a282_1788690750.jpg',
        url: '/out/c9685166a282',
      },
    ],
  },
  {
    id: 'quick_drop',
    title: '10-Min Drops',
    emoji: '🍏',
    ring_color: 'from-emerald-400 via-teal-500 to-cyan-600',
    badge: 'ZEPTO / SWIGGY',
    category_filter: 'Grocery',
    items: [
      {
        id: 'real-quick-1',
        title: 'Swiggy Dineout - Dutch Truffle Pastry @19',
        price: 19,
        mrp: 120,
        discount_pct: 84,
        store: 'Swiggy Instamart',
        image: '/deal-images/desc0_ff2803edbd9c_1788329929.png',
        url: '/out/ff2803edbd9c',
      },
      {
        id: 'real-quick-2',
        title: 'Fortune Sunlite Refined Sunflower Oil 1L Pouch',
        price: 119,
        mrp: 175,
        discount_pct: 32,
        store: 'Zepto',
        image: '/deal-images/desc0_c2432f2c0f0d_1790665027.jpg',
        url: '/out/c2432f2c0f0d',
      },
    ],
  },
  {
    id: 'tech',
    title: 'Audio & Tech',
    emoji: '🎧',
    ring_color: 'from-sky-400 via-blue-500 to-indigo-600',
    badge: 'TECH',
    category_filter: 'Electronics',
    items: [
      {
        id: 'real-tech-1',
        title: 'boAt Airdopes 141 ANC with 42H Playback & Beast Mode',
        price: 999,
        mrp: 4490,
        discount_pct: 78,
        store: 'Amazon',
        image: '/deal-images/desc0_c9685166a282_1788690750.jpg',
        url: '/out/c9685166a282',
      },
      {
        id: 'real-tech-2',
        title: 'Samsung SSD 9100 Pro 8TB High Speed NVMe',
        price: 102329,
        mrp: 159999,
        discount_pct: 36,
        store: 'Amazon',
        image: 'https://m.media-amazon.com/images/I/71hXyRf4P-L._AC_UF1000,1000_QL80_.jpg',
        url: '/out/0ce0f7dc2f763feef6a3e3146b9a5e94',
      },
    ],
  },
  {
    id: 'under199',
    title: 'Under ₹199',
    emoji: '🏷️',
    ring_color: 'from-yellow-400 via-orange-500 to-red-600',
    badge: 'BUDGET',
    category_filter: 'all',
    items: [
      {
        id: 'real-under199-1',
        title: 'Myntra | HRX Shocks Pack of 3',
        price: 199,
        mrp: 499,
        discount_pct: 60,
        store: 'Myntra',
        image: '/deal-images/-1001389782464_125885.jpg',
        url: '/out/c1322b66e3d20dd9',
      },
      {
        id: 'real-under199-2',
        title: 'Heart Shape PVC Placemat for Center Table',
        price: 85,
        mrp: 799,
        discount_pct: 89,
        store: 'Amazon',
        image: 'https://m.media-amazon.com/images/I/711QIRPG2eL._AC_UF894,1000_QL80_.jpg',
        url: '/out/3f9ad042bede9ee7b8de79d3996d8a19',
      },
    ],
  },
  {
    id: 'fashion',
    title: 'Wardrobe Hauls',
    emoji: '👗',
    ring_color: 'from-pink-400 via-fuchsia-500 to-rose-600',
    badge: 'STYLE',
    category_filter: 'Fashion',
    items: [
      {
        id: 'real-fashion-1',
        title: 'Maroon Floral Printed Kurti for Women',
        price: 161,
        mrp: 699,
        discount_pct: 77,
        store: 'Flipkart',
        image: '/deal-images/-1002365543574_38012.jpg',
        url: '/out/1fbe4741784878e4',
      },
    ],
  },
  {
    id: 'home',
    title: 'Home & Kitchen',
    emoji: '🏠',
    ring_color: 'from-purple-400 via-violet-500 to-indigo-700',
    badge: 'ESSENTIALS',
    category_filter: 'Home',
    items: [
      {
        id: 'real-home-1',
        title: 'Bergner Cookware Set 4 Pcs Non-Stick',
        price: 2494,
        mrp: 2700,
        discount_pct: 8,
        store: 'Amazon',
        image: '/deal-images/upload_78df6f1a98cd910e_1788671318.jpg',
        url: '/out/78df6f1a98cd910e33c13134ae215ea7',
      },
    ],
  },
];

export const CategoryStories: React.FC<CategoryStoriesProps> = ({ onSelectCategoryFilter, deals }) => {
  // Keep the rail honest: render only stories returned by the API or built from
  // the current live deal feed. The old hardcoded fallback made the storefront
  // look populated when the feed was unavailable.
  const [collections, setCollections] = useState<CategoryStoryCollection[]>([]);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [viewedStoryIds, setViewedStoryIds] = useState<Set<string>>(new Set());
  const railRef = useRef<HTMLDivElement>(null);

  // Automatically construct live stories from active deals if available
  useEffect(() => {
    if (!deals || deals.length === 0) {
      return;
    }

    const availableDeals = deals.filter(d => !d.is_expired && !d.is_over && isDisplayableOffer(d));
    const liveSteals = availableDeals.filter((d) => d.discount_pct && d.discount_pct >= 70 && d.image && d.price > 0 && !d.is_expired && !d.is_over).slice(0, 6);
    const liveBudget = availableDeals.filter((d) => d.price > 0 && d.price <= 499 && d.image).slice(0, 6);
    const liveTech = availableDeals.filter((d) => {
      const c = (d.category || '').toLowerCase();
      const t = (d.title || '').toLowerCase();
      return (c.includes('mobile') || c.includes('electron') || c.includes('laptop') || /\b(phone|tws|earbuds|laptop|watch)\b/i.test(t)) && d.image;
    }).slice(0, 6);
    const liveFashion = availableDeals.filter((d) => {
      const c = (d.category || '').toLowerCase();
      const t = (d.title || '').toLowerCase();
      return (c.includes('fashion') || /\b(shoes|sneakers|shirt|kurti|dress|saree)\b/i.test(t)) && d.image;
    }).slice(0, 6);
    const liveGrocery = availableDeals.filter((d) => {
      const s = (d.store || '').toLowerCase();
      return (s.includes('blinkit') || s.includes('swiggy') || s.includes('zepto')) && d.image;
    }).slice(0, 6);

    const dynamicStories: CategoryStoryCollection[] = [];
    if (liveSteals.length > 0) {
      dynamicStories.push({
        id: 'loot70',
        title: '70%+ Steals',
        emoji: '⚡',
        ring_color: 'from-amber-400 via-rose-500 to-purple-600',
        badge: 'HOTTEST',
        category_filter: 'loot70',
        items: liveSteals,
      });
    }
    if (liveBudget.length > 0) {
      dynamicStories.push({
        id: 'under199',
        title: 'Under ₹499 Loot',
        emoji: '🏷️',
        ring_color: 'from-teal-400 via-emerald-500 to-green-600',
        badge: 'BUDGET',
        category_filter: 'all',
        items: liveBudget,
      });
    }
    if (liveTech.length > 0) {
      dynamicStories.push({
        id: 'tech',
        title: 'Audio & Tech',
        emoji: '🎧',
        ring_color: 'from-sky-400 via-blue-500 to-indigo-600',
        badge: 'TECH',
        category_filter: 'Electronics',
        items: liveTech,
      });
    }
    if (liveFashion.length > 0) {
      dynamicStories.push({
        id: 'fashion',
        title: 'Wardrobe Hauls',
        emoji: '👗',
        ring_color: 'from-pink-400 via-fuchsia-500 to-rose-600',
        badge: 'STYLE',
        category_filter: 'Fashion',
        items: liveFashion,
      });
    }
    if (liveGrocery.length > 0) {
      dynamicStories.push({
        id: 'quick_drop',
        title: '10-Min Drops',
        emoji: '🍏',
        ring_color: 'from-emerald-400 via-teal-500 to-cyan-600',
        badge: 'GROCERY',
        category_filter: 'Grocery',
        items: liveGrocery,
      });
    }

    if (dynamicStories.length > 0) {
      setCollections(dynamicStories);
    }
  }, [deals]);

  // Fetch real-time live curated stories from backend
  useEffect(() => {
    let isMounted = true;
    const loadStories = async () => {
      try {
        let res: Response | null = null;
        try {
          res = await fetch(`${API_BASE}/api/v1/deals/stories`);
        } catch {
          res = null;
        }
        if (!res || !res.ok) {
          try {
            res = await fetch(`${EDGE_API}/deals/stories`);
          } catch {
            res = null;
          }
        }
        if (res && res.ok) {
          const data: StoriesResponse = await res.json();
          if (isMounted && data.stories && data.stories.length > 0) {
            // Filter collections that actually have deals
            const validStories = data.stories.map(s => ({ ...s, badge: s.badge === 'ALL-TIME LOW' ? 'TECH' : s.badge === 'CLEARANCE' ? 'STYLE' : s.badge, items: (s.items || []).map(item => ({ ...item, url: publicStoreUrl(item.url) })).filter(item => isDisplayableOffer(item) && !item.is_expired && !item.is_over) })).filter(s => s.items.length > 0);
            if (validStories.length > 0) {
              setCollections(validStories);
            }
          }
        }
      } catch (err) {
        console.warn('Stories endpoint background notice, using dynamic deals:', err);
      }
    };

    loadStories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Check for ?story=id deep link in URL
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const storyParam = params.get('story');
      if (storyParam && collections.length > 0) {
        const foundIdx = collections.findIndex(
          (c) =>
            c.id.toLowerCase() === storyParam.toLowerCase() ||
            c.category_filter.toLowerCase() === storyParam.toLowerCase()
        );
        if (foundIdx !== -1) {
          setSelectedStoryIndex(foundIdx);
          setViewedStoryIds((prev) => new Set(prev).add(collections[foundIdx].id));
        }
      }
    } catch {
      // ignore URL parsing issues in non-browser envs
    }
  }, [collections]);

  const handleStoryClick = (index: number) => {
    const story = collections[index];
    if (story) {
      setViewedStoryIds((prev) => new Set(prev).add(story.id));
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('story', story.id);
        window.history.replaceState({}, '', url.toString());
      } catch {
        // ignore
      }
    }
    setSelectedStoryIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedStoryIndex(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('story');
      window.history.replaceState({}, '', url.toString());
    } catch {
      // ignore
    }
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (!railRef.current) return;
    const offset = direction === 'left' ? -280 : 280;
    railRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  if (!collections.length) return null;

  return (
    <>
      <section data-mobile-stories
        className="flash-stories w-full py-4 bg-white dark:bg-[#0D1527] border-b border-slate-200/80 dark:border-white/10"
        aria-label="Flash Deal Stories"
      >
        <div className="max-w-[1340px] mx-auto px-4 md:px-6">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-[#F8FAFC] font-mono">
                Collections worth exploring
              </h3>
              <span className="hidden sm:inline-block text-[11px] text-slate-400">
                A quick look at current finds
              </span>
            </div>

            {/* Desktop Scroll Chevrons */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleScroll('left')}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-[#111C33] hover:bg-slate-200 dark:bg-[#172440] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-[#F1F5F9] transition-all text-xs cursor-pointer"
                title="Scroll Left"
                aria-label="Scroll Left"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => handleScroll('right')}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-[#111C33] hover:bg-slate-200 dark:bg-[#172440] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-[#F1F5F9] transition-all text-xs cursor-pointer"
                title="Scroll Right"
                aria-label="Scroll Right"
              >
                ›
              </button>
            </div>
          </div>

          {/* Stories Rail */}
          <div
            ref={railRef}
            className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-1 scroll-smooth"
            style={{
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {collections.map((story, index) => {
              const isViewed = viewedStoryIds.has(story.id);
              const storyKind = `${story.id} ${story.category_filter}`.toLowerCase();
              const StoryIcon = /hot|loot|steal|discount/.test(storyKind) ? TrendingDown : /budget|under/.test(storyKind) ? Tag : /tech|elect|audio/.test(storyKind) ? Headphones : /fashion|wardrobe/.test(storyKind) ? Shirt : /grocery|swiggy|zepto/.test(storyKind) ? ShoppingBasket : House;

              return (
                <button
                  key={story.id}
                  type="button"
                  onClick={() => handleStoryClick(index)}
                  className="premium-story-tile group"
                  style={{ scrollSnapAlign: 'start' }}
                  aria-label={`Open story: ${story.title}`}
                >
                  <div className={`premium-story-image ${isViewed ? 'is-viewed' : ''}`}>
                    <StoryIcon size={25} strokeWidth={1.5} aria-hidden="true" />

                    <span className="premium-story-count">{story.items.length}</span>
                  </div>
                  <span className="premium-story-title">{story.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Interactive Story Viewer Modal ── */}
      <StoryModal
        isOpen={selectedStoryIndex !== null}
        onClose={handleCloseModal}
        collections={collections}
        initialCollectionIndex={selectedStoryIndex ?? 0}
        onSelectCategoryFilter={onSelectCategoryFilter}
      />
    </>
  );
};

