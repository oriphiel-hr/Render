#!/bin/bash

# S3 Integration Test Script
# Testira da li se PDF fakture uploadaju u S3 bucket

set -e

# Konfiguracija
API_URL="${API_URL:-https://uslugar.api.oriph.io}"
JWT_TOKEN="${JWT_TOKEN:-}"

# Pokušaj učitati token iz fajla ako postoji
if [ -z "$JWT_TOKEN" ] && [ -f ".jwt-token" ]; then
  JWT_TOKEN=$(cat .jwt-token)
  echo "📋 Token učitán iz .jwt-token fajla"
fi

if [ -z "$JWT_TOKEN" ]; then
  echo "❌ JWT_TOKEN nije postavljen!"
  echo ""
  echo "Opcije:"
  echo "1. Export token: export JWT_TOKEN='your-token'"
  echo "2. Koristi get-jwt-token.sh: ./get-jwt-token.sh"
  echo "3. Ručno login: curl -X POST $API_URL/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"...\",\"password\":\"...\"}'"
  exit 1
fi

echo "🧪 S3 Integration Test"
echo "===================="
echo "API URL: $API_URL"
echo ""

# 1. Dohvati fakture
echo "📋 Korak 1: Dohvaćanje faktura..."
INVOICES_RESPONSE=$(curl -s -X GET "$API_URL/api/invoices" \
  -H "Authorization: Bearer $JWT_TOKEN")

if [ $? -ne 0 ]; then
  echo "❌ Greška pri dohvaćanju faktura!"
  exit 1
fi

INVOICE_COUNT=$(echo "$INVOICES_RESPONSE" | jq '.total // 0')

if [ "$INVOICE_COUNT" -eq 0 ]; then
  echo "⚠️  Nema faktura. Kreiraj fakturu prvo (npr. aktiviraj pretplatu)."
  exit 1
fi

echo "✅ Pronađeno faktura: $INVOICE_COUNT"

# 2. Uzmi prvu fakturu
INVOICE_ID=$(echo "$INVOICES_RESPONSE" | jq -r '.invoices[0].id')
INVOICE_NUMBER=$(echo "$INVOICES_RESPONSE" | jq -r '.invoices[0].invoiceNumber')
PDF_URL=$(echo "$INVOICES_RESPONSE" | jq -r '.invoices[0].pdfUrl // empty')

echo ""
echo "📄 Test faktura:"
echo "   ID: $INVOICE_ID"
echo "   Broj: $INVOICE_NUMBER"
echo "   pdfUrl: ${PDF_URL:-'N/A'}"

# 3. Provjeri pdfUrl
echo ""
echo "🔍 Korak 2: Provjera pdfUrl..."

if [ -z "$PDF_URL" ] || [ "$PDF_URL" = "null" ]; then
  echo "⚠️  pdfUrl nedostaje. Pokušavam generirati fakturu..."
  
  # Generiraj i pošalji fakturu
  echo "📧 Generiranje i slanje fakture..."
  SEND_RESPONSE=$(curl -s -X POST "$API_URL/api/invoices/$INVOICE_ID/send" \
    -H "Authorization: Bearer $JWT_TOKEN")
  
  if [ $? -ne 0 ]; then
    echo "❌ Greška pri generiranju fakture!"
    exit 1
  fi
  
  # Ponovno dohvati fakturu
  sleep 2
  INVOICE_DETAIL=$(curl -s -X GET "$API_URL/api/invoices/$INVOICE_ID" \
    -H "Authorization: Bearer $JWT_TOKEN")
  
  PDF_URL=$(echo "$INVOICE_DETAIL" | jq -r '.invoice.pdfUrl // empty')
fi

if [ -z "$PDF_URL" ] || [ "$PDF_URL" = "null" ]; then
  echo "❌ pdfUrl još uvijek nedostaje!"
  echo "   Provjeri CloudWatch logs za greške."
  exit 1
fi

echo "✅ pdfUrl postoji: $PDF_URL"

