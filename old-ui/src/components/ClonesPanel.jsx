import React, { useEffect, useRef, useState } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { ChevronDown, ChevronUp, CornerDownRight, GitFork } from 'lucide-react';
import { resolveChannelName } from '../utils/helpers';
import { API_URL as API } from '../config';

const NODE_COLORS = {
  source:  { bg: 'rgba(251,191,36,0.15)',  border: '#fbbf24', text: '#fbbf24' },
  channel: { bg: 'rgba(59,130,246,0.12)', border: '#3B82F6', text: '#93c5fd' },
};

/* ── Build graph from duplicate data ── */
function buildGraph(groups) {
  const nodeMap = {};
  const edges   = [];

  groups.forEach(group => {
    const src = group.primaryChannel || group.source_channel || 'Unknown';
    if (!nodeMap[src]) nodeMap[src] = { id: src, type: 'source', deals: 0 };
    nodeMap[src].deals += 1;

    (group.clones || []).forEach(clone => {
      const ch = clone.ch || clone.channel || clone.source_channel;
      if (!ch) return;
      if (!nodeMap[ch]) nodeMap[ch] = { id: ch, type: 'channel', deals: 0 };
      nodeMap[ch].deals += 1;
      edges.push({ from: src, to: ch, weight: 1, active: true });
    });
  });

  // Aggregate duplicate edges
  const edgeMap = {};
  edges.forEach(e => {
    const key = `${e.from}→${e.to}`;
    if (!edgeMap[key]) edgeMap[key] = { ...e };
    else edgeMap[key].weight += 1;
  });

  const nodes = Object.values(nodeMap);
  // Assign positions in a circular layout
  const total = nodes.length;
  nodes.forEach((n, i) => {
    if (n.type === 'source') {
      n.x = 0.5;
      n.y = 0.15;
    } else {
      const angle = (i / (total - 1 || 1)) * Math.PI * 1.2 + Math.PI * (-0.1);
      n.x = 0.5 + Math.cos(angle) * 0.35;
      n.y = 0.55 + Math.sin(angle) * 0.28;
    }
  });

  return { nodes, edges: Object.values(edgeMap) };
}

