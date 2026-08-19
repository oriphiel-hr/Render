#!/usr/bin/env bash
# Rebuild Ravnopar frontend na VPS-u (npr. nakon i18n promjena Plausible → Umami)
# Usage: bash scripts/vps-rebuild-web.sh
set -euo pipefail

APP=/var/www/Render/ravnopar
FE="$APP/frontend-next"

[[ -d "$FE" ]] || { echo "Nema $FE"; exit 1; }

echo "==> git sync (opcionalno — preskoči ako ne želiš)"
if [[ "${SKIP_GIT:-}" != "1" ]]; then
  cd /var/www/Render
  git fetch origin main
  git reset --hard origin/main
  git clean -fd ravnopar/ 2>/dev/null || true
fi

echo "==> build frontend (clean .next)"
cd "$FE"
rm -rf .next
npm ci
npm run build

echo "==> restart"
pm2 restart ravnopar-web --update-env
pm2 save 2>/dev/null || true

echo "GOTOVO — hard refresh na https://ravnopar.com/admin (Ctrl+Shift+R)"
