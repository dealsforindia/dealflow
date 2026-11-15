import React, { useState, useMemo } from 'react';

export interface StorePolicy {
  storeId: string;
  storeName: string;
  badgeColor: string;
  logoIcon: string;
  supportPhone?: string;
  nodalEmail: string;
  policySummary: string;
  openBoxDeliveryRules: string;
  categoryRules: {
    category: string;
    windowDays: number;
    type: 'Replacement Only' | 'Refund & Return' | 'Technician Visit' | 'Non-Returnable';
    conditions: string;
  }[];
}

const STORE_POLICIES: StorePolicy[] = [
  {
    storeId: 'amazon',
    storeName: 'Amazon India',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    logoIcon: '📦',
    supportPhone: '1800-3000-9009',
    nodalEmail: 'grievance-officer@amazon.in',
    policySummary: '7-10 day return or replacement window depending on seller and category. Most electronics now require brand technician inspection.',
    openBoxDeliveryRules: 'Delivery agent opens outer packaging in front of you. Inspect IMEI, body, and screen before sharing OTP. Once OTP is shared, physical damage claims are rejected.',
    categoryRules: [
      {
        category: 'Smartphones & Tablets',
        windowDays: 7,
        type: 'Replacement Only',
        conditions: '7-day replacement only if defective. Brand technician or remote diagnostics run via Amazon app. Open Box Delivery mandatory.',
      },
      {
        category: 'Laptops & Monitors',
        windowDays: 7,
        type: 'Technician Visit',
        conditions: 'Brand service center inspection required. If certified dead-on-arrival (DOA) by technician, Amazon issues replacement or refund.',
      },
      {
        category: 'Apparel & Shoes (Amazon Fashion)',
        windowDays: 10,
        type: 'Refund & Return',
        conditions: '10-day return for full refund or size exchange. Tags and original packaging must be intact.',
      },
      {
        category: 'TVs & Large Appliances',
        windowDays: 10,
        type: 'Technician Visit',
        conditions: 'Do NOT unbox by yourself. Wait for official brand installation technician to open the box to retain transit damage warranty.',
      },
      {
        category: 'Grocery & Gourmet Foods',
        windowDays: 0,
        type: 'Refund & Return',
        conditions: 'Non-returnable. If damaged, expired, or rotten upon delivery, contact customer care within 24 hours for instant refund without return.',
      },
    ],
  },
  {
    storeId: 'flipkart',
    storeName: 'Flipkart',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    logoIcon: '🛍️',
    supportPhone: '1800-202-9898',
    nodalEmail: 'nodal.officer@flipkart.com',
    policySummary: 'Strict 7-day policy across electronics. Open Box Delivery is heavily enforced on gadgets. Lifestyle products have 7-14 day windows.',
    openBoxDeliveryRules: 'Agent tears open inner seal. You must check that the smartphone powers on and the display glass has zero cracks. Refuse OTP if box has soap, stones, or missing accessories.',
    categoryRules: [
      {
        category: 'Mobiles & Smartwatches',
        windowDays: 7,
        type: 'Replacement Only',
        conditions: '7-day replacement for software/hardware defects. No return for remorse. If OTP was shared during Open Box Delivery, physical damage claims are barred.',
      },
      {
        category: 'Laptops & Computer Components',
        windowDays: 7,
        type: 'Technician Visit',
        conditions: 'Technician visit arranged by Flipkart within 48-72 hours to diagnose issue. Replacement issued upon technician sign-off.',
      },
      {
        category: 'Clothing & Footwear',
        windowDays: 14,
        type: 'Refund & Return',
        conditions: '14-day free return or size exchange. Courier checks tags and barcode upon pickup.',
      },
      {
        category: 'Large Appliances & ACs',
        windowDays: 10,
        type: 'Technician Visit',
        conditions: 'Installation arranged by Jeeves or brand. Technician handles unboxing. If physical damage is observed during unboxing, technician files DOA ticket.',
      },
    ],
  },
  {
    storeId: 'myntra',
    storeName: 'Myntra',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    logoIcon: '👗',
    supportPhone: '080-61561999',
    nodalEmail: 'grievanceofficer@myntra.com',
    policySummary: 'Generous 14-day return window on fashion, with doorstep instant quality check. High-return accounts may be penalized with convenience fees.',
    openBoxDeliveryRules: 'Not applicable for fashion, but delivery partner performs a 30-second visual scan during return pickup (tag match, perfume odor check).',
    categoryRules: [
      {
        category: 'Clothing, Jeans & Jackets',
        windowDays: 14,
        type: 'Refund & Return',
        conditions: '14-day return. Tags, barcode stickers, and price label must remain attached. Unwashed only.',
      },
      {
        category: 'Footwear & Sneakers',
        windowDays: 14,
        type: 'Refund & Return',
        conditions: 'Original shoe box must be handed over in intact condition without packaging tape directly on brand box.',
      },
      {
        category: 'Innerwear & Lingerie',
        windowDays: 0,
        type: 'Non-Returnable',
        conditions: 'Strictly non-returnable due to hygiene regulations.',
      },
      {
        category: 'Beauty & Cosmetics',
        windowDays: 0,
        type: 'Non-Returnable',
        conditions: 'Non-returnable once opened or unsealed. Refund only if received broken, expired, or wrong item.',
      },
    ],
  },
  {
    storeId: 'ajio',
    storeName: 'AJIO (Reliance Retail)',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    logoIcon: '🕶️',
    supportPhone: '1800-889-9991',
    nodalEmail: 'customercare@ajio.com',
    policySummary: '15-day return window. Reliance Trends & AJIO Luxe products have dedicated verification channels.',
    openBoxDeliveryRules: 'Standard courier pickup. OTP required during return handover.',
    categoryRules: [
      {
        category: 'Apparel & Trends',
        windowDays: 15,
        type: 'Refund & Return',
        conditions: '15-day return window. Refund credited to AJIO Wallet instantly or original bank card within 3-5 days.',
      },
      {
        category: 'AJIO Luxe Designer Items',
        windowDays: 7,
        type: 'Refund & Return',
        conditions: '7-day return. Security tag must NOT be tampered with. Tampered security tags result in automatic return rejection.',
      },
    ],
  },
  {
    storeId: 'croma_reliance',
    storeName: 'Croma & Reliance Digital',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    logoIcon: '📺',
    supportPhone: '1800-572-7662',
    nodalEmail: 'grievance.officer@croma.com',
    policySummary: 'Electronics specialists. Store return option available for online orders. Prompt service center facilitation.',
    openBoxDeliveryRules: 'Deliveries done via brand logistics. Product unboxed and demonstrated during delivery itself.',
    categoryRules: [
      {
        category: 'All Consumer Electronics',
        windowDays: 7,
        type: 'Replacement Only',
        conditions: '7-day replacement for manufacturing defects. Can walk into any nearest physical store with invoice for faster resolution.',
      },
    ],
  },
];

