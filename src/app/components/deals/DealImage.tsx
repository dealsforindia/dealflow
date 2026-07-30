import { memo, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { Lightbox } from '../common/Lightbox';
import { categoryColor, categoryEmoji } from '../../../lib/constants';

interface DealImageProps {
  src: string;
  category?: string;
  aspectRatio?: '1:1' | '4:3' | '16:9';
  size?: 'sm' | 'md' | 'lg';
  clickToExpand?: boolean;
  className?: string;
}

const ASPECT_MAP = {
  '1:1': 'aspect-square',
  '4:3': 'aspect-[4/3]',
  '16:9': 'aspect-video',
};

export const DealImage = memo(function DealImage({
  src,
  category = 'General',
  aspectRatio = '4:3',
  size = 'md',
  clickToExpand = true,
  className,
}: DealImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const accent = categoryColor(category);

  if (!src || error) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl border border-border ${ASPECT_MAP[aspectRatio]} ${className ?? ''}`}
        style={{ background: `${accent}08` }}
      >
        {error ? (
          <ImageOff size={size === 'sm' ? 14 : 20} className="text-muted-foreground opacity-30" />
        ) : (
          <span className="text-2xl" style={{ fontFamily: "'Segoe UI Emoji','Apple Color Emoji',sans-serif" }}>
            {categoryEmoji(category)}
          </span>
        )}
      </div>
    );
  }

  return (
    <>
      <div
        className={`relative rounded-xl overflow-hidden border border-border ${ASPECT_MAP[aspectRatio]} ${className ?? ''} ${clickToExpand ? 'cursor-zoom-in' : ''}`}
        onClick={clickToExpand ? () => setLightbox(true) : undefined}
      >
        {!loaded && (
          <div className="absolute inset-0 shimmer rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }} />
        )}
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>
      {lightbox && <Lightbox src={src} onClose={() => setLightbox(false)} />}
    </>
  );
});
