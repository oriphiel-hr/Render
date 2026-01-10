# 🧪 S3 Test - README

## ⚡ Najlakše: Koristi Test Skriptu

```powershell
cd uslugar/backend
.\S3-TEST-SIMPLE.ps1
```

Skripta će zatražiti email i password, zatim automatski testirati S3 integraciju.

---

## 🔑 Koristi Postojećeg Korisnika

Ako imaš postojećeg korisnika u bazi, koristi njegove credentials:

### Admin Korisnik (ako postoji):
- Email: `admin@uslugar.hr`
- Password: `Admin123!`

### Bilo Koji PROVIDER Korisnik:
Koristi bilo kojeg PROVIDER korisnika iz baze.

---

## 📝 Ručne PowerShell Komande

```powershell
# 1. Login
$body = @{email="your@email.com";password="your-password"} | ConvertTo-Json
$r = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/auth/login" -Method POST -ContentType "application/json" -Body $body
$env:JWT_TOKEN = $r.token

# 2. Dohvati fakture
$h = @{Authorization="Bearer $env:JWT_TOKEN"}
$invoices = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/invoices" -Method GET -Headers $h
$invoices.invoices | ForEach-Object { Write-Host "$($_.invoiceNumber): $($_.pdfUrl)" }

# 3. Provjeri S3
aws s3 ls s3://uslugar-invoices/invoices/ --region eu-north-1

# 4. Preuzmi PDF
if ($invoices.invoices.Count -gt 0) {
    $id = $invoices.invoices[0].id
    Invoke-WebRequest -Uri "https://uslugar.api.oriph.io/api/invoices/$id/pdf" -Headers $h -OutFile "invoice.pdf"
}
```

---

## ⚠️ Važno

1. **Koristi stvarne credentials**, ne placeholder-e (`your@email.com`)
2. **Ako nema faktura**, aktiviraj pretplatu preko Stripe checkout-a
3. **Provjeri da je S3 bucket kreiran**: `aws s3 ls s3://uslugar-invoices/`

---

## 📚 Dokumentacija

- **S3-TEST-SIMPLE.ps1** - Automatska test skripta
- **S3-TEST-QUICK-START.md** - Detaljne upute
- **S3-TEST-WITH-TOKEN.md** - Kompletne komande
- **S3-TEST-POWERSHELL.md** - PowerShell verzije komandi

