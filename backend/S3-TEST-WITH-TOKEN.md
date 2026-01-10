# 🧪 S3 Test - Kompletne Upute s JWT Tokenom

## 🔑 Korak 1: Dohvati JWT Token

### Opcija A: Preko PowerShell skripte (Windows)

```powershell
cd uslugar/backend
.\get-jwt-token.ps1
```

Unesi email i password kada se zatraži.

### Opcija B: Preko Bash skripte (Linux/Mac)

```bash
cd uslugar/backend
chmod +x get-jwt-token.sh
./get-jwt-token.sh
```

### Opcija C: Ručno preko curl (Linux/Mac) ili PowerShell (Windows)

**Linux/Mac (Bash)**:
```bash
curl -X POST https://uslugar.api.oriph.io/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

**Windows (PowerShell)**:
```powershell
$body = @{
    email = "your-email@example.com"
    password = "your-password"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

$response.token
```

**Ili koristi curl.exe** (ako je instaliran):
```powershell
curl.exe -X POST https://uslugar.api.oriph.io/api/auth/login `
    -H "Content-Type: application/json" `
    -d '{\"email\":\"your-email@example.com\",\"password\":\"your-password\"}'
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "your-email@example.com",
    "role": "PROVIDER",
    "fullName": "Your Name"
  }
}
```

**Kopiraj `token` vrijednost!**

---

## 🧪 Korak 2: Test S3 Integracije

### 1. Postavi JWT Token

**Windows (PowerShell)**:
```powershell
$env:JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Linux/Mac (Bash)**:
```bash
export JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Ili koristi token iz `.jwt-token` fajla** (ako je skripta kreirala):
```bash
export JWT_TOKEN=$(cat .jwt-token)
```

---

### 2. Dohvati Fakture

**Linux/Mac (Bash)**:
```bash
curl -X GET https://uslugar.api.oriph.io/api/invoices \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.'
```

**Windows (PowerShell)**:
```powershell
$headers = @{
    "Authorization" = "Bearer $env:JWT_TOKEN"
}

$response = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/invoices" `
    -Method GET `
    -Headers $headers

$response | ConvertTo-Json -Depth 10
```

**Očekivani response**:
```json
{
  "success": true,
  "invoices": [
    {
      "id": "...",
      "invoiceNumber": "2025-0001",
      "pdfUrl": "https://uslugar-invoices.s3.eu-north-1.amazonaws.com/invoices/2025-0001.pdf",
      "status": "PENDING",
      "amount": 9900,
      ...
    }
  ],
  "total": 1
}
```

**✅ Provjeri**:
- `pdfUrl` postoji i pokazuje na S3 bucket
- `pdfUrl` sadrži `uslugar-invoices.s3.eu-north-1.amazonaws.com`

---

### 3. Provjeri S3 Bucket Direktno

```bash
aws s3 ls s3://uslugar-invoices/invoices/ --region eu-north-1
```

**Očekivani output**:
```
2025-11-23 12:00:00     12345 invoices/2025-0001.pdf
2025-11-23 12:05:00     12456 invoices/2025-0002.pdf
```

**Ili provjeri specifičnu fakturu**:
```bash
# Zamijeni INVOICE_NUMBER s brojem fakture (npr. 2025-0001)
aws s3 ls s3://uslugar-invoices/invoices/INVOICE_NUMBER.pdf --region eu-north-1
```

---

### 4. Preuzmi PDF

**Linux/Mac (Bash)**:
```bash
# Dohvati invoice ID
INVOICE_ID=$(curl -s -X GET https://uslugar.api.oriph.io/api/invoices \
  -H "Authorization: Bearer $JWT_TOKEN" | jq -r '.invoices[0].id')

# Preuzmi PDF
curl -X GET "https://uslugar.api.oriph.io/api/invoices/$INVOICE_ID/pdf" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -o invoice.pdf
```

**Windows (PowerShell)**:
```powershell
# Dohvati invoice ID
$invoiceId = $response.invoices[0].id
Write-Host "Invoice ID: $invoiceId"

# Preuzmi PDF
Invoke-WebRequest -Uri "https://uslugar.api.oriph.io/api/invoices/$invoiceId/pdf" `
    -Headers $headers `
    -OutFile "invoice.pdf"
```

**Provjeri da PDF postoji i nije prazan**:
```bash
ls -lh invoice.pdf
file invoice.pdf  # Trebao bi biti "PDF document"
```

---

## 🚀 Kompletna Test Skripta

Koristi `test-s3-integration.sh` koja automatski:
1. Dohvaća fakture
2. Provjerava `pdfUrl`
3. Provjerava S3 bucket
4. Preuzima i validira PDF

```bash
export JWT_TOKEN="your-token-here"
./uslugar/backend/test-s3-integration.sh
```

---

## 🔍 Troubleshooting

### Problem: "Unauthorized" ili "Invalid token"

**Rješenje**:
1. Provjeri da je token ispravno postavljen: `echo $JWT_TOKEN`
2. Provjeri da token nije istekao (JWT tokeni traju 7 dana)
3. Ponovno se logiraj i dohvati novi token

### Problem: "No invoices found"

**Rješenje**:
1. Aktiviraj pretplatu preko Stripe checkout-a (kreira se faktura)
2. Ili koristi postojeću fakturu iz baze

### Problem: `pdfUrl` je `null`

**Rješenje**:
1. Provjeri da su environment varijable postavljene u ECS
2. Provjeri CloudWatch logs za S3 errors
3. Pokušaj generirati fakturu ponovno: `POST /api/invoices/:id/send`

---

## 📋 Quick Reference

### Linux/Mac (Bash):
```bash
# 1. Login i dohvati token
TOKEN=$(curl -s -X POST https://uslugar.api.oriph.io/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"your-password"}' | jq -r '.token')

# 2. Dohvati fakture
curl -X GET https://uslugar.api.oriph.io/api/invoices \
  -H "Authorization: Bearer $TOKEN" | jq '.invoices[0].pdfUrl'

# 3. Provjeri S3
aws s3 ls s3://uslugar-invoices/invoices/ --region eu-north-1

# 4. Preuzmi PDF
INVOICE_ID=$(curl -s -X GET https://uslugar.api.oriph.io/api/invoices \
  -H "Authorization: Bearer $TOKEN" | jq -r '.invoices[0].id')

curl -X GET "https://uslugar.api.oriph.io/api/invoices/$INVOICE_ID/pdf" \
  -H "Authorization: Bearer $TOKEN" -o invoice.pdf
```

### Windows (PowerShell):
```powershell
# 1. Login i dohvati token
$body = @{email="your@email.com";password="pass"} | ConvertTo-Json
$r = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/auth/login" -Method POST -ContentType "application/json" -Body $body
$env:JWT_TOKEN = $r.token

# 2. Dohvati fakture
$h = @{Authorization="Bearer $env:JWT_TOKEN"}
$invoices = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/invoices" -Method GET -Headers $h
$invoices.invoices[0].pdfUrl

# 3. Provjeri S3
aws s3 ls s3://uslugar-invoices/invoices/ --region eu-north-1

# 4. Preuzmi PDF
Invoke-WebRequest -Uri "https://uslugar.api.oriph.io/api/invoices/$($invoices.invoices[0].id)/pdf" -Headers $h -OutFile "invoice.pdf"
```

---

## 📚 Dodatni Resursi

- **S3 Testing Guide**: `S3-TESTING-GUIDE.md`
- **S3 Setup Guide**: `S3-SETUP-GUIDE.md`
- **S3 ECS Setup**: `S3-ECS-SETUP.md`

