# 🔍 Provjera Razlika između Prisma Schema i Baze

## 📋 Što Provjeravamo

Provjeravamo da li postoje razlike između Prisma schema (`prisma/schema.prisma`) i stvarne baze podataka.

## 🎯 Glavni Problem

Greška pri login-u:
```
The column `ProviderProfile.isDirector` does not exist in the current database.
```

## ✅ Rješenje

Kreirana je migracija i auto-fix funkcija:
- ✅ `prisma/migrations/20251123000000_add_director_fields/migration.sql` - migracija
- ✅ `src/server.js` - auto-fix funkcija `ensureDirectorFields()`

## 🔍 Kako Provjeriti

### Opcija 1: SQL Query (Preporučeno)

Pokreni SQL query iz `check-schema-differences.sql` na produkcijskoj bazi:

```sql
-- Provjeri da li polja postoje
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'ProviderProfile' AND column_name = 'isDirector'
        ) THEN '✅ isDirector exists'
        ELSE '❌ isDirector MISSING'
    END AS isDirector_status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'ProviderProfile' AND column_name = 'companyId'
        ) THEN '✅ companyId exists'
        ELSE '❌ companyId MISSING'
    END AS companyId_status;
```

### Opcija 2: Kroz ECS Task

1. Otvori ECS Console
2. Connect na running task
3. Pokreni:
   ```bash
   export DATABASE_URL="postgres://uslugar_user:Pastor123@uslugar-db.cr80o0eeg3gy.eu-north-1.rds.amazonaws.com:5432/uslugar"
   npx prisma migrate status
   ```

### Opcija 3: Auto-Fix će Riješiti

Nakon deploymenta, `ensureDirectorFields()` funkcija u `server.js` će automatski:
1. Provjeriti da li `isDirector` postoji
2. Ako ne postoji → dodati polja
3. Ako postoji → preskočiti

## 📊 Očekivani Rezultati

### Prije Migracije:
- ❌ `isDirector` - MISSING
- ❌ `companyId` - MISSING
- ❌ Foreign key - MISSING
- ❌ Indexes - MISSING

### Nakon Migracije:
- ✅ `isDirector` - EXISTS (BOOLEAN, DEFAULT false)
- ✅ `companyId` - EXISTS (TEXT, NULLABLE)
- ✅ Foreign key - EXISTS
- ✅ Indexes - EXIST

## 🚀 Sljedeći Koraci

1. **Commitaj promjene:**
   ```bash
   git add prisma/migrations/20251123000000_add_director_fields/migration.sql src/server.js
   git commit -m "fix: Add isDirector and companyId fields to ProviderProfile"
   git push origin main
   ```

2. **Deploy će automatski:**
   - Pokrenuti migraciju (`prisma migrate deploy`)
   - Ili auto-fix će dodati polja pri startu servera

3. **Provjeri nakon deploymenta:**
   - Login bi trebao raditi
   - SQL query bi trebao pokazati da polja postoje


