import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Check, Search, X } from "lucide-react";

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
  align = "left",
  className = "",
}: {
  value: string;
  onChange: (val: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  searchable?: boolean;
  align?: "left" | "right";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
    placement: "bottom" | "top";
  }>({
    top: 0,
    left: 0,
    width: 220,
    placement: "bottom",
  });

  const selectedOption = options.find(
    (o) => o.value.toLowerCase() === String(value).toLowerCase()
  ) || {
    value: String(value),
    label: placeholder || String(value),
  };

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownWidth = Math.max(rect.width, 220);
    const dropdownHeight = 280; // approximate max menu height
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let placement: "bottom" | "top" = "bottom";
    let top = rect.bottom + 6;

    // Flip upwards if overflows viewport bottom and there's sufficient room on top
    if (rect.bottom + dropdownHeight > windowHeight - 12 && rect.top > dropdownHeight + 12) {
      top = rect.top - dropdownHeight - 6;
      placement = "top";
    }

    let left = align === "right" ? rect.right - dropdownWidth : rect.left;

    // Clamp horizontally to screen bounds with 10px safe margin
    if (left + dropdownWidth > windowWidth - 10) {
      left = windowWidth - dropdownWidth - 10;
    }
    if (left < 10) {
      left = 10;
    }

    setCoords({
      top,
      left,
      width: dropdownWidth,
      placement,
    });
  }, [align]);

  useEffect(() => {
    if (!open) return;
    updatePosition();

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    const handleScroll = (e: Event) => {
      // If scroll happens inside our menu, don't re-calculate
      if (menuRef.current?.contains(e.target as Node)) return;
      updatePosition();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", updatePosition);
      document.addEventListener("keydown", handleKeyDown);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", updatePosition);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, updatePosition]);

  const filteredOptions =
    searchable && searchTerm.trim()
      ? options.filter((o) =>
          o.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options;

  return (
    <div className={`relative select-none inline-block ${className}`}>
      {/* Trigger Button */}
      <motion.button
        ref={triggerRef}
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className={`w-full flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
          open
            ? "bg-slate-900 border-primary/60 text-white shadow-[0_0_18px_rgba(244,63,94,0.3)] ring-1 ring-primary/40"
            : "bg-slate-950/80 border-white/10 text-slate-200 hover:border-white/25 hover:bg-slate-900/90"
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0 truncate">
          {selectedOption.icon && (
            <span className="flex-shrink-0 text-xs sm:text-sm">{selectedOption.icon}</span>
          )}
          <span className="truncate max-w-[110px] sm:max-w-[130px] font-medium">
            {selectedOption.label}
          </span>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0 ml-1">
          {selectedOption.badge !== undefined && (
            <span className="px-1.5 py-0.2 rounded-md bg-white/10 text-[10px] font-mono text-slate-400">
              {selectedOption.badge}
            </span>
          )}
          <ChevronDown
            size={12}
            className={`text-slate-400 transition-transform duration-200 ${
              open ? "rotate-180 text-primary" : ""
            }`}
          />
        </div>
      </motion.button>

      {/* Portaled Popover Menu (Never clipped by any parent overflow/transform!) */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                ref={menuRef}
                initial={{
                  opacity: 0,
                  y: coords.placement === "top" ? 6 : -6,
                  scale: 0.96,
                }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  y: coords.placement === "top" ? 4 : -4,
                  scale: 0.96,
                }}
                transition={{ duration: 0.12, ease: "easeOut" }}
                style={{
                  position: "fixed",
                  top: `${coords.top}px`,
                  left: `${coords.left}px`,
                  width: `${coords.width}px`,
                  minWidth: "210px",
                  maxWidth: "300px",
                  zIndex: 99999,
                }}
                className="rounded-2xl bg-[#090D18]/98 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_25px_rgba(244,63,94,0.12)] p-1.5 flex flex-col"
              >
                {searchable && (
                  <div
                    className="p-1 mb-1 border-b border-white/10 relative flex items-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Search
                      size={12}
                      className="absolute left-2.5 text-slate-400 pointer-events-none"
                    />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search options..."
                      className="w-full pl-7 pr-6 py-1.5 rounded-lg text-xs bg-slate-900/90 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50"
                      autoFocus
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="absolute right-2 p-0.5 text-slate-400 hover:text-white transition-colors"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                )}

                <div
                  className="overflow-y-auto max-h-56 flex flex-col gap-0.5 pr-0.5"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgba(255, 255, 255, 0.2) transparent",
                  }}
                >
                  {filteredOptions.length === 0 ? (
                    <div className="px-3 py-3 text-[11px] text-slate-500 text-center">
                      No options found
                    </div>
                  ) : (
                    filteredOptions.map((opt) => {
                      const isSelected =
                        opt.value.toLowerCase() === String(value).toLowerCase();
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onChange(opt.value);
                            setOpen(false);
                            setSearchTerm("");
                          }}
                          className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                            isSelected
                              ? "bg-primary/25 text-white border border-primary/35 font-bold shadow-sm"
                              : "text-slate-300 hover:text-white hover:bg-white/8"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate min-w-0">
                            {opt.icon && (
                              <span className="text-sm flex-shrink-0">
                                {opt.icon}
                              </span>
                            )}
                            <span className="truncate">{opt.label}</span>
                          </div>
                          {isSelected && (
                            <Check
                              size={13}
                              className="text-primary flex-shrink-0 ml-1"
                            />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
