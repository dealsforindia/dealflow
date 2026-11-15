import { useModalSurface } from '../utils/useModalSurface';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { PublicDeal } from '../types';
import { getCleanImageUrl } from '../utils/imageUrl';
import { ToolId } from './tools/ToolsHubModal';
import { openGoogleShoppingModal } from '../utils/googleShopping';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  deals: PublicDeal[];
  onSelectDeal: (deal: PublicDeal) => void;
  onSearchSubmit: (query: string) => void;
  onOpenTool?: (toolId: ToolId) => void;
}

interface QuickToolItem {
  id: ToolId;
  name: string;
  icon: string;
  desc: string;
  badge: string;
  keywords: string[];
}

const QUICK_TOOLS: QuickToolItem[] = [
  {
    id: 'gst',
    name: 'GST Input Tax Credit & Depreciation Shield',
    icon: '🧾',
    desc: '18%/28% ITC + Sec 32 depreciation shield for businesses',
    badge: 'TAX',
    keywords: ['gst', 'itc', 'tax', 'invoice', 'depreciation', 'b2b', 'laptop gst'],
  },
  {
    id: 'bank_offers',
    name: 'Bank Offer Stacking Optimizer',
    icon: '💳',
    desc: '10% instant vs 5% cashback & SmartBuy Gyftr vouchers',
    badge: 'CARDS',
    keywords: ['bank', 'card', 'cashback', 'credit', 'hdfc', 'icici', 'gyftr', 'smartbuy', 'offer'],
  },
  {
    id: 'qcommerce',
    name: 'Quick Commerce Surge & Cart Filler Finder',
    icon: '⚡',
    desc: 'Blinkit, Zepto, Instamart surge fee bypass & ₹10-₹30 fillers',
    badge: 'GROCERY',
    keywords: ['blinkit', 'zepto', 'instamart', 'quick', 'grocery', 'surge', 'filler', 'delivery fee'],
  },
  {
    id: 'customs',
    name: 'Cross-Border Tech Import & Customs Duty',
    icon: '🛃',
    desc: 'BCD, SWS, IGST & courier clearance on imports (AliExpress, Drop)',
    badge: 'IMPORTS',
    keywords: ['customs', 'duty', 'import', 'aliexpress', 'drop', 'tax', 'international', 'hsn'],
  },
  {
    id: 'returns',
    name: 'Return Window & Open Box Delivery Sentinel',
    icon: '🛡️',
    desc: 'Pre-OTP inspection checklist & legal dispute notice generator',
    badge: 'RIGHTS',
    keywords: ['return', 'refund', 'open box', 'obd', 'replacement', 'dispute', 'otp', 'legal'],
  },
  {
    id: 'exchange',
    name: 'Phone Exchange vs. Cashify Valuation',
    icon: '📱',
    desc: 'Flipkart exchange vs Cashify cash & festive bonus comparison',
    badge: 'TRADE-IN',
    keywords: ['exchange', 'phone', 'mobile', 'cashify', 'trade in', 'trade-in', 'iphone exchange'],
  },
  {
    id: 'subs',
    name: 'Subscription Payback & Break-Even Sentinel',
    icon: '🍿',
    desc: 'Amazon Prime, Swiggy One, Flipkart VIP payback audit',
    badge: 'SUBS',
    keywords: ['prime', 'swiggy one', 'zomato gold', 'flipkart vip', 'subscription', 'break even'],
  },
  {
    id: 'emi',
    name: 'No-Cost EMI & Hidden Cost Analyzer',
    icon: '📊',
    desc: '18% GST on interest & processing fees reality check',
    badge: 'BANKING',
    keywords: ['emi', 'loan', 'interest', 'no cost', 'no-cost', 'hidden charge'],
  },
  {
    id: 'unit_price',
    name: 'Grocery Unit Price & Shrinkflation Detective',
    icon: '⚖️',
    desc: 'Compare price per 100g/liter across pack sizes',
    badge: 'FMCG',
    keywords: ['unit price', 'shrinkflation', 'pack', 'gram', 'liter', 'grocery rate'],
  },
  {
    id: 'energy',
    name: 'Appliance 5-Year Electricity & BEE Payback',
    icon: '💡',
    desc: '5-Star vs 3-Star AC electricity cost recovery analysis',
    badge: 'POWER',
    keywords: ['energy', 'power', 'star', 'ac', 'refrigerator', 'bee', 'electricity', 'units'],
  },
  {
    id: 'warranty',
    name: 'Gadget & Appliance Warranty Vault',
    icon: '🗄️',
    desc: 'Track invoices & official brand service helplines',
    badge: 'VAULT',
    keywords: ['warranty', 'guarantee', 'invoice', 'service center', 'repair'],
  },
  {
    id: 'budget',
    name: 'Festival Sale Budget & Anti-FOMO Planner',
    icon: '🎯',
    desc: 'Diwali / BBD budget envelope & impulse regret score',
    badge: 'BUDGET',
    keywords: ['budget', 'festival', 'diwali', 'bbd', 'fomo', 'planner', 'impulse'],
  },
];

