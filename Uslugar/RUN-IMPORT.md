# 🚀 Pokretanje Import-a

## ✅ Provjera

Provjeri da li su svi preduvjeti ispunjeni:

### 1. SQL Dump Postoji

```powershell
cd C:\GIT_PROJEKTI\Render
Test-Path "backup\uslugar_complete_backup_20260107_232327.sql"
```

**Ako ne postoji, kopiraj:**
```powershell
Copy-Item "..\AWS\uslugar_render\backup\uslugar_complete_backup_20260107_232327.sql" "backup\" -Force
```

### 2. Docker Desktop Pokrenut

```powershell
docker --version
```

**Ako ne radi, pokreni Docker Desktop!**

### 3. Render.com Database URL

**Tvoj DATABASE_URL:**
```
postgresql://uslugar_user:Qwvk5j6QpbR8XGO8flXIDeg0GU76xORm@dpg-d5g06gshg0os738en9cg-a/uslugar
```

---

## 🚀 Pokreni Import

### Opcija 1: Ručno (Preporučeno)

**Otvori PowerShell i pokreni:**

```powershell
cd C:\GIT_PROJEKTI\Render
.\import-direct.ps1
```

**Ili s auto-confirm:**

```powershell
.\IMPORT-NOW.ps1 -AutoConfirm
```

---

### Opcija 2: Direktno Docker Komanda

**Ako skripte ne rade, možeš pokrenuti direktno:**

```powershell
cd C:\GIT_PROJEKTI\Render

$renderDbUrl = "postgresql://uslugar_user:Qwvk5j6QpbR8XGO8flXIDeg0GU76xORm@dpg-d5g06gshg0os738en9cg-a/uslugar"
$backupFile = "backup\uslugar_complete_backup_20260107_232327.sql"

# Parse URL
$uri = [System.Uri]::new($renderDbUrl)
$userInfo = $uri.UserInfo.Split(':')
$renderUser = $userInfo[0]
$renderPassword = $userInfo[1]
$renderHost = $uri.Host
$renderPort = 5432
$renderDb = "uslugar"

# Set password
$env:PGPASSWORD = $renderPassword

# Test connection
docker run --rm -e PGPASSWORD=$env:PGPASSWORD postgres:16 psql -h $renderHost -p $renderPort -U $renderUser -d $renderDb -c "SELECT version();"

# If connection works, run import
$tempFile = "$env:TEMP\render_import.sql"
Copy-Item $backupFile $tempFile

docker run --rm -v "${tempFile}:/backup.sql:ro" -e PGPASSWORD=$env:PGPASSWORD postgres:16 sh -c "psql -h $renderHost -p $renderPort -U $renderUser -d $renderDb -f /backup.sql"

# Cleanup
Remove-Item $tempFile -ErrorAction SilentlyContinue
Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
```

---

## ⏱️ Očekivano Vrijeme

- **Test konekcije:** 5-10 sekundi
- **Import baze:** 10-30 minuta (ovisno o veličini)
- **Ukupno:** ~15-30 minuta

---

## 🔍 Provjera Rezultata

**Nakon import-a, provjeri u Render.com dashboardu:**

1. Otvori: https://dashboard.render.com/
2. Idi na PostgreSQL bazu → "Connections" → "psql"
3. Pokreni:
   ```sql
   SELECT COUNT(*) FROM "User";
   SELECT COUNT(*) FROM "Job";
   SELECT COUNT(*) FROM "TestPlan";
   ```

**Ili preko psql:**

```powershell
$env:PGPASSWORD = "Qwvk5j6QpbR8XGO8flXIDeg0GU76xORm"
docker run --rm -e PGPASSWORD=$env:PGPASSWORD postgres:16 psql "postgresql://uslugar_user@dpg-d5g06gshg0os738en9cg-a/uslugar" -c "SELECT COUNT(*) FROM \"User\";"
```

---

## ❌ Troubleshooting

### Problem: "Connection refused"

**Rješenje:**
- Provjeri da li Render.com PostgreSQL dopušta vanjske konekcije
- Render.com PostgreSQL može zahtijevati IP whitelist

### Problem: "Docker not found"

**Rješenje:**
- Instaliraj Docker Desktop
- Pokreni Docker Desktop
- Provjeri: `docker --version`

### Problem: "SQL dump not found"

**Rješenje:**
```powershell
cd C:\GIT_PROJEKTI
Copy-Item "AWS\uslugar_render\backup\*" "Render\backup\" -Recurse -Force
```

---

**Sretno s importom! 🚀**

