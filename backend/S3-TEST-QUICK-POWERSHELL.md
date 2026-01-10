# 🚀 S3 Test - Quick Start (PowerShell)

## ⚡ Najlakše: Koristi Test Skriptu

```powershell
cd uslugar/backend
.\S3-TEST-SIMPLE.ps1
```

Skripta će zatražiti email i password, zatim automatski:
1. ✅ Login i dohvati token
2. ✅ Dohvati fakture
3. ✅ Provjeri S3 bucket
4. ✅ Preuzmi PDF (ako postoji)

---

## 🔑 Koristi Postojećeg Korisnika

Ako imaš postojećeg korisnika u bazi, koristi njegove credentials:

### Opcija 1: Admin Korisnik

```powershell
# Ako postoji admin korisnik
$body = @{email="admin@uslugar.hr";password="Admin123!"} | ConvertTo-Json
$r = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/auth/login" -Method POST -ContentType "application/json" -Body $body
$env:JWT_TOKEN = $r.token
```

### Opcija 2: Bilo Koji PROVIDER Korisnik

Koristi bilo kojeg PROVIDER korisnika iz baze (zamijeni credentials):

```powershell
$body = @{email="your-existing-provider@example.com";password="your-password"} | ConvertTo-Json
$r = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/auth/login" -Method POST -ContentType "application/json" -Body $body
$env:JWT_TOKEN = $r.token
```

---

## 🧪 Test S3 Integracije

Nakon što imaš token:

```powershell
# Postavi headers
$h = @{Authorization="Bearer $env:JWT_TOKEN"}

# 1. Dohvati fakture
$invoices = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/invoices" -Method GET -Headers $h
$invoices.invoices | ForEach-Object { Write-Host "$($_.invoiceNumber): $($_.pdfUrl)" }

# 2. Provjeri S3
aws s3 ls s3://uslugar-invoices/invoices/ --region eu-north-1

# 3. Preuzmi PDF (ako postoji)
if ($invoices.invoices.Count -gt 0) {
    $id = $invoices.invoices[0].id
    Invoke-WebRequest -Uri "https://uslugar.api.oriph.io/api/invoices/$id/pdf" -Headers $h -OutFile "invoice.pdf"
}
```

---

## ⚠️ Važno

1. **Koristi stvarne credentials**, ne placeholder-e
2. **Ako nema faktura**, aktiviraj pretplatu preko Stripe checkout-a
3. **Provjeri da je S3 bucket kreiran**: `aws s3 ls s3://uslugar-invoices/`

---

## 📚 Dodatni Resursi

- **S3-TEST-SIMPLE.ps1** - Automatska test skripta
- **S3-TEST-QUICK-START.md** - Detaljne upute
- **S3-TEST-WITH-TOKEN.md** - Kompletne komande

