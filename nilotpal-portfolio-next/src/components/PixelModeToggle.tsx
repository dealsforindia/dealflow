"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

export function PixelModeToggle() {
  const [isPixel, setIsPixel] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Sound Synthesizer on Wave Transition
  const playWaveAudio = useCallback((toPixel: boolean) => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const t0 = ctx.currentTime + 0.02;
      const dur = 0.6;
      const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Noise burst
      for (let i = 0; i < data.length; i++) {
        const t = i / data.length;
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 1.4);
      }

      const src = ctx.createBufferSource();
      src.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = toPixel ? "lowpass" : "bandpass";
      filter.frequency.setValueAtTime(toPixel ? 2400 : 400, t0);
      filter.frequency.exponentialRampToValueAtTime(toPixel ? 300 : 3200, t0 + dur);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start(t0);

      // Add a retro 8-bit arpeggio chime when turning on
      if (toPixel) {
        const freqs = [330, 440, 660, 880];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = "square";
          osc.frequency.setValueAtTime(freq, t0 + idx * 0.08);

          oscGain.gain.setValueAtTime(0.04, t0 + idx * 0.08);
          oscGain.gain.exponentialRampToValueAtTime(0.0001, t0 + idx * 0.08 + 0.12);

          osc.connect(oscGain);
          oscGain.connect(ctx.destination);
          osc.start(t0 + idx * 0.08);
          osc.stop(t0 + idx * 0.08 + 0.12);
        });
      }
    } catch {
      // AudioContext blocked or not supported
    }
  }, []);

  const triggerWaveWipe = useCallback((nextPixel: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 176;
    canvas.height = Math.max(1, Math.round(176 * (window.innerHeight / window.innerWidth)));
    canvas.style.display = "block";

    let start: number | null = null;
    const duration = 500; // ms

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(1, elapsed / duration);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw sweeping wave
      const edge = -16 + progress * (canvas.width + 32);
      ctx.fillStyle = nextPixel ? "#F26522" : "#2AA5A0";
      ctx.fillRect(0, 0, edge, canvas.height);

      // Spray particles at the edge
      ctx.fillStyle = "#FFD23F";
      for (let y = 0; y < canvas.height; y += 4) {
        if (Math.random() < 0.3) {
          ctx.fillRect(edge + (Math.random() * 8 - 4), y, 3, 3);
        }
      }

      if (progress < 1) {
        window.requestAnimationFrame(animate);
      } else {
        canvas.style.display = "none";
      }
    };

    window.requestAnimationFrame(animate);
  }, []);

  const handleToggle = () => {
    const nextVal = !isPixel;
    setIsPixel(nextVal);
    document.documentElement.classList.toggle("pixel", nextVal);

    playWaveAudio(nextVal);
    triggerWaveWipe(nextVal);
  };

  useEffect(() => {
    return () => {
      document.documentElement.classList.remove("pixel");
    };
  }, []);

  return (
    <>
      {/* Wipe Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-50 pointer-events-none w-full h-full hidden"
        aria-hidden="true"
      />

      {/* Retro Pixel Mode Button */}
      <button
        type="button"
        onClick={handleToggle}
        className="fixed right-5 top-5 z-40 flex items-center gap-2.5 px-3 py-2 bg-[#F6F1E6] text-[#14110D] border-2 border-[#14110D] shadow-[3px_3px_0_#14110D] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_#14110D] active:translate-y-[1px] active:shadow-[1px_1px_0_#14110D] transition-all cursor-pointer select-none font-mono group rounded-sm"
        title="Toggle 8-bit retro print & pixel mode"
        aria-label="Toggle 8-bit pixel mode"
      >
        <span className="w-4 h-4 bg-[#C08A2E] text-[#14110D] text-[10px] font-bold flex items-center justify-center border border-[#14110D] group-hover:bg-[#F26522] group-hover:text-white transition-colors">
          ♪
        </span>
        <div className="flex flex-col text-left leading-none">
          <span className="text-[10px] font-bold tracking-wider uppercase">
            {isPixel ? "8-Bit Mode ON" : "Retro Pixel"}
          </span>
          <span className="text-[7px] text-[#14110D]/60 tracking-wider mt-0.5">
            {isPixel ? "Tap for Clean Print" : "Tap for 8-Bit Chime"}
          </span>
        </div>
      </button>
    </>
  );
}
