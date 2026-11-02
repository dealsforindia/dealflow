import React from "react";
import { Search, Bell, ChevronDown, X, Zap } from "lucide-react";

export function HeaderBar({
  search,
  setSearch,
  onQuickDrop,
  isDropping = false,
}: {
  search: string;
  setSearch: (s: string) => void;
  onQuickDrop?: (url: string) => void;
  isDropping?: boolean;
}) {
  const isUrl = /^https?:\/\//i.test(search.trim());

  return (
    <header className="h-16 flex-shrink-0 px-6 bg-white border-b border-gray-200/80 flex items-center justify-between gap-4 z-30">
      {/* Search Input Bar */}
      <div className="relative flex-1 max-w-lg lg:max-w-xl">
        {isUrl ? (
          <Zap size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500 fill-emerald-500 animate-pulse" />
        ) : (
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        )}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && isUrl && onQuickDrop) {
              e.preventDefault();
              onQuickDrop(search);
            }
          }}
          placeholder="Search deals or paste product URL"
          className="w-full pl-10 pr-10 py-2 bg-gray-50/60 hover:bg-gray-50 focus:bg-white border border-gray-200/90 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B50E6]/15 focus:border-[#5B50E6] transition-all shadow-2xs"
        />
        {isUrl ? (
          <button
            type="button"
            disabled={isDropping}
            onClick={() => onQuickDrop?.(search)}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-[#5B50E6] hover:bg-[#4E43D8] transition-all flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <Zap size={11} className="fill-white" />
            <span>Drop</span>
          </button>
        ) : search ? (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
          >
            <X size={13} />
          </button>
        ) : null}
      </div>

      {/* Right Controls: Notifications & User Profile */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Notification Bell */}
        <button
          type="button"
          className="relative p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#5B50E6] ring-2 ring-white" />
        </button>

        {/* User Profile Card */}
        <div className="flex items-center gap-2.5 pl-2 py-1 pr-1.5 rounded-full hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-200">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
            alt="Kabir Shing"
            className="w-8 h-8 rounded-full object-cover border border-gray-200"
          />
          <span className="text-xs font-bold text-gray-800 hidden sm:inline">
            Kabir Shing
          </span>
          <ChevronDown size={14} className="text-gray-400" />
        </div>
      </div>
    </header>
  );
}
