"use client";

import React from "react";

const GROUPS = [
  { label: "Video", tools: ["Premiere Pro", "After Effects", "Audition", "DaVinci Resolve"] },
  { label: "3D", tools: ["Autodesk Maya", "Arnold", "Adobe Animate"] },
  { label: "Design", tools: ["Illustrator", "Photoshop", "CorelDRAW", "Figma"] },
];

export function SoftwareMatrix() {
  return (
    <section className="max-w-[1280px] mx-auto mb-24 px-6 scroll-mt-28" id="tools">
      <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
        Software
      </h2>
      <p className="text-slate-400 text-sm mb-10 max-w-xl">
        The tools I use day to day.
      </p>

      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {GROUPS.map((group) => (
          <div key={group.label}>
            <dt className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-3">
              {group.label}
            </dt>
            <dd>
              <ul className="flex flex-col gap-1.5">
                {group.tools.map((tool) => (
                  <li key={tool} className="text-sm text-slate-300">
                    {tool}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
