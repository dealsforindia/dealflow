# Workspace Hygiene Audit — html-yt

**Date:** 2026-11-02
**Scope:** Whole workspace (`E:\Rudranildocs0066543\html-yt`)
**Method:** Read-only inspection — git state, ignore rules, secret patterns, disk composition, sub-repo status. No files modified, no commits, no history rewritten.

---

## 1. Top-line numbers

| Metric | Value |
|---|---|
| Tracked files (root repo) | 137 |
| Working-tree files (whole workspace) | ~240,000 |
| `.git` size | **692 MB** (682 MB loose objects, 6.6 MB packed) |
| Uncommitted changes | 6 modified, 25 deleted, 77 untracked |
| Files `git add -A` would stage | **2,809 files / 338 MB** |
| Branches merged into `main` | 0 of 3 remote feature branches |
| Projects with **no** version control | 5 |

---

## 2. Critical findings

### 🔴 C1 — Live-looking credentials persist in git objects
Historical blobs still readable from the object database:

- `dealbot_backend/dealbot/.env`
- `dealbot_backend/dealbot/.env.bak`
- `dealbot_backend/dealbot/.env.vm`
- `core_dealbot_extracted/.env`

Keys present (names only, values not printed): `TG_API_ID`, `TG_API_HASH`, `TG_BOT_TOKEN`, `LISTENER_SESSION_STRING`, `GEMINI_KEYS`, `GROQ_KEYS`, `OPENROUTER_API_KEY`, `MISTRAL_API_KEY`, `CEREBRAS_API_KEY`, `SAMBANOVA_API_KEY`, `COHERE_API_KEY`, `TOGETHER_API_KEY`, `EARNKARO_TOKEN`, `MONGODB_URI`, `REDIS_URL`, `AMAZON_AFFILIATE_TAG`.

**31 of 34 keys still have identical values** to the current on-disk `dealbot_backend/dealbot/.env` → these are not stale test values.

Reachability: **not** in `origin/main`, `My-Js/main`, or `origin/storefront-web` history. They are held alive by 64 `refs/cline/checkpoints/*` refs plus dangling commits (`8858c92 Initial commit`). So likely never pushed — but one accidental `git push --mirror` or a fork upload leaks them.

**Action:** rotate every one of those keys, then purge refs (see §4). Rotation first — history cleanup without rotation is theatre.

### 🔴 C2 — `git add -A` would bloat the repo by 338 MB
2,809 untracked files are not covered by `.gitignore`, including:

- `.agents/` — 790 files, 56 MB
- `scratch/` — 397 files, 38 MB
- `_archive/` — 385 files, 250 MB (incl. ~150 MB of large JPEGs)
- `brag-source/` — 332 files, 45 MB
- `output/` — 209 files, 17 MB
- `dealflow-remotion/` — 156 files (node_modules correctly ignored)
- Three identical copies of `impeccable.exe` (19.5 MB each) under `.agents`, `.claude`, `.github`

Plus 15+ individual media files over 5 MB (`_archive/college/nis/images/*`, a 8.4 MB ZIP).

### 🔴 C3 — Local repo has unrelated history to every remote
`git merge-base main origin/main` returns **nothing**. Same for `My-Js/main` and `origin/storefront-web`.

- Local `main`: 26 commits, never pushed anywhere.
- `origin/main`: 198 commits not present locally.

This is not "behind by N" — it is two separate histories sharing a remote. A plain `git push origin main` will be rejected; a force-push would delete 198 upstream commits.

### 🔴 C4 — `dealbot_backend/` is entirely untracked and ignored
`.gitignore` line 8 ignores `dealbot_backend/` wholesale. It contains 328 files / 8.8 MB of backend code with **zero version history** in this repo. Same for `india-estate` (63k files), `mindflow`, `zero-university-2026`, `nilotpal-portfolio-next` (17.7k files) — none are git repos and none are ignored. Only `tg-setup`, `rudranil-deals-web`, `fast-jev-compaction`, `jev-ultrafast`, `screenpipe_src` are real repos.

One disk failure or bad `rm` and the backend, storefront app, and two portfolios are gone.

---

## 3. Medium findings

