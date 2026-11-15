import { useRef, useState } from 'react';
import { Star } from 'lucide-react';
import { useAutomaticReviews } from '../utils/reviewEvidence';
import { ProductReviews } from './ProductReviews';

/** Shared by store-search and comparison cards, which have no deal-details modal. */
export function CardReviewEvidence({ id, url, title, onOpen }: { id: string; url: string; title: string; onOpen?: () => void }) {
  const target = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { result, load } = useAutomaticReviews(id, url, target);
  const label = result?.rating != null ? `${result.rating.toFixed(1)}${result.rating_count != null ? ` (${result.rating_count.toLocaleString('en-IN')})` : ' / 5'}`
    : result?.reviews.length ? `${result.reviews.length} review excerpts`
    : (load?.status === 'loading' || load?.status === 'queued') ? 'Checking reviews…' : 'Verified Deal';
  return <div ref={target} className="card-review-evidence">
    <button type="button" className={`commerce-card-rating${result?.rating == null ? ' is-unrated' : ''}`} aria-label={`Customer reviews for ${title}`} aria-expanded={onOpen ? undefined : open} onClick={() => onOpen ? onOpen() : setOpen(value => !value)} title={result?.message || load?.message}>
      <Star size={13} fill={result?.rating != null ? 'currentColor' : 'none'} /><span>{label}</span>
    </button>
    {open && !onOpen && <ProductReviews id={id} url={url} />}
  </div>;
}
