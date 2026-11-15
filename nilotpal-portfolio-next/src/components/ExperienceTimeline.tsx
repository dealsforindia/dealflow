"use client";

import React from "react";

export function ExperienceTimeline() {
    const experiences = [
        {
            role: "Senior Graphic Designer",
            company: "IMAGE CLINIC • Kolkata, West Bengal",
            period: "2026 – Present",
            isCurrent: true,
            bullets: [
                "Work directly with CEO and executive leadership on high-priority corporate brand strategy.",
                "Lead the creative design team across multi-channel campaigns, digital assets, and high-ticket collaterals.",
                "Execute strong aesthetic sense combining brand standards, typography, color theory, and graphic elements.",
            ],
        },
        {
            role: "Senior Graphic Designer",
            company: "Pixel Solutionz Technology • Kolkata, West Bengal",
            period: "2023 – 2026",
            isCurrent: false,
            bullets: [
                "Handled all creative executions and directly translated complex client design briefs into high-impact visuals.",
                "Led the design team and executed end-to-end commercial video editing pipelines with tight turnaround times.",
                "Collaborated closely with CEO and executive stakeholders on client deliveries and marketing roadmaps.",
            ],
        },
        {
            role: "Mid Graphic Designer",
            company: "Hykez Technology India Pvt. Ltd. • Kolkata, West Bengal",
            period: "2022 – 2023",
            isCurrent: false,
            bullets: [
                "Created visual content for online & offline platforms: websites, print ads, logo systems, and commercial videos.",
                "Applied advanced color theory and brand standards across diverse multinational client portfolios.",
            ],
        },
        {
            role: "Junior Graphic Designer",
            company: "Arena Animation • Kolkata, West Bengal",
            period: "2020 – 2022",
            isCurrent: false,
            bullets: [
                "Designed all varieties of advertisement creatives, print collaterals, and email banners.",
                "Created digital marketing assets for website and social media channels strictly within corporate brand guidelines.",
            ],
        },
        {
            role: "Freelance Graphic Designer",
            company: "Yogines Studioo",
            period: "2019 – 2020",
            isCurrent: false,
            bullets: [
                "Partnered with marketing and creative teams to craft trend-setting social media posts.",
                "Delivered a proven 37% increase in web traffic through high-engagement creative strategies.",
            ],
        },
    ];

  return (
    <section className="max-w-[1280px] mx-auto mb-24 px-6 scroll-mt-28" id="experience">
      <div className="glass-panel p-8 sm:p-12 rounded-3xl">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-8">
          Work Experience & Leadership
        </h2>

                <div className="relative flex flex-col gap-6 pl-4 sm:pl-8 before:absolute before:top-3 before:bottom-3 before:left-3.5 before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:via-indigo-500 before:to-transparent">
                    {experiences.map((exp, idx) => (
                        <div key={idx} className="relative flex items-start gap-5">
                            <div
                                className={`w-7 h-7 rounded-full flex-shrink-0 z-10 flex items-center justify-center border-2 ${exp.isCurrent
                                    ? "bg-blue-600 border-blue-400 shadow-[0_0_12px_#3b82f6]"
                                    : "bg-slate-900 border-slate-700"
                                    }`}
                            >
                                <div className={`w-2 h-2 rounded-full ${exp.isCurrent ? "bg-white" : "bg-slate-500"}`} />
                            </div>

                            <div className="flex-1 glass-subpanel p-6 rounded-2xl">
                                <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{exp.role}</h3>
                                        <span className="text-xs text-slate-400">{exp.company}</span>
                                    </div>
                                    <span
                                        className={`font-mono text-xs px-3 py-1 rounded-full border ${exp.isCurrent
                                            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                                            : "bg-white/5 border-white/10 text-slate-400"
                                            }`}
                                    >
                                        {exp.period}
                                    </span>
                                </div>

                                <ul className="flex flex-col gap-2 text-sm text-slate-300">
                                    {exp.bullets.map((b, bIdx) => (
                                        <li key={bIdx} className="flex items-start gap-2">
                                            <span className="text-blue-400 font-mono">▹</span>
                                            <span>{b}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

