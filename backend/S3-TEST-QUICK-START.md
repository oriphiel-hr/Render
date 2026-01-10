# 🚀 S3 Test - Quick Start Guide

## 🔑 Korak 1: Kreiraj Test Korisnika

### Opcija A: Test PROVIDER (Preporučeno za fakture)

```powershell
cd uslugar/backend
node prisma/create-test-provider.js
```

**Output**:
```
✅ Test PROVIDER korisnik kreiran uspješno!
   Email: test.provider@uslugar.hr
   Password: Test123!
   Plan: TRIAL (8 kredita, 14 dana)
```

### Opcija B: Admin Korisnik

```powershell
cd uslugar/backend
node prisma/create-admin.js
```

**Output**:
```
✅ Admin korisnik kreiran uspješno!
   Email: admin@uslugar.hr
   Password: Admin123!
```

---

## 🔐 Korak 2: Dohvati JWT Token

### Koristi PowerShell skriptu:

```powershell
cd uslugar/backend
.\get-jwt-token.ps1
```

**Unesi credentials**:
- Email: `test.provider@uslugar.hr` (ili `admin@uslugar.hr`)
- Password: `Test123!` (ili `Admin123!`)

**Ili ručno**:
```powershell
$body = @{
    email = "test.provider@uslugar.hr"
    password = "Test123!"
} | ConvertTo-Json

$r = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

$env:JWT_TOKEN = $r.token
Write-Host "Token: $env:JWT_TOKEN" -ForegroundColor Green
```

---

## 🧪 Korak 3: Test S3 Integracije

### 1. Dohvati Fakture

```powershell
$h = @{Authorization="Bearer $env:JWT_TOKEN"}
$invoices = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/invoices" -Method GET -Headers $h

# Prikaži fakture
$invoices.invoices | ForEach-Object {
    Write-Host "$($_.invoiceNumber): $($_.pdfUrl)" -ForegroundColor Cyan
}
```

**Ako nema faktura**, aktiviraj pretplatu preko Stripe checkout-a da se kreira faktura.

### 2. Provjeri S3 Bucket

```powershell
aws s3 ls s3://uslugar-invoices/invoices/ --region eu-north-1
```

### 3. Preuzmi PDF

```powershell
if ($invoices.invoices.Count -gt 0) {
    $id = $invoices.invoices[0].id
    Invoke-WebRequest -Uri "https://uslugar.api.oriph.io/api/invoices/$id/pdf" `
        -Headers $h `
        -OutFile "invoice.pdf"
    Write-Host "✅ PDF preuzet: invoice.pdf" -ForegroundColor Green
}
```

---

## 📋 Kompletna PowerShell Skripta (Copy-Paste)

```powershell
# 1. Login
$body = @{email="test.provider@uslugar.hr";password="Test123!"} | ConvertTo-Json
$r = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/auth/login" -Method POST -ContentType "application/json" -Body $body
$env:JWT_TOKEN = $r.token
Write-Host "✅ Login uspješan!" -ForegroundColor Green
Write-Host "Token: $env:JWT_TOKEN" -ForegroundColor Yellow

# 2. Dohvati fakture
$h = @{Authorization="Bearer $env:JWT_TOKEN"}
$invoices = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/invoices" -Method GET -Headers $h

Write-Host "`n📋 Fakture:" -ForegroundColor Cyan
if ($invoices.invoices.Count -eq 0) {
    Write-Host "  ⚠️  Nema faktura. Aktiviraj pretplatu da se kreira faktura." -ForegroundColor Yellow
} else {
    $invoices.invoices | ForEach-Object {
        Write-Host "  $($_.invoiceNumber): $($_.pdfUrl)" -ForegroundColor Gray
    }
}

# 3. Provjeri S3
Write-Host "`n🪣 S3 Bucket:" -ForegroundColor Cyan
aws s3 ls s3://uslugar-invoices/invoices/ --region eu-north-1

# 4. Preuzmi PDF (ako postoji)
if ($invoices.invoices.Count -gt 0) {
    $id = $invoices.invoices[0].id
    $number = $invoices.invoices[0].invoiceNumber
    Write-Host "`n📥 Preuzimanje PDF-a..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri "https://uslugar.api.oriph.io/api/invoices/$id/pdf" -Headers $h -OutFile "invoice-$number.pdf"
    Write-Host "✅ PDF preuzet: invoice-$number.pdf" -ForegroundColor Green
}
```

---

## ⚠️ Važno

1. **Koristi stvarne credentials**, ne placeholder-e (`your@email.com`)
2. **Ako nema faktura**, aktiviraj pretplatu preko Stripe checkout-a
3. **Provjeri da je S3 bucket kreiran**: `aws s3 ls s3://uslugar-invoices/`

---

## 🐛 Troubleshooting

### "Invalid credentials"
→ Koristi credentials iz `create-test-provider.js` ili `create-admin.js`

### "No invoices found"
→ Aktiviraj pretplatu preko Stripe checkout-a da se kreira faktura

### "Missing token"
→ Provjeri da je `$env:JWT_TOKEN` postavljen: `echo $env:JWT_TOKEN`

