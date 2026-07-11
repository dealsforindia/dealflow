import React from 'react';
import useStore from '../store';
import { resolveChannelName } from '../utils/helpers';
import {
  LayoutDashboard, GitFork, Radio, Settings2, LogOut, Activity, Globe,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Review',    icon: LayoutDashboard },
  { label: 'DesiDime',  icon: Globe },
  { label: 'Dashboard', icon: Activity },
  { label: 'Clones',    icon: GitFork },
  { label: 'Channels',  icon: Radio },
  { label: 'Settings',  icon: Settings2 },
];

export default function Sidebar({ activeTab, setActiveTab, isOpen, closeSidebar, onFilterChannel }) {
  const { channelConfig, deals } = useStore();

  const dynamicChannels = channelConfig.length > 0
    ? channelConfig.map(c => ({ id: c.channel || c, active: c.active !== false }))
    : [];

  // Real deal counts dynamically calculated from in-memory deals
  const dealCountMap = {};
  (deals || []).forEach(d => {
    const cId = d.channel || d.source_channel || d.channel_title;
    if (cId) {
      if (!dealCountMap[cId]) dealCountMap[cId] = 0;
      dealCountMap[cId]++;
    }
  });

  const handleChannelClick = (chId) => {
    // Navigate to Review board and filter by this channel
    setActiveTab('Review');
    closeSidebar();
    if (onFilterChannel) onFilterChannel(chId);
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={closeSidebar} />
      <div className={`left-panel ${isOpen ? 'open' : ''}`}>
        <div className="logo-block">
          <div className="logo-icon"><Activity size={17} strokeWidth={2.5} /></div>
          <div className="logo-text">
            <div className="logo-title">DealFlow</div>
            <div className="logo-sub">DealBot</div>
          </div>
        </div>

        <div className="nav-menu">
          {NAV_ITEMS.map(({ label, icon: Icon }) => (
            <div
              key={label}
              className={`nav-item ${activeTab === label ? 'active' : ''}`}
              onClick={() => setActiveTab(label)}
            >
              <Icon size={15} strokeWidth={activeTab === label ? 2.5 : 2} style={{ flexShrink: 0 }} />
              {label}
            </div>
          ))}
        </div>

        <div className="sidebar-section">
          <div className="section-title">Channels</div>
          <div className="channel-list">
            {dynamicChannels.map(ch => {
              const displayName = resolveChannelName(ch.id);
              const count = dealCountMap[ch.id];
              const color = ch.active ? '#6366f1' : '#3f3f46';

              return (
                <div
                  key={ch.id}
                  className={`channel-item${!ch.active ? ' paused' : ''}`}
                  style={{ cursor: 'pointer' }}
                  title={`Filter Review board by ${displayName}`}
                  onClick={() => handleChannelClick(ch.id)}
                >
                  <div
                    className="channel-avatar"
                    style={{
                      background: ch.active ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)',
                      color:      ch.active ? '#a5b4fc' : '#52525b',
                    }}
                  >
                    {displayName[0].toUpperCase()}
                  </div>
                  <div className="channel-item-body">
                    <div className="channel-item-name" style={{ fontSize: '11px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {displayName}
                    </div>
                    <div className="channel-item-meta">
                      {count !== null && count !== undefined ? (
                        <span
                          className="channel-item-count"
                          style={{
                            fontSize: '10px',
                            fontFamily: 'var(--mono)',
                            color: count > 0 ? 'var(--accent-green)' : 'var(--text-ter)',
                            fontWeight: count > 0 ? '600' : '400',
                          }}
                        >
                          {count} deals
                        </span>
                      ) : (
                        <span style={{ fontSize: '9px', color: '#52525b', fontStyle: 'italic' }}>pending…</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="user-block">
          <div className="user-avatar" />
          <div className="user-info">Rudranil</div>
          <LogOut size={14} strokeWidth={2} style={{ color: 'var(--text-ter)', cursor: 'pointer' }} />
        </div>
      </div>
    </>
  );
}
