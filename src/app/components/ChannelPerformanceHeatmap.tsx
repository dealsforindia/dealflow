import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Flame, Clock, Zap, TrendingUp, AlertTriangle, Radio,
  RefreshCw, CheckCircle2, ChevronDown, Filter, ExternalLink,
  Shield, BarChart3, LayoutGrid, Calendar, Info, Link as LinkIcon,
  PenLine, Check, X
} from "lucide-react";
import { toast } from "sonner";

export interface ChannelAnalytics {
  channel: string;
  name: string;
  total_24h: number;
  approved_24h: number;
  rejected_24h: number;
  conversion_pct: number;
  avg_discount_pct: number;
  hourly_volume: number[]; // 24 entries (0 to 23)
  peak_hour: number;
  quality_tier: "S-Tier" | "A-Tier" | "B-Tier" | "C-Tier" | "Dormant";
  active: boolean;
  auto_approve: boolean;
  auto_approve_tg?: boolean;
  auto_approve_web?: boolean;
  last_active_sec_ago: number;
}

interface Props {
  apiBase: string;
  onRefreshChannels?: () => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const formatHourLabel = (h: number) => {
  if (h === 0) return "12A";
  if (h === 12) return "12P";
  return h > 12 ? `${h - 12}P` : `${h}A`;
};

const formatFullHour = (h: number) => {
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:00 ${ampm}`;
};

const getHeatColor = (count: number) => {
  if (count === 0) return "bg-white/[0.02] text-slate-600/60 border-white/[0.04]";
  if (count <= 2) return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
  if (count <= 5) return "bg-emerald-500/40 text-emerald-200 border-emerald-500/50";
  if (count <= 12) return "bg-cyan-500/50 text-cyan-100 border-cyan-400/50 shadow-[0_0_8px_rgba(6,182,212,0.25)]";
  if (count <= 25) return "bg-indigo-500/65 text-white border-indigo-400/60 shadow-[0_0_10px_rgba(99,102,241,0.35)]";
  return "bg-gradient-to-tr from-rose-500 to-amber-500 text-white font-bold border-rose-400/80 shadow-[0_0_14px_rgba(244,63,94,0.5)]";
};

const getTierColor = (tier: string) => {
  switch (tier) {
    case "S-Tier":
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 ring-1 ring-emerald-500/30";
    case "A-Tier":
      return "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
    case "B-Tier":
      return "bg-amber-500/20 text-amber-300 border-amber-500/40";
    case "C-Tier":
      return "bg-slate-500/20 text-slate-300 border-white/10";
    default:
      return "bg-rose-500/15 text-rose-300 border-rose-500/30";
  }
};

export function ChannelPerformanceHeatmap({ apiBase, onRefreshChannels }: Props) {
  const [data, setData] = useState<ChannelAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [filterTier, setFilterTier] = useState<"all" | "active" | "top_yield" | "dormant">("all");
  const [sortOption, setSortOption] = useState<"volume" | "conversion" | "name" | "recent">("volume");
  const [viewMode, setViewMode] = useState<"matrix" | "cards">("matrix");
  const [hoveredCell, setHoveredCell] = useState<{ channelName: string; hour: number; count: number } | null>(null);

  const currentHour = new Date().getHours();

  // Channel inline management states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [updatingChannel, setUpdatingChannel] = useState<{ id: string; name: string; link: string } | null>(null);
  const [newLinkInput, setNewLinkInput] = useState("");
  const [isUpdatingLink, setIsUpdatingLink] = useState(false);

  const saveAlias = async (id: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) { setEditingId(null); return; }
    setData(prev => prev.map(c => c.channel === id ? { ...c, name: trimmed } : c));
    setEditingId(null);
    try {
      const res = await fetch(`${apiBase}/api/v1/channels/alias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: trimmed })
      });
      if (res.ok) {
        toast.success(`Channel renamed to "${trimmed}"`);
        fetchAnalytics();
        onRefreshChannels?.();
      } else {
        toast.error("Failed to rename channel");
      }
    } catch {
      toast.error("Network error saving alias");
    }
  };

  const handleUpdateLink = async () => {
    if (!updatingChannel || !newLinkInput.trim()) return;
    setIsUpdatingLink(true);
    try {
      const res = await fetch(`${apiBase}/api/v1/channels/update-link`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          old_channel: updatingChannel.id,
          new_channel: newLinkInput.trim(),
          name: updatingChannel.name,
        }),
      });
      if (res.ok) {
        toast.success(`Invite link updated for ${updatingChannel.name}!`);
        setUpdatingChannel(null);
        setNewLinkInput("");
        fetchAnalytics();
        onRefreshChannels?.();
      } else {
        toast.error("Failed to update channel link");
      }
    } catch {
      toast.error("Network error updating channel link");
    } finally {
      setIsUpdatingLink(false);
    }
  };

  const toggleAutoApproveTg = async (id: string, current: boolean) => {
    setData(prev => prev.map(c => c.channel === id ? { ...c, auto_approve_tg: !current, auto_approve: !current } : c));
    try {
      const res = await fetch(`${apiBase}/api/v1/channels/config/${encodeURIComponent(id)}/auto-approve-tg`, { method: "PUT" });
      if (res.ok) {
        toast.success(`Telegram Auto-Post ${!current ? "Enabled" : "Disabled"}`);
        onRefreshChannels?.();
      }
    } catch {
      toast.error("Failed to toggle Telegram auto-post");
    }
  };

  const toggleAutoApproveWeb = async (id: string, current: boolean) => {
    setData(prev => prev.map(c => c.channel === id ? { ...c, auto_approve_web: !current } : c));
    try {
      const res = await fetch(`${apiBase}/api/v1/channels/config/${encodeURIComponent(id)}/auto-approve-web`, { method: "PUT" });
      if (res.ok) {
        toast.success(`Website Auto-Post ${!current ? "Enabled (Image Required)" : "Disabled"}`);
        onRefreshChannels?.();
      }
    } catch {
      toast.error("Failed to toggle Website auto-post");
    }
  };

  const toggleChannel = async (id: string, current: boolean) => {
    setData(prev => prev.map(c => c.channel === id ? { ...c, active: !current } : c));
    try {
      await fetch(`${apiBase}/api/v1/channels/config/${encodeURIComponent(id)}/toggle`, { method: "PUT" });
      toast.success(`Channel ${!current ? "resumed" : "paused"}`);
      onRefreshChannels?.();
    } catch {
      toast.error("Failed to toggle channel");
    }
  };

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/v1/channels/analytics`);
      if (res.ok) {
        const json = await res.json();
        if (json.channels && Array.isArray(json.channels)) {
          setData(json.channels);
          setLastRefreshed(new Date());
        }
      }
    } catch (err) {
      console.error("Failed to fetch channel analytics:", err);
      toast.error("Failed to load channel heatmap analytics");
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 45000); // 45s live refresh
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  // Network metrics
  const totalVolume24h = useMemo(() => data.reduce((sum, c) => sum + c.total_24h, 0), [data]);
  const totalApproved24h = useMemo(() => data.reduce((sum, c) => sum + c.approved_24h, 0), [data]);

  // Aggregate hourly volume across entire network
  const networkHourlyVolume = useMemo(() => {
    const arr = new Array(24).fill(0);
    data.forEach(c => {
      (c.hourly_volume || []).forEach((cnt, h) => {
        arr[h] = (arr[h] || 0) + cnt;
      });
    });
    return arr;
  }, [data]);

  const networkPeakHour = useMemo(() => {
    let max = 0;
    let peak = 12;
    networkHourlyVolume.forEach((cnt, h) => {
      if (cnt > max) {
        max = cnt;
        peak = h;
      }
    });
    return { hour: peak, count: max };
  }, [networkHourlyVolume]);

  const topChannel = useMemo(() => {
    const activeChannels = data.filter(c => c.active && c.total_24h > 0);
    if (activeChannels.length === 0) return null;
    return activeChannels.reduce((best, cur) => (cur.conversion_pct > best.conversion_pct ? cur : best), activeChannels[0]);
  }, [data]);

  // Filter & Sort
  const processedChannels = useMemo(() => {
    let list = [...data];

    if (filterTier === "active") {
      list = list.filter(c => c.active);
    } else if (filterTier === "top_yield") {
      list = list.filter(c => c.quality_tier === "S-Tier" || c.quality_tier === "A-Tier" || c.quality_tier === "B-Tier");
    } else if (filterTier === "dormant") {
      list = list.filter(c => c.total_24h === 0 || c.quality_tier === "Dormant");
    }

    list.sort((a, b) => {
      if (sortOption === "volume") return b.total_24h - a.total_24h;
      if (sortOption === "conversion") return b.conversion_pct - a.conversion_pct;
      if (sortOption === "recent") return a.last_active_sec_ago - b.last_active_sec_ago;
      if (sortOption === "name") return a.name.localeCompare(b.name);
      return 0;
    });

    return list;
  }, [data, filterTier, sortOption]);

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* ─── Top Telemetry Summary Ribbon ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl glass-card border border-white/10 flex items-center gap-3.5 relative overflow-hidden group">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 group-hover:scale-105 transition-transform">
            <Zap size={20} className="fill-indigo-400/20" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">24H Network Deals</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <h4 className="text-xl font-black text-white font-mono">{totalVolume24h.toLocaleString()}</h4>
              <span className="text-[11px] font-semibold text-emerald-400">+{totalApproved24h} Approved</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-white/10 flex items-center gap-3.5 relative overflow-hidden group">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-amber-500/15 border border-amber-500/30 text-amber-400 group-hover:scale-105 transition-transform">
            <Flame size={20} className="fill-amber-400/20" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Network Peak Hour</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <h4 className="text-xl font-black text-amber-300 font-mono">{formatFullHour(networkPeakHour.hour)}</h4>
              <span className="text-[11px] font-mono text-slate-400">({networkPeakHour.count} deals)</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-white/10 flex items-center gap-3.5 relative overflow-hidden group">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 group-hover:scale-105 transition-transform">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Top Yield Source</span>
            <div className="flex items-baseline gap-1.5 mt-0.5 truncate max-w-[180px]">
              <h4 className="text-sm font-bold text-white truncate">{topChannel?.name || "None"}</h4>
              {topChannel && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {topChannel.conversion_pct}%
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-white/10 flex items-center gap-3.5 relative overflow-hidden group">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 group-hover:scale-105 transition-transform">
            <Radio size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Telegram Feeds</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <h4 className="text-xl font-black text-white font-mono">
                {data.filter(c => c.active).length} <span className="text-xs text-slate-400 font-normal">/ {data.length}</span>
              </h4>
              <span className="text-[10px] text-emerald-400 font-semibold">● 100% Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Heatmap Controls & Filter Bar ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl glass-panel border border-white/10">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Filter size={13} /> Filter:
          </span>
          {(
            [
              { id: "all", label: `All (${data.length})` },
              { id: "active", label: `Active (${data.filter(c => c.active).length})` },
              { id: "top_yield", label: `High Yield (${data.filter(c => ["S-Tier", "A-Tier", "B-Tier"].includes(c.quality_tier)).length})` },
              { id: "dormant", label: `Dormant (${data.filter(c => c.total_24h === 0).length})` },
            ] as const
          ).map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterTier(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterTier === tab.id
                  ? "bg-indigo-600/30 text-indigo-200 border border-indigo-500/50 shadow-sm"
                  : "bg-white/5 text-slate-400 hover:text-white border border-white/5 hover:bg-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Sort:</span>
            <select
              value={sortOption}
              onChange={e => setSortOption(e.target.value as any)}
              className="bg-slate-900 border border-white/10 text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="volume">Highest Deals (24h)</option>
              <option value="conversion">Best Conversion Rate</option>
              <option value="recent">Most Recently Active</option>
              <option value="name">Channel Name (A-Z)</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode("matrix")}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === "matrix" ? "bg-indigo-500 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
              title="24-Hour Heatmap Matrix"
            >
              <Calendar size={15} />
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === "cards" ? "bg-indigo-500 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
              title="Yield Performance Cards"
            >
              <LayoutGrid size={15} />
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => {
              fetchAnalytics();
              onRefreshChannels?.();
              toast.info("Refreshed channel performance data");
            }}
            disabled={loading}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
            title="Refresh analytics data"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-indigo-400" : ""} />
          </button>
        </div>
      </div>

      {/* ─── View 1: 24-Hour Visual Heatmap Matrix ─── */}
      {viewMode === "matrix" ? (
        <div className="rounded-3xl glass-panel border border-white/10 overflow-hidden shadow-2xl">
          {/* Legend Banner */}
          <div className="px-5 py-3 border-b border-white/8 bg-white/[0.02] flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-white">24-Hour Activity Intensity:</span>
              <div className="flex items-center gap-1.5 ml-2 font-mono text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/10 text-slate-500">0</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">1-2</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/40 text-emerald-200 border border-emerald-500/50">3-5</span>
                <span className="px-1.5 py-0.5 rounded bg-cyan-500/50 text-cyan-100 border border-cyan-400/50">6-12</span>
                <span className="px-1.5 py-0.5 rounded bg-indigo-500/65 text-white border border-indigo-400/60">13-25</span>
                <span className="px-1.5 py-0.5 rounded bg-gradient-to-tr from-rose-500 to-amber-500 text-white font-bold">25+</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <span>Current Hour: <strong className="text-indigo-300 font-bold">{formatFullHour(currentHour)}</strong></span>
            </div>
          </div>

          {/* Matrix Scroll Area */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-white/10 bg-slate-950/60 text-[11px] font-mono text-slate-400">
                  <th className="py-3 px-4 w-60 sticky left-0 z-20 bg-[#0a0d18] border-r border-white/10 backdrop-blur-md">
                    Channel Source ({processedChannels.length})
                  </th>
                  <th className="py-3 px-2 text-center w-16">24h Vol</th>
                  <th className="py-3 px-2 text-center w-16">Conv %</th>
                  {HOURS.map(h => {
                    const isNow = h === currentHour;
                    return (
                      <th
                        key={h}
                        className={`py-3 px-1 text-center w-7 font-mono ${
                          isNow ? "text-indigo-300 font-black bg-indigo-500/15 border-x border-indigo-500/30" : ""
                        }`}
                      >
                        {formatHourLabel(h)}
                      </th>
                    );
                  })}
                  <th className="py-3 px-3 text-right w-24">Peak Hour</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {processedChannels.length === 0 ? (
                  <tr>
                    <td colSpan={28} className="py-12 text-center text-slate-500">
                      No channels match the selected filter.
                    </td>
                  </tr>
                ) : (
                  processedChannels.map(ch => {
                    return (
                      <tr key={ch.channel} className="hover:bg-white/[0.02] transition-colors group">
                        {/* Channel Header (Sticky Left) */}
                        <td className="py-2.5 px-3.5 sticky left-0 z-10 bg-[#090b14] border-r border-white/10 backdrop-blur-sm group-hover:bg-[#0d101c]">
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              {editingId === ch.channel ? (
                                <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                                  <input
                                    autoFocus
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    onKeyDown={e => {
                                      if (e.key === "Enter") saveAlias(ch.channel, editName);
                                      if (e.key === "Escape") setEditingId(null);
                                    }}
                                    onBlur={() => saveAlias(ch.channel, editName)}
                                    className="px-2 py-0.5 rounded text-xs font-bold text-white bg-slate-900 border border-primary/50 focus:outline-none w-32"
                                  />
                                  <button onClick={() => saveAlias(ch.channel, editName)} className="text-emerald-400 hover:text-emerald-300 cursor-pointer">
                                    <Check size={13} />
                                  </button>
                                  <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-white cursor-pointer">
                                    <X size={13} />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => toggleChannel(ch.channel, ch.active)}
                                    title={ch.active ? "Listening (Click to pause)" : "Paused (Click to resume)"}
                                    className="cursor-pointer"
                                  >
                                    <span
                                      className={`w-2.5 h-2.5 rounded-full block flex-shrink-0 transition-transform active:scale-75 ${
                                        ch.active ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" : "bg-slate-600"
                                      }`}
                                    />
                                  </button>
                                  <span
                                    className="font-bold text-white truncate max-w-[130px] cursor-pointer hover:text-indigo-400 transition-colors flex items-center gap-1 group/name"
                                    title="Click to rename channel"
                                    onClick={() => { setEditingId(ch.channel); setEditName(ch.name); }}
                                  >
                                    {ch.name}
                                    <PenLine size={10} className="opacity-0 group-hover/name:opacity-100 text-slate-400" />
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] font-mono text-slate-500 block truncate max-w-[110px]">
                                  {ch.channel.startsWith("http") ? ch.channel.split("/").pop() : ch.channel}
                                </span>
                                <button
                                  onClick={() => {
                                    setUpdatingChannel({ id: ch.channel, name: ch.name, link: ch.channel });
                                    setNewLinkInput("");
                                  }}
                                  className="text-[9px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 hover:underline cursor-pointer"
                                  title="Update Invite Link"
                                >
                                  <LinkIcon size={9} />
                                  <span>Link</span>
                                </button>
                                <button
                                  onClick={() => toggleAutoApproveTg(ch.channel, Boolean(ch.auto_approve_tg ?? ch.auto_approve))}
                                  className={`text-[8px] px-1 py-0.2 rounded font-bold transition-all cursor-pointer ${
                                    Boolean(ch.auto_approve_tg ?? ch.auto_approve) ? "bg-sky-500/20 text-sky-300 border border-sky-500/40" : "bg-white/5 text-slate-500 hover:text-slate-300"
                                  }`}
                                  title="Telegram Auto-Post: Automatically broadcasts to Telegram Channel"
                                >
                                  {Boolean(ch.auto_approve_tg ?? ch.auto_approve) ? "✈️ TG" : "TG off"}
                                </button>
                                <button
                                  onClick={() => toggleAutoApproveWeb(ch.channel, Boolean(ch.auto_approve_web))}
                                  className={`text-[8px] px-1 py-0.2 rounded font-bold transition-all cursor-pointer ${
                                    Boolean(ch.auto_approve_web) ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-white/5 text-slate-500 hover:text-slate-300"
                                  }`}
                                  title="Website Auto-Post: Automatically publishes to Website (requires product image)"
                                >
                                  {Boolean(ch.auto_approve_web) ? "🌐 Web" : "Web off"}
                                </button>
                              </div>
                            </div>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold flex-shrink-0 border ${getTierColor(
                                ch.quality_tier
                              )}`}
                            >
                              {ch.quality_tier}
                            </span>
                          </div>
                        </td>

                        {/* 24h Volume */}
                        <td className="py-2.5 px-2 text-center font-mono font-bold text-white">
                          {ch.total_24h > 0 ? (
                            ch.total_24h
                          ) : (
                            <span className="text-slate-600 font-normal">0</span>
                          )}
                        </td>

                        {/* Conversion % */}
                        <td className="py-2.5 px-2 text-center font-mono">
                          {ch.conversion_pct > 0 ? (
                            <span className="text-emerald-400 font-bold">{ch.conversion_pct}%</span>
                          ) : (
                            <span className="text-slate-600">0%</span>
                          )}
                        </td>

                        {/* 24 Hour Grid Cells */}
                        {HOURS.map(h => {
                          const count = (ch.hourly_volume || [])[h] || 0;
                          const isNow = h === currentHour;
                          return (
                            <td
                              key={h}
                              className={`p-0.5 text-center ${isNow ? "bg-indigo-500/10 border-x border-indigo-500/20" : ""}`}
                              onMouseEnter={() => setHoveredCell({ channelName: ch.name, hour: h, count })}
                              onMouseLeave={() => setHoveredCell(null)}
                            >
                              <div
                                className={`w-6 h-7 mx-auto rounded flex items-center justify-center font-mono text-[10px] border transition-all cursor-default ${getHeatColor(
                                  count
                                )}`}
                                title={`${ch.name} @ ${formatFullHour(h)}: ${count} deals`}
                              >
                                {count > 0 ? count : ""}
                              </div>
                            </td>
                          );
                        })}

                        {/* Peak Hour */}
                        <td className="py-2.5 px-3 text-right font-mono">
                          {ch.total_24h > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30">
                              <Flame size={10} className="fill-amber-300" />
                              {formatHourLabel(ch.peak_hour)}
                            </span>
                          ) : (
                            <span className="text-slate-600 text-[10px]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Hover Tooltip Footnote */}
          <div className="px-5 py-2.5 bg-slate-950/80 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Info size={13} className="text-indigo-400" />
              {hoveredCell ? (
                <span>
                  <strong className="text-white">{hoveredCell.channelName}</strong> delivered{" "}
                  <strong className="text-cyan-300">{hoveredCell.count} deals</strong> between {formatFullHour(hoveredCell.hour)} and{" "}
                  {formatFullHour((hoveredCell.hour + 1) % 24)}
                </span>
              ) : (
                <span>Hover over any hour cell to inspect deal volume for that specific window</span>
              )}
            </div>

            {lastRefreshed && (
              <span className="text-[10px] font-mono text-slate-500">
                Live sync: {lastRefreshed.toLocaleTimeString("en-IN")}
              </span>
            )}
          </div>
        </div>
      ) : (
        /* ─── View 2: Channel Yield Performance Cards ─── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {processedChannels.map(ch => (
            <div
              key={ch.channel}
              className="p-4 rounded-2xl glass-card border border-white/10 flex flex-col justify-between gap-4 hover:border-indigo-500/40 transition-all shadow-lg group"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  {editingId === ch.channel ? (
                    <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                      <input
                        autoFocus
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") saveAlias(ch.channel, editName);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        onBlur={() => saveAlias(ch.channel, editName)}
                        className="px-2 py-0.5 rounded text-xs font-bold text-white bg-slate-900 border border-primary/50 focus:outline-none w-36"
                      />
                      <button onClick={() => saveAlias(ch.channel, editName)} className="text-emerald-400 hover:text-emerald-300 cursor-pointer">
                        <Check size={14} />
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-white cursor-pointer">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleChannel(ch.channel, ch.active)}
                        title={ch.active ? "Listening (Click to pause)" : "Paused (Click to resume)"}
                        className="cursor-pointer"
                      >
                        <span
                          className={`w-2.5 h-2.5 rounded-full block flex-shrink-0 transition-transform active:scale-75 ${
                            ch.active ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-slate-600"
                          }`}
                        />
                      </button>
                      <h4
                        className="text-sm font-bold text-white truncate cursor-pointer hover:text-indigo-400 transition-colors flex items-center gap-1 group/name"
                        title="Click to rename"
                        onClick={() => { setEditingId(ch.channel); setEditName(ch.name); }}
                      >
                        {ch.name}
                        <PenLine size={11} className="opacity-0 group-hover/name:opacity-100 text-slate-400" />
                      </h4>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[10px] font-mono text-slate-400 truncate max-w-[130px]">
                      {ch.channel.startsWith("http") ? ch.channel.split("/").pop() : ch.channel}
                    </p>
                    <button
                      onClick={() => {
                        setUpdatingChannel({ id: ch.channel, name: ch.name, link: ch.channel });
                        setNewLinkInput("");
                      }}
                      className="text-[9.5px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 hover:underline cursor-pointer"
                      title="Update Invite Link"
                    >
                      <LinkIcon size={10} />
                      <span>Link</span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
                  <button
                    onClick={() => toggleAutoApproveTg(ch.channel, Boolean(ch.auto_approve_tg ?? ch.auto_approve))}
                    className={`text-[8.5px] px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                      Boolean(ch.auto_approve_tg ?? ch.auto_approve) ? "bg-sky-500/20 text-sky-300 border border-sky-500/40" : "bg-white/5 text-slate-500 hover:text-slate-300 border border-white/10"
                    }`}
                    title="Telegram Auto-Post"
                  >
                    {Boolean(ch.auto_approve_tg ?? ch.auto_approve) ? "✈️ TG Auto" : "TG off"}
                  </button>
                  <button
                    onClick={() => toggleAutoApproveWeb(ch.channel, Boolean(ch.auto_approve_web))}
                    className={`text-[8.5px] px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                      Boolean(ch.auto_approve_web) ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-white/5 text-slate-500 hover:text-slate-300 border border-white/10"
                    }`}
                    title="Website Auto-Post (Strictly requires product image)"
                  >
                    {Boolean(ch.auto_approve_web) ? "🌐 Web Auto" : "Web off"}
                  </button>
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${getTierColor(ch.quality_tier)}`}>
                    {ch.quality_tier}
                  </span>
                </div>
              </div>

              {/* Sparkline Visual (24-hour distribution) */}
              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1.5">
                  <span>24H Activity Timeline</span>
                  <span className="text-amber-300 flex items-center gap-1 font-bold">
                    <Flame size={11} className="fill-amber-300" /> Peak: {formatFullHour(ch.peak_hour)}
                  </span>
                </div>
                <div className="h-9 flex items-end gap-0.5 bg-black/40 p-1 rounded-xl border border-white/5">
                  {HOURS.map(h => {
                    const cnt = (ch.hourly_volume || [])[h] || 0;
                    const maxInCh = Math.max(1, ...ch.hourly_volume);
                    const heightPct = Math.min(100, Math.max(12, (cnt / maxInCh) * 100));
                    const isNow = h === currentHour;
                    return (
                      <div
                        key={h}
                        className={`flex-1 rounded-sm transition-all ${
                          cnt === 0
                            ? "bg-white/5"
                            : isNow
                            ? "bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]"
                            : cnt > 10
                            ? "bg-gradient-to-t from-indigo-500 to-rose-500"
                            : "bg-emerald-500/70"
                        }`}
                        style={{ height: `${heightPct}%` }}
                        title={`${formatHourLabel(h)}: ${cnt} deals`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5 text-center">
                <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-slate-400 block font-mono">24H Volume</span>
                  <strong className="text-sm font-black text-white font-mono">{ch.total_24h}</strong>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-slate-400 block font-mono">Approved</span>
                  <strong className="text-sm font-black text-emerald-400 font-mono">{ch.approved_24h}</strong>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-slate-400 block font-mono">Conversion</span>
                  <strong className="text-sm font-black text-indigo-300 font-mono">{ch.conversion_pct}%</strong>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span className="text-[10px] font-mono">
                  {ch.last_active_sec_ago < 3600
                    ? `Active ${Math.floor(ch.last_active_sec_ago / 60)}m ago`
                    : ch.last_active_sec_ago < 86400
                    ? `Active ${Math.floor(ch.last_active_sec_ago / 3600)}h ago`
                    : "Dormant (>24h)"}
                </span>

                {ch.auto_approve && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    ⚡ Auto-Post ON
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Update Channel Invite Link Modal */}
      {updatingChannel && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setUpdatingChannel(null)}>
          <div className="w-full max-w-md p-6 rounded-3xl glass-panel border border-cyan-500/30 shadow-2xl flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                  <LinkIcon size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Update Invite Link</h3>
                  <p className="text-[11px] text-slate-400">{updatingChannel.name}</p>
                </div>
              </div>
              <button onClick={() => setUpdatingChannel(null)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer">
                <X size={14} />
              </button>
            </div>

            <div className="flex flex-col gap-1.5 text-xs">
              <label className="text-[11px] font-semibold text-slate-400">Current Channel / ID</label>
              <div className="px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 font-mono text-[11px] text-slate-400 truncate">
                {updatingChannel.id}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-xs">
              <label className="text-[11px] font-semibold text-cyan-300">New Invite Link or Username</label>
              <input
                autoFocus
                value={newLinkInput}
                onChange={e => setNewLinkInput(e.target.value)}
                placeholder="https://t.me/+... or @username"
                className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-cyan-500/40 text-white placeholder:text-slate-500 font-mono text-xs focus:outline-none focus:border-cyan-400"
                onKeyDown={e => e.key === "Enter" && handleUpdateLink()}
              />
              <p className="text-[10px] text-slate-500">
                Paste the new active Telegram invite link if the old link expired or was revoked.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
              <button
                onClick={() => setUpdatingChannel(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/5 border border-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateLink}
                disabled={isUpdatingLink || !newLinkInput.trim()}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:brightness-105 active:scale-95 disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                <LinkIcon size={12} />
                <span>{isUpdatingLink ? "Reconnecting..." : "Save & Reconnect"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
