# 🧪 S3 Test - PowerShell Komande

## 🔑 Korak 1: Dohvati JWT Token (PowerShell)

### Opcija 1: Koristi PowerShell skriptu (Preporučeno)

```powershell
cd uslugar/backend
.\get-jwt-token.ps1
```

### Opcija 2: Ručno preko PowerShell

```powershell
$body = @{
    email = "your-email@example.com"
    password = "your-password"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

$TOKEN = $response.token
Write-Host "Token: $TOKEN"
```

### Opcija 3: Koristi curl.exe (ako je instaliran)

```powershell
curl.exe -X POST https://uslugar.api.oriph.io/api/auth/login `
    -H "Content-Type: application/json" `
    -d '{\"email\":\"your-email@example.com\",\"password\":\"your-password\"}'
```

---

## 🧪 Korak 2: Test S3 Integracije (PowerShell)

### 1. Postavi JWT Token

```powershell
$env:JWT_TOKEN = "your-token-here"
```

### 2. Dohvati Fakture

```powershell
$headers = @{
    "Authorization" = "Bearer $env:JWT_TOKEN"
}

$response = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/invoices" `
    -Method GET `
    -Headers $headers

# Prikaži pdfUrl
$response.invoices[0].pdfUrl
```

### 3. Provjeri S3 Bucket

```powershell
aws s3 ls s3://uslugar-invoices/invoices/ --region eu-north-1
```

### 4. Preuzmi PDF

```powershell
# Dohvati invoice ID
$invoiceId = $response.invoices[0].id
Write-Host "Invoice ID: $invoiceId"

# Preuzmi PDF
Invoke-WebRequest -Uri "https://uslugar.api.oriph.io/api/invoices/$invoiceId/pdf" `
    -Headers $headers `
    -OutFile "invoice.pdf"

Write-Host "PDF preuzet: invoice.pdf"
```

---

## 🚀 Kompletna PowerShell Test Skripta

```powershell
# 1. Login i dohvati token
$loginBody = @{
    email = "your-email@example.com"
    password = "your-password"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginBody

$TOKEN = $loginResponse.token
Write-Host "✅ Login uspješan!" -ForegroundColor Green
Write-Host "Token: $TOKEN" -ForegroundColor Yellow

# 2. Postavi token
$env:JWT_TOKEN = $TOKEN

# 3. Dohvati fakture
$headers = @{
    "Authorization" = "Bearer $TOKEN"
}

$invoicesResponse = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/invoices" `
    -Method GET `
    -Headers $headers

Write-Host "`n📋 Fakture:" -ForegroundColor Cyan
$invoicesResponse.invoices | ForEach-Object {
    Write-Host "  - $($_.invoiceNumber): $($_.pdfUrl)" -ForegroundColor Gray
}

# 4. Provjeri S3 bucket
Write-Host "`n🪣 Provjera S3 bucket-a..." -ForegroundColor Cyan
aws s3 ls s3://uslugar-invoices/invoices/ --region eu-north-1

# 5. Preuzmi prvu fakturu
if ($invoicesResponse.invoices.Count -gt 0) {
    $invoiceId = $invoicesResponse.invoices[0].id
    $invoiceNumber = $invoicesResponse.invoices[0].invoiceNumber
    
    Write-Host "`n📥 Preuzimanje PDF-a..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri "https://uslugar.api.oriph.io/api/invoices/$invoiceId/pdf" `
        -Headers $headers `
        -OutFile "invoice-$invoiceNumber.pdf"
    
    Write-Host "✅ PDF preuzet: invoice-$invoiceNumber.pdf" -ForegroundColor Green
}
```

---

## 📝 Quick Reference (PowerShell)

```powershell
# Login
$body = @{email="your@email.com";password="pass"} | ConvertTo-Json
$r = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/auth/login" -Method POST -ContentType "application/json" -Body $body
$env:JWT_TOKEN = $r.token

# Dohvati fakture
$h = @{Authorization="Bearer $env:JWT_TOKEN"}
$invoices = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/invoices" -Method GET -Headers $h
$invoices.invoices[0].pdfUrl

# Provjeri S3
aws s3 ls s3://uslugar-invoices/invoices/ --region eu-north-1

# Preuzmi PDF
Invoke-WebRequest -Uri "https://uslugar.api.oriph.io/api/invoices/$($invoices.invoices[0].id)/pdf" -Headers $h -OutFile "invoice.pdf"
```

