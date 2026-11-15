import React, { useRef, useEffect, useState } from 'react';
import { PublicDeal } from '../types';

interface CategoryBarProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  deals: PublicDeal[];
}

const CATEGORIES: { id: string; label: string; emoji: string }[] = [
  { id: 'all',         label: 'All Deals',    emoji: '' },
  { id: 'Electronics', label: 'Electronics',  emoji: '📱' },
  { id: 'Fashion',     label: 'Fashion',      emoji: '👗' },
  { id: 'Home',        label: 'Home',         emoji: '🏠' },
  { id: 'Kitchen',     label: 'Kitchen',      emoji: '🍳' },
  { id: 'Grocery',     label: 'Grocery',      emoji: '🍎' },
  { id: 'Beauty',      label: 'Beauty',       emoji: '💄' },
  { id: 'Sports',      label: 'Sports',       emoji: '🏋️' },
];

export const CategoryBar: React.FC<CategoryBarProps> = ({
  selectedCategory,
  onSelectCategory,
  deals,
}) => {
  const navRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number } | null>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Count deals per category
  const counts = React.useMemo(() => {
    const map: Record<string, number> = { all: deals.length };
    for (const d of deals) {
      const cat = (d.category || '').toLowerCase();
      for (const c of CATEGORIES) {
        if (c.id !== 'all' && cat.includes(c.id.toLowerCase())) {
          map[c.id] = (map[c.id] || 0) + 1;
        }
      }
    }
    return map;
  }, [deals]);

  // Slide the amber underline to the active button
  useEffect(() => {
    const activeBtn = buttonRefs.current.get(selectedCategory);
    const nav = navRef.current;
    if (!activeBtn || !nav) return;
    const navRect = nav.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    setIndicatorStyle({
      left: btnRect.left - navRect.left + nav.scrollLeft,
      width: btnRect.width,
    });
  }, [selectedCategory, deals]);

  return (
    <div
      style={{
        position: 'sticky',
        top: '48px',
        zIndex: 40,
        backgroundColor: 'var(--bg-base)',
        borderBottom: '1px solid var(--border-default)',
      }}
    >
      <div
        ref={navRef}
        role="tablist"
        aria-label="Deal categories"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 16px',
          display: 'flex',
          gap: '0',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          position: 'relative',
        }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory.toLowerCase() === cat.id.toLowerCase();
          const count = counts[cat.id] ?? 0;
          const label = cat.id === 'all'
            ? `All Deals${deals.length ? ` (${deals.length})` : ''}`
            : `${cat.emoji ? cat.emoji + ' ' : ''}${cat.label}${count ? ` (${count})` : ''}`;

          return (
            <button
              key={cat.id}
              ref={(el) => {
                if (el) buttonRefs.current.set(cat.id, el);
              }}
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectCategory(cat.id)}
              style={{
                position: 'relative',
                padding: '0 14px',
                height: '44px',
                fontSize: '12px',
                fontFamily: 'var(--font-body)',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'color 120ms ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
              }}
            >
              {label}
            </button>
          );
        })}

        {/* Sliding amber underline indicator */}
        {indicatorStyle && (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              bottom: 0,
              left: indicatorStyle.left,
              width: indicatorStyle.width,
              height: '2px',
              backgroundColor: 'var(--accent)',
              transition: 'left 200ms ease, width 200ms ease',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
    </div>
  );
};
