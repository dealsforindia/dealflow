from pathlib import Path
from html import escape
import json

ROOT = Path(__file__).parent
entries = []
def page(key,title,group,priority,findings,fix,desktop=None,mobile=None,scope='Live visual review; initial or default state.'):
    entries.append(dict(key=key,title=title,group=group,priority=priority,findings=findings,fix=fix,desktop=desktop,mobile=mobile,scope=scope))

page('home','Homepage','Browse','P1',[
('Hierarchy','The hero, collections, category rail and filters precede the desktop inventory; the grid heading was around y=842 at a 720px viewport.'),
('Visual weight','Repeated blue frames, raised pills and strong actions make navigation compete with products.'),
('Mobile','Mobile gets products into the first screen. Preserve that advantage while reducing the competing header and dock controls.')],
'Start with search, one category system and the product grid. Define a coherent image, title, price and action hierarchy before extending the design.', 'desktop-top.png','mobile-top.png')
page('discounts','Top discounts','Browse','P1',[
('Naming','The badge says STEEPEST PRICE DROPS while the explanation says the ranking uses listed discount from MRP. Those are different claims.'),
('Controls','Pink active styling and emoji discount tiers introduce a separate visual language from Discover.'),
('Mobile','The introduction and wrapped filter panel consume much of the screen before products begin.')],
'Name the ranking by its actual basis. Use the shared category/filter pattern and move secondary explanations behind a concise disclosure.', 'discounts-desktop.png','discounts-mobile.png')
page('worth','Worth score ranking','Browse','P1',[
('Meaning','Algorithmic value leaderboard, God Tier and Mathematical ROI Ranking give a simple heuristic a more authoritative tone than the explanation supports.'),
('Hierarchy','The scoring explanation and tier controls take priority over the products.'),
('Mobile','Stacked score pills form a tall navigation block; the number needs an understandable reason next to each deal.')],
'Use a plain-language ranking name, expose score inputs and limitations, and explain the reason for a score at the item level.', 'worth-desktop.png','worth-mobile.png')
page('saved','Saved deals — empty','Browse','P2',[
('Repetition','The page title, saved badge and empty-state title all repeat the same state.'),
('Content','The local-device storage explanation is valuable but competes with introductory copy.'),
('Action','Browse Latest Deals is relatively quiet inside a large decorative panel.')],
'Use a compact empty state with one clear browse action and a short local-storage explanation.', 'saved-desktop.png','saved-mobile.png')
page('saved-populated','Saved deals — populated','Browse','P1',[
('Layout','A single saved item sits under a full-width search toolbar, creating a sparse inventory layout.'),
('Action weight','Clear All appears beside Find More Deals in the introductory region.'),
('Purpose','This screen repeats discovery cards rather than emphasizing shortlist decisions.')],
'Prioritize revisiting, comparing and removing shortlisted items. Keep destructive bulk controls secondary.', 'saved-populated-desktop.png',scope='One real offer was saved, opened in Saved, then unsaved to restore the audit session. Desktop state verified.')
page('search','Search results workspace','Search','P1',[
('Layers','Search header, workspace tabs, cross-store banner, source tabs and sorting sit above results.'),
('Naming','Discover/Saved appears again inside the workspace, alongside the app navigation.'),
('Evidence','The count moved from 0 to 80 directory results during the earbuds query. The later mobile capture showed Offer Preview fallbacks. This needs a relevance, provenance and image-loading follow-up; the capture alone does not establish the cause.')],
'Make the query and results dominant. Show directory and external-source status with explicit loading, empty and error states. Check relevance and duplicate counting separately.', 'search-results-desktop.png','search-results-mobile.png',scope='Actual earbuds query. Initial desktop and later mobile states captured; search quality and completion were not exhaustively verified.')
page('palette','Global search palette','Search','P2',[
('Mixed tasks','One field searches products and utilities, while result rows, merchant filters, trending chips and All 12 Engines share the panel.'),
('Density','Long product titles, discount badges and View labels crowd the compact rows.'),
('Consistency','Rows use a different merchant/discount treatment from the storefront cards.')],
'Separate product results from tool commands and reuse compact product identity rules. Retain keyboard navigation as a useful pattern.', 'search-palette-desktop.png','search-palette-mobile.png')
page('radar','External store discovery radar','Search','P1',[
('Heading','Google Shopping & Pan-India Radar is a long implementation-oriented title.'),
('Mobile','Title, status, description and close control take a large area above the search input.'),
('States','The reviewed state showed scanning and zero store filters alongside Merchant Checkout Verified. Do not let a persistent positive label imply verification of results that have not loaded.')],
'Use a shopper-facing title, compact query controls and evidence labels tied to actual results. Keep loading state distinct from an empty result.', mobile='radar-mobile.png',scope='Live mobile loading state inspected. No successful merchant quote was established.')
page('filters','Filter and sort sheet','Browse','P2',[
('Strength','The mobile sheet has visible labels and a clear Show results action.'),
('Consistency','Its native selects and broad button contrast are calmer than the multi-pill filters elsewhere.'),
('Opportunity','Selected filters should be visible in the feed after the sheet closes.')],
'Use this simpler interaction as the basis for a shared filtering pattern. Verify applied filters, reset and result counts during implementation.', mobile='filters-mobile.png')
page('detail','Product details and price history','Product','P1',[
('Claims','Directory offer, Verified Flipkart, savings vs MRP and DealFlow Verified Price History appear in different parts of the same detail view. Explain exactly what each label verifies.'),
('Priority','The photo, full merchant title, discount and large history panel compete. The desktop footer offers merchant, Scan Stores, Copy Link and expiry actions.'),
('Mobile','The history panel consumes much of the first screen. Product specifications and the next buying decision need a clearer order.')],
'Build an offer summary, then dated price evidence and specifications. Give the merchant action clear priority; put occasional utilities behind secondary controls.', 'detail-desktop.png','detail-mobile.png',scope='Real Aqua Frisch product opened from the feed. Loaded desktop history showed six recorded checks; no merchant purchase or external-price verification performed.')
page('compare','Deal comparison','Product','P1',[
('Mobile','The wide table shows one product column and requires horizontal movement to reach the other.'),
('Hierarchy','Large row labels and a tall heading reduce the visible comparison area.'),
('Source','The source-provided demo compares shoes with a watch, which is unsuitable as evidence of a useful product comparison.')],
'Use a mobile comparison designed around a small shortlist. Keep product identity visible while reading differences; support unlike products without inventing meaningful spec comparisons.', mobile='compare-mobile-demo.png',scope='Built-in ?modal=compare fixture. Layout-only review; broken demo images are not treated as a production catalog defect.')
page('specs','Specification comparison','Product','P1',[
('Mobile','Wide comparison columns and oversized product headers leave the second item outside the initial view.'),
('Navigation','Offer prices opens a different comparison surface, adding a second layout to learn.'),
('Evidence','Best Price and worth-score rows need clear scope when specifications or scores are not supplied.')],
'Combine price and specifications into one comparison model, with a mobile-friendly way to inspect differences and explicit missing-data states.', mobile='specs-mobile-demo.png',scope='Opened from the built-in comparison fixture. Layout and labeling reviewed; live specification completeness not tested.')
page('lookup','Product price lookup','Product','P2',[
('Layout','A short form sits inside a centered dialog with substantial surrounding empty space.'),
('Naming','Analyzer and Watches introduce another vocabulary beside Price Radar, tracking and alerts.'),
('Input','The URL field relies on placeholder copy to explain supported inputs.')],
'Use a visible Product link label, concise source guidance and a shared price-history entry pattern. Distinguish inspection from saving a target.', 'lookup-desktop.png','lookup-mobile.png')
page('watches','Saved price goals','Product','P2',[
('Naming','Watches, saved price goals, alerts and tracked scrapers are competing terms.'),
('Empty state','Add New Link and the explanatory empty-state text point back to Analyzer without making that relationship obvious.'),
('Device scope','The screen says targets are saved on this device; keep this distinct from delivered notifications.')],
'Choose one name for saved targets. Clearly distinguish local goals from active server alerts and offer one direct add-product action.', mobile='watches-mobile.png')
page('alert','Price alert registration','Product','P1',[
('Structure','Preset discount targets are useful but the alert title, product panel and channel controls make a long form.'),
('Setup','Telegram instructions are split into short fragments and links below the username field.'),
('Outcome','Arm Price Drop Alert uses a different term from the profile tracker and saved goals.')],
'Use consistent Create price alert wording, explain channel setup in sequence and distinguish submission, active monitoring and delivery confirmation.', mobile='alert-mobile-demo.png',scope='Built-in ?modal=alert fixture. Form presentation reviewed; no alert or message was submitted.')
page('profile','Profile and product tracking','Account','P1',[
('Overload','Guest identity, four metrics, sign-in, a monitoring form and a how-it-works panel precede account settings.'),
('Vocabulary','Saved Loot, tracked scrapers, Radar and monitors describe related shopper tasks with different terms.'),
('State clarity','Guest view shows Email Live while the preferences section says email notifications require sign-in. Clarify configured versus active status.')],
'Separate account settings from price tracking. Show actionable guest guidance, plain-language targets and honest monitoring status.', 'profile-desktop.png','profile-mobile.png')
page('settings','Account preferences','Account','P2',[
('Placement','Theme and sound settings are far down the tracking-heavy profile page.'),
('State','Email notifications appear as an enabled toggle beside Requires email sign in; this needs an explicit inactive/needs-setup state.'),
('Consistency','Theme selection appears here and in the global header, with different presentations.')],
'Group account, notifications and appearance clearly. Reuse one appearance control and show prerequisites directly.', 'profile-settings-desktop.png')
page('about','About IndiaDealHunts','Information','P2',[
('Space','Breadcrumb, badge, headline and paragraph consume a large introductory area.'),
('Tiles','Multi-store, When available, On-device and 100% Free are displayed as four KPI-like tiles even though they are different kinds of facts.'),
('Copy','The paragraph claims genuine price drops while other screens carefully distinguish MRP comparisons from observed history.')],
'Use a concise product explanation, clear source limitations and concrete examples of how the product helps a shopper. Replace filler metric tiles with useful content.', 'about-desktop.png','about-mobile.png')
page('verification','How deals are verified','Information','P1',[
('Title','The title implies a verification process; the introduction describes evidence shoppers can assess.'),
('Reading','Numbered steps are each framed as large cards with extra system labels such as Link Layer and Price Audit.'),
('Mobile','Nested padding creates a long reading experience for short instructions.')],
'State what the service checks, what it does not check and what shoppers must confirm. Use a compact evidence guide with an actual example.', 'verify-desktop.png','verify-mobile.png')
page('verification-modal','Verification guide dialog','Information','P2',[
('Duplication','The same topic exists as a full page and a five-stage modal.'),
('Navigation','Stage pills, a process strip and footer actions compete with the actual explanation.'),
('Mobile','Source labels, available evidence, what to check and limits are broken into multiple panels.')],
'Use one canonical guide. If a quick explanation is needed, keep it genuinely short and link to the detailed guide.', mobile='verify-modal-mobile.png')
page('community','Wall of Happiness','Community','P2',[
('Empty state','The first capture showed ₹0, zero reports and zero names inside a large metrics panel. Treat these as observed state, not a permanent claim about community activity.'),
('Meaning','Not measured is useful honesty but should not occupy a KPI tile.'),
('Tone','Brag Your Deal Loot does not match the calmer directory language elsewhere.')],
'Lead with actual shopper stories when available. Otherwise use a concise invitation and explain reported versus independently verified outcomes.', 'community-desktop.png','community-mobile.png')
page('contact','Contact and support','Information','P2',[
('Strength','Visible labels, subject selection and a clear message field provide a sound basic form.'),
('Spacing','The shared header, ticker and introductory spacing delay the form on desktop; the narrow mobile form becomes a long page.'),
('Task','Expired deals, partnerships and feature suggestions have different information needs.')],
'Use task-based subjects with relevant helper text and consistent form spacing. Keep the submission outcome visible and explain where responses arrive.', 'contact-desktop.png','contact-mobile.png',scope='Form inspected without entering personal data or sending a message.')
page('submit','Submit a deal','Community','P2',[
('Effort','The form requests product URL, store, price, MRP, notes and email in one long step.'),
('Hierarchy','Store and both price fields have similar weight, while the source link should establish the item first.'),
('Mobile','The vertical form is long; later inputs and the submission action sit below the first screen.')],
'Start with the product link and progressively reveal useful optional fields. Preserve the statement that submission does not guarantee publication.', 'submit-desktop.png','submit-mobile.png',scope='Form presentation reviewed. No deal submitted.')
for key,title in [('privacy','Privacy policy'),('terms','Terms of service')]:
    page(key,title,'Information','P2',[
    ('Strength','A restrained reading surface with section headings is calmer than the rest of the app.'),
    ('Navigation','A centered modal is the only surface inspected; independent linking, printing and history behavior need checking.'),
    ('Consistency','The legal dialog uses another header/footer pattern rather than a shared reading layout.')],
    'Keep readable line lengths and headings. Provide stable links to policies and a consistent reading surface.', mobile=key+'-mobile.png',scope='Presentation review only; no legal adequacy assessment.')

