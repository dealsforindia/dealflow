import { CardReviewEvidence } from './CardReviewEvidence';
import { ProductReviews } from './ProductReviews';
import { PUBLIC_API_BASE, PUBLIC_EDGE_BASE, publicStoreUrl, publicShareUrl, lookupTargetUrl } from '../utils/publicLinks';
import { normalizeLookup, priceFreshness } from '../utils/priceEvidence';
import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Bookmark, Check, ChevronRight, Clock3, Eye, Layers3, Search, ShieldCheck, Sparkles, TrendingDown, X, Bell, GitCompareArrows, Share2, RefreshCw } from 'lucide-react';
import { cleanHistory, decisionFor, groupProducts, IntelligenceOffer, parseMission, offerIdentity, readWatchlist, rupees, writeWatchlist, shoppingMatch } from '../utils/shoppingIntelligence';
import { openGoogleShoppingModal } from '../utils/googleShopping';
import './intelligence.css';
import { CheckoutPlanner } from './CheckoutPlanner';

interface Props {
  query: string; offers: IntelligenceOffer[]; loading: boolean;
  onSearch: (q: string) => void; onLookup: (url: string) => void;
  onAlert: (offer: IntelligenceOffer) => void;
  externalError?: string | null;
}

export function IntelligenceWorkspace({ query, offers, loading, onSearch, onLookup, onAlert, externalError }: Props) {
  const [storeLinksExpanded, setStoreLinksExpanded] = useState(false);
  const [tab, setTab] = useState<'discover' | 'mine'>('discover');
  const [saved, setSaved] = useState<IntelligenceOffer[]>(readWatchlist);
  const [selected, setSelected] = useState<IntelligenceOffer | null>(null);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('relevance');
  const [notice, setNotice] = useState('');
  const [comparison, setComparison] = useState<IntelligenceOffer[]>([]);
  const [recent, setRecent] = useState<string[]>(() => {
    try { const v = JSON.parse(localStorage.getItem('idh-searches') || '[]'); return Array.isArray(v) ? v.filter(q => typeof q === 'string').slice(0, 6) : []; } catch { return []; }
  });
  const mission = parseMission(query);
  useEffect(() => {
    const update = () => setSaved(readWatchlist());
    window.addEventListener('idh-watchlist', update); window.addEventListener('storage', update);
    return () => { window.removeEventListener('idh-watchlist', update); window.removeEventListener('storage', update); };
  }, []);
  useEffect(() => {
    setFilter('all'); setSelected(null);
    if (!query.trim()) return;
    const timer = setTimeout(() => {
      setRecent(prev => {
        const next = [query.trim(), ...prev.filter(q => q !== query.trim())].slice(0, 6);
        try { localStorage.setItem('idh-searches', JSON.stringify(next)); } catch { /* Optional device storage. */ }
        return next;
      });
    }, 1200);
    return () => clearTimeout(timer);
  }, [query]);
  const products = useMemo(() => {
    let list = groupProducts(tab === 'mine' ? saved : offers).filter(g => {
      const o = g.offers[0];
      if (filter === 'verified') return g.offers.some(o => o.source_type === 'database_verified');
      if (filter === 'history') return g.offers.some(o => cleanHistory(o.history).length >= 2);
      if (filter === 'product') return shoppingMatch(query, o) === 'product';
      if (filter === 'budget') return mission.budget != null && !!o.price && o.price <= mission.budget;
      return true;
    });
    if (sort === 'low') list = [...list].sort((a, b) => (a.offers[0].price || Infinity) - (b.offers[0].price || Infinity));
    if (sort === 'history') list = [...list].sort((a, b) => cleanHistory(b.offers[0].history).length - cleanHistory(a.offers[0].history).length);
    return list;
  }, [offers, saved, tab, filter, sort, mission.budget, query]);
  function toggleSave(offer: IntelligenceOffer) {
    const exists = saved.some(o => offerIdentity(o) === offerIdentity(offer));
    const next = exists ? saved.filter(o => offerIdentity(o) !== offerIdentity(offer)) : [offer, ...saved];
    if (writeWatchlist(next)) { setSaved(next); setNotice(exists ? 'Removed from My Mine.' : 'Saved to My Mine on this device.'); }
    else setNotice('Device storage is unavailable. This product could not be saved.');
  }
  function toggleCompare(offer: IntelligenceOffer) {
    if (comparison.length >= 3 && !comparison.some(o => offerIdentity(o) === offerIdentity(offer))) {
      setNotice('Compare up to three products at a time. Remove one to add another.');
      return;
    }
    setComparison(prev => {
      if (prev.some(o => offerIdentity(o) === offerIdentity(offer))) return prev.filter(o => offerIdentity(o) !== offerIdentity(offer));
      if (prev.length >= 3) return prev;
      return [...prev, offer];
    });
  }
  const historyCount = offers.filter(o => cleanHistory(o.history).length >= 2).length;
  const stores = new Set(offers.map(o => o.store)).size;
  const savedPriced = saved.filter(o => o.price != null && o.price > 0);
  const watchTotal = savedPriced.reduce((sum, o) => sum + (o.price || 0), 0);
  const lows = offers.filter(o => decisionFor(o).label === 'At recorded low');
  const relatedCount = offers.filter(o => shoppingMatch(query, o) === 'related').length;
  return <section className={`mine-workspace${query ? ' is-search' : ''}`} aria-label="Shopping intelligence workspace">
    <div className="mine-masthead">
      <div><p className="mine-eyebrow"><Sparkles size={14} /> YOUR SHOPPING ADVANTAGE</p>
        <h2>{query ? 'Compare your finds.' : 'Your shopping desk.'}</h2>
        {!query && <p>Price evidence, thoughtful comparisons, and a shortlist that is yours.</p>}
      </div>
      <div className="mine-switch" aria-label="Workspace views">
        <button type="button" aria-pressed={tab === 'discover'} onClick={() => setTab('discover')}><Layers3 size={16} /> Discover</button>
        <button type="button" aria-pressed={tab === 'mine'} onClick={() => setTab('mine')}><Bookmark size={16} /> My Mine <span>{saved.length}</span></button>
      </div>
    </div>
    {query && tab === 'discover' && <div className="mine-search-note"><Search size={18} /><div><strong>{relatedCount === offers.length && offers.length > 0 ? 'These are related products, not standalone processors.' : 'Keep searching across stores'}</strong><p>{relatedCount > 0 ? `${relatedCount} related results are labelled separately from product matches.` : 'Explore matching offers across Amazon, Flipkart, Myntra, and more.'}</p><button type="button" className="mine-store-disclosure" aria-expanded={storeLinksExpanded} onClick={() => setStoreLinksExpanded(v => !v)}>Search more stores <ChevronRight size={16} /></button><div className={`mine-store-links ${storeLinksExpanded ? 'is-expanded' : ''}`}>{[
      ['Amazon', `https://www.amazon.in/s?k=${encodeURIComponent(mission.product || query)}&tag=rudranil0a-21`],
      ['Flipkart', `https://www.flipkart.com/search?q=${encodeURIComponent(mission.product || query)}`],
      ['Myntra', `https://www.myntra.com/search?q=${encodeURIComponent(mission.product || query)}`],
      ['Google Shopping', 'in-app-radar'],
    ].map(([name, url]) => name === 'Google Shopping' ? (
      <button key={name} type="button" onClick={() => openGoogleShoppingModal(mission.product || query)} className="mine-store-btn inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
        <span>🛍️ Google Shopping Radar (In-App)</span>
      </button>
    ) : (
      <a key={name} href={url} target="_blank" rel="noopener noreferrer">Search {name}<ArrowUpRight size={13} /></a>
    ))}</div></div></div>}
    {tab === 'mine' && saved.length > 0 && <div className="mine-briefing"><Bookmark size={20} /><div><strong>Your shopping shortlist · {rupees(watchTotal)}</strong><p>{savedPriced.length} priced offers saved across {new Set(saved.map(o => o.store)).size} stores. This is a snapshot total, excluding delivery and checkout-specific offers.</p></div></div>}
    {tab === 'discover' && lows.length > 0 && <div className="mine-briefing"><TrendingDown size={20} /><div><strong>{lows.length} offers at their recorded low</strong><p>Based on supplied historical observations. Open a product to inspect the dates and evidence.</p></div></div>}
    <div className="mine-pulse">
      <div><span>SEARCH COVERAGE</span><strong>{loading ? 'Scanning…' : `${offers.length} offers`} <small>from {stores} stores</small></strong></div>
      <div><span>PRICE EVIDENCE</span><strong>{historyCount} <small>with recorded history</small></strong></div>
      <div><span>YOUR MISSION</span><strong>{mission.budget ? rupees(mission.budget) : 'Find your best fit'} <small>{mission.budget ? 'maximum budget' : 'inspect before buying'}</small></strong></div>
    </div>
    {recent.length > 0 && !query && <div className="mine-recents"><Clock3 size={15} /><span>Recent searches</span>{recent.map(q => <button type="button" key={q} onClick={() => onSearch(q)}>{q}<ChevronRight size={13} /></button>)}</div>}
    <div className="mine-controls">
      <div className="mine-filters">{[{ key: 'all', label: tab === 'mine' ? 'Saved products' : 'All discoveries' }, { key: 'verified', label: 'Directory offers' }, { key: 'history', label: 'With price history' }, ...(relatedCount ? [{ key: 'product', label: 'Product matches' }] : []), ...(mission.budget ? [{ key: 'budget', label: 'Within budget' }] : [])].map(f => <button type="button" key={f.key} aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>{f.label}</button>)}</div>
      <label className="mine-sort">Sort <select value={sort} onChange={e => setSort(e.target.value)}><option value="relevance">Source order</option><option value="low">Price: low to high</option><option value="history">Most price evidence</option></select></label>
    </div>
    {notice && <div className="mine-notice" role="status">{notice}<button type="button" aria-label="Dismiss message" onClick={() => setNotice('')}><X size={16} /></button></div>}
    {loading && tab === 'discover' && !offers.length ? <div className="mine-grid" aria-busy="true">{[0, 1, 2, 3].map(i => <div key={i} className="mine-skeleton" />)}</div> : !products.length ?
      <div className="mine-empty"><Search size={28} /><h3>{tab === 'mine' ? 'Start your own goldmine.' : 'No offers in this view yet.'}</h3><p>{tab === 'mine' ? 'Save products to compare their evidence and revisit them here. Saved prices are snapshots; refresh before buying.' : 'Try another filter or search. Store searches and existing tools remain below.'}</p><button type="button" onClick={() => { setFilter('all'); setTab('discover'); }}>Explore discoveries <ChevronRight size={16} /></button></div> :
      <div className="mine-grid">{products.slice(0, 24).map(group => {
        const offer = group.offers[0], decision = decisionFor(offer), isSaved = saved.some(s => offerIdentity(s) === offerIdentity(offer)), points = cleanHistory(offer.history);
        return <article className="mine-product" key={group.id}>
          <div className="mine-product-media"><span className={`mine-source ${offer.source_type === 'database_verified' ? 'is-verified' : ''}`}>{offer.source_type === 'database_verified' ? <ShieldCheck size={13} /> : <Eye size={13} />}{offer.source_type === 'database_verified' ? 'Directory offer' : offer.source_type === 'reference_listing' ? 'Reference listing' : 'Store candidate'}</span><button type="button" className="mine-save" aria-label={`${isSaved ? 'Unsave' : 'Save'} ${offer.title}`} aria-pressed={isSaved} onClick={() => toggleSave(offer)}>{isSaved ? <Check size={18} /> : <Bookmark size={18} />}</button><ProductImage key={offer.image || offerIdentity(offer)} offer={offer} /></div>
          <div className="mine-product-body"><span className="mine-merchant">{offer.store}{group.offers.length > 1 ? ` · ${group.offers.length} offers` : ''}</span><h3>{offer.title}</h3><CardReviewEvidence id={offer.id} url={offer.raw_url || offer.url} title={offer.title} onOpen={() => setSelected(offer)} />{shoppingMatch(query, offer) === 'related' && <span className='mine-related'>Related result · not a standalone processor</span>}<div className="mine-price">{rupees(offer.price)}{offer.mrp && offer.price && offer.mrp > offer.price && <s>{rupees(offer.mrp)}</s>}</div><div className={`mine-verdict tone-${decision.tone}`}><TrendingDown size={14} />{decision.label}</div><p className="mine-evidence">{points.length >= 2 ? `${points.length} recorded prices · Low ${rupees(Math.min(...points.map(p => p[1])))}` : 'History needs checking · Stock not assumed'}</p>
          <div className="mine-card-actions"><button type="button" className="mine-inspect" onClick={e => { e.currentTarget.focus(); setSelected(offer); }}>Inspect offer<ArrowUpRight size={16} /></button><button type="button" aria-label={`Compare ${offer.title}`} aria-pressed={comparison.some(o => offerIdentity(o) === offerIdentity(offer))} onClick={() => toggleCompare(offer)}><GitCompareArrows size={17} /></button></div></div>
        </article>;
      })}</div>}
    <div className="mine-footnote"><ShieldCheck size={16} />Different models and variants are separate products. Affiliate links may earn us a commission; they do not guarantee extra discounts.</div>
    {comparison.length > 0 && <div className="mine-comparison"><div className="mine-history-head"><h3><GitCompareArrows size={16} /> Your comparison · {comparison.length}/3</h3><button type="button" onClick={() => setComparison([])}>Clear</button></div><p>Compare product choices. Prices below may represent different models or variants.</p><div className="mine-comparison-grid">{comparison.map(o => <div key={offerIdentity(o)}><button type="button" aria-label={`Remove ${o.title} from comparison`} onClick={() => toggleCompare(o)}><X size={16} /></button><h4>{o.title}</h4><strong>{rupees(o.price)}</strong><span>{o.store}</span><span>{decisionFor(o).label}</span><span>{cleanHistory(o.history).length} price observations</span><button type="button" onClick={e => { e.currentTarget.focus(); setSelected(o); }}>Inspect evidence</button><CheckoutPlanner offer={o} /></div>)}</div></div>}
    {selected && <EvidencePanel key={offerIdentity(selected)} offer={selected} group={groupProducts(offers).find(g => g.offers.some(o => offerIdentity(o) === offerIdentity(selected)))?.offers || [selected]} onClose={() => setSelected(null)} onLookup={onLookup} onSave={toggleSave} onAlert={onAlert} isSaved={saved.some(o => offerIdentity(o) === offerIdentity(selected))} />}
  </section>;
}

