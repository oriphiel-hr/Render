# 🔍 Komande za Provjeru Migracije u ECS Execute Command

## 📋 Korak po Korak

### 1. Provjeri Status Migracija

```bash
npx prisma migrate status
```

**Očekivani rezultat:**
- Ako migracija nije primijenjena: `Migration 20251123000000_add_director_fields is pending`
- Ako je primijenjena: `Database schema is up to date!`

### 2. Provjeri da li Polja Postoje (SQL Query)

```bash
npx prisma db execute --stdin <<'EOF'
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'ProviderProfile'
  AND column_name IN ('isDirector', 'companyId')
ORDER BY column_name;
EOF
```

**Očekivani rezultat:**
- Ako polja postoje: Vidit ćeš 2 reda (isDirector i companyId)
- Ako ne postoje: Prazan rezultat

### 3. Provjeri Migration History

```bash
npx prisma db execute --stdin <<'EOF'
SELECT 
    migration_name,
    applied_steps_count,
    started_at,
    finished_at
FROM _prisma_migrations
WHERE migration_name = '20251123000000_add_director_fields'
ORDER BY started_at DESC
LIMIT 1;
EOF
```

**Očekivani rezultat:**
- Ako je migracija primijenjena: Vidit ćeš jedan red s detaljima
- Ako nije: Prazan rezultat

### 4. Brza Provjera (Sve u Jednom)

```bash
npx prisma db execute --stdin <<'EOF'
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'ProviderProfile' AND column_name = 'isDirector'
        ) THEN '✅ isDirector EXISTS'
        ELSE '❌ isDirector MISSING'
    END AS isDirector_status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'ProviderProfile' AND column_name = 'companyId'
        ) THEN '✅ companyId EXISTS'
        ELSE '❌ companyId MISSING'
    END AS companyId_status;
EOF
```

## 🔧 Ako Polja Ne Postoje - Ručno Dodaj

```bash
psql $DATABASE_URL <<'EOF'
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "isDirector" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "companyId" TEXT;

-- Provjeri da li su dodana
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'ProviderProfile'
  AND column_name IN ('isDirector', 'companyId');
EOF
```

## 📊 Interpretacija Rezultata

### Scenario 1: Polja NE postoje, migracija NIJE primijenjena
```
❌ isDirector MISSING
❌ companyId MISSING
Migration is pending
```
**Rješenje:** Ručno dodaj polja (komanda iznad)

### Scenario 2: Polja NE postoje, migracija JE primijenjena
```
❌ isDirector MISSING
❌ companyId MISSING
Migration is applied (but SQL failed)
```
**Rješenje:** Ručno dodaj polja (SQL greška u migraciji)

### Scenario 3: Polja POSTOJE
```
✅ isDirector EXISTS
✅ companyId EXISTS
```
**Rješenje:** Sve je u redu! Problem je možda s Prisma Client cache.

## 🚀 Sljedeći Koraci

1. **Ako polja ne postoje:**
   - Pokreni ručno dodavanje (komanda iznad)
   - Ili čekaj da auto-fix doda polja pri restartu servera

2. **Ako polja postoje:**
   - Provjeri da li je Prisma Client regeneriran
   - Možda treba restart servera