tool_notes={
'gst':('GST input tax credit','Long title, preset prices, tax-rate controls and a highlighted economic-cost result create several levels of framing.','Shorten the title and group price, rate and confirmed eligibility before the result. Keep assumptions adjacent to outputs.'),
'bank_offers':('Bank offer comparison','Named card/voucher scenarios and a prominent recommendation appear under example assumptions.','Make user-entered eligibility and fees explicit. Separate example presets from the selected scenario and show why a result wins.'),
'emi':('EMI cost calculator','Price, tenure, card, down payment and fees compete with multiple result amounts.','Prioritize total repayment and extra cost, then explain installment and fee components in one breakdown.'),
'qcommerce':('Quick-commerce cart costs','A bright cart-filler result competes with the store comparisons and input controls.','Show current cart total, delivery/handling costs and the proposed change together, including extra spend.'),
'unit_price':('Unit-price comparison','A winner banner appears above several multi-field pack panels.','Align quantity, unit and price inputs and display one comparable unit beside each option.'),
'subs':('Subscription break-even','Five service presets and several perk assumptions create a large setup surface.','Start with one selected service and user-entered fees/usage; reveal optional benefits when needed.'),
'customs':('Import duty estimate','A large product-category preset catalog precedes the actual cost breakdown.','Start with purchase amount, shipping and editable rates. Label scenario estimates beside the result.'),
'returns':('Returns and open-box delivery','Store presets, deadline inputs, checklists and dispute assistance share one calculator-like screen.','Separate deadline tracking from delivery checklists. Label store policies as examples and make the selected task clear.'),
'exchange':('Phone exchange estimate','Device presets, condition deductions and recommendation badges imply a quote-like experience.','Make the hypothetical nature explicit and compare entered trade-in offers with transparent deductions.'),
'energy':('Appliance running costs','Appliance presets, purchase prices and usage controls are spread across several panels.','Compare total ownership cost first, then show energy assumptions and payback in one aligned view.'),
'warranty':('Warranty tracker','A large framed empty table offers demo items, export and add-product actions together.','Make Add product primary, show a useful example without inserting it into real records, and explain storage scope.'),
'budget':('Sale budget planner','Budget sliders, wishlist entry, category/priority chips and a regret-risk score compete.','Lead with planned spend versus remaining budget. Explain any heuristic separately from concrete arithmetic.')}
for key,(title,issue,fix) in tool_notes.items():
    page('tool-'+key,title,'Planning tools','P1' if key in ['gst','bank_offers','returns','customs'] else 'P2',[
    ('Tool-specific hierarchy',issue),
    ('Shared navigation','Search, category tabs, horizontal tool chips, a warning banner and an active-engine footer surround the tool.'),
    ('Mobile','Shared chrome and the long tool heading consume much of the viewport before useful results. Design for one primary calculation task at a time.')],
    fix+' Replace Engines, Sentinel and Shield terminology with shopper-facing task names.',
    'tools-desktop.png' if key=='gst' else 'tool-'+key+'-desktop.png',
    'tools-mobile.png' if key=='gst' else 'tool-'+key+'-mobile.png',
    scope='Opened live on desktop and mobile with default/example inputs. Visual structure reviewed; arithmetic, current rates, legal/tax rules and financial suitability were not validated. Some captures include entry-transition opacity; no contrast conclusion is drawn from those frames.')

