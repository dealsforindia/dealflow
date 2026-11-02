import React from "react";
import { LayoutGrid, Globe, Share2, Film, Settings, ChevronsLeft, Zap, Database } from "lucide-react";

export type Tab = "Review" | "Posted" | "Channels" | "Videos" | "Settings";

interface SystemHealth {
  status: "ok" | "degraded" | "offline" | "checking";
  redis: boolean;
  mongodb: boolean;
  wsClients: number;
  lastChecked: number | null;
}

const NAV_ITEMS: { id: Tab; icon: React.ElementType; label: string }[] = [
  { id: "Review", icon: LayoutGrid, label: "Review" },
  { id: "Posted", icon: Globe, label: "Published" },
  { id: "Channels", icon: Share2, label: "Channels" },
  { id: "Videos", icon: Film, label: "Videos" },
  { id: "Settings", icon: Settings, label: "Settings" },
];

export function Sidebar({
  tab,
  setTab,
  pending = 0,
  systemHealth,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  pending?: number;
  systemHealth?: SystemHealth;
}) {
  const isHealthy = systemHealth?.status === "ok" || systemHealth?.status === "checking";

  return (
    <aside className="hidden md:flex flex-shrink-0 flex-col w-56 bg-white border-r border-gray-200/90 select-none z-30">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-gray-100 flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-[#5B50E6] tracking-tight">
          DealFlow
        </h1>
        <button
          type="button"
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          title="Collapse sidebar"
        >
          <ChevronsLeft size={16} />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV_ITEMS.map(({ id, label, icon: NavIcon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                active
                  ? "bg-[#5B50E6] text-white shadow-sm font-semibold"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/70"
              }`}
            >
              <NavIcon
                size={17}
                className={active ? "text-white" : "text-gray-500"}
                strokeWidth={active ? 2.2 : 1.8}
              />
              <span className="tracking-tight flex-1 text-left">{label}</span>
              {id === "Review" && pending > 0 && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    active
                      ? "bg-white/25 text-white"
                      : "bg-indigo-50 text-[#5B50E6]"
                  }`}
                >
                  {pending}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom System Status */}
      <div className="p-3.5 border-t border-gray-100 flex flex-col gap-2">
        {/* Engine Status */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50/80 border border-gray-100/80 text-xs text-gray-700">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-gray-500" />
            <span className="font-medium text-gray-700">Engine</span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isHealthy ? "Healthy" : "Degraded"}</span>
          </div>
        </div>

        {/* Redis Status */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50/80 border border-gray-100/80 text-xs text-gray-700">
          <div className="flex items-center gap-2">
            <Database size={14} className="text-gray-500" />
            <span className="font-medium text-gray-700">Redis</span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{systemHealth?.redis !== false ? "Healthy" : "Offline"}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
