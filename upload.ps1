# DealFlow / Telegram System: Automated Upload Script (PowerShell)
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  DealFlow / Telegram System: Automated Upload Script" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location -Path $PSScriptRoot

Write-Host "[1/4] Checking Git Status..." -ForegroundColor Yellow
git status -s
Write-Host ""

Write-Host "[2/4] Staging Stabilized & Core Architecture Files..." -ForegroundColor Yellow
git add telegram-system/dealflow-edge/src/index.ts
git add telegram-system/dealbot_backend/dealbot/api.py
git add telegram-system/dealbot_backend/dealbot/worker.py
git add telegram-system/tg-setup/src/app/App.tsx
git add telegram-system/rudranil-deals-web/src/utils/savedDeals.ts
git add TELEGRAM_SYSTEM_2000_IDEAS.md
git add telegram-system/SYSTEM_AUDIT_REPORT.md
git add telegram-system/TELEGRAM_UX_RESEARCH.md
Write-Host "Staged successfully." -ForegroundColor Green
Write-Host ""

Write-Host "[3/4] Committing Changes..." -ForegroundColor Yellow
git commit -m "fix(pipeline): stabilize edge caching, redirect loops, timeseries bounds, and status normalization"
Write-Host ""

Write-Host "[4/4] Pushing to Remote Repository..." -ForegroundColor Yellow
git push origin main
Write-Host ""

if ($LASTEXITCODE -eq 0) {
    Write-Host "========================================================" -ForegroundColor Green
    Write-Host "  SUCCESS: All changes successfully committed and uploaded!" -ForegroundColor Green
    Write-Host "========================================================" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Git push failed. Please verify your network or branch settings." -ForegroundColor Red
}
