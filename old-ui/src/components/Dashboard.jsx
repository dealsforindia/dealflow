import React, { useEffect, useState, useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import useStore from '../store';
import { resolveChannelName } from '../utils/helpers';
import { API_URL as API } from '../config';
import { Filter, Database, Target, Share2, TrendingUp, Users } from 'lucide-react';

export default function Dashboard() {
  const { deals, stats } = useStore();
  const [topChannels, setTopChannels] = useState([]);

  // ── Build REAL 24H volume chart from deal timestamps ──
  const volumeData = useMemo(() => {
    const now = Date.now();
    const buckets = Array.from({ length: 24 }).map((_, i) => ({
      time: `${String((new Date(now - (23 - i) * 3600_000)).getHours()).padStart(2, '0')}:00`,
      volume: 0,
    }));

    (deals || []).forEach(d => {
      if (!d.ts) return;
      const ts = d.ts > 1e12 ? d.ts : d.ts * 1000;
      const hoursAgo = (now - ts) / 3600_000;
      if (hoursAgo >= 0 && hoursAgo < 24) {
        const idx = Math.floor(23 - hoursAgo);
        if (idx >= 0 && idx < 24) buckets[idx].volume++;
      }
    });

    return buckets;
  }, [deals]);

  const hasRealData = volumeData.some(b => b.volume > 0);

  // Fetch real channel data for top-performers
  useEffect(() => {
    let cancelled = false;
    fetch(`${API}/api/v1/channels`)
      .then(r => r.json())
      .then(d => {
        if (cancelled) return;
        const list = Array.isArray(d) ? d : (d.channels || []);
        const sorted = [...list].sort((a, b) => (b.deals_24h ?? 0) - (a.deals_24h ?? 0)).slice(0, 5);
        setTopChannels(sorted);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Real stats from backend
  const mdb   = stats?.mongodb || {};
  const total = mdb.total   ?? deals.length;
  const dupes = mdb.dupes   ?? 0;
  const posted = mdb.posted ?? deals.filter(d => d.status === 'posted').length;
  const pending = mdb.pending ?? deals.filter(d => d.status === 'pending' || !d.status).length;
  const approvalRate = total > 0 ? ((posted / total) * 100).toFixed(1) : '0.0';

  const funnel = {
    scraped: total,
    deduped: Math.max(0, total - dupes),
    posted:  posted,
    pending: pending,
  };

  const kpis = [
    { label: 'Deals Ingested (24h)',  val: total,        icon: <Filter size={16} />,                                  accent: '' },
    { label: 'Duplicates Blocked',    val: dupes,        icon: <Database size={16} color="var(--accent-purple)" />,   accent: 'purple' },
    { label: 'Approval Rate',         val: `${approvalRate}%`, icon: <Target size={16} color="var(--accent-green)" />, accent: 'green' },
    { label: 'Total Output',          val: posted,       icon: <Share2 size={16} color="var(--accent-blue)" />,       accent: 'violet' },
  ];

  const funnelSteps = [
    { label: 'Scraped (Raw)',       val: funnel.scraped,  accent: 'muted',  pct: 100 },
    { label: 'Deduped (Unique)',    val: funnel.deduped,  accent: 'purple', pct: funnel.scraped > 0 ? (funnel.deduped / funnel.scraped) * 100 : 0 },
    { label: 'Pending Review',      val: funnel.pending,  accent: 'violet', pct: funnel.scraped > 0 ? (funnel.pending  / funnel.scraped) * 100 : 0 },
    { label: 'Posted',              val: funnel.posted,   accent: 'green',  pct: funnel.scraped > 0 ? (funnel.posted   / funnel.scraped) * 100 : 0 },
  ];

  return (
    <div className="center-panel dash-panel">
      <div className="center-header dash-header">
        <div>
          <div className="center-title">Command Center</div>
          <div className="center-subtitle">High-level overview of pipeline health and deal velocity</div>
        </div>
      </div>

      <div className="dash-body">

        {/* Top KPIs */}
        <div className="dashboard-kpi-grid">
          {kpis.map((k, i) => (
            <div key={i} className={`kpi-card kpi-card--${k.accent}`}>
              <div className="kpi-icon-wrap">
                <div className={`kpi-icon kpi-icon--${k.accent}`}>
                  {k.icon}
                </div>
              </div>
              <div className={`kpi-value kpi-value--${k.accent}`}>{k.val}</div>
              <div className="kpi-label">{k.label}</div>
            </div>
          ))}
        </div>

        {/* 3-Zone Layout */}
        <div className="dashboard-zone-grid">

          {/* ZONE 1: Funnel */}
          <div className="dash-zone-card">
            <div className="dash-zone-title">
              <Filter size={16} color="var(--accent-blue)" /> Pipeline Funnel
            </div>
            <div className="funnel-list">
              {funnelSteps.map((step, i) => (
                <div key={i} className="funnel-step">
                  <div className="funnel-step-header">
                    <span>{step.label}</span>
                    <span className="funnel-step-val">{Math.floor(step.val)}</span>
                  </div>
                  <div className="funnel-track">
                    <div
                      className={`funnel-fill funnel-fill--${step.accent}`}
                      style={{ width: `${Math.min(step.pct, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ZONE 2: Volume chart — REAL data from deal timestamps */}
          <div className="dash-zone-card">
            <div className="dash-zone-title">
              <TrendingUp size={16} color="var(--accent-purple)" /> 24H Deal Volume
              <span className={`dash-badge ${hasRealData ? 'dash-badge--live' : ''}`}>
                {hasRealData ? 'LIVE' : 'NO DATA'}
              </span>
            </div>
            <div className="volume-chart-area">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="var(--accent-purple)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--accent-purple)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '8px', fontSize: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: 'var(--accent-purple)' }}
                    labelStyle={{ color: 'var(--text-sec)', marginBottom: '4px' }}
                  />
                  <XAxis dataKey="time" hide />
                  <Area type="monotone" dataKey="volume" stroke="var(--accent-purple)" strokeWidth={3} fill="url(#volGrad)" animationDuration={1000} style={{ filter: 'drop-shadow(0 4px 12px rgba(168,85,247,0.4))' }} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="volume-time-axis">
                <span>24H AGO</span><span>NOW</span>
              </div>
            </div>
          </div>

          {/* ZONE 3: Top Channels — real data */}
          <div className="dash-zone-card">
            <div className="dash-zone-title">
              <Users size={16} color="var(--accent-green)" /> Top Channels
            </div>
            <div className="top-channels-list">
              {topChannels.length === 0 ? (
                <div className="dash-empty-msg">
                  Loading channel data…
                </div>
              ) : (
                topChannels.map((ch, i) => {
                  const chName  = resolveChannelName(ch.channel || ch.id);
                  const count   = ch.deals_24h ?? ch.deal_count ?? 0;
                  return (
                    <div key={i} className="top-channel-row">
                      <div className="top-channel-rank">
                        #{i + 1}
                      </div>
                      <div className="top-channel-info">
                        <div className="top-channel-name">{chName}</div>
                        <div className="top-channel-count">{count} deals (24h)</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
