# Workspace Map — `html-yt`

Generated from disk (not from prior docs). Sizes exclude `node_modules/`, `.git/`, `dist/`, `__pycache__/`, `.venv/`.
Root: `E:\Rudranildocs0066543\html-yt`

**Totals:** 30 project directories · 9 nested git repos · parent repo tracks 137 files · ~800 MB of code/data beside that repo.

---

## 1. Production systems

### `telegram-system/` — 1,351 files · 207 MB
Telegram deal ingestion → curation → storefront. The revenue system.

| Sub-project | What it is | Entry point |
|---|---|---|
| `dealbot_backend/` | FastAPI + Telethon + workers. 100 modules in `dealbot/` | `dealbot/api.py`, `listener.py`, `worker.py`, `bot.py` |
| `tg-setup/` | Admin curation deck (React 18 + Vite + MUI). Own git repo, 176 tracked files | `src/app/App.tsx` |
| `rudranil-deals-web/` | Consumer storefront (React 19 + Vite). Own git repo | `src/App.tsx` |
| `dealflow-edge/` | Cloudflare edge worker | `src/index.ts` (9.7 KB) |
| `graphify-out/` | Generated graph output (~1.3 MB) | — |
| `SYSTEM_AUDIT_REPORT.md` | 50-issue forensic audit, Nov 7 | — |
| `TELEGRAM_UX_RESEARCH.md` | UX research doc | — |

**Status:** `dealbot_backend/` now has its **own git repo** (baseline commit `a0f6c66`, then the remediation commits). The parent repo still tracks nothing under `telegram-system/` because root `.gitignore` patterns `dealbot_backend/` and `dealbot/` are unanchored and match at any depth — the nested repo is the source of truth for the backend.

### Deal video rendering — `.github/workflows/viral_short_generator.yml`
The renderer is a **GitHub Action**, not a local project. `api.py:8189` dispatches
`event_type: generate_viral_short` to `https://api.github.com/repos/{owner}/{repo}/dispatches`,
and the workflow triggers on `repository_dispatch: types: [generate_viral_short]`
(`viral_short_generator.yml:43-44`) plus manual `workflow_dispatch` with deal inputs.
Runs on `ubuntu-latest` with ffmpeg, 1080x1920, 10-minute timeout.

**Verify:** backend defaults are `GITHUB_REPO_OWNER=dealsforindia`,
`GITHUB_REPO_NAME=dealflow` (`api.py:8173-8174`). If this workflow file is only in the
`html-yt` repo, dispatches go to a repo that does not contain it and no video is ever rendered.

### `dealflow-remotion/` — 90 files · 10 MB — **not** the deal pipeline
Remotion playground. Compositions are AI-character explainers
(`ClaudeCharacter`, `GeminiCharacter`, `GptCharacter`, `HindiEpisode`, `IsometricCity`,
`Hourglass`, `CartoonBackground`) — no reference to `api.rudranil.me`, `fp_hash`, or
MongoDB anywhere in `src/` or `scripts/`.

```
src/  scripts/  public/  agent/  .agents/  .claude/
```
**Status:** no git, untracked. `get_log.py` is its only top-level `.py`; there is no `render_deal_short.py`.

---

## 2. Projects with their own git repo

| Path | Files | MB | Last commit |
|---|---|---|---|
| `screenpipe_src/` | 5,743 | 297.2 | 2026-10-14 — upstream PR merge |
| `nis-graphics-frame/` | 135 | 17.0 | 2026-11-10 — active |
| `jev-ultrafast/` | 41 | 2.4 | 2026-09-16 |
| `fast-jev-compaction/` | 26 | 0.6 | 2026-09-17 |
| `tools/agent-desktop/` | — | — | own repo |
| `tools/graphify/` | — | — | own repo |
| `tools/superpowers/` | — | — | own repo |
| `_archive/experiments/rudranil-exe/` | — | — | own repo |
| `telegram-system/tg-setup/` | 176 tracked | — | see sub-project |
| `telegram-system/rudranil-deals-web/` | — | — | see sub-project |

`screenpipe_src/` is **vendored third-party code** — do not edit, do not include in your own history.
`tools/` (89.8 MB / 5,128 files) is a container of three cloned repos, not a project.

---

## 3. Projects without version control

