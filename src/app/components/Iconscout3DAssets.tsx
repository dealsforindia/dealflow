import React from "react";
import { ShoppingBag, ShoppingCart, Radio, Send, Video, Settings2, Package, Clock, Check, X, Tag, Coins, WandSparkles } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

// ─── 1. High-Fidelity 3D Category & Store Icons ───────────────────────────────
export function Category3DIcon({ category, size = 16 }: { category: string; size?: number }) {
 return <ShoppingBag size={size} aria-label={category} strokeWidth={1.6} />;
}
export function Category3DPlaceholder({ category }: { category: string }) {
 return <div className="deal-media-placeholder w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400"><Package size={28} strokeWidth={1.4} /><span className="text-xs font-medium">{category || "Product image"}</span></div>;
}

// ─── 3. 3D Store Brand Badges ────────────────────────────────────────────────
export function Store3DBadge({ store }: { store: string; size?: number }) {
 const value = (store || "").toLowerCase();
 const names: [RegExp, string][] = [[/amazon|amzn/,"Amazon"],[/flipkart|fkrt/,"Flipkart"],[/myntra/,"Myntra"],[/ajio/,"AJIO"],[/desidime/,"DesiDime"],[/blinkit/,"Blinkit"],[/zepto/,"Zepto"],[/swiggy/,"Swiggy"],[/croma/,"Croma"],[/jiomart/,"JioMart"],[/digihaat/,"Digihaat"]];
 const name = names.find(([pattern]) => pattern.test(value))?.[1] || (store && value !== "other" ? store : "Direct store");
 return <span className="deal-store-label font-bold text-gray-900">{name}</span>;
}

// ─── 4. 3D Floating Nav / Sidebar Icons ───────────────────────────────────────
export function Nav3DIcon({ icon, active }: { icon: "review" | "broadcast" | "channels" | "videos" | "settings"; active: boolean }) {
 const Icon = { review: ShoppingCart, broadcast: Send, channels: Radio, videos: Video, settings: Settings2 }[icon];
 return <span className={`deal-nav-icon ${active ? "active" : ""}`}><Icon size={18} strokeWidth={1.7} /></span>;
}

// ─── 5. Stat Counter Pill (Exact Screenshot Replica) ──────────────────────────
export function Stat3DPill({
  id,
  label,
  count,
  active,
  onClick,
}: {
  id: string;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-4 py-1.5 rounded-full text-xs transition-all flex items-center gap-2 cursor-pointer flex-shrink-0 ${
        active
          ? "bg-[#EEF2FF] border border-[#C7D2FE] text-[#4F46E5] font-semibold shadow-2xs"
          : "bg-transparent hover:bg-gray-100/70 text-gray-600 hover:text-gray-900 font-medium"
      }`}
    >
      <span>{label}</span>
      <span
        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
          active
            ? "bg-[#E0E7FF] text-[#4338CA]"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

// ─── 6. 3D Savings Pill ───────────────────────────────────────────────────────
export function SavingsPill3D({ amount }: { amount: number }) {
 if (!(amount > 0)) return null;
 return <span className="deal-savings text-emerald-600 font-medium"><Coins size={12} />Save ₹{Math.round(amount).toLocaleString("en-IN")}</span>;
}
export function StudioWand3D({ size = 32 }: { size?: number }) {
 return <span className="deal-studio-icon" style={{ width: size, height: size }}><WandSparkles size={18} /></span>;
}

// ─── 8. 3D "All Caught Up" Celebration State ──────────────────────────────────
export function AllCaughtUp3D({ onRefresh }: { onRefresh?: () => void }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-8 sm:p-12 text-center max-w-md mx-auto my-auto"
    >
      <div className="relative w-24 h-24 flex items-center justify-center mb-4">
        <motion.div
          className="w-20 h-20 rounded-3xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shadow-md"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.5, repeat: reducedMotion ? 0 : Infinity, ease: "easeInOut" }}
        >
          <span className="text-4xl">🏆</span>
        </motion.div>
      </div>

      <h3 className="text-lg font-black text-gray-900 tracking-tight">
        You're All Caught Up!
      </h3>
      <p className="text-xs text-gray-500 mt-1.5 max-w-xs leading-relaxed">
        Zero pending deals in queue. Background workers are actively monitoring 27 channels for price drops.
      </p>

      {onRefresh && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRefresh}
          className="mt-5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#5B50E6] hover:bg-[#4E43D8] shadow-sm flex items-center gap-2 cursor-pointer transition-all"
        >
          <span>🔄</span>
          <span>Refresh Stream</span>
        </motion.button>
      )}
    </motion.div>
  );
}

// ─── 9. 3D Empty Filter State ─────────────────────────────────────────────────
export function EmptyFilter3D({ onClear }: { onClear?: () => void }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-8 sm:p-12 text-center max-w-md mx-auto my-auto"
    >
      <div className="relative w-20 h-20 flex items-center justify-center mb-3">
        <motion.div
          className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center shadow-xs"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: reducedMotion ? 0 : Infinity, ease: "easeInOut" }}
        >
          <span className="text-3xl">🔍</span>
        </motion.div>
      </div>

      <h3 className="text-sm font-bold text-gray-900 tracking-tight">
        No Matching Deals Found
      </h3>
      <p className="text-xs text-gray-500 mt-1 max-w-xs leading-relaxed">
        Try adjusting your store or channel filters, or search for different keywords.
      </p>

      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 px-3.5 py-1.5 rounded-xl text-xs font-bold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer"
        >
          Reset Filters
        </button>
      )}
    </motion.div>
  );
}

// ─── 10. 3D Floating Cart & Satellite Headers ─────────────────────────────────
export function FloatingCart3D({ size = 40 }: { size?: number }) {
  return (
    <div className="relative flex items-center justify-center rounded-2xl bg-indigo-50 p-2 border border-indigo-100 text-2xl" style={{ width: size, height: size }}>
      🛒
    </div>
  );
}

export function Satellite3D({ size = 40 }: { size?: number }) {
  return (
    <div className="relative flex items-center justify-center rounded-2xl bg-indigo-50 p-2 border border-indigo-100 text-2xl" style={{ width: size, height: size }}>
      📡
    </div>
  );
}
