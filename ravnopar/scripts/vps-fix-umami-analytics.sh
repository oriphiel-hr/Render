#!/usr/bin/env bash
# Ravnopar VPS — poveži Umami analitiku s /admin panelom
#
# Radi:
#   1) Login u Umami → novi API token
#   2) Pronađe Website ID za ravnopar.com
#   3) Testira stats API (sprječava 400 grešku u adminu)
#   4) Upiše backend/.env + frontend env
#   5) Restartira PM2 (API + web)
#
# Korištenje (na VPS-u kao root):
#   cd /var/www/Render/ravnopar
#   UMAMI_USER=admin UMAMI_PASS='tvoja-lozinka' bash scripts/vps-fix-umami-analytics.sh
#
# ili interaktivno (pita lozinku):
#   bash scripts/vps-fix-umami-analytics.sh
#
set -euo pipefail

APP=/var/www/Render/ravnopar
BE="$APP/backend"
FE="$APP/frontend-next"
UMAMI_BASE="${UMAMI_BASE_URL:-https://analytics.ravnopar.com}"
UMAMI_BASE="${UMAMI_BASE%/}"
SITE_DOMAIN="${UMAMI_SITE_DOMAIN:-ravnopar.com}"
SITE_LABEL="${UMAMI_SITE_LABEL:-ravnopar.com}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}==>${NC} $*"; }
warn()  { echo -e "${YELLOW}!!${NC} $*"; }
fail()  { echo -e "${RED}ERR${NC} $*" >&2; exit 1; }

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "Nedostaje naredba: $1"
}

ensure_env_line() {
  local file="$1" key="$2" value="$3"
  python3 - "$file" "$key" "$value" <<'PY'
import sys
from pathlib import Path

path, key, value = sys.argv[1], sys.argv[2], sys.argv[3]
p = Path(path)
lines = p.read_text(encoding="utf-8").splitlines() if p.exists() else []
out, found = [], False
for line in lines:
    if line.startswith(key + "="):
        out.append(f"{key}={value}")
        found = True
    else:
        out.append(line)
if not found:
    out.append(f"{key}={value}")
p.parent.mkdir(parents=True, exist_ok=True)
p.write_text("\n".join(out) + "\n", encoding="utf-8")
PY
}

json_field() {
  local json="$1" expr="$2"
  node -e "
const d = JSON.parse(process.argv[1]);
const v = ($expr);
if (v == null) process.exit(2);
process.stdout.write(String(v));
" "$json"
}

http_json() {
  local method="$1" url="$2" body="${3:-}" auth="${4:-}"
  local args=(-sS -X "$method" "$url" -H "Accept: application/json")
  [[ -n "$auth" ]] && args+=(-H "Authorization: Bearer $auth")
  if [[ -n "$body" ]]; then
    args+=(-H "Content-Type: application/json" -d "$body")
  fi
  curl "${args[@]}"
}

require_cmd curl
require_cmd node
require_cmd python3
require_cmd pm2

[[ -d "$BE" ]] || fail "Backend nije na $BE — prilagodi APP varijablu."
[[ -f "$BE/.env" ]] || fail "Nema $BE/.env"

UMAMI_USER="${UMAMI_USER:-admin}"
if [[ -z "${UMAMI_PASS:-}" ]]; then
  read -r -s -p "Umami lozinka za korisnika '$UMAMI_USER': " UMAMI_PASS
  echo
fi
[[ -n "$UMAMI_PASS" ]] || fail "Lozinka je prazna."

info "Umami login ($UMAMI_BASE)..."
LOGIN_BODY=$(node -e "process.stdout.write(JSON.stringify({username:process.argv[1],password:process.argv[2]}))" "$UMAMI_USER" "$UMAMI_PASS")
LOGIN_JSON=$(http_json POST "$UMAMI_BASE/api/auth/login" "$LOGIN_BODY") || fail "Umami login nije uspio (curl)."

if echo "$LOGIN_JSON" | grep -q '"error"'; then
  echo "$LOGIN_JSON" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')); console.error(d.error?.message||JSON.stringify(d)); process.exit(1)"
  exit 1
fi

TOKEN=$(json_field "$LOGIN_JSON" "d.token") || fail "Nema tokena u login odgovoru."
info "Token dobiven (${#TOKEN} znakova)."

