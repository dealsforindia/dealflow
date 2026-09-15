import React, { useState, useEffect } from 'react';
import { ArrowUp, Store, ShoppingBag, Shirt, Zap, ShoppingCart } from 'lucide-react';

interface FloatingDockProps {
  selectedStore: string;
  onSelectStore: (store: string) => void;
  onSelectLootOnly?: () => void;
}

export const FloatingDock: React.FC<FloatingDockProps> = ({
  selectedStore,
  onSelectStore,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 320);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  const quickStores = [
    { id: 'all', label: 'All', icon: Store },
    { id: 'Amazon', label: 'Amazon', icon: ShoppingBag },
    { id: 'Flipkart', label: 'Flipkart', icon: ShoppingCart },
    { id: 'Myntra', label: 'Myntra', icon: Shirt },
    { id: 'Swiggy', label: 'Swiggy', icon: Zap },
  ];

  return (
    <div 
      className="fixed bottom-5 sm:bottom-7 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-bottom-5 duration-300 pb-[env(safe-area-inset-bottom,0px)]"
      role="toolbar"
      aria-label="Quick Store Filters & Navigation"
    >
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#0E1424]/90 border border-white/15 shadow-2xl shadow-black/60 backdrop-blur-2xl transition-all">
        
        {quickStores.map((s) => {
          const active = selectedStore.toLowerCase() === s.id.toLowerCase();
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => onSelectStore(s.id)}
              className={`touch-target min-h-[44px] px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none focus-ring ${
                active
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-lg shadow-emerald-500/30 scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              aria-label={`Filter by ${s.label}`}
              aria-pressed={active}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline ml-1.5">{s.label}</span>
            </button>
          );
        })}

        <div className="w-[1px] h-6 bg-white/15 mx-1" aria-hidden="true" />

        {/* Scroll To Top Button with $\ge 44\times 44\text{px}$ Hit Target */}
        <button
          onClick={scrollToTop}
          title="Scroll to Top"
          aria-label="Scroll to top of page"
          className="touch-target min-h-[44px] min-w-[44px] p-2.5 rounded-xl text-slate-300 hover:text-emerald-400 hover:bg-white/10 transition cursor-pointer focus-ring"
        >
          <ArrowUp className="w-4 h-4" aria-hidden="true" />
        </button>

      </div>
    </div>
  );
};
