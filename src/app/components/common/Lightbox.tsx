import { memo, useState, useCallback } from 'react';
import { X, Download, Copy, Check } from 'lucide-react';

interface LightboxProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

export const Lightbox = memo(function Lightbox({ src, alt, onClose }: LightboxProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(src);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [src]);

  const handleDownload = useCallback(() => {
    const a = document.createElement('a');
    a.href = src;
    a.download = alt ?? 'image';
    a.target = '_blank';
    a.click();
  }, [src, alt]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={(e) => { e.stopPropagation(); handleCopy(); }}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
          style={{ background: 'rgba(255,255,255,0.08)', color: '#D8DAF0' }}
          aria-label="Copy URL"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleDownload(); }}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
          style={{ background: 'rgba(255,255,255,0.08)', color: '#D8DAF0' }}
          aria-label="Download"
        >
          <Download size={16} />
        </button>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
          style={{ background: 'rgba(255,255,255,0.08)', color: '#D8DAF0' }}
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>
      <img
        src={src}
        alt={alt ?? ''}
        className="max-w-full max-h-[90vh] object-contain rounded-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
      />
    </div>
  );
});
