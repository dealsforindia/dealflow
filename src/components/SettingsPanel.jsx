import React, { useState } from 'react';
import useStore from '../store';
import { Send, Shield, Info } from 'lucide-react';

export default function SettingsPanel() {
  const { settings, setSettings, saveSettings } = useStore();

  return (
    <div className="center-panel" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
      <div className="center-header" style={{ padding: '20px 24px', flexShrink: 0 }}>
        <div>
          <div className="center-title">Settings</div>
          <div className="center-subtitle">Output channel, deduplication config, and your channel's AI style</div>
        </div>
      </div>

      <div className="settings-area" style={{ padding: '0 24px 40px' }}>

        {/* ── OUTPUT CHANNEL ── */}
        <div className="settings-section" style={{ marginBottom: '32px' }}>
          <div className="settings-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>
            <Send size={16} strokeWidth={2.5} style={{color: 'var(--accent-blue)'}} /> Output Channel
            <span style={{ fontSize: '11px', fontWeight: '500', color: 'var(--text-ter)', marginLeft: '4px' }}>Where approved deals get posted</span>
          </div>
          <div className="setting-block" style={{ display: 'flex', alignItems: 'center', padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-dim)', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
            <div className="setting-meta" style={{ flex: 1, paddingRight: '24px' }}>
              <div className="setting-label" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>Curated Channel ID / Username</div>
              <div className="setting-desc" style={{ fontSize: '12px', color: 'var(--text-sec)', lineHeight: '1.5' }}>
                The Telegram channel where your approved deals are pushed.
                Use the channel username (e.g. <code style={{ fontFamily: 'var(--mono)', color: 'var(--accent-blue)', background: 'rgba(99,102,241,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>@MyDealsChannel</code>) or numeric ID (e.g. <code style={{ fontFamily: 'var(--mono)', color: 'var(--accent-blue)', background: 'rgba(99,102,241,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>-100123456789</code>).
              </div>
            </div>
            <div className="setting-control" style={{ flex: 1 }}>
              <input
                type="text"
                placeholder="@YourCuratedChannel or -100123456789"
                value={settings.CURATED_CHANNEL || ''}
                onChange={e => setSettings({ CURATED_CHANNEL: e.target.value })}
                spellCheck={false}
                style={{ width: '100%', fontFamily: 'var(--mono)', fontSize: '14px', background: '#0B0E14', border: '1px solid var(--border-dim)', borderRadius: '8px', padding: '12px 16px', color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)' }}
                onFocus={e => { e.target.style.borderColor = 'var(--accent-blue)'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2), 0 0 0 1px var(--accent-blue)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border-dim)'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)'; }}
              />
              {settings.CURATED_CHANNEL && (
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)', boxShadow: '0 0 8px rgba(16,185,129,0.6)', display: 'inline-block' }} />
                  <span style={{ fontSize: '12px', color: 'var(--accent-green)', fontWeight: '500' }}>Channel configured — deals will post here on approval</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── API KEYS — Server-side only ── */}
        <div className="settings-section" style={{ marginBottom: '32px' }}>
          <div className="settings-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>
            <Shield size={16} strokeWidth={2.5} style={{color: 'var(--accent-green)'}} /> API Keys
          </div>
          <div className="setting-block" style={{ padding: '20px 24px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '12px', boxShadow: 'inset 0 1px 0 rgba(16,185,129,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Info size={16} style={{ color: 'var(--accent-green)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div className="setting-label" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--accent-green)' }}>Keys managed server-side</div>
                <div className="setting-desc" style={{ marginTop: '6px', fontSize: '13px', color: 'var(--text-sec)', lineHeight: '1.5' }}>
                  API keys (Groq, Gemini, EarnKaro, Telethon) are configured as environment variables on the backend server for security.
                  They are no longer exposed in this UI. To update keys, modify <code style={{ fontFamily: 'var(--mono)', color: 'var(--accent-green)', background: 'rgba(16,185,129,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>.env</code> on your Azure VM and restart the services.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── AI STYLE PROMPT ── */}
        <div className="settings-section" style={{ marginBottom: '32px' }}>
          <div className="settings-section-title" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>AI Rewrite Style</div>
          <div className="setting-block" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '16px', padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-dim)', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
            <div className="setting-meta" style={{ paddingRight: 0 }}>
              <div className="setting-label" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>Your Channel's Style Prompt</div>
              <div className="setting-desc" style={{ fontSize: '12px', color: 'var(--text-sec)' }}>
                When you click "AI Rewrite" on a deal, this is the style instruction sent to the AI.
                Tell it your tone, what to remove (watermarks, hashtags), what to add.
              </div>
            </div>
            <textarea
              rows={6}
              placeholder={`e.g. "Rewrite this deal post for an Indian deals Telegram channel. Use clear Hindi-English (Hinglish) tone..."`}
              value={settings.AI_STYLE_PROMPT || ''}
              onChange={e => setSettings({ AI_STYLE_PROMPT: e.target.value })}
              style={{ width: '100%', fontFamily: 'var(--mono)', fontSize: '13px', lineHeight: '1.6', background: '#0B0E14', border: '1px solid var(--border-dim)', borderRadius: '8px', padding: '16px', color: 'var(--text-primary)', outline: 'none', resize: 'vertical', transition: 'border-color 0.2s, box-shadow 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)' }}
              onFocus={e => { e.target.style.borderColor = 'var(--accent-purple)'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2), 0 0 0 1px var(--accent-purple)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border-dim)'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)'; }}
            />
          </div>
        </div>

        {/* ── DEDUPLICATION ── */}
        <div className="settings-section" style={{ marginBottom: '32px' }}>
          <div className="settings-section-title" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>Deduplication Window</div>
          <div className="setting-block" style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', background: 'var(--bg-card)', border: '1px solid var(--border-dim)', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
            <div className="setting-meta" style={{ flex: 1 }}>
              <div className="setting-label" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>FP Hash TTL (hours)</div>
              <div className="setting-desc" style={{ fontSize: '12px', color: 'var(--text-sec)' }}>How long Redis keeps the fingerprint of a seen deal before it can appear again</div>
            </div>
            <div className="setting-control" style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="number" min="1" max="72"
                value={settings.FP_TTL_HOURS ?? 24}
                onChange={e => setSettings({ FP_TTL_HOURS: +e.target.value })}
                style={{ width: '80px', fontFamily: 'var(--mono)', fontSize: '14px', background: '#0B0E14', border: '1px solid var(--border-dim)', borderRadius: '8px', padding: '10px 12px', color: 'var(--text-primary)', outline: 'none', textAlign: 'center' }}
              />
              <span style={{ color: 'var(--text-ter)', fontSize: '13px', marginLeft: '12px', fontWeight: '500' }}>hours</span>
            </div>
          </div>
        </div>

        {/* ── POSTING ── */}
        <div className="settings-section" style={{ marginBottom: '32px' }}>
          <div className="settings-section-title" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>Posting Limits</div>
          <div className="setting-block" style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', background: 'var(--bg-card)', border: '1px solid var(--border-dim)', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
            <div className="setting-meta" style={{ flex: 1 }}>
              <div className="setting-label" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>Max Posts Per Cycle</div>
              <div className="setting-desc" style={{ fontSize: '12px', color: 'var(--text-sec)' }}>Hard cap on deal posts per scrape cycle to prevent spam</div>
            </div>
            <div className="setting-control" style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="number" min="1" max="100"
                value={settings.MAX_POSTS_CYCLE ?? 40}
                onChange={e => setSettings({ MAX_POSTS_CYCLE: +e.target.value })}
                style={{ width: '80px', fontFamily: 'var(--mono)', fontSize: '14px', background: '#0B0E14', border: '1px solid var(--border-dim)', borderRadius: '8px', padding: '10px 12px', color: 'var(--text-primary)', outline: 'none', textAlign: 'center' }}
              />
              <span style={{ color: 'var(--text-ter)', fontSize: '13px', marginLeft: '12px', fontWeight: '500' }}>per cycle</span>
            </div>
          </div>
        </div>

        <button onClick={saveSettings} style={{ padding: '14px 24px', background: 'var(--accent-blue)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 16px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.2)', transition: 'transform 0.2s, box-shadow 0.2s', width: '100%', marginTop: '8px' }}>
          Save Settings
        </button>
      </div>
    </div>
  );
}