| # | Finding | Detail |
|---|---|---|
| M1 | 25 tracked files deleted, uncommitted | Entire `devintel/` project (2,174 lines, 22 files) + `README.md`. No remaining references in tracked code. Confirm intentional, else `git restore devintel README.md`. |
| M2 | `.git` bloat | 682 MB loose vs 6.6 MB packed. 64 cline checkpoints + kilo/codex refs pin old full-tree snapshots. `git gc` will not reclaim until those refs are dropped. |
| M3 | `.gitignore` gaps | Not ignored: `*.exe`, `*.zip`, `*.db`, `*.sqlite`, `*.pem`, `*.key`, `coverage/`, `.agents/`, `.claude/`, `.codex/`, `.planning/`, `.impeccable/`, `strix_runs/`, `output/`, `scratch/`, `_archive/`. Covered correctly: `node_modules`, `dist/`, `.env*`, `*.log`, `*.mp4`, `*.session`. |
| M4 | Uncommitted sub-repo work | `tg-setup`: 100 changes. `rudranil-deals-web`: 54 changes. Both on `main`. |
| M5 | No `.gitattributes`, `core.autocrlf=true` | Every diff of a LF-authored file emits CRLF warnings (`BUGS_AUDIT_REPORT.md`, `dealflow-edge/src/index.ts`). |
| M6 | 3 unmerged remote branches | `copilot/dealflow-explanation`, `fix/react-fragment-crash`, `storefront-web` — none are ancestors of `main`. |
| M7 | Agent configs untracked | `AGENTS.md` (loaded by the harness), `.agents/` (1,582 files), `.claude/`, `.planning/`, `.github/agents|hooks|skills`, `.vscode/settings.json` all untracked. Also 3 duplicate impeccable skill trees. Need an explicit track-or-ignore decision. |
| M8 | Docs sprawl | 19 root `.md` files (0.68 MB) with overlapping audit logs: `BUGS_AUDIT_REPORT.md`, `GEMINI.md` changelog, `DEALFLOW_COMPLETE_HISTORICAL_AUDIT_AND_CODE_CHANGELOG.md`, plus 6 `DEALFLOW_*` encyclopedias. Consolidation candidate. |

---

## 4. Suggested remediation (not executed)

```powershell
# 1. Secrets: rotate first, then drop the refs that keep the blobs alive
git update-ref -d refs/stash
git for-each-ref --format='%(refname)' refs/cline refs/kilo refs/codex | ForEach-Object { git update-ref -d $_ }
git reflog expire --expire=now --all
git gc --prune=now --aggressive     # expect ~650 MB reclaimed

# 2. Stop futures leaks: extend .gitignore before any commit
'   *.exe', '*.zip', '*.db', '*.sqlite', '*.pem', '*.key', 'coverage/', '.agents/', '.claude/', '.codex/', '.planning/', '.impeccable/', 'strix_runs/', 'output/', 'scratch/', '_archive/' | Add-Content .gitignore

# 3. Decide on devintel deletion
git restore devintel README.md      # restore
# or
git rm -r --cached devintel README.md   # accept deletion

# 4. Give unversioned projects real repos (do NOT add them to this one)
foreach ($p in 'dealbot_backend','mindflow','india-estate','zero-university-2026','nilotpal-portfolio-next') { git -C $p init }

# 5. Normalise line endings
"* text=auto eol=lf" | Set-Content .gitattributes
```

Remote strategy needs a human decision: push the 26 local commits to a **new** branch (e.g. `git push My-Js main:workspace-main`), never force-push `origin/main`.

---

## 5. What is healthy

- No secrets in currently **tracked** files (regex sweep across all 137 tracked files found only JS variable names like `relationshipTokenGeometry`).
- No tracked `.env` / `.pem` / `.key` / credential files.
- `node_modules`, `dist/`, `.env*`, `*.log`, `*.mp4`, `*.session` are correctly ignored.
- `fast-jev-compaction`, `jev-ultrafast`, `screenpipe_src` sub-repos are clean.
- Largest tracked file is 0.8 MB (`dealflow/docs/dealflow-architecture.html`) — repo content itself is lean.
- Working-tree activity is coherent: the 6 modifications are audit-log updates + an edge-cache route and CI auth fix.

---

## 6. Next stages (pick any)

1. **Bug audit** — `dealflow-edge/src`, `dealbot_backend`, `rudranil-deals-web`, `mindflow`, `tg-setup`.
2. **Security audit** — staged/coded workflow (`security-audit` skill) over dealflow stack.
3. **Build/run health** — install + typecheck + build + tests for the 8 JS/Python projects.
4. **Frontend/design audit** — storefront + portfolio UI critique (`impeccable`).
5. **Apply Stage-1 fixes** — execute §4 after you confirm intent.
