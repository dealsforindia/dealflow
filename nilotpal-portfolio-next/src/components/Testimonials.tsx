"use client";

import React from "react";
import Image from "next/image";

export function Testimonials() {
  const reviews = [
    {
      name: "Karan Mehta",
      role: "Creative Director • Brand Agency",
      avatar: "/assets/avatar_karan.jpg",
      quote:
        "Nilotpal brought our brand visuals from dated to world-class. His grasp of pacing in video editing and rigorous eye for typography lifted the whole campaign.",
    },
    {
      name: "Neha Sharma",
      role: "Marketing VP • Digital Studios",
      avatar: "/assets/avatar_neha.jpg",
      quote:
        "His Maya 3D animations and Premiere Pro cuts always arrive ahead of schedule. Nilotpal works directly with C-suite executives and turns vague ideas into pixel-perfect reality.",
    },
    {
      name: "Rohit Sen",
      role: "Founder • Pixel Creative Labs",
      avatar: "/assets/avatar_rohit.jpg",
      quote:
        "Flawless execution on every single commercial reel and print collateral. Extremely fast communication, deep color grading mastery, and a true partner in creative direction.",
    },
  ];

  return (
    <section className="max-w-[1280px] mx-auto mb-24 px-6">
      <div className="mb-8">
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
          Endorsements from Creative Directors
        </h2>
        <p className="text-slate-400 text-sm mt-2 max-w-xl">
          Direct feedback from founders, agency leads, and marketing VPs on speed, craft, and business results.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((r, idx) => (
          <div key={idx} className="glass-panel p-8 rounded-3xl flex flex-col justify-between">
            <div>
              <div className="text-amber-400 text-sm tracking-widest mb-3.5">★★★★★</div>
              <p className="text-sm text-slate-300 italic leading-relaxed mb-6">&ldquo;{r.quote}&rdquo;</p>
            </div>

            <div className="flex items-center gap-3.5 pt-4 border-t border-white/5">
              <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-blue-500">
                <Image src={r.avatar} alt={r.name} fill className="object-cover" />
              </div>
              <div>
                <strong className="block text-sm text-white">{r.name}</strong>
                <span className="text-xs text-slate-400">{r.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

