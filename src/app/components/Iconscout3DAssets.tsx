import React from "react";
import { motion } from "motion/react";

// ─── 1. High-Fidelity 3D Category & Store Icons ───────────────────────────────
export function Category3DIcon({ category, size = 20 }: { category: string; size?: number }) {
  const cat = category.toLowerCase();

  if (cat.includes("fashion") || cat.includes("cloth") || cat.includes("apparel")) {
    return (
      <motion.span
        className="inline-flex items-center justify-center filter drop-shadow-[0_4px_8px_rgba(244,63,94,0.4)]"
        style={{ fontSize: size }}
        whileHover={{ scale: 1.25, rotate: 10 }}
      >
        👗
      </motion.span>
    );
  }
  if (cat.includes("electronic") || cat.includes("phone") || cat.includes("tech")) {
    return (
      <motion.span
        className="inline-flex items-center justify-center filter drop-shadow-[0_4px_8px_rgba(139,92,246,0.4)]"
        style={{ fontSize: size }}
        whileHover={{ scale: 1.25, rotate: -8 }}
      >
        💻
      </motion.span>
    );
  }
  if (cat.includes("audio") || cat.includes("headphone") || cat.includes("sound")) {
    return (
      <motion.span
        className="inline-flex items-center justify-center filter drop-shadow-[0_4px_8px_rgba(6,182,212,0.4)]"
        style={{ fontSize: size }}
        whileHover={{ scale: 1.25, rotate: 8 }}
      >
        🎧
      </motion.span>
    );
  }
  if (cat.includes("beauty") || cat.includes("personal") || cat.includes("cosmetic")) {
    return (
      <motion.span
        className="inline-flex items-center justify-center filter drop-shadow-[0_4px_8px_rgba(244,114,182,0.4)]"
        style={{ fontSize: size }}
        whileHover={{ scale: 1.25, rotate: 12 }}
      >
        💄
      </motion.span>
    );
  }
  if (cat.includes("grocery") || cat.includes("food") || cat.includes("dining")) {
    return (
      <motion.span
        className="inline-flex items-center justify-center filter drop-shadow-[0_4px_8px_rgba(16,185,129,0.4)]"
        style={{ fontSize: size }}
        whileHover={{ scale: 1.25, rotate: -6 }}
      >
        🛒
      </motion.span>
    );
  }
  if (cat.includes("home") || cat.includes("kitchen")) {
    return (
      <motion.span
        className="inline-flex items-center justify-center filter drop-shadow-[0_4px_8px_rgba(245,158,11,0.4)]"
        style={{ fontSize: size }}
        whileHover={{ scale: 1.25, rotate: 6 }}
      >
        🏠
      </motion.span>
    );
  }
  if (cat.includes("gaming") || cat.includes("game")) {
    return (
      <motion.span
        className="inline-flex items-center justify-center filter drop-shadow-[0_4px_8px_rgba(168,85,247,0.4)]"
        style={{ fontSize: size }}
        whileHover={{ scale: 1.25, rotate: 12 }}
      >
        🎮
      </motion.span>
    );
  }
  if (cat.includes("bank") || cat.includes("card") || cat.includes("credit")) {
    return (
      <motion.span
        className="inline-flex items-center justify-center filter drop-shadow-[0_4px_8px_rgba(59,130,246,0.4)]"
        style={{ fontSize: size }}
        whileHover={{ scale: 1.25, rotate: -10 }}
      >
        💳
      </motion.span>
    );
  }
  if (cat.includes("trick") || cat.includes("loot") || cat.includes("free")) {
    return (
      <motion.span
        className="inline-flex items-center justify-center filter drop-shadow-[0_4px_8px_rgba(234,179,8,0.5)]"
        style={{ fontSize: size }}
        whileHover={{ scale: 1.25, rotate: 15 }}
      >
        🎁
      </motion.span>
    );
  }
  return (
    <motion.span
      className="inline-flex items-center justify-center filter drop-shadow-[0_4px_8px_rgba(100,116,139,0.3)]"
      style={{ fontSize: size }}
      whileHover={{ scale: 1.25 }}
    >
      🛍️
    </motion.span>
  );
}

