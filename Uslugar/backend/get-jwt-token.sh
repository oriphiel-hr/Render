#!/bin/bash

# Script za dohvat JWT tokena za testiranje API-ja

API_URL="${API_URL:-https://uslugar.api.oriph.io}"
EMAIL="${EMAIL:-}"
PASSWORD="${PASSWORD:-}"

if [ -z "$EMAIL" ] || [ -z "$PASSWORD" ]; then
  echo "📝 Unesi email i password za login"
  echo ""
  read -p "Email: " EMAIL
  read -sp "Password: " PASSWORD
  echo ""
fi

echo "🔐 Prijava u tijeku..."
echo "API URL: $API_URL"
echo "Email: $EMAIL"
echo ""

# Login request
RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

# Provjeri da li je login uspješan
if echo "$RESPONSE" | jq -e '.token' > /dev/null 2>&1; then
  TOKEN=$(echo "$RESPONSE" | jq -r '.token')
  USER=$(echo "$RESPONSE" | jq -r '.user')
  
  echo "✅ Login uspješan!"
  echo ""
  echo "👤 Korisnik:"
  echo "$USER" | jq '.'
  echo ""
  echo "🔑 JWT Token:"
  echo "$TOKEN"
  echo ""
  echo "📋 Koristi token u curl komandama:"
  echo "export JWT_TOKEN=\"$TOKEN\""
  echo ""
  echo "📝 Primjer korištenja:"
  echo "curl -X GET $API_URL/api/invoices \\"
  echo "  -H \"Authorization: Bearer $TOKEN\""
  echo ""
  
  # Spremi token u fajl (opcionalno)
  echo "$TOKEN" > .jwt-token
  echo "💾 Token spremljen u .jwt-token fajl"
else
  echo "❌ Login neuspješan!"
  echo ""
  echo "Response:"
  echo "$RESPONSE" | jq '.'
  exit 1
fi

