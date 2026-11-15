# Nilotpal Saha — Portfolio v3

Plan written 6 Nov 2026. No code until approved.

## 1. Goal

One page that looks designed rather than generated, shows real work at real
proportions, and converts a visiting client into an email. Beauty first — but
beauty built on real content, because a grid of invented projects cannot look
good no matter how it is styled.

## 2. Why a new build

| Existing | Verdict |
| --- | --- |
| `nilotpal-saha-portfolio/` (static) | Right skeleton, AI-portfolio skin. Fake mastery percentages, fake scope calculator, fake testimonials, fake FPS telemetry. |
| `nilotpal-portfolio-next/` (Next.js) | Better type, but 13 of 16 projects are fictional, 4 cards reuse one screenshot, most video posters render as blank gradients. 11,250px tall. |

Neither is worth polishing. Both are archived once v3 ships.

## 3. Source of truth

| Fact | Source |
| --- | --- |
| Name, title, contact, address | `assets/nilotpal_resume.pdf` |
| Five roles, 2019–present | resume |
| Education (3D diploma, CU graduation) | resume |
| Software list | resume |
| 50 stills, 19 videos | Drive folder `1hdfEVgvwOKkYJGhdHjabrn6sF3IdND27` |
| Own studio mark `N!S Graphics` | watermarks in Drive stills |

**Title: "Senior Graphic Designer" — not "Art Director".** Every role on the
resume says Senior Graphic Designer. The old sites inflated it.

## 4. Honesty rules (hard)

1. No percentage bars, no "Mastery Matrix".
2. No scope/turnaround calculator.
3. No invented testimonials. If we have none, the section does not exist.
4. No invented agencies. Only: Image Clinic, Pixel Solutionz, Hykez, Arena Animation, Yogines Studioo, N!S Graphics, and client names he clears.
5. "37% traffic increase" appears **once**, attributed to Yogines Studioo 2019–20.
6. 3D Animation is a **credential line** (Arena diploma 2019–21), not a portfolio section, until real renders exist.
7. No spec-sheet cosplay ("ProRes 422 HQ", "KODAK 2383").

## 5. Visual system

**Concept — "Press Proof".** The page is a print studio's proof sheet: cream
stock, ink, one gold, crop marks, job numbers. His work supplies all the colour.

```
paper      #F4EFE4
ink        #14110D
gold       #C08A2E
vermilion  #B03A2E   (accent only, <2% of surface)
rule       #D8CFBC
```

| Role | Face | Use |
| --- | --- | --- |
| Display | Linotype Didot Pro (Roman + Bold) | Name, section heads. Large sizes only. |
| Text | Instrument Sans | Body, labels, nav |
| Mono | JetBrains Mono | Job numbers, years, specs |

Grid: 12 columns, 24px gutter, 1280px max, 32px page margin.
Type scale: 12 / 14 / 17 / 22 / 34 / 56 / 88.
Motion: 180–400ms, ease-out. Nothing bounces. No parallax on text.

**The one idea:** his work is 1:1 squares and wide banners, not 16:9. The wall
renders each piece at its **true aspect ratio** on a registration grid. No
uniform cards. This is what will make it look unlike a template.

## 6. Page structure

| # | Section | Content | Height |
| --- | --- | --- | --- |
| 1 | Masthead | Name, role, Kolkata, since 2019, one sentence | ~60vh |
| 2 | Work wall | 50 stills, true ratios, filter by type | ~2400px |
| 3 | Case studies ×3 | Gill Travels · Image Clinic · EtuTor | ~1200px |
| 4 | Motion | 6–8 reels, one large player + clip list | ~800px |
| 5 | Craft | Photo composites, vector tiger, logo marks | ~700px |
| 6 | Experience | 5 roles + education, as a table not a timeline | ~700px |
| 7 | Contact | Poster-style contact bar as footer | ~400px |

Target total: ~4,000px. Desktop and 390px both first-class.

## 7. Copy — first draft of the masthead

> **Nilotpal Saha**
> Senior Graphic Designer · Kolkata
>
> Six years of commercial design — travel campaigns, healthcare, education,
> retail. Posters, print, social and video, from brief to press file.
>
> [ See the work ]   [ Download CV ]

No "passionate", no "crafting", no "elevate", no "journey".

## 8. Phases

| Phase | Deliverable | Needs |
| --- | --- | --- |
| 0 | Decisions + assets | answers below, full-res files |
| 1 | **Static homepage** — one file, real images, real copy, viewable in browser | assets |
| 2 | Visual refinement, 2 rounds | feedback |
| 3 | Full build + 390px pass | — |
| 4 | Motion section, video posters | video files |
| 5 | Perf, a11y, SEO, deploy | domain |

Phase 1 is the checkpoint. Nothing else is built until the homepage looks right.

## 9. Blocking questions

1. **Direction** — Fare Card / Cutting Mat / One Sheet (recommend Fare Card).
2. **Full-res assets** — I only have 900px thumbnails. Need originals, plus any 2026 Image Clinic work.
3. **Client names** — can we name Gill Travels, Image Clinic, EtuTor, DesignLogo, NIS Graphics?
4. **3D / interior work** — does any exist? Both are on the resume, neither is in the folder.
5. **Stack** — Next.js as stated, or ship the static version first and port later?
6. **Domain** — nilotpalsaha.com? Existing? Deploy target Vercel or Cloudflare Pages?

## 10. Risks

- **Image resolution.** 900px squares upscale badly. Blocks Phase 1 quality.
- **No 2026 work.** Folder's newest files are 2025; Image Clinic is current employer.
- **Phone-first.** Most traffic will arrive from Instagram at 390px.
- **Scope creep.** Six interactive sandboxes is how the last two builds died.
