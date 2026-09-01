import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Check, Search } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export function GlassDropdown({
  value,
  onChange,
  options,
  placeholder,
  searchable = false,
  className = "",
}: {
  value: string;
  onChange: (val: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  searchable?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value) || {
    value,
    label: placeholder || value,
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const filteredOptions = searchable && searchTerm.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      {/* Trigger Button */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
          open
            ? "bg-slate-900 border-primary/50 text-white shadow-[0_0_15px_rgba(244,63,94,0.2)] ring-1 ring-primary/30"
            : "bg-slate-950/80 border-white/10 text-slate-200 hover:border-white/20 hover:bg-slate-900/90"
        }`}
      >
        {selectedOption.icon && <span className="flex-shrink-0 text-sm">{selectedOption.icon}</span>}
        <span className="truncate max-w-[120px] font-medium">{selectedOption.label}</span>
        {selectedOption.badge !== undefined && (
          <span className="px-1.5 py-0.2 rounded-md bg-white/10 text-[10px] font-mono text-slate-400">
            {selectedOption.badge}
          </span>
        )}
        <ChevronDown
          size={12}
          className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180 text-primary" : ""}`}
        />
      </motion.button>

      {/* Popover Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 top-full mt-1.5 z-[70] min-w-[190px] max-w-[280px] max-h-72 overflow-hidden flex flex-col rounded-2xl bg-[#090D18]/95 backdrop-blur-2xl border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.85)] p-1.5"
          >
            {searchable && (
              <div className="p-1.5 mb-1 border-b border-white/10 relative">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-7 pr-2 py-1 rounded-lg text-xs bg-slate-900/90 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50"
                  autoFocus
                />
              </div>
            )}

            <div className="overflow-y-auto max-h-56 no-scrollbar flex flex-col gap-0.5">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-[11px] text-slate-500 text-center">No options found</div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setOpen(false);
                        setSearchTerm("");
                      }}
                      className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                        isSelected
                          ? "bg-primary/20 text-white border border-primary/30 font-bold shadow-sm"
                          : "text-slate-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {opt.icon && <span className="text-sm">{opt.icon}</span>}
                        <span className="truncate">{opt.label}</span>
                      </div>
                      {isSelected && <Check size={13} className="text-primary flex-shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
