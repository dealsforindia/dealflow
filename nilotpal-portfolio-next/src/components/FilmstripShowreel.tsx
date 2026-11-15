"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";

interface Reel {
  id: string;
  title: string;
  client: string;
  role: string;
  src: string;
}

const REELS: Reel[] = [
  {
    id: "showreel",
    title: "Commercial showreel",
    client: "Selected clients, 2024–25",
    role: "Edit · Grade",
    src: "/videos/commercial_showreel_60fps.mp4",
  },
  {
    id: "automotive",
    title: "Hyperion GT reveal",
    client: "Automotive",
    role: "Edit · Sound design",
    src: "/videos/automotive_commercial_cut.mp4",
  },
  {
    id: "fashion",
    title: "Runway editorial",
    client: "Fashion",
    role: "Edit · Grade",
    src: "/videos/fashion_editorial_120fps.mp4",
  },
  {
    id: "saas",
    title: "B2B SaaS launch",
    client: "Hykez Technology",
    role: "Edit · Motion graphics",
    src: "/videos/b2b_saas_launch_anthem.mp4",
  },
  {
    id: "typography",
    title: "Kinetic type study",
    client: "Personal",
    role: "Motion graphics",
    src: "/videos/kinetic_typography_reel.mp4",
  },
  {
    id: "character",
    title: "Character walk cycle",
    client: "Arena Animation",
    role: "3D · Maya",
    src: "/videos/3d_arena_character_walk.mp4",
  },
];

export function FilmstripShowreel() {
  const [activeId, setActiveId] = useState(REELS[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const active = REELS.find((r) => r.id === activeId) ?? REELS[0];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    if (isPlaying) {
      video.play().catch(() => setIsPlaying(false));
    }
    // Only reset the playhead when a different clip is chosen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <section className="max-w-[1280px] mx-auto mb-24 px-6 scroll-mt-28" id="showreel">
      <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
        Reel
      </h2>
      <p className="text-slate-400 text-sm mb-8 max-w-lg">
        Six cuts. Let me know which one is closest to what you need and I will send the
        full version.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
        <div className="rounded-2xl overflow-hidden border border-white/10 bg-black">
          <div className="relative aspect-video">
            <video
              ref={videoRef}
              key={active.src}
              src={active.src}
              playsInline
              preload="metadata"
              onEnded={() => setIsPlaying(false)}
              onClick={toggle}
              className="w-full h-full object-cover cursor-pointer"
            />
            {!isPlaying && (
              <button
                type="button"
                onClick={toggle}
                aria-label={`Play ${active.title}`}
                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-colors cursor-pointer"
              >
                <span className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </span>
              </button>
            )}
          </div>
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/10">
            <div>
              <h3 className="text-sm font-semibold text-white">{active.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {active.client} · {active.role}
              </p>
            </div>
            <button
              type="button"
              onClick={toggle}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <ul className="flex flex-col divide-y divide-white/5 border-y border-white/5">
          {REELS.map((reel) => {
            const isActive = reel.id === activeId;
            return (
              <li key={reel.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveId(reel.id);
                    setIsPlaying(true);
                  }}
                  className={`w-full text-left py-3.5 flex items-center justify-between gap-4 group cursor-pointer ${
                    isActive ? "text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="min-w-0">
                    <span className="block text-sm font-medium truncate">{reel.title}</span>
                    <span className="block text-xs text-slate-500 mt-0.5">{reel.role}</span>
                  </div>
                  <Play
                    className={`w-3.5 h-3.5 flex-shrink-0 ${
                      isActive ? "text-blue-400" : "text-slate-600 group-hover:text-slate-400"
                    }`}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
