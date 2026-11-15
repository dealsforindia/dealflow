/**
 * DealFlow Subtle Audio Micro-interactions
 * Uses Web Audio API oscillator synthesis for zero-dependency, instant tactile feedback
 */

const AUDIO_PREF_KEY = 'dealflow_audio_enabled';

export function isAudioEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(AUDIO_PREF_KEY) === 'true';
}

export function setAudioEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUDIO_PREF_KEY, enabled ? 'true' : 'false');
  window.dispatchEvent(new CustomEvent('dealflow_audio_toggled', { detail: enabled }));
}

// Singleton AudioContext — browsers cap concurrent instances (Chrome: 6, Safari: stricter).
// Creating a new context per-click silently fails once the limit is hit.
let _sharedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (_sharedCtx && _sharedCtx.state !== 'closed') {
    // Resume if suspended (e.g. after browser autoplay policy kicks in)
    if (_sharedCtx.state === 'suspended') {
      _sharedCtx.resume().catch(() => {});
    }
    return _sharedCtx;
  }
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  try {
    _sharedCtx = new AudioCtx();
    return _sharedCtx;
  } catch {
    return null;
  }
}

export function playTactileClick(): void {
  if (!isAudioEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch {}
}

export function playSuccessChime(): void {
  if (!isAudioEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    // Two-tone rising harmonic
    const notes = [587.33, 880]; // D5 -> A5

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.06, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.12);
    });
  } catch {}
}
