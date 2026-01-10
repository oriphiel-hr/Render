# 🔍 Provjera SVIH Razlika između Prisma Schema i Baze

## 📋 API Endpoint

```
GET /api/admin/migration-status
```

**Query params:**
- `table` (optional) - provjeri samo određenu tablicu

**Autentifikacija:** ADMIN role required

## 🚀 Kako Koristiti

### PowerShell Script

```powershell
# 1. Login kao Admin
$body = @{
    email = "admin@uslugar.hr"
    password = "Admin123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

$token = $response.token

# 2. Provjeri SVE razlike
$headers = @{
    Authorization = "Bearer $token"
}

$status = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/admin/migration-status" `
    -Method GET `
    -Headers $headers

# 3. Prikaži rezultate
Write-Host "`n=== TABLES STATUS ===" -ForegroundColor Cyan
$status.tables.PSObject.Properties | ForEach-Object {
    $color = if ($_.Value.exists) { "Green" } else { "Red" }
    Write-Host "  $($_.Name): $($_.Value.status)" -ForegroundColor $color
}

Write-Host "`n=== PROVIDER PROFILE FIELDS ===" -ForegroundColor Cyan
Write-Host "  Total: $($status.providerProfile.summary.total)" -ForegroundColor Gray
Write-Host "  Existing: $($status.providerProfile.summary.existing)" -ForegroundColor Green
Write-Host "  Missing: $($status.providerProfile.summary.missing)" -ForegroundColor Red

if ($status.providerProfile.summary.missingFields.Count -gt 0) {
    Write-Host "`n  Missing fields:" -ForegroundColor Yellow
    $status.providerProfile.summary.missingFields | ForEach-Object {
        Write-Host "    - $_" -ForegroundColor Red
    }
}

Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "  Needs fix: $($status.summary.needsFix)" -ForegroundColor $(if ($status.summary.needsFix) { "Red" } else { "Green" })
Write-Host "  Critical missing: $($status.summary.criticalMissing -join ', ')" -ForegroundColor $(if ($status.summary.criticalMissing.Count -gt 0) { "Red" } else { "Green" })
```

### cURL

```bash
# 1. Login
TOKEN=$(curl -X POST https://uslugar.api.oriph.io/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@uslugar.hr","password":"Admin123!"}' \
  | jq -r '.token')

# 2. Provjeri status
curl -X GET https://uslugar.api.oriph.io/api/admin/migration-status \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'
```

## 📊 Očekivani Rezultat

```json
{
  "success": true,
  "tables": {
    "ProviderProfile": {
      "exists": true,
      "status": "✅ EXISTS"
    },
    "User": {
      "exists": true,
      "status": "✅ EXISTS"
    },
    ...
  },
  "providerProfile": {
    "fields": {
      "id": {
        "exists": true,
        "status": "✅ EXISTS"
      },
      "isDirector": {
        "exists": false,
        "status": "❌ MISSING"
      },
      "companyId": {
        "exists": false,
        "status": "❌ MISSING"
      },
      ...
    },
    "summary": {
      "total": 45,
      "existing": 43,
      "missing": 2,
      "missingFields": ["isDirector", "companyId"],
      "allFieldsExist": false
    }
  },
  "migrations": {
    "directorFieldsMigration": {
      "recorded": true,
      "details": {
        "migration_name": "20251123000000_add_director_fields",
        "applied_steps_count": 1,
        "started_at": "2025-11-23T...",
        "finished_at": "2025-11-23T..."
      }
    },
    "recent": [...]
  },
  "summary": {
    "needsFix": true,
    "criticalMissing": ["isDirector", "companyId"],
    "totalMissing": 2
  }
}
```

## 🔧 Što Provjerava

### 1. Tablice
- Provjerava da li sve tablice postoje u bazi
- Default: ProviderProfile, User, Job, Category, Subscription, Invoice
- Može se filtrirati s `?table=ProviderProfile`

### 2. ProviderProfile Polja
- Provjerava SVA polja iz Prisma schema
- Uključuje: osnovna polja, KYC, email verification, director fields, itd.
- Prikazuje koja polja postoje, a koja nedostaju

### 3. Migracije
- Provjerava migration history
- Prikazuje recent migracije
- Provjerava specifično director fields migraciju

## 🚀 Sljedeći Koraci

1. **Pokreni provjeru** kroz API endpoint
2. **Pregledaj rezultate** - vidi koja polja nedostaju
3. **Ako ima nedostajućih polja:**
   - Provjeri da li postoji migracija za njih
   - Ako ne postoji, kreiraj migraciju
   - Ako postoji, provjeri zašto nije primijenjena
4. **Ako sve postoji:**
   - Problem je možda s Prisma Client cache
   - Provjeri da li je Prisma Client regeneriran

