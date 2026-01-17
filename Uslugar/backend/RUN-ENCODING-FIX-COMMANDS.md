# 🚀 Kako Pokrenuti Encoding Fix (Ako Imaš Grešku o Transakciji)

## Problem

Ako dobivaš grešku:
```
ERROR: current transaction is aborted, commands ignored until end of transaction block
SQL state: 25P02
```

To znači da postoji prekinuta transakcija koja nije završena.

## Rješenje 1: Prvo ROLLBACK (Preporučeno)

```bash
# Pokreni prvo ROLLBACK
psql $DATABASE_URL -c "ROLLBACK;"

# Zatim pokreni skriptu
psql $DATABASE_URL -f backend/FIX-ENCODING-FINAL.sql
```

**ILI u psql/Query Tool direktno:**

```sql
-- Prvo ROLLBACK ako postoji prekinuta transakcija
ROLLBACK;

-- Zatim pokreni skriptu
\i backend/FIX-ENCODING-FINAL.sql
```

## Rješenje 2: Novi psql Session

```bash
# Zatvori trenutni psql session i otvori novi
# Zatim pokreni skriptu
psql $DATABASE_URL -f backend/FIX-ENCODING-FINAL.sql
```

## Rješenje 3: Autocommit Mode

```bash
# Pokreni psql s autocommit mode-om
psql $DATABASE_URL -c "SET AUTOCOMMIT=ON;" -f backend/FIX-ENCODING-FINAL.sql
```

**ILI u psql:**

```sql
\set AUTOCOMMIT on
\i backend/FIX-ENCODING-FINAL.sql
```

## Rješenje 4: Kopiraj SQL Dio po Dio

Ako ništa od navedenog ne radi, kopiraj i pokreni samo UPDATE-ove pojedinačno:

```sql
-- 1. DocumentationFeature.name
UPDATE "DocumentationFeature"
SET name = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(name, '┼ż', 'ž'), '┼í', 'ć'), '┼ì', 'č'), '┼░', 'đ'), '┼ü', 'Ž'), '┼Ü', 'Š'), '<|', 'ž'), '|>', 'ž'), 'Âž', 'ž'), 'Âć', 'ć'), 'Âč', 'č'), 'Âđ', 'đ'), 'Âš', 'š'), 'ÂŽ', 'Ž'), 'ÂĆ', 'Ć'), 'ÂČ', 'Č')
WHERE name LIKE '%┼%' OR name LIKE '%<%' OR name LIKE '%Â%';

-- Provjeri rezultat
SELECT COUNT(*) FROM "DocumentationFeature" WHERE name LIKE '%┼%';
```

## Provjera Nakon Popravke

```sql
-- Provjeri da li još ima problema
SELECT 
    COUNT(*) as remaining_issues
FROM "DocumentationFeature"
WHERE name LIKE '%┼%' OR name LIKE '%<%' OR name LIKE '%Â%';

-- Trebalo bi biti: 0
```

