"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Play, Pause, ChevronsLeftRight, Volume2, VolumeX } from "lucide-react";

export function ProductionLab() {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSec, setCurrentSec] = useState(0);
  const [totalSec, setTotalSec] = useState(45);
  const [speedIdx, setSpeedIdx] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const speeds = [1, 1.5, 2, 0.5];

  const labVideoRef = useRef<HTMLVideoElement | null>(null);

  const handleDrag = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    handleDrag(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.buttons === 1) {
      handleDrag(e.clientX);
    }
  };

  const togglePlay = () => {
    if (labVideoRef.current) {
      if (isPlaying) {
        labVideoRef.current.pause();
      } else {
        labVideoRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const cycleSpeed = () => {
    const nextIdx = (speedIdx + 1) % speeds.length;
    setSpeedIdx(nextIdx);
    if (labVideoRef.current) {
      labVideoRef.current.playbackRate = speeds[nextIdx];
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (labVideoRef.current) {
      labVideoRef.current.muted = !isMuted;
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60).toString().padStart(2, "0");
    const secs = (s % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <section className="max-w-[1280px] mx-auto mb-24 px-6 scroll-mt-28" id="lab">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Production lab
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-lg">
            Two things clients ask to see before hiring: whether I can grade, and whether
            I can cut to a beat. Drag the slider; play the reel.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
        {/* Draggable Split Comparison Card */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Colour grade, before and after</h3>
            <span className="font-mono text-[11px] text-slate-500">DRAG</span>
          </div>

          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            className="relative h-[360px] w-full rounded-2xl overflow-hidden border border-white/10 cursor-ew-resize select-none touch-none bg-slate-950"
          >
            {/* Before layer */}
            <div className="absolute inset-0">
              <Image
                src="/assets/project_graphic_design.jpg"
                alt="Ungraded frame"
                fill
                sizes="(max-width: 1024px) 100vw, 620px"
                className="object-cover grayscale contrast-75 brightness-90"
              />
              <span className="absolute top-3.5 right-3.5 px-2.5 py-1 text-[11px] font-mono rounded bg-black/80 text-slate-300">
                Before
              </span>
            </div>

            {/* After layer */}
            <div
              className="absolute inset-0 overflow-hidden border-r border-white/70"
              style={{ width: `${sliderPos}%` }}
            >
              <div className="absolute inset-0 w-[1000px] sm:w-[600px] lg:w-[600px] h-full">
                <Image
                  src="/assets/project_graphic_design.jpg"
                  alt="Graded frame"
                  fill
                  sizes="(max-width: 1024px) 100vw, 620px"
                  className="object-cover"
                />
              </div>
              <span className="absolute top-3.5 left-3.5 px-2.5 py-1 text-[11px] font-mono rounded bg-blue-600 text-white">
                After
              </span>
            </div>

            {/* Divider Handle */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center pointer-events-none z-10"
              style={{ left: `${sliderPos}%` }}
            >
              <ChevronsLeftRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Video Reel Player */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Commercial cut</h3>
            <span className="font-mono text-xs text-slate-400">
              {formatTime(currentSec)} / {formatTime(totalSec)}
            </span>
          </div>

          <div className="relative h-[270px] w-full rounded-2xl overflow-hidden border border-white/10 bg-black flex items-center justify-center">
            <video
              ref={labVideoRef}
              src="/videos/commercial_showreel_60fps.mp4"
              loop
              muted={isMuted}
              playsInline
              preload="metadata"
              onTimeUpdate={(e) => {
                const v = e.currentTarget;
                setCurrentSec(Math.floor(v.currentTime));
                if (v.duration) setTotalSec(Math.floor(v.duration));
              }}
              className="w-full h-full object-cover"
            />

            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label="Play reel"
                  className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </button>
              </div>
            )}
          </div>

          {/* Timeline Scrubber & Speed Controls */}
          <div className="mt-4 flex items-center gap-3.5 p-3 bg-white/5 rounded-xl">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="text-white hover:text-blue-400 transition-colors cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickRatio = (e.clientX - rect.left) / rect.width;
                const newTime = Math.floor(clickRatio * totalSec);
                setCurrentSec(newTime);
                if (labVideoRef.current) labVideoRef.current.currentTime = newTime;
              }}
              className="flex-1 h-1.5 bg-white/10 rounded-full relative cursor-pointer"
            >
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${(currentSec / (totalSec || 45)) * 100}%` }}
              />
            </div>

            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute" : "Mute"}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-blue-400" />}
            </button>

            <button
              type="button"
              onClick={cycleSpeed}
              aria-label="Change playback speed"
              className="font-mono text-xs bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-full cursor-pointer transition-colors"
            >
              {speeds[speedIdx]}x
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
