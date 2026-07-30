import { memo } from 'react';
import type { ElementType } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: ElementType;
  iconEmoji?: string;
  title: string;
  description?: string;
  accentColor?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState = memo(function EmptyState({
  icon: Icon,
  iconEmoji,
  title,
  description,
  accentColor = 'rgba(52,211,153,0.07)',
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 text-center px-8 py-16 ${className ?? ''}`}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
        style={{
          background: accentColor,
          border: `1px solid ${accentColor.replace('0.07', '0.12')}`,
        }}
      >
        {iconEmoji ?? (Icon ? <Icon size={24} className="text-muted-foreground" /> : <Inbox size={24} className="text-muted-foreground" />)}
      </div>
      <div>
        <p
          className="text-sm font-semibold text-foreground"
          style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}
        >
          {title}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed max-w-xs">
            {description}
          </p>
        )}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-all active:scale-95"
          style={{
            background: 'rgba(123,92,232,0.12)',
            color: '#9B82F5',
            border: '1px solid rgba(123,92,232,0.2)',
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
});