| Path | Files | MB | What it is |
|---|---|---|---|
| `nilotpal-portfolio-next/` | 94 | 57.6 | Portfolio build (node) |
| `brag-source/` | 343 | 44.5 | `brag-main/` source bundle |
| `scratch/` | 626 | 24.6 | Working files: browser checks, career, igloo, storefront-graph-deploy, visitor-metrics |
| `zero-university-2026/` | 47 | 9.8 | Static site (`app.js`, `index.html`, `vendor/`) |
| `brag-output/` | 32 | 9.6 | `brag-plan.md` + generated output |
| `nilotpal-saha-portfolio/` | 20 | 8.0 | Static portfolio (`index.html`) |
| `aarav-singh-portfolio/` | 19 | 7.8 | Static portfolio (`index.html`) |
| `design-concepts/` | 28 | 4.0 | 14 PNG mockups (concept-01..07 desktop/mobile) |
| `dealflow/` | 61 | 1.3 | Docs/scripts module — **duplicate, see §6** |
| `india-estate/` | 114 | 0.7 | React + Vite property project |
| `commerce_engine_v2/` | 34 | 0.2 | Python package + tests |
| `ludo-2026/` | 3 | ~0 | `css/` only — incomplete |
| `ai-smart-mirror/` | 4 | ~0 | Static demo: `index.html`, `app.js`, `style.css` |
| `strix_runs/` | 11 | ~0 | Security scan artifacts: `audit-2026-10-07/`, `verification-2026-10-07/` |
| `scripts/` | 10 | 0.4 | Loose utilities + sample assets |

---

## 4. Archives and bulk (not projects)

| Path | Files | MB | Contents |
|---|---|---|---|
| `_archive/college/` | 25 | 140.7 | Archived study material |
| `_archive/learning/` | 54 | 89.1 | Archived learning material |
| `_archive/skills/` | 288 | 15.8 | Archived skill packs |
| `_archive/experiments/` | 16 | 2.6 | Experiment snapshots (has own repo) |
| `.agent/` | 7,207 | 37.2 | Agent framework kit (`skills/`, `agents/`, `workflows/`, `rules/`) |
| `output/` | 217 | 17.5 | Generated design artifacts: `card-motion/`, `character-repair/`, `emerald-prototype/`, `material-refinement/`, `pdf/`, `pixel-companion/`, `rejected-redesign-backup/` |

---

## 5. Root-level files

**Deploy path (the only one):**
```
upload_to_vm.py     run_on_vm.py     download_from_vm.py
```
Auth is SSH key based; target `rudranil777@74.225.250.0`. No credentials found in them.

**Standalone HTML demos (10):** `LOL.html`, `LOL-studio.html`, `drone_viewer.html`, `v2_drone_viewer.html`, `train_viewer.html`, `nature-aquarium.html`, `igloo-webgl.html`, `wdg4g-lhb-simulation.html`, `dealflow-system-architecture.html`, `how-a-deal-works.html`

**3D assets:** `drone_model.glb/.obj`, `cyber_drone_v2.glb/.obj`, `train_locomotive.glb`

**Docs (29 `.md`):** `AGENTS.md`, `GEMINI.md`, `GEMINI.new.md`, `BUGS_AUDIT_REPORT.md`, `CRITICAL_DROPPED_CONTENT_AUDIT.md`, `DEALFLOW_*` (9), `AI_Smart_Mirror_*` (4), `NILOTPAL_PORTFOLIO_PLAN.md`, `NIS_GRAPHICS_VISION.md`, `RESUME_DRAFT.md`, `Rudranil_Saha_Resume.md`, `SECURITY-ROTATION-RUNBOOK.md`, `HEALTH_SCAN_REPORT.md`, `WORKSPACE_HYGIENE_AUDIT_2026-11-02.md`, `TELEGRAM_SYSTEM_2000_IDEAS.md`, `FUTURE_VISION_TELEGRAM_AND_EXPERIENCE.md`, `HYPER_EDIT_MAKER.md`, `IGLOO_INC_CASE_STUDY.md`, `INDIADEALHUNTS_INITIAL_REVIEW_2026-10-27.md`

