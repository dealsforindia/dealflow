import React, { useState, useEffect, useMemo } from 'react';

interface WarrantyItem {
  id: string;
  productName: string;
  brand: string;
  category: string;
  purchaseDate: string; // YYYY-MM-DD
  warrantyMonths: number;
  hasExtendedWarranty: boolean;
  extendedMonths?: number;
  store: string;
  invoiceNumber?: string;
}

const BRAND_DIRECTORY: Record<string, { supportUrl: string; tollFree: string }> = {
  Apple: { supportUrl: 'https://support.apple.com/en-in', tollFree: '000800 1009009' },
  Samsung: { supportUrl: 'https://www.samsung.com/in/support/', tollFree: '1800 5726 7864' },
  LG: { supportUrl: 'https://www.lg.com/in/support', tollFree: '1800 315 9999' },
  Sony: { supportUrl: 'https://www.sony.co.in/electronics/support', tollFree: '1800 103 7799' },
  OnePlus: { supportUrl: 'https://www.oneplus.in/support', tollFree: '1800 102 8411' },
  boAt: { supportUrl: 'https://support.boat-lifestyle.com/', tollFree: '022 6918 1920' },
  Xiaomi: { supportUrl: 'https://www.mi.com/in/service/online/', tollFree: '1800 103 6286' },
  Asus: { supportUrl: 'https://www.asus.com/in/support/', tollFree: '1800 209 0365' },
  HP: { supportUrl: 'https://support.hp.com/in-en', tollFree: '1800 258 7170' },
  Dell: { supportUrl: 'https://www.dell.com/support/home/en-in', tollFree: '1800 425 0088' },
};

const INITIAL_ITEMS: WarrantyItem[] = [
  {
    id: 'w1',
    productName: 'Sony WH-1000XM5 Wireless Headphones',
    brand: 'Sony',
    category: 'Electronics',
    purchaseDate: '2024-03-15',
    warrantyMonths: 12,
    hasExtendedWarranty: false,
    store: 'Amazon India',
    invoiceNumber: 'AMZ-IN-88912',
  },
  {
    id: 'w2',
    productName: 'LG 1.5 Ton 5-Star Dual Inverter Split AC',
    brand: 'LG',
    category: 'Appliances',
    purchaseDate: '2023-05-10',
    warrantyMonths: 12,
    hasExtendedWarranty: true,
    extendedMonths: 48, // 1 yr comprehensive + 4 yrs extended
    store: 'Croma',
    invoiceNumber: 'CR-2023-9011',
  },
];

