import { motion } from "motion/react";
import confetti from "canvas-confetti";

// ─── 1. Confetti Burst on Approval ────────────────────────────────────────────
export const triggerApproveConfetti = () => {
  confetti({
    particleCount: 45,
    spread: 60,
    origin: { y: 0.85, x: 0.5 },
    colors: ["#10B981", "#3B82F6", "#F43F5E", "#F59E0B", "#8B5CF6"],
    ticks: 120,
    gravity: 1.2,
    scalar: 0.85,
    shapes: ["circle", "square"],
  });
};

// ─── 2. 3D Live Engine Radar ──────────────────────────────────────────────────
export function LiveRadar3D({ size = 20 }: { size?: number }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer 3D Pulse Ring */}
      <motion.div
        className="absolute inset-0 rounded-full border border-emerald-400/40"
        animate={{ scale: [1, 1.8, 1], opacity: [0.8, 0, 0.8] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Middle Rotating Aura */}
      <motion.div
        className="absolute inset-1 rounded-full border border-emerald-500/60 border-t-transparent"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
      {/* Center Radiant Core */}
      <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#10B981]" />
    </div>
  );
}

// ─── 3. 3D Hot Loot Flame ─────────────────────────────────────────────────────
export function FireFlame3D({ size = 18 }: { size?: number }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <motion.svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full filter drop-shadow-[0_0_8px_rgba(244,63,94,0.7)]"
        animate={{
          scale: [1, 1.08, 0.96, 1.05, 1],
          rotate: [-2, 3, -1, 2, -2],
        }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          <linearGradient id="flameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#F43F5E" />
            <stop offset="50%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#FDE047" />
          </linearGradient>
        </defs>
        <path
          d="M12 2C10.5 4.5 9 6.5 9 9C9 10.5 10 11.5 11 12C9 12 7 13.5 7 16C7 19 9.5 21.5 12.5 21.5C16 21.5 18 19 18 15C18 11.5 15.5 8 15.5 8C15.5 8 15 10 13.5 10.5C13.5 9 14 5 12 2Z"
          fill="url(#flameGrad)"
        />
      </motion.svg>
    </div>
  );
}

// ─── 4. 3D Rocket Broadcast Icon ──────────────────────────────────────────────
export function RocketBroadcast3D({ size = 20 }: { size?: number }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <motion.div
        animate={{ y: [-1, -3, -1], x: [0, 1, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-emerald-400 drop-shadow-[0_0_6px_#10B981]">
          <path
            d="M4.5 16.5C3.5 18.5 3 21 3 21C3 21 5.5 20.5 7.5 19.5L12 15L9 12L4.5 16.5Z"
            fill="#34D399"
          />
          <path
            d="M15 3C15 3 9 5 7.5 10.5C6.5 14 9 16.5 9 16.5C9 16.5 11.5 19 15 18C20.5 16.5 22.5 10.5 22.5 10.5C22.5 10.5 21 8.5 18 6L15 3Z"
            fill="url(#rocketGrad)"
          />
          <circle cx="15.5" cy="9.5" r="1.5" fill="#047857" />
          <defs>
            <linearGradient id="rocketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6EE7B7" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
    </div>
  );
}

// ─── 5. 3D Isometric Empty Search State ───────────────────────────────────────
export function EmptySearch3D() {
  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      {/* Floating 3D Box */}
      <motion.div
        className="w-24 h-24 rounded-3xl glass-panel border border-primary/30 flex items-center justify-center relative shadow-[0_0_40px_rgba(244,63,94,0.15)]"
        animate={{ y: [0, -8, 0], rotateZ: [0, 2, -2, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-4xl filter drop-shadow-lg">🔍</span>

        {/* Orbiting Sparkles */}
        <motion.div
          className="absolute -top-2 -right-2 text-base"
          animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          ✨
        </motion.div>
        <motion.div
          className="absolute -bottom-2 -left-2 text-sm"
          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          ⚡
        </motion.div>
      </motion.div>

      {/* Floating Shadow Below */}
      <motion.div
        className="absolute bottom-2 w-20 h-4 rounded-full bg-black/40 blur-md"
        animate={{ scale: [1, 0.8, 1], opacity: [0.6, 0.3, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