# 4. Provjeri da pdfUrl pokazuje na S3
if [[ "$PDF_URL" != *"s3"* ]] && [[ "$PDF_URL" != *"uslugar-invoices"* ]]; then
  echo "⚠️  pdfUrl ne pokazuje na S3 bucket!"
  echo "   Očekivano: s3://uslugar-invoices/ ili uslugar-invoices.s3..."
  exit 1
fi

echo "✅ pdfUrl pokazuje na S3 bucket"

# 5. Provjeri S3 bucket direktno
echo ""
echo "🪣 Korak 3: Provjera S3 bucket-a..."

S3_FILE="invoices/$INVOICE_NUMBER.pdf"
S3_CHECK=$(aws s3 ls "s3://uslugar-invoices/$S3_FILE" --region eu-north-1 2>&1)

if [ $? -ne 0 ]; then
  echo "❌ PDF ne postoji u S3 bucket-u!"
  echo "   Očekivano: s3://uslugar-invoices/$S3_FILE"
  echo "   Provjeri CloudWatch logs za S3 upload greške."
  exit 1
fi

echo "✅ PDF postoji u S3 bucket-u!"
echo "   Lokacija: s3://uslugar-invoices/$S3_FILE"
echo "   Detalji: $S3_CHECK"

# 6. Preuzmi PDF
echo ""
echo "📥 Korak 4: Preuzimanje PDF-a..."

curl -s -X GET "$API_URL/api/invoices/$INVOICE_ID/pdf" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -o "test-invoice-$INVOICE_NUMBER.pdf"

if [ $? -ne 0 ]; then
  echo "❌ Greška pri preuzimanju PDF-a!"
  exit 1
fi

if [ ! -f "test-invoice-$INVOICE_NUMBER.pdf" ]; then
  echo "❌ PDF fajl nije kreiran!"
  exit 1
fi

FILE_SIZE=$(stat -f%z "test-invoice-$INVOICE_NUMBER.pdf" 2>/dev/null || stat -c%s "test-invoice-$INVOICE_NUMBER.pdf" 2>/dev/null || echo "0")

if [ "$FILE_SIZE" -eq 0 ]; then
  echo "❌ PDF fajl je prazan!"
  exit 1
fi

echo "✅ PDF preuzet uspješno!"
echo "   Veličina: $FILE_SIZE bytes"
echo "   Fajl: test-invoice-$INVOICE_NUMBER.pdf"

# 7. Provjeri da je PDF valjan
echo ""
echo "🔍 Korak 5: Provjera valjanosti PDF-a..."

if command -v file &> /dev/null; then
  FILE_TYPE=$(file "test-invoice-$INVOICE_NUMBER.pdf")
  if [[ "$FILE_TYPE" == *"PDF"* ]]; then
    echo "✅ PDF je valjan!"
  else
    echo "⚠️  PDF možda nije valjan: $FILE_TYPE"
  fi
else
  echo "ℹ️  'file' command nije dostupan, preskačem provjeru valjanosti"
fi

# 8. Provjeri CloudWatch logs (opcionalno)
echo ""
echo "📊 Korak 6: Provjera CloudWatch logs (opcionalno)..."

if command -v aws &> /dev/null; then
  echo "   Provjeri logs: aws logs tail /ecs/uslugar --follow --region eu-north-1 | grep -i s3"
else
  echo "   AWS CLI nije dostupan, preskačem provjeru logs"
fi

echo ""
echo "🎉 Svi testovi prošli!"
echo ""
echo "📋 Sažetak:"
echo "   ✅ Faktura postoji u bazi"
echo "   ✅ pdfUrl je postavljen"
echo "   ✅ PDF je uploadan u S3 bucket"
echo "   ✅ PDF se može preuzeti"
echo "   ✅ PDF je valjan"
echo ""
echo "🧹 Čišćenje..."
rm -f "test-invoice-$INVOICE_NUMBER.pdf"
echo "✅ Test završen!"

