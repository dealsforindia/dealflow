@echo off
echo ========================================================
echo   DealFlow / Telegram System: Automated Upload Script
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/4] Checking Git Status...
git status -s
echo.

echo [2/4] Staging Stabilized & Core Architecture Files...
git add telegram-system/dealflow-edge/src/index.ts
git add telegram-system/dealbot_backend/dealbot/api.py
git add telegram-system/dealbot_backend/dealbot/worker.py
git add telegram-system/tg-setup/src/app/App.tsx
git add telegram-system/rudranil-deals-web/src/utils/savedDeals.ts
git add TELEGRAM_SYSTEM_2000_IDEAS.md
git add telegram-system/SYSTEM_AUDIT_REPORT.md
git add telegram-system/TELEGRAM_UX_RESEARCH.md
echo Staged successfully.
echo.

echo [3/4] Committing Changes...
git commit -m "fix(pipeline): stabilize edge caching, redirect loops, timeseries bounds, and status normalization"
echo.

echo [4/4] Pushing to Remote Repository...
git push origin main
echo.

if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo   SUCCESS: All changes successfully committed and uploaded!
    echo ========================================================
) else (
    echo [ERROR] Git push failed. Please verify your network / SSH credentials.
)

pause
