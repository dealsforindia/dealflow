import React, { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, Search, ShoppingBag, TrendingDown, X } from 'lucide-react';
import { PublicDeal } from '../types';
import { getCleanImageUrl } from '../utils/imageUrl';
import { publicStoreUrl } from '../utils/publicLinks';
import { openGoogleShoppingModal } from '../utils/googleShopping';

interface HeroBannerProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  searchMode?: 'db' | 'live';
  onSearchModeChange?: (mode: 'db' | 'live') => void;
  onOpenLookup?: (url?: string) => void;
  highDiscountCount?: number;
  onFilterFlashLoot?: () => void;
  spotlightDeal?: PublicDeal | null;
  spotlightAlternatives?: PublicDeal[];
}
const SEARCHES = ['iPhone', 'Mobiles under 20k', 'Laptops', 'Earbuds & TWS', 'Smartwatch', 'Sneakers'];

export const HeroBanner: React.FC<HeroBannerProps> = ({ searchQuery, onSearch, onOpenLookup, highDiscountCount, onFilterFlashLoot, spotlightDeal, spotlightAlternatives = [] }) => {
  const [input, setInput] = useState(searchQuery);
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set());
  useEffect(() => { setInput(searchQuery); }, [searchQuery]);
  function submit(event: React.FormEvent) {
    event.preventDefault();
    const value = input.trim();
    if ((/^https?:\/\//i.test(value) || /amzn\.|flipkart\.|myntra\./i.test(value)) && onOpenLookup) { onOpenLookup(value); return; }
    onSearch(value);
  }
  const displayable = (offer?: PublicDeal | null) => !!offer?.image && !failedImages.has(getCleanImageUrl(offer.image) || '') && offer.price > 0 && !offer.is_expired && !offer.is_over && !['expired', 'rejected', 'pending', 'pending_approval'].includes(offer.status || '') && !!publicStoreUrl(offer.url);
  const spotlight = displayable(spotlightDeal) ? spotlightDeal : spotlightAlternatives.find(displayable);
  const spotlightImage = spotlight ? getCleanImageUrl(spotlight.image) : null;
  const reference = spotlight?.mrp && spotlight.mrp > spotlight.price ? spotlight.mrp : null;
  const saving = reference && spotlight ? reference - spotlight.price : null;
  const discount = reference && spotlight ? Math.round((reference - spotlight.price) / reference * 100) : null;
  return <section className="premium-hero" aria-label="Discover your next deal">
    <div className={`premium-hero-frame${!spotlight ? ' has-no-spotlight' : ''}`}>
      <img className="mobile-hero-art" src="/brand/mobile-product-collage-v1.webp" alt="" aria-hidden="true" width="600" height="600" fetchPriority="high" />
      <div className="premium-hero-copy">
        <div className="premium-kicker"><span aria-hidden="true" />THE SMARTER WAY TO SHOP</div>
        <h1>Great finds.<br /><span>Smarter savings.</span></h1>
        <p className="premium-hero-description"><span className="hidden md:inline">Search your favourite stores. Compare available price evidence.<br className="hidden xl:block" /> Keep the finds worth coming back for.</span><span className="md:hidden">Search stores. Compare prices. Track drops.<br />Save smarter.</span></p>
        <form className="premium-search" onSubmit={submit} role="search" aria-label="Search the deal directory and stores">
          <Search size={21} aria-hidden="true" />
          <input id="hero-search-input" aria-label="Search deals or paste product URL" placeholder="Search products or paste a link" value={input} onChange={event => setInput(event.target.value)} type="search" />
          {input && <button type="button" className="premium-search-clear" aria-label="Clear search" onClick={() => { setInput(''); onSearch(''); }}><X size={17} /></button>}
          <button className="premium-search-submit" type="submit" aria-label="Find deals"><span>Find deals</span><ArrowRight size={18} aria-hidden="true" /></button>
        </form>
        <div className="premium-popular" aria-label="Popular product searches"><span className="premium-popular-label">Explore</span>
          <button type="button" className="premium-flash-search premium-radar-search" onClick={() => openGoogleShoppingModal(input.trim() || 'trending deals')} title="Search available external store listings"><ShoppingBag size={15} />Price Radar <ArrowRight size={13} /></button>
          {!!highDiscountCount && onFilterFlashLoot && <button type="button" className="premium-flash-search" onClick={onFilterFlashLoot}><TrendingDown size={15} />{highDiscountCount} big drops</button>}
          {SEARCHES.map(term => <button type="button" key={term} onClick={() => { setInput(term); onSearch(term); }}>{term}</button>)}
        </div>
        <div className="premium-store-line"><span>Find offers from</span><strong>amazon</strong><i aria-hidden="true" /><strong>Flipkart</strong><i aria-hidden="true" /><strong>Myntra</strong></div>
      </div>
      {spotlight && spotlightImage && <aside className="premium-spotlight" aria-label="Featured directory offer">
        <div className="premium-spotlight-heading"><span><span className="premium-spotlight-dot" />IN THE SPOTLIGHT</span><span>{spotlight.store || 'Store offer'}</span></div>
        <a className="premium-spotlight-image" href={spotlight.url} target="_blank" rel="noopener noreferrer" aria-label={`View ${spotlight.title} at the store`}>
          <img src={spotlightImage} alt={spotlight.title} onError={() => setFailedImages(previous => new Set([...previous, spotlightImage]))} />
          {discount != null && discount > 0 && <span className="premium-spotlight-discount">{discount}% below MRP</span>}
          <span className="premium-photo-arrow"><ArrowUpRight size={20} /></span>
        </a>
        <div className="premium-spotlight-details"><h2>{spotlight.title}</h2>
          <div className="premium-spotlight-price"><strong>₹{spotlight.price.toLocaleString('en-IN')}</strong>{reference && <s>₹{reference.toLocaleString('en-IN')}</s>}</div>
          <div className="premium-spotlight-bottom"><span>{saving ? `₹${saving.toLocaleString('en-IN')} less than MRP` : 'Confirm price at checkout'}</span><a href={spotlight.url} target="_blank" rel="noopener noreferrer">View deal <ArrowUpRight size={16} /></a></div>
        </div>
      </aside>}
    </div>
  </section>;
};
