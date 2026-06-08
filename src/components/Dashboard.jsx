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
    { label: 'Deals Ingested (24h)',  val: total,        icon: <Filter size={16} />,                                  color: 'var(--text-primary)' },
    { label: 'Duplicates Blocked',    val: dupes,        icon: <Database size={16} color="var(--accent-purple)" />,   color: 'var(--accent-purple)' },
    { label: 'Approval Rate',         val: `${approvalRate}%`, icon: <Target size={16} color="var(--accent-green)" />, color: 'var(--accent-green)' },
    { label: 'Total Output',          val: posted,       icon: <Share2 size={16} color="var(--accent-blue)" />,       color: 'var(--accent-blue)' },
  ];

  const funnelSteps = [
    { label: 'Scraped (Raw)',       val: funnel.scraped,  color: '#3f3f46',              pct: 100 },
    { label: 'Deduped (Unique)',    val: funnel.deduped,  color: 'var(--accent-purple)', pct: funnel.scraped > 0 ? (funnel.deduped / funnel.scraped) * 100 : 0 },
    { label: 'Pending Review',      val: funnel.pending,  color: 'var(--accent-blue)',   pct: funnel.scraped > 0 ? (funnel.pending  / funnel.scraped) * 100 : 0 },
    { label: 'Posted',              val: funnel.posted,   color: 'var(--accent-green)',  pct: funnel.scraped > 0 ? (funnel.posted   / funnel.scraped) * 100 : 0 },
  ];

  return (
    <div className="center-panel" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
      <div className="center-header" style={{ padding: '20px 24px', flexShrink: 0 }}>
        <div>
          <div className="center-title">Command Center</div>
          <div className="center-subtitle">High-level overview of pipeline health and deal velocity</div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '0 24px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Top KPIs */}
        <div className="dashboard-kpi-grid">
          {kpis.map((k, i) => (
            <div key={i} className="analytics-stat-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ color: 'var(--text-ter)' }}>{k.icon}</div>
              </div>
              <div className="analytics-stat-val" style={{ fontSize: '28px', color: k.color }}>{k.val}</div>
              <div className="analytics-stat-label">{k.label}</div>
            </div>
          ))}
        </div>

        {/* 3-Zone Layout */}
        <div className="dashboard-zone-grid">

          {/* ZONE 1: Funnel */}
          <div className="analytics-card" style={{ gap: '20px' }}>
            <div className="analytics-card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={12} /> Pipeline Funnel
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, justifyContent: 'center' }}>
              {funnelSteps.map((step, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--text-ter)' }}>
                    <span>{step.label}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{Math.floor(step.val)}</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--bg-app)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: step.color, width: `${Math.min(step.pct, 100)}%`, borderRadius: '4px', transition: 'width 1s ease-out' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ZONE 2: Volume chart — REAL data from deal timestamps */}
          <div className="analytics-card">
            <div className="analytics-card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={12} /> 24H Deal Volume
              <span style={{ marginLeft: 'auto', fontSize: '9px', background: hasRealData ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', color: hasRealData ? 'var(--accent-green)' : 'var(--text-ter)', letterSpacing: '0.04em' }}>
                {hasRealData ? 'LIVE' : 'NO DATA'}
              </span>
            </div>
            <div style={{ flex: 1, minHeight: 0, marginTop: '16px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="var(--accent-blue-lt)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--accent-blue-lt)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{ background: '#14141e', border: '1px solid var(--border-dim)', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: 'var(--accent-blue-lt)' }}
                    labelStyle={{ color: 'var(--text-ter)', marginBottom: '4px' }}
                  />
                  <XAxis dataKey="time" hide />
                  <Area type="monotone" dataKey="volume" stroke="var(--accent-blue-lt)" strokeWidth={2} fill="url(#volGrad)" animationDuration={1000} />
                </AreaChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-ter)', fontFamily: 'var(--mono)' }}>
                <span>24h ago</span><span>Now</span>
              </div>
            </div>
          </div>

          {/* ZONE 3: Top Channels — real data */}
          <div className="analytics-card">
            <div className="analytics-card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={12} /> Top Performing Channels
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', overflowY: 'auto' }}>
              {topChannels.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--text-ter)', textAlign: 'center', marginTop: '16px' }}>
                  Loading channel data…
                </div>
              ) : (
                topChannels.map((ch, i) => {
                  const chName  = resolveChannelName(ch.channel || ch.id);
                  const count   = ch.deals_24h ?? ch.deal_count ?? 0;
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border-dim)' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {chName}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-ter)', fontFamily: 'var(--mono)' }}>
                          {count} deals (24h)
                        </div>
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
