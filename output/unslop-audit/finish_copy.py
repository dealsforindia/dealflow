from pathlib import Path
r=Path(__file__).resolve().parents[2]/'rudranil-deals-web/src'
titles={
'GSTInputTaxCreditCalculator.tsx':('GST Business Invoice & Input Tax Credit (ITC) Engine','GST input credit estimate'),
'BankOfferStackingOptimizer.tsx':('Bank Offer & Credit Card Stacking Optimizer','Compare bank offers'),
'EMICalculatorTool.tsx':('India No-Cost EMI & Hidden Cost Analyzer','What will this EMI cost?'),
'QuickCommerceDeliveryFeeOptimizer.tsx':('Quick Commerce Surcharge & Cart Filler Optimizer','Delivery and cart costs'),
'UnitPricingCalculatorTool.tsx':('Grocery Unit Price & Shrinkflation Analyzer','Compare the price per unit'),
'SubscriptionBreakEvenCalculator.tsx':('Subscription ROI & Break-Even Math Sentinel','Is the subscription worth it?'),
'CustomsDutyImportCalculator.tsx':('Cross-Border Tech Import & Customs Duty Sentinel','Estimate import costs'),
'ReturnWindowWarrantySentinel.tsx':('E-Commerce Return Window & Open Box Delivery Sentinel','Returns and delivery checklist'),
'MobileExchangeValueAuditor.tsx':('Phone Exchange vs. Cashify Valuation Sentinel','Compare phone exchange offers'),
'ApplianceEnergyCostCalculatorTool.tsx':('Appliance 5-Year Electricity & BEE Star Payback','Compare appliance energy costs'),
'WarrantyExpiryTrackerTool.tsx':('Gadget & Appliance Warranty Vault','Your warranty records'),
'SaleBudgetPlannerTool.tsx':('Festival Sale Budget & Regret-Proof Planner','Plan your sale budget')}
for f,(a,b) in titles.items():
 p=r/'components/tools'/f;s=p.read_text(encoding='utf-8');s=s.replace(a,b).replace(a.replace('&','&amp;'),b);p.write_text(s,encoding='utf-8')
p=r/'components/Footer.tsx';s=p.read_text(encoding='utf-8')
for a,b in [('Profile & Custom Themes','Account & appearance'),('💖 Wall of Happiness','Community finds'),('🔍 Price History Analyzer','Price history'),('✍️ Submit a Deal','Share a deal'),('🛡️ How We Verify Deals','Understand price evidence'),('📖 About IndiaDealHunts','About IndiaDealHunts')]:s=s.replace(a,b)
p.write_text(s,encoding='utf-8')
