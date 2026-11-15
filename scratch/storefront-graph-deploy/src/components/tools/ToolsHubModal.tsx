import { useModalSurface } from '../../utils/useModalSurface';
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';

// Tool Components
import { EMICalculatorTool } from './EMICalculatorTool';
import { BankOfferStackingOptimizer } from './BankOfferStackingOptimizer';
import { GSTInputTaxCreditCalculator } from './GSTInputTaxCreditCalculator';
import { UnitPricingCalculatorTool } from './UnitPricingCalculatorTool';
import { QuickCommerceDeliveryFeeOptimizer } from './QuickCommerceDeliveryFeeOptimizer';
import { ApplianceEnergyCostCalculatorTool } from './ApplianceEnergyCostCalculatorTool';
import { CustomsDutyImportCalculator } from './CustomsDutyImportCalculator';
import { SubscriptionBreakEvenCalculator } from './SubscriptionBreakEvenCalculator';
import { ReturnWindowWarrantySentinel } from './ReturnWindowWarrantySentinel';
import { MobileExchangeValueAuditor } from './MobileExchangeValueAuditor';
import { WarrantyExpiryTrackerTool } from './WarrantyExpiryTrackerTool';
import { SaleBudgetPlannerTool } from './SaleBudgetPlannerTool';

export type ToolId =
  | 'gst'
  | 'bank_offers'
  | 'emi'
  | 'qcommerce'
  | 'unit_price'
  | 'customs'
  | 'subs'
  | 'returns'
  | 'exchange'
  | 'energy'
  | 'warranty'
  | 'budget';

export type ToolCategory =
  | 'all'
  | 'banking_taxes'
  | 'smart_checkout'
  | 'tech_postpurchase'
  | 'planning';

interface ToolMeta {
  id: ToolId;
  title: string;
  shortName: string;
  tagline: string;
  icon: string;
  badge: string;
  category: ToolCategory;
  highlightTag?: string;
}

