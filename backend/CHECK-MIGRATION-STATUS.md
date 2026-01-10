# 🔍 Provjera Statusa Migracije

## 📋 Problem

GitHub Actions workflow je prošao uspješno ([run #247](https://github.com/oriphiel-hr/AWS_projekti/actions/runs/19610468556)), ali greška pri login-u pokazuje da polja još uvijek ne postoje:

```
The column `ProviderProfile.isDirector` does not exist in the current database.
```

## 🤔 Mogući Uzroci

### 1. Migracija je označena kao primijenjena, ali SQL nije izvršen
- `_prisma_migrations` tablica sadrži zapis o migraciji
- Ali stvarni SQL nije izvršen
- Polja ne postoje u bazi

### 2. Migracija je primijenjena na drugu bazu
- Development vs Production
- Različite environment varijable

### 3. `prisma migrate deploy` nije pronašao migraciju
- Migracija možda nije uključena u Docker image
- Ili je već označena kao primijenjena

### 4. SQL greška (silent failure)
- Migracija je pokrenuta
- Ali SQL je imao grešku koja nije prijavljena
- Polja nisu dodana

## ✅ Kako Provjeriti

### Opcija 1: SQL Query (Preporučeno)

Pokreni `verify-migration-applied.sql` na produkcijskoj bazi:

```sql
-- Provjeri da li je migracija stvarno primijenjena
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'ProviderProfile' AND column_name = 'isDirector'
        ) THEN '✅ isDirector exists'
        ELSE '❌ isDirector MISSING'
    END AS isDirector_status;
```

### Opcija 2: Kroz ECS Task

1. Otvori ECS Console
2. Connect na running task
3. Pokreni:
   ```bash
   export DATABASE_URL="postgres://uslugar_user:Pastor123@uslugar-db.cr80o0eeg3gy.eu-north-1.rds.amazonaws.com:5432/uslugar"
   npx prisma migrate status
   ```

### Opcija 3: CloudWatch Logs

Provjeri CloudWatch logs iz migration task-a:
- Da li je migracija pronađena?
- Da li je SQL izvršen?
- Ima li grešaka?

## 🔧 Rješenje

### Ako migracija NIJE primijenjena:

1. **Ručno primijeni migraciju:**
   ```sql
   -- Pokreni SQL iz migration.sql direktno
   ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "isDirector" BOOLEAN NOT NULL DEFAULT false;
   ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "companyId" TEXT;
   -- ... (ostatak SQL-a)
   ```

2. **Ili kroz Prisma:**
   ```bash
   npx prisma migrate deploy
   ```

### Ako migracija JE primijenjena, ali polja ne postoje:

1. **Provjeri da li postoji problem s `IF NOT EXISTS`:**
   - Možda SQL nije izvršen zbog greške
   - Provjeri CloudWatch logs za detalje

2. **Ručno dodaj polja:**
   ```sql
   ALTER TABLE "ProviderProfile" ADD COLUMN "isDirector" BOOLEAN NOT NULL DEFAULT false;
   ALTER TABLE "ProviderProfile" ADD COLUMN "companyId" TEXT;
   ```

### Auto-Fix kao Backup

`ensureDirectorFields()` funkcija u `src/server.js` će automatski:
- Provjeriti da li polja postoje
- Ako ne postoje → dodati ih
- Ako postoje → preskočiti

## 📊 Očekivani Rezultati

### Ako je migracija uspješno primijenjena:
- ✅ `isDirector` - EXISTS
- ✅ `companyId` - EXISTS
- ✅ Foreign key - EXISTS
- ✅ Indexes - EXIST
- ✅ Migration recorded in `_prisma_migrations`

### Ako migracija NIJE primijenjena:
- ❌ `isDirector` - MISSING
- ❌ `companyId` - MISSING
- ❌ Foreign key - MISSING
- ❌ Indexes - MISSING
- ❓ Migration možda recorded, ali SQL nije izvršen

## 🚀 Sljedeći Koraci

1. **Provjeri status migracije:**
   - Pokreni `verify-migration-applied.sql`
   - Provjeri CloudWatch logs

2. **Ako polja ne postoje:**
   - Ručno primijeni migraciju
   - Ili čekaj da auto-fix doda polja pri startu servera

3. **Ako polja postoje:**
   - Provjeri da li je problem s Prisma Client cache
   - Možda treba regenerirati Prisma Client