**Agent/tooling config:** `.mcp.json`, `opencode.json`, `AGENTS.md`, `.claude/`, `.codex/`, `.agents/`, `.impeccable/`, `.planning/`, `.github/`, `.vscode/`, `.kilo/`, `.freebuff/`, `.opencode/`, `.antigravityignore`, `skills-lock.json`, `html-yt-clean.code-workspace`

**Junk / broken:**
| Item | Problem |
|---|---|
| `pending.json` (3.09 MB) | Not JSON — starts with `HTTP/1.1 200 OK`. A saved HTTP response |
| `rmdir` (0 B) | File named after a failed shell command |
| `error.md` | Ad-hoc error log |
| `security-audit-run-2026-11-04/` | Empty directory |
| `agent/` | Empty directory |
| `start_mindflow.bat` | Launches `mindflow/`, which is deleted |

---

## 6. Duplicates

| Same thing, two places | Divergence |
|---|---|
| `dealflow/` (61 files) vs `telegram-system/tg-setup/dealflow/` (74 files) | Already diverged — 13 files difference |
| `dealflow-edge/` (deleted at root) vs `telegram-system/dealflow-edge/` (live) | Only the root copy had `src/index.ts` history |
| `nilotpal-portfolio-next/` vs `nilotpal-saha-portfolio/` vs `aarav-singh-portfolio/` | Three portfolio builds |
| `brag-source/` vs `brag-output/` | Source vs generated |

---

## 7. Git state (parent repo)

```
tracked:            137 files
untracked:           89 entries
deleted in worktree: 78 files
modified:             9 files
```

Six items of root scratch (3.2 MB saved HTTP response `pending.json`, a 0-byte
`rmdir`, a dead `start_mindflow.bat`, a superseded `error.md` audit, and two empty
directories) were moved to `_archive/quarantine-2026-11-14/` rather than deleted.
That folder has its own `.gitignore` (`*`), so it never shows up in `git status`.
See the README inside it to restore anything.

**The 78 deletions are five whole projects**, all still in history:

| Deleted path | Last commit |
|---|---|
| `mindflow/` (52 files) | `b6d6aaf` fix(mindflow): resolve 5 production audit bugs… Push-to-Talk Mobile PWA |
| `devintel/` (24 files) | `f390557` feat: Add DevIntel AI-Native Development Intelligence Platform |
| `dealflow-edge/` (5 files) | `e457be5` docs & edge: record Section 79 Category Stories… |
| `README.md` | — |

Restore with:
```powershell
git restore --source=HEAD -- mindflow devintel dealflow-edge README.md
```

**Ignore-pattern bug:** `.gitignore` lines `dealbot_backend/` and `dealbot/` lack a leading `/`, so they suppress those directory names at any depth — including `telegram-system/dealbot_backend/`. That is why the backend has never been committed.

---

## 8. Load-bearing vs disposable

**Keep (system-relevant):** `telegram-system/` · `.github/workflows/viral_short_generator.yml` · `dealflow/scripts/` · `upload_to_vm.py`/`run_on_vm.py`/`download_from_vm.py` · `SECURITY-ROTATION-RUNBOOK.md` · `AGENTS.md` · `GEMINI.md` · `opencode.json` · `.mcp.json`

**Independent, give each its own repo:** `india-estate/` · `commerce_engine_v2/` · `jev-ultrafast/` · `fast-jev-compaction/` · `zero-university-2026/` · the portfolio builds

**Archive offline:** `_archive/` (248 MB) · `screenpipe_src/` (297 MB) · `.agent/` (37 MB) · `output/` · `scratch/` · `brag-source/` + `brag-output/`

**Delete:** `pending.json` · `rmdir` · `error.md` · empty dirs · `start_mindflow.bat`

---

## 9. Known drift to fix (docs vs disk)

| Document | Claims | Reality |
|---|---|---|
| `telegram-system/SYSTEM_AUDIT_REPORT.md` | physics modules "purged" | `worker.py:2631-2674` still executes them |
| Pasted module inventory (7 files) | `bot.py` monitors channels; `oos_expiry_worker.py` scans every 5 min | Channel ingest is `listener.py:294`; `oos_expiry_worker.py` is imported nowhere; real loop is `worker.py:1522` |
| Same inventory, section 2 | `mindflow/`, `devintel/`, `render_deal_short.py` exist | All absent from this checkout |
