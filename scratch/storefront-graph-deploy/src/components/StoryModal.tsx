import { useModalSurface } from '../utils/useModalSurface';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { getCleanImageUrl } from '../utils/imageUrl';
import type { CategoryStoryCollection, CategoryStoryItem } from '../types';

interface StoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  collections: CategoryStoryCollection[];
  initialCollectionIndex?: number;
  onSelectCategoryFilter?: (catFilter: string) => void;
}

const STORY_DURATION_MS = 5000;
const TICK_INTERVAL_MS = 40;

export const StoryModal: React.FC<StoryModalProps> = ({
  isOpen,
  onClose,
  collections,
  initialCollectionIndex = 0,
  onSelectCategoryFilter,
}) => {
  const [collectionIdx, setCollectionIdx] = useState<number>(initialCollectionIndex);
  const [itemIdx, setItemIdx] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  // Sync initialCollectionIndex when modal opens
  useEffect(() => {
    if (isOpen) {
      setCollectionIdx(Math.min(Math.max(0, initialCollectionIndex), Math.max(0, collections.length - 1)));
      setItemIdx(0);
      setProgress(0);
      setIsPaused(false);
      setImageError(false);
    }
  }, [isOpen, initialCollectionIndex, collections.length]);

  useEffect(() => {
    setImageError(false);
  }, [itemIdx, collectionIdx]);

  const activeCollection = collections[collectionIdx] || collections[0];
  const items = activeCollection?.items || [];
  const currentItem: CategoryStoryItem | undefined = items[itemIdx];

  const handleNext = useCallback(() => {
    setProgress(0);
    if (itemIdx < items.length - 1) {
      setItemIdx((prev) => prev + 1);
    } else if (collectionIdx < collections.length - 1) {
      setCollectionIdx((prev) => prev + 1);
      setItemIdx(0);
    } else {
      onClose();
    }
  }, [itemIdx, items.length, collectionIdx, collections.length, onClose]);

  const handlePrev = useCallback(() => {
    setProgress(0);
    if (itemIdx > 0) {
      setItemIdx((prev) => prev - 1);
    } else if (collectionIdx > 0) {
      const prevCollection = collections[collectionIdx - 1];
      setCollectionIdx(collectionIdx - 1);
      setItemIdx(Math.max(0, (prevCollection?.items?.length || 1) - 1));
    }
  }, [itemIdx, collectionIdx, collections]);

  // Story Progress Auto-Advance Timer
  useEffect(() => {
    if (!isOpen || isPaused || !currentItem) return;

    const step = (TICK_INTERVAL_MS / STORY_DURATION_MS) * 100;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev + step >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, TICK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isOpen, isPaused, currentItem, handleNext]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPaused((p) => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  const modalSurface = useModalSurface(isOpen && !!currentItem, onClose);
  if (!isOpen || !activeCollection || !currentItem) return null;

  const storeColorMap: Record<string, { bg: string; text: string; border: string }> = {
    amazon: { bg: 'rgba(245, 158, 11, 0.15)', text: '#FBBF24', border: 'rgba(245, 158, 11, 0.35)' },
    flipkart: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60A5FA', border: 'rgba(59, 130, 246, 0.35)' },
    zepto: { bg: 'rgba(236, 72, 153, 0.15)', text: '#F472B6', border: 'rgba(236, 72, 153, 0.35)' },
    blinkit: { bg: 'rgba(234, 179, 8, 0.15)', text: '#FACC15', border: 'rgba(234, 179, 8, 0.35)' },
    swiggy: { bg: 'rgba(249, 115, 22, 0.15)', text: '#FB923C', border: 'rgba(249, 115, 22, 0.35)' },
    myntra: { bg: 'rgba(244, 63, 94, 0.15)', text: '#FB7185', border: 'rgba(244, 63, 94, 0.35)' },
    ajio: { bg: 'rgba(99, 102, 241, 0.15)', text: '#818CF8', border: 'rgba(99, 102, 241, 0.35)' },
  };

  const storeKey = (currentItem.store || '').toLowerCase();
  const storeBadge = storeColorMap[storeKey] || {
    bg: 'rgba(255, 255, 255, 0.1)',
    text: '#E5E7EB',
    border: 'rgba(255, 255, 255, 0.2)',
  };

  return createPortal(
    <AnimatePresence>
      <div ref={modalSurface} role="dialog" aria-modal="true" aria-label="Collection stories"
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl"
        style={{ touchAction: 'none' }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Desktop Prev Collection Arrow */}
        {collectionIdx > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCollectionIdx((prev) => prev - 1);
              setItemIdx(0);
              setProgress(0);
            }}
            className="hidden lg:flex items-center justify-center w-12 h-12 rounded-full bg-white/10 dark:bg-[#0D1527]/10 hover:bg-white/20 dark:bg-[#0D1527]/20 border border-white/15 text-white/80 hover:text-white transition-all mr-6 hover:scale-110 shadow-lg cursor-pointer"
            title="Previous Story Category"
            aria-label="Previous Category"
          >
            ‹
          </button>
        )}

        {/* Story Card Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-[430px] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between"
          style={{
            height: 'min(780px, calc(100dvh - 1.5rem))',
            background: 'linear-gradient(180deg, #101422 0%, #0B0E17 100%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(245, 130, 32, 0.1)',
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* ── Top Progress Segments ── */}
          <div className="absolute top-0 left-0 right-0 z-30 p-3 pt-3.5 flex gap-1.5 pointer-events-none">
            {items.map((_, idx) => {
              let segProgress = 0;
              if (idx < itemIdx) segProgress = 100;
              else if (idx === itemIdx) segProgress = progress;

              return (
                <div
                  key={idx}
                  className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/20 dark:bg-[#0D1527]/20 backdrop-blur-sm"
                >
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-75 ease-linear"
                    style={{
                      width: `${segProgress}%`,
                      boxShadow: idx === itemIdx ? '0 0 8px #F59E0B' : 'none',
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* ── Story Header ── */}
          <div className="relative z-30 pt-7 px-4 pb-2 flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-lg shadow-md bg-gradient-to-tr ${activeCollection.ring_color}`}
              >
                <span>{activeCollection.emoji}</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-white tracking-tight">
                    {activeCollection.title}
                  </span>
                  <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {activeCollection.badge}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <span>
                    Deal {itemIdx + 1} of {items.length}
                  </span>
                  {isPaused && (
                    <span className="text-[10px] text-amber-400/90 font-medium animate-pulse">
                      • Paused
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-white/10 dark:bg-[#0D1527]/10 hover:bg-white/20 dark:bg-[#0D1527]/20 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer"
              aria-label="Close Story"
            >
              ✕
            </button>
          </div>

          {/* ── Tap Zones (Left 35% Prev, Right 65% Next) ── */}
          <div className="absolute inset-x-0 top-16 bottom-36 z-20 flex">
            <div
              className="w-[35%] h-full cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              aria-label="Previous Deal"
            />
            <div
              className="w-[65%] h-full cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              aria-label="Next Deal"
            />
          </div>

          {/* ── Deal Showcase Visual Stage ── */}
          <div className="relative z-10 flex-1 flex flex-col justify-center px-4 py-2 my-auto">
            {/* Product Image Stage */}
            <div
              className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden flex items-center justify-center p-3"
              style={{
                background: 'radial-gradient(circle, rgba(30, 36, 56, 0.6) 0%, rgba(13, 16, 26, 0.9) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              {(() => {
                const cleanImg = currentItem.image ? (getCleanImageUrl(currentItem.image) || currentItem.image) : '';
                return cleanImg && !imageError ? (
                  <img
                    src={cleanImg}
                    alt={currentItem.title}
                    onError={() => setImageError(true)}
                    className="max-h-full max-w-full object-contain filter drop-shadow-xl transition-transform duration-300 hover:scale-105"
                    loading="eager"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-white/50 text-center p-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 dark:bg-[#0D1527]/5 border border-white/10 flex items-center justify-center text-3xl mb-2 shadow-inner">
                      {activeCollection.emoji}
                    </div>
                    <span className="text-xs font-semibold text-white/70">{currentItem.store} Verified Deal</span>
                    <span className="text-[10px] text-white/40 mt-0.5">Click Grab Deal to view live product</span>
                  </div>
                );
              })()}

              {/* Store Tag */}
              <div
                className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md flex items-center gap-1.5"
                style={{
                  backgroundColor: storeBadge.bg,
                  color: storeBadge.text,
                  border: `1px solid ${storeBadge.border}`,
                }}
              >
                <span>🏷️</span>
                <span>{currentItem.store}</span>
              </div>

              {/* Discount Tag */}
              {currentItem.discount_pct > 0 && (
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-black bg-rose-500 text-white shadow-lg flex items-center gap-1 animate-pulse">
                  <span>🔥</span>
                  <span>{currentItem.discount_pct}% OFF</span>
                </div>
              )}
            </div>

            {/* Product Meta Details */}
            <div className="mt-4">
              <h3
                className="text-base font-bold text-white line-clamp-2 leading-snug tracking-tight"
                title={currentItem.title}
              >
                {currentItem.title}
              </h3>

              {/* Price & Savings */}
              <div className="mt-2.5 flex items-center flex-wrap gap-2.5">
                {currentItem.price ? (
                  <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
                    ₹{currentItem.price.toLocaleString('en-IN')}
                  </span>
                ) : null}
                {currentItem.mrp && currentItem.price && currentItem.mrp > currentItem.price ? (
                  <span className="text-sm font-medium text-white/40 line-through font-mono">
                    ₹{currentItem.mrp.toLocaleString('en-IN')}
                  </span>
                ) : null}
                {currentItem.mrp && currentItem.price && currentItem.mrp > currentItem.price ? (
                  <span className="text-xs font-bold text-amber-300 font-mono bg-amber-400/15 border border-amber-400/25 px-2 py-0.5 rounded-md">
                    Save ₹{(currentItem.mrp - currentItem.price).toLocaleString('en-IN')}
                  </span>
                ) : null}
              </div>

              {/* Anti-Fake Guarantee Chip */}
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-white/60">
                <span className="text-emerald-400">✓</span>
                <span>Source-reported offer · Confirm price & stock at checkout</span>
              </div>
            </div>
          </div>

          {/* ── Bottom Action Dock ── */}
          <div className="relative z-30 p-4 pt-2 pb-5 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col gap-2.5">
            {/* Primary Grab CTA */}
            <a
              href={currentItem.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-full py-3.5 px-5 rounded-2xl font-bold text-sm text-black flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-xl hover:shadow-amber-500/20 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              }}
            >
              <span>Grab This Loot Deal</span>
              <span className="text-base">⚡</span>
            </a>

            {/* Secondary Explore Category in Feed */}
            {onSelectCategoryFilter && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCategoryFilter(activeCollection.category_filter);
                  onClose();
                }}
                className="w-full py-2 px-3 text-xs font-medium text-white/70 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Explore all {activeCollection.title} in Feed</span>
                <span>→</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Desktop Next Collection Arrow */}
        {collectionIdx < collections.length - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCollectionIdx((prev) => prev + 1);
              setItemIdx(0);
              setProgress(0);
            }}
            className="hidden lg:flex items-center justify-center w-12 h-12 rounded-full bg-white/10 dark:bg-[#0D1527]/10 hover:bg-white/20 dark:bg-[#0D1527]/20 border border-white/15 text-white/80 hover:text-white transition-all ml-6 hover:scale-110 shadow-lg cursor-pointer"
            title="Next Story Category"
            aria-label="Next Category"
          >
            ›
          </button>
        )}
      </div>
    </AnimatePresence>,
    document.body
  );
};
