import { ArrowUpRight, MessageSquare, RefreshCw, Star } from 'lucide-react';
import { useAutomaticReviews } from '../utils/reviewEvidence';

export function ProductReviews({ id, url }: { id: string; url: string }) {
  const { result, load, retry } = useAutomaticReviews(id, url);
  const loading = load?.status === 'loading' || load?.status === 'queued';
  const error = load?.status === 'error' ? load.message : '';
  return <section className="product-reviews" aria-label="Customer review evidence" aria-busy={loading}>
    <header><div><h3><MessageSquare size={18} />Customer reviews</h3><p>Public merchant ratings and review excerpts. Loaded automatically.</p></div>{(error || result?.status === 'busy' || result?.status === 'blocked') && <button type="button" disabled={loading} onClick={retry} aria-label="Retry customer reviews"><RefreshCw size={16} />Retry</button>}</header>
    {loading && <p role="status">Checking the product’s public review evidence…</p>}
    {error && <p className="text-xs text-slate-500 dark:text-slate-400 py-1">Customer reviews and ratings can be confirmed directly on the merchant page.</p>}
    {!result && !loading && !error && <p>Available for specific Amazon India, Flipkart and Myntra product pages. Ratings appear only when the source supplies them.</p>}
    {result && <>
      {result.rating != null && <div className="review-rating-summary"><Star size={23} fill="currentColor" /><strong>{result.rating.toFixed(1)}<small> / 5</small></strong><span>{result.rating_count != null ? `${result.rating_count.toLocaleString('en-IN')} ratings` : 'Rating count unavailable'}{result.review_count != null && ` · ${result.review_count.toLocaleString('en-IN')} reviews`}</span></div>}
      <p role="status">{result.message}</p>
      {!!result.reviews.length && <p className="review-sample-label">{result.reviews.length} public review excerpts · up to 8 collected · this is a sample</p>}
      {result.reviews.map((review, index) => <article key={index}>{review.rating != null && <span className="review-stars"><Star size={13} fill="currentColor" />{review.rating} / 5</span>}{review.title && <h4>{review.title}</h4>}<p>{review.text}</p><footer>{review.verified_purchase === true && <span>Merchant marked verified purchase</span>}{review.date && <time>{review.date}</time>}</footer></article>)}
      <div className="review-provenance"><a href={result.source_url} target="_blank" rel="noopener noreferrer">Read at {result.store}<ArrowUpRight size={14} /></a><span>{result.cached ? 'Cached evidence · ' : ''}Checked {new Date(result.checked_at * 1000).toLocaleString()}</span></div>
    </>}
  </section>;
}
