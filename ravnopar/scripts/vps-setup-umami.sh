#!/usr/bin/env bash
# Install / update Umami on Ravnopar VPS (Docker + nginx subdomain)
# Usage: bash scripts/vps-setup-umami.sh
set -euo pipefail

APP=/var/www/Render/ravnopar
UMAMI_DIR=$APP/deploy/umami
NGINX_SITE=/etc/nginx/sites-available/analytics.ravnopar.com
DOMAIN=analytics.ravnopar.com

if ! command -v docker >/dev/null 2>&1; then
  echo "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
fi
if ! docker compose version >/dev/null 2>&1; then
  apt-get update -y
  apt-get install -y docker-compose-plugin
fi

mkdir -p "$UMAMI_DIR"
cd "$UMAMI_DIR"

if [[ ! -f .env ]]; then
  SECRET=$(openssl rand -hex 32)
  printf 'UMAMI_APP_SECRET=%s\n' "$SECRET" > .env
  echo "Created $UMAMI_DIR/.env"
fi

docker compose pull
docker compose up -d

cat > "$NGINX_SITE" <<'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name analytics.ravnopar.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

ln -sfn "$NGINX_SITE" /etc/nginx/sites-enabled/analytics.ravnopar.com
nginx -t
systemctl reload nginx

if command -v certbot >/dev/null 2>&1; then
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email || \
    echo "Certbot skipped/failed — pokreni ručno: certbot --nginx -d $DOMAIN"
fi

echo
echo "==> Umami bi trebao biti na https://$DOMAIN"
echo "    Default login: admin / umami  (ODMAH PROMIJENI LOZINKU)"
echo "    1) Settings → Websites → Add → Domain: ravnopar.com"
echo "    2) Kopiraj Website ID"
echo "    3) Settings → Profile → API keys (ili login token) → UMAMI_API_TOKEN"
echo "    4) U backend/.env:"
echo "         UMAMI_BASE_URL=https://$DOMAIN"
echo "         UMAMI_WEBSITE_ID=<uuid>"
echo "         UMAMI_API_TOKEN=<token>"
echo "         UMAMI_SITE_LABEL=ravnopar.com"
echo "    5) U frontend-next .env.production:"
echo "         NEXT_PUBLIC_ANALYTICS_URL=https://$DOMAIN/script.js"
echo "         NEXT_PUBLIC_UMAMI_WEBSITE_ID=<uuid>"
echo "    6) npm run build + pm2 restart ravnopar-web ravnopar-api --update-env"
echo "    DNS: A zapis $DOMAIN → ovaj VPS IP"
