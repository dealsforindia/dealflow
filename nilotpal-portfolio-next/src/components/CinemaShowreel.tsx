"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw } from "lucide-react";

export interface ReelItem {
  id: string;
  title: string;
  client: string;
  role: string;
  duration: string;
  src: string;
  specs: string;
  desc: string;
}

export const REELS_DATA: ReelItem[] = [
  {
    id: "commercial-showreel",
    title: "Commercial Master Showreel",
    client: "Selected Brands · 2024–2026",
    role: "Pacing · Grade · SFX Mastering",
    duration: "00:45",
    src: "/videos/commercial_showreel_60fps.mp4",
    specs: "60 FPS · DaVinci Resolve · Lumetri Color",
    desc: "Commercial video editing with frame-accurate speed ramping, multi-layer SFX mastering, and DaVinci Resolve color grading.",
  },
  {
    id: "kinetic-typography",
    title: "Kinetic Typography Motion Study",
    client: "Editorial & Broadcast",
    role: "Motion Graphics · After Effects",
    duration: "00:30",
    src: "/videos/kinetic_typography_reel.mp4",
    specs: "60 FPS · Kinetic Type · Rhythmic Audio Mix",
    desc: "Fast-paced typographic motion graphics synchronised with beat drops for high-retention social and television promos.",
  },
  {
    id: "3d-arena-walk",
    title: "Maya 3D Character Walk Cycle",
    client: "Arena Animation Diploma Showcase",
    role: "3D Character Rigging & Animation",
    duration: "00:25",
    src: "/videos/3d_arena_character_walk.mp4",
    specs: "Autodesk Maya · Arnold Shading · Keyframe Rig",
    desc: "Authentic character locomotion study demonstrating weight, secondary action, and skeletal rigging mechanics.",
  },
  {
    id: "automotive-cut",
    title: "Hyperion GT Commercial Spot",
    client: "Automotive Launch",
    role: "Edit · Sound Design · Speed Ramp",
    duration: "00:32",
    src: "/videos/automotive_commercial_cut.mp4",
    specs: "ProRes Delivery · Doppler SFX · Planar Motion",
    desc: "High-octane commercial reveal with camera shake simulation, dynamic speed ramps, and aggressive engine sound design.",
  },
  {
    id: "fashion-runway",
    title: "Haute Couture Runway Editorial",
    client: "Fashion Studio",
    role: "120 FPS Slow-Motion Grade",
    duration: "00:38",
    src: "/videos/fashion_editorial_120fps.mp4",
    specs: "120 FPS Film · Kodak 2383 Emulation",
    desc: "Luxury editorial edit featuring smooth high-frame-rate slow motion and custom analog film print emulation.",
  },
  {
    id: "b2b-saas",
    title: "Cloud Infrastructure Keynote Anthem",
    client: "Hykez Technology",
    role: "Edit · Motion Graphics",
    duration: "00:48",
    src: "/videos/b2b_saas_launch_anthem.mp4",
    specs: "3D Motion Elements · UI Exploded Views",
    desc: "Corporate product announcement video translating enterprise architecture into accessible visual storytelling.",
  },
];

