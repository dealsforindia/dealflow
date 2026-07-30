import { memo } from 'react';
import type { DealStatus } from '../../../types';

interface StatusBadgeProps {
  status: DealStatus;
  className?: string;
}

const STATUS_CONFIG: Record<DealStatus, { bg: string; color: string; label: string }> = {
  pending: { bg: 'rgba(124,126,158,0.12)', color: '#7C7E9E', label: 'Pending' },
  posted: { bg: 'rgba(52,211,153,0.1)', color: '#34d399', label: 'Posted' },
  rejected: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', label: 'Rejected' },
  spam: { bg: 'rgba(251,191,36,0.1)', color: '#fbbf24', label: 'Spam' },
};

export const StatusBadge = memo(function StatusBadge({
  status,
  className,
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;

  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${className ?? ''}`}
      style={{ background: config.bg, color: config.color }}
    >
      {config.label}
    </span>
  );
});
