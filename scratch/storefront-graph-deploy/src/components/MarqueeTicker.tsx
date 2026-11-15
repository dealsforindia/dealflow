import React, { useMemo, useState } from 'react';
import { Pause, Play, ArrowUpRight, Tag } from 'lucide-react';
import type { PublicDeal } from '../types';
import { selectTickerDeals } from '../utils/publicLinks';

interface MarqueeTickerProps { deals: PublicDeal[]; loading?: boolean; onSelectDeal?: (deal: PublicDeal) => void; onOpenVerify?: () => void; }
export const MarqueeTicker: React.FC<MarqueeTickerProps> = ({ deals = [], loading, onSelectDeal }) => {
  const items = useMemo(() => selectTickerDeals(deals), [deals]);
  const [paused, setPaused] = useState(false);
  return <section className="premium-ticker" aria-label="Recently loaded directory offers">
    <div className="premium-ticker-inner">
      <span className="premium-ticker-label"><Tag size={14} aria-hidden="true" /><span>Fresh finds</span></span>
      <div className="premium-ticker-window">
        {items.length ? <div className={`premium-ticker-track${paused ? ' is-paused' : ''}`}>
          {[0, 1].map(copy => <div className="premium-ticker-group" key={copy} aria-hidden={copy === 1 || undefined}>{items.map(deal => <button type="button" key={deal.id} tabIndex={copy === 1 ? -1 : 0} title={`Inspect ${deal.title}`} onClick={() => onSelectDeal?.(deal)}>
            <span className="premium-ticker-store">{deal.store || 'Store'}</span><span className="premium-ticker-product">{deal.title}</span><strong>₹{deal.price!.toLocaleString('en-IN')}</strong><ArrowUpRight size={12} aria-hidden="true" />
          </button>)}</div>)}
        </div> : <span className="premium-ticker-empty">{loading ? 'Finding the latest directory offers…' : 'Browse offers below. Confirm prices at checkout.'}</span>}
      </div>
      {!!items.length && <button type="button" className="premium-ticker-pause" aria-label={paused ? 'Resume offer strip' : 'Pause offer strip'} aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? <Play size={14} /> : <Pause size={14} />}</button>}
    </div>
  </section>;
};
