// ── Centralized API config ──
// In production (Vercel): uses relative paths → Vercel rewrites proxy to backend
// In development: uses .env values pointing to backend server directly

const isDev = import.meta.env.DEV;

export const API_URL = isDev
  ? (import.meta.env.VITE_API_URL || 'http://74.225.250.0:8000')
  : 'https://api.rudranil.me';

export const WS_URL = isDev
  ? (import.meta.env.VITE_WS_URL || 'ws://74.225.250.0:8000/ws')
  : 'wss://api.rudranil.me/ws';
