from pathlib import Path
root=Path(__file__).resolve().parents[2]/'rudranil-deals-web'
def replace(file, changes):
 p=root/file;s=p.read_text(encoding='utf-8')
 for before,after in changes: s=s.replace(before,after)
 p.write_text(s,encoding='utf-8')
replace('src/App.tsx',[
 ('<MarqueeTicker\n','{false && <MarqueeTicker\n'),
 ('onOpenVerify={() => setIsVerifyModalOpen(true)}\n      />','onOpenVerify={() => setIsVerifyModalOpen(true)}\n      />}'),
 ('<CategoryStories\n','{mobileCollectionsOpen && <CategoryStories\n'),
 ('                  />\n\n                  {/* ── 3. Category Rail','                  />}\n\n                  {/* ── 3. Category Rail'),
 ('Latest Drops <span aria-hidden="true">🔥</span>','Latest finds'),
 ('Latest directory offers · Check price evidence before buying','Store offers · Confirm price at checkout'),
 ('<span className="md:hidden">Latest Drops</span>','<span className="md:hidden">Latest finds</span>'),
])
replace('src/components/Navbar.tsx',[
 ('Profile & Themes','Account & appearance'),('Wall of happiness','Community stories'),
 ('Price lookup</button>','Price history</button>'),('Shopping tools hub','Shopping tools'),
 ('<span>Join Telegram</span>','<span>Telegram</span>')])
replace('src/components/MobileNav.tsx',[('Saved Loot Bookmarks','Saved deals'),('Profile & Theme Customization','Account & appearance')])
replace('src/components/TopDiscountsPage.tsx',[
 ('STEEPEST PRICE DROPS','DISCOUNTS FROM LISTED MRP'),('Top Discounts & Flash Loots','Top discounts'),
 ('🔥 80%+ OFF','80% or more'),('⚡ 70%+ OFF','70% or more'),('🏷️ 50%+ OFF','50% or more'),('⚡ 24/7 Live Feed','Listed offers'),
 ('placeholder="Filter discounts..."','aria-label="Search discounted offers" placeholder="Search discounted offers"'),
 ('<select\n            value={selectedStore}','<select\n            aria-label="Filter by store"\n            value={selectedStore}'),
 ('onClick={() => setDiscountThreshold(tier.value)}','onClick={() => setDiscountThreshold(tier.value)}\n              aria-pressed={discountThreshold === tier.value}')])
replace('src/components/WorthScorePage.tsx',[
 ('ALGORITHMIC VALUE LEADERBOARD','A DIFFERENT WAY TO BROWSE'),('Highest Worth Score Deals','Explore by value score'),
 ('💎 Score 90+ (God Tier)','Score 90+'),('🔥 Score 80+ (Great Value)','Score 80+'),('⚡ Score 70+ (Solid Buy)','Score 70+'),
 ('💎 Mathematical ROI Ranking','Heuristic ranking'),('placeholder="Search deals..."','aria-label="Search ranked offers" placeholder="Search offers"')])
replace('src/components/SavedLootPage.tsx',[
 ('Your Bookmarked Deals','Your saved finds'),('Your Saved Deals are Empty','A shortlist starts with a find.'),('⚡ Browse Latest Deals','Browse deals'),('placeholder="Search saved deals..."','aria-label="Search saved deals" placeholder="Search saved deals"')])
replace('src/components/ProfilePage.tsx',[
 ('{emailAlerts ? \'Email Live\' : \'Paused\'}',"{!userEmail ? 'Sign in to enable' : emailAlerts ? 'Enabled' : 'Paused'}"),
 ('Saved Loot','Saved deals'),('Track Any Store Product Link','Track a product price'),
 ('Arm Price Drop Scraper & Email Radar','Create email price alert'),('Your Tracked Scrapers','Your price alerts'),
 ('No active scrapers yet','No price alerts yet'),('How 24/7 Price Radar Works','How price alerts work')])
replace('src/components/DealDetailModal.tsx',[
 ("return 'Verified Store';","return 'Store';"),('Verified {storeName}','Merchant: {storeName}')])
