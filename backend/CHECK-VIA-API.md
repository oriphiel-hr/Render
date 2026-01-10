# 🔍 Provjera Migracije kroz API

## 📋 Problem

ECS task nema Execute Command opciju, pa ne možemo direktno provjeriti status migracije.

## ✅ Rješenje: API Endpoint

Dodan je novi admin endpoint koji provjerava status migracije.

### Endpoint

```
GET /api/admin/migration-status
```

**Autentifikacija:** ADMIN role required

### Kako Koristiti

#### 1. Dobij JWT Token (Login kao Admin)

```powershell
# Login
$body = @{
    email = "admin@uslugar.hr"
    password = "Admin123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

$token = $response.token
Write-Host "Token: $token" -ForegroundColor Green
```

#### 2. Provjeri Status Migracije

```powershell
$headers = @{
    Authorization = "Bearer $token"
}

$status = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/admin/migration-status" `
    -Method GET `
    -Headers $headers

# Prikaži rezultate
Write-Host "`nMigration Status:" -ForegroundColor Cyan
Write-Host "  isDirector: $($status.columns.isDirector.status)" -ForegroundColor $(if ($status.columns.isDirector.exists) { "Green" } else { "Red" })
Write-Host "  companyId: $($status.columns.companyId.status)" -ForegroundColor $(if ($status.columns.companyId.exists) { "Green" } else { "Red" })
Write-Host "  All columns exist: $($status.summary.allColumnsExist)" -ForegroundColor $(if ($status.summary.allColumnsExist) { "Green" } else { "Yellow" })
```

### Očekivani Rezultat

#### Ako polja postoje:
```json
{
  "success": true,
  "columns": {
    "isDirector": {
      "exists": true,
      "status": "✅ EXISTS"
    },
    "companyId": {
      "exists": true,
      "status": "✅ EXISTS"
    }
  },
  "migration": {
    "recorded": true,
    "details": {
      "migration_name": "20251123000000_add_director_fields",
      "applied_steps_count": 1,
      "started_at": "2025-11-23T...",
      "finished_at": "2025-11-23T..."
    }
  },
  "summary": {
    "allColumnsExist": true,
    "needsFix": false
  }
}
```

#### Ako polja ne postoje:
```json
{
  "success": true,
  "columns": {
    "isDirector": {
      "exists": false,
      "status": "❌ MISSING"
    },
    "companyId": {
      "exists": false,
      "status": "❌ MISSING"
    }
  },
  "migration": {
    "recorded": false,
    "details": null
  },
  "summary": {
    "allColumnsExist": false,
    "needsFix": true
  }
}
```

## 🔧 Ako Polja Ne Postoje

### Opcija 1: Čekaj Auto-Fix

Auto-fix funkcija `ensureDirectorFields()` u `src/server.js` će automatski dodati polja pri sljedećem restartu servera.

### Opcija 2: Ručno Primijeni Migraciju

Kroz novi Prisma migration task:

1. **Otvori GitHub Actions:**
   - https://github.com/oriphiel-hr/AWS_projekti/actions

2. **Pokreni "Prisma - Build/Push & Migrate" workflow:**
   - Klikni "Run workflow" → "main" → "Run workflow"

3. **Ili commitaj prazan commit:**
   ```bash
   git commit --allow-empty -m "chore: Trigger Prisma migration"
   git push origin main
   ```

### Opcija 3: Kroz CloudWatch Logs

Provjeri CloudWatch logs za auto-fix poruke:
- Log group: `/ecs/uslugar/backend`
- Traži: `ensureDirectorFields` ili `isDirector`

## 📊 Alternativa: CloudWatch Logs

Ako želiš provjeriti kroz CloudWatch logs:

1. **Otvori CloudWatch:**
   - https://eu-north-1.console.aws.amazon.com/cloudwatch/home?region=eu-north-1#logsV2:log-groups

2. **Odaberi log group:**
   - `/ecs/uslugar/backend`

3. **Traži:**
   - `isDirector`
   - `ensureDirectorFields`
   - `Adding missing isDirector`

## 🚀 Sljedeći Koraci

1. **Provjeri status** kroz API endpoint (gore)
2. **Ako polja ne postoje:**
   - Čekaj restart servera (auto-fix će dodati)
   - Ili pokreni Prisma migration task
3. **Ako polja postoje:**
   - Problem je možda s Prisma Client cache
   - Provjeri da li je Prisma Client regeneriran