css='''*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#101417;color:#eef2f1;font:15px/1.6 Segoe UI,Arial,sans-serif}main{max-width:1440px;margin:auto;padding:38px}h1{font-size:38px;line-height:1.15;letter-spacing:-1px;max-width:1000px}h2{font-size:26px;margin:0}h3{font-size:16px;margin:0 0 7px}p{color:#bfc9c9}a{color:#bbd9ee}nav{display:flex;gap:12px;flex-wrap:wrap;margin:22px 0}nav a,button{border:1px solid #475158;border-radius:7px;background:#1b242a;color:#edf2ef;padding:10px 14px;text-decoration:none;font:inherit}button{cursor:pointer}button[aria-pressed=true]{background:#e0bc79;color:#182026}.eyebrow,.meta{font-size:12px;color:#e0bc79;letter-spacing:1px}.scope{font-size:12px}.index{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:25px 0}.index a{padding:9px 0;border-bottom:1px solid #303a41;text-decoration:none}.review{border-top:1px solid #465058;padding:30px 0 38px;scroll-margin-top:12px}.review-head{display:flex;gap:15px;align-items:baseline;justify-content:space-between}.layout{display:grid;grid-template-columns:minmax(0,1.8fr) minmax(280px,1fr);gap:28px;margin-top:20px;align-items:start}.screens{position:relative}.image-wrap{position:relative}.image-wrap img{width:100%;display:block}.image-wrap.mobile{max-width:393px;margin:auto}.pin{position:absolute;width:25px;height:25px;display:grid;place-items:center;background:#ffe09a;color:#182026;border:2px solid #182026;border-radius:50%;font-weight:700}.find{border-bottom:1px solid #303a41;padding:12px 0}.find p{margin:4px 0;font-size:14px}.fix{border-left:3px solid #e0bc79;padding-left:15px;margin-top:20px}.fix strong{color:#e0bc79}.controls{display:flex;gap:8px;margin-bottom:12px}details{padding:16px 0}table{width:100%;border-collapse:collapse}td,th{text-align:left;border-bottom:1px solid #303a41;padding:12px;vertical-align:top}footer{padding:30px 0;color:#bac4c4}.top{font-size:13px}@media(max-width:850px){main{padding:20px}.layout,.index{grid-template-columns:1fr}h1{font-size:30px}.review-head{display:block}.layout{gap:15px}}'''
out=['<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>IndiaDealHunts — all-page teardown</title><style>'+css+'</style><main>',
'<div class="eyebrow">INDIADEALHUNTS / ALL-PAGE DESIGN TEARDOWN / 28 OCTOBER 2026</div><h1>A shared design problem, with different fixes for each task.</h1>',
'<p>Coverage: all 10 main tab views including the homepage, 12 planning tools, plus search, product details, comparison, lookup, saved targets, alerts, filters and legal surfaces. This is a visual and information-hierarchy audit, not a full functional certification.</p>',
'<p>Desktop captures: 1280 × 720. Mobile captures: 393 × 852. Known routes were mapped from App.tsx; real UI controls were used for search, saving and product details. Comparison and alert fixtures are explicitly marked. No messages, alerts, deals or purchases were submitted.</p>',
'<nav><a href="teardown.html">Original annotated homepage review</a><a href="#inventory">Page inventory</a><a href="#sequence">Implementation order</a><a href="mobile-measurements.json">Mobile width evidence</a></nav>',
'<h2 id="inventory">Page and surface inventory</h2><div class="index">']
for e in entries: out.append(f'<a href="#{e["key"]}">{escape(e["title"])} <small>· {e["priority"]}</small></a>')
out.append('</div><p>Markers 1–3 identify the header, primary content and supporting controls in each capture. Read the corresponding numbered observations. Some observations concern the full section, not a single pixel. Desktop/mobile toggles switch captured evidence only.</p>')
for e in entries:
    out.append(f'<section class="review" id="{e["key"]}"><div class="review-head"><h2>{escape(e["title"])}</h2><span class="meta">{e["priority"]} · {e["group"]}</span></div><div class="layout"><div class="screens">')
    available=[(mode,e[mode]) for mode in ['desktop','mobile'] if e[mode] and (ROOT/e[mode]).exists()]
    if len(available)>1:
        out.append('<div class="controls" role="group" aria-label="Screenshot viewport">')
        for i,(mode,file) in enumerate(available): out.append(f'<button type="button" data-view="{mode}" aria-pressed="{str(i==0).lower()}">{mode.title()}</button>')
        out.append('</div>')
    for i,(mode,file) in enumerate(available):
        out.append(f'<div class="image-wrap {mode}" data-screen="{mode}"'+(' hidden' if i else '')+f'><a href="{file}"><img loading="lazy" src="{file}" alt="{escape(e["title"])} — {mode} evidence"></a><span class="pin" style="left:7%;top:13%">1</span><span class="pin" style="left:45%;top:42%">2</span><span class="pin" style="left:78%;top:78%">3</span></div>')
    out.append('</div><div>')
    for i,(name,body) in enumerate(e['findings'],1): out.append(f'<div class="find"><h3>{i}. {escape(name)}</h3><p>{escape(body)}</p></div>')
    out.append(f'<div class="fix"><strong>Design change</strong><p>{escape(e["fix"])}</p></div><p class="scope">Evidence scope: {escape(e["scope"])}</p><a class="top" href="#inventory">Back to inventory ↑</a></div></div></section>')
