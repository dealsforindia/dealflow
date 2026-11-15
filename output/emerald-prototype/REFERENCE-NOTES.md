# IndiaDealHunts — coded interface study

The existing application remains untouched. This standalone prototype tests whether a connected discovery workspace can carry the visual depth and interaction continuity the user selected.

## Evidence and adaptation

| Reference | Available evidence | Proposed adaptation |
|---|---|---|
| Velox / Arounda | User-supplied image; published search/comparison/connected-panel description. Embedded motion not inspected. | Grouped navigation and context-preserving inspection. |
| Explorely / Equal | Published catalogue-and-map presentation. Motion unverified. | Results remain behind the product or filter drawer. No unrelated map feature added. |
| Geovea / RonDesignLab | Published planning/dashboard description and palette. Motion unverified. | One workspace for related tasks, with contextual side content. |
| Kinetiq / Gliuk | Published tracking/data-visualisation description. Motion unverified. | Numerical hierarchy, reusable calculator result breakdowns. |
| TheTrail / RonDesignLab | Published visual-card/mobile-dashboard description. Motion unverified. | Phone cards and compact metadata; dedicated mobile navigation. |
| Travel Planner / Nixtio | Published spacious type and photography direction. Motion unverified. | Product-led imagery and readable composition on phones. |
| Aurevia / Gliuk | Previously inspected key screen images: pale surfaces, blue selected navigation and layered information panels. | Distinct surface levels, selectable theme and accent. |
| Cryon / Gliuk | Supplied screenshot and previously inspected cover: emerald-black surfaces, inset controls, green/yellow ribbon details, strong numerical hierarchy. | Dark materials, restrained glow, decorative ribbons and numerical emphasis. |
| Voltera / Gliuk | Previously inspected cover: primary workspace and compact contextual panels. | Compact rail, product workspace and shortlist side panel. |
| Jordan Hughes / Filters Slideout | Published description explicitly keeps data visible while applying filters. | Immediate filters in a native dialog drawer while preserving results. |

## Motion authored for this prototype, not measured from references

- Navigation indicator: 450 ms; interrupted selections retarget to the newest tab.
- Product hover: 400 ms card lift; 650 ms image movement.
- Context drawer: 480 ms horizontal entrance; native dialog Escape and focus restoration.
- Results: 550 ms entrance, 55 ms item stagger.
- Chart: 1300 ms stroke reveal on range selection. Explicitly illustrative, not price history.
- Search overlay: 350 ms entrance; Ctrl/Cmd K, Escape and click-outside dismissal.
- Ambient background: 14 s subtle drift. Decorative ribbon sheen every 7 s.
- OS reduced-motion and an in-app reduced-motion preference disable animation.

## Working local flows

Search + category/store/price/sort filters; saved items; three-product comparison; product inspection; local target-price goals; EMI, bank-offer, tax, unit-price and budget calculators; URL format inspection; theme/accent switches; mobile navigation.

## Explicit limits

Four real directory product snapshots, captured earlier in this chat. No live feed, sign-in, price monitoring, backend notifications, verified historical data or deployment. Local state resets on reload. Merchant buttons open labelled product searches, not invented purchase URLs. Browser access was disabled during implementation, so responsive CSS and motion still require visual browser validation.

## Run

`python -m http.server 5192 --bind 127.0.0.1 --directory output/emerald-prototype`

Open http://127.0.0.1:5192/ .

`node --test output/emerald-prototype/model.test.mjs`
