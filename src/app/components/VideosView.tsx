import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Video, Play, RefreshCw, Copy, Download, ExternalLink,
  Search, Check, Film, Clock, Sparkles, X, Volume2, VolumeX, AlertCircle, Trash2
} from "lucide-react";
import { toast } from "sonner";
import { Category3DIcon, Store3DBadge } from "./Iconscout3DAssets";

export interface VideoDeal {
  id: string;
  title: string;
  price: number;
  mrp: number;
  discount: number;
  category: string;
  channel?: string;
  store?: string;
  platforms?: string[];
  imgUrl: string;
  videoUrl?: string;
  videoCover?: string;
  previewUrl?: string;
  videoStatus?: string;
  hasVideo?: boolean;
  ts: number;
  affText?: string;
  affiliate?: boolean;
}

interface VideosViewProps {
  deals: any[];
  apiBase: string;
  onRefresh?: () => void;
  onEdit?: (deal: any) => void;
}

export function VideosView({ deals, apiBase, onRefresh }: VideosViewProps) {
  const [serverVideos, setServerVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "ready" | "queued">("all");
  const [search, setSearch] = useState("");
  const [activePlayerDeal, setActivePlayerDeal] = useState<any | null>(null);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [hoveredDealId, setHoveredDealId] = useState<string | null>(null);

  // Fetch all video deals from API
  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/v1/deals/videos`);
      if (res.ok) {
        const data = await res.json();
        setServerVideos(data.deals || []);
      }
    } catch (e) {
      console.error("Failed to load video deals:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
    const timer = setInterval(fetchVideos, 25000);
    return () => clearInterval(timer);
  }, [apiBase]);

  // Combine deals from props and serverVideos
  const allVideoDeals = useMemo(() => {
    const map = new Map<string, any>();
    
    // First take deals from parent props that have video flags
    for (const d of deals) {
      if (d.hasVideo || d.videoStatus || d.videoUrl) {
        map.set(d.id, d);
      }
    }
    
    // Merge server videos
    for (const sv of serverVideos) {
      const id = sv.fp_hash || sv.id;
      if (!map.has(id)) {
        map.set(id, {
          id,
          title: sv.prod_name || sv.title || "Curated Deal",
          price: sv.prices?.sale ?? 0,
          mrp: sv.prices?.mrp ?? 0,
          discount: sv.prices?.discount_pct ?? 0,
          category: sv.category || "Special Deal",
          channel: sv.source_channel || "Store",
          store: (sv.platforms || ["Amazon"])[0],
          imgUrl: sv.img_url || "",
          videoUrl: sv.video_url,
          videoCover: sv.video_cover,
          previewUrl: sv.video_preview || sv.preview_url,
          videoStatus: sv.video_status || (sv.video_url ? "ready" : "queued"),
          hasVideo: Boolean(sv.has_video || sv.video_url),
          ts: sv.video_ready_at || sv.video_dispatched_at || sv.ts || Date.now() / 1000,
        });
      } else {
        const existing = map.get(id);
        map.set(id, {
          ...existing,
          videoUrl: sv.video_url || existing.videoUrl,
          videoCover: sv.video_cover || existing.videoCover,
          previewUrl: sv.video_preview || sv.preview_url || existing.previewUrl,
          videoStatus: sv.video_status || existing.videoStatus,
          hasVideo: Boolean(sv.has_video || sv.video_url || existing.hasVideo),
        });
      }

    }

    return Array.from(map.values()).sort((a, b) => (b.ts || 0) - (a.ts || 0));
  }, [deals, serverVideos]);

  // Filtered by status and search
  const filteredDeals = useMemo(() => {
    return allVideoDeals.filter(d => {
      const isReady = d.videoStatus === "ready" || Boolean(d.videoUrl);
      const isQueued = !isReady && (d.videoStatus === "queued" || d.videoStatus === "dispatched" || d.videoStatus === "processing");
      
      if (filter === "ready" && !isReady) return false;
      if (filter === "queued" && !isQueued) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = (d.title || "").toLowerCase().includes(q);
        const matchStore = (d.store || "").toLowerCase().includes(q);
        const matchChannel = (d.channel || "").toLowerCase().includes(q);
        return matchTitle || matchStore || matchChannel;
      }
      return true;
    });
  }, [allVideoDeals, filter, search]);

  const readyCount = allVideoDeals.filter(d => d.videoStatus === "ready" || Boolean(d.videoUrl)).length;
  const queuedCount = allVideoDeals.filter(d => d.videoStatus === "queued" || d.videoStatus === "dispatched" || d.videoStatus === "processing").length;

  const handleRegenerate = async (dealId: string) => {
    setDispatchingId(dealId);
    toast.info("⚡ Dispatching 9:16 Viral Short re-render...", { icon: "🎬" });
    try {
      const res = await fetch(`${apiBase}/api/v1/deals/${dealId}/dispatch-video`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Token": localStorage.getItem("dealflow_admin_token") || (import.meta as any).env?.VITE_ADMIN_TOKEN || "df_adm_549586c9722ab144751420b657b2f709bb10d1f251b9663b",
          "Authorization": `Bearer ${localStorage.getItem("dealflow_admin_token") || (import.meta as any).env?.VITE_ADMIN_TOKEN || "df_adm_549586c9722ab144751420b657b2f709bb10d1f251b9663b"}`,
        },
      });
      const data = await res.json();
      if (res.ok && (data.status === "dispatched" || data.status === "ready_to_dispatch")) {
        toast.success("🚀 Dispatched to GitHub Actions runner! Rendering in background.");
        fetchVideos();
        onRefresh?.();
      } else {
        toast.error(`Dispatch failed: ${data.message || "Unknown error"}`);
      }
    } catch (e: any) {
      toast.error(`Error: ${e.message}`);
    } finally {
      setDispatchingId(null);
    }
  };

  const handleDeleteVideo = async (dealId: string) => {
    if (!window.confirm("Are you sure you want to delete this viral short video from the deal?")) return;
    setDeletingId(dealId);
    try {
      const token = localStorage.getItem("dealflow_admin_token") || (import.meta as any).env?.VITE_ADMIN_TOKEN || "df_adm_549586c9722ab144751420b657b2f709bb10d1f251b9663b";
      const res = await fetch(`${apiBase}/api/v1/deals/${dealId}/video`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Token": token,
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success("🗑️ Video short successfully removed from deal");
        setServerVideos(prev => prev.filter(d => (d.fp_hash || d.id) !== dealId));
        if (activePlayerDeal?.id === dealId) {
          setActivePlayerDeal(null);
        }
        onRefresh?.();
      } else {

        toast.error(`Delete failed: ${data.detail || data.message || "Unknown error"}`);
      }
    } catch (e: any) {
      toast.error(`Error: ${e.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 pb-28 md:pb-12 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 bg-gradient-to-br from-slate-900/90 via-[#0b0f19]/90 to-indigo-950/40 relative overflow-hidden shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-xl text-indigo-400 shadow-lg shadow-indigo-500/20">
                🎬
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>Viral Shorts & Reels Studio</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    1080x1920 (9:16)
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Autonomous 9:16 vertical shorts with kinetic captions, dynamic price animations, and zero VM CPU usage.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={fetchVideos}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Refresh video list"
            >
              <RefreshCw size={13} className={loading ? "animate-spin text-indigo-400" : ""} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats & Filters Bar */}
        <div className="mt-6 pt-5 border-t border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === "all"
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                  : "bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              All Videos ({allVideoDeals.length})
            </button>
            <button
              onClick={() => setFilter("ready")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filter === "ready"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                  : "bg-white/5 text-slate-400 hover:text-emerald-300"
              }`}
            >
              <Check size={13} />
              <span>Ready 🎬 ({readyCount})</span>
            </button>
            <button
              onClick={() => setFilter("queued")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filter === "queued"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 font-black"
                  : "bg-white/5 text-slate-400 hover:text-amber-300"
              }`}
            >
              <Clock size={13} />
              <span>Rendering ⏳ ({queuedCount})</span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search video deals..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-950/60 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>
      </div>

      {/* Grid of Video Cards */}
      {filteredDeals.length === 0 ? (
        <div className="py-20 text-center rounded-3xl glass-panel border border-white/8 flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-3xl">
            🎬
          </div>
          <h3 className="text-base font-bold text-white">No Viral Shorts Found</h3>
          <p className="text-xs text-slate-400 max-w-md">
            {filter === "all"
              ? "No deals have viral shorts generated yet. Switch to the 'Broadcasted' tab and click 'Generate Video' on any posted deal to create one!"
              : `No deals found matching the "${filter}" filter.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredDeals.map((deal) => {
            const isReady = deal.videoStatus === "ready" || Boolean(deal.videoUrl);
            const isProcessing = !isReady && (deal.videoStatus === "queued" || deal.videoStatus === "dispatched" || deal.videoStatus === "processing");
            const isDispatching = dispatchingId === deal.id;

            return (
              <div
                key={deal.id}
                className="group relative rounded-3xl overflow-hidden glass-card border border-white/10 hover:border-indigo-500/40 transition-all flex flex-col bg-slate-950/80 shadow-xl"
              >
                {/* 9:16 Visual Poster / Video Thumbnail Container */}
                <div 
                  className="relative aspect-[9/16] w-full bg-slate-900 overflow-hidden flex items-center justify-center cursor-pointer"
                  onMouseEnter={() => setHoveredDealId(deal.id)}
                  onMouseLeave={() => setHoveredDealId(null)}
                  onClick={() => isReady && setActivePlayerDeal(deal)}
                >
                  {deal.videoCover || deal.previewUrl || deal.imgUrl ? (
                    <img
                      src={
                        (hoveredDealId === deal.id && deal.previewUrl)
                          ? deal.previewUrl
                          : (deal.videoCover || deal.imgUrl)
                      }
                      alt={deal.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900">
                      <Category3DIcon category={deal.category} size={48} />
                    </div>
                  )}

                  {/* Dark Gradient Overlay for Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-black/60 pointer-events-none" />


                  {/* Top Status & Store Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    {isReady ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md shadow-emerald-500/30 backdrop-blur-md">
                        <Check size={11} strokeWidth={3} /> Ready
                      </span>
                    ) : isProcessing ? (
                      <span className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md shadow-amber-400/30 animate-pulse backdrop-blur-md">
                        <Clock size={11} strokeWidth={3} /> Rendering
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold">
                        Pending
                      </span>
                    )}

                    {deal.store && (
                      <span className="px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-white border border-white/15">
                        {deal.store}
                      </span>
                    )}
                  </div>

                  {/* Center Play Button (if ready) */}
                  {isReady && (
                    <button
                      onClick={() => setActivePlayerDeal(deal)}
                      className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-indigo-500/90 hover:bg-indigo-400 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/50 hover:scale-110 active:scale-95 transition-all cursor-pointer group-hover:opacity-100 opacity-90"
                      title="Play 9:16 Vertical Short"
                    >
                      <Play size={24} className="fill-white translate-x-0.5" />
                    </button>
                  )}

                  {/* Bottom Deal Info Overlay inside 9:16 Frame */}
                  <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-1.5 pointer-events-none">
                    <h4 className="text-xs font-extrabold text-white line-clamp-2 leading-tight drop-shadow-md">
                      {deal.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-base font-black font-mono text-emerald-400 drop-shadow">
                        ₹{deal.price?.toLocaleString("en-IN")}
                      </span>
                      {deal.mrp > deal.price && (
                        <span className="text-[11px] font-mono line-through text-slate-400">
                          ₹{deal.mrp?.toLocaleString("en-IN")}
                        </span>
                      )}
                      {deal.discount > 0 && (
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-rose-500/90 text-white font-mono shadow-sm ml-auto">
                          -{deal.discount}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-3 border-t border-white/8 flex items-center justify-between gap-1.5 bg-slate-950">
                  {isReady ? (
                    <>
                      <button
                        onClick={() => setActivePlayerDeal(deal)}
                        className="flex-1 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                      >
                        <Play size={12} className="fill-indigo-400" /> Play Short
                      </button>
                      <button
                        onClick={() => {
                          if (deal.videoUrl) {
                            navigator.clipboard.writeText(deal.videoUrl);
                            toast.success("Copied video URL to clipboard!");
                          }
                        }}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer"
                        title="Copy Video URL"
                      >
                        <Copy size={13} />
                      </button>
                      {deal.videoUrl && (
                        <a
                          href={deal.videoUrl}
                          download={`short_${deal.id}.mp4`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer"
                          title="Download MP4"
                        >
                          <Download size={13} />
                        </a>
                      )}
                      <button
                        onClick={() => handleDeleteVideo(deal.id)}
                        disabled={deletingId === deal.id}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                        title="Delete Video"
                      >
                        <Trash2 size={13} className={deletingId === deal.id ? "animate-spin" : ""} />
                      </button>
                    </>
                  ) : (
                    <div className="w-full flex items-center gap-1.5">
                      <button
                        onClick={() => handleRegenerate(deal.id)}
                        disabled={isDispatching || isProcessing}
                        className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw size={12} className={isDispatching || isProcessing ? "animate-spin text-amber-400" : ""} />
                        <span>{isProcessing ? "Rendering in background..." : "Trigger Render"}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteVideo(deal.id)}
                        disabled={deletingId === deal.id}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                        title="Delete Video"
                      >
                        <Trash2 size={13} className={deletingId === deal.id ? "animate-spin" : ""} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive 9:16 Video Player Modal */}
      <AnimatePresence>
        {activePlayerDeal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-fade-in"
            onClick={() => setActivePlayerDeal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-h-[90vh] aspect-[9/16] w-full max-w-[420px] rounded-3xl overflow-hidden bg-black border border-white/20 shadow-2xl flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Top Header */}
              <div className="absolute top-0 inset-x-0 z-20 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-lg bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider">
                    9:16 Short
                  </span>
                  <span className="text-xs font-bold text-white truncate max-w-[200px]">
                    {activePlayerDeal.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (activePlayerDeal) {
                        handleDeleteVideo(activePlayerDeal.id);
                      }
                    }}
                    disabled={deletingId === activePlayerDeal.id}
                    className="p-1 px-2.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
                    title="Delete this viral short"
                  >
                    <Trash2 size={12} className={deletingId === activePlayerDeal.id ? "animate-spin" : ""} />
                    <span>Delete</span>
                  </button>
                  <button
                    onClick={() => setActivePlayerDeal(null)}
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Video Element */}
              <div className="flex-1 w-full h-full relative bg-black flex items-center justify-center">
                {activePlayerDeal.videoUrl ? (
                  <video
                    src={activePlayerDeal.videoUrl}
                    poster={activePlayerDeal.videoCover || activePlayerDeal.imgUrl}
                    controls
                    autoPlay
                    playsInline
                    loop
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-6 text-slate-400 text-xs flex flex-col items-center gap-2">
                    <AlertCircle size={24} className="text-amber-400" />
                    <span>No streaming URL available for this video artifact.</span>
                  </div>
                )}
              </div>

              {/* Bottom Quick Bar */}
              <div className="p-4 bg-slate-950/90 border-t border-white/10 flex items-center justify-between gap-2 z-20">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-emerald-400 font-mono">
                    ₹{activePlayerDeal.price?.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {activePlayerDeal.store || "Store Deal"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {activePlayerDeal.videoUrl && (
                    <a
                      href={activePlayerDeal.videoUrl}
                      download={`short_${activePlayerDeal.id}.mp4`}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 transition-all"
                    >
                      <Download size={13} /> Download
                    </a>
                  )}
                  <button
                    onClick={() => {
                      if (activePlayerDeal.videoUrl) {
                        navigator.clipboard.writeText(activePlayerDeal.videoUrl);
                        toast.success("Video URL copied!");
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold flex items-center gap-1 transition-all shadow-lg shadow-indigo-500/30 cursor-pointer"
                  >
                    <Copy size={13} /> Copy Link
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
