import { memo } from 'react';

interface PriceBadgeProps {
  price: number;
  originalPrice?: number;
  discountPct?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function formatPrice(p: number): string {
  if (!p) return 'Free';
  return `₹${Number(p).toLocaleString('en-IN')}`;
}

export const PriceBadge = memo(function PriceBadge({
  price,
  originalPrice,
  discountPct,
  size = 'md',
  className,
}: PriceBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-base',
    lg: 'text-2xl',
  };

  if (price <= 0) {
    return (
      <span
        className={`font-bold ${className ?? ''}`}
        style={{
          color: '#fbbf24',
          fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
        }}
      >
        Trick / Loot
      </span>
    );
  }

  return (
    <div className={`flex items-baseline gap-2 flex-wrap ${className ?? ''}`}>
      <span
        className={`${sizeClasses[size]} font-bold leading-none`}
        style={{
          color: '#D8DAF0',
          fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
          letterSpacing: '-0.02em',
        }}
      >
        {formatPrice(price)}
      </span>
      {originalPrice != null && originalPrice > 0 && (
        <span className="text-xs text-muted-foreground line-through">
          {formatPrice(originalPrice)}
        </span>
      )}
      {discountPct != null && discountPct > 0 && (
        <span className="text-xs font-bold" style={{ color: '#34d399' }}>
          {Math.round(discountPct)}% off
        </span>
      )}
    </div>
  );
});
