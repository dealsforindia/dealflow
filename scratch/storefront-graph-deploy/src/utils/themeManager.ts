import { useSyncExternalStore } from 'react';
export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';
export const THEME_STORAGE_KEY = 'idh_theme_preference';
const THEME_EVENT = 'idh-appearance-change';
let memoryPreference: ThemePreference | undefined;
export function getStoredThemePreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  if (memoryPreference) return memoryPreference;
  try { const value = localStorage.getItem(THEME_STORAGE_KEY); if (value === 'dark' || value === 'light' || value === 'system') return value; } catch {}
  return 'system';
}
export function getSystemTheme(): ResolvedTheme { return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
export function resolveTheme(preference: ThemePreference): ResolvedTheme { return preference === 'system' ? getSystemTheme() : preference; }
export function applyTheme(preference: ThemePreference): ResolvedTheme {
  const resolved = resolveTheme(preference);
  if (typeof window === 'undefined') return resolved;
  memoryPreference = preference;
  document.documentElement.classList.toggle('dark', resolved === 'dark');
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolved === 'dark' ? '#0b1220' : '#f7f8fa');
  try { localStorage.setItem(THEME_STORAGE_KEY, preference); } catch {}
  window.dispatchEvent(new Event(THEME_EVENT));
  return resolved;
}
function snapshot() { const preference = getStoredThemePreference(); return `${preference}:${resolveTheme(preference)}`; }
function subscribe(listener: () => void) {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const storage = (event: StorageEvent) => { if (event.key === THEME_STORAGE_KEY || event.key === null) { memoryPreference = undefined; applyTheme(getStoredThemePreference()); } };
  const system = () => { if (getStoredThemePreference() === 'system') applyTheme('system'); };
  window.addEventListener(THEME_EVENT, listener);
  window.addEventListener('storage', storage);
  media.addEventListener('change', system);
  applyTheme(getStoredThemePreference());
  return () => { window.removeEventListener(THEME_EVENT, listener); window.removeEventListener('storage', storage); media.removeEventListener('change', system); };
}
export function useTheme() {
  const value = useSyncExternalStore(subscribe, snapshot, () => 'system:light');
  const [preference, resolvedTheme] = value.split(':') as [ThemePreference, ResolvedTheme];
  return { preference, resolvedTheme, setTheme: applyTheme };
}
