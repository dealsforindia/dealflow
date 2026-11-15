"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";

export type SkyMode = "dawn" | "morn" | "day" | "dusk" | "night";

export interface KolkataRooftopStageProps {
  currentHour: number;
  activeSection: number; // 0 to 4
}

export function modeForHour(h: number): { mode: SkyMode; note: string } {
  if (h < 5) return { mode: "night", note: "after midnight" };
  if (h < 6.6) return { mode: "dawn", note: "first light" };
  if (h < 10) return { mode: "morn", note: "morning" };
  if (h < 16) return { mode: "day", note: "midday" };
  if (h < 18) return { mode: "dusk", note: "near sunset" };
  return { mode: "night", note: "after dark" };
}

export function KolkataRooftopStage({ currentHour, activeSection }: KolkataRooftopStageProps) {
  const [pinnedCount, setPinnedCount] = useState<number>(0);
  const [heroX, setHeroX] = useState<number>(713);
  const [isWalking, setIsWalking] = useState<boolean>(false);
  const [scrollY, setScrollY] = useState<number>(0);
  const busyRef = useRef<boolean>(false);

  const { mode } = useMemo(() => modeForHour(currentHour), [currentHour]);

  // Generate 90 deterministic stars
  const stars = useMemo(() => {
    return Array.from({ length: 90 }, (_, i) => {
      const left = ((i * 37) % 100) + ((i * 7) % 3) * 0.3;
      const top = ((i * 19) % 55) + ((i * 3) % 2) * 0.4;
      const delay = (i % 15) * 0.23;
      const isBig = i % 4 === 0;
      return { id: i, left: `${left}vw`, top: `${top}vh`, delay: `${delay}s`, size: isBig ? "3px" : "2px" };
    });
  }, []);

  // Parallax on scroll
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hero walk & easel pinning choreography
  useEffect(() => {
    if (activeSection <= pinnedCount || busyRef.current) return;

    busyRef.current = true;
    setHeroX(1078);
    setIsWalking(true);

    const walkTimer = window.setTimeout(() => {
      setIsWalking(false);
      setPinnedCount(activeSection);

      const returnTimer = window.setTimeout(() => {
        setHeroX(713);
        setIsWalking(true);

        const endTimer = window.setTimeout(() => {
          setIsWalking(false);
          busyRef.current = false;
        }, 3000);

        return () => window.clearTimeout(endTimer);
      }, 1000);

      return () => window.clearTimeout(returnTimer);
    }, 2800);

    return () => window.clearTimeout(walkTimer);
  }, [activeSection, pinnedCount]);

  // Celestial trajectory math
  const celestialStyle = useMemo(() => {
    let leftVw: number;
    let topVh: number;
    let opacity = 1;

    if (mode === "night") {
      const t = currentHour >= 18.5 ? (currentHour - 18.5) / 11 : (currentHour + 5.5) / 11;
      const clamped = Math.min(1, Math.max(0, t));
      leftVw = 68 - clamped * 50;
      topVh = 12 + clamped * 5;
    } else {
      const t = Math.min(1, Math.max(0, (currentHour - 6.6) / 11));
      leftVw = 6 + t * 88;
      topVh = 68 - Math.sin(t * Math.PI) * 54;
      if (mode === "dawn") {
        topVh = 62 - t * 30;
        opacity = 0.85;
      } else if (mode === "dusk") {
        topVh = 30 + t * 32;
        opacity = 0.85;
      }
    }

    return {
      left: `${leftVw}vw`,
      top: `${topVh}vh`,
      opacity,
    };
  }, [currentHour, mode]);

  // Mode color palette
  const skyTheme = useMemo(() => {
    switch (mode) {
      case "dawn":
        return { skyA: "#2A2140", skyB: "#C97A52", stars: 0.35, lit: 0.55 };
      case "morn":
        return { skyA: "#BFD3DD", skyB: "#EFE7CE", stars: 0, lit: 0 };
      case "day":
        return { skyA: "#CFE0E6", skyB: "#F2ECDA", stars: 0, lit: 0 };
      case "dusk":
        return { skyA: "#7A4E63", skyB: "#E5895A", stars: 0.25, lit: 0.5 };
      case "night":
      default:
        return { skyA: "#0B0E1F", skyB: "#1A1433", stars: 1, lit: 1 };
    }
  }, [mode]);

  return (
    <>
      {/* Dynamic Sky Gradient */}
      <div
        className="fixed inset-0 -z-30 pointer-events-none transition-colors duration-1000"
        style={{
          background: `linear-gradient(to bottom, ${skyTheme.skyA} 0%, ${skyTheme.skyB} 74%)`,
        }}
      />

      {/* Twinkling Stars (visible when stars > 0) */}
      <div
        className="fixed inset-0 -z-20 pointer-events-none transition-opacity duration-1000"
        style={{ opacity: skyTheme.stars }}
        aria-hidden="true"
      >
        {stars.map((s) => (
          <i
            key={s.id}
            className="absolute rounded-full bg-[#F6EFDC] animate-pulse"
            style={{
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              animationDelay: s.delay,
              animationDuration: "3.4s",
            }}
          />
        ))}
      </div>

      {/* Celestial Body: Sun or Moon */}
      <div
        className="fixed -z-20 w-[72px] h-[72px] pointer-events-none transition-all duration-700"
        style={celestialStyle}
        aria-hidden="true"
      >
        {mode === "night" ? (
          // Moon Face
          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-[#FFFEF8] via-[#E2DCcb] to-[#AFA998] shadow-[0_0_30px_9px_rgba(236,240,255,0.2),inset_-12px_-8px_20px_rgba(26,24,44,0.5)] overflow-hidden">
            <span className="absolute w-3 h-3 rounded-full bg-slate-400/30 top-[24%] left-[50%]" />
            <span className="absolute w-2 h-2 rounded-full bg-slate-400/30 top-[58%] left-[31%]" />
            <span className="absolute w-1.5 h-1.5 rounded-full bg-slate-400/30 top-[44%] left-[24%]" />
            <span className="absolute w-2.5 h-2.5 rounded-full bg-slate-400/30 top-[68%] left-[57%]" />
          </div>
        ) : (
          // Sun Face
          <div className="relative w-full h-full rounded-full bg-radial from-[#FFF7E4] via-[#F8D28C] to-[#D98B34] shadow-[0_0_60px_22px_rgba(255,214,150,0.35)]" />
        )}
      </div>

      {/* Kolkata Rooftop Stage SVG */}
      <div className="fixed left-0 right-0 bottom-0 -z-10 pointer-events-none">
        <svg
          viewBox="0 150 1440 300"
          preserveAspectRatio="xMidYMax slice"
          className="w-full h-[min(36vh,330px)] block"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="tankShade" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#8FD8DC" />
              <stop offset="0.52" stopColor="#2AA5A0" />
              <stop offset="1" stopColor="#17706D" />
            </linearGradient>
            <linearGradient id="sariShade" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#C9463A" />
              <stop offset="0.6" stopColor="#A32E24" />
              <stop offset="1" stopColor="#7E2119" />
            </linearGradient>
          </defs>

          {/* Far City Skyline with Scroll Parallax */}
          <g
            className="fill-[#14110D] opacity-30 transition-transform duration-75"
            style={{ transform: `translateY(${scrollY * -0.03}px)` }}
          >
            <path d="M0 300 V238 h55 v-22 h30 v40 h25 V196 h48 v70 h20 V216 h60 v50 h35 V176 h44 v90 h26 V236 h64 v30 h40 V206 h52 v60 h30 V188 h70 v78 h24 V224 h48 v42 h66 V172 h40 v94 h34 V212 h58 v54 h22 V196 h66 v70 h34 V232 h50 v34 h340 V220 h48 v46 h28 V184 h52 v82 h24 V228 h60 v38 h120 V240 h36 v26 h195 V214 h50 v52 h35 V230 h44 v36 h296 V226 h44 v40 h50 V210 h56 v56 h20 V238 h44 v28 h130 Z" />
          </g>

          {/* Midground Rooftop Antennas */}
          <g className="fill-[#14110D] opacity-55">
            <rect x="570" y="120" width="3" height="100" />
            <path d="M573 122 h64 l-6 8 h-52 Z" />
            <rect x="880" y="132" width="3" height="90" />
            <path d="M883 134 h52 l-5 7 h-43 Z" />
          </g>

          {/* Glowing City Windows (Lit in Night / Dusk) */}
          <g style={{ opacity: skyTheme.lit }} className="fill-[#F4C97B] transition-opacity duration-1000">
            <rect x="668" y="256" width="10" height="14" />
            <rect x="690" y="262" width="8" height="10" />
            <rect x="1180" y="248" width="9" height="12" />
            <rect x="1197" y="256" width="7" height="10" />
            <rect x="102" y="258" width="9" height="12" />
            <rect x="117" y="263" width="7" height="9" />
            <rect x="932" y="252" width="8" height="10" />
            <rect x="946" y="260" width="6" height="8" />
          </g>

          {/* Rooftop Parapet Wall Base */}
          <rect x="0" y="300" width="1440" height="124" className="fill-[#14110D]" />
          <rect x="0" y="300" width="1440" height="3" fill="#C08A2E" opacity="0.55" />

          {/* Water Tank */}
          <g id="water-tank" className="stroke-[#14110D] stroke-[2px]">
            <path d="M160 246 v54 M216 246 v54 M160 284 l56 -22 M216 284 l-56 -22" fill="none" />
            <rect x="146" y="194" width="82" height="54" rx="7" fill="url(#tankShade)" />
            <ellipse cx="187" cy="194" rx="41" ry="7" fill="#F6F1E6" />
            <ellipse cx="187" cy="189" rx="20" ry="4" fill="#EFE6D2" strokeWidth="1.4" />
            <text x="156" y="229" fontFamily="monospace" fontSize="8" letterSpacing="2" fill="#14110D" opacity="0.45">
              N!S
            </text>
          </g>

          {/* Clothesline with Swaying Garments */}
          <g id="clothesline" className="stroke-[#14110D]">
            <path d="M548 300 V198 M972 300 V198" strokeWidth="2" fill="none" />
            <path d="M548 206 Q760 234 972 208" fill="none" strokeWidth="1.6" />

            {/* Red Festive Sari */}
            <g className="origin-top animate-[spin_6s_ease-in-out_infinite_alternate]" style={{ transformOrigin: "620px 214px" }}>
              <path d="M620 214 q-16 46 -6 70 q14 10 34 2 q-8 -34 -4 -40 q6 -16 -4 -32 Z" fill="url(#sariShade)" strokeWidth="2" />
              <path d="M620 214 q-16 46 -6 70" stroke="#C08A2E" strokeWidth="3.5" fill="none" />
            </g>

            {/* Cream Shirt */}
            <g className="origin-top animate-[spin_5s_ease-in-out_infinite_alternate]" style={{ transformOrigin: "694px 216px" }}>
              <path d="M694 216 q-10 34 -4 54 q16 6 28 0 q4 -24 0 -54 Z" fill="#EFE6D2" strokeWidth="2" />
              <path d="M702 222 h10 l-5 6 Z" fill="#F26522" />
            </g>

            {/* Teal Towel */}
            <g className="origin-top animate-[spin_7s_ease-in-out_infinite_alternate]" style={{ transformOrigin: "844px 214px" }}>
              <path d="M844 214 q-8 34 -2 50 q18 5 26 -2 q-6 -24 -2 -48 Z" fill="#7FD4DB" strokeWidth="2" />
              <path d="M842 238 h28 M842 252 h28" stroke="#2AA5A0" strokeWidth="2" />
            </g>
          </g>

          {/* Easel Board with Pinned Proof Sheets */}
          <g id="easel" className="stroke-[#14110D]">
            <path d="M1183 232 v68" opacity="0.4" fill="none" strokeWidth="2" />
            <path d="M1118 300 L1170 214 M1248 300 L1196 214" strokeWidth="2" fill="none" />
            <rect x="1122" y="220" width="122" height="80" fill="#F6F1E6" strokeWidth="2" />
            <rect x="1128" y="226" width="110" height="68" fill="#EFE6D2" strokeOpacity="0.22" />

            {/* Sheet 1: Durga Campaign */}
            <g
              className={`transition-all duration-500 origin-bottom ${pinnedCount >= 1 ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}
            >
              <rect x="1136" y="232" width="30" height="40" fill="#F26522" stroke="#14110D" strokeWidth="1.2" />
              <circle cx="1151" cy="230" r="2" fill="#C08A2E" />
            </g>

            {/* Sheet 2: Gill Travels Fare */}
            <g
              className={`transition-all duration-500 origin-bottom ${pinnedCount >= 2 ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}
            >
              <rect x="1170" y="232" width="30" height="40" fill="#2AA5A0" stroke="#14110D" strokeWidth="1.2" />
              <circle cx="1185" cy="246" r="7" fill="#F6F1E6" opacity="0.85" />
              <circle cx="1185" cy="230" r="2" fill="#C08A2E" />
            </g>

            {/* Sheet 3: Event Poster */}
            <g
              className={`transition-all duration-500 origin-bottom ${pinnedCount >= 3 ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}
            >
              <rect x="1204" y="232" width="30" height="40" fill="#14110D" stroke="#14110D" strokeWidth="1.2" />
              <circle cx="1219" cy="230" r="2" fill="#C08A2E" />
            </g>

            {/* Sheet 4: Vector Tiger */}
            <g
              className={`transition-all duration-500 origin-bottom ${pinnedCount >= 4 ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}
            >
              <rect x="1136" y="278" width="60" height="12" fill="#C08A2E" stroke="#14110D" strokeWidth="1.2" />
            </g>
          </g>

          {/* Computer Desk + Workstation */}
          <g id="workstation">
            <ellipse cx="766" cy="218" rx="60" ry="44" fill="#F4C97B" opacity="0.16" />
            <rect x="694" y="250" width="162" height="8" rx="2" fill="#C08A2E" stroke="#14110D" strokeWidth="2" />
            <path d="M706 258 v42 M844 258 v42" stroke="#14110D" strokeWidth="1.4" fill="none" />

            {/* Monitor */}
            <rect x="726" y="188" width="80" height="62" rx="5" fill="#EFE6D2" stroke="#14110D" strokeWidth="2" />
            <rect x="734" y="196" width="64" height="42" fill="#1A1433" stroke="#14110D" strokeWidth="1.5" />
            <rect x="738" y="200" width="20" height="28" fill="#F26522" />
            <rect x="762" y="218" width="32" height="14" fill="#2AA5A0" />
            <rect x="748" y="256" width="36" height="3" fill="#EFE6D2" />
          </g>

          {/* Hero Character (Nilotpal) */}
          <g
            id="hero-character"
            style={{
              transform: `translate(${heroX}px, 182px)`,
              transition: "transform 3s cubic-bezier(0.45, 0.05, 0.35, 1)",
            }}
          >
            <ellipse cx="0" cy="2" rx="28" ry="4" fill="#14110D" opacity="0.26" />
            <g className={isWalking ? "animate-[bounce_0.5s_infinite]" : ""}>
              {/* Legs */}
              <path d="M-8 78 l-3 38 h10 l3 -36 Z" fill="#14110D" stroke="#14110D" strokeWidth="2" />
              <path d="M8 78 l4 38 h10 l-5 -38 Z" fill="#14110D" stroke="#14110D" strokeWidth="2" />

              {/* Shirt & Torso */}
              <path d="M-12 48 q12 -8 26 0 l3 31 q-16 6 -32 0 Z" fill="#2A2250" stroke="#14110D" strokeWidth="2" />

              {/* Head & Hair */}
              <circle cx="8" cy="31" r="11" fill="#C48B63" stroke="#14110D" strokeWidth="1.4" />
              <path d="M-3 31 q-3 -17 11 -18 q14 -2 14 14 q-6 -5 -12 -3 q-7 1 -13 7 Z" fill="#14110D" />
            </g>
          </g>

          {/* Animated Black Cat on Parapet */}
          <g id="cat-animation" className="animate-[pulse_8s_ease-in-out_infinite]">
            <g transform="translate(660, 300)">
              <ellipse cx="0" cy="0" rx="26" ry="3" fill="#14110D" opacity="0.22" />
              <path d="M16 -16 q16 -10 14 2 q-1 8 -8 10" fill="none" stroke="#14110D" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M-18 -12 q-4 -14 10 -16 l18 0 q10 2 8 14 q-2 12 -16 13 q-16 1 -20 -11 Z" fill="#F26522" stroke="#14110D" strokeWidth="2" />
              <circle cx="-22" cy="-24" r="8" fill="#F26522" stroke="#14110D" strokeWidth="2" />
              <path d="M-28 -30 l-2 -7 l7 4 Z M-17 -31 l2 -7 l5 5 Z" fill="#F26522" stroke="#14110D" strokeWidth="2" />
            </g>
          </g>
        </svg>
      </div>
    </>
  );
}
