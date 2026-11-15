import { useEffect, useRef } from 'react';

let scrollLocks = 0;
let originalOverflow = '';
const surfaces: HTMLDivElement[] = [];

/** Consistent keyboard/focus handling, including when one shopping dialog opens another. */
export function useModalSurface(open: boolean, onClose?: () => void) {
  const surface = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!open) return;
    const before = document.activeElement as HTMLElement | null;
    if (scrollLocks++ === 0) { originalOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; }
    const panel = surface.current;
    if (panel) surfaces.push(panel);
    panel?.querySelector<HTMLElement>('button, input, select, [tabindex="0"]')?.focus({ preventScroll: true });
    const keyboard = (event: KeyboardEvent) => {
      if (panel && surfaces[surfaces.length - 1] !== panel) return;
      if (event.key === 'Escape') { event.preventDefault(); close.current?.(); }
      if (event.key !== 'Tab') return;
      const elements = [...(surface.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select, textarea, a[href], [tabindex="0"]') || [])].filter(element => element.getClientRects().length > 0);
      const first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && (document.activeElement === first || !panel?.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && (document.activeElement === last || !panel?.contains(document.activeElement))) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', keyboard);
    return () => {
      document.removeEventListener('keydown', keyboard);
      if (panel) { const index = surfaces.indexOf(panel); if (index !== -1) surfaces.splice(index, 1); }
      if (--scrollLocks === 0) document.body.style.overflow = originalOverflow;
      if (before?.isConnected) before.focus({ preventScroll: true });
    };
  }, [open]);
  return surface;
}
