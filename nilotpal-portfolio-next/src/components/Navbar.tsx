"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Menu, X } from "lucide-react";

const navLinks = [
  { label: "Work", href: "#work" },
  { label: "Production Lab", href: "#lab" },
  { label: "Reel", href: "#showreel" },
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-3.5 z-40 max-w-[1280px] mx-auto px-4">
      <nav className="glass-panel flex items-center justify-between px-5 py-2.5 rounded-full">
        {/* Brand with Official N!S Graphics Logo */}
        <a href="#home" className="flex items-center gap-3 text-inherit no-underline group">
          <div className="w-10 h-9 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
            <Image
              src="/assets/nis-mark.svg"
              alt="N!S Graphics Official Mark"
              width={42}
              height={36}
              priority
              className="w-full h-auto drop-shadow-[0_2px_8px_rgba(242,88,26,0.35)]"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-[15px] tracking-tight text-white group-hover:text-[#F2581A] transition-colors">
                Nilotpal Saha
              </span>
              <span className="text-[10px] font-mono tracking-widest text-[#F2581A] font-bold">
                N!S
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Senior Graphic Designer &amp; Video Editor
            </span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs font-medium text-slate-400 hover:text-white hover:bg-white/10 px-3.5 py-1.5 rounded-full transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <a
            href="#contact"
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors"
          >
            <span>Let&apos;s Talk</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            className="lg:hidden text-white p-1 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 bg-slate-900/95 border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col gap-2">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
