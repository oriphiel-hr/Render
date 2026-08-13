#!/usr/bin/env bash
# Ravnopar VPS update: video/PWA/push + rebuild
# Run as root on srv1889799: bash /tmp/ravnopar-update.sh
set -euo pipefail

REPO=/var/www/Render
APP=$REPO/ravnopar
BE=$APP/backend
FE=$APP/frontend-next
UPLOAD_DIR=/var/www/ravnopar/uploads
NGINX_SITE=/etc/nginx/sites-enabled/ravnopar

echo "==> git pull"
cd "$REPO"
git fetch origin main
git pull origin main

echo "==> upload dir"
mkdir -p "$UPLOAD_DIR/videos"

ensure_env_line() {
  local file="$1" key="$2" value="$3"
  touch "$file"
  if grep -q "^${key}=" "$file" 2>/dev/null; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$file"
  else
    printf '\n%s=%s\n' "$key" "$value" >> "$file"
  fi
}

echo "==> VAPID keys"
cd "$BE"
if ! grep -q '^VAPID_PUBLIC_KEY=.\+' .env 2>/dev/null; then
  KEYS=$(npx --yes web-push generate-vapid-keys --json)
  PUB=$(node -e "const k=JSON.parse(process.argv[1]); process.stdout.write(k.publicKey)" "$KEYS")
  PRIV=$(node -e "const k=JSON.parse(process.argv[1]); process.stdout.write(k.privateKey)" "$KEYS")
  ensure_env_line .env VAPID_PUBLIC_KEY "$PUB"
  ensure_env_line .env VAPID_PRIVATE_KEY "$PRIV"
  ensure_env_line .env VAPID_SUBJECT "mailto:ravnopar@oriph.io"
  echo "Generated VAPID keys into backend/.env"
else
  PUB=$(grep '^VAPID_PUBLIC_KEY=' .env | cut -d= -f2-)
  echo "VAPID already present in backend/.env"
fi

ensure_env_line .env UPLOAD_DIR "$UPLOAD_DIR"
ensure_env_line .env NODE_ENV production

FE_ENV="$FE/.env.production"
if [[ ! -f "$FE_ENV" && -f "$FE/.env.local" ]]; then
  FE_ENV="$FE/.env.local"
fi
if [[ ! -f "$FE_ENV" ]]; then
  FE_ENV="$FE/.env.production"
  touch "$FE_ENV"
fi

ensure_env_line "$FE_ENV" NEXT_PUBLIC_API_BASE_URL "https://ravnopar.com/api"
ensure_env_line "$FE_ENV" NEXT_PUBLIC_SITE_URL "https://ravnopar.com"
ensure_env_line "$FE_ENV" SERVER_API_BASE_URL "http://127.0.0.1:4200/api"
ensure_env_line "$FE_ENV" NEXT_PUBLIC_VAPID_PUBLIC_KEY "$PUB"
echo "Frontend env: $FE_ENV"

echo "==> nginx /media + body size"
if [[ -f "$NGINX_SITE" ]]; then
  if ! grep -q 'location /media/' "$NGINX_SITE"; then
    python3 - <<'PY'
from pathlib import Path
p = Path("/etc/nginx/sites-enabled/ravnopar")
text = p.read_text()
block = """
    client_max_body_size 35m;

    location /media/ {
        proxy_pass http://127.0.0.1:4200/media/;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        expires 7d;
    }
"""
# insert after first "server {" that has listen 443 or after first server {
idx = text.find("server {")
if idx < 0:
    raise SystemExit("no server block")
# find opening brace end of first line
insert_at = text.find("\n", idx) + 1
# prefer inside SSL server
ssl_idx = text.find("listen 443")
if ssl_idx > 0:
    server_idx = text.rfind("server {", 0, ssl_idx)
    if server_idx >= 0:
        insert_at = text.find("\n", server_idx) + 1
if "location /media/" not in text:
    text = text[:insert_at] + block + text[insert_at:]
    p.write_text(text)
    print("Inserted /media location")
else:
    print("/media already present")
PY
  else
    echo "/media already in nginx"
  fi
  if ! grep -q 'client_max_body_size' "$NGINX_SITE"; then
    sed -i '/server_name ravnopar.com/a\    client_max_body_size 35m;' "$NGINX_SITE" || true
  fi
  nginx -t
  systemctl reload nginx
fi

echo "==> backend install/build"
cd "$BE"
npm ci
npm run build
pm2 restart ravnopar-api --update-env

echo "==> frontend install/build"
cd "$FE"
npm ci
npm run build
pm2 restart ravnopar-web --update-env
pm2 save

echo "==> health checks"
curl -s http://127.0.0.1:4200/health || true
echo
curl -I -s https://ravnopar.com | head -5 || true
echo
echo "DONE. Test: video upload, Postavke→Push, PWA install."