const TRENDING_KEYWORDS = [
  'TWS Earbuds under 999',
  'iPhone 16',
  'Smart TV 55',
  'Air Fryer',
  'Gaming Laptops',
  'Puma Sneakers',
  'Power Bank 20000mAh',
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  deals,
  onSelectDeal,
  onSearchSubmit,
  onOpenTool,
}) => {
  const [query, setQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalSurface = useModalSurface(isOpen, onClose);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Match Tools
  const matchingTools = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return QUICK_TOOLS.filter((t) => {
      return (
        t.name.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q) ||
        t.badge.toLowerCase().includes(q) ||
        t.keywords.some((k) => k.includes(q))
      );
    }).slice(0, 3);
  }, [query]);

  const filteredResults = useMemo(() => {
    const q = query.toLowerCase().trim();
    return deals
      .filter((d) => {
        if (selectedStore !== 'all' && !d.store.toLowerCase().includes(selectedStore.toLowerCase())) {
          return false;
        }
        if (!q) return true;
        return (
          d.title.toLowerCase().includes(q) ||
          d.store.toLowerCase().includes(q) ||
          (d.category && d.category.toLowerCase().includes(q))
        );
      })
      .slice(0, 6);
  }, [deals, query, selectedStore]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target !== inputRef.current) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        if (matchingTools.length > 0 && selectedIndex === 0 && onOpenTool) {
          e.preventDefault();
          onOpenTool(matchingTools[0].id);
          onClose();
        } else if (filteredResults[selectedIndex]) {
          e.preventDefault();
          onSelectDeal(filteredResults[selectedIndex]);
          onClose();
        } else if (query.trim()) {
          e.preventDefault();
          onSearchSubmit(query.trim());
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredResults, matchingTools, query, onSelectDeal, onSearchSubmit, onOpenTool, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="phone-command-overlay fixed inset-0 z-[100] flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: -10 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        ref={modalSurface} role="dialog" aria-modal="true" aria-label="Search deals and shopping tools"
        className="phone-command-panel w-full max-w-2xl bg-white dark:bg-[#0D1527] rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-3rem)] overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-[#070A11]/60">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            aria-label="Search deals and tools"
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search deals, products, or utilities (e.g. iPhone, GST, Blinkit, EMI)..."
            className="min-w-0 flex-1 bg-transparent border-none text-slate-900 dark:text-[#F1F5F9] placeholder:text-slate-400 text-sm sm:text-base focus:outline-none font-medium"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded cursor-pointer"
            >
              Clear
            </button>
          )}
          <button type="button" className="phone-command-close" aria-label="Close search" onClick={onClose}>×</button>
          <span className="text-[10px] font-mono font-bold text-slate-400 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1527] px-1.5 py-0.5 rounded shadow-2xs hidden sm:inline-block">
            ESC
          </span>
        </div>

        {query.trim() && (
          <div className="flex flex-col sm:flex-row gap-1.5 p-2 bg-slate-50 dark:bg-[#070A11] border-b border-slate-100 dark:border-white/5">
            <button
              type="button"
              className="phone-search-all flex-1"
              onClick={() => {
                onSearchSubmit(query.trim());
                onClose();
              }}
            >
              <span>⚡ Search directory for “{query.trim()}”</span>
              <span aria-hidden="true">→</span>
            </button>
            <button
              type="button"
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition shrink-0"
              onClick={() => {
                openGoogleShoppingModal(query.trim());
                onClose();
              }}
            >
              <span>🛍️ Pan-India Radar</span>
              <span className="bg-white/20 text-[9.5px] px-1 py-0.2 rounded font-mono">IN-APP</span>
            </button>
          </div>
        )}
        {/* Quick Tools Match Section if query matches any utility */}
        {matchingTools.length > 0 && onOpenTool && (
          <div className="p-2 border-b border-slate-100 dark:border-white/5 bg-slate-50/70 dark:bg-[#070A11]/70">
            <div className="px-2 py-1 text-[10.5px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Shopping Utility Engines
            </div>
            <div className="space-y-1">
              {matchingTools.map((tool) => (
                <div
                  key={tool.id}
                  onClick={() => {
                    onOpenTool(tool.id);
                    onClose();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#0D1527] hover:bg-slate-100 dark:hover:bg-[#172440]/90 dark:bg-[#111C33]/90 border border-slate-200/80 dark:border-white/10 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xl shrink-0">{tool.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-[#F1F5F9] truncate">
                          {tool.name}
                        </span>
                        <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {tool.badge}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {tool.desc}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 shrink-0 ml-2">
                    Open Engine →
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Store Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-[#0D1527] overflow-x-auto text-xs">
          <span className="text-[10.5px] font-mono font-bold text-slate-400 uppercase mr-1">
            Store:
          </span>
          {['all', 'Amazon', 'Flipkart', 'Myntra'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSelectedStore(s)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                selectedStore === s
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 dark:bg-[#111C33] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-[#F1F5F9] hover:bg-slate-200 dark:bg-[#172440]'
              }`}
            >
              {s === 'all' ? 'All Stores' : s}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-slate-100">
          {filteredResults.length > 0 ? (
            filteredResults.map((deal, idx) => {
              const isHighlighted = idx === selectedIndex;
              const imgUrl = getCleanImageUrl(deal.image);
              return (
                <div
                  key={deal.id}
                  onClick={() => {
                    onSelectDeal(deal);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    isHighlighted ? 'bg-slate-100 dark:bg-[#111C33]' : 'hover:bg-slate-50 dark:bg-[#070A11]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                      {imgUrl ? (
                        <img src={imgUrl} alt={deal.title} className="w-full h-full object-contain p-1" />
                      ) : (
                        <span className="text-base">🛍️</span>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold uppercase text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                          {deal.store}
                        </span>
                        {deal.discount_pct && deal.discount_pct > 0 && (
                          <span className="text-[10px] font-mono font-extrabold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                            {deal.discount_pct}% OFF
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-[#F1F5F9] truncate mt-0.5">
                        {deal.title}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-sm font-extrabold text-slate-900 dark:text-[#F1F5F9]">
                      ₹{deal.price ? Number(deal.price).toLocaleString('en-IN') : 'Deal'}
                    </span>
                    <span className="text-xs text-blue-600 font-bold hidden sm:inline">
                      View →
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-10 text-center text-slate-500 text-xs">
              No matching deals found for "{query}".
            </div>
          )}
        </div>

        {/* Trending Searches & Utilities Footer */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-[#070A11] border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10.5px] font-mono font-bold text-slate-400 uppercase">
              Trending:
            </span>
            {TRENDING_KEYWORDS.map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => {
                  setQuery(kw);
                  onSearchSubmit(kw);
                  onClose();
                }}
                className="px-2 py-0.5 rounded-md bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:text-blue-600 hover:border-blue-300 font-medium cursor-pointer transition-colors text-[11px]"
              >
                {kw}
              </button>
            ))}
          </div>

          {onOpenTool && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  onOpenTool('gst');
                  onClose();
                }}
                className="text-[11px] font-bold text-indigo-700 hover:underline cursor-pointer"
              >
                🧰 All 12 Engines
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
};
