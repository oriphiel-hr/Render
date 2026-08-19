#!/usr/bin/env bash
# Dodaj IP u Umami IGNORE_IP listu (isključi vlastite posjete iz statistike)
#
# Usage (na VPS-u):
#   bash scripts/vps-umami-ignore-ip.sh                    # auto: IP s kojeg se SSH-ate
#   bash scripts/vps-umami-ignore-ip.sh 89.123.45.67       # eksplicitni IP
#   ANALYTICS_IGNORE_IPS="1.2.3.4,5.6.7.8" bash scripts/vps-umami-ignore-ip.sh
#
set -euo pipefail

APP=/var/www/Render/ravnopar
UMAMI_DIR="$APP/deploy/umami"
UMAMI_ENV="$UMAMI_DIR/.env"
BE_ENV="$APP/backend/.env"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'
info() { echo -e "${GREEN}==>${NC} $*"; }

[[ -d "$UMAMI_DIR" ]] || { echo "Nema $UMAMI_DIR"; exit 1; }

# Prikupljanje IP adresa
IPS=()
if [[ -n "${ANALYTICS_IGNORE_IPS:-}" ]]; then
  IFS=',' read -ra IPS <<< "${ANALYTICS_IGNORE_IPS// /}"
elif [[ -n "${1:-}" ]]; then
  IPS=("$1")
else
  AUTO=$(curl -sS --max-time 5 https://api.ipify.org || curl -sS --max-time 5 https://ifconfig.me/ip || true)
  [[ -n "$AUTO" ]] || { echo "Ne mogu detektirati IP — proslijedi ručno: bash $0 89.123.45.67"; exit 1; }
  IPS=("$AUTO")
  info "Detektiran IP: $AUTO"
fi

# Opcionalno iz backend/.env
if [[ -f "$BE_ENV" ]]; then
  BE_IPS=$(grep -E '^ANALYTICS_IGNORE_IPS=' "$BE_ENV" 2>/dev/null | cut -d= -f2- | tr -d '"' | tr -d "'" || true)
  if [[ -n "$BE_IPS" ]]; then
    IFS=',' read -ra EXTRA <<< "${BE_IPS// /}"
    IPS+=("${EXTRA[@]}")
  fi
fi

# Uvijek ignoriraj localhost + VPS loopback
IPS+=("127.0.0.1" "::1")

# Dedupe
UNIQUE=$(printf '%s\n' "${IPS[@]}" | sed '/^$/d' | sort -u | paste -sd, -)

[[ -f "$UMAMI_ENV" ]] || { echo "Nema $UMAMI_ENV — prvo: bash scripts/vps-setup-umami.sh"; exit 1; }

python3 << PY
from pathlib import Path
p = Path("$UMAMI_ENV")
lines = p.read_text(encoding="utf-8").splitlines()
new_ips = "$UNIQUE"
out, found = [], False
for line in lines:
    if line.startswith("IGNORE_IP="):
        existing = line.split("=", 1)[1].strip().strip('"').strip("'")
        merged = sorted(set(filter(None, (existing + "," + new_ips).split(","))))
        out.append('IGNORE_IP="' + ",".join(merged) + '"')
        found = True
    else:
        out.append(line)
if not found:
    out.append('IGNORE_IP="' + new_ips + '"')
p.write_text("\\n".join(out) + "\\n", encoding="utf-8")
print("IGNORE_IP=" + new_ips)
PY

info "Restart Umami kontejnera..."
cd "$UMAMI_DIR"
docker compose up -d
sleep 2
docker compose ps

info "Gotovo. Tvoj IP je isključen iz Umami statistike."
info "Za trajno: dodaj u backend/.env → ANALYTICS_IGNORE_IPS=\"$UNIQUE\""