function NetworkGraph({ nodes, edges }) {
  const svgRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [pulse, setPulse]             = useState(null);
  const [dims, setDims]               = useState({ w: 600, h: 380 });

  useEffect(() => {
    const el = svgRef.current?.parentElement;
    if (!el) return;
    const update = () => setDims({ w: el.clientWidth || 600, h: el.clientHeight || 380 });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!edges.length) return;
    const active = edges.filter(e => e.active);
    let idx = 0;
    const t = setInterval(() => { setPulse(active[idx % active.length]); idx++; }, 1800);
    return () => clearInterval(t);
  }, [edges]);

  const { w, h } = dims;
  const PAD = w < 450 ? 36 : 60;
  const maxWeight = Math.max(...edges.map(e => e.weight), 1);

  const pos = (node) => ({
    x: PAD + node.x * (w - PAD * 2),
    y: PAD + node.y * (h - PAD * 2),
  });

  const nodePos = {};
  nodes.forEach(n => { nodePos[n.id] = pos(n); });

  return (
    <div className="network-graph-container" style={{ position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      <svg ref={svgRef} width="100%" height="100%" style={{ display: 'block', overflow: 'visible', width: '100%', height: '100%' }}>
        <defs>
          <marker id="arrow-net"    markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="rgba(59,130,246,0.6)" />
          </marker>
          <marker id="arrow-active" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#3B82F6" />
          </marker>
        </defs>

        {edges.map((edge, i) => {
          const from = nodePos[edge.from];
          const to   = nodePos[edge.to];
          if (!from || !to) return null;
          const strokeW  = 1 + (edge.weight / maxWeight) * 4;
          const isPulse  = pulse?.from === edge.from && pulse?.to === edge.to;
          const mx = (from.x + to.x) / 2 + (to.y - from.y) * 0.12;
          const my = (from.y + to.y) / 2 - (to.x - from.x) * 0.12;
          const dx = to.x - from.x, dy = to.y - from.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const ex = to.x - (dx / dist) * 32;
          const ey = to.y - (dy / dist) * 32;
          return (
            <g key={i}>
              <path
                d={`M ${from.x} ${from.y} Q ${mx} ${my} ${ex} ${ey}`}
                fill="none"
                stroke={edge.active ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.06)'}
                strokeWidth={strokeW}
                markerEnd={edge.active ? `url(#arrow-active)` : `url(#arrow-net)`}
              />
              <text x={mx} y={my - 5} fill="rgba(255,255,255,0.25)" fontSize="9" textAnchor="middle" fontFamily="monospace">
                {edge.weight}×
              </text>
              {isPulse && (
                <circle r="5" fill="#3B82F6" opacity="0.9">
                  <animateMotion dur="1.2s" repeatCount="1" path={`M ${from.x} ${from.y} Q ${mx} ${my} ${ex} ${ey}`} />
                  <animate attributeName="opacity" values="0;1;0" dur="1.2s" repeatCount="1" />
                </circle>
              )}
            </g>
          );
        })}

        {nodes.map(node => {
          const p         = nodePos[node.id];
          const isHovered = hoveredNode === node.id;
          const colors    = NODE_COLORS[node.type] || NODE_COLORS.channel;
          const r         = (node.type === 'source' ? 32 : 26) * (w < 450 ? 0.7 : 1);
          const fontSize  = w < 450 ? 8 : 10;
          const label     = resolveChannelName(node.id);
          const maxChars  = w < 450 ? 10 : 14;
          const shortLabel = label.length > maxChars ? label.slice(0, maxChars - 1) + '…' : label;
          return (
            <g key={node.id} style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {isHovered && <circle cx={p.x} cy={p.y} r={r + 8} fill="none" stroke={colors.border} strokeWidth="1" opacity="0.3" />}
              <circle cx={p.x} cy={p.y} r={r} fill={colors.bg} stroke={colors.border} strokeWidth={isHovered ? 2 : 1} style={{ transition: 'stroke-width 0.15s' }} />
              <text x={p.x} y={p.y + r + 14} textAnchor="middle" fill={colors.text}               fontSize={fontSize}     fontWeight="600" fontFamily="var(--mono)">{shortLabel}</text>
              <text x={p.x} y={p.y + r + 24} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={fontSize - 1} fontFamily="var(--mono)">{node.deals} deals</text>
            </g>
          );
        })}
      </svg>

      <div style={{ position: 'absolute', bottom: '8px', left: '12px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '20px', height: '2px', background: 'rgba(59,130,246,0.6)' }} />
          <span style={{ fontSize: '10px', color: 'var(--text-ter)' }}>Active copy chain</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6' }} />
          <span style={{ fontSize: '10px', color: 'var(--text-ter)' }}>Live clone detected</span>
        </div>
      </div>
    </div>
  );
}

export default function ClonesPanel() {
  const [groups,   setGroups]   = useState(null); // null = loading
  const [error,    setError]    = useState(null);
  const [expanded, setExpanded] = useState({});
  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const r = await fetch(`${API}/api/v1/deals/duplicates`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const d = await r.json();
        if (cancelled) return;
        // Shape: { groups: [...] } or an array
        const raw = Array.isArray(d) ? d : (d.groups || d.duplicates || []);
        setGroups(raw);
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const { nodes, edges } = groups && groups.length > 0
    ? buildGraph(groups)
    : { nodes: [], edges: [] };

  const totalClones  = groups ? groups.reduce((acc, g) => acc + (g.clones?.length || 0), 0) : 0;
  const activeChains = groups ? groups.filter(g => g.clones?.length > 0).length : 0;

  const isEmpty = groups !== null && groups.length === 0;
  const isLoading = groups === null && !error;

  return (
    <div className="center-panel" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
      <div className="center-header" style={{ padding: '20px 24px', flexShrink: 0 }}>
        <div>
          <div className="center-title">Clone Network Graph</div>
          <div className="center-subtitle">
            Who copies whom · Arrow thickness = copy frequency · Live pulses = active clone chain
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {isLoading && (
            <span style={{ fontSize: '11px', color: 'var(--text-ter)' }}>Loading…</span>
          )}
          {!isLoading && !error && (
            <span style={{ fontSize: '11px', background: 'rgba(23,201,100,0.1)', border: '1px solid rgba(23,201,100,0.2)', color: 'var(--accent-green)', padding: '4px 10px', borderRadius: '8px' }}>
              Live Data
            </span>
          )}
          {error && (
            <span style={{ fontSize: '11px', background: 'rgba(243,18,96,0.1)', border: '1px solid rgba(243,18,96,0.2)', color: 'var(--accent-red)', padding: '4px 10px', borderRadius: '8px' }}>
              Backend offline
            </span>
          )}
        </div>
      </div>

      {(isEmpty || error) ? (
        <div className="empty-state" style={{ flex: 1, justifyContent: 'center' }}>
          <div className="empty-icon"><GitFork size={48} strokeWidth={1} /></div>
          {error ? (
            <>
              <div className="empty-title">Backend offline</div>
              <div className="empty-sub">Clone network data requires a live server connection</div>
            </>
          ) : (
            <>
              <div className="empty-title">No clone chains detected yet</div>
              <div className="empty-sub">Data builds up over time as deals are ingested and deduplicated</div>
            </>
          )}
        </div>
      ) : isLoading ? (
        <div className="empty-state" style={{ flex: 1, justifyContent: 'center' }}>
          <div className="empty-sub">Loading duplicate data…</div>
        </div>
      ) : (
        <div className="clones-layout-grid">
          <div className="clones-graph-area">
            {isLoading ? (
              <div className="empty-state" style={{ flex: 1 }}>
                <div className="empty-sub">Loading duplicate data…</div>
              </div>
            ) : (
              <NetworkGraph nodes={nodes} edges={edges} />
            )}
          </div>

          <div className="clones-stats-panel" style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-panel)', borderLeft: '1px solid var(--border-dim)' }}>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--border-dim)', borderBottom: '1px solid var(--border-dim)' }}>
              {[
                { label: 'Total Clones Blocked', val: totalClones,  color: 'var(--accent-blue)' },
                { label: 'Active Chains',         val: activeChains, color: 'var(--accent-amber)' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--bg-card)', padding: '20px 16px', textAlign: 'center', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)' }}>
                  <div style={{ fontSize: '28px', fontWeight: '700', fontFamily: 'var(--display)', color: s.color, letterSpacing: '-0.02em' }}>{s.val}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-sec)', marginTop: '4px', fontWeight: '500' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ padding: '20px 16px 12px', fontSize: '12px', fontWeight: '700', color: 'var(--text-ter)', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid var(--border-dim)' }}>
              Recent Clone Events
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {(groups || []).map((group, gi) => {
                const id        = group.id || group._id || `dup-${gi}`;
                const isExpanded = expanded[id];
                const title     = group.title || group.prod_name || 'Duplicate deal';
                const primary   = resolveChannelName(group.primaryChannel || group.source_channel);
                const clones    = group.clones || [];
                return (
                  <div key={id} style={{ borderBottom: '1px solid var(--border-dim)' }}>
                    <div
                      style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
                      onClick={() => toggle(id)}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '600', lineHeight: '1.4', marginBottom: '6px' }}>
                          {title.length > 38 ? title.slice(0, 38) + '…' : title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '9px', background: 'rgba(245,158,11,0.15)', color: 'var(--accent-amber)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700', letterSpacing: '0.05em' }}>ORIGINAL</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-sec)', fontFamily: 'var(--mono)' }}>{primary}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0, marginLeft: '12px' }}>
                        <span style={{ fontSize: '10px', background: 'rgba(244,63,94,0.15)', color: 'var(--accent-red)', padding: '3px 8px', borderRadius: '6px', fontWeight: '700' }}>
                          {clones.length} Clones
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--text-ter)' }}>{isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
                      </div>
                    </div>
                    {isExpanded && (
                      <div style={{ paddingBottom: '12px', background: 'rgba(255,255,255,0.01)' }}>
                        {clones.map((c, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 16px 6px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '10px', color: 'var(--text-ter)', fontFamily: 'var(--mono)' }}><CornerDownRight size={12} style={{ opacity: 0.6 }} /></span>
                              <span style={{ fontSize: '9px', background: 'rgba(244,63,94,0.1)', color: 'var(--accent-red)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700', letterSpacing: '0.05em' }}>COPIED</span>
                              <span style={{ fontSize: '11px', color: 'var(--text-sec)', fontFamily: 'var(--mono)' }}>
                                {resolveChannelName(c.ch || c.channel || c.source_channel)}
                              </span>
                            </div>
                            {c.latency && (
                              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-red)', fontFamily: 'var(--mono)' }}>{c.latency}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
