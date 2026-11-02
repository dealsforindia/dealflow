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
  values,
  onChange,
  onChangeMultiple,
  options,
  placeholder,
  searchable = false,
  align = "left",
  className = "",
  multiple = false,
}: {
  value?: string;
  values?: string[];
  onChange?: (val: string) => void;
  onChangeMultiple?: (vals: string[]) => void;
  options: DropdownOption[];
  placeholder?: string;
  searchable?: boolean;
  align?: "left" | "right";
  className?: string;
  multiple?: boolean;
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

  const currentValues: string[] = values
    ? values
    : value !== undefined && value !== ""
    ? [value]
    : ["All"];

  const isAllSelected = currentValues.includes("All");

  let triggerIcon: React.ReactNode = undefined;
  let triggerLabel = placeholder || "Select";
  let triggerBadge: string | number | undefined = undefined;

  if (multiple) {
    if (isAllSelected) {
      const allOpt = options.find((o) => o.value === "All");
      triggerIcon = allOpt?.icon || "⚡";
      triggerLabel = allOpt?.label || "All Channels";
      triggerBadge = undefined;
    } else if (currentValues.length === 0) {
      triggerIcon = "📡";
      triggerLabel = "No Channels";
      triggerBadge = 0;
    } else if (currentValues.length === 1) {
      const matched = options.find(
        (o) => o.value.toLowerCase() === currentValues[0].toLowerCase()
      );
      triggerIcon = matched?.icon || "📡";
      triggerLabel = matched?.label || currentValues[0];
      triggerBadge = matched?.badge;
    } else {
      triggerIcon = "📡";
      triggerLabel = `${currentValues.length} Channels`;
      triggerBadge = currentValues.length;
    }
  } else {
    const selectedOption = options.find(
      (o) => o.value.toLowerCase() === String(value).toLowerCase()
    ) || {
      value: String(value),
      label: placeholder || String(value),
    };
    triggerIcon = selectedOption.icon;
    triggerLabel = selectedOption.label;
    triggerBadge = selectedOption.badge;
  }

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const minW = multiple ? 270 : 220;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const dropdownWidth = Math.min(Math.max(rect.width, minW), windowWidth - 20);
    const dropdownHeight = multiple ? 350 : 280;

    let placement: "bottom" | "top" = "bottom";
    let top = rect.bottom + 6;

    if (rect.bottom + dropdownHeight > windowHeight - 12 && rect.top > dropdownHeight + 12) {
      top = rect.top - dropdownHeight - 6;
      placement = "top";
    }

    let left = align === "right" ? rect.right - dropdownWidth : rect.left;

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
  }, [align, multiple]);

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
      if (menuRef.current?.contains(e.target as Node)) return;
      updatePosition();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Home" || e.key === "End") {
        const buttons = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") || []);
        if (!buttons.length) return;
        e.preventDefault();
        const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
        const next = e.key === "Home" ? 0 : e.key === "End" ? buttons.length - 1 : (index + (e.key === "ArrowUp" ? -1 : 1) + buttons.length) % buttons.length;
        buttons[next].focus();
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

  const handleToggleOption = (optVal: string) => {
    if (!multiple) {
      onChange?.(optVal);
      setOpen(false);
      setSearchTerm("");
      return;
    }

    if (!onChangeMultiple) return;

    if (optVal === "All") {
      if (isAllSelected) {
        onChangeMultiple([]);
      } else {
        onChangeMultiple(["All"]);
      }
      return;
    }

    let next: string[];
    if (isAllSelected) {
      next = [optVal];
    } else {
      const exists = currentValues.some(
        (v) => v.toLowerCase() === optVal.toLowerCase()
      );
      if (exists) {
        next = currentValues.filter(
          (v) => v.toLowerCase() !== optVal.toLowerCase()
        );
      } else {
        next = [...currentValues, optVal];
      }
    }

    const nonAllOptions = options.filter((o) => o.value !== "All");
    if (next.length > 0 && next.length >= nonAllOptions.length) {
      onChangeMultiple(["All"]);
    } else {
      onChangeMultiple(next);
    }
  };

  const handleSelectAll = () => {
    onChangeMultiple?.(["All"]);
  };

  const handleClearAll = () => {
    onChangeMultiple?.([]);
  };

  const filteredOptions =
    searchable && searchTerm.trim()
      ? options.filter((o) =>
          o.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options;

  const hasActiveCustomFilter = multiple && !isAllSelected && currentValues.length > 0;

  return (
    <div className={`relative select-none inline-block ${className}`}>
      {/* Trigger Button */}
      <motion.button
        ref={triggerRef}
        aria-expanded={open}
        aria-label={placeholder ? `${placeholder}: ${triggerLabel}` : triggerLabel}
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
          open
            ? "bg-white border-[#5B50E6] text-[#5B50E6] ring-2 ring-[#5B50E6]/15 shadow-sm"
            : hasActiveCustomFilter
            ? "bg-indigo-50 border-[#C7D2FE] text-[#4F46E5] hover:border-[#5B50E6]"
            : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50/80 shadow-2xs"
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0 truncate">
          {triggerIcon && (
            <span className="flex-shrink-0 text-xs sm:text-sm">{triggerIcon}</span>
          )}
          <span className="truncate flex-1 font-medium text-left">
            {triggerLabel}
          </span>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0 ml-1">
          {triggerBadge !== undefined && (
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
              hasActiveCustomFilter
                ? "bg-indigo-100 text-[#4F46E5] border border-indigo-200 font-bold"
                : "bg-gray-100 text-gray-500"
            }`}>
              {triggerBadge}
            </span>
          )}
          <ChevronDown
            size={12}
            className={`transition-transform duration-200 ${
              open ? "rotate-180 text-[#5B50E6]" : "text-gray-400"
            }`}
          />
        </div>
      </motion.button>

      {/* Portaled Popover Menu */}
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
                  minWidth: "220px",
                  maxWidth: "340px",
                  zIndex: 99999,
                }}
                className="dealflow-dropdown rounded-2xl bg-white border border-gray-200 shadow-xl p-2 flex flex-col"
              >
                {searchable && (
                  <div
                    className="p-1 mb-1 border-b border-gray-100 relative flex items-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Search
                      size={12}
                      className="absolute left-2.5 text-gray-400 pointer-events-none"
                    />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search options..."
                      className="w-full pl-7 pr-6 py-1.5 rounded-lg text-xs bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#5B50E6]"
                      autoFocus
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="absolute right-2 p-0.5 text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                )}

                {/* Multi-Select Action / Status Header */}
                {multiple && (
                  <div
                    className="flex items-center justify-between px-2 py-1 mb-1 border-b border-gray-100 text-[11px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-gray-500 font-medium truncate">
                      {isAllSelected
                        ? "All channels active"
                        : currentValues.length === 0
                        ? "0 selected"
                        : `${currentValues.length} of ${options.filter((o) => o.value !== "All").length} selected`}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectAll();
                        }}
                        className="text-[#5B50E6] hover:text-[#4E43D8] font-semibold cursor-pointer transition-colors"
                      >
                        Select All
                      </button>
                      <span className="text-gray-300">•</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearAll();
                        }}
                        className="text-gray-500 hover:text-gray-800 cursor-pointer transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}

                <div
                  className="overflow-y-auto max-h-56 flex flex-col gap-0.5 pr-0.5"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgba(0, 0, 0, 0.1) transparent",
                  }}
                >
                  {filteredOptions.length === 0 ? (
                    <div className="px-3 py-3 text-[11px] text-gray-400 text-center">
                      No options found
                    </div>
                  ) : (
                    filteredOptions.map((opt) => {
                      if (multiple) {
                        const isAllOption = opt.value === "All";
                        const isChecked = isAllOption
                          ? isAllSelected
                          : !isAllSelected &&
                            currentValues.some(
                              (v) => v.toLowerCase() === opt.value.toLowerCase()
                            );

                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleOption(opt.value);
                            }}
                            className={`group flex items-center justify-between gap-2 px-2 py-1.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                              isChecked
                                ? "bg-indigo-50 text-[#5B50E6] border border-indigo-200/60 font-semibold shadow-2xs"
                                : "text-gray-700 hover:text-gray-900 hover:bg-gray-50 border border-transparent"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate min-w-0 flex-1">
                              {/* Modern Checkbox */}
                              <div
                                className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                                  isChecked
                                    ? "bg-[#5B50E6] border-[#5B50E6] text-white"
                                    : "border-gray-300 bg-white group-hover:border-gray-400"
                                }`}
                              >
                                {isChecked && (
                                  <Check size={11} strokeWidth={3} className="text-white" />
                                )}
                              </div>

                              {opt.icon && (
                                <span className="text-sm flex-shrink-0">{opt.icon}</span>
                              )}
                              <span className="truncate">{opt.label}</span>
                            </div>

                            {opt.badge !== undefined && (
                              <span className="px-1.5 py-0.5 rounded-md bg-gray-100 text-[10px] font-mono text-gray-500 flex-shrink-0">
                                {opt.badge}
                              </span>
                            )}
                          </button>
                        );
                      }

                      // Single-select mode
                      const isSelected =
                        opt.value.toLowerCase() === String(value).toLowerCase();
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onChange?.(opt.value);
                            setOpen(false);
                            setSearchTerm("");
                          }}
                          className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                            isSelected
                              ? "bg-indigo-50 text-[#5B50E6] border border-indigo-200/60 font-bold shadow-2xs"
                              : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
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
                              className="text-[#5B50E6] flex-shrink-0 ml-1"
                            />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Multi-Select Footer Done Button */}
                {multiple && (
                  <div
                    className="mt-1.5 pt-1.5 border-t border-gray-100 flex items-center justify-between px-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-[11px] text-gray-500 truncate max-w-[150px]">
                      {isAllSelected
                        ? "All channels active"
                        : currentValues.length === 0
                        ? "0 selected"
                        : `${currentValues.length} active`}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpen(false);
                        setSearchTerm("");
                      }}
                      className="px-3 py-1 rounded-lg bg-[#5B50E6] hover:bg-[#4E43D8] text-white text-xs font-semibold cursor-pointer transition-all active:scale-95 shadow-sm"
                    >
                      Done
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