export const ReturnWindowWarrantySentinel: React.FC = () => {
  const [selectedStoreId, setSelectedStoreId] = useState<string>('amazon');
  const [deliveryDate, setDeliveryDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );
  const [selectedCategoryIdx, setSelectedCategoryIdx] = useState<number>(0);

  // OBD Checklist state
  const [obdChecks, setObdChecks] = useState<{ [key: string]: boolean }>({
    boxOuterSeal: false,
    imeiMatch: false,
    screenNoCrack: false,
    powerOnCheck: false,
    chargerCablesPresent: false,
    noSurpriseSoap: false,
  });

  // Dispute letter generator state
  const [orderNumber, setOrderNumber] = useState<string>('OD4092817293817');
  const [productTitle, setProductTitle] = useState<string>('OnePlus 12 5G (Silky Black, 256GB)');
  const [defectReason, setDefectReason] = useState<string>(
    'Received unit with green line artifact on OLED display and intermittent touch failure'
  );
  const [copiedLetter, setCopiedLetter] = useState<boolean>(false);

  const activeStore =
    STORE_POLICIES.find((s) => s.storeId === selectedStoreId) || STORE_POLICIES[0];
  const activeRule = activeStore.categoryRules[selectedCategoryIdx] || activeStore.categoryRules[0];

  // Return Expiry Calculation
  const expiryDetails = useMemo(() => {
    const d = new Date(deliveryDate);
    if (isNaN(d.getTime())) return null;

    const expiryDate = new Date(d);
    expiryDate.setDate(expiryDate.getDate() + activeRule.windowDays);

    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      expiryDateFormatted: expiryDate.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      daysLeft,
      isExpired: daysLeft < 0,
      isUrgent: daysLeft >= 0 && daysLeft <= 2,
    };
  }, [deliveryDate, activeRule.windowDays]);

  const toggleObdCheck = (key: string) => {
    setObdChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const obdProgress = useMemo(() => {
    const total = Object.keys(obdChecks).length;
    const passed = Object.values(obdChecks).filter(Boolean).length;
    return { passed, total, isComplete: passed === total };
  }, [obdChecks]);

  const handleCopyLegalDispute = () => {
    const text = `To: Grievance Officer, ${activeStore.storeName} (${activeStore.nodalEmail})
CC: National Consumer Helpline (consumerhelpline.gov.in)
Subject: FORMAL NOTICE: Replacement / Refund Demand for Order #${orderNumber} [Consumer Protection Act, 2020]

Dear Grievance Officer,

I am writing with reference to Order #${orderNumber} placed on ${activeStore.storeName} for the product: "${productTitle}", delivered on ${deliveryDate}.

DEFECT & GRIEVANCE PARTICULARS:
${defectReason}

Under the Consumer Protection (E-Commerce) Rules, 2020 (notified under the Consumer Protection Act, 2019), Section 5(3)(b) & Section 6, the e-commerce entity and its listed merchant are legally obligated to remediate defective goods delivered to consumers within the declared return window (${activeRule.windowDays} days).

The product is within its active statutory return period. The defect constitutes a latent manufacturing fault / dead-on-arrival condition not attributable to consumer misuse.

DEMAND OF REMEDY:
I request you to immediately authorize a return pickup and arrange an expedited REPLACEMENT or 100% REFUND to the source payment method within 48 hours of this notice.

Failing an immediate and fair resolution, I shall be constrained to escalate this matter to the National Consumer Helpline (Toll-Free: 1915 / INGRAM Portal) and file a formal consumer complaint on the E-Daakhil portal (edaakhil.nic.in) for deficiency of service and unfair trade practice, claiming compensation for harassment and financial loss.

Looking forward to your prompt response.

Sincerely,
Aggrieved Consumer
Order ID: #${orderNumber}
Platform: ${activeStore.storeName}`;

    navigator.clipboard.writeText(text);
    setCopiedLetter(true);
    setTimeout(() => setCopiedLetter(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#0D1527] p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛡️</span>
              <h3 className="font-heading font-black text-lg text-slate-900 dark:text-[#F1F5F9] tracking-tight">
                E-Commerce Return Window &amp; Open Box Delivery Sentinel
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                INDIAN CONSUMER PROTECTION LAW
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-2xl">
              Amazon, Flipkart, and Myntra have quietly tightened return policies.
              Track your exact deadline countdown, follow the 6-step Open Box Delivery protocol before giving OTP, and draft legal dispute notices.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 dark:bg-[#111C33] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10">
              National Helpline: 1915
            </span>
          </div>
        </div>
      </div>

      {/* Store Platform Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {STORE_POLICIES.map((store) => {
          const isSelected = store.storeId === selectedStoreId;
          return (
            <button
              key={store.storeId}
              type="button"
              onClick={() => {
                setSelectedStoreId(store.storeId);
                setSelectedCategoryIdx(0);
              }}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-500/20'
                  : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:border-white/20 hover:bg-slate-50 dark:bg-[#070A11] bg-white dark:bg-[#0D1527]'
              }`}
            >
              <div>
                <div className="text-xl mb-1">{store.logoIcon}</div>
                <div className="font-bold text-xs text-slate-900 dark:text-[#F1F5F9] line-clamp-1">
                  {store.storeName}
                </div>
              </div>
              <div className="mt-2 text-[10px] font-mono text-slate-500 line-clamp-1">
                {store.nodalEmail}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Expiry Calculator & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Category Rules & Expiry Calculator */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-[#0D1527] p-5 rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-xs space-y-4">
            <div className="font-bold text-sm text-slate-800 dark:text-[#F8FAFC] flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>⏱️</span>
                <span>Return Window &amp; Expiry Countdown</span>
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${activeStore.badgeColor}`}>
                {activeStore.storeName}
              </span>
            </div>

            {/* Delivery Date Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Order Delivery Date
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 font-mono text-xs bg-slate-50/50 dark:bg-[#070A11]/50 focus:bg-white dark:bg-[#0D1527] focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Category Rules Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Product Category
              </label>
              <div className="space-y-2">
                {activeStore.categoryRules.map((rule, idx) => {
                  const isSelected = selectedCategoryIdx === idx;
                  return (
                    <button
                      key={rule.category}
                      type="button"
                      onClick={() => setSelectedCategoryIdx(idx)}
                      className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between text-xs ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/40 font-bold text-blue-950'
                          : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:bg-[#070A11] text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold">{rule.category}</div>
                        <div className="text-[11px] text-slate-500 font-normal">
                          {rule.conditions}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <span className="font-mono font-bold text-blue-700 bg-white dark:bg-[#0D1527] px-2 py-0.5 rounded border border-blue-200 text-[10px] block">
                          {rule.windowDays === 0 ? 'Non-Returnable' : `${rule.windowDays} Days`}
                        </span>
                        <span className="text-[9.5px] text-slate-400 font-mono block mt-0.5">
                          {rule.type}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Expiry Status Display */}
            {expiryDetails && (
              <div
                className={`p-4 rounded-xl border ${
                  expiryDetails.isExpired
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : expiryDetails.isUrgent
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs uppercase tracking-wider font-mono">
                    Return Window Status
                  </div>
                  <div className="font-mono text-xs font-bold">
                    Expires on: {expiryDetails.expiryDateFormatted}
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <div className="text-xl sm:text-2xl font-black font-heading tracking-tight">
                    {expiryDetails.isExpired
                      ? 'Window Closed'
                      : expiryDetails.daysLeft === 0
                      ? 'Expires Today (Final Hours)'
                      : `${expiryDetails.daysLeft} Days Remaining`}
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-white/80 dark:bg-[#0D1527]/80 shadow-2xs">
                    {activeRule.type}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Open Box Delivery Pre-OTP Checklist */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-[#0D1527] p-5 rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="font-bold text-sm text-slate-800 dark:text-[#F8FAFC] flex items-center gap-2">
                <span>📦</span>
                <span>Open Box Delivery (OBD) Protocol</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                CRITICAL BEFORE OTP
              </span>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400 bg-amber-50/50 p-3 rounded-xl border border-amber-200/60 leading-relaxed text-[11.5px]">
              <strong>Rule of Golden Protection:</strong> Once you give the 4 or 6-digit delivery OTP to the delivery agent, e-commerce platforms automatically tag the product as inspected and physically intact. Claims for broken screens or soap bars are subsequently rejected!
            </div>

            {/* Checklist items */}
            <div className="space-y-2">
              {[
                {
                  id: 'boxOuterSeal',
                  label: 'Outer Box & Tamper Tape',
                  desc: 'Ensure no re-taping or torn brand security tape.',
                },
                {
                  id: 'noSurpriseSoap',
                  label: 'Physical Presence Check',
                  desc: 'Verify genuine phone/gadget inside box, not dummy brick or soap.',
                },
                {
                  id: 'screenNoCrack',
                  label: 'Zero Screen / Body Cracks',
                  desc: 'Inspect Gorilla Glass screen, camera bump, and chassis under direct light.',
                },
                {
                  id: 'powerOnCheck',
                  label: 'Power On to Boot Screen',
                  desc: 'Press power button to verify display lights up and does not have dead pixels.',
                },
                {
                  id: 'imeiMatch',
                  label: 'IMEI / Serial Number Match',
                  desc: 'Match IMEI/Serial on invoice against box label and phone SIM tray.',
                },
                {
                  id: 'chargerCablesPresent',
                  label: 'Included Accessories & Cable',
                  desc: 'Verify charging cable, SIM ejector pin, and warranty manual are present.',
                },
              ].map((item) => (
                <label
                  key={item.id}
                  className={`flex items-start gap-3 p-2.5 rounded-xl border transition-colors cursor-pointer text-xs ${
                    obdChecks[item.id]
                      ? 'border-emerald-300 bg-emerald-50/50 text-slate-900 dark:text-[#F1F5F9]'
                      : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:bg-[#070A11] text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!obdChecks[item.id]}
                    onChange={() => toggleObdCheck(item.id)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="font-bold text-xs">{item.label}</div>
                    <div className="text-[11px] text-slate-500">{item.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            {/* Progress Bar & Safe to share OTP verdict */}
            <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Inspection: {obdProgress.passed} / {obdProgress.total} Passed
                </span>
              </div>
              <div>
                {obdProgress.isComplete ? (
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg">
                    ✓ SAFE TO SHARE OTP
                  </span>
                ) : (
                  <span className="text-xs font-mono font-bold text-rose-700 bg-rose-100 px-3 py-1 rounded-lg">
                    ⚠️ DO NOT SHARE OTP YET
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Legal Notice & Grievance Generator */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="text-xs uppercase tracking-wider font-mono text-blue-400 font-bold">
              Consumer Grievance Legal Generator
            </div>
            <div className="text-lg font-heading font-black text-white mt-0.5">
              Draft Statutory Replacement / Refund Escalation Notice
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyLegalDispute}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-2 self-start sm:self-auto"
          >
            <span>{copiedLetter ? '✓ Notice Copied' : '📋 Copy Legal Notice'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              Order Number / ID
            </label>
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              Product Title
            </label>
            <input
              type="text"
              value={productTitle}
              onChange={(e) => setProductTitle(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              Defect Description
            </label>
            <input
              type="text"
              value={defectReason}
              onChange={(e) => setDefectReason(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 text-[11px] font-mono text-slate-300 leading-relaxed">
          Pre-cites: Section 5(3)(b) of the Consumer Protection (E-Commerce) Rules, 2020. Addressed directly to {activeStore.nodalEmail} with copy to National Consumer Helpline.
        </div>
      </div>
    </div>
  );
};