const TOOLS_CATALOG: ToolMeta[] = [
  {
    id: 'gst',
    title: 'GST Input Tax Credit (ITC) & Depreciation Shield',
    shortName: 'GST ITC Shield',
    tagline: 'Model business purchase costs using confirmed tax rates and eligibility',
    icon: '🧾',
    badge: 'TAX & B2B',
    category: 'banking_taxes',
    highlightTag: 'Planning scenario',
  },
  {
    id: 'bank_offers',
    title: 'Bank Offer Stacking & 10% vs 5% Cashback Optimizer',
    shortName: 'Bank Offer Stacking',
    tagline: 'Resolve 10% Instant Discount vs 5% Unlimited Cashback & SmartBuy Gyftr vouchers',
    icon: '💳',
    badge: 'CARDS & REWARDS',
    category: 'banking_taxes',
    highlightTag: 'Check current terms',
  },
  {
    id: 'emi',
    title: 'No-Cost EMI & Hidden Cost Analyzer',
    shortName: 'EMI Reality Check',
    tagline: 'Unmasks 18% GST on interest & bank processing fees hidden in "0% Interest" schemes',
    icon: '📊',
    badge: 'BANKING',
    category: 'banking_taxes',
  },
  {
    id: 'qcommerce',
    title: 'Quick Commerce Surge, Delivery & Cart Filler Optimizer',
    shortName: 'Quick Commerce Surge',
    tagline: 'Blinkit vs Zepto vs Instamart small-cart surcharge optimizer & magic cart filler finder',
    icon: '⚡',
    badge: '10-MIN GROCERY',
    category: 'smart_checkout',
    highlightTag: 'Cart scenario',
  },
  {
    id: 'unit_price',
    title: 'Grocery Unit Price & Shrinkflation Detective',
    shortName: 'Unit Price Detective',
    tagline: 'Compare multi-packs, grams, and liters across stores to expose fake discounts',
    icon: '⚖️',
    badge: 'FMCG MATH',
    category: 'smart_checkout',
  },
  {
    id: 'subs',
    title: 'Subscription Payback & Break-Even Sentinel',
    shortName: 'Subscription ROI',
    tagline: 'Amazon Prime vs Swiggy One vs Flipkart VIP break-even order frequency audit',
    icon: '🍿',
    badge: 'MEMBERSHIPS',
    category: 'smart_checkout',
  },
  {
    id: 'customs',
    title: 'Cross-Border Tech Import & Customs Duty Sentinel',
    shortName: 'Customs & Import Duty',
    tagline: 'Compute BCD, Social Welfare Surcharge, IGST, and courier fees on AliExpress/Drop tech',
    icon: '🛃',
    badge: 'CROSS-BORDER',
    category: 'tech_postpurchase',
    highlightTag: 'Confirm applicable rates',
  },
  {
    id: 'returns',
    title: 'E-Commerce Return Window & Open Box Delivery Sentinel',
    shortName: 'Return & OBD Sentinel',
    tagline: 'Return deadline countdown, 6-step pre-OTP unboxing protocol, and legal dispute drafter',
    icon: '🛡️',
    badge: 'CONSUMER LAW',
    category: 'tech_postpurchase',
    highlightTag: 'Pre-OTP Check',
  },
  {
    id: 'exchange',
    title: 'Phone Exchange vs. Cashify Valuation Sentinel',
    shortName: 'Mobile Trade-In',
    tagline: 'Model doorstep cosmetic deductions, screen scratches, and festive exchange bonuses',
    icon: '📱',
    badge: 'TRADE-IN',
    category: 'tech_postpurchase',
  },
  {
    id: 'energy',
    title: 'Appliance 5-Year Electricity & BEE Payback',
    shortName: '5-Year Power Cost',
    tagline: 'Determine if paying ₹7,000 more for a 5-Star AC recovers its cost in electricity bills',
    icon: '💡',
    badge: 'APPLIANCES',
    category: 'tech_postpurchase',
  },
  {
    id: 'warranty',
    title: 'Gadget & Appliance Warranty Vault',
    shortName: 'Warranty Tracker',
    tagline: 'Track purchase dates, invoice numbers & official Indian service support directories',
    icon: '🗄️',
    badge: 'POST-PURCHASE',
    category: 'tech_postpurchase',
  },
  {
    id: 'budget',
    title: 'Festival Sale Budget & Anti-FOMO Planner',
    shortName: 'Sale Budgeting',
    tagline: 'Allocate Diwali / BBD budget and evaluate impulse regret risk score before buying',
    icon: '🎯',
    badge: 'FINANCIAL HEALTH',
    category: 'planning',
  },
];

const CATEGORIES = [
  { id: 'all' as ToolCategory, name: 'All Engines (12)' },
  { id: 'banking_taxes' as ToolCategory, name: 'Taxes & Cards (3)' },
  { id: 'smart_checkout' as ToolCategory, name: 'Smart Checkout (3)' },
  { id: 'tech_postpurchase' as ToolCategory, name: 'Tech & Returns (5)' },
  { id: 'planning' as ToolCategory, name: 'Budgeting (1)' },
];

interface ToolsHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialToolId?: ToolId;
}

