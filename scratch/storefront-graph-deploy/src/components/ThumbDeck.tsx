import React from 'react';
import { IconFeed, IconSearch, IconStore, IconPlus } from './Icons';

export type ActiveDeckTab = 'feed' | 'search' | 'stores' | 'submit';

interface ThumbDeckProps {
  activeTab: ActiveDeckTab;
  onSelectTab: (tab: ActiveDeckTab) => void;
}

export const ThumbDeck: React.FC<ThumbDeckProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const tabs = [
    { id: 'feed' as const, label: 'Feed', icon: IconFeed },
    { id: 'search' as const, label: 'Search', icon: IconSearch },
    { id: 'stores' as const, label: 'Stores', icon: IconStore },
    { id: 'submit' as const, label: 'Submit', icon: IconPlus },
  ];

  return (
    <nav
      aria-label="Mobile thumb navigation"
      className="md:hidden pro-card"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        borderTop: '1px solid var(--border-default)',
        borderBottom: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        borderRadius: 0,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        height: 'calc(54px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const IconComponent = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            aria-current={isActive ? 'page' : undefined}
            style={{
              flex: 1,
              height: '54px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              color: isActive ? '#F4F4F5' : 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px 0',
              transition: 'color 100ms linear',
            }}
          >
            <IconComponent size={18} stroke={isActive ? 'var(--accent)' : 'currentColor'} />
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '10px',
                fontWeight: isActive ? 600 : 400,
                letterSpacing: '0.02em',
                lineHeight: 1,
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