function EvidencePanel({ offer: originalOffer, group, onClose, onLookup, onSave, onAlert, isSaved }: { offer: IntelligenceOffer; group: IntelligenceOffer[]; onClose: () => void; onLookup: (url: string) => void; onSave: (o: IntelligenceOffer) => void; onAlert: (o: IntelligenceOffer) => void; isSaved: boolean }) {
  const [offer, setOffer] = useState(originalOffer);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');
  const [question, setQuestion] = useState('');
  const request = React.useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  async function refreshEvidence() {
    request.current?.abort();
    const controller = new AbortController(); request.current = controller;
    const timeout = setTimeout(() => controller.abort(), 22000);
    setRefreshing(true); setMessage('');
    try {
      const api = PUBLIC_API_BASE;
      const target = lookupTargetUrl(offer.raw_url || offer.url);
      let res = await fetch(`${api}/api/v1/deals/analyze-url?url=${encodeURIComponent(target)}`, { signal: controller.signal, cache: 'no-store' }).catch(() => null);
      if ((!res || !res.ok) && !controller.signal.aborted) res = await fetch(`${api}/api/v1/deals/lookup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: target }), signal: controller.signal });
      if (!res?.ok) throw new Error('lookup unavailable');
      const data = normalizeLookup(await res.json()) as any;
      if (controller.signal.aborted || request.current !== controller) return;
      if (data.success === false || data.status === 'error' || (!data.title && !data.product_name)) throw new Error('product unavailable');
      const history = cleanHistory([...(offer.history || []), ...(Array.isArray(data.history) ? data.history : [])]);
      setOffer(prev => ({ ...prev,
        price: typeof data.price === 'number' && data.price > 0 ? data.price : null,
        price_verified: data.price_verified, price_source: data.price_source,
        mrp: typeof data.mrp === 'number' ? data.mrp : null,
        history, has_price_history: history.length >= 2,
        in_stock: typeof data.in_stock === 'boolean' ? data.in_stock : undefined,
        affiliate_applied: data.affiliate_applied === true,
        url: publicStoreUrl(data.aff_url || prev.url),
        effective_price: typeof data.effective_price === 'number' && data.effective_price > 0 ? data.effective_price : null,
        coupon: typeof data.coupon === 'string' ? data.coupon : null,
        coupon_discount: typeof data.coupon_discount === 'number' ? data.coupon_discount : null,
        regular_price: typeof data.regular_price === 'number' ? data.regular_price : null,
        last_checked_at: Number(data.last_checked_at) || undefined,
      }));
      setMessage(!data.price ? 'Current merchant price is unconfirmed. Supplied historical observations remain available.' : history.length >= 2 ? 'Price evidence updated from the lookup service.' : 'Merchant price checked. Enough historical observations were not supplied for a timing verdict.');
    } catch { if (request.current === controller) setMessage('Live evidence could not be retrieved. Existing observations are still shown; no price or history was invented.'); }
    finally { clearTimeout(timeout); if (request.current === controller) setRefreshing(false); }
  }
  async function share() {
    try { await navigator.clipboard.writeText(`${offer.title}\n${rupees(offer.price)} at ${offer.store}\n${decisionFor(offer).label}\n${publicShareUrl(offer.url)}\nAffiliate links may earn a commission. Confirm price and availability at checkout.`); setMessage('Offer summary copied. Paste it into your preferred sharing app.'); }
    catch { setMessage('Clipboard unavailable. Use the store link to share this offer.'); }
  }
  const points = cleanHistory(offer.history), decision = decisionFor(offer);
  const low = points.length ? Math.min(...points.map(p => p[1])) : null;
  const high = points.length ? Math.max(...points.map(p => p[1])) : null;
  const median = points.length ? [...points.map(p => p[1])].sort((a, b) => a - b)[Math.floor(points.length / 2)] : null;
  const freshness = priceFreshness(offer);
  const observedDiscount = freshness.current && points.length >= 2 && median && offer.price && median > offer.price ? Math.round((1 - offer.price / median) * 100) : null;
  const [days, setDays] = useState(0);
  const range = days ? points.filter(p => p[0] >= Date.now() - days * 86400000) : points;
  const dialog = React.useRef<HTMLDialogElement>(null);
  useEffect(() => { const before = document.activeElement as HTMLElement; const panel = dialog.current; panel?.showModal(); return () => { panel?.close(); if (before?.isConnected) before.focus({ preventScroll: true }); }; }, []);
  return <dialog ref={dialog} className="mine-dialog" onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === e.currentTarget) onClose(); }} aria-labelledby="mine-product-title">
    <div className="mine-dialog-top"><span className="mine-eyebrow"><ShieldCheck size={14} /> PRODUCT INTELLIGENCE</span><button type="button" aria-label="Close product intelligence" onClick={onClose}><X size={21} /></button></div>
    <div className="mine-dialog-content"><p className="mine-merchant">{offer.store}</p><h2 id="mine-product-title">{offer.title}</h2><div className="mine-dialog-price">{rupees(offer.price)}<span>{freshness.current ? freshness.label : 'Source-reported listing · current price unconfirmed'} · confirm at checkout</span></div>
      <div className={`mine-decision tone-${decision.tone}`}><strong>{decision.label}</strong><p>{decision.reason}</p></div>
      <div className="mine-refresh"><button type="button" disabled={refreshing} onClick={refreshEvidence}><RefreshCw size={15} />{refreshing ? 'Checking source…' : 'Refresh real price evidence'}</button><span>{message || 'Check history and current price directly through the lookup service.'}</span></div>
      <div className="mine-history-head"><h3>Recorded price history</h3><div>{[7, 30, 90, 0].map(d => <button type="button" key={d} aria-pressed={days === d} onClick={() => setDays(d)}>{d ? `${d}d` : 'All'}</button>)}</div></div>
      {range.length >= 2 ? <PriceChart points={range} /> : <div className="mine-chart-empty">Not enough recorded points for this period. Check the merchant link for available history.</div>}
      <div className="mine-stat-row"><div><span>Recorded low</span><strong>{rupees(low)}</strong></div><div><span>Observed median</span><strong>{rupees(median)}</strong></div><div><span>Recorded high</span><strong>{rupees(high)}</strong></div></div>
      {observedDiscount != null && <p className="mine-real-discount">{observedDiscount}% below the observed median. This is independent of the merchant's MRP.</p>}
      <h3 className="mine-block-title">Offer evidence</h3><dl className="mine-facts"><div><dt>Discovery</dt><dd>{offer.source_type === 'database_verified' ? 'Deal directory' : offer.source_type === 'reference_listing' ? 'Reference listing · price not checked' : offer.source_type?.includes('google') ? 'External shopping search' : 'Live store search'}</dd></div><div><dt>Stock</dt><dd>{offer.in_stock === true ? 'Source reports in stock' : offer.in_stock === false ? 'Source reports out of stock' : 'In Stock'}</dd></div><div><dt>Verification</dt><dd>Direct Verified Store Link</dd></div><div><dt>Freshness</dt><dd>{offer.last_checked_at ? new Date(offer.last_checked_at < 1e12 ? offer.last_checked_at * 1000 : offer.last_checked_at).toLocaleString('en-IN') : 'Recently verified'}</dd></div><div><dt>Coverage</dt><dd>{points.length ? `${points.length} observations recorded` : 'Live store listing'}</dd></div></dl>
      <h3 className="mine-block-title">Checkout breakdown</h3><dl className="mine-facts"><div><dt>Listed price</dt><dd>{rupees(offer.price)}</dd></div><div><dt>Coupon</dt><dd>{offer.coupon || 'No coupon supplied'}</dd></div><div><dt>Price after supplied coupon</dt><dd>{offer.effective_price ? rupees(offer.effective_price) : 'Not calculated by source'}</dd></div><div><dt>Delivery / bank offers</dt><dd>Confirm eligibility at checkout</dd></div></dl>
      <CheckoutPlanner offer={offer} />
      <h3 className="mine-block-title">Truth timeline</h3><ol className="mine-timeline">{offer.posted_at && offer.posted_at > 0 ? <li><strong>Directory discovery</strong><span>{new Date(offer.posted_at < 1e12 ? offer.posted_at * 1000 : offer.posted_at).toLocaleString('en-IN')}</span></li> : null}{points.length > 0 && <li><strong>Earliest supplied price observation</strong><span>{new Date(points[0][0]).toLocaleDateString('en-IN')} · {rupees(points[0][1])}</span></li>}{points.length > 1 && <li><strong>Latest supplied price observation</strong><span>{new Date(points[points.length - 1][0]).toLocaleDateString('en-IN')} · {rupees(points[points.length - 1][1])}</span></li>}<li><strong>Current source listing</strong><span>{rupees(offer.price)} · {offer.last_checked_at ? 'Check timestamp available above' : 'Check timestamp not supplied'}</span></li>{offer.cluster_count && offer.cluster_count > 1 ? <li><strong>Community signal</strong><span>{offer.consensus_badge || `Spotted by ${offer.cluster_count} sources; independent verification is not implied.`}</span></li> : null}</ol>
      {group.length > 1 && <><h3 className="mine-block-title">Matching product offers</h3><div className="mine-matching">{group.map(o => <a key={offerIdentity(o)} href={publicStoreUrl(o.url) || undefined} target="_blank" rel="noopener noreferrer sponsored"><span>{o.store}</span><strong>{rupees(o.price)}</strong><ArrowUpRight size={15} /></a>)}</div></>}
      <h3 className="mine-block-title">Ask about this offer</h3><div className="mine-questions">{['Should I buy now?', 'Is the discount real?', 'What is missing?'].map(q => <button type="button" key={q} aria-pressed={question === q} onClick={() => setQuestion(q)}>{q}</button>)}</div>{question && <p className="mine-answer" role="status">{question === 'Should I buy now?' ? decision.reason : question === 'Is the discount real?' ? observedDiscount != null ? `The current price is ${observedDiscount}% below the observed median. The claimed MRP of ${rupees(offer.mrp)} is a separate merchant reference, not proof of savings.` : 'An MRP discount alone cannot establish a genuine bargain. More recorded prices are needed.' : `${points.length < 2 ? 'Price history is insufficient. ' : ''}${offer.in_stock == null ? 'Stock is unconfirmed. ' : ''}${!offer.last_checked_at ? 'A check timestamp is unavailable. ' : ''}Delivery, seller details, and bank-offer eligibility need confirmation at checkout.`}</p>}
      <div className="mine-dialog-actions"><button type="button" onClick={() => onSave(offer)}><Bookmark size={16} />{isSaved ? 'Remove from My Mine' : 'Save to My Mine'}</button><button type="button" onClick={() => { onClose(); onAlert(offer); }}><Bell size={16} />Set price target</button><button type="button" onClick={share}><Share2 size={16} />Copy share card</button><button type="button" onClick={() => { onClose(); onLookup(offer.raw_url || offer.url); }}>Full price lookup<ArrowUpRight size={16} /></button>{offer.url && <a href={publicStoreUrl(offer.url) || undefined} target="_blank" rel="noopener noreferrer sponsored">Visit {offer.store}<ArrowUpRight size={16} /></a>}</div>
    </div>
  </dialog>;
}

function ProductImage({ offer }: { offer: IntelligenceOffer }) {
  const [failed, setFailed] = useState(false);
  if (!offer.image || failed) return <div className="mine-image-fallback"><Layers3 size={42} /><span>Offer Preview</span></div>;
  return <img src={offer.image} alt={offer.title} loading="lazy" onError={() => setFailed(true)} />;
}

function PriceChart({ points }: { points: Array<[number, number]> }) {
  const [hover, setHover] = useState<number | null>(null);
  const min = Math.min(...points.map(p => p[1])), max = Math.max(...points.map(p => p[1]));
  const coords = points.map(([t, p]) => [20 + (t - points[0][0]) / Math.max(1, points[points.length - 1][0] - points[0][0]) * 560, 155 - (p - min) / Math.max(1, max - min) * 120]);
  return <div className="mine-chart"><svg viewBox="0 0 600 180" role="img" aria-label={`Price history from ${rupees(min)} to ${rupees(max)} across ${points.length} observations`}><path d={`M${coords.map(p => p.join(',')).join(' L')}`} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />{coords.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={hover === i ? 7 : 4} fill="#2563eb" tabIndex={0} aria-label={`${new Date(points[i][0]).toLocaleDateString('en-IN')}: ${rupees(points[i][1])}`} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onMouseLeave={() => setHover(null)} onBlur={() => setHover(null)}><title>{new Date(points[i][0]).toLocaleDateString('en-IN')}: {rupees(points[i][1])}</title></circle>)}</svg><p>{hover != null ? `${new Date(points[hover][0]).toLocaleDateString('en-IN')} · ${rupees(points[hover][1])}` : 'Hover or focus a point to inspect the recorded price.'}</p></div>;
}




