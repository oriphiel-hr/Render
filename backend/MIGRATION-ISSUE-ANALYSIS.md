# 🔍 Analiza Problema s Migracijom

## 📋 Problem

GitHub Actions workflow [run #247](https://github.com/oriphiel-hr/AWS_projekti/actions/runs/19610468556) je prošao uspješno, ali polja `isDirector` i `companyId` još uvijek ne postoje u bazi.

## 🤔 Zašto se to događa?

### Mogući Uzrok #1: Migracija je označena kao primijenjena, ali SQL nije izvršen

**Kako to funkcionira:**
1. `prisma migrate deploy` provjerava `_prisma_migrations` tablicu
2. Ako migracija već postoji u tablici → preskače je
3. Ako migracija ne postoji → pokreće SQL i dodaje zapis u `_prisma_migrations`

**Problem:**
- Ako je migracija već u `_prisma_migrations` (možda iz prethodnog pokušaja)
- Ali SQL nije stvarno izvršen (zbog greške ili prekida)
- `prisma migrate deploy` će reći "No pending migrations"
- Ali polja neće postojati u bazi

### Mogući Uzrok #2: SQL greška (silent failure)

**Kako to funkcionira:**
1. `prisma migrate deploy` pokreće SQL
2. SQL ima grešku (npr. constraint conflict)
3. Greška se ne prijavljuje ili se ignorira
4. Migracija se označi kao primijenjena
5. Ali polja nisu dodana

### Mogući Uzrok #3: Migracija je primijenjena na drugu bazu

**Kako to funkcionira:**
1. Workflow pokreće migraciju
2. Ali `DATABASE_URL` pokazuje na development bazu
3. Migracija se primijeni na development
4. Production baza ostaje bez promjena

## ✅ Kako Provjeriti

### 1. Provjeri da li je migracija u `_prisma_migrations`

```sql
SELECT 
    migration_name,
    applied_steps_count,
    started_at,
    finished_at
FROM _prisma_migrations
WHERE migration_name = '20251123000000_add_director_fields';
```

### 2. Provjeri da li polja stvarno postoje

```sql
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'ProviderProfile'
  AND column_name IN ('isDirector', 'companyId');
```

### 3. Provjeri CloudWatch Logs

Provjeri logove iz migration task-a:
- `/ecs/uslugar/prisma` log group
- Stream: `oneoff/prisma/<task-id>`

## 🔧 Rješenja

### Rješenje #1: Ručno primijeni migraciju

Pokreni `fix-director-fields-manually.sql` direktno na produkcijskoj bazi:

```sql
-- Pokreni SQL direktno
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "isDirector" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "companyId" TEXT;
-- ... (ostatak SQL-a)
```

### Rješenje #2: Označi migraciju kao rolled-back i ponovno primijeni

```bash
# Kroz ECS task ili lokalno
npx prisma migrate resolve --rolled-back 20251123000000_add_director_fields
npx prisma migrate deploy
```

### Rješenje #3: Auto-fix funkcija (već postoji)

`ensureDirectorFields()` u `src/server.js` će automatski:
- Provjeriti da li polja postoje
- Ako ne postoje → dodati ih
- Ako postoje → preskočiti

**Ovo je backup rješenje koje će raditi pri svakom restartu servera.**

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

## 🚀 Preporučeni Sljedeći Koraci

1. **Provjeri status migracije:**
   - Pokreni `verify-migration-applied.sql`
   - Provjeri CloudWatch logs

2. **Ako polja ne postoje:**
   - Pokreni `fix-director-fields-manually.sql` direktno na bazi
   - Ili čekaj da auto-fix doda polja pri startu servera

3. **Ako polja postoje:**
   - Provjeri da li je problem s Prisma Client cache
   - Možda treba regenerirati Prisma Client

## 🔗 Povezani Fajlovi

- `verify-migration-applied.sql` - Provjera statusa migracije
- `fix-director-fields-manually.sql` - Ručno dodavanje polja
- `src/server.js` - Auto-fix funkcija `ensureDirectorFields()`
- `.github/workflows/prisma-uslugar.yml` - GitHub Actions workflow

