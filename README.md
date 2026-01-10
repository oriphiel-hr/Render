# USLUGAR - Render.com Migration

Ovaj folder sadrži sve potrebno za migraciju backenda s AWS-a na Render.com.

## 📍 Lokacija

**Nova lokacija:** `C:\GIT_PROJEKTI\Render`

**Stara lokacija:** `C:\GIT_PROJEKTI\AWS\uslugar_render` ❌ (zastarjela)

## 📋 Sadržaj:

- `backup/` - AWS backup fajlovi (baza, env varijable)
- `backend/` - Backend kod pripremljen za Render.com
- `scripts/` - Backup i deployment skripte
- `RENDER-SETUP-STEP-BY-STEP.md` - Detaljne instrukcije za Render.com setup
- `FRONTEND-SETUP.md` - Instrukcije za frontend povezivanje

## 🚀 Quick Start:

### 1. Kreiraj PostgreSQL bazu na Render.com

Vidi: `RENDER-SETUP-STEP-BY-STEP.md` → Korak 1

### 2. Import baze u Render.com

```powershell
cd C:\GIT_PROJEKTI\Render
.\scripts\import-to-render.ps1 -BackupFile "backup\uslugar_complete_backup_20260107_232327.sql" -RenderDatabaseUrl "postgresql://..."
```

### 3. Deploy backend na Render.com

Vidi: `RENDER-SETUP-STEP-BY-STEP.md` → Korak 3-5

### 4. Ažuriraj frontend

Vidi: `FRONTEND-SETUP.md`

## 📝 Detaljne instrukcije:

- **Render.com Setup:** `RENDER-SETUP-STEP-BY-STEP.md`
- **Frontend Setup:** `FRONTEND-SETUP.md`
- **Logging Setup:** `RENDER-LOGGING-SETUP.md`

## 📊 Backup Fajlovi:

- `backup/uslugar_complete_backup_20260107_232327.sql` - SQL dump baze
- `backup/aws-secrets-20260108_083425.env` - Environment variables
- `backup/schema_20260107_225253.prisma` - Prisma schema

## 🔄 Ako direktorij još nije premješten:

Pokreni migraciju:

```powershell
cd C:\GIT_PROJEKTI
powershell -ExecutionPolicy Bypass -File "MIGRATE-TO-RENDER.ps1"
```

Ili ručno:

```powershell
# Kopiraj sve
Copy-Item -Path "AWS\uslugar_render\*" -Destination "Render\" -Recurse -Force

# Ažuriraj putanje u fajlovima
Get-ChildItem -Path "Render" -Recurse -Include "*.ps1","*.md" | ForEach-Object {
    (Get-Content $_.FullName -Raw) -replace 'C:\\GIT_PROJEKTI\\AWS\\uslugar_render', 'C:\GIT_PROJEKTI\Render' | Set-Content $_.FullName -NoNewline
}
```