export const WarrantyExpiryTrackerTool: React.FC = () => {
  const [items, setItems] = useState<WarrantyItem[]>(() => {
    try {
      const saved = localStorage.getItem('dealflow_user_warranties');
      return saved ? JSON.parse(saved) : INITIAL_ITEMS;
    } catch {
      return INITIAL_ITEMS;
    }
  });

  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expiring' | 'expired'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form state for new item
  const [newProduct, setNewProduct] = useState('');
  const [newBrand, setNewBrand] = useState('Apple');
  const [newCategory, setNewCategory] = useState('Electronics');
  const [newPurchaseDate, setNewPurchaseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newWarrantyMonths, setNewWarrantyMonths] = useState<number>(12);
  const [newExtended, setNewExtended] = useState<boolean>(false);
  const [newExtendedMonths, setNewExtendedMonths] = useState<number>(12);
  const [newStore, setNewStore] = useState('Amazon India');
  const [newInvoice, setNewInvoice] = useState('');

  // Persist items
  useEffect(() => {
    try {
      localStorage.setItem('dealflow_user_warranties', JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save warranties', e);
    }
  }, [items]);

  // Calculations for expiry
  const enrichedItems = useMemo(() => {
    const today = new Date();

    return items.map((item) => {
      const pDate = new Date(item.purchaseDate);
      const totalMonths = item.warrantyMonths + (item.hasExtendedWarranty ? (item.extendedMonths || 0) : 0);
      
      const expiryDate = new Date(pDate);
      expiryDate.setMonth(expiryDate.getMonth() + totalMonths);

      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let status: 'active' | 'expiring' | 'expired' = 'active';
      if (diffDays <= 0) {
        status = 'expired';
      } else if (diffDays <= 30) {
        status = 'expiring';
      }

      return {
        ...item,
        expiryDate: expiryDate.toISOString().split('T')[0],
        diffDays,
        status,
        brandInfo: BRAND_DIRECTORY[item.brand],
      };
    });
  }, [items]);

  const filteredItems = useMemo(() => {
    return enrichedItems.filter((i) => {
      if (filterStatus !== 'all' && i.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return i.productName.toLowerCase().includes(q) || i.brand.toLowerCase().includes(q) || i.store.toLowerCase().includes(q);
      }
      return true;
    });
  }, [enrichedItems, filterStatus, searchQuery]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.trim()) return;

    const newItem: WarrantyItem = {
      id: `w_${Date.now()}`,
      productName: newProduct.trim(),
      brand: newBrand,
      category: newCategory,
      purchaseDate: newPurchaseDate,
      warrantyMonths: Number(newWarrantyMonths),
      hasExtendedWarranty: newExtended,
      extendedMonths: newExtended ? Number(newExtendedMonths) : 0,
      store: newStore,
      invoiceNumber: newInvoice.trim() || undefined,
    };

    setItems((prev) => [newItem, ...prev]);
    setIsAddOpen(false);
    setNewProduct('');
    setNewInvoice('');
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(items, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `dealflow_warranties_backup_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchor.click();
  };

  return (
    <div className="w-full bg-white dark:bg-[#0D1527] rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-sm p-5 md:p-7 text-slate-800 dark:text-[#F8FAFC]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            <h3 className="font-heading font-extrabold text-lg sm:text-xl text-slate-900 dark:text-[#F1F5F9] tracking-tight">
              Gadget &amp; Appliance Warranty Vault
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              OFFLINE SECURE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track purchase dates, warranty expiry alerts &amp; official Indian brand support links for all your gear.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportJson}
            title="Download JSON backup"
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1527] hover:bg-slate-50 dark:bg-[#070A11] text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
          >
            💾 Export
          </button>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs"
          >
            + Add Product
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#111C33] p-1 rounded-xl w-full sm:w-auto">
          {(['all', 'active', 'expiring', 'expired'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                filterStatus === st ? 'bg-white dark:bg-[#0D1527] text-slate-900 dark:text-[#F1F5F9] shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:text-[#F8FAFC]'
              }`}
            >
              {st === 'expiring' ? 'Expiring (<30d)' : st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search gear or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-8 pr-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1527] text-xs text-slate-800 dark:text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="absolute left-2.5 top-2.5 text-xs text-slate-400">🔍</span>
        </div>
      </div>

      {/* Add Product Modal Overlay */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0D1527] rounded-2xl border border-slate-200 dark:border-white/10 p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-heading font-extrabold text-base text-slate-900 dark:text-[#F1F5F9]">
                Log New Gear Warranty
              </h4>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddItem} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MacBook Air M3, iPad Pro, Sony TV"
                  value={newProduct}
                  onChange={(e) => setNewProduct(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Brand</label>
                  <select
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full h-9 px-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1527]"
                  >
                    {Object.keys(BRAND_DIRECTORY).map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                    <option value="Other">Other Brand</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Store / Retailer</label>
                  <input
                    type="text"
                    value={newStore}
                    onChange={(e) => setNewStore(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-white/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Purchase Date</label>
                  <input
                    type="date"
                    required
                    value={newPurchaseDate}
                    onChange={(e) => setNewPurchaseDate(e.target.value)}
                    className="w-full h-9 px-2 rounded-xl border border-slate-200 dark:border-white/10"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Standard Warranty</label>
                  <select
                    value={newWarrantyMonths}
                    onChange={(e) => setNewWarrantyMonths(Number(e.target.value))}
                    className="w-full h-9 px-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1527]"
                  >
                    <option value={6}>6 Months</option>
                    <option value={12}>1 Year (12M)</option>
                    <option value={24}>2 Years (24M)</option>
                    <option value={36}>3 Years (36M)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="ext-warr"
                  checked={newExtended}
                  onChange={(e) => setNewExtended(e.target.checked)}
                  className="rounded border-slate-300 dark:border-white/20 text-blue-600"
                />
                <label htmlFor="ext-warr" className="font-medium text-slate-700 dark:text-slate-200">
                  Bought Extended Warranty (e.g. AppleCare+, OneAssist)
                </label>
              </div>

              {newExtended && (
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Extended Duration</label>
                  <select
                    value={newExtendedMonths}
                    onChange={(e) => setNewExtendedMonths(Number(e.target.value))}
                    className="w-full h-9 px-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1527]"
                  >
                    <option value={12}>+1 Year (12M)</option>
                    <option value={24}>+2 Years (24M)</option>
                    <option value={36}>+3 Years (36M)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Invoice / Order # (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. INV-2024-00129"
                  value={newInvoice}
                  onChange={(e) => setNewInvoice(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-white/10"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold"
                >
                  Save Gear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="mt-5 flex flex-col gap-3">
        {filteredItems.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 bg-slate-50/50 dark:bg-[#070A11]/50 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
            No warranty records matching your criteria. Tap &ldquo;+ Add Product&rdquo; to log your first appliance or gadget.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0D1527] hover:border-slate-300 dark:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#111C33] flex items-center justify-center text-lg flex-shrink-0">
                  {item.category === 'Appliances' ? '🧊' : '📱'}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-heading font-bold text-sm text-slate-900 dark:text-[#F1F5F9]">
                      {item.productName}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#111C33] text-slate-600 dark:text-slate-400 font-semibold">
                      {item.brand}
                    </span>
                    {item.hasExtendedWarranty && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                        +Extended
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                    <span>Bought: {item.purchaseDate} ({item.store})</span>
                    {item.invoiceNumber && (
                      <span className="font-mono text-[11px]">Inv: {item.invoiceNumber}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status & Support Actions */}
              <div className="flex items-center gap-3 self-end sm:self-center">
                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className={`w-2 h-2 rounded-full ${
                      item.status === 'active' ? 'bg-emerald-500' : item.status === 'expiring' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'
                    }`} />
                    <span className={`text-xs font-bold uppercase font-mono ${
                      item.status === 'active' ? 'text-emerald-700' : item.status === 'expiring' ? 'text-amber-700' : 'text-rose-600'
                    }`}>
                      {item.status === 'active' ? `${item.diffDays} Days Left` : item.status === 'expiring' ? `${item.diffDays}d (Expiring!)` : 'Expired'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    Valid till {item.expiryDate}
                  </span>
                </div>

                {item.brandInfo && (
                  <a
                    href={item.brandInfo.supportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Call ${item.brand} support: ${item.brandInfo.tollFree}`}
                    className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#070A11] hover:bg-slate-100 dark:bg-[#111C33] text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1"
                  >
                    <span>Support</span>
                    <span className="text-[10px]">↗</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  className="w-8 h-8 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors flex items-center justify-center text-xs"
                  title="Remove from vault"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