replace('src/components/ProductPriceHistory.tsx',[('DealFlow Verified Price History','Recorded price observations')])
replace('src/components/GoogleShoppingDiscoveryModal.tsx',[
 ('Google Shopping &amp; Pan-India Radar','Search across stores'),('Google Shopping & Pan-India Radar','Search across stores'),('Merchant Checkout Verified','Confirm at merchant checkout'),('Close Radar','Close search')])
replace('src/components/AboutPage.tsx',[('monitors genuine price drops, flash clearances, and real coupon stacks','collects store offers, available price observations, and coupon information')])
replace('src/components/HowWeVerify.tsx',[('How Deals Are Verified','Understand the price evidence')])
replace('src/components/SubmitDeal.tsx',[('Submit a Deal or Loot Drop','Share a deal')])
replace('src/components/ContactPage.tsx',[('Contact & Curation Desk','Contact & support')])
replace('src/components/WallOfHappiness.tsx',[('Wall of Happiness','Community finds'),('Brag Your Deal Loot','Share your find')])
replace('src/components/DealToolbar.tsx',[
 ('⏰ Sort: Latest Drops','Sort: Latest added'),('🔥 Sort: Highest % Off','Sort: Discount from MRP'),('🏆 Sort: Top Value Score','Sort: Value score'),('🏷️ Sort: Price: Low to High','Sort: Price: Low to high'),('💎 Sort: Price: High to Low','Sort: Price: High to low')])
# Replace the hub shell without changing any calculator calculations or persistence.
p=root/'src/components/tools/ToolsHubModal.tsx';s=p.read_text(encoding='utf-8')
s=s.replace("import { motion, AnimatePresence } from 'motion/react';","import { motion, AnimatePresence } from 'motion/react';\nimport { X } from 'lucide-react';")
shorts={'GST ITC Shield':'GST input credit','Bank Offer Stacking':'Bank offers','EMI Reality Check':'EMI total cost','Quick Commerce Surge':'Delivery & cart costs','Unit Price Detective':'Compare unit prices','Subscription ROI':'Subscription costs','Customs & Import Duty':'Import costs','Return & OBD Sentinel':'Returns & delivery','Mobile Trade-In':'Phone exchange','5-Year Power Cost':'Appliance energy','Warranty Tracker':'Warranty tracker','Sale Budgeting':'Sale budget'}
for before,after in shorts.items():s=s.replace("shortName: '"+before+"'","shortName: '"+after+"'")
start=s.index('  return createPortal(')
s=s[:start]+'''  return createPortal(
    <div className="refined-tools-overlay" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      <motion.section ref={modalSurface} className="refined-tools" role="dialog" aria-modal="true" aria-labelledby="shopping-tools-title"
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .22, ease: [.2, .8, .2, 1] }}>
        <header className="refined-tools-head"><div><h2 id="shopping-tools-title">A little math before you buy.</h2><p>12 tools for the costs beyond the price tag.</p></div><button type="button" aria-label="Close shopping tools" onClick={onClose}><X size={20} /></button></header>
        <div className="refined-tools-body">
          <nav className="refined-tools-nav" aria-label="Shopping calculators">{TOOLS_CATALOG.map((tool, index) => <button type="button" key={tool.id} aria-current={tool.id === activeToolId ? 'true' : undefined} onClick={() => setActiveToolId(tool.id)}><span>{String(index + 1).padStart(2, '0')}</span>{tool.shortName}</button>)}</nav>
          <label className="refined-tool-select">Choose a tool<select value={activeToolId} onChange={event => setActiveToolId(event.target.value as ToolId)}>{TOOLS_CATALOG.map(tool => <option key={tool.id} value={tool.id}>{tool.shortName}</option>)}</select></label>
          <div className="refined-tools-content">
            <p className="refined-tools-assumptions">Planning estimates using your inputs. Presets are examples, not live offers. Confirm fees, rates and eligibility before relying on a result.</p>
            <AnimatePresence mode="wait"><motion.div key={activeToolId} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .12 }}>
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
            </motion.div></AnimatePresence>
          </div>
        </div>
      </motion.section>
    </div>, document.body
  );
};
'''
p.write_text(s,encoding='utf-8')
print('Updated storefront components and tools workspace.')
