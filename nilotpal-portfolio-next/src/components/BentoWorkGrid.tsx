"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  LayoutGrid,
  List,
  Search,
  ArrowUpRight,
  X,
  Play,
  Pause,
  Maximize2,
  ExternalLink,
  Check,
  Video,
  Boxes,
  Sparkles,
  Layers,
  Sliders,
  Film,
  Volume2,
  VolumeX,
  Server,
  Activity,
  Eye,
  SkipForward,
  SkipBack,
} from "lucide-react";
import { PROJECTS, type ProjectItem } from "@/lib/projects";

export function BentoWorkGrid() {
  const [viewMode, setViewMode] = useState<"grid" | "index">("grid");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Video Autoplay in Grid state
  const [autoplayGrid, setAutoplayGrid] = useState<boolean>(true);
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);

  // Inspector Modal state
  const [modalTab, setModalTab] = useState<"reel" | "interactive" | "sheet">("reel");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [videoSec, setVideoSec] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(45);
  const [videoSpeed, setVideoSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "4:3">("16:9");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);

  // Continuous Showreel Theater Mode
  const [showreelOpen, setShowreelOpen] = useState<boolean>(false);
  const [showreelIdx, setShowreelIdx] = useState<number>(0);
  const showreelVideoRef = useRef<HTMLVideoElement | null>(null);

  // Interactive Sandbox: Finova Mobile Simulator state
  const [finovaTab, setFinovaTab] = useState<"account" | "cards" | "transfer">("account");
  const [transferAmount, setTransferAmount] = useState<number>(2400);
  const [biometricsUnlocked, setBiometricsUnlocked] = useState<boolean>(false);

  // Interactive Sandbox: Maya 3D Rig Joint Angles
  const [mayaYaw, setMayaYaw] = useState<number>(15);
  const [mayaArm, setMayaArm] = useState<number>(45);
  const [mayaSpine, setMayaSpine] = useState<number>(10);
  const [mayaCameraOrbit, setMayaCameraOrbit] = useState<number>(25);

  // Interactive Sandbox: Brand Packaging Finish
  const [foilFinish, setFoilFinish] = useState<"copper" | "matte" | "uv">("copper");
  const [bagAngle, setBagAngle] = useState<number>(0);
  const [cmykPlates, setCmykPlates] = useState<{ c: boolean; m: boolean; y: boolean; k: boolean }>({
    c: true,
    m: true,
    y: true,
    k: true,
  });

  // Interactive Sandbox: Telemetry Live Ping Test
  const [pingLatencies, setPingLatencies] = useState<Record<string, number>>({
    mumbai: 12,
    singapore: 28,
    frankfurt: 86,
    virginia: 142,
  });
  const [isPinging, setIsPinging] = useState<boolean>(false);

  // Interactive Sandbox: Real-Time Color Grading Workstation
  const [gradePreset, setGradePreset] = useState<"standard" | "kodak" | "teal" | "noir">("standard");
  const [gradeGain, setGradeGain] = useState<number>(0);
  const [gradeTemp, setGradeTemp] = useState<number>(0);

  // Filtered list
  const filteredProjects = PROJECTS.filter((p) => {
    const matchesCategory = activeFilter === "all" || p.category === activeFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.subtitle.toLowerCase().includes(q) ||
      p.agency.toLowerCase().includes(q) ||
      p.tools.some((t) => t.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  // Video reels list for continuous showreel
  const videoReels = PROJECTS.filter((p) => Boolean(p.videoUrl));

  const openModal = (p: ProjectItem) => {
    setSelectedProject(p);
    setModalTab(p.videoUrl ? "reel" : "interactive");
    setIsPlaying(true);
    setVideoSec(0);
    setVideoSpeed(1);
    setIsMuted(true);
    setZoomLevel(1);
  };

  const closeModal = () => {
    setSelectedProject(null);
  };

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const runPingTest = () => {
    setIsPinging(true);
    setTimeout(() => {
      setPingLatencies({
        mumbai: Math.floor(9 + Math.random() * 6),
        singapore: Math.floor(22 + Math.random() * 12),
        frankfurt: Math.floor(82 + Math.random() * 10),
        virginia: Math.floor(138 + Math.random() * 15),
      });
      setIsPinging(false);
    }, 600);
  };

  // Keyboard escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showreelOpen) setShowreelOpen(false);
        else if (selectedProject) setSelectedProject(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showreelOpen, selectedProject]);

  return (
    <section className="max-w-[1280px] mx-auto mb-24 px-6 scroll-mt-28" id="work">
      {/* Editorial Header with Dual View Switcher & Showreel Button */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="font-mono text-xs text-emerald-400 font-bold uppercase tracking-wider">
              Selected Commercial Archive • 16 Works
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Selected Work &amp; Case Studies
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-2xl leading-relaxed">
            High-retention commercial video edits, Maya 3D rigs, vector brand packaging, and OLED financial suites.
            Watch every commercial edit as a real 60fps video or interact with live components directly inside the stage.
          </p>
        </div>

        {/* Action Controls Cluster */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          {/* Continuous Showreel Button */}
          <button
            type="button"
            onClick={() => {
              setShowreelOpen(true);
              setShowreelIdx(0);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_16px_rgba(59,130,246,0.5)] transition-all cursor-pointer"
          >
            <Film className="w-3.5 h-3.5" />
            <span>Continuous Showreel (7 Cuts)</span>
          </button>

          {/* Autoplay Video Toggle */}
          <button
            type="button"
            onClick={() => {
              setAutoplayGrid(!autoplayGrid);
            }}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-mono border transition-all cursor-pointer ${
              autoplayGrid
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
            }`}
            title="Toggle video loop preview on card hover or continuous stream"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${autoplayGrid ? "bg-emerald-400 animate-ping" : "bg-slate-500"}`} />
            <span>Autoplay Video Reels: {autoplayGrid ? "ON" : "OFF"}</span>
          </button>

          {/* Dual View Switcher (Grid vs Index) */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10">
            <button
              type="button"
              onClick={() => {
                setViewMode("grid");
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Gallery Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setViewMode("index");
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "index"
                  ? "bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Editorial Monospace Index View"
            >
              <List className="w-3.5 h-3.5" />
              <span>Index</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar (Clean SVGs, Zero AI Slop) */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "All Works (16)", icon: LayoutGrid },
            { id: "video", label: "Commercial Video (4)", icon: Video },
            { id: "3d", label: "3D & Motion (4)", icon: Boxes },
            { id: "branding", label: "Brand Systems (4)", icon: Sparkles },
            { id: "ui", label: "UI & Digital (4)", icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveFilter(tab.id);
                }}
                className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full border transition-all cursor-pointer ${
                  activeFilter === tab.id
                    ? "bg-blue-600 border-blue-600 text-white shadow-[0_0_14px_#3b82f6]"
                    : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by tool, client, or title..."
            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* VIEW 1: Designeer-Inspired Gallery Grid with Looping Video Tiles */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProjects.map((p) => {
            const isHovered = hoveredProjectId === p.id;
            const shouldPlayVideo = Boolean(p.videoUrl) && (autoplayGrid || isHovered);

            return (
              <article
                key={p.id}
                onClick={() => openModal(p)}
                onMouseEnter={() => setHoveredProjectId(p.id)}
                onMouseLeave={() => setHoveredProjectId(null)}
                data-cursor={p.videoUrl ? "WATCH REEL" : "INSPECT"}
                className="group relative rounded-2xl bg-neutral-950 border border-white/10 hover:border-blue-500/80 p-3 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.3)] cursor-pointer"
              >
                {/* Media Container with Live Looping Video or Image Poster */}
                <div className="relative h-52 w-full rounded-xl overflow-hidden mb-3 bg-black border border-white/5">
                  {p.videoUrl ? (
                    <>
                      {/* Looping HTML5 Video */}
                      <video
                        src={p.videoUrl}
                        autoPlay={shouldPlayVideo}
                        loop
                        muted
                        playsInline
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                          shouldPlayVideo ? "opacity-100" : "opacity-0"
                        }`}
                      />
                      {/* Poster Fallback */}
                      <Image
                        src={p.img}
                        alt={p.title}
                        fill
                        className={`object-cover transition-all duration-500 group-hover:scale-105 ${
                          shouldPlayVideo ? "opacity-0" : "opacity-100"
                        }`}
                      />
                    </>
                  ) : (
                    <Image
                      src={p.img}
                      alt={p.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}

                  {/* Subtle vignette gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20 pointer-events-none" />

                  {/* Agency Brand Stamp in Corner */}
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider bg-black/80 backdrop-blur-md text-slate-300 border border-white/15">
                    {p.agency}
                  </span>

                  {/* Reel Indicator Pill if video */}
                  {p.videoUrl && (
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-600/90 backdrop-blur-md text-white flex items-center gap-1 shadow-md">
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>{p.duration || "REEL"}</span>
                    </span>
                  )}

                  {/* Action Hover Reveal Badge */}
                  <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-blue-600 text-white font-mono text-[10px] font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <span>{p.videoUrl ? "Watch Reel" : "Inspect"}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </div>

                  {/* Metric pill */}
                  <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/85 backdrop-blur-md text-emerald-400 border border-emerald-500/30 truncate max-w-[170px]">
                    {p.m1} {p.ml1}
                  </span>
                </div>

                {/* Title & Metadata */}
                <div className="px-1 py-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                    <span>{p.category.toUpperCase()}</span>
                    <span>{p.year}</span>
                  </div>
                  <h3 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                    {p.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">{p.subtitle}</p>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* VIEW 2: Editorial Monospace Index Table */}
      {viewMode === "index" && (
        <div className="rounded-2xl border border-white/10 bg-neutral-950 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-slate-400 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Year</th>
                  <th className="py-3 px-4">Project &amp; Client</th>
                  <th className="py-3 px-4">Discipline</th>
                  <th className="py-3 px-4">Deliverables &amp; Tools</th>
                  <th className="py-3 px-4">Verified Impact</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProjects.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => openModal(p)}
                    data-cursor={p.videoUrl ? "WATCH REEL" : "VIEW"}
                    className="hover:bg-blue-600/10 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 text-slate-500 font-bold">{p.year}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
                        <span>{p.title}</span>
                        {p.videoUrl && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-600 text-white font-bold">
                            REEL
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">{p.agency}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-slate-300">
                        {p.category.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 truncate max-w-[240px]">
                      {p.subtitle}
                    </td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold">
                      {p.m1} <span className="text-slate-500 font-normal text-[10px]">{p.ml1}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/5 group-hover:bg-blue-600 text-white transition-colors">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTINUOUS SHOWREEL THEATER OVERLAY */}
      {showreelOpen && (
        <div
          onClick={() => setShowreelOpen(false)}
          className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[99999] flex items-center justify-center p-4 sm:p-8"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-6xl max-h-[94vh] bg-neutral-950 border border-white/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Showreel Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-neutral-900/80">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  Cinema Showreel Theater • Cut {showreelIdx + 1} of {videoReels.length}
                </span>
                <span className="font-mono text-xs text-blue-400 hidden sm:inline">
                  [{videoReels[showreelIdx]?.agency} - {videoReels[showreelIdx]?.title}]
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowreelIdx((showreelIdx - 1 + videoReels.length) % videoReels.length);
                  }}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
                  title="Previous Cut"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowreelIdx((showreelIdx + 1) % videoReels.length);
                  }}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
                  title="Next Cut"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowreelOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-rose-600 text-white flex items-center justify-center cursor-pointer transition-colors ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Split Theater View: Main Screen + Playlist */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] flex-1 overflow-hidden bg-black">
              {/* Theater Video Player */}
              <div className="relative flex flex-col items-center justify-center p-4 sm:p-8 bg-black">
                <video
                  ref={showreelVideoRef}
                  key={videoReels[showreelIdx]?.videoUrl}
                  src={videoReels[showreelIdx]?.videoUrl}
                  autoPlay
                  controls
                  playsInline
                  className="max-h-[65vh] w-auto rounded-xl shadow-2xl border border-white/10 object-contain"
                />
                <div className="mt-4 text-center">
                  <h3 className="text-base font-bold text-white">
                    {videoReels[showreelIdx]?.title}
                  </h3>
                  <p className="font-mono text-xs text-slate-400 mt-1">
                    {videoReels[showreelIdx]?.subtitle} • Verified: {videoReels[showreelIdx]?.m1} {videoReels[showreelIdx]?.ml1}
                  </p>
                </div>
              </div>

              {/* Theater Playlist Column */}
              <div className="p-4 border-t lg:border-t-0 lg:border-l border-white/10 bg-neutral-950 overflow-y-auto">
                <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider block mb-3 font-bold">
                  Showreel Chapters ({videoReels.length})
                </span>
                <div className="space-y-2">
                  {videoReels.map((reel, idx) => (
                    <button
                      key={reel.id}
                      type="button"
                      onClick={() => {
                        setShowreelIdx(idx);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                        showreelIdx === idx
                          ? "bg-blue-600/20 border-blue-500 text-white"
                          : "bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-black">
                        <Image src={reel.img} alt={reel.title} fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Play className="w-3 h-3 fill-white" />
                        </div>
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[10px] font-mono text-blue-400 block font-bold">
                          {reel.agency}
                        </span>
                        <h4 className="text-xs font-bold text-white truncate">{reel.title}</h4>
                        <span className="text-[10px] font-mono text-slate-500">{reel.duration || "00:30"}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DESIGNEER CINEMA STAGE & INTERACTIVE INSPECTOR MODAL */}
      {selectedProject && (
        <div
          onClick={closeModal}
          className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[9999] flex items-center justify-center p-3 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-6xl max-h-[94vh] bg-neutral-950 border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Top Toolbar */}
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/10 bg-neutral-900/80 flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-blue-600 text-white">
                  {selectedProject.agency}
                </span>
                <span className="font-mono text-xs text-slate-400 hidden sm:inline">
                  {selectedProject.year} • {selectedProject.category.toUpperCase()} MASTER
                </span>

                {/* Stage Mode Tabs */}
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10 ml-2">
                  {selectedProject.videoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setModalTab("reel");
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        modalTab === "reel"
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Reel</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setModalTab("interactive");
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      modalTab === "interactive"
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Interactive Stage</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setModalTab("sheet");
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      modalTab === "sheet"
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>High-Res Sheet</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="https://drive.google.com/drive/folders/1hdfEVgvwOKkYJGhdHjabrn6sF3IdND27"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 transition-colors"
                >
                  <span>Drive Vault</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  type="button"
                  onClick={closeModal}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Split Body: Left Inspector Sidebar + Right Cinema Stage */}
            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] flex-1 overflow-y-auto">
              {/* Left Inspector Sidebar */}
              <div className="p-6 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between space-y-6 bg-neutral-950">
                <div>
                  <span className="font-mono text-xs text-blue-400 font-bold block mb-1">
                    PROJECT SPECIFICATIONS
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white mb-2 leading-tight">
                    {selectedProject.title}
                  </h3>
                  <p className="font-mono text-xs text-slate-400 mb-5">
                    {selectedProject.subtitle}
                  </p>

                  {/* Impact Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 mb-5">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
                      <span className="font-mono text-base font-bold text-blue-400 block">{selectedProject.m1}</span>
                      <span className="text-[10px] text-slate-400">{selectedProject.ml1}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
                      <span className="font-mono text-base font-bold text-white block">{selectedProject.m2}</span>
                      <span className="text-[10px] text-slate-400">{selectedProject.ml2}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
                      <span className="font-mono text-base font-bold text-emerald-400 block">{selectedProject.m3}</span>
                      <span className="text-[10px] text-slate-400">{selectedProject.ml3}</span>
                    </div>
                  </div>

                  {/* Narrative Brief */}
                  <p className="text-xs text-slate-300 leading-relaxed mb-5">
                    {selectedProject.desc}
                  </p>

                  {/* Sampled Color Palette Swatches (Designeer Style) */}
                  <div className="mb-5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-2 font-bold">
                      Sampled Color Palette (Click to Copy)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProject.palette.map((hex) => (
                        <button
                          key={hex}
                          type="button"
                          onClick={() => copyHex(hex)}
                          className="group relative flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-white/10 bg-white/5 hover:border-white/30 transition-all cursor-pointer"
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-black/30"
                            style={{ backgroundColor: hex }}
                          />
                          <span className="font-mono text-[10px] text-slate-300">{hex}</span>
                          {copiedHex === hex && (
                            <Check className="w-3 h-3 text-emerald-400 ml-0.5" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Production Tools List */}
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-2 font-bold">
                      Tools &amp; Pipeline
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProject.tools.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-slate-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500">Nilotpal Saha Archive</span>
                  <a
                    href="#contact"
                    onClick={() => {
                      closeModal();
                      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-[0_0_12px_rgba(59,130,246,0.4)] cursor-pointer"
                  >
                    <span>Commission Work</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Right Cinema Stage / Interactive Sandbox */}
              <div className="p-6 bg-black flex flex-col justify-between overflow-hidden">
                {/* TAB 1: CINEMA REEL VIDEO PLAYER */}
                {modalTab === "reel" && (
                  <div className="flex flex-col h-full justify-between">
                    <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-white/10 bg-neutral-950 flex items-center justify-center">
                      <video
                        ref={modalVideoRef}
                        src={selectedProject.videoUrl || "/videos/commercial_showreel_60fps.mp4"}
                        autoPlay
                        loop
                        muted={isMuted}
                        playsInline
                        onTimeUpdate={(e) => {
                          const v = e.currentTarget;
                          setVideoSec(Math.floor(v.currentTime));
                          setVideoDuration(Math.floor(v.duration || 45));
                        }}
                        className={`w-full h-full ${
                          aspectRatio === "9:16" ? "max-w-[280px] object-cover" : "object-cover"
                        }`}
                      />

                      {/* Video Watermark */}
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-black/80 backdrop-blur-md text-slate-300 border border-white/10 pointer-events-none">
                        4K 60FPS REEL
                      </span>
                    </div>

                    {/* Full Custom Video Scrub Bar & Player Controls */}
                    <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 font-mono text-xs">
                      {/* Timeline Scrubber */}
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-400 w-12 text-right">
                          {String(Math.floor(videoSec / 60)).padStart(2, "0")}:{String(videoSec % 60).padStart(2, "0")}
                        </span>
                        <input
                          type="range"
                          min="0"
                          max={videoDuration || 45}
                          value={videoSec}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setVideoSec(val);
                            if (modalVideoRef.current) modalVideoRef.current.currentTime = val;
                          }}
                          className="flex-1 accent-blue-500 cursor-pointer"
                        />
                        <span className="text-[11px] text-slate-400 w-12">
                          {String(Math.floor(videoDuration / 60)).padStart(2, "0")}:{String(videoDuration % 60).padStart(2, "0")}
                        </span>
                      </div>

                      {/* Control Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (modalVideoRef.current) {
                                if (isPlaying) modalVideoRef.current.pause();
                                else modalVideoRef.current.play();
                              }
                              setIsPlaying(!isPlaying);
                            }}
                            className="px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                          >
                            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                            <span>{isPlaying ? "Pause" : "Play"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setIsMuted(!isMuted);
                              if (modalVideoRef.current) modalVideoRef.current.muted = !isMuted;
                            }}
                            className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-blue-400" />}
                            <span>{isMuted ? "Muted" : "Audio ON"}</span>
                          </button>
                        </div>

                        {/* Aspect Ratio & Speed Switches */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10">
                            {(["16:9", "9:16", "4:3"] as const).map((ratio) => (
                              <button
                                key={ratio}
                                type="button"
                                onClick={() => {
                                  setAspectRatio(ratio);
                                }}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                  aspectRatio === ratio
                                    ? "bg-blue-600 text-white"
                                    : "text-slate-400 hover:text-white"
                                }`}
                              >
                                {ratio}
                              </button>
                            ))}
                          </div>

                          <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10">
                            {[0.5, 1, 1.5, 2].map((spd) => (
                              <button
                                key={spd}
                                type="button"
                                onClick={() => {
                                  setVideoSpeed(spd);
                                  if (modalVideoRef.current) modalVideoRef.current.playbackRate = spd;
                                }}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                  videoSpeed === spd
                                    ? "bg-blue-600 text-white"
                                    : "text-slate-400 hover:text-white"
                                }`}
                              >
                                {spd}x
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: LIVE INTERACTIVE SANDBOX ("Interact with sites shown inside") */}
                {modalTab === "interactive" && (
                  <div className="flex flex-col h-full justify-between">
                    {/* SCENARIO 0: Commercial Video Real-Time Color Grading Workstation */}
                    {selectedProject.interactiveType === "video" && (
                      <div className="p-6 bg-neutral-900/80 rounded-2xl border border-white/10 flex flex-col justify-between font-mono">
                        {/* Live Video Canvas with Real-Time CSS Filter Grade */}
                        <div className="relative aspect-[16/9] w-full rounded-2xl bg-black border border-white/10 flex items-center justify-center overflow-hidden">
                          <video
                            src={selectedProject.videoUrl || "/videos/commercial_showreel_60fps.mp4"}
                            autoPlay
                            loop
                            muted
                            playsInline
                            style={{
                              filter:
                                gradePreset === "kodak"
                                  ? `contrast(${1.15 + gradeGain * 0.01}) brightness(${1.05 + gradeGain * 0.005}) saturate(1.1) sepia(0.15) hue-rotate(${gradeTemp}deg)`
                                  : gradePreset === "teal"
                                  ? `contrast(${1.25 + gradeGain * 0.01}) brightness(${1.02 + gradeGain * 0.005}) saturate(1.35) hue-rotate(${-12 + gradeTemp}deg)`
                                  : gradePreset === "noir"
                                  ? `contrast(${1.3 + gradeGain * 0.01}) brightness(${1 + gradeGain * 0.005}) saturate(0) grayscale(1)`
                                  : `contrast(${1 + gradeGain * 0.01}) brightness(${1 + gradeGain * 0.005}) hue-rotate(${gradeTemp}deg)`,
                            }}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-3 left-3 px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-black/80 text-blue-400 border border-blue-500/30">
                            DAVINCI RESOLVE LIVE LUT: {gradePreset.toUpperCase()}
                          </span>
                          <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-black/80 text-emerald-400 border border-emerald-500/30">
                            REAL-TIME HARDWARE SHADER
                          </span>
                        </div>

                        {/* Live Grade Controls */}
                        <div className="mt-4 space-y-3">
                          {/* Preset Buttons */}
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <span className="text-slate-400 text-[11px]">Film LUT Presets:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                { id: "standard", label: "Rec.709 Standard" },
                                { id: "kodak", label: "Kodak 2383 Print" },
                                { id: "teal", label: "Teal & Orange Pop" },
                                { id: "noir", label: "35mm Silver Noir" },
                              ].map((preset) => (
                                <button
                                  key={preset.id}
                                  type="button"
                                  onClick={() => {
                                    setGradePreset(preset.id as any);
                                  }}
                                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                    gradePreset === preset.id
                                      ? "bg-blue-600 text-white shadow-md"
                                      : "bg-white/5 text-slate-400 hover:text-white"
                                  }`}
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Sliders */}
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                <span>Exposure Gain:</span>
                                <span className="text-white font-bold">{gradeGain > 0 ? `+${gradeGain}` : gradeGain}%</span>
                              </div>
                              <input
                                type="range"
                                min="-30"
                                max="30"
                                value={gradeGain}
                                onChange={(e) => setGradeGain(Number(e.target.value))}
                                className="w-full accent-blue-500 cursor-pointer"
                              />
                            </div>

                            <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                <span>Color Temp Shift:</span>
                                <span className="text-white font-bold">{gradeTemp > 0 ? `+${gradeTemp}` : gradeTemp}°</span>
                              </div>
                              <input
                                type="range"
                                min="-30"
                                max="30"
                                value={gradeTemp}
                                onChange={(e) => setGradeTemp(Number(e.target.value))}
                                className="w-full accent-cyan-500 cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SCENARIO A: Finova Mobile Interactive Sandbox */}
                    {selectedProject.interactiveType === "ui_finova" && (
                      <div className="p-4 sm:p-6 bg-neutral-900/80 rounded-2xl border border-white/10 flex flex-col items-center justify-center">
                        <div className="w-[300px] rounded-3xl bg-black border-2 border-slate-700 p-4 shadow-2xl relative overflow-hidden">
                          {/* Phone Top Notch */}
                          <div className="w-28 h-4 bg-slate-900 rounded-full mx-auto mb-3 flex items-center justify-between px-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                          </div>

                          {/* Interactive Header */}
                          <div className="flex items-center justify-between mb-4 text-xs font-mono">
                            <span className="text-slate-400">FINOVA PRIME</span>
                            <button
                              type="button"
                              onClick={() => {
                                setBiometricsUnlocked(!biometricsUnlocked);
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                biometricsUnlocked
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : "bg-white/10 text-slate-300"
                              }`}
                            >
                              {biometricsUnlocked ? "✓ Unlocked" : "Lock Card"}
                            </button>
                          </div>

                          {/* Finova Glass Card */}
                          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-900 text-white mb-4 shadow-lg">
                            <span className="text-[10px] font-mono text-blue-200 block">TOTAL BALANCE</span>
                            <div className="text-2xl font-black mt-1">₹{(482500 - transferAmount).toLocaleString("en-IN")}</div>
                            <div className="mt-4 font-mono text-[11px] text-blue-200 tracking-widest">
                              {biometricsUnlocked ? "4532 8912 6734 8492" : "•••• •••• •••• 8492"}
                            </div>
                          </div>

                          {/* Interactive Transfer Amount Slider */}
                          <div className="p-3 bg-white/5 rounded-xl border border-white/5 mb-3 font-mono text-xs">
                            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                              <span>Simulate Transfer:</span>
                              <span className="text-emerald-400 font-bold">₹{transferAmount.toLocaleString("en-IN")}</span>
                            </div>
                            <input
                              type="range"
                              min="500"
                              max="20000"
                              step="500"
                              value={transferAmount}
                              onChange={(e) => {
                                setTransferAmount(Number(e.target.value));
                              }}
                              className="w-full accent-blue-500 cursor-pointer"
                            />
                          </div>

                          {/* Interactive Nav Tabs */}
                          <div className="grid grid-cols-3 gap-1 p-1 bg-white/5 rounded-xl text-[10px] font-mono text-center">
                            {(["account", "cards", "transfer"] as const).map((tab) => (
                              <button
                                key={tab}
                                type="button"
                                onClick={() => {
                                  setFinovaTab(tab);
                                }}
                                className={`py-1.5 rounded-lg capitalize font-bold transition-all cursor-pointer ${
                                  finovaTab === tab ? "bg-blue-600 text-white" : "text-slate-400"
                                }`}
                              >
                                {tab}
                              </button>
                            ))}
                          </div>
                        </div>
                        <span className="font-mono text-xs text-slate-400 mt-4">
                          [Interactive Finova Prototype: test transfer slider and biometric lock]
                        </span>
                      </div>
                    )}

                    {/* SCENARIO B: Maya 3D Rig Controller Sandbox */}
                    {selectedProject.interactiveType === "3d_rig" && (
                      <div className="p-6 bg-neutral-900/80 rounded-2xl border border-white/10 flex flex-col justify-between">
                        {/* 3D Wireframe Canvas */}
                        <div className="relative aspect-[16/9] w-full rounded-2xl bg-black border border-white/10 flex items-center justify-center overflow-hidden">
                          {/* Responsive SVG Skeleton responding to sliders */}
                          <svg
                            viewBox="0 0 200 200"
                            className="w-48 h-48 transition-transform duration-200"
                            style={{ transform: `rotateY(${mayaCameraOrbit}deg) rotateX(${mayaSpine}deg)` }}
                          >
                            {/* Grid floor */}
                            <ellipse cx="100" cy="180" rx="70" ry="18" fill="none" stroke="#334155" strokeDasharray="3,3" />
                            {/* Spine & Pelvis */}
                            <line x1="100" y1="110" x2="100" y2="160" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
                            <circle cx="100" cy="160" r="6" fill="#60a5fa" />
                            {/* Head & Neck with Yaw */}
                            <line x1="100" y1="110" x2="100" y2="80" stroke="#3b82f6" strokeWidth="4" />
                            <circle
                              cx={100 + mayaYaw * 0.4}
                              cy="60"
                              r="16"
                              fill="#1e293b"
                              stroke="#60a5fa"
                              strokeWidth="3"
                            />
                            {/* Left Arm responding to Arm Lift */}
                            <line
                              x1="100"
                              y1="110"
                              x2={60 - mayaArm * 0.4}
                              y2={110 - mayaArm * 0.5}
                              stroke="#10b981"
                              strokeWidth="4"
                              strokeLinecap="round"
                            />
                            {/* Right Arm */}
                            <line
                              x1="100"
                              y1="110"
                              x2={140 + mayaArm * 0.4}
                              y2={110 - mayaArm * 0.5}
                              stroke="#10b981"
                              strokeWidth="4"
                              strokeLinecap="round"
                            />
                            {/* Legs */}
                            <line x1="100" y1="160" x2="75" y2="190" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
                            <line x1="100" y1="160" x2="125" y2="190" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
                          </svg>

                          <span className="absolute top-3 left-3 px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-black/80 text-emerald-400 border border-emerald-500/30">
                            FK/IK ACTIVE RIG
                          </span>
                        </div>

                        {/* Interactive Sliders */}
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                          <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-[10px] text-slate-400 block mb-1">Head Yaw ({mayaYaw}°)</span>
                            <input
                              type="range"
                              min="-45"
                              max="45"
                              value={mayaYaw}
                              onChange={(e) => setMayaYaw(Number(e.target.value))}
                              className="w-full accent-blue-500 cursor-pointer"
                            />
                          </div>
                          <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-[10px] text-slate-400 block mb-1">Arm Lift ({mayaArm}°)</span>
                            <input
                              type="range"
                              min="0"
                              max="90"
                              value={mayaArm}
                              onChange={(e) => setMayaArm(Number(e.target.value))}
                              className="w-full accent-emerald-500 cursor-pointer"
                            />
                          </div>
                          <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-[10px] text-slate-400 block mb-1">Spine Flex ({mayaSpine}°)</span>
                            <input
                              type="range"
                              min="-20"
                              max="30"
                              value={mayaSpine}
                              onChange={(e) => setMayaSpine(Number(e.target.value))}
                              className="w-full accent-amber-500 cursor-pointer"
                            />
                          </div>
                          <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-[10px] text-slate-400 block mb-1">Orbit ({mayaCameraOrbit}°)</span>
                            <input
                              type="range"
                              min="-180"
                              max="180"
                              value={mayaCameraOrbit}
                              onChange={(e) => setMayaCameraOrbit(Number(e.target.value))}
                              className="w-full accent-cyan-500 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SCENARIO C: Enterprise Telemetry Cluster Sandbox */}
                    {selectedProject.interactiveType === "ui_telemetry" && (
                      <div className="p-6 bg-neutral-900/80 rounded-2xl border border-white/10 flex flex-col justify-between font-mono">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Server className="w-4 h-4 text-blue-400" />
                              <span className="text-xs font-bold text-white uppercase">
                                Multi-Region Cluster Telemetry
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={runPingTest}
                              disabled={isPinging}
                              className="px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                            >
                              <Activity className={`w-3.5 h-3.5 ${isPinging ? "animate-spin" : ""}`} />
                              <span>{isPinging ? "Measuring..." : "Run Global Ping Test"}</span>
                            </button>
                          </div>

                          {/* Node Cluster Latency Grid */}
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            {[
                              { id: "mumbai", label: "Mumbai (ap-south-1)", latency: pingLatencies.mumbai },
                              { id: "singapore", label: "Singapore (ap-southeast-1)", latency: pingLatencies.singapore },
                              { id: "frankfurt", label: "Frankfurt (eu-central-1)", latency: pingLatencies.frankfurt },
                              { id: "virginia", label: "N. Virginia (us-east-1)", latency: pingLatencies.virginia },
                            ].map((node) => (
                              <div
                                key={node.id}
                                className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between"
                              >
                                <div>
                                  <span className="text-[11px] text-slate-400 block">{node.label}</span>
                                  <span className="text-sm font-bold text-white">{node.latency} ms</span>
                                </div>
                                <span className={`w-2.5 h-2.5 rounded-full ${node.latency < 50 ? "bg-emerald-400 shadow-[0_0_8px_#10b981]" : "bg-amber-400 shadow-[0_0_8px_#f59e0b]"}`} />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Interactive Throughput Pulse */}
                        <div className="p-3 bg-black/60 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                          <span className="text-slate-400">WebSocket Throughput:</span>
                          <span className="text-emerald-400 font-bold">128,420 events / sec (0 dropped)</span>
                        </div>
                      </div>
                    )}

                    {/* SCENARIO D: Brand Packaging Finish & Die-line Sandbox */}
                    {selectedProject.interactiveType === "brand_pack" && (
                      <div className="p-6 bg-neutral-900/80 rounded-2xl border border-white/10 flex flex-col justify-between font-mono">
                        {/* Packaging 3D Mockup Container */}
                        <div className="relative aspect-[16/9] w-full rounded-2xl bg-black border border-white/10 flex items-center justify-center overflow-hidden">
                          <div
                            className="relative w-64 h-72 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center p-6 text-center"
                            style={{
                              transform: `rotateY(${bagAngle}deg)`,
                              backgroundColor: foilFinish === "matte" ? "#18181b" : "#27272a",
                              borderColor: foilFinish === "copper" ? "#b45309" : "#3f3f46",
                              boxShadow: foilFinish === "copper" ? "0 0 35px rgba(180,83,9,0.35)" : "none",
                            }}
                          >
                            <span
                              className="text-xs font-bold tracking-widest block uppercase"
                              style={{ color: foilFinish === "copper" ? "#d97706" : "#ffffff" }}
                            >
                              {selectedProject.agency}
                            </span>
                            <div
                              className="text-lg font-black mt-2 uppercase tracking-wider"
                              style={{ color: foilFinish === "copper" ? "#fef3c7" : "#e4e4e7" }}
                            >
                              SINGLE ORIGIN ROAST
                            </div>
                            <span className="text-[10px] text-slate-400 mt-4 block">
                              FINISH: {foilFinish.toUpperCase()} FOIL
                            </span>
                          </div>

                          <span className="absolute top-3 left-3 px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-black/80 text-amber-400 border border-amber-500/30">
                            3D DIE-LINE INSPECTOR
                          </span>
                        </div>

                        {/* Finish Controls */}
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400">Finish:</span>
                            {(["copper", "matte", "uv"] as const).map((finish) => (
                              <button
                                key={finish}
                                type="button"
                                onClick={() => {
                                  setFoilFinish(finish);
                                }}
                                className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase cursor-pointer transition-all ${
                                  foilFinish === finish ? "bg-amber-600 text-white" : "bg-white/5 text-slate-400"
                                }`}
                              >
                                {finish}
                              </button>
                            ))}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">Perspective:</span>
                            <input
                              type="range"
                              min="-30"
                              max="30"
                              value={bagAngle}
                              onChange={(e) => setBagAngle(Number(e.target.value))}
                              className="w-24 accent-amber-500 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SCENARIO E: Default Visual Artwork Magnifier */}
                    {selectedProject.interactiveType === "visual" && (
                      <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-white/10 bg-neutral-950 flex items-center justify-center">
                        <Image
                          src={selectedProject.img}
                          alt={selectedProject.title}
                          fill
                          className="object-cover transition-transform duration-300"
                          style={{ transform: `scale(${zoomLevel})` }}
                        />
                        <button
                          type="button"
                          onClick={() => setZoomLevel(zoomLevel === 1 ? 1.4 : 1)}
                          className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white font-mono text-xs flex items-center gap-1.5 cursor-pointer shadow-lg"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>{zoomLevel === 1 ? "1.4x Zoom" : "Reset Fit"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: HIGH-RES ARTWORK SHEET */}
                {modalTab === "sheet" && (
                  <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-white/10 bg-neutral-950 flex items-center justify-center">
                    <Image
                      src={selectedProject.img}
                      alt={selectedProject.title}
                      fill
                      className="object-contain"
                    />
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-black/80 text-slate-300 border border-white/10">
                      HIGH-RESOLUTION MASTER ASSET
                    </span>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
