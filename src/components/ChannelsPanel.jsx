import React, { useState } from 'react';
import useStore from '../store';
import { resolveChannelName } from '../utils/helpers';
import { ShoppingBag, Send, Radio, AlertTriangle, Trash2, CheckCircle, Edit2, Check, X } from 'lucide-react';

// ── Channel input validation
const validateChannel = (raw) => {
  const s = raw.trim();
  if (!s) return null;
  // @username
  if (/^@[\w]{3,}$/.test(s)) return s;
  // Numeric ID (starts with -100...)
  if (/^-\d{5,}$/.test(s)) return s;
  // t.me link
  if (/^https?:\/\/t\.me\//.test(s)) {
    const part = s.replace(/^https?:\/\/t\.me\//, '').replace(/\/+$/, '');
    if (part) return `@${part}`;
  }
  return null;
};

export default function ChannelsPanel() {
  const { channelConfig, deals, toggleChannel, addChannel, deleteChannel, settings, setSettings } = useStore();
  const [newCh,     setNewCh]     = useState('');
  const [inputErr,  setInputErr]  = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName,  setEditName]  = useState('');

  const { updateChannelName } = useStore();

  const tgChannels  = channelConfig.filter(c => (c.source || 'telegram') !== 'desidime');
  const desiDimeOn  = settings.DESIDIME_ENABLED !== false;

  // Real deal counts dynamically calculated from in-memory deals
  const dealCountMap = {};
  (deals || []).forEach(d => {
    const cId = d.channel || d.source_channel || d.channel_title;
    if (cId) {
      if (!dealCountMap[cId]) dealCountMap[cId] = 0;
      dealCountMap[cId]++;
    }
  });

  const handleAdd = () => {
    setInputErr('');
    const validated = validateChannel(newCh);
    if (!validated) {
      setInputErr('Enter @username, -100… numeric ID, or t.me/channelname link');
      return;
    }
    addChannel(validated);
    setNewCh('');
  };

  const handleRename = (id) => {
    if (editName.trim()) {
      import('../utils/helpers').then(({ setChannelName }) => {
        setChannelName(id, editName);
        updateChannelName(id, editName.trim());
      });
    }
    setEditingId(null);
  };

  return (
    <div className="center-panel" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
      <div className="center-header" style={{ padding: '20px 24px', flexShrink: 0 }}>
        <div>
          <div className="center-title">Channel Switchboard</div>
          <div className="center-subtitle">
            {tgChannels.filter(c => c.active !== false).length} active ·{' '}
            {tgChannels.filter(c => c.active === false).length} paused
          </div>
        </div>
      </div>

      <div className="channel-grid-area" style={{ padding: '0 24px 40px' }}>

        {/* ── SOURCES SECTION ── */}
        <div className="ch-section-label" style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.06em', color: 'var(--text-ter)', marginBottom: '16px' }}>SCRAPING SOURCES</div>
        <div className="sources-grid" style={{ display: 'grid', gap: '16px', marginBottom: '32px' }}>
          <div className={`source-card ${desiDimeOn ? 'active' : 'paused'}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: 'var(--bg-card)', border: '1px solid var(--border-dim)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <div className="source-card-left" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="source-icon dd" style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingBag size={20} strokeWidth={2} /></div>
              <div>
                <div className="source-name" style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>DesiDime</div>
                <div className="source-desc" style={{ fontSize: '12px', color: 'var(--text-sec)', marginTop: '2px' }}>Polls desidime.com/new for hot deals in real-time</div>
              </div>
            </div>
            <div className="source-card-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span className={`source-status-badge ${desiDimeOn ? 'on' : 'off'}`} style={{ fontSize: '10px', fontWeight: '700', padding: '4px 10px', borderRadius: '6px', background: desiDimeOn ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)', color: desiDimeOn ? 'var(--accent-green)' : 'var(--text-ter)' }}>{desiDimeOn ? 'RUNNING' : 'PAUSED'}</span>
              <div className={`toggle-switch ${desiDimeOn ? 'on' : 'off'}`} onClick={() => { setSettings({ DESIDIME_ENABLED: !desiDimeOn }); setTimeout(() => useStore.getState().saveSettings(), 0); }} style={{ width: '40px', height: '24px', borderRadius: '12px', background: desiDimeOn ? 'var(--accent-green)' : 'var(--border-dim)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', boxShadow: desiDimeOn ? '0 0 12px rgba(16,185,129,0.3)' : 'none' }}>
                <div className="toggle-knob" style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: desiDimeOn ? '19px' : '3px', transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
              </div>
            </div>
          </div>
          <div className="source-card active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: 'var(--bg-card)', border: '1px solid var(--border-dim)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <div className="source-card-left" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="source-icon tg" style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99,102,241,0.15)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Send size={20} strokeWidth={2} /></div>
              <div>
                <div className="source-name" style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>Telegram</div>
                <div className="source-desc" style={{ fontSize: '12px', color: 'var(--text-sec)', marginTop: '2px' }}>Passive listener on {tgChannels.length} tracked channels via Telethon</div>
              </div>
            </div>
            <div className="source-card-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span className="source-status-badge on" style={{ fontSize: '10px', fontWeight: '700', padding: '4px 10px', borderRadius: '6px', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-blue)' }}>LISTENING</span>
            </div>
          </div>
        </div>

        {/* ── TELEGRAM CHANNELS ── */}
        <div className="ch-section-label" style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.06em', color: 'var(--text-ter)', marginBottom: '16px' }}>TELEGRAM CHANNELS</div>

        <div className="ch-add-section" style={{ background: 'var(--bg-card)', padding: '6px', borderRadius: '12px', border: '1px solid var(--border-dim)', marginBottom: '24px', display: 'flex', flexDirection: 'column' }}>
          <div className="channel-add-row" style={{ display: 'flex', gap: '8px' }}>
            <input
              className={`ch-input${inputErr ? ' ch-input-error' : ''}`}
              placeholder="@username, -100… numeric ID, or https://t.me/…"
              value={newCh}
              onChange={e => { setNewCh(e.target.value); setInputErr(''); }}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              style={{ flex: 1, background: 'transparent', border: 'none', padding: '12px 16px', color: 'var(--text-primary)', outline: 'none', fontSize: '14px', fontFamily: 'var(--mono)' }}
            />
            <button className="ch-add-btn" onClick={handleAdd} style={{ padding: '0 20px', background: 'var(--text-primary)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>+ Add</button>
          </div>
          {inputErr ? (
            <div style={{ padding: '8px 16px', fontSize: '11px', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={12} /> {inputErr}
            </div>
          ) : (
            <div className="ch-hint" style={{ padding: '8px 16px', fontSize: '11px', color: 'var(--text-ter)' }}>
              Use the numeric channel ID (e.g. -1001234567890) for private groups, @username for public ones, or paste a t.me link.
            </div>
          )}
        </div>

        {tgChannels.length === 0 ? (
          <div className="empty-state" style={{ marginTop: 24, padding: '32px 0' }}>
            <div className="empty-icon"><Radio size={48} strokeWidth={1} /></div>
            <div className="empty-title">No Telegram channels yet</div>
            <div className="empty-sub">Add a channel or group ID above to start listening</div>
          </div>
        ) : (
          <>
            <div className="channel-table-head" style={{ gridTemplateColumns: 'minmax(200px, 1.5fr) 120px 120px 40px' }}>
              <span>CHANNEL</span>
              <span style={{ textAlign: 'center' }}>DEALS (24H)</span>
              <span style={{ textAlign: 'center' }}>SCRAPING</span>
              <span></span>
            </div>
            <div className="channel-table">
              {tgChannels.map((ch, idx) => {
                const id      = ch.channel || ch;
                const isOn    = ch.active !== false;
                const isPending = !!ch.added && !dealCountMap[id] && dealCountMap[id] !== 0;
                const dealCnt = dealCountMap[id] ?? (isPending ? null : 0);

                return (
                  <div key={idx} className={`channel-row ${!isOn ? 'row-paused' : ''}`} style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1.5fr) 120px 120px 40px', alignItems: 'center', gap: '16px', padding: '16px 20px', background: 'var(--bg-card)', border: '1px solid var(--border-dim)', borderRadius: '12px', marginBottom: '8px', opacity: isOn ? 1 : 0.6, transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <div className="ch-name" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div className="ch-avatar" style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99,102,241,0.15)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '15px' }}>
                        {(id[0] === '-' ? 'G' : (id[1] || id[0] || '?')).toUpperCase()}
                      </div>
                      <div>
                        {editingId === id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input
                              autoFocus
                              value={editName}
                              onChange={e => setEditName(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && handleRename(id)}
                              style={{ background: '#0B0E14', color: '#fff', border: '1px solid var(--accent-blue)', borderRadius: '6px', padding: '4px 8px', fontSize: '13px', width: '160px', outline: 'none' }}
                            />
                            <button onClick={() => handleRename(id)} style={{ background: 'var(--accent-green)', border: 'none', color: '#000', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex' }}>
                              <Check size={14} />
                            </button>
                            <button onClick={() => setEditingId(null)} style={{ background: 'transparent', border: '1px solid var(--border-dim)', color: 'var(--text-ter)', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex' }}>
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="ch-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                            {resolveChannelName(id)}
                            <button 
                              onClick={() => { setEditingId(id); setEditName(resolveChannelName(id)); }}
                              style={{ background: 'none', border: 'none', color: 'var(--text-ter)', cursor: 'pointer', padding: 2, display: 'flex', opacity: 0.7 }}
                              title="Rename Channel"
                            >
                              <Edit2 size={12} />
                            </button>
                          </div>
                        )}
                        <div className="ch-id" style={{ color: 'var(--text-ter)', fontFamily: 'var(--mono)', fontSize: '11px', marginTop: '2px' }}>
                          {id}
                        </div>
                      </div>
                    </div>

                    {/* Deal count */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      {isPending ? (
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '12px', color: '#fbbf24', fontWeight: '600' }}>0</div>
                          <div style={{ fontSize: '10px', color: 'var(--text-ter)' }}>Pending</div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {dealCnt !== null && dealCnt > 0 && <CheckCircle size={12} color="var(--accent-green)" />}
                          <span style={{ fontSize: '15px', fontWeight: '700', fontFamily: 'var(--mono)', color: dealCnt > 0 ? 'var(--accent-green)' : 'var(--text-ter)' }}>
                            {dealCnt ?? '—'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Toggle */}
                    <div className="ch-toggle-col" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        className={`toggle-switch ${isOn ? 'on' : 'off'}`}
                        onClick={() => toggleChannel(id)}
                        title={isOn ? 'Pause scraping this channel' : 'Resume scraping'}
                        style={{ width: '40px', height: '24px', borderRadius: '12px', background: isOn ? 'var(--accent-green)' : 'var(--border-dim)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', boxShadow: isOn ? '0 0 12px rgba(16,185,129,0.3)' : 'none' }}
                      >
                        <div className="toggle-knob" style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: isOn ? '19px' : '3px', transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                      </div>
                    </div>

                    <button className="ch-del-btn" onClick={() => deleteChannel(id)} title="Remove channel" style={{ background: 'transparent', border: 'none', color: 'var(--text-ter)', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
