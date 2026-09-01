import { motion } from "motion/react";

// ─── 1. 3D Store Brand Assets ────────────────────────────────────────────────
export function Store3DBadge({ store, size = 18 }: { store: string; size?: number }) {
  const s = store.toLowerCase();

  if (s.includes("amazon") || s.includes("amzn")) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 backdrop-blur-md shadow-sm">
        <span className="text-xs filter drop-shadow-[0_2px_4px_rgba(245,158,11,0.5)]">📦</span>
        <span className="text-[10px] font-bold tracking-tight">Amazon</span>
      </div>
    );
  }
  if (s.includes("flipkart") || s.includes("fkrt")) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300 backdrop-blur-md shadow-sm">
        <span className="text-xs filter drop-shadow-[0_2px_4px_rgba(59,130,246,0.5)]">🛍️</span>
        <span className="text-[10px] font-bold tracking-tight">Flipkart</span>
      </div>
    );
  }
  if (s.includes("myntra")) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-500/30 text-pink-300 backdrop-blur-md shadow-sm">
        <span className="text-xs filter drop-shadow-[0_2px_4px_rgba(244,63,94,0.5)]">👗</span>
        <span className="text-[10px] font-bold tracking-tight">Myntra</span>
      </div>
    );
  }
  if (s.includes("ajio")) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-purple-300 backdrop-blur-md shadow-sm">
        <span className="text-xs filter drop-shadow-[0_2px_4px_rgba(168,85,247,0.5)]">✨</span>
        <span className="text-[10px] font-bold tracking-tight">AJIO</span>
      </div>
    );
  }
  if (s.includes("desidime")) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 text-red-300 backdrop-blur-md shadow-sm">
        <span className="text-xs filter drop-shadow-[0_2px_4px_rgba(239,68,68,0.5)]">🔥</span>
        <span className="text-[10px] font-bold tracking-tight">DesiDime</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-800/80 border border-slate-700/50 text-slate-300 backdrop-blur-md shadow-sm">
      <span className="text-xs">🛒</span>
      <span className="text-[10px] font-bold tracking-tight">{store || "Store"}</span>
    </div>
  );
}

// ─── 2. 3D Floating Shopping Cart Header ──────────────────────────────────────
export function FloatingCart3D({ size = 36 }: { size?: number }) {
  return (
    <motion.div
      className="relative flex items-center justify-center rounded-2xl glass-panel p-2 border border-primary/30 shadow-[0_0_25px_rgba(244,63,94,0.25)]"
      style={{ width: size, height: size }}
      animate={{ y: [0, -4, 0], rotateZ: [0, 2, -2, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <span className="text-xl filter drop-shadow-md">🛒</span>
      <motion.div
        className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#F43F5E]"
        animate={{ scale: [1, 1.4, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

// ─── 3. 3D Broadcast Satellite ────────────────────────────────────────────────
export function Satellite3D({ size = 36 }: { size?: number }) {
  return (
    <motion.div
      className="relative flex items-center justify-center rounded-2xl glass-panel p-2 border border-indigo-500/30 shadow-[0_0_25px_rgba(99,102,241,0.25)]"
      style={{ width: size, height: size }}
      animate={{ y: [0, -4, 0], rotateZ: [0, -3, 3, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <span className="text-xl filter drop-shadow-md">📡</span>
      <motion.div
        className="absolute inset-0 rounded-2xl border border-indigo-400/40"
        animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

// ─── 4. 3D Glowing Money Bag / Savings Pill ───────────────────────────────────
export function SavingsPill3D({ amount }: { amount: number }) {
  return (
    <motion.div
      className="flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
      whileHover={{ scale: 1.05 }}
    >
      <span className="filter drop-shadow-[0_1px_2px_rgba(16,185,129,0.6)]">💰</span>
      <span>Save ₹{amount.toLocaleString("en-IN")}</span>
    </motion.div>
  );
}
