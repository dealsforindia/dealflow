"use client";

import React from "react";

interface Capability {
  num: string;
  title: string;
  body: string;
  deliverables: string[];
}

const CAPABILITIES: Capability[] = [
  {
    num: "01",
    title: "Video editing & motion",
    body: "Cutting commercial edits for social and broadcast, and handling the grade and sound that go with them.",
    deliverables: ["Commercial edits", "Short-form reels", "Colour grade", "Audio mix"],
  },
  {
    num: "02",
    title: "Brand identity",
    body: "Building systems a team can actually apply: type scales, layout rules, and the collateral that follows.",
    deliverables: ["Logo systems", "Guidelines", "Stationery", "Packaging"],
  },
  {
    num: "03",
    title: "3D & motion graphics",
    body: "Maya-based modelling, lighting, and rigging for assets that need to survive in motion.",
    deliverables: ["Character rigs", "Product renders", "Arnold lighting", "Turnarounds"],
  },
  {
    num: "04",
    title: "Design for screens",
    body: "Layouts and interfaces where the typography and spacing have to hold up at small sizes.",
    deliverables: ["Landing pages", "Mobile screens", "Pitch decks", "Campaign kits"],
  },
];

export function ServicesGrid() {
  return (
    <section className="max-w-[1280px] mx-auto mb-24 px-6 scroll-mt-28" id="services">
      <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
        What I do
      </h2>
      <p className="text-slate-400 text-sm mb-10 max-w-xl">
        Four disciplines, usually in combination.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border border-white/10 rounded-2xl overflow-hidden">
        {CAPABILITIES.map((c) => (
          <div key={c.num} className="bg-[#06070a] p-7 sm:p-9">
            <span className="font-mono text-xs text-slate-600 block mb-4">{c.num}</span>
            <h3 className="text-lg font-bold text-white mb-2">{c.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-5">{c.body}</p>
            <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
              {c.deliverables.map((d) => (
                <li key={d} className="text-xs text-slate-500">
                  {d}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
