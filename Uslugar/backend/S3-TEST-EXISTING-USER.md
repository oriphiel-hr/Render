# 🔑 S3 Test - Koristi Postojećeg Korisnika

## 📋 Opcije

Ako ne možeš kreirati novog korisnika, koristi postojećeg:

### 1. Provjeri Postojeće Korisnike

Ako imaš pristup bazi, provjeri postojeće korisnike:

```sql
SELECT email, role, "fullName" FROM "User" WHERE role IN ('PROVIDER', 'ADMIN') LIMIT 10;
```

### 2. Koristi Admin Korisnika

Ako postoji admin korisnik:
- Email: `admin@uslugar.hr`
- Password: `Admin123!` (ili promijenjena lozinka)

### 3. Koristi Bilo Kojeg PROVIDER Korisnika

Ako imaš bilo kojeg PROVIDER korisnika u bazi, možeš koristiti njegove credentials.

---

## 🚀 Quick Test s Postojećim Korisnikom

```powershell
# Zamijeni s pravim credentials
$EMAIL = "your-existing-email@example.com"
$PASSWORD = "your-existing-password"

# Login
$body = @{email=$EMAIL;password=$PASSWORD} | ConvertTo-Json
$r = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/auth/login" -Method POST -ContentType "application/json" -Body $body

if ($r.token) {
    $env:JWT_TOKEN = $r.token
    Write-Host "✅ Login uspješan!" -ForegroundColor Green
    
    # Dohvati fakture
    $h = @{Authorization="Bearer $env:JWT_TOKEN"}
    $invoices = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/invoices" -Method GET -Headers $h
    
    Write-Host "`n📋 Fakture: $($invoices.total)" -ForegroundColor Cyan
    $invoices.invoices | ForEach-Object {
        Write-Host "  $($_.invoiceNumber): $($_.pdfUrl)" -ForegroundColor Gray
    }
    
    # Provjeri S3
    Write-Host "`n🪣 S3 Bucket:" -ForegroundColor Cyan
    aws s3 ls s3://uslugar-invoices/invoices/ --region eu-north-1
} else {
    Write-Host "❌ Login neuspješan!" -ForegroundColor Red
    Write-Host $r | ConvertTo-Json
}
```

---

## 💡 Alternativa: Registriraj Novog Korisnika

Ako nemaš postojećeg korisnika, registriraj novog preko API-ja:

```powershell
$registerBody = @{
    email = "test.s3@uslugar.hr"
    password = "Test123!"
    fullName = "Test S3 User"
    role = "PROVIDER"
    phone = "+385991234567"
    city = "Zagreb"
    legalStatusId = "ID_IZ_BAZE"  # Trebaš dohvatiti iz baze
    taxId = "12345678901"
    companyName = "Test Obrt"
} | ConvertTo-Json

$register = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $registerBody

Write-Host "✅ Registracija uspješna!" -ForegroundColor Green
Write-Host "Token: $($register.token)" -ForegroundColor Yellow
```

**Napomena**: Za registraciju PROVIDER-a trebaš `legalStatusId` iz baze.

---

## 🎯 Najlakše Rješenje

**Koristi admin korisnika** (ako postoji):
- Email: `admin@uslugar.hr`
- Password: `Admin123!`

Ili **koristi bilo kojeg postojećeg PROVIDER korisnika** iz baze.

