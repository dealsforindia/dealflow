"use client";

import React, { useEffect, useState, useCallback } from "react";
import { modeForHour } from "./KolkataRooftopStage";

export interface TimeScrubberBarProps {
  currentHour: number;
  onHourChange: (hour: number) => void;
  isLive: boolean;
  onResetLive: () => void;
}

export function TimeScrubberBar({
  currentHour,
  onHourChange,
  isLive,
  onResetLive,
}: TimeScrubberBarProps) {
  const [istTimeString, setIstTimeString] = useState<string>("00:00:00");

  // Format digital clock for Kolkata IST
  useEffect(() => {
    const updateTime = () => {
      try {
        const timeStr = new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(new Date());
        setIstTimeString(timeStr);
      } catch {
        const d = new Date();
        setIstTimeString(d.toTimeString().split(" ")[0]);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatScrubTime = useCallback((h: number) => {
    const hours = Math.floor(h) % 24;
    const minutes = Math.round((h % 1) * 60) % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }, []);

  const { mode, note } = modeForHour(currentHour);
  const progressPercent = (Math.min(24, Math.max(0, currentHour)) / 24) * 100;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-[#14110D] border-t border-[#F6F1E6]/15 text-[#F6F1E6] h-11 px-4 sm:px-6 flex items-center justify-between font-mono text-[9px] tracking-widest uppercase select-none shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
      {/* Left: Location & Status */}
      <div className="flex items-center gap-3 sm:gap-5">
        <span className="flex items-center gap-2 text-[#F6F1E6]/80 font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#C08A2E] animate-ping" />
          <span>Kolkata IST</span>
        </span>
        <span className="text-[#F6F1E6] font-mono font-medium hidden sm:inline-block">
          {istTimeString}
        </span>
        <span className="text-[#F6F1E6]/50 hidden md:inline-block border-l border-white/10 pl-3">
          Sky: <span className="text-[#C08A2E]">{note}</span> ({mode})
        </span>
      </div>

      {/* Right: 24h Interactive Scrub Slider */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[#F6F1E6]/40 hidden xs:inline">Scrub:</span>
          <span className="text-white font-bold min-w-[36px] text-right">
            {formatScrubTime(currentHour)}
          </span>
        </div>

        {/* Timeline Range Input */}
        <div className="relative w-28 sm:w-44 flex items-center">
          <input
            type="range"
            min="0"
            max="24"
            step="0.1"
            value={currentHour}
            onChange={(e) => onHourChange(parseFloat(e.target.value))}
            className="w-full h-1.5 rounded-lg appearance-none cursor-ew-resize bg-white/20 accent-[#C08A2E] focus:outline-none"
            style={{
              background: `linear-gradient(90deg, #C08A2E 0%, #C08A2E ${progressPercent}%, rgba(246,241,230,0.2) ${progressPercent}%, rgba(246,241,230,0.2) 100%)`,
            }}
            aria-label="Scrub 24h Kolkata sky time"
          />
        </div>

        {/* Live Reset Pill */}
        <button
          type="button"
          onClick={onResetLive}
          className={`px-2.5 py-1 rounded text-[8px] font-bold border transition-colors cursor-pointer ${
            isLive
              ? "bg-[#C08A2E]/20 text-[#C08A2E] border-[#C08A2E]"
              : "bg-white/5 text-[#F6F1E6]/60 border-white/20 hover:border-white/40 hover:text-white"
          }`}
          title="Reset to current live Kolkata time"
        >
          {isLive ? "LIVE ✓" : "RESET LIVE"}
        </button>
      </div>
    </footer>
  );
}
