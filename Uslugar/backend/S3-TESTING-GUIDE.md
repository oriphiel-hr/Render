# 🧪 S3 Testing Guide - Testiranje PDF Faktura Uploada

## 📋 Pregled

Ovaj vodič će vas provesti kroz testiranje S3 integracije za PDF fakture. Testirajte da se fakture automatski uploadaju u S3 bucket nakon generiranja.

## 🔑 Prvo: Dohvati JWT Token

Prije testiranja, trebate JWT token za autentikaciju. Koristi jednu od opcija:

### Opcija 1: PowerShell skripta (Windows)
```powershell
cd uslugar/backend
.\get-jwt-token.ps1
```

### Opcija 2: Bash skripta (Linux/Mac)
```bash
cd uslugar/backend
chmod +x get-jwt-token.sh
./get-jwt-token.sh
```

### Opcija 3: Ručno preko curl
```bash
curl -X POST https://uslugar.api.oriph.io/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"your-password"}' | jq -r '.token'
```

**Kopiraj token i postavi ga**:
```bash
export JWT_TOKEN="your-token-here"  # Linux/Mac
# ili
$env:JWT_TOKEN = "your-token-here"  # Windows PowerShell
```

**Detaljne upute**: Vidi `S3-TEST-WITH-TOKEN.md`

---

## 🎯 Test Scenariji

### 1. Test: Automatsko generiranje fakture pri aktivaciji pretplate

Kada se aktivira pretplata preko Stripe checkout-a, faktura se automatski generira i uploada u S3.

### 2. Test: Ručno generiranje fakture

Možete ručno generirati fakturu preko API-ja i provjeriti S3 upload.

### 3. Test: Preuzimanje PDF-a iz S3

Provjerite da se PDF može preuzeti iz S3 preko presigned URL-a.

---

## 🚀 Test 1: Automatsko generiranje fakture (Stripe Checkout)

### Korak 1: Aktiviraj pretplatu

**Endpoint**: `POST /api/payments/create-checkout`

```bash
curl -X POST https://uslugar.api.oriph.io/api/payments/create-checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "plan": "PREMIUM"
  }'
```

**Response**:
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

### Korak 2: Završi Stripe checkout

1. Otvori `url` iz response-a u browseru
2. Koristi test kartu: `4242 4242 4242 4242`
3. Završi checkout

### Korak 3: Provjeri fakturu u bazi

**Endpoint**: `GET /api/invoices`

```bash
curl -X GET https://uslugar.api.oriph.io/api/invoices \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response**:
```json
{
  "success": true,
  "invoices": [
    {
      "id": "...",
      "invoiceNumber": "2025-0001",
      "pdfUrl": "https://uslugar-invoices.s3.eu-north-1.amazonaws.com/invoices/2025-0001.pdf",
      "status": "PENDING",
      "amount": 99.00,
      ...
    }
  ]
}
```

**✅ Provjeri**:
- `pdfUrl` postoji i pokazuje na S3 bucket
- `pdfUrl` sadrži `uslugar-invoices.s3.eu-north-1.amazonaws.com`

### Korak 4: Provjeri S3 bucket direktno

```bash
aws s3 ls s3://uslugar-invoices/invoices/ --region eu-north-1
```

**Očekivani output**:
```
2025-11-23 12:00:00     12345 invoices/2025-0001.pdf
```

---

## 🚀 Test 2: Ručno generiranje fakture (POST /api/invoices/:invoiceId/send)

### Korak 1: Pronađi postojeću fakturu

Prvo dohvati postojeću fakturu (npr. iz Test 1 ili iz baze):

**Endpoint**: `GET /api/invoices`

```bash
curl -X GET https://uslugar.api.oriph.io/api/invoices \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" | jq '.invoices[0].id'
```

### Korak 2: Generiraj i pošalji fakturu

**Endpoint**: `POST /api/invoices/:invoiceId/send`

```bash
curl -X POST https://uslugar.api.oriph.io/api/invoices/INVOICE_ID/send \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response**:
```json
{
  "success": true,
  "message": "Invoice generated and sent",
  "invoice": {
    "id": "...",
    "invoiceNumber": "2025-0002",
    "pdfUrl": "https://uslugar-invoices.s3.eu-north-1.amazonaws.com/invoices/2025-0002.pdf",
    ...
  }
}
```

**✅ Provjeri**:
- `pdfUrl` postoji
- Faktura je poslana na email

---

## 🚀 Test 3: Preuzimanje PDF-a iz S3

### Korak 1: Dohvati fakturu

**Endpoint**: `GET /api/invoices/:invoiceId`