out.append('''<section class="review" id="sequence"><h2>Implementation order</h2><table><thead><tr><th>Step</th><th>Work</th><th>Review checkpoint</th></tr></thead><tbody><tr><td>1</td><td>Shared navigation, naming, type, surface and control rules</td><td>One desktop and mobile shell; clear role for every accent and persistent control.</td></tr><tr><td>2</td><td>Discovery cards, search and product details</td><td>Real mixed images, long names, missing ratings, loaded history and empty states. Show products early.</td></tr><tr><td>3</td><td>Shortlists, comparison and alerts</td><td>A shopper can save, retrieve, compare and understand what is monitored. Mobile comparison is readable.</td></tr><tr><td>4</td><td>Tool hub and all 12 calculators</td><td>One tool selected at a time, inputs before interpretation, visible assumptions and useful results on mobile.</td></tr><tr><td>5</td><td>Account, community, support and information pages</td><td>Consistent reading/form layouts; honest loading, empty and configured-versus-active states.</td></tr></tbody></table></section><footer>Scope limits: reviewed live public dark-mode views and selected states, with source used to enumerate routes. Account authentication, delivery of notifications, form submissions, complete error paths, light mode, all calculator combinations and full accessibility compliance remain untested. Nine additional main mobile views measured scrollWidth 387px at a 393px viewport; this is not proof that every nested region fits. No storefront source or deployment changed.</footer></main><script>document.querySelectorAll('.controls button').forEach(button=>button.addEventListener('click',()=>{const section=button.closest('.screens');section.querySelectorAll('[data-screen]').forEach(view=>view.hidden=view.dataset.screen!==button.dataset.view);section.querySelectorAll('button').forEach(peer=>peer.setAttribute('aria-pressed',String(peer===button)));}));</script></html>''')
(ROOT/'all-pages.html').write_text('\n'.join(out),encoding='utf-8')
(ROOT/'all-pages-findings.json').write_text(json.dumps(entries,indent=2,ensure_ascii=False),encoding='utf-8')
print(f'{len(entries)} reviewed page/state/tool entries; report: {ROOT / "all-pages.html"}')