// ─── 2. 3D Store Brand Badges ────────────────────────────────────────────────
export function Store3DBadge({ store, size = 18 }: { store: string; size?: number }) {
  const s = store.toLowerCase();

  if (s.includes("amazon") || s.includes("amzn")) {
    return (
      <motion.div
        whileHover={{ scale: 1.06, y: -1 }}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/25 via-amber-600/20 to-orange-500/25 border border-amber-400/40 text-amber-300 backdrop-blur-xl shadow-[0_4px_12px_rgba(245,158,11,0.2)]"
      >
        <span className="text-sm filter drop-shadow-[0_2px_4px_rgba(245,158,11,0.6)]">📦</span>
        <span className="text-[11px] font-black tracking-tight drop-shadow-sm">Amazon</span>
      </motion.div>
    );
  }
  if (s.includes("flipkart") || s.includes("fkrt")) {
    return (
      <motion.div
        whileHover={{ scale: 1.06, y: -1 }}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-blue-500/25 via-blue-600/20 to-cyan-500/25 border border-blue-400/40 text-blue-300 backdrop-blur-xl shadow-[0_4px_12px_rgba(59,130,246,0.2)]"
      >
        <span className="text-sm filter drop-shadow-[0_2px_4px_rgba(59,130,246,0.6)]">🛍️</span>
        <span className="text-[11px] font-black tracking-tight drop-shadow-sm">Flipkart</span>
      </motion.div>
    );
  }
  if (s.includes("myntra")) {
    return (
      <motion.div
        whileHover={{ scale: 1.06, y: -1 }}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-pink-500/25 via-rose-600/20 to-pink-500/25 border border-pink-400/40 text-pink-300 backdrop-blur-xl shadow-[0_4px_12px_rgba(244,63,94,0.2)]"
      >
        <span className="text-sm filter drop-shadow-[0_2px_4px_rgba(244,63,94,0.6)]">👗</span>
        <span className="text-[11px] font-black tracking-tight drop-shadow-sm">Myntra</span>
      </motion.div>
    );
  }
  if (s.includes("ajio")) {
    return (
      <motion.div
        whileHover={{ scale: 1.06, y: -1 }}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-purple-500/25 via-indigo-600/20 to-purple-500/25 border border-purple-400/40 text-purple-300 backdrop-blur-xl shadow-[0_4px_12px_rgba(168,85,247,0.2)]"
      >
        <span className="text-sm filter drop-shadow-[0_2px_4px_rgba(168,85,247,0.6)]">✨</span>
        <span className="text-[11px] font-black tracking-tight drop-shadow-sm">AJIO</span>
      </motion.div>
    );
  }
  if (s.includes("desidime")) {
    return (
      <motion.div
        whileHover={{ scale: 1.06, y: -1 }}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-red-500/25 via-orange-600/20 to-red-500/25 border border-red-400/40 text-red-300 backdrop-blur-xl shadow-[0_4px_12px_rgba(239,68,68,0.25)]"
      >
        <span className="text-sm filter drop-shadow-[0_2px_4px_rgba(239,68,68,0.6)]">🔥</span>
        <span className="text-[11px] font-black tracking-tight drop-shadow-sm">DesiDime</span>
      </motion.div>
    );
  }
  if (s.includes("zepto")) {
    return (
      <motion.div
        whileHover={{ scale: 1.06, y: -1 }}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-purple-500/25 via-pink-600/20 to-purple-500/25 border border-purple-400/40 text-purple-300 backdrop-blur-xl shadow-sm"
      >
        <span className="text-sm filter drop-shadow-[0_2px_4px_rgba(168,85,247,0.5)]">⚡</span>
        <span className="text-[11px] font-black tracking-tight">Zepto</span>
      </motion.div>
    );
  }
  if (s.includes("blinkit") || s.includes("grofers")) {
    return (
      <motion.div
        whileHover={{ scale: 1.06, y: -1 }}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-yellow-500/25 via-amber-600/20 to-yellow-500/25 border border-yellow-400/40 text-yellow-300 backdrop-blur-xl shadow-sm"
      >
        <span className="text-sm filter drop-shadow-[0_2px_4px_rgba(234,179,8,0.5)]">🛵</span>
        <span className="text-[11px] font-black tracking-tight">Blinkit</span>
      </motion.div>
    );
  }
  const clean = store && store.toLowerCase() !== "other" ? store : "Loot Deal";
  return (
    <motion.div
      whileHover={{ scale: 1.06, y: -1 }}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-600/40 text-slate-300 backdrop-blur-xl shadow-sm"
    >
      <span className="text-sm">🛒</span>
      <span className="text-[11px] font-black tracking-tight">{clean}</span>
    </motion.div>
  );
}

