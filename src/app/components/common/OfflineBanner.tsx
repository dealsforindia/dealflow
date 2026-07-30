import { memo } from 'react';
import { WifiOff } from 'lucide-react';

interface OfflineBannerProps {
  online: boolean;
}

export const OfflineBanner = memo(function OfflineBanner({ online }: OfflineBannerProps) {
  if (online) return null;

  return (
    <div
      className="flex items-center justify-center gap-2 py-2 text-xs font-semibold"
      style={{
        background: 'rgba(239,68,68,0.12)',
        color: '#f87171',
        borderBottom: '1px solid rgba(239,68,68,0.2)',
      }}
      role="alert"
      aria-live="assertive"
    >
      <WifiOff size={13} />
      You are offline — actions will be queued
    </div>
  );
});