export function CinemaShowreel() {
  const [activeReelId, setActiveReelId] = useState<string>(REELS_DATA[0].id);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [speedIdx, setSpeedIdx] = useState<number>(1); // default 1x
  const speeds = [0.5, 1, 1.5, 2];

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const activeReel = REELS_DATA.find((r) => r.id === activeReelId) ?? REELS_DATA[0];

  // Auto-play when clip changes if already playing
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    if (isPlaying) {
      video.play().catch(() => setIsPlaying(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeReelId]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const cycleSpeed = () => {
    const nextIdx = (speedIdx + 1) % speeds.length;
    setSpeedIdx(nextIdx);
    if (videoRef.current) {
      videoRef.current.playbackRate = speeds[nextIdx];
    }
  };

  const restartVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTo = parseFloat(e.target.value);
    setCurrentTime(seekTo);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTo;
    }
  };

  const formatSecs = (s: number) => {
    const mins = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const secs = Math.floor(s % 60)
      .toString()
      .padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <section className="max-w-[1280px] mx-auto mb-28 px-4 sm:px-6 scroll-mt-24" id="showreel">
      {/* Section Header */}
      <div className="pb-6 border-b border-[#F6F1E6]/15 mb-8">
        <span className="font-mono text-[10px] tracking-[0.2em] text-[#C08A2E] uppercase block mb-2">
          05 · Commercial Video &amp; Motion
        </span>
        <h2 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-white">
          Showreels &amp; Commercial Cuts
        </h2>
        <p className="text-sm text-slate-300 mt-2 max-w-xl">
          Six real commercial edits. Select any cut below to inspect pacing, color grading, and typography in full motion.
        </p>
      </div>

      {/* Main Player Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6 items-start">
        {/* Cinema Video Frame */}
        <div className="relative rounded-2xl overflow-hidden bg-black border border-white/15 shadow-2xl flex flex-col">
          <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center">
            <video
              ref={videoRef}
              src={activeReel.src}
              muted={isMuted}
              playsInline
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              className="w-full h-full object-contain"
            />

            {/* Play Overlay Button if Paused */}
            {!isPlaying && (
              <button
                type="button"
                onClick={togglePlay}
                className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-[#C08A2E]/90 hover:bg-[#C08A2E] text-[#14110D] flex items-center justify-center shadow-xl transition-transform hover:scale-110 cursor-pointer"
                aria-label="Play video"
              >
                <Play className="w-7 h-7 fill-current translate-x-0.5" />
              </button>
            )}
          </div>

          {/* Video Control Bar */}
          <div className="p-4 bg-[#14110D] border-t border-white/10 flex flex-col gap-3">
            {/* Progress Bar */}
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-white/20 accent-[#C08A2E] rounded cursor-pointer"
              aria-label="Video timeline scrubber"
            />

            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="p-1.5 rounded hover:bg-white/10 text-white cursor-pointer"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                </button>

                <button
                  type="button"
                  onClick={restartVideo}
                  className="p-1.5 rounded hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
                  title="Replay from start"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-1.5 rounded hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <span className="text-slate-400 text-[11px]">
                  {formatSecs(currentTime)} / {formatSecs(duration)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={cycleSpeed}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 hover:bg-white/20 text-[#C08A2E] cursor-pointer"
                  title="Cycle playback speed"
                >
                  {speeds[speedIdx]}x
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (videoRef.current?.requestFullscreen) {
                      videoRef.current.requestFullscreen();
                    }
                  }}
                  className="p-1.5 rounded hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
                  title="Fullscreen"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Cut Details */}
          <div className="px-5 py-3.5 bg-[#0A0806] border-t border-white/5 flex flex-col gap-1">
            <div className="flex justify-between items-baseline">
              <h3 className="text-base font-bold font-serif text-white">{activeReel.title}</h3>
              <span className="text-xs font-mono text-[#C08A2E]">{activeReel.specs}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{activeReel.desc}</p>
          </div>
        </div>

        {/* Clip Playlist Selector */}
        <div className="flex flex-col gap-2.5">
          <span className="font-mono text-xs text-slate-400 uppercase tracking-widest px-1">
            Select Commercial Cut ({REELS_DATA.length})
          </span>

          {REELS_DATA.map((reel) => {
            const isSelected = reel.id === activeReelId;
            return (
              <button
                key={reel.id}
                type="button"
                onClick={() => {
                  setActiveReelId(reel.id);
                  setIsPlaying(true);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                  isSelected
                    ? "bg-[#C08A2E]/15 border-[#C08A2E] shadow-[0_0_15px_rgba(192,138,46,0.2)]"
                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex justify-between items-center">
                  <h4
                    className={`text-sm font-bold font-serif ${
                      isSelected ? "text-[#C08A2E]" : "text-white"
                    }`}
                  >
                    {reel.title}
                  </h4>
                  <span className="font-mono text-[10px] text-slate-400 bg-black/40 px-2 py-0.5 rounded">
                    {reel.duration}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>{reel.client}</span>
                  <span className="text-[11px] text-slate-500 font-mono">{reel.role}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