info "Dohvat website liste..."
WEBSITES_JSON=$(http_json GET "$UMAMI_BASE/api/websites" "" "$TOKEN") || fail "GET /api/websites nije uspio."

WEBSITE_ID=$(node - "$WEBSITES_JSON" "$SITE_DOMAIN" <<'PY'
const list = JSON.parse(process.argv[1]);
const domain = process.argv[2].toLowerCase();
const rows = Array.isArray(list) ? list : (list.data || []);
const hit = rows.find((w) => {
  const d = String(w.domain || w.name || "").toLowerCase();
  return d === domain || d.includes(domain);
});
if (!hit) process.exit(2);
process.stdout.write(hit.id || hit.websiteId || "");
PY
) || true

if [[ -z "${WEBSITE_ID:-}" ]]; then
  warn "Website '$SITE_DOMAIN' nije pronađen automatski."
  echo "Dostupni websiteovi:"
  node -e "
const list = JSON.parse(process.argv[1]);
const rows = Array.isArray(list) ? list : (list.data || []);
rows.forEach(w => console.log('-', w.id, '|', w.domain || w.name));
" "$WEBSITES_JSON"
  read -r -p "Upiši Website ID (UUID): " WEBSITE_ID
fi

[[ -n "$WEBSITE_ID" ]] || fail "Website ID je obavezan."
info "Website ID: $WEBSITE_ID"

END_MS=$(($(date +%s) * 1000))
START_MS=$((END_MS - 7 * 24 * 60 * 60 * 1000))

info "Test stats API..."
STATS_JSON=$(http_json GET \
  "$UMAMI_BASE/api/websites/$WEBSITE_ID/stats?startAt=$START_MS&endAt=$END_MS" \
  "" "$TOKEN")

if echo "$STATS_JSON" | grep -q '"error"'; then
  echo "$STATS_JSON"
  fail "Stats API vraća grešku — provjeri Website ID i token."
fi

info "Stats API OK (visitors: $(node -e "const d=JSON.parse(process.argv[1]); const v=d.visitors; process.stdout.write(v?.value ?? v ?? '?');" "$STATS_JSON"))."

info "Ažuriram backend/.env..."
ensure_env_line "$BE/.env" UMAMI_BASE_URL "$UMAMI_BASE"
ensure_env_line "$BE/.env" UMAMI_WEBSITE_ID "$WEBSITE_ID"
ensure_env_line "$BE/.env" UMAMI_API_TOKEN "$TOKEN"
ensure_env_line "$BE/.env" UMAMI_SITE_LABEL "$SITE_LABEL"

FE_ENV="$FE/.env.production"
if [[ -f "$FE/.env.local" ]]; then
  FE_ENV="$FE/.env.local"
elif [[ ! -f "$FE_ENV" ]]; then
  touch "$FE_ENV"
fi

info "Ažuriram frontend env ($FE_ENV)..."
ensure_env_line "$FE_ENV" NEXT_PUBLIC_ANALYTICS_URL "$UMAMI_BASE/script.js"
ensure_env_line "$FE_ENV" NEXT_PUBLIC_UMAMI_WEBSITE_ID "$WEBSITE_ID"

info "Restart PM2..."
pm2 restart ravnopar-api --update-env
pm2 restart ravnopar-web --update-env 2>/dev/null || warn "ravnopar-web nije pronađen — preskačem."
pm2 save 2>/dev/null || true

info "Test admin analytics endpoint (lokalno)..."
ANALYTICS=$(curl -sS "http://127.0.0.1:4200/api/admin/analytics" \
  -H "Authorization: Bearer SKIP" 2>/dev/null || true)
if [[ -n "$ANALYTICS" ]]; then
  warn "Admin endpoint traži JWT — provjeri ručno u browseru na /admin."
else
  warn "Nisam mogao testirati /api/admin/analytics bez admin JWT-a."
fi

echo
echo -e "${GREEN}GOTOVO.${NC}"
echo "  Umami:     $UMAMI_BASE"
echo "  Website:   $SITE_DOMAIN → $WEBSITE_ID"
echo "  Backend:   $BE/.env (token ažuriran)"
echo "  Frontend:  $FE_ENV"
echo
echo "Osvježi https://ravnopar.com/admin — analitika bi trebala raditi."
echo
echo "Ako frontend i dalje piše 'Plausible', rebuild:"
echo "  cd $FE && npm run build && pm2 restart ravnopar-web --update-env"
