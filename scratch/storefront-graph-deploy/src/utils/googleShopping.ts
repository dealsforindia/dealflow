/**
 * Google Shopping In-App Radar Dispatcher
 * Allows any button, card, modal, or arbitrage link to trigger
 * the internal Google Shopping discovery experience without leaving the PWA.
 */

export function openGoogleShoppingModal(query: string) {
  if (typeof window === 'undefined') return;
  const clean = (query || '').trim();
  window.dispatchEvent(
    new CustomEvent('open-google-shopping', {
      detail: { query: clean },
    })
  );
}
