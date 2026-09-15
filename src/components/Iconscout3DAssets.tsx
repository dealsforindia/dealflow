import React from 'react';
import { motion } from 'motion/react';

// ─── 1. High-Fidelity 3D Category & Store Icons ───────────────────────────────
export function Category3DIcon({ category, size = 16 }: { category: string; size?: number }) {
  const cat = (category || '').toLowerCase();

  let icon = '🛍️';
  let glow = 'rgba(100, 116, 139, 0.4)';
  let rotate = 0;

  if (cat.includes('fashion') || cat.includes('cloth') || cat.includes('apparel')) {
    icon = '👗';
    glow = 'rgba(244, 63, 94, 0.5)';
    rotate = 8;
  } else if (cat.includes('footwear') || cat.includes('shoe')) {
    icon = '👟';
    glow = 'rgba(249, 115, 22, 0.5)';
    rotate = -8;
  } else if (cat.includes('electronic') || cat.includes('phone') || cat.includes('tech')) {
    icon = '📱';
    glow = 'rgba(139, 92, 246, 0.5)';
    rotate = -6;
  } else if (cat.includes('audio') || cat.includes('headphone') || cat.includes('sound')) {
    icon = '🎧';
    glow = 'rgba(6, 182, 212, 0.5)';
    rotate = 8;
  } else if (cat.includes('beauty') || cat.includes('personal') || cat.includes('cosmetic')) {
    icon = '💄';
    glow = 'rgba(244, 114, 182, 0.5)';
    rotate = 10;
  } else if (cat.includes('grocery') || cat.includes('food') || cat.includes('dining')) {
    icon = '🛒';
    glow = 'rgba(16, 185, 129, 0.5)';
    rotate = -6;
  } else if (cat.includes('home') || cat.includes('kitchen')) {
    icon = '🏠';
    glow = 'rgba(245, 158, 11, 0.5)';
    rotate = 6;
  } else if (cat.includes('gaming') || cat.includes('game')) {
    icon = '🎮';
    glow = 'rgba(168, 85, 247, 0.5)';
    rotate = 10;
  } else if (cat.includes('watch')) {
    icon = '⌚';
    glow = 'rgba(14, 165, 233, 0.5)';
    rotate = -6;
  } else if (cat.includes('luggage') || cat.includes('travel') || cat.includes('bag')) {
    icon = '🧳';
    glow = 'rgba(59, 130, 246, 0.5)';
    rotate = -8;
  } else if (cat.includes('loot') || cat.includes('free')) {
    icon = '🎁';
    glow = 'rgba(234, 179, 8, 0.6)';
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
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
    >
      {icon}
    </motion.span>
  );
}

