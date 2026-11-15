# DealFlow / IndiaDealHunts — Security Rotation Runbook

Generated 2026-11-04. Run the steps **in order**. Steps 1–2 are urgent: both secrets
below are currently readable by anyone on the public internet.

> **Assume the old admin token and the old Mongo password are already harvested.**
> Deleting them from git is cleanup, not protection. Rotation is the protection.

> **Shell:** commands below are written for PowerShell. If you are in `cmd.exe`,
> use `"double quotes"` around remote commands, keep them on one line (no `` ` ``),
> and swap `$env:TEMP` for `%TEMP%`, `Get-Content` for `type`, `Select-String` for
> `findstr`.

---

## 0. What is already fixed in code (done, nothing for you to write)

| Area | File | Fix |
|---|---|---|
| Admin token in browser bundle | `tg-setup/src/app/utils/adminAuth.ts`, `App.tsx` | Removed hardcoded fallback and `VITE_ADMIN_TOKEN`. Token now comes only from `localStorage` after login. |
| Admin token sent as custom header | same files | Client now sends `Authorization: Bearer` only, so the edge CORS allowlist can stay tight. |
| Mongo URI hardcoded | `dealflow/scripts/{find_loot,sanitize_deals_db,update_channels}.py` (both copies) + backend `clean_db.py`, `migrate.py`, `update_fastrack_deal.py` | Env-only, fails closed with a clear error. |
| SSRF / open proxy | `dealbot_backend/dealbot/api.py`, `mobile_app_rpc_client.py` | `/engineering/*` is admin-only; URL guard fails closed on DNS failure; mobile RPC client refuses unsafe URLs. |
| PII leaks | `api.py` | `/alerts` requires the owner session or admin; `DELETE` and `/check` verify ownership; bounties never return `contact`. |
| Spam / abuse | `api.py` | Redis-backed rate limits (in-memory fallback) on alerts, feedback, bounties, auth codes, manual checks. |
| Feedback injection | `api.py` | Fields truncated, HTML-escaped, Telegram `parse_mode` switched to HTML. |
| Google sign-in audience | `api.py` | Validates `iss` + `aud` against `GOOGLE_CLIENT_ID`; fails closed (503) when unset. |
| Channel leaks | `api.py` | Public deals always null `channel`/`channelRaw`; admin-only endpoints require auth; anonymous pending/recent strips channel fields. |
| CORS wildcard | `dealflow-edge/src/index.ts` | Explicit origin allowlist (`ALLOWED_ORIGINS`), `Vary: Origin`, per-origin cache keys. |
| Iconscout secret in client env | `tg-setup/.env` | Removed `VITE_ICONSCOUT_SECRET_KEY`. |
| Rebuilt admin deck | `tg-setup/static/` | New bundle `index-yO3J6mDo.js` / `index-BP7ZC3yY.css`, verified to contain no token and no `X-Admin-Token`. |

Not fixed by design: `GOOGLE_CLIENT_ID` is empty, so `/api/v1/auth/google` returns 503
until you configure it. Nothing in the storefront calls that endpoint today, so this
is safe to leave until you actually add Google sign-in.

---

## 1. Rotate the credentials

### 1.1 New admin API token

```powershell
python -c "import secrets; print('df_adm_' + secrets.token_hex(24))"
```

Copy the output. It is your new `ADMIN_API_TOKEN`. You will paste it in three places:
the two `.env` files (step 2), the VM `.env` (step 3), and GitHub Actions secrets (1.4).

### 1.2 MongoDB Atlas password

1. Open <https://cloud.mongodb.com> → your project → **Database Access**.
2. User `dealbot` → **Edit** → **Edit Password** → **Autogenerate Password** → **Update User**.
3. Copy the password somewhere safe. If it contains `@ : / ? # [ ] %`, URL-encode it
   before putting it in `MONGODB_URI`.
4. Wait ~1 minute for the change to propagate, then confirm the API still connects
   (step 7, check #1).

### 1.3 Gmail app password (SMTP)

1. Open <https://myaccount.google.com/apppasswords> (requires 2-Step Verification).
2. Create a new app password named `DealFlow SMTP`, copy the 16-character value.
3. After updating `.env` (step 2), delete the old app password in the same screen.

### 1.4 GitHub Actions secret

The workflow `.github/workflows/viral_short_generator.yml` reads
`secrets.ADMIN_API_TOKEN || secrets.ADMIN_TOKEN`.

In `github.com/dealsforindia/dealflow` → **Settings → Secrets and variables → Actions**,
update `ADMIN_API_TOKEN` to the new token (and `ADMIN_TOKEN` if it exists).

### 1.5 Optional: Iconscout secret

The old `VITE_ICONSCOUT_SECRET_KEY` was never committed and never made it into a
bundle (verified). Rotate it at the Iconscout dashboard only if you want to be thorough.

---

## 2. Update the local `.env` files

Edit both:

- `telegram-system/dealbot_backend/dealbot/.env`
- `telegram-system/dealbot_backend/dealbot/.env.vm`

Change:

```dotenv
ADMIN_API_TOKEN=<new token from 1.1>
MONGODB_URI=mongodb+srv://dealbot:<new-atlas-password>@dealbot-cluster.m9o3kr8.mongodb.net/dealbot?appName=dealbot-cluster
SMTP_PASS=<new 16-char Gmail app password from 1.3>
```

Leave `ADMIN_EMAILS=rudranildocs0066543@gmail.com` as-is. Leave `GOOGLE_CLIENT_ID=`
empty unless you are enabling Google sign-in.

Sanity check (prints only key names, never values):

```powershell
Get-Content telegram-system\dealbot_backend\dealbot\.env |
  Where-Object { $_ -match '^(ADMIN_API_TOKEN|MONGODB_URI|SMTP_PASS)=' } |
  ForEach-Object { ($_ -split '=',2)[0] + '=<set>' }
```

---

## 3. Deploy the backend to the VM

The backend is not in git (`.gitignore` excludes `dealbot_backend/`), so copy the
changed files directly to `rudranil777@74.225.250.0:/home/rudranil777/dealbot/`.

```powershell
cd E:\Rudranildocs0066543\html-yt

scp telegram-system\dealbot_backend\dealbot\api.py telegram-system\dealbot_backend\dealbot\mobile_app_rpc_client.py telegram-system\dealbot_backend\dealbot\clean_db.py telegram-system\dealbot_backend\dealbot\migrate.py telegram-system\dealbot_backend\dealbot\update_fastrack_deal.py rudranil777@74.225.250.0:~/dealbot/
```

**Before overwriting `.env`, compare key names** (never values). On the VM:

```bash
cd ~/dealbot && grep -o '^[A-Za-z_][A-Za-z0-9_]*=' .env.bak.20261104 | sort -u
```

Every key in that list must also exist in the local `.env.vm`. If the VM has a key
the local file lacks, add it to `.env.vm` first — otherwise the overwrite silently
deletes that setting.

Only then:

```powershell
scp telegram-system\dealbot_backend\dealbot\.env.vm rudranil777@74.225.250.0:~/dealbot/.env
```

Then on the VM. **This stack runs under PM2, not systemd** (`api`=7, `bot`=0,
`desidime`=10, plus `listener`, `worker`). PM2 must be restarted as the owning
user — no `sudo`:

```bash
cd ~/dealbot
python3 -m py_compile api.py mobile_app_rpc_client.py
pm2 restart all --update-env
sleep 6
pm2 list
pm2 logs api --lines 40 --nostream
```

`--update-env` makes PM2 pick up the new `.env` values. Confirm all **seven** are
`online` and `api` shows a fresh restart count:

`api` (7), `bot` (0), `desidime` (10), `listener` (2), `worker` (3),
`price-scanner` (18), `amazon-harvester` (19).

Do **not** use `start_bots.sh` / `systemctl` unless `pm2 list` is empty — that
script installs a systemd unit and would fight PM2 for port 8000.

### Topology (verified 2026-11-04)

`https://api.rudranil.me` answers with `Server: nginx/1.24.0`. nginx terminates TLS
and proxies to uvicorn on the VM, so uvicorn's TCP peer is `127.0.0.1`. The rate
limiter therefore trusts `CF-Connecting-IP`, then the left-most `X-Forwarded-For`
hop, then `X-Real-IP`. Verify the bind address before assuming it:

```bash
ss -ltnp | grep 8000
grep -r "proxy_pass" /etc/nginx/sites-enabled/
```

If uvicorn listens on `0.0.0.0:8000` and port 8000 is reachable from the internet,
firewall it to nginx only (`ufw deny 8000`) — otherwise a direct client can send a
fake `X-Forwarded-For` and dodge per-IP limits.

**Important:** the VM must also have `redis` installed for the rate limiter to work
across workers (`pip install redis`). Without it the code falls back to per-process
in-memory limits, which still work but are weaker. Confirm with
`python3 -c "import redis; print('redis ok')"`.

---

## 4. Deploy the rebuilt admin deck

The new bundle is already built into `telegram-system/tg-setup/static/`.

```powershell
scp -r telegram-system\tg-setup\static\* rudranil777@74.225.250.0:~/dealbot/static/
```

Then confirm the served HTML points at the new assets:

```bash
curl -s https://api.rudranil.me/ | grep assets/
# expect: /assets/index-yO3J6mDo.js  and  /assets/index-BP7ZC3yY.css
```

Hard-refresh the deck in your browser (Ctrl+Shift+R) so the old bundle is not cached.

> If `~/dealbot` on the VM is a git checkout of `dealsforindia/dealflow`, you can
> instead run `git pull` there after step 5 — but still verify the asset filenames.

---

## 4b. Deploy the edge worker (CORS fix)

The live worker still answers `Access-Control-Allow-Origin: *` (verified 2026-11-04),
so this step is **required**, not optional.

```powershell
cd telegram-system\dealflow-edge
npx wrangler deploy
```

Verify (from any shell):

```bash
curl -s -i -X OPTIONS https://dealflow-edge.pottemasshippo.workers.dev/api/v1/deals/public \
  -H "Origin: https://evil.example" -H "Access-Control-Request-Method: GET" | grep -i "access-control-allow-origin"
# expect: no output

curl -s -i -X OPTIONS https://dealflow-edge.pottemasshippo.workers.dev/api/v1/deals/public \
  -H "Origin: https://indiadealhunts.me" -H "Access-Control-Request-Method: GET" | grep -i "access-control-allow-origin"
# expect: Access-Control-Allow-Origin: https://indiadealhunts.me
```

If the storefront breaks with CORS errors, roll back with `npx wrangler rollback`.
If `wrangler` is not logged in, skip this step and tell me — do not deploy a partial
allowlist.

---

## 5. Commit and push the public repos

### 5.1 Admin deck / scripts repo (`dealsforindia/dealflow`)

```powershell
cd telegram-system\tg-setup

git add -A src/app dealflow/scripts static
git status --short          # review: 6 modified, 2 deleted, 2 new assets
git commit -m "fix(security): remove hardcoded admin token and Mongo URI"
git push origin main
```

### 5.2 Storefront (`dealsforindia/indiadealhunts`)

Only `ProfilePage.tsx` is staged — the rest of your design work stays uncommitted.

```powershell
cd ..\rudranil-deals-web

git add src/components/ProfilePage.tsx
git commit -m "fix(alerts): send session auth on manual price check"
git push origin main
```

Vercel will redeploy the storefront automatically.

### 5.3 Root workspace repo — **do not push**

`E:\Rudranildocs0066543\html-yt` is a stale clone of the same public repo:
local `main` is 26 ahead / 202 behind, with a completely different directory layout.
Its `GEMINI.md` token is in local commit `21fcd19`, which is **not on any remote**.
Leave it alone. Do not `git push` from the workspace root.

---

## 6. Purge the secrets from git history

Do this **after** step 5 is pushed and **after** the credentials are rotated.
Without rotation this step buys you nothing.

Current exposure in `dealsforindia/dealflow`:

- `df_adm_549586…` — introduced in `8d6593c`, still present at `origin/main` until step 5 lands.
- `Rudra2025x` — introduced in `925d546`, present at `origin/main` until step 5 lands.

`git filter-repo` is not installed on this machine:

```powershell
pip install git-filter-repo
```

Work in a **fresh clone** (filter-repo refuses dirty repos and rewrites remotes):

```powershell
cd $env:TEMP
git clone https://github.com/dealsforindia/dealflow.git dealflow-purge
cd dealflow-purge

@"
df_adm_549586c9722ab144751420b657b2f709bb10d1f251b9663b==>***REMOVED***
Rudra2025x==>***REMOVED***
"@ | Set-Content replacements.txt -Encoding ascii

git filter-repo --replace-text replacements.txt --force
git remote add origin https://github.com/dealsforindia/dealflow.git
git push --force --all
git push --force --tags
```

Then repair your working clone:

```powershell
cd E:\Rudranildocs0066543\html-yt\telegram-system\tg-setup
git fetch origin
git reset --hard origin/main
```

### Caveats you must know

- **Forks keep the old history.** Check `github.com/dealsforindia/dealflow/forks`.
  If anyone forked it, you cannot purge their copy.
- **GitHub caches unreachable objects.** Old commit SHAs can stay fetchable for a
  while. For a repo this small the reliable options are: delete and recreate the
  repo, or open a GitHub Support ticket asking them to run `git gc` on it.
- **Every commit SHA changes.** Any collaborator must re-clone; open PRs need rebasing.
- **The storefront repo needs no purge** — it never contained either secret.
- Because the repo is public, treat the purge as hygiene only. Rotation (step 1) is
  what actually closes the hole.

---

## 7. Verify

Run these from PowerShell. Replace nothing except the old token in check #2.

```powershell
# 1. API is alive on the new config
curl.exe -s https://api.rudranil.me/api/v1/health

# 2. OLD admin token must now be rejected (expect 401)
curl.exe -s -o NUL -w "%{http_code}`n" -X POST https://api.rudranil.me/api/v1/auth/verify `
  -H "Authorization: Bearer df_adm_549586c9722ab144751420b657b2f709bb10d1f251b9663b"

# 3. NEW token must be accepted (expect 200)
curl.exe -s -o NUL -w "%{http_code}`n" -X POST https://api.rudranil.me/api/v1/auth/verify `
  -H "Authorization: Bearer <new token>"

# 4. Channel list requires auth (expect 401)
curl.exe -s -o NUL -w "%{http_code}`n" https://api.rudranil.me/api/v1/channels

# 5. Alerts require a session (expect 401)
curl.exe -s -o NUL -w "%{http_code}`n" "https://api.rudranil.me/api/v1/alerts?contact=test@example.com"

# 6. Bounties never expose contact
curl.exe -s "https://api.rudranil.me/api/v1/bounties?limit=5"

# 7. Public deals never expose channels
curl.exe -s "https://api.rudranil.me/api/v1/deals/public?limit=1"

# 8. Edge CORS rejects unknown origins (expect NO Access-Control-Allow-Origin line)
curl.exe -i -X OPTIONS https://dealflow-edge.pottemasshippo.workers.dev/api/v1/deals/public `
  -H "Origin: https://evil.example" -H "Access-Control-Request-Method: GET"

# 9. Edge CORS accepts the real storefront (expect the origin echoed back)
curl.exe -i -X OPTIONS https://dealflow-edge.pottemasshippo.workers.dev/api/v1/deals/public `
  -H "Origin: https://indiadealhunts.me" -H "Access-Control-Request-Method: GET"

# 10. Rate limit: first 10 pass, then 429
1..13 | ForEach-Object {
  curl.exe -s -o NUL -w "%{http_code}`n" -X POST https://api.rudranil.me/api/v1/feedback `
    -H "Content-Type: application/json" `
    -d '{\"name\":\"t\",\"email\":\"t@example.com\",\"subject\":\"t\",\"message\":\"t\"}'
}
```

Raw-file checks (GitHub caches raw content; add a cache-buster and wait a minute):

```powershell
curl.exe -s "https://raw.githubusercontent.com/dealsforindia/dealflow/main/src/app/utils/adminAuth.ts?cb=1" |
  Select-String "df_adm_"

curl.exe -s "https://raw.githubusercontent.com/dealsforindia/dealflow/main/dealflow/scripts/update_channels.py?cb=1" |
  Select-String "Rudra2025x|mongodb\+srv"
```

Both must return nothing.

Manual checks:

- Open <https://api.rudranil.me/> in a private window → login screen appears, deck
  does **not** auto-load.
- Paste the new token → dashboard loads, pending deals visible.
- Open the storefront, sign in, Profile → price alerts still load and "Check now" works.
- Place one price alert end-to-end and confirm the confirmation email arrives.

---

## 8. If something breaks

| Symptom | Cause | Fix |
|---|---|---|
| API returns 500 on every admin route | `ADMIN_API_TOKEN` missing/blank in VM `.env` | Fix `.env`, `pm2 restart api --update-env` |
| API cannot reach Mongo | Atlas password not updated or not URL-encoded | Fix `MONGODB_URI`, restart |
| Admin deck shows login but rejects the token | Old bundle cached | Ctrl+Shift+R, or verify `/assets/index-yO3J6mDo.js` is served |
| Deck loads but every request 401 | Token in `localStorage` is the old one | Log out (clear `dealflow_admin_token`) and log in again |
| Storefront alerts 401 | User has no session token | Sign in again |
| Rate limits never trigger | `redis` module missing on the VM | `pip install redis`, restart |
| Google sign-in 503 | `GOOGLE_CLIENT_ID` empty | Expected; set it only when you add Google login |

Rollback for the backend is `scp` the previous `api.py` and restart. Rollback for the
deck is `git revert` of the step-5 commit and `git pull` on the VM.

---

## 9. One heads-up

`tg-setup/src/styles/workspace.css` was recorded as modified earlier in this session
and now matches `HEAD` again. I never edited it. If you had a small CSS change there,
check it before committing — it may have been normalised by an editor or sync client.