```bash
curl -X GET https://uslugar.api.oriph.io/api/invoices/INVOICE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response**:
```json
{
  "success": true,
  "invoice": {
    "id": "...",
    "invoiceNumber": "2025-0001",
    "pdfUrl": "https://uslugar-invoices.s3.eu-north-1.amazonaws.com/invoices/2025-0001.pdf",
    ...
  }
}
```

### Korak 2: Preuzmi PDF preko presigned URL-a

**Endpoint**: `GET /api/invoices/:invoiceId/pdf`

```bash
# Preuzmi PDF direktno (endpoint automatski koristi S3 ako postoji)
curl -X GET https://uslugar.api.oriph.io/api/invoices/INVOICE_ID/pdf \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o invoice.pdf
```

**Napomena**: Endpoint automatski:
1. Pokušava preuzeti PDF iz S3 ako `pdfUrl` postoji
2. Ako ne postoji u S3, generira novi PDF
3. Vraća PDF kao binary stream

**✅ Provjeri**:
- PDF se preuzima uspješno
- PDF je valjan (može se otvoriti)
- PDF sadrži ispravne podatke fakture

**Alternativno - direktno iz S3**:
```bash
aws s3 cp s3://uslugar-invoices/invoices/2025-0001.pdf ./invoice.pdf --region eu-north-1
```

---

## 🔍 Test 4: Provjera CloudWatch Logs

Provjeri da se S3 upload logira u CloudWatch:

```bash
aws logs tail /ecs/uslugar --follow --region eu-north-1 | grep -i s3
```

**Očekivani logovi**:
```
[S3] Invoice PDF uploaded: https://uslugar-invoices.s3.eu-north-1.amazonaws.com/invoices/2025-0001.pdf
[S3] Invoice PDF saved to S3: invoices/2025-0001.pdf
```

---

## 🐛 Troubleshooting

### Problem: `pdfUrl` je `null` ili nedostaje

**Rješenje**:
1. Provjeri da su environment varijable postavljene u ECS task definition:
   - `AWS_S3_BUCKET_NAME=uslugar-invoices`
   - `AWS_REGION=eu-north-1`
2. Provjeri IAM permissions za `ecsTaskExecutionRole`
3. Provjeri CloudWatch logs za S3 errors

### Problem: "Access Denied" u CloudWatch logs

**Rješenje**:
1. Provjeri IAM policy `S3InvoicesAccess` na `ecsTaskExecutionRole`
2. Provjeri da policy ima `s3:PutObject`, `s3:GetObject` permissions
3. Provjeri da bucket name odgovara `AWS_S3_BUCKET_NAME`

### Problem: PDF se ne uploada u S3

**Rješenje**:
1. Provjeri da `isS3Configured()` vraća `true`
2. Provjeri da bucket postoji: `aws s3 ls s3://uslugar-invoices`
3. Provjeri CloudWatch logs za detaljne greške

### Problem: Presigned URL ne radi

**Rješenje**:
1. Provjeri da `pdfUrl` postoji u bazi
2. Provjeri da S3 bucket postoji i da PDF postoji
3. Provjeri IAM permissions za `s3:GetObject`

---

## 📊 Test Checklist

- [ ] Faktura se automatski generira pri aktivaciji pretplate
- [ ] `pdfUrl` se sprema u bazu
- [ ] PDF se uploada u S3 bucket (`s3://uslugar-invoices/invoices/`)
- [ ] PDF se može preuzeti preko `/api/invoices/:id/pdf`
- [ ] Presigned URL radi i PDF se može preuzeti
- [ ] CloudWatch logs pokazuju S3 upload
- [ ] PDF je valjan i može se otvoriti
- [ ] PDF sadrži ispravne podatke fakture

---

## 🎯 Quick Test Script

```bash
#!/bin/bash

# Postavi varijable
API_URL="https://uslugar.api.oriph.io"
JWT_TOKEN="YOUR_JWT_TOKEN"
INVOICE_ID="YOUR_INVOICE_ID"

# 1. Dohvati fakture
echo "📋 Dohvaćanje faktura..."
curl -X GET "$API_URL/api/invoices" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.invoices[0]'

# 2. Provjeri pdfUrl
echo "🔍 Provjera pdfUrl..."
INVOICE=$(curl -s -X GET "$API_URL/api/invoices/$INVOICE_ID" \
  -H "Authorization: Bearer $JWT_TOKEN")
PDF_URL=$(echo $INVOICE | jq -r '.invoice.pdfUrl')

if [ "$PDF_URL" != "null" ] && [ -n "$PDF_URL" ]; then
  echo "✅ pdfUrl postoji: $PDF_URL"
else
  echo "❌ pdfUrl nedostaje!"
  exit 1
fi

# 3. Provjeri S3 bucket
echo "🪣 Provjera S3 bucket-a..."
INVOICE_NUMBER=$(echo $INVOICE | jq -r '.invoice.invoiceNumber')
aws s3 ls "s3://uslugar-invoices/invoices/$INVOICE_NUMBER.pdf" --region eu-north-1

if [ $? -eq 0 ]; then
  echo "✅ PDF postoji u S3 bucket-u!"
else
  echo "❌ PDF ne postoji u S3 bucket-u!"
  exit 1
fi

# 4. Preuzmi PDF
echo "📥 Preuzimanje PDF-a..."
curl -X GET "$API_URL/api/invoices/$INVOICE_ID/pdf" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -L -o "test-invoice.pdf"

if [ -f "test-invoice.pdf" ]; then
  echo "✅ PDF preuzet uspješno!"
  file test-invoice.pdf
else
  echo "❌ PDF preuzimanje neuspješno!"
  exit 1
fi

echo "🎉 Svi testovi prošli!"
```

---

## 📚 Dodatni Resursi

- **S3 Setup Guide**: `S3-SETUP-GUIDE.md`
- **S3 ECS Setup**: `S3-ECS-SETUP.md`
- **S3 Cost Optimization**: `S3-COST-OPTIMIZATION.md`

