import React, { useState } from 'react';
import useStore from '../store';
import { Send, Shield, Info } from 'lucide-react';

export default function SettingsPanel() {
  const { settings, setSettings, saveSettings } = useStore();

  return (
    <div className="center-panel dash-panel">
      <div className="center-header dash-header">
        <div>
          <div className="center-title">Settings</div>
          <div className="center-subtitle">Output channel, deduplication config, and your channel's AI style</div>
        </div>
      </div>

      <div className="settings-area">

        {/* ── OUTPUT CHANNEL ── */}
        <div className="settings-section">
          <div className="settings-section-title">
            <Send size={16} strokeWidth={2.5} color="var(--accent-blue)" /> Output Channel
            <span className="settings-section-hint">Where approved deals get posted</span>
          </div>
          <div className="setting-block">
            <div className="setting-meta">
              <div className="setting-label">Curated Channel ID / Username</div>
              <div className="setting-desc">
                The Telegram channel where your approved deals are pushed.
                Use the channel username (e.g. <code className="settings-code">@MyDealsChannel</code>) or numeric ID (e.g. <code className="settings-code">-100123456789</code>).
              </div>
            </div>
            <div className="setting-control setting-control--full">
              <input
                type="text"
                className="settings-input"
                placeholder="@YourCuratedChannel or -100123456789"
                value={settings.CURATED_CHANNEL || ''}
                onChange={e => setSettings({ CURATED_CHANNEL: e.target.value })}
                spellCheck={false}
              />
              {settings.CURATED_CHANNEL && (
                <div className="settings-status-row">
                  <span className="settings-status-dot" />
                  <span className="settings-status-text">Channel configured — deals will post here on approval</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── API KEYS — Server-side only ── */}
        <div className="settings-section">
          <div className="settings-section-title">
            <Shield size={16} strokeWidth={2.5} color="var(--accent-green)" /> API Keys
          </div>
          <div className="setting-block setting-block--info">
            <div className="setting-info-row">
              <Info size={16} className="setting-info-icon" />
              <div>
                <div className="setting-label setting-label--green">Keys managed server-side</div>
                <div className="setting-desc">
                  API keys (Groq, Gemini, EarnKaro, Telethon) are configured as environment variables on the backend server for security.
                  They are no longer exposed in this UI. To update keys, modify <code className="settings-code settings-code--green">.env</code> on your Azure VM and restart the services.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── AI STYLE PROMPT ── */}
        <div className="settings-section">
          <div className="settings-section-title">AI Rewrite Style</div>
          <div className="setting-block setting-block--col">
            <div className="setting-meta">
              <div className="setting-label">Your Channel's Style Prompt</div>
              <div className="setting-desc">
                When you click "AI Rewrite" on a deal, this is the style instruction sent to the AI.
                Tell it your tone, what to remove (watermarks, hashtags), what to add.
              </div>
            </div>
            <textarea
              className="settings-textarea"
              rows={6}
              placeholder={`e.g. "Rewrite this deal post for an Indian deals Telegram channel. Use clear Hindi-English (Hinglish) tone..."`}
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
                className="settings-num-input"
                value={settings.FP_TTL_HOURS ?? 24}
                onChange={e => setSettings({ FP_TTL_HOURS: +e.target.value })}
              />
              <span className="settings-unit">hours</span>
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
                className="settings-num-input"
                value={settings.MAX_POSTS_CYCLE ?? 40}
                onChange={e => setSettings({ MAX_POSTS_CYCLE: +e.target.value })}
              />
              <span className="settings-unit">per cycle</span>
            </div>
          </div>
        </div>

        <button onClick={saveSettings} className="save-settings-btn save-settings-btn--full">
          Save Settings
        </button>
      </div>
    </div>
  );
}
