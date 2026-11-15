import sys

path = r'rudranil-deals-web/src/components/StoryModal.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add Play, Pause import
if 'import { Play, Pause } from' not in text:
    text = text.replace("import type { CategoryStoryCollection, CategoryStoryItem } from '../types';",
                        "import type { CategoryStoryCollection, CategoryStoryItem } from '../types';\nimport { Play, Pause } from 'lucide-react';")

# 2. Check prefers-reduced-motion when opening
old_init = """    if (isOpen) {
      setCollectionIdx(Math.min(Math.max(0, initialCollectionIndex), Math.max(0, collections.length - 1)));
      setItemIdx(0);
      setProgress(0);
      setIsPaused(false);
      setImageError(false);
    }"""

new_init = """    if (isOpen) {
      setCollectionIdx(Math.min(Math.max(0, initialCollectionIndex), Math.max(0, collections.length - 1)));
      setItemIdx(0);
      setProgress(0);
      const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setIsPaused(Boolean(prefersReducedMotion));
      setImageError(false);
    }"""

# 3. Replace close button with pause/play + close
old_header_btn = """            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-white/10 dark:bg-[#0D1527]/10 hover:bg-white/20 dark:bg-[#0D1527]/20 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer"
              aria-label="Close Story"
            >
              ✕
            </button>"""

new_header_btn = """            {/* Action buttons: Pause/Play and Close */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPaused((prev) => !prev);
                }}
                className="w-8 h-8 rounded-full bg-white/10 dark:bg-[#0D1527]/10 hover:bg-white/20 dark:bg-[#0D1527]/20 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer"
                aria-label={isPaused ? "Resume story autoplay" : "Pause story autoplay"}
                title={isPaused ? "Resume autoplay" : "Pause autoplay"}
              >
                {isPaused ? <Play size={13} className="fill-current ml-0.5" /> : <Pause size={13} className="fill-current" />}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="w-8 h-8 rounded-full bg-white/10 dark:bg-[#0D1527]/10 hover:bg-white/20 dark:bg-[#0D1527]/20 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer"
                aria-label="Close Story"
              >
                ✕
              </button>
            </div>"""

# 4. Accessible buttons for tap zones
old_tap = """          {/* ── Tap Zones (Left 35% Prev, Right 65% Next) ── */}
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
          </div>"""

new_tap = """          {/* ── Accessible Tap Zones (Left 35% Prev, Right 65% Next) ── */}
          <div className="absolute inset-x-0 top-16 bottom-36 z-20 flex">
            <button
              type="button"
              className="w-[35%] h-full cursor-pointer bg-transparent border-0 p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              aria-label="Previous Deal in Story"
            />
            <button
              type="button"
              className="w-[65%] h-full cursor-pointer bg-transparent border-0 p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              aria-label="Next Deal in Story"
            />
          </div>"""

norm_text = text.replace('\r\n', '\n')
norm_init = old_init.replace('\r\n', '\n')
norm_hbtn = old_header_btn.replace('\r\n', '\n')
norm_tap = old_tap.replace('\r\n', '\n')

norm_text = norm_text.replace(norm_init, new_init.replace('\r\n', '\n'))
norm_text = norm_text.replace(norm_hbtn, new_header_btn.replace('\r\n', '\n'))
norm_text = norm_text.replace(norm_tap, new_tap.replace('\r\n', '\n'))

with open(path, 'w', encoding='utf-8', newline='\r\n') as f:
    f.write(norm_text.replace('\n', '\r\n'))

print("StoryModal.tsx patched successfully!")

