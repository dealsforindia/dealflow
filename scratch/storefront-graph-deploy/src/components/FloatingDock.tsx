import React, { useState, useEffect } from 'react';

interface FloatingDockProps {
  selectedStore: string;
  onSelectStore: (store: string) => void;
  onSelectLootOnly?: () => void;
}

const STORES = [
  { id: 'all',      label: 'All'      },
  { id: 'Amazon',   label: 'Amazon'   },
  { id: 'Flipkart', label: 'Flipkart' },
  { id: 'Myntra',   label: 'Myntra'   },
  { id: 'Swiggy',   label: 'Swiggy'   },
];

export const FloatingDock: React.FC<FloatingDockProps> = ({ selectedStore, onSelectStore }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 320);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="hidden md:flex"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 40,
        alignItems: 'center',
        gap: '4px',
        padding: '6px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: '2px',
      }}
      role="toolbar"
      aria-label="Quick store filter"
    >
      {STORES.map((s) => {
        const isActive = selectedStore.toLowerCase() === s.id.toLowerCase();
        return (
          <button
            key={s.id}
            onClick={() => onSelectStore(s.id)}
            aria-pressed={isActive}
            aria-label={`Filter by ${s.label}`}
            style={{
              minHeight: '36px',
              padding: '0 12px',
              fontSize: '12px',
              fontFamily: 'var(--font-body)',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? '#F5F5F5' : '#6B6B6B',
              backgroundColor: isActive ? '#1A1A1A' : 'transparent',
              border: isActive ? '1px solid #404040' : '1px solid transparent',
              borderRadius: '2px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'color 120ms ease, background-color 120ms ease',
            }}
            onMouseEnter={(e) => {
              if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = '#F5F5F5';
            }}
            onMouseLeave={(e) => {
              if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = '#6B6B6B';
            }}
          >
            {s.label}
          </button>
        );
      })}

      <div style={{ width: '1px', height: '20px', backgroundColor: '#262626', margin: '0 4px', flexShrink: 0 }} aria-hidden="true" />

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
        title="Back to top"
        style={{
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
          border: '1px solid transparent',
          borderRadius: '2px',
          cursor: 'pointer',
          color: '#6B6B6B',
          transition: 'color 120ms ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#F5F5F5')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#6B6B6B')}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M7 12V2M2 6l5-5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
};
