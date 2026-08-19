#!/usr/bin/env bash
# Hitni oporavak ravnopar-api (502) — MySQL schema + PM2 restart
set -euo pipefail

BE=/var/www/Render/ravnopar/backend
SCHEMA="$BE/prisma/schema.prisma"

echo "==> schema.prisma provider"
grep 'provider' "$SCHEMA" | head -2

if grep -q 'provider = "postgresql"' "$SCHEMA"; then
  echo "==> Popravljam postgresql -> mysql"
  sed -i 's/provider = "postgresql"/provider = "mysql"/' "$SCHEMA"
fi

echo "==> prisma generate"
cd "$BE"
node node_modules/prisma/build/index.js generate

echo "==> reserved word fix u umami-service (static -> tokenFromEnv)"
UMAMI="$BE/src/services/umami-service.js"
if grep -q 'const static = staticToken' "$UMAMI" 2>/dev/null; then
  sed -i 's/const static = staticToken()/const tokenFromEnv = staticToken()/' "$UMAMI"
  sed -i 's/return static || null/return tokenFromEnv || null/' "$UMAMI"
fi

echo "==> restart API"
pm2 delete ravnopar-api 2>/dev/null || true
pm2 start npm --name ravnopar-api --cwd "$BE" -- start
pm2 save

sleep 2
echo "==> test"
curl -sI http://127.0.0.1:4200/api/auth/profile | head -3
pm2 logs ravnopar-api --lines 10 --nostream
