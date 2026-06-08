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
        <div className="settings-section">
          <div className="settings-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={14} strokeWidth={2.5} style={{color: 'var(--accent-blue-lt)'}} /> Output Channel
            <span style={{ fontSize: '10px', fontWeight: '400', color: 'var(--text-ter)', marginLeft: '4px' }}>Where approved deals get posted</span>
          </div>
          <div className="setting-block">
            <div className="setting-meta">
              <div className="setting-label">Curated Channel ID / Username</div>
              <div className="setting-desc">
                The Telegram channel where your approved deals are pushed.
                Use the channel username (e.g. <code style={{ fontFamily: 'var(--mono)', color: 'var(--accent-blue)', background: 'rgba(59,130,246,0.08)', padding: '1px 4px', borderRadius: '3px' }}>@MyDealsChannel</code>) or numeric ID (e.g. <code style={{ fontFamily: 'var(--mono)', color: 'var(--accent-blue)', background: 'rgba(59,130,246,0.08)', padding: '1px 4px', borderRadius: '3px' }}>-100123456789</code>).
              </div>
            </div>
            <div className="setting-control" style={{ flex: 1 }}>
              <input
                type="text"
                className="setting-input"
                placeholder="@YourCuratedChannel or -100123456789"
                value={settings.CURATED_CHANNEL || ''}
                onChange={e => setSettings({ CURATED_CHANNEL: e.target.value })}
                spellCheck={false}
                style={{ width: '100%', fontFamily: 'var(--mono)', fontSize: '13px' }}
              />
              {settings.CURATED_CHANNEL && (
                <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-green)', boxShadow: '0 0 6px rgba(23,201,100,0.6)', display: 'inline-block' }} />
                  <span style={{ fontSize: '11px', color: 'var(--accent-green)' }}>Channel configured — deals will post here on approval</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── API KEYS — Server-side only ── */}
        <div className="settings-section">
          <div className="settings-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={14} strokeWidth={2.5} style={{color: 'var(--accent-green)'}} /> API Keys
          </div>
          <div className="setting-block" style={{ flexDirection: 'column', gap: '10px', background: 'rgba(16,185,129,0.04)', borderColor: 'rgba(16,185,129,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={14} style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
              <div>
                <div className="setting-label" style={{ fontSize: '13px' }}>Keys managed server-side</div>
                <div className="setting-desc" style={{ marginTop: '4px' }}>
                  API keys (Groq, Gemini, EarnKaro, Telethon) are configured as environment variables on the backend server for security.
                  They are no longer exposed in this UI. To update keys, modify <code style={{ fontFamily: 'var(--mono)', color: 'var(--accent-blue)', background: 'rgba(59,130,246,0.08)', padding: '1px 4px', borderRadius: '3px' }}>.env</code> on your Azure VM and restart the services.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── AI STYLE PROMPT ── */}
        <div className="settings-section">
          <div className="settings-section-title">AI Rewrite Style</div>
          <div className="setting-block" style={{ flexDirection: 'column', gap: '8px' }}>
            <div className="setting-meta">
              <div className="setting-label">Your Channel's Style Prompt</div>
              <div className="setting-desc">
                When you click "AI Rewrite" on a deal, this is the style instruction sent to the AI.
                Tell it your tone, what to remove (watermarks, hashtags), what to add.
              </div>
            </div>
            <textarea
              className="setting-input ai-prompt-textarea"
              rows={6}
              placeholder={`e.g. "Rewrite this deal post for an Indian deals Telegram channel. Use clear Hindi-English (Hinglish) tone. Remove any channel watermarks, @mentions, or forwarded from lines. Keep emojis minimal. Format price clearly with ₹ symbol. End with a short CTA."`}
              value={settings.AI_STYLE_PROMPT || ''}
              onChange={e => setSettings({ AI_STYLE_PROMPT: e.target.value })}
            />
          </div>
        </div>

        {/* ── DEDUPLICATION ── */}
        <div className="settings-section">
          <div className="settings-section-title">Deduplication Window</div>
          <div className="setting-block">
            <div className="setting-meta">
              <div className="setting-label">FP Hash TTL (hours)</div>
              <div className="setting-desc">How long Redis keeps the fingerprint of a seen deal before it can appear again</div>
            </div>
            <div className="setting-control">
              <input
                type="number" min="1" max="72"
                value={settings.FP_TTL_HOURS ?? 24}
                onChange={e => setSettings({ FP_TTL_HOURS: +e.target.value })}
                className="setting-input"
                style={{ width: '80px' }}
              />
              <span style={{ color: 'var(--text-ter)', fontSize: '12px', marginLeft: '8px' }}>hours</span>
            </div>
          </div>
        </div>

        {/* ── POSTING ── */}
        <div className="settings-section">
          <div className="settings-section-title">Posting Limits</div>
          <div className="setting-block">
            <div className="setting-meta">
              <div className="setting-label">Max Posts Per Cycle</div>
              <div className="setting-desc">Hard cap on deal posts per scrape cycle to prevent spam</div>
            </div>
            <div className="setting-control">
              <input
                type="number" min="1" max="100"
                value={settings.MAX_POSTS_CYCLE ?? 40}
                onChange={e => setSettings({ MAX_POSTS_CYCLE: +e.target.value })}
                className="setting-input"
                style={{ width: '80px' }}
              />
              <span style={{ color: 'var(--text-ter)', fontSize: '12px', marginLeft: '8px' }}>per cycle</span>
            </div>
          </div>
        </div>

        <button className="save-settings-btn" onClick={saveSettings}>
          Save Settings
        </button>
      </div>
    </div>
  );
}
