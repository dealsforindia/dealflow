// ── Centralized API config ──
// All URLs come from .env (VITE_API_URL / VITE_WS_URL)
// To switch to HTTPS + domain, just edit .env — no code changes needed.

export const API_URL = import.meta.env.VITE_API_URL || '';
export const WS_URL = import.meta.env.VITE_WS_URL || `ws://${window.location.host}/ws`;
