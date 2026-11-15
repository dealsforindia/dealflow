"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { PROOF_PROJECTS, type ProofItem } from "@/lib/proofProjects";

export function PressProofGallery() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const categories = [
    { key: "all", label: "All Works (17)" },
    { key: "travel", label: "✈️ Travel & Fares (5)" },
    { key: "festival", label: "🪔 Festival Campaigns (5)" },
    { key: "healthcare", label: "🩺 Healthcare (2)" },
    { key: "print", label: "📰 Print & Identity (4)" },
    { key: "craft", label: "🐯 Craft & Vectors (2)" },
  ];

  const filteredItems = PROOF_PROJECTS.filter(
    (item) => activeCategory === "all" || item.category === activeCategory
  );

  // Keyboard navigation for Lightbox
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (selectedIdx === null) return;
      if (e.key === "Escape") setSelectedIdx(null);
      if (e.key === "ArrowLeft") {
        setSelectedIdx((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1));
      }
      if (e.key === "ArrowRight") {
        setSelectedIdx((prev) => (prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0));
      }
    },
    [selectedIdx, filteredItems.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const activeModalItem = selectedIdx !== null ? filteredItems[selectedIdx] : null;

  return (
    <section className="max-w-[1280px] mx-auto mb-28 px-4 sm:px-6 scroll-mt-24" id="work">
      {/* Section Masthead */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#F6F1E6]/15 mb-10">
        <div>
          <span className="font-mono text-[10px] tracking-[0.2em] text-[#C08A2E] uppercase block mb-2">
            04 · Verified Output
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-white">
            Commercial Work &amp; Press Files
          </h2>
          <p className="text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
            Every piece displayed at its true commercial aspect ratio with print registration slugs. No synthetic mockups or stock placeholders.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => {
                setActiveCategory(cat.key);
                setSelectedIdx(null);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                activeCategory === cat.key
                  ? "bg-[#C08A2E] text-[#14110D] font-bold shadow-[0_0_12px_rgba(192,138,46,0.4)]"
                  : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* True-Ratio Registration Grid */}
      <div className="grid grid-cols-12 gap-5 md:gap-7 items-start">
        {filteredItems.map((item, idx) => (
          <figure
            key={item.id}
            onClick={() => setSelectedIdx(idx)}
            className={`${item.spanClass} group relative bg-[#F6F1E6]/5 border border-white/10 p-2 sm:p-2.5 rounded-xl cursor-zoom-in hover:border-[#C08A2E] transition-all duration-300 hover:shadow-[0_12px_30px_rgba(0,0,0,0.5)]`}
          >
            {/* Image Container with Dynamic True Ratio */}
            <div
              className="relative w-full rounded-lg overflow-hidden bg-slate-950"
              style={{ aspectRatio: item.aspectRatio }}
            >
              <Image
                src={item.imgSrc}
                alt={item.alt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                loading="lazy"
              />

              {/* Hover Overlay with Zoom Icon */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="flex items-center gap-2 bg-[#14110D]/90 text-white font-mono text-[10px] tracking-widest px-3 py-1.5 rounded-full border border-[#C08A2E]/50">
                  <ZoomIn className="w-3.5 h-3.5 text-[#C08A2E]" />
                  <span>INSPECT PROOF</span>
                </span>
              </div>
            </div>

            {/* Proof Slug */}
            <figcaption className="flex justify-between items-baseline gap-2 mt-2 px-1 font-mono text-[9px] tracking-wider uppercase text-slate-400">
              <span className="text-white font-medium truncate">
                {item.client} · {item.title}
              </span>
              <span className="text-[#C08A2E] shrink-0">{item.dims}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* Fullscreen Proof Lightbox Modal */}
      {activeModalItem && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedIdx(null)}
          className="fixed inset-0 z-50 bg-[#0E0C09]/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setSelectedIdx(null)}
            className="fixed top-5 right-5 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Nav: Prev */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIdx((prev) =>
                prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1
              );
            }}
            className="fixed left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-50"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Nav: Next */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIdx((prev) =>
                prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0
              );
            }}
            className="fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-50"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Modal Content Box */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl w-full flex flex-col items-center"
          >
            <div className="relative max-h-[75vh] w-full flex items-center justify-center overflow-hidden rounded-xl border border-white/20 shadow-2xl bg-black">
              <Image
                src={activeModalItem.imgSrc}
                alt={activeModalItem.alt}
                width={1200}
                height={900}
                className="max-h-[75vh] w-auto h-auto object-contain"
                priority
              />
            </div>

            {/* Proof Metadata Bar */}
            <div className="w-full mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
              <div>
                <h3 className="text-lg font-bold text-white font-serif">
                  {activeModalItem.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Client: <strong className="text-white">{activeModalItem.client}</strong> · Category:{" "}
                  <span className="text-[#C08A2E]">{activeModalItem.categoryLabel}</span> ({activeModalItem.year})
                </p>
                {activeModalItem.desc && (
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">
                    {activeModalItem.desc}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
                <span className="px-3 py-1 rounded bg-white/10 text-[#C08A2E] border border-white/10">
                  {activeModalItem.dims}
                </span>
                <span className="text-slate-400">
                  {selectedIdx !== null ? selectedIdx + 1 : 0} / {filteredItems.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
