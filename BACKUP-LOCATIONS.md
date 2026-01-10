# 📁 Backup Fajlovi - Lokacije

## ✅ Trenutne Lokacije

### 1. SQL Dump (Baza Podataka)

**Putanja:**
```
C:\GIT_PROJEKTI\AWS\uslugar_render\backup\uslugar_complete_backup_20260107_232327.sql
```

**Veličina:** ~15-20 MB (provjeri lokalno)

**Što sadrži:**
- Kompletna struktura baze
- Svi podaci (korisnici, jobovi, test plans, itd.)
- Sve tabele i relacije

---

### 2. Environment Variables (Secrets)

**Putanja:**
```
C:\GIT_PROJEKTI\AWS\uslugar_render\backup\aws-secrets-20260108_083425.env
```

**Veličina:** ~2-5 KB

**Što sadrži:**
- `DATABASE_URL` (stari AWS)
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- `SUDREG_CLIENT_ID`, `SUDREG_CLIENT_SECRET`
- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`
- `JWT_SECRET` (treba generirati novi za Render.com)
- I ostale environment variables

---

## 🔄 Kopiranje u Render Direktorij (Opcionalno)

Ako želiš imati backup fajlove i u `Render` direktoriju:

```powershell
cd C:\GIT_PROJEKTI

# Kreiraj backup direktorij u Render
if (-not (Test-Path "Render\backup")) {
    New-Item -ItemType Directory -Path "Render\backup" -Force | Out-Null
}

# Kopiraj SQL dump
Copy-Item "AWS\uslugar_render\backup\uslugar_complete_backup_20260107_232327.sql" `
          "Render\backup\" -Force

# Kopiraj env varijable
Copy-Item "AWS\uslugar_render\backup\aws-secrets-20260108_083425.env" `
          "Render\backup\" -Force

Write-Host "✅ Backup fajlovi kopirani u Render\backup\" -ForegroundColor Green
```

---

## 📋 Kako Koristiti

### SQL Dump (za Import u Render.com):

```powershell
cd C:\GIT_PROJEKTI\AWS\uslugar_render

# Import u Render.com PostgreSQL
.\scripts\import-to-render.ps1 `
    -BackupFile "backup\uslugar_complete_backup_20260107_232327.sql" `
    -RenderDatabaseUrl "postgresql://user:pass@host:port/database"
```

Vidi: `RENDER-SETUP-STEP-BY-STEP.md` → Korak 2

---

### Env Varijable (za Render.com Environment Variables):

1. Otvori: `backup\aws-secrets-20260108_083425.env`
2. Kopiraj varijable u Render.com:
   - Web Service → Environment → Add Environment Variable
3. **VAŽNO:** Generiraj novi `JWT_SECRET` za Render.com

Vidi: `RENDER-SETUP-STEP-BY-STEP.md` → Korak 4

---

## 🔒 Sigurnost

**⚠️ VAŽNO:** Ovi fajlovi sadrže osjetljive podatke!

- ❌ **NE commitaj** u Git (trebali bi biti u `.gitignore`)
- ❌ **NE dijeli** javno
- ✅ **Sačuvaj** lokalno
- ✅ **Obriši** nakon migracije (opcionalno)

---

## 📍 Brza Provjera

```powershell
# Provjeri da li fajlovi postoje
Test-Path "C:\GIT_PROJEKTI\AWS\uslugar_render\backup\uslugar_complete_backup_20260107_232327.sql"
Test-Path "C:\GIT_PROJEKTI\AWS\uslugar_render\backup\aws-secrets-20260108_083425.env"

# Provjeri veličine
(Get-Item "C:\GIT_PROJEKTI\AWS\uslugar_render\backup\uslugar_complete_backup_20260107_232327.sql").Length / 1MB
(Get-Item "C:\GIT_PROJEKTI\AWS\uslugar_render\backup\aws-secrets-20260108_083425.env").Length / 1KB
```

