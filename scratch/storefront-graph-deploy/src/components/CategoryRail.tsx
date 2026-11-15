import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useAnimationControls, useReducedMotion } from 'motion/react';
import { Car, Dumbbell, Grid2X2, Headphones, House, MoreHorizontal, Plane, Shirt, ShoppingBasket, Sparkles } from 'lucide-react';
interface CategoryRailProps { selectedCategory: string; onSelectCategory: (cat: string) => void; categoryCounts?: Record<string, number>; }
const CATEGORIES = [
  { id: 'all', label: 'All Deals', Icon: Grid2X2 },
  { id: 'Electronics', label: 'Electronics', Icon: Headphones },
  { id: 'Fashion', label: 'Fashion', Icon: Shirt },
  { id: 'Home', label: 'Home & Kitchen', Icon: House },
  { id: 'Grocery', label: 'Grocery & 10-Min', Icon: ShoppingBasket },
  { id: 'Beauty', label: 'Beauty & Care', Icon: Sparkles },
  { id: 'Sports', label: 'Sports & Fitness', Icon: Dumbbell },
  { id: 'Automotive', label: 'Automotive', Icon: Car },
  { id: 'Travel', label: 'Luggage & Travel', Icon: Plane },
];
export function CategoryRail({ selectedCategory, onSelectCategory }: CategoryRailProps) {
  const rail = useRef<HTMLDivElement>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const selected = selectedCategory || 'all';
  const reducedMotion = useReducedMotion();
  const controls = useAnimationControls();
  const [bounds, setBounds] = useState({ left: 0, top: 0, width: 0, height: 44 });
  useLayoutEffect(() => {
    const measure = () => {
      const button = buttons.current.get(selected);
      if (!button) return;
      const next = { left: button.offsetLeft, top: button.offsetTop, width: button.offsetWidth, height: button.offsetHeight };
      setBounds(previous => Object.keys(next).every(key => previous[key as keyof typeof next] === next[key as keyof typeof next]) ? previous : next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (rail.current) observer.observe(rail.current);
    buttons.current.forEach(button => observer.observe(button));
    return () => observer.disconnect();
  }, [selected]);
  useEffect(() => {
    if (!bounds.width) return;
    controls.stop();
    controls.set({ scaleX: 1, scaleY: 1, rotate: 0 });
    controls.start(reducedMotion ? { x: bounds.left, y: bounds.top, width: bounds.width, height: bounds.height, opacity: 1, scaleX: 1, scaleY: 1, rotate: 0, transition: { duration: .12 } } : {
      x: bounds.left, y: bounds.top, width: bounds.width, height: bounds.height, opacity: 1,
      scaleX: [1, 1.06, .98, 1], scaleY: [1, .78, 1.06, 1], rotate: [0, -.65, .6, 0],
      transition: { x: { type: 'spring', stiffness: 390, damping: 29, mass: .7 }, width: { type: 'spring', stiffness: 390, damping: 29 }, y: { duration: 0 }, height: { duration: 0 }, opacity: { duration: .1 }, scaleX: { duration: .48 }, scaleY: { duration: .48 }, rotate: { duration: .42, delay: .1 } },
    });
    return () => controls.stop();
  }, [bounds, reducedMotion, controls]);
  return <nav id="category-rail" className="category-rail commerce-categories" aria-label="Category navigation rail">
    <div ref={rail} className="liquid-category-list pr-16 md:pr-4">
      <motion.div className="liquid-category-indicator" initial={{ opacity: 0 }} animate={controls} aria-hidden="true"><span /></motion.div>
      {CATEGORIES.map(({ id, label, Icon }) => <button ref={node => { if (node) buttons.current.set(id, node); else buttons.current.delete(id); }} type="button" key={id} className={`liquid-category-button${selected === id ? ' is-selected' : ''}`} aria-pressed={selected === id} onClick={() => onSelectCategory(id)}><Icon size={17} aria-hidden="true" /><span>{label}</span></button>)}
    </div>
    <button type="button" className="mobile-category-more" aria-label="More shopping tools and categories" onClick={() => window.dispatchEvent(new Event('idh-open-mobile-menu'))}><MoreHorizontal size={20} /><span>More</span></button>
  </nav>;
}