// ─── 2. 3D Category Fallback Pedestal (Replaces Broken/Empty Images) ─────────
export function Category3DPlaceholder({ category }: { category: string }) {
  const cat = (category || '').toLowerCase();

  let icon = '🛍️';
  let bgGradient = 'from-slate-800/40 via-slate-900/60 to-black/80';
  let ringColor = 'rgba(148, 163, 184, 0.25)';
  let glowColor = 'rgba(148, 163, 184, 0.2)';

  if (cat.includes('fashion') || cat.includes('cloth') || cat.includes('apparel')) {
    icon = '👗';
    bgGradient = 'from-rose-500/20 via-pink-900/30 to-black/80';
    ringColor = 'rgba(244, 63, 94, 0.4)';
    glowColor = 'rgba(244, 63, 94, 0.3)';
  } else if (cat.includes('footwear') || cat.includes('shoe')) {
    icon = '👟';
    bgGradient = 'from-orange-500/20 via-amber-900/30 to-black/80';
    ringColor = 'rgba(249, 115, 22, 0.4)';
    glowColor = 'rgba(249, 115, 22, 0.3)';
  } else if (cat.includes('electronic') || cat.includes('phone') || cat.includes('tech')) {
    icon = '📱';
    bgGradient = 'from-violet-500/20 via-purple-900/30 to-black/80';
    ringColor = 'rgba(139, 92, 246, 0.4)';
    glowColor = 'rgba(139, 92, 246, 0.3)';
  } else if (cat.includes('audio') || cat.includes('headphone') || cat.includes('sound')) {
    icon = '🎧';
    bgGradient = 'from-cyan-500/20 via-blue-900/30 to-black/80';
    ringColor = 'rgba(6, 182, 212, 0.4)';
    glowColor = 'rgba(6, 182, 212, 0.3)';
  } else if (cat.includes('luggage') || cat.includes('travel')) {
    icon = '🧳';
    bgGradient = 'from-blue-500/20 via-indigo-900/30 to-black/80';
    ringColor = 'rgba(59, 130, 246, 0.4)';
    glowColor = 'rgba(59, 130, 246, 0.3)';
  }

  return (
    <div
      className={`relative w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b ${bgGradient} overflow-hidden rounded-xl`}
    >
      <motion.div
        className="relative z-10 flex items-center justify-center w-20 h-20 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl shadow-2xl"
        animate={{ y: [0, -6, 0], rotateZ: [0, 2, -2, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span
          className="text-4xl filter select-none"
          style={{ filter: `drop-shadow(0 6px 16px ${glowColor})` }}
        >
          {icon}
        </span>
      </motion.div>

      {/* Ground Shadow */}
      <motion.div
        className="absolute bottom-6 w-14 h-2 rounded-full bg-black/70 blur-sm"
        animate={{ scale: [1, 0.75, 1], opacity: [0.6, 0.3, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

// ─── 3. 3D Store Brand Badges ────────────────────────────────────────────────
export function Store3DBadge({ store }: { store: string }) {
  const s = (store || '').toLowerCase();

  if (s.includes('amazon') || s.includes('amzn')) {
    return (
      <motion.div
        whileHover={{ scale: 1.08, y: -1 }}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/25 via-amber-600/20 to-orange-500/25 border border-amber-400/40 text-amber-300 backdrop-blur-xl shadow-[0_4px_12px_rgba(245,158,11,0.2)]"
      >
        <span className="text-xs filter drop-shadow-[0_2px_4px_rgba(245,158,11,0.6)]">📦</span>
        <span className="text-[11px] font-black tracking-tight drop-shadow-sm">Amazon</span>
      </motion.div>
    );
  }
  if (s.includes('flipkart') || s.includes('fkrt') || s.includes('shopsy')) {
    return (
      <motion.div
        whileHover={{ scale: 1.08, y: -1 }}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-blue-500/25 via-blue-600/20 to-cyan-500/25 border border-blue-400/40 text-blue-300 backdrop-blur-xl shadow-[0_4px_12px_rgba(59,130,246,0.2)]"
      >
        <span className="text-xs filter drop-shadow-[0_2px_4px_rgba(59,130,246,0.6)]">🛍️</span>
        <span className="text-[11px] font-black tracking-tight drop-shadow-sm">Flipkart</span>
      </motion.div>
    );
  }
  if (s.includes('myntra')) {
    return (
      <motion.div
        whileHover={{ scale: 1.08, y: -1 }}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-pink-500/25 via-rose-600/20 to-pink-500/25 border border-pink-400/40 text-pink-300 backdrop-blur-xl shadow-[0_4px_12px_rgba(244,63,94,0.2)]"
      >
        <span className="text-xs filter drop-shadow-[0_2px_4px_rgba(244,63,94,0.6)]">👗</span>
        <span className="text-[11px] font-black tracking-tight drop-shadow-sm">Myntra</span>
      </motion.div>
    );
  }
  if (s.includes('ajio')) {
    return (
      <motion.div
        whileHover={{ scale: 1.08, y: -1 }}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-purple-500/25 via-indigo-600/20 to-purple-500/25 border border-purple-400/40 text-purple-300 backdrop-blur-xl shadow-[0_4px_12px_rgba(168,85,247,0.2)]"
      >
        <span className="text-xs filter drop-shadow-[0_2px_4px_rgba(168,85,247,0.6)]">✨</span>
        <span className="text-[11px] font-black tracking-tight drop-shadow-sm">AJIO</span>
      </motion.div>
    );
  }
  if (s.includes('swiggy') || s.includes('instamart')) {
    return (
      <motion.div
        whileHover={{ scale: 1.08, y: -1 }}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-orange-500/25 via-amber-600/20 to-orange-500/25 border border-orange-400/40 text-orange-300 backdrop-blur-xl shadow-sm"
      >
        <span className="text-xs filter drop-shadow-[0_2px_4px_rgba(249,115,22,0.5)]">⚡</span>
        <span className="text-[11px] font-black tracking-tight">Swiggy</span>
      </motion.div>
    );
  }
  if (s.includes('desidime')) {
    return (
      <motion.div
        whileHover={{ scale: 1.08, y: -1 }}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-red-500/25 via-orange-600/20 to-red-500/25 border border-red-400/40 text-red-300 backdrop-blur-xl shadow-[0_4px_12px_rgba(239,68,68,0.25)]"
      >
        <span className="text-xs filter drop-shadow-[0_2px_4px_rgba(239,68,68,0.6)]">🔥</span>
        <span className="text-[11px] font-black tracking-tight drop-shadow-sm">DesiDime</span>
      </motion.div>
    );
  }
  if (s.includes('croma')) {
    return (
      <motion.div
        whileHover={{ scale: 1.08, y: -1 }}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-teal-500/25 via-cyan-600/20 to-teal-500/25 border border-teal-400/40 text-teal-300 backdrop-blur-xl shadow-sm"
      >
        <span className="text-xs filter drop-shadow-[0_2px_4px_rgba(20,184,166,0.5)]">📺</span>
        <span className="text-[11px] font-black tracking-tight">Croma</span>
      </motion.div>
    );
  }

  const clean = store && store.toLowerCase() !== 'other' ? store : 'Verified Store';
  return (
    <motion.div
      whileHover={{ scale: 1.08, y: -1 }}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-600/40 text-slate-300 backdrop-blur-xl shadow-sm"
    >
      <span className="text-xs">🛒</span>
      <span className="text-[11px] font-black tracking-tight">{clean}</span>
    </motion.div>
  );
}

// ─── 4. 3D Savings Pill ───────────────────────────────────────────────────────
export function SavingsPill3D({ amount }: { amount: number }) {
  if (!amount || amount <= 0) return null;
  return (
    <motion.div
      className="inline-flex items-center gap-1 text-[10.5px] font-black text-emerald-300 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 px-2 py-0.5 rounded-lg border border-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.25)] backdrop-blur-md select-none"
      whileHover={{ scale: 1.05, y: -1 }}
    >
      <span className="text-xs filter drop-shadow-[0_1px_3px_rgba(16,185,129,0.6)]">💰</span>
      <span>Save ₹{amount.toLocaleString('en-IN')}</span>
    </motion.div>
  );
}

// ─── 5. 3D Floating Shopping Cart ─────────────────────────────────────────────
export function FloatingCart3D({ size = 48 }: { size?: number }) {
  return (
    <motion.div
      className="relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-3 border border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.3)] backdrop-blur-xl"
      style={{ width: size, height: size }}
      animate={{ y: [0, -5, 0], rotateZ: [0, 3, -3, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <span className="text-2xl filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.5)]">🛒</span>
      <motion.div
        className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10B981] border-2 border-[#08090C]"
        animate={{ scale: [1, 1.35, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}

// ─── 6. 3D Empty Filter State ─────────────────────────────────────────────────
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
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
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
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <h3 className="text-base font-black text-white tracking-tight font-['Outfit']">
        No Matching Deals Found
      </h3>
      <p className="text-xs text-gray-400 mt-1 max-w-xs leading-relaxed">
        Try adjusting your store or category filters, or search for different keywords.
      </p>

      {onClear && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={onClear}
          className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 transition-all cursor-pointer"
        >
          Reset All Filters
        </motion.button>
      )}
    </motion.div>
  );
}
