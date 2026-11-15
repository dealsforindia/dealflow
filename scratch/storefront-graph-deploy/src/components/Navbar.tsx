import React, { useEffect, useRef, useState } from 'react';
import { Bell, Bookmark, ChevronDown, Heart, Menu, Plus, Scale, Search, SlidersHorizontal, TrendingDown, User, Volume2, VolumeX, Wrench, X } from 'lucide-react';
import { NavTab } from '../types';
import { BrandMark } from './BrandMark';
import { ThemeToggle } from './ThemeToggle';
import { TelegramIcon } from './TelegramIcon';
interface NavbarProps {
  activeTab: NavTab; onTabChange: (tab: NavTab) => void; onSelectCategory?: (category: string) => void;
  onOpenLookup: () => void; onOpenSubmit: () => void; onFocusSearch?: () => void;
  onOpenToolsHub?: () => void; onOpenCommandPalette?: () => void;
  onOpenWatches?: () => void; onBrowseCollections?: () => void;
  onOpenCompareTools?: () => void;
  isAudioEnabled?: boolean; onToggleAudio?: () => void; savedCount?: number;
}
export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, onSelectCategory, onOpenLookup, onOpenSubmit, onFocusSearch, onOpenToolsHub, onOpenCommandPalette, onOpenWatches, onBrowseCollections, onOpenCompareTools, isAudioEnabled = true, onToggleAudio, savedCount = 0 }) => {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const reveal = () => setOpen(true);
    window.addEventListener('idh-open-mobile-menu', reveal);
    return () => window.removeEventListener('idh-open-mobile-menu', reveal);
  }, []);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!container.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener('pointerdown', outside); document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);
  const run = (action?: () => void) => { setOpen(false); action?.(); };
  const go = (tab: NavTab) => run(() => onTabChange(tab));
  const links = [{ id: 'home' as const, label: 'Discover' }, { id: 'ending_soon' as const, label: 'Top discounts' }, { id: 'saved' as const, label: `Saved${savedCount ? ` (${savedCount})` : ''}` }];
  return <header className="commerce-navbar">
    <div className="commerce-nav-inner">
      <button type="button" className="commerce-brand" onClick={() => go('home')} aria-label="IndiaDealHunts home"><BrandMark /><span><strong>India<span>DealHunts</span></strong><small>Discover. Compare. Save.</small></span></button>
      <nav className="commerce-nav-links" aria-label="Main navigation">{links.map(link => <button type="button" key={link.id} className={activeTab === link.id ? 'is-active' : ''} aria-current={activeTab === link.id ? 'page' : undefined} onClick={() => go(link.id)}>{link.label}</button>)}</nav>
      <div className="commerce-nav-actions">
        <button type="button" className="commerce-icon-button" aria-label="Search products" onClick={() => run(onOpenCommandPalette || onFocusSearch)}><Search size={20} /></button>
        <button type="button" className={`commerce-icon-button${activeTab === 'profile' ? ' is-active' : ''}`} aria-label="User Profile & Theme Customization" title="Profile & Themes" onClick={() => go('profile')}><User size={20} /></button>
        <ThemeToggle />
        <a className="commerce-telegram" href="https://t.me/dealsforindiachannel" target="_blank" rel="noopener noreferrer" aria-label="Join IndiaDealHunts on Telegram"><TelegramIcon /><span>Join Telegram</span></a>
        <button type="button" className="mobile-review-alerts" aria-label="Price watches and alerts" onClick={() => run(onOpenWatches || onOpenLookup)}><Bell size={22} /></button>
        <div className="commerce-menu" ref={container}>
          <button ref={trigger} type="button" className="commerce-more" aria-label={open ? 'Close navigation' : 'More shopping tools'} aria-expanded={open} aria-controls="commerce-navigation" onClick={() => setOpen(value => !value)}><span>More</span>{open ? <X size={20} /> : <><ChevronDown className="commerce-more-chevron" size={16} /><Menu className="commerce-more-hamburger" size={21} /></>}</button>
          {open && <div id="commerce-navigation" className="commerce-menu-panel">
            <div className="commerce-menu-heading">Your shopping space</div>
            {onBrowseCollections && <button type="button" className="mobile-collections-menu-action" onClick={() => run(onBrowseCollections)}><Heart size={18} />Browse all collections</button>}
            <div className="commerce-mobile-links">{links.map(link => <button type="button" key={link.id} onClick={() => go(link.id)}>{link.id === 'saved' ? <Bookmark size={18} /> : <TrendingDown size={18} />}{link.label}</button>)}</div>
            <button type="button" onClick={() => go('profile')}><User size={18} />Profile & Themes</button>
            <button type="button" onClick={() => go('wall_of_happiness')}><Heart size={18} />Wall of happiness</button>
            <button type="button" onClick={() => run(onOpenLookup)}><Search size={18} />Price lookup</button>
            {onOpenCompareTools && <button type="button" onClick={() => run(onOpenCompareTools)}><Scale size={18} />Compare deals desk</button>}
            {onOpenToolsHub && <button type="button" onClick={() => run(onOpenToolsHub)}><Wrench size={18} />Shopping tools hub</button>}
            <button type="button" onClick={() => run(onOpenSubmit)}><Plus size={18} />Submit a deal</button>
            {onToggleAudio && <button type="button" aria-pressed={isAudioEnabled} onClick={onToggleAudio}>{isAudioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}Sounds <small>{isAudioEnabled ? 'On' : 'Off'}</small></button>}
            {onSelectCategory && <div className="commerce-menu-categories"><span>Browse categories</span>{['all', 'Electronics', 'Fashion', 'Home', 'Grocery', 'Beauty', 'Sports', 'Automotive', 'Travel'].map(category => <button type="button" key={category} onClick={() => run(() => { onTabChange('home'); onSelectCategory(category); requestAnimationFrame(() => document.getElementById('deals-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })); })}>{category === 'all' ? 'All deals' : category}</button>)}</div>}
            <a className="commerce-menu-telegram" href="https://t.me/dealsforindiachannel" target="_blank" rel="noopener noreferrer"><TelegramIcon />Join our Telegram channel</a>
          </div>}
        </div>
      </div>
    </div>
  </header>;
};
