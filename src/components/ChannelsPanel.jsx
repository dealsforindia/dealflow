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
        <div className="ch-section-label">SCRAPING SOURCES</div>
        <div className="sources-grid">
          <div className={`source-card ${desiDimeOn ? 'active' : 'paused'}`}>
            <div className="source-card-left">
              <div className="source-icon dd"><ShoppingBag size={20} strokeWidth={1.5} /></div>
              <div>
                <div className="source-name">DesiDime</div>
                <div className="source-desc">Polls desidime.com/new for hot deals in real-time</div>
              </div>
            </div>
            <div className="source-card-right">
              <span className={`source-status-badge ${desiDimeOn ? 'on' : 'off'}`}>{desiDimeOn ? 'RUNNING' : 'PAUSED'}</span>
              <div className={`toggle-switch ${desiDimeOn ? 'on' : 'off'}`} onClick={() => setSettings({ DESIDIME_ENABLED: !desiDimeOn })}>
                <div className="toggle-knob" />
              </div>
            </div>
          </div>
          <div className="source-card active">
            <div className="source-card-left">
              <div className="source-icon tg"><Send size={20} strokeWidth={1.5} /></div>
              <div>
                <div className="source-name">Telegram</div>
                <div className="source-desc">Passive listener on {tgChannels.length} tracked channels via Telethon</div>
              </div>
            </div>
            <div className="source-card-right">
              <span className="source-status-badge on">LISTENING</span>
            </div>
          </div>
        </div>

        {/* ── TELEGRAM CHANNELS ── */}
        <div className="ch-section-label" style={{ marginTop: 24 }}>TELEGRAM CHANNELS</div>

        <div className="ch-add-section">
          <div className="channel-add-row">
            <input
              className={`ch-input${inputErr ? ' ch-input-error' : ''}`}
              placeholder="@username, -100… numeric ID, or https://t.me/…"
              value={newCh}
              onChange={e => { setNewCh(e.target.value); setInputErr(''); }}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              style={{ borderColor: inputErr ? 'var(--accent-red)' : undefined }}
            />
            <button className="ch-add-btn" onClick={handleAdd}>+ Add</button>
          </div>
          {inputErr ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px', fontSize: '11px', color: 'var(--accent-red)' }}>
              <AlertTriangle size={12} /> {inputErr}
            </div>
          ) : (
            <div className="ch-hint">
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
                  <div key={idx} className={`channel-row ${!isOn ? 'row-paused' : ''}`} style={{ gridTemplateColumns: 'minmax(200px, 1.5fr) 120px 120px 40px' }}>
                    <div className="ch-name">
                      <div className="ch-avatar" style={{ background: 'rgba(59,130,246,0.12)', color: 'var(--accent-blue)' }}>
                        {(id[0] === '-' ? 'G' : (id[1] || id[0] || '?')).toUpperCase()}
                      </div>
                      <div>
                        {editingId === id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input
                              autoFocus
                              value={editName}
                              onChange={e => setEditName(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && handleRename(id)}
                              style={{ background: 'var(--bg-card)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '2px 6px', fontSize: '12px', width: '140px' }}
                            />
                            <button onClick={() => handleRename(id)} style={{ background: 'none', border: 'none', color: 'var(--accent-green)', cursor: 'pointer', padding: 2 }}>
                              <Check size={14} />
                            </button>
                            <button onClick={() => setEditingId(null)} style={{ background: 'none', border: 'none', color: 'var(--text-ter)', cursor: 'pointer', padding: 2 }}>
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="ch-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                        <div className="ch-id" style={{ color: 'var(--text-ter)', fontFamily: 'var(--mono)', fontSize: '9px' }}>
                          {id}
                        </div>
                        <div style={{ fontSize: '9px', color: 'var(--text-ter)', marginTop: '1px' }}>
                          {ch.added
                            ? `Added ${new Date(ch.added).toLocaleDateString('en-IN')}`
                            : id.startsWith('-') ? 'Private group' : 'Public channel'}
                        </div>
                      </div>
                    </div>

                    {/* Deal count */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                      {isPending ? (
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '10px', color: '#fbbf24', fontWeight: '600' }}>0</div>
                          <div style={{ fontSize: '9px', color: 'var(--text-ter)', fontStyle: 'italic' }}>Pending — refreshes in 60s</div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {dealCnt !== null && dealCnt > 0 && <CheckCircle size={10} color="var(--accent-green)" />}
                          <span style={{ fontSize: '14px', fontWeight: '700', fontFamily: 'var(--mono)', color: dealCnt > 0 ? 'var(--accent-green)' : 'var(--text-ter)' }}>
                            {dealCnt ?? '—'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Toggle */}
                    <div className="ch-toggle-col">
                      <div
                        className={`toggle-switch ${isOn ? 'on' : 'off'}`}
                        onClick={() => toggleChannel(id)}
                        title={isOn ? 'Pause scraping this channel' : 'Resume scraping'}
                      >
                        <div className="toggle-knob" />
                      </div>
                      <span className="toggle-label">{isOn ? 'ON' : 'OFF'}</span>
                    </div>

                    <button className="ch-del-btn" onClick={() => deleteChannel(id)} title="Remove channel">
                      <Trash2 size={14} />
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
