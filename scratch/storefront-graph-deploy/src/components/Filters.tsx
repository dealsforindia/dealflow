import React, { useState, useRef, useEffect } from 'react';
import { SortOption } from '../types';

interface FiltersProps {
  selectedStore: string;
  onSelectStore: (store: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalDeals?: number;
  onlyConsensus?: boolean;
  onToggleConsensus?: () => void;
}

const STORES = [
  { id: 'all', label: 'All Stores' },
  { id: 'Amazon', label: 'Amazon' },
  { id: 'Flipkart', label: 'Flipkart' },
  { id: 'Myntra', label: 'Myntra' },
  { id: 'AJIO', label: 'AJIO' },
  { id: 'Croma', label: 'Croma' },
  { id: 'Nykaa', label: 'Nykaa' },
  { id: 'Zepto', label: 'Zepto' },
  { id: 'Swiggy', label: 'Swiggy' },
  { id: 'Blinkit', label: 'Blinkit' },
];

const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'Mobiles', label: '📱 Mobiles & 5G' },
  { id: 'Electronics', label: '🔌 Electronics' },
  { id: 'Laptops', label: '💻 Laptops' },
  { id: 'Fashion', label: '👗 Fashion' },
  { id: 'Home', label: '🏠 Home & Living' },
  { id: 'Kitchen', label: '🍳 Kitchen' },
  { id: 'Grocery', label: '🍎 Grocery & Food' },
  { id: 'Beauty', label: '💄 Beauty & Personal' },
  { id: 'Sports', label: '🏋️ Sports & Fitness' },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest Deals' },
  { value: 'discount', label: 'Highest Discount' },
  { value: 'worth', label: 'Top Value Score' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
];

interface CustomDropdownProps<T extends string> {
  label: string;
  value: T;
  options: { id?: string; value?: string; label: string }[];
  onSelect: (val: T) => void;
}

function CustomDropdown<T extends string>({
  label,
  value,
  options,
  onSelect,
}: CustomDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const currentOption = options.find((o) => (o.id || o.value) === value) || options[0];
  const isFiltered = value !== 'all' && value !== 'newest';

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          fontSize: '12px',
          fontFamily: 'var(--font-body)',
          fontWeight: isFiltered ? 600 : 400,
          color: isFiltered ? 'var(--text-primary)' : 'var(--text-secondary)',
          backgroundColor: isFiltered ? 'var(--bg-raised)' : 'var(--bg-surface)',
          border: `1px solid ${isFiltered ? 'var(--border-strong)' : 'var(--border-default)'}`,
          borderRadius: '2px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          minHeight: '34px',
          transition: 'all 120ms ease',
        }}
      >
        <span style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
          {label}:
        </span>
        <span>{currentOption?.label}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden="true"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 150ms ease',
            color: 'var(--text-muted)',
            flexShrink: 0,
          }}
        >
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Animated Dropdown Menu */}
      {open && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 60,
            minWidth: '200px',
            maxHeight: '280px',
            overflowY: 'auto',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-strong)',
            borderRadius: '2px',
            padding: '4px',
            boxShadow: '0 12px 24px rgba(0,0,0,0.5)',
            animation: 'dropdownFadeIn 140ms ease-out both',
          }}
        >
          {options.map((opt) => {
            const optVal = (opt.id || opt.value) as T;
            const isSelected = optVal.toLowerCase() === value.toLowerCase();

            return (
              <button
                key={optVal}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onSelect(optVal);
                  setOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '8px 10px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-body)',
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                  backgroundColor: isSelected ? 'var(--bg-raised)' : 'transparent',
                  border: 'none',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 80ms linear',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-raised)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isSelected && (
                    <span style={{ width: '4px', height: '4px', backgroundColor: 'var(--accent)', borderRadius: '1px' }} />
                  )}
                  <span>{opt.label}</span>
                </div>
                {isSelected && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2.5 6.5l2.5 2.5 4.5-5" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes dropdownFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export const Filters: React.FC<FiltersProps> = ({
  selectedStore,
  onSelectStore,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  totalDeals,
  onlyConsensus = false,
  onToggleConsensus,
}) => {
  const hasActiveFilters =
    selectedStore.toLowerCase() !== 'all' ||
    selectedCategory.toLowerCase() !== 'all' ||
    onlyConsensus;

  const handleClearAll = () => {
    onSelectStore('all');
    onSelectCategory('all');
    if (onlyConsensus && onToggleConsensus) {
      onToggleConsensus();
    }
  };

  return (
    <div
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
      role="region"
      aria-label="Deal filters"
    >
      {/* Row 1: Command Strip Dropdowns */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Store Dropdown */}
          <CustomDropdown
            label="Store"
            value={selectedStore}
            options={STORES}
            onSelect={(val) => onSelectStore(val)}
          />

          {/* Category Dropdown */}
          <CustomDropdown
            label="Category"
            value={selectedCategory}
            options={CATEGORIES}
            onSelect={(val) => onSelectCategory(val)}
          />

          {/* Multi-Source Consensus Pill */}
          {onToggleConsensus && (
            <button
              type="button"
              onClick={onToggleConsensus}
              aria-pressed={onlyConsensus}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontFamily: 'var(--font-body)',
                fontWeight: onlyConsensus ? 600 : 400,
                border: `1px solid ${onlyConsensus ? 'var(--accent)' : 'var(--border-default)'}`,
                borderRadius: '2px',
                cursor: 'pointer',
                backgroundColor: onlyConsensus ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                color: onlyConsensus ? 'var(--accent)' : 'var(--text-secondary)',
                minHeight: '34px',
                transition: 'all 120ms ease',
              }}
            >
              <span>Multi-Source Verified</span>
              {onlyConsensus && (
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)' }}>✓</span>
              )}
            </button>
          )}
        </div>

        {/* Sort Dropdown & Total deals indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {totalDeals !== undefined && (
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }} className="hidden sm:inline">
              {totalDeals} deals found
            </span>
          )}

          <CustomDropdown
            label="Sort"
            value={sortBy}
            options={SORT_OPTIONS}
            onSelect={(val) => onSortChange(val as SortOption)}
          />
        </div>
      </div>

      {/* Row 2: Removable Active Filter Chips */}
      {hasActiveFilters && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            paddingTop: '4px',
          }}
        >
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
            Active:
          </span>

          {selectedStore.toLowerCase() !== 'all' && (
            <button
              type="button"
              onClick={() => onSelectStore('all')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '2px 8px',
                backgroundColor: 'var(--bg-raised)',
                border: '1px solid var(--border-default)',
                borderRadius: '2px',
                color: 'var(--text-primary)',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
              }}
            >
              <span>Store: {selectedStore}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>×</span>
            </button>
          )}

          {selectedCategory.toLowerCase() !== 'all' && (
            <button
              type="button"
              onClick={() => onSelectCategory('all')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '2px 8px',
                backgroundColor: 'var(--bg-raised)',
                border: '1px solid var(--border-default)',
                borderRadius: '2px',
                color: 'var(--text-primary)',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
              }}
            >
              <span>Category: {selectedCategory}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>×</span>
            </button>
          )}

          {onlyConsensus && onToggleConsensus && (
            <button
              type="button"
              onClick={onToggleConsensus}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '2px 8px',
                backgroundColor: 'var(--accent-subtle)',
                border: '1px solid var(--accent)',
                borderRadius: '2px',
                color: 'var(--accent)',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
              }}
            >
              <span>Multi-Source</span>
              <span style={{ fontSize: '12px' }}>×</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleClearAll}
            style={{
              padding: '2px 8px',
              color: 'var(--text-muted)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};