// ─── 3. 3D Floating Nav / Sidebar Icons ───────────────────────────────────────
export function Nav3DIcon({ icon, active }: { icon: "review" | "broadcast" | "channels" | "settings"; active: boolean }) {
  const icons = {
    review: "🛒",
    broadcast: "🚀",
    channels: "📡",
    settings: "⚙️"
  };

  return (
    <motion.div
      className={`relative flex items-center justify-center w-7 h-7 rounded-xl transition-all duration-300 ${
        active ? "bg-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.35)]" : "bg-white/5"
      }`}
      animate={active ? { scale: [1, 1.12, 1], rotateZ: [0, 4, -4, 0] } : {}}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <span className="text-base filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]">{icons[icon]}</span>
      {active && (
        <span className="absolute -bottom-0.5 w-2 h-0.5 rounded-full bg-indigo-400 shadow-[0_0_6px_#818CF8]" />
      )}
    </motion.div>
  );
}

// ─── 4. 3D Stat Counter Pill ──────────────────────────────────────────────────
export function Stat3DPill({ label, count, icon, color, active, onClick }: {
  label: string; count: number; icon: string; color: string; active: boolean; onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.04, y: -1 }}
      whileTap={{ scale: 0.96 }}
      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border text-xs font-bold transition-all backdrop-blur-xl ${
        active
          ? `${color} shadow-[0_0_20px_rgba(99,102,241,0.25)] border-white/25`
          : "bg-slate-900/60 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800/70"
      }`}
    >
      <span className="text-sm filter drop-shadow-sm">{icon}</span>
      <span>{label}</span>
      <span className="px-1.5 py-0.5 rounded-full bg-black/40 text-[10px] font-mono font-black border border-white/10">
        {count}
      </span>
    </motion.button>
  );
}

// ─── 5. 3D Savings Pill ───────────────────────────────────────────────────────
export function SavingsPill3D({ amount }: { amount: number }) {
  return (
    <motion.div
      className="flex items-center gap-1.5 text-[11px] font-black text-emerald-300 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 px-2.5 py-1 rounded-xl border border-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.25)] backdrop-blur-md"
      whileHover={{ scale: 1.06, y: -1 }}
    >
      <span className="filter drop-shadow-[0_1px_3px_rgba(16,185,129,0.6)]">💰</span>
      <span>Save ₹{amount.toLocaleString("en-IN")}</span>
    </motion.div>
  );
}

// ─── 6. 3D Floating Cart & Satellite Headers ──────────────────────────────────
export function FloatingCart3D({ size = 40 }: { size?: number }) {
  return (
    <motion.div
      className="relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/20 to-purple-500/20 p-2.5 border border-primary/30 shadow-[0_0_25px_rgba(244,63,94,0.3)] backdrop-blur-xl"
      style={{ width: size, height: size }}
      animate={{ y: [0, -4, 0], rotateZ: [0, 3, -3, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <span className="text-2xl filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.5)]">🛒</span>
      <motion.div
        className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_#F43F5E] border-2 border-slate-950"
        animate={{ scale: [1, 1.35, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

export function Satellite3D({ size = 40 }: { size?: number }) {
  return (
    <motion.div
      className="relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 p-2.5 border border-indigo-400/30 shadow-[0_0_25px_rgba(99,102,241,0.3)] backdrop-blur-xl"
      style={{ width: size, height: size }}
      animate={{ y: [0, -4, 0], rotateZ: [0, -3, 3, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <span className="text-2xl filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.5)]">📡</span>
      <motion.div
        className="absolute inset-0 rounded-2xl border-2 border-indigo-400/50"
        animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}
