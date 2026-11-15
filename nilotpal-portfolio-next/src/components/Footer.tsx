"use client";

import React from "react";
import { ArrowUp } from "lucide-react";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-white/5 py-9 px-6">
      <div className="max-w-[1280px] mx-auto flex items-center justify-between flex-wrap gap-4 text-xs text-slate-500">
        <span>&copy; {new Date().getFullYear()} Nilotpal Saha</span>

        <div className="flex gap-5">
          <a
            href="https://drive.google.com/drive/folders/1hdfEVgvwOKkYJGhdHjabrn6sF3IdND27"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Google Drive
          </a>
          <a href="mailto:sahanilotpal005@gmail.com" className="hover:text-white transition-colors">
            Email
          </a>
          <a href="tel:+917003996685" className="hover:text-white transition-colors">
            Phone
          </a>
        </div>

        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          className="w-9 h-9 rounded-full border border-white/10 hover:border-white/30 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>
    </footer>
  );
}
