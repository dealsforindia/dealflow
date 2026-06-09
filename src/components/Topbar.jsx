import React, { useEffect, useState } from 'react';
import useStore from '../store';
import { Wifi, WifiOff, Clock3, Layers, CheckCheck, AlignJustify, Database, Menu } from 'lucide-react';

export default function Topbar({ onToggleSidebar, setActiveTab }) {
  const { wsStatus, stats } = useStore();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const isLive = wsStatus === 'connected';
  const pendingCount = stats?.mongodb?.pending ?? stats?.pending ?? '—';
  const postedCount  = stats?.mongodb?.posted  ?? stats?.posted  ?? '—';

  return (
    <div className="topbar">
      <div className="mobile-menu-btn" onClick={onToggleSidebar}>
        <Menu size={18} strokeWidth={2.5} />
      </div>
      <div className="topbar-logo">DealFlow</div>
      <div className="topbar-divider" />

      <div className={`ws-indicator ${isLive ? 'live' : 'dead'}`}>
        <div className="ws-dot" />
        {isLive
          ? <><Wifi size={11} strokeWidth={2.5} /><span>LIVE</span></>
          : <><WifiOff size={11} strokeWidth={2} /><span>OFFLINE</span></>
        }
      </div>

      <div className="topbar-divider" />

      {/* Pending → navigate to Review > Products tab */}
      <div
        className="topbar-stat"
        style={{ cursor: 'pointer' }}
        title="Go to pending deals"
        onClick={() => setActiveTab && setActiveTab('Review', 'Products')}
      >
        <span><AlignJustify size={8} strokeWidth={2.5} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} />PENDING</span>
        <strong className="amber">{pendingCount}</strong>
      </div>

      {/* Posted → navigate to Review > Posted tab */}
      <div
        className="topbar-stat"
        style={{ cursor: 'pointer' }}
        title="Go to posted deals"
        onClick={() => setActiveTab && setActiveTab('Review', 'Posted')}
      >
        <span><CheckCheck size={8} strokeWidth={2.5} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} />POSTED</span>
        <strong className="green">{postedCount}</strong>
      </div>

      <div className="topbar-stat hide-mobile">
        <span><Layers size={8} strokeWidth={2.5} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} />QUEUE</span>
        <strong>{stats?.redis?.queue_depth ?? stats?.queue_len ?? '—'}</strong>
      </div>
      <div className="topbar-stat hide-mobile">
        <span><Database size={8} strokeWidth={2.5} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} />REDIS</span>
        <strong>{stats?.redis?.memory_used ?? '—'}</strong>
      </div>

      <div className="topbar-spacer" />
      <div className="topbar-time">
        <Clock3 size={11} strokeWidth={2} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5, opacity: 0.5 }} />
        {time.toLocaleTimeString('en-IN')}
      </div>
    </div>
  );
}