export const ToolsHubModal: React.FC<ToolsHubModalProps> = ({
  isOpen,
  onClose,
  initialToolId = 'gst',
}) => {
  const [activeToolId, setActiveToolId] = useState<ToolId>(initialToolId);
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (initialToolId) {
      setActiveToolId(initialToolId);
    }
  }, [initialToolId]);

  const modalSurface = useModalSurface(isOpen, onClose);

  const filteredTools = useMemo(() => {
    return TOOLS_CATALOG.filter((t) => {
      if (activeCategory !== 'all' && t.category !== activeCategory) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        t.shortName.toLowerCase().includes(q) ||
        t.badge.toLowerCase().includes(q)
      );
    });
  }, [activeCategory, searchQuery]);

  if (!isOpen) return null;

  const activeTool = TOOLS_CATALOG.find((t) => t.id === activeToolId) || TOOLS_CATALOG[0];

  return createPortal(
    <div ref={modalSurface}
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Utilities & Tools Hub"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 10 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-6xl max-h-[calc(100dvh-1.5rem)] flex flex-col bg-white dark:bg-[#0D1527] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1527]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-sm">
              🧰
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 dark:text-[#F1F5F9] tracking-tight">
                  Shopping Utilities &amp; Loot Lab
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  12 PLANNING TOOLS
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium line-clamp-1">
                Use entered values and example assumptions. These calculators do not supply live bank offers or merchant quotes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center relative w-48">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 12 tools..."
                className="w-full pl-7 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs bg-slate-50 dark:bg-[#070A11] focus:bg-white dark:bg-[#0D1527] focus:outline-none focus:border-slate-400"
              />
              <span className="absolute left-2.5 text-xs text-slate-400">🔍</span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-xs text-slate-400 hover:text-slate-600 dark:text-slate-400"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#111C33] hover:bg-slate-200 dark:bg-[#172440] text-slate-500 hover:text-slate-800 dark:text-[#F8FAFC] transition-colors flex items-center justify-center cursor-pointer text-sm font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Category Filter Chips Bar */}
        <div className="px-5 sm:px-6 py-2 bg-slate-100/70 dark:bg-[#111C33]/70 border-b border-slate-200/80 dark:border-white/10 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isCatActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isCatActive
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-[#F1F5F9] hover:bg-slate-200 dark:hover:bg-[#1E293B]/60 dark:bg-[#172440]/60'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Tool Navigation Pill Strip */}
        <div className="px-5 sm:px-6 py-2.5 bg-slate-50/90 dark:bg-[#070A11]/90 border-b border-slate-200/80 dark:border-white/10 overflow-x-auto flex items-center gap-2 scrollbar-none">
          {filteredTools.map((tool) => {
            const isActive = tool.id === activeToolId;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => setActiveToolId(tool.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-[#F1F5F9] hover:bg-slate-100 dark:bg-[#111C33]'
                }`}
              >
                <span className="text-sm">{tool.icon}</span>
                <span>{tool.shortName}</span>
                {tool.highlightTag && (
                  <span
                    className={`text-[9px] font-mono px-1 py-0.2 rounded font-extrabold ${
                      isActive
                        ? 'bg-emerald-400 text-slate-950'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {tool.highlightTag}
                  </span>
                )}
                {isActive && !tool.highlightTag && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Scrollable Tool Workspace */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/40 dark:bg-[#070A11]/40">
          <p role="note" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-800">Planning scenarios. Preset bank rates, fees, valuations, tax rules and service terms are examples, not current verified offers. Confirm applicable terms and enter your own values before relying on the result.</p>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeToolId}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              {activeToolId === 'gst' && <GSTInputTaxCreditCalculator />}
              {activeToolId === 'bank_offers' && <BankOfferStackingOptimizer />}
              {activeToolId === 'emi' && <EMICalculatorTool />}
              {activeToolId === 'qcommerce' && <QuickCommerceDeliveryFeeOptimizer />}
              {activeToolId === 'unit_price' && <UnitPricingCalculatorTool />}
              {activeToolId === 'subs' && <SubscriptionBreakEvenCalculator />}
              {activeToolId === 'customs' && <CustomsDutyImportCalculator />}
              {activeToolId === 'returns' && <ReturnWindowWarrantySentinel />}
              {activeToolId === 'exchange' && <MobileExchangeValueAuditor />}
              {activeToolId === 'energy' && <ApplianceEnergyCostCalculatorTool />}
              {activeToolId === 'warranty' && <WarrantyExpiryTrackerTool />}
              {activeToolId === 'budget' && <SaleBudgetPlannerTool />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Status Footer */}
        <div className="px-5 sm:px-6 py-3 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1527] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Active Engine:</span>
            <span className="font-bold text-slate-800 dark:text-[#F8FAFC]">{activeTool.title}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#111C33] text-slate-600 dark:text-slate-400">
              {activeTool.badge}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              100% Client-Side • Verified Indian Retail Formulas
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-100 dark:bg-[#111C33] hover:bg-slate-200 dark:bg-[#172440] text-slate-700 dark:text-slate-200 font-bold transition-colors cursor-pointer text-xs"
            >
              Done
            </button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};
