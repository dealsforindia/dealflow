import { ChevronRight, Percent, Shirt, ShoppingCart, Tag } from 'lucide-react';

interface Props { onDiscounts: () => void; onBudget: () => void; onFashion: () => void; onCompare: () => void; }
export function MobileDiscoveryTiles({ onDiscounts, onBudget, onFashion, onCompare }: Props) {
  const tiles = [
    { title: '70%+ Steals', description: 'Top offers to explore', Icon: Percent, tone: 'violet', action: onDiscounts },
    { title: 'Under ₹499 Loot', description: 'Budget buys that matter', Icon: Tag, tone: 'mint', action: onBudget },
    { title: 'Wardrobe Hits', description: 'Fashion deals for less', Icon: Shirt, tone: 'blue', action: onFashion },
    { title: 'Compare Tools', description: 'Prices. Smarter choices.', Icon: ShoppingCart, tone: 'rose', action: onCompare },
  ];
  return <nav className="mobile-discovery-tiles" aria-label="Shopping collections">{tiles.map(({ title, description, Icon, tone, action }) =>
    <button type="button" key={title} className={`mobile-discovery-tile tone-${tone}`} onClick={action}>
      <span className="mobile-tile-symbol"><Icon size={23} strokeWidth={1.8} /></span><ChevronRight className="mobile-tile-arrow" size={17} />
      <strong>{title}</strong><span>{description}</span>
    </button>)}</nav>;
}
