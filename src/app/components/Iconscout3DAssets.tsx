import React from "react";
import { motion } from "motion/react";

// ─── 1. High-Fidelity 3D Category & Store Icons ───────────────────────────────
export function Category3DIcon({ category, size = 16 }: { category: string; size?: number }) {
  const cat = (category || "").toLowerCase();

  let icon = "🛍️";
  let glow = "rgba(100, 116, 139, 0.4)";
  let rotate = 0;

  if (cat.includes("fashion") || cat.includes("cloth") || cat.includes("apparel")) {
    icon = "👗";
    glow = "rgba(244, 63, 94, 0.5)";
    rotate = 8;
  } else if (cat.includes("footwear") || cat.includes("shoe")) {
    icon = "👟";
    glow = "rgba(249, 115, 22, 0.5)";
    rotate = -8;
  } else if (cat.includes("electronic") || cat.includes("phone") || cat.includes("tech")) {
    icon = "📱";
    glow = "rgba(139, 92, 246, 0.5)";
    rotate = -6;
  } else if (cat.includes("audio") || cat.includes("headphone") || cat.includes("sound")) {
    icon = "🎧";
    glow = "rgba(6, 182, 212, 0.5)";
    rotate = 8;
  } else if (cat.includes("beauty") || cat.includes("personal") || cat.includes("cosmetic")) {
    icon = "💄";
    glow = "rgba(244, 114, 182, 0.5)";
    rotate = 10;
  } else if (cat.includes("grocery") || cat.includes("food") || cat.includes("dining")) {
    icon = "🛒";
    glow = "rgba(16, 185, 129, 0.5)";
    rotate = -6;
  } else if (cat.includes("home") || cat.includes("kitchen")) {
    icon = "🏠";
    glow = "rgba(245, 158, 11, 0.5)";
    rotate = 6;
  } else if (cat.includes("gaming") || cat.includes("game")) {
    icon = "🎮";
    glow = "rgba(168, 85, 247, 0.5)";
    rotate = 10;
  } else if (cat.includes("watch")) {
    icon = "⌚";
    glow = "rgba(14, 165, 233, 0.5)";
    rotate = -6;
  } else if (cat.includes("bank") || cat.includes("card") || cat.includes("credit")) {
    icon = "💳";
    glow = "rgba(59, 130, 246, 0.5)";
    rotate = -8;
  } else if (cat.includes("trick") || cat.includes("loot") || cat.includes("free")) {
    icon = "🎁";
    glow = "rgba(234, 179, 8, 0.6)";
    rotate = 12;
  }

  return (
    <motion.span
      className="inline-flex items-center justify-center select-none"
      style={{
        fontSize: size,
        filter: `drop-shadow(0 2px 6px ${glow})`,
      }}
      whileHover={{ scale: 1.25, rotate }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      {icon}
    </motion.span>
  );
}

// ─── 2. 3D Category Fallback Pedestal (Replaces Flat "NO MEDIA") ───────────────
export function Category3DPlaceholder({ category }: { category: string }) {
  const cat = (category || "").toLowerCase();

  let icon = "🛍️";
  let bgGradient = "from-slate-800/40 via-slate-900/60 to-black/80";
  let ringColor = "rgba(148, 163, 184, 0.25)";
  let glowColor = "rgba(148, 163, 184, 0.2)";

  if (cat.includes("fashion") || cat.includes("cloth") || cat.includes("apparel")) {
    icon = "👗";
    bgGradient = "from-rose-500/20 via-pink-900/30 to-black/80";
    ringColor = "rgba(244, 63, 94, 0.4)";
    glowColor = "rgba(244, 63, 94, 0.3)";
  } else if (cat.includes("footwear") || cat.includes("shoe")) {
    icon = "👟";
    bgGradient = "from-orange-500/20 via-amber-900/30 to-black/80";
    ringColor = "rgba(249, 115, 22, 0.4)";
    glowColor = "rgba(249, 115, 22, 0.3)";
  } else if (cat.includes("electronic") || cat.includes("phone") || cat.includes("tech")) {
    icon = "📱";
    bgGradient = "from-violet-500/20 via-purple-900/30 to-black/80";
    ringColor = "rgba(139, 92, 246, 0.4)";
    glowColor = "rgba(139, 92, 246, 0.3)";
  } else if (cat.includes("audio") || cat.includes("headphone") || cat.includes("sound")) {
    icon = "🎧";
    bgGradient = "from-cyan-500/20 via-blue-900/30 to-black/80";
    ringColor = "rgba(6, 182, 212, 0.4)";
    glowColor = "rgba(6, 182, 212, 0.3)";
  } else if (cat.includes("beauty") || cat.includes("personal") || cat.includes("cosmetic")) {
    icon = "💄";
    bgGradient = "from-pink-500/20 via-rose-900/30 to-black/80";
    ringColor = "rgba(236, 72, 153, 0.4)";
    glowColor = "rgba(236, 72, 153, 0.3)";
  } else if (cat.includes("grocery") || cat.includes("food") || cat.includes("dining")) {
    icon = "🛒";
    bgGradient = "from-emerald-500/20 via-teal-900/30 to-black/80";
    ringColor = "rgba(16, 185, 129, 0.4)";
    glowColor = "rgba(16, 185, 129, 0.3)";
  } else if (cat.includes("home") || cat.includes("kitchen")) {
    icon = "🏠";
    bgGradient = "from-amber-500/20 via-yellow-900/30 to-black/80";
    ringColor = "rgba(245, 158, 11, 0.4)";
    glowColor = "rgba(245, 158, 11, 0.3)";
  } else if (cat.includes("gaming") || cat.includes("game")) {
    icon = "🎮";
    bgGradient = "from-purple-500/20 via-indigo-900/30 to-black/80";
    ringColor = "rgba(168, 85, 247, 0.4)";
    glowColor = "rgba(168, 85, 247, 0.3)";
  } else if (cat.includes("trick") || cat.includes("loot") || cat.includes("free")) {
    icon = "🎁";
    bgGradient = "from-yellow-500/20 via-amber-900/30 to-black/80";
    ringColor = "rgba(234, 179, 8, 0.45)";
    glowColor = "rgba(234, 179, 8, 0.35)";
  }

  return (
    <div className={`w-full h-full relative flex flex-col items-center justify-center p-4 bg-gradient-to-b ${bgGradient} overflow-hidden select-none`}>
      {/* 3D Glass Pedestal */}
      <motion.div
        className="relative flex items-center justify-center w-20 h-20 rounded-3xl backdrop-blur-xl border"
        style={{
          borderColor: ringColor,
          boxShadow: `0 8px 32px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.15)`,
          background: "rgba(10, 14, 26, 0.65)",
        }}
        animate={{
          y: [0, -5, 0],
          rotateZ: [0, 2, -2, 0],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-4xl filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)]">{icon}</span>

        {/* Orbiting Sparkle */}
        <motion.span
          className="absolute -top-1.5 -right-1.5 text-xs filter drop-shadow-md"
          animate={{ scale: [1, 1.4, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          ✨
        </motion.span>
      </motion.div>

      {/* Floating Ground Shadow */}
      <motion.div
        className="w-16 h-2 rounded-full bg-black/60 blur-sm mt-3"
        animate={{ scale: [1, 0.85, 1], opacity: [0.6, 0.3, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-2 font-mono">
        {category || "Special Offer"}
      </span>
    </div>
  );
}

// ─── 3. 3D Store Brand Badges ────────────────────────────────────────────────
export function Store3DBadge({ store }: { store: string; size?: number }) {
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

// ─── 4. 3D Floating Nav / Sidebar Icons ───────────────────────────────────────
export function Nav3DIcon({ icon, active }: { icon: "review" | "broadcast" | "channels" | "settings"; active: boolean }) {
  const icons = {
    review: "🛒",
    broadcast: "🚀",
    channels: "📡",
    settings: "⚙️",
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

// ─── 5. 3D Stat Counter Pill ──────────────────────────────────────────────────
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
  const configs: Record<string, { icon: string; activeCls: string }> = {
    pending: {
      icon: "⏳",
      activeCls: "bg-amber-400/15 text-amber-200 border-amber-400/50 shadow-[0_0_18px_rgba(251,191,36,0.22)]",
    },
    approved: {
      icon: "✓",
      activeCls: "bg-emerald-400/15 text-emerald-200 border-emerald-400/50 shadow-[0_0_18px_rgba(52,211,153,0.22)]",
    },
    rejected: {
      icon: "✕",
      activeCls: "bg-slate-800/95 text-slate-200 border-white/30 shadow-md",
    },
    promos: {
      icon: "🎟️",
      activeCls: "bg-indigo-400/15 text-indigo-200 border-indigo-400/50 shadow-[0_0_18px_rgba(129,140,248,0.22)]",
    },
    all: {
      icon: "📦",
      activeCls: "bg-white/15 text-white border-white/30 shadow-md",
    },
  };

  const cfg = configs[id] || configs.all;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.04, y: -1 }}
      whileTap={{ scale: 0.96 }}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex-shrink-0 cursor-pointer ${
        active
          ? cfg.activeCls
          : "text-slate-400 hover:text-slate-200 border-white/5 hover:bg-white/5"
      }`}
    >
      <span className="text-[12px] filter drop-shadow-sm">{cfg.icon}</span>
      <span>{label}</span>
      <span
        className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold font-mono ${
          active ? "bg-black/40 text-white" : "bg-white/5 text-slate-400"
        }`}
      >
        {count}
      </span>
    </motion.button>
  );
}

// ─── 6. 3D Savings Pill ───────────────────────────────────────────────────────
export function SavingsPill3D({ amount }: { amount: number }) {
  if (!amount || amount <= 0) return null;
  return (
    <motion.div
      className="inline-flex items-center gap-1 text-[10.5px] font-black text-emerald-300 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 px-2 py-0.5 rounded-lg border border-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.25)] backdrop-blur-md select-none"
      whileHover={{ scale: 1.05, y: -1 }}
    >
      <span className="text-xs filter drop-shadow-[0_1px_3px_rgba(16,185,129,0.6)]">💰</span>
      <span>Save ₹{amount.toLocaleString("en-IN")}</span>
    </motion.div>
  );
}

// ─── 7. 3D Studio Wand for Edit Modal ─────────────────────────────────────────
export function StudioWand3D({ size = 32 }: { size?: number }) {
  return (
    <motion.div
      className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/25 to-pink-500/25 border border-indigo-400/40 backdrop-blur-xl shadow-[0_0_18px_rgba(99,102,241,0.35)]"
      style={{ width: size, height: size }}
      animate={{ rotate: [0, 4, -4, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <span className="text-base filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">🪄</span>
      <motion.span
        className="absolute -top-1 -right-1 text-[10px]"
        animate={{ scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      >
        ✨
      </motion.span>
    </motion.div>
  );
}

// ─── 8. 3D "All Caught Up" Celebration State ──────────────────────────────────
export function AllCaughtUp3D({ onRefresh }: { onRefresh?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-8 sm:p-12 text-center max-w-md mx-auto my-auto"
    >
      <div className="relative w-28 h-28 flex items-center justify-center mb-4">
        {/* 3D Glowing Trophy */}
        <motion.div
          className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400/25 via-orange-500/20 to-purple-600/20 border border-amber-400/40 flex items-center justify-center backdrop-blur-xl shadow-[0_16px_40px_rgba(245,158,11,0.3)]"
          animate={{ y: [0, -6, 0], rotateZ: [0, 3, -3, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-5xl filter drop-shadow-[0_8px_20px_rgba(245,158,11,0.6)]">🏆</span>

          <motion.div
            className="absolute -top-2 -right-2 text-lg"
            animate={{ scale: [1, 1.4, 1], rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            ✨
          </motion.div>
          <motion.div
            className="absolute -bottom-1 -left-1 text-sm"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          >
            🎉
          </motion.div>
        </motion.div>

        {/* Ambient Ground Shadow */}
        <motion.div
          className="absolute bottom-1 w-20 h-3 rounded-full bg-black/50 blur-md"
          animate={{ scale: [1, 0.8, 1], opacity: [0.6, 0.3, 0.6] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <h3 className="text-lg font-black text-white tracking-tight">
        You're All Caught Up!
      </h3>
      <p className="text-xs text-slate-400 mt-1.5 max-w-xs leading-relaxed">
        Zero pending deals in queue. Background workers are actively monitoring 27 channels for price drops.
      </p>

      {onRefresh && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRefresh}
          className="mt-5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600/80 hover:bg-indigo-500 border border-indigo-400/30 shadow-lg shadow-indigo-500/25 flex items-center gap-2 cursor-pointer transition-all"
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
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-8 sm:p-12 text-center max-w-md mx-auto my-auto"
    >
      <div className="relative w-28 h-28 flex items-center justify-center mb-3">
        <motion.div
          className="w-20 h-20 rounded-3xl bg-slate-900/90 border border-white/15 flex items-center justify-center backdrop-blur-xl shadow-2xl"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-4xl filter drop-shadow-md">🔍</span>
          <motion.span
            className="absolute -top-1 -right-1 text-sm"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ⚡
          </motion.span>
        </motion.div>

        <motion.div
          className="absolute bottom-1 w-16 h-3 rounded-full bg-black/40 blur-md"
          animate={{ scale: [1, 0.8, 1], opacity: [0.6, 0.3, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <h3 className="text-sm font-bold text-white tracking-tight">
        No Matching Deals Found
      </h3>
      <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
        Try adjusting your store or channel filters, or search for different keywords.
      </p>

      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
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
