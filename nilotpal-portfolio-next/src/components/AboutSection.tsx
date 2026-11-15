"use client";

import React from "react";

export function AboutSection() {
  return (
    <section className="max-w-[1280px] mx-auto mb-24 px-6 scroll-mt-28" id="about">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-6">
            About
          </h2>
          <p className="text-base text-slate-300 leading-relaxed mb-5">
            I have spent five years in agency and in-house studios, mostly on the
            unglamorous middle of the process: matching brand standards frame by frame,
            keeping type and colour consistent across a campaign, and getting the master
            file out on time.
          </p>
          <p className="text-base text-slate-400 leading-relaxed">
            Days are split between Premiere Pro and After Effects for commercial edits,
            Illustrator and Photoshop for identity and collateral, and Maya when a project
            needs a 3D asset that has to hold up in motion. I work directly with founders
            and marketing leads, which means I am usually the person asking what the video
            is supposed to make someone do.
          </p>

          <a
            href="#experience"
            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300 mt-8 transition-colors"
          >
            <span>Career timeline</span>
            <span aria-hidden="true">→</span>
          </a>
        </div>

        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-4">
            Training
          </h3>
          <dl className="divide-y divide-white/5 border-y border-white/5">
            <div className="py-4">
              <dt className="text-sm font-semibold text-white">
                Diploma in 3D Animation — Arena Animation
              </dt>
              <dd className="text-xs text-slate-400 mt-1">
                2019–2021 · Autodesk Maya, character rigging, Arnold lighting
              </dd>
            </div>
            <div className="py-4">
              <dt className="text-sm font-semibold text-white">
                Undergraduate degree — Calcutta University
              </dt>
              <dd className="text-xs text-slate-400 mt-1">2018–2020 · Kolkata, West Bengal</dd>
            </div>
          </dl>

          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 mt-8 mb-4">
            Currently
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Taking on freelance brand campaigns and commercial edits, and open to a
            full-time creative lead role.
          </p>
        </div>
      </div>
    </section>
  );
}
