# 🔍 Provjera Migracije kroz ECS Task

## 📋 Problem

RDS Query Editor ne radi jer podržava samo Aurora Serverless. Naša baza je obični RDS PostgreSQL.

## ✅ Rješenje: Kroz ECS Task

### Opcija 1: Execute Command (Najlakše)

1. **Otvori AWS ECS Console:**
   - https://eu-north-1.console.aws.amazon.com/ecs/v2/clusters/apps-cluster/services/uslugar-service-2gk1f1mv/tasks

2. **Odaberi Running Task:**
   - Klikni na zelenu točku (running task)

3. **Klikni "Connect" (gornji desni kut)**

4. **Odaberi "Execute Command" → "Connect"**

5. **Pokreni provjeru:**
   ```bash
   # Provjeri status migracija
   npx prisma migrate status
   
   # Ili pokreni našu skriptu
   node check-migration-prisma.cjs
   ```

### Opcija 2: Kroz Prisma CLI direktno

U ECS Execute Command terminalu:

```bash
# 1. Provjeri status migracija
npx prisma migrate status

# 2. Provjeri da li polja postoje (SQL query)
npx prisma db execute --stdin <<EOF
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'ProviderProfile'
  AND column_name IN ('isDirector', 'companyId');
EOF

# 3. Provjeri migration history
npx prisma db execute --stdin <<EOF
SELECT 
    migration_name,
    applied_steps_count,
    started_at,
    finished_at
FROM _prisma_migrations
WHERE migration_name = '20251123000000_add_director_fields';
EOF
```

### Opcija 3: Kroz Node.js skriptu

1. **Upload skriptu u ECS task:**
   - Kopiraj `check-migration-prisma.cjs` u task
   - Ili koristi postojeću skriptu

2. **Pokreni:**
   ```bash
   export DATABASE_URL="postgres://uslugar_user:Pastor123@uslugar-db.cr80o0eeg3gy.eu-north-1.rds.amazonaws.com:5432/uslugar"
   node check-migration-prisma.cjs
   ```

## 🔧 Alternativa: Ručno primijeni migraciju

Ako polja ne postoje, možeš ručno primijeniti migraciju:

```bash
# U ECS Execute Command terminalu
psql $DATABASE_URL -f prisma/migrations/20251123000000_add_director_fields/migration.sql
```

Ili direktno SQL:

```sql
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "isDirector" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "companyId" TEXT;
```

## 📊 Očekivani Rezultati

### Ako je migracija primijenjena:
```
✅ Migration 20251123000000_add_director_fields is applied
✅ isDirector column EXISTS
✅ companyId column EXISTS
```

### Ako migracija NIJE primijenjena:
```
❌ Migration 20251123000000_add_director_fields is pending
❌ isDirector column MISSING
❌ companyId column MISSING
```

## 🚀 Sljedeći Koraci

1. **Provjeri status** kroz ECS Execute Command
2. **Ako polja ne postoje:**
   - Ručno primijeni migraciju (SQL iznad)
   - Ili čekaj da auto-fix doda polja pri restartu servera
3. **Ako polja postoje:**
   - Problem je možda s Prisma Client cache
   - Provjeri da li je Prisma Client regeneriran

