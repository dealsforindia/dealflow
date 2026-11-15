import React, { useEffect, useId, useRef, useState } from 'react';
import { Sun, Moon, Monitor, Check, ChevronDown } from 'lucide-react';
import { useTheme, ThemePreference } from '../utils/themeManager';

interface ThemeToggleProps { className?: string; variant?: 'compact' | 'expanded'; showLabels?: boolean; }
const MODES = [
  { id: 'light', label: 'Light', description: 'A bright, clean canvas', Icon: Sun },
  { id: 'dark', label: 'Dark', description: 'Comfortable after hours', Icon: Moon },
  { id: 'system', label: 'System', description: 'Follow your device', Icon: Monitor },
] as const;
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', variant = 'compact' }) => {
  const { preference, resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const popoverId = useId();
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!container.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    container.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus();
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);
  const select = (mode: ThemePreference) => { setTheme(mode); setOpen(false); trigger.current?.focus(); };
  const CurrentIcon = resolvedTheme === 'dark' ? Moon : Sun;
  const choices = <div className="appearance-options" role="group" aria-label="Choose appearance">{MODES.map(({ id, label, description, Icon }) => <button key={id} type="button" aria-pressed={preference === id} aria-label={`${label} appearance`} onClick={() => select(id)}>
    <Icon size={18} aria-hidden="true" /><span><strong>{label}</strong><small>{description}</small></span>{preference === id && <Check size={16} aria-hidden="true" />}
  </button>)}</div>;
  if (variant === 'expanded') return <div className={`appearance-expanded ${className}`}><div className="appearance-title">Appearance <span>{preference === 'system' ? `System · ${resolvedTheme}` : preference}</span></div>{choices}</div>;
  return <div className={`appearance-control ${className}`} ref={container}>
    <button ref={trigger} type="button" className="appearance-trigger" aria-label={`Appearance: ${preference === 'system' ? `System (${resolvedTheme})` : preference}`} aria-expanded={open} aria-controls={popoverId} onClick={() => setOpen(value => !value)} title="Choose Light, Dark or System appearance">
      <CurrentIcon size={18} aria-hidden="true" /><span>{resolvedTheme === 'dark' ? 'Dark' : 'Light'}</span><ChevronDown size={12} className="appearance-chevron" aria-hidden="true" />
    </button>
    {open && <div id={popoverId} className="appearance-popover"><div className="appearance-title">Appearance <span>Make it yours</span></div>{choices}</div>}
  </div>;
};
