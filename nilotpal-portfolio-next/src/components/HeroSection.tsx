"use client";

import React from "react";
import Image from "next/image";
import { Download, ArrowUpRight, Play } from "lucide-react";

export function HeroSection() {
  const clients = [
    "Gill Travels Australia",
    "Image Clinic",
    "The EtuTor Home",
    "A.G.C. Bose College",
    "DesignLogo",
    "N!S Graphics",
  ];

  return (
    <header className="max-w-[1280px] mx-auto pt-16 sm:pt-24 mb-20 px-4 sm:px-6 relative" id="home">
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 items-start">
        {/* Left Column: Masthead & Biography */}
        <div>
          {/* Studio Meta Badge with N!S Mark */}
          <div className="inline-flex items-center gap-2.5 font-mono text-[10px] tracking-[0.2em] uppercase text-[#C08A2E] mb-6 px-3.5 py-1.5 rounded-full bg-[#C08A2E]/10 border border-[#C08A2E]/25 shadow-sm">
            <Image
              src="/assets/nis-mark.svg"
              alt="N!S"
              width={16}
              height={14}
              className="inline-block"
            />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>N!S Graphics · Subhasgram Desk · Est. 2019</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-serif font-normal tracking-tight text-white leading-[1.02] mb-6">
            The light changes.<br />
            The work <em className="italic text-[#C08A2E]">holds</em>.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed mb-6">
            Commercial graphic designer and video editor based in Kolkata. Since 2019, I run design calendars for travel, healthcare, education, and retail brands — from first creative brief to final press file.
          </p>

          <blockquote className="font-serif italic text-lg sm:text-xl text-[#C08A2E] border-l-2 border-[#C08A2E] pl-4 mb-9">
            &ldquo;Print-first thinking, screen-native execution.&rdquo;
          </blockquote>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3.5 mb-10">
            <a
              href="#showreel"
              className="inline-flex items-center gap-2 bg-[#C08A2E] hover:bg-[#d69d3a] text-[#14110D] text-xs font-mono font-bold px-5 py-3 rounded-full shadow-lg transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>WATCH REELS</span>
            </a>

            <a
              href="/assets/nilotpal_resume.pdf"
              download="Nilotpal_Saha_Resume.pdf"
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white text-xs font-mono font-bold px-5 py-3 rounded-full border border-white/15 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#C08A2E]" />
              <span>DOWNLOAD CV (PDF)</span>
            </a>

            <a
              href="https://drive.google.com/drive/folders/1hdfEVgvwOKkYJGhdHjabrn6sF3IdND27"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white text-xs font-mono font-bold px-5 py-3 rounded-full border border-white/15 transition-all cursor-pointer"
            >
              <span>DRIVE ARCHIVE</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Right Column: Portrait & Tactile Job Ticket */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-8 relative">
          {/* Portrait with Studio Frame */}
          <figure className="relative p-2 bg-[#F6F1E6] text-[#14110D] border-2 border-[#14110D] shadow-[6px_6px_0_#14110D] rotate-1 hover:rotate-0 transition-transform duration-300 max-w-[280px] w-full rounded-sm">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-900">
              <Image
                src="/assets/nilotpal_portrait.jpg"
                alt="Nilotpal Saha at his Subhasgram desk"
                fill
                priority
                sizes="280px"
                className="object-cover"
              />
            </div>
            <figcaption className="flex justify-between items-baseline pt-2 px-1 font-mono text-[8px] tracking-wider uppercase text-slate-700">
              <strong className="text-black">Nilotpal Saha</strong>
              <span>Subhasgram · 2026</span>
            </figcaption>
          </figure>

          {/* Job Ticket Nº 001 */}
          <aside className="w-full max-w-[280px] bg-[#FBF7EC] text-[#14110D] border-2 border-[#14110D] shadow-[5px_5px_0_rgba(20,17,13,0.3)] p-4 font-mono text-[9px] -rotate-1 hover:rotate-0 transition-transform duration-300 rounded-sm">
            <div className="flex items-center justify-between border-b border-dashed border-[#C9BFA8] pb-1.5 text-slate-500 uppercase tracking-widest text-[8px]">
              <div className="flex items-center gap-1.5">
                <Image src="/assets/nis-mark.svg" alt="N!S" width={14} height={12} />
                <span>Job Ticket</span>
              </div>
              <span className="font-bold text-black">Nº 001</span>
            </div>

            <h3 className="font-serif text-2xl tracking-tight text-black my-2">
              Nilotpal Saha
            </h3>

            <dl className="grid gap-1.5 my-2 border-b border-[#E2D8C4] pb-2 text-[9px]">
              <div className="flex justify-between">
                <dt className="text-slate-500 uppercase">Role</dt>
                <dd className="font-bold text-black text-right">Senior Graphic Designer</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500 uppercase">Studio</dt>
                <dd className="font-bold text-black text-right">N!S Graphics</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500 uppercase">Base</dt>
                <dd className="font-bold text-black text-right">Kolkata, IN</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500 uppercase">Status</dt>
                <dd className="font-bold text-emerald-700 text-right">Open for Work</dd>
              </div>
            </dl>

            {/* Barcode Mock */}
            <div
              className="h-6 w-full opacity-80 my-2"
              style={{
                background:
                  "repeating-linear-gradient(90deg, #14110D 0 1px, transparent 1px 3px, #14110D 3px 5px, transparent 5px 8px)",
              }}
              aria-hidden="true"
            />

            <div className="flex justify-between text-[7px] text-slate-500 uppercase tracking-widest pt-1">
              <span>N!S · 2026 · KOL</span>
              <span className="text-[#C08A2E] font-bold">Proof Verified ✓</span>
            </div>
          </aside>
        </div>
      </div>

      {/* Marquee Client Strip */}
      <div className="w-full mt-14 py-3.5 border-y border-white/10 overflow-hidden bg-white/5 backdrop-blur-sm">
        <div className="flex items-center justify-around gap-8 flex-wrap font-mono text-[10px] tracking-[0.2em] uppercase text-slate-300">
          {clients.map((c, i) => (
            <span key={i} className="flex items-center gap-6">
              <span>{c}</span>
              <span className="text-[#C08A2E]">✦</span>
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
