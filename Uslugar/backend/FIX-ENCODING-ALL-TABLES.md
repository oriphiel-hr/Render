# 🔧 Dinamički SQL za Popravak Encoding Problema - Sve Tablice

## Opis

Ova SQL skripta (`FIX-ENCODING-ALL-TABLES.sql`) automatski pronalazi sve tablice i kolone s tekstom u bazi podataka, te popravlja poznate encoding probleme (npr. `<|` → `ž`, `┼ż` → `ž`).

## Kako Koristiti

### 1. Backup Baze (OBVEZNO!)

```bash
# Backup prije bilo kakvih promjena
pg_dump -h host -U user -d uslugar > backup_before_encoding_fix_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Provjeri Trenutno Stanje

```sql
-- Provjeri koliko redova ima encoding probleme
SELECT 
    t.table_name,
    c.column_name,
    COUNT(*) as problematic_rows
FROM information_schema.tables t
JOIN information_schema.columns c 
    ON t.table_schema = c.table_schema 
    AND t.table_name = c.table_name
WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND c.data_type IN ('text', 'character varying')
    AND t.table_name NOT LIKE '_prisma%'
GROUP BY t.table_name, c.column_name
HAVING EXISTS (
    SELECT 1 
    FROM information_schema.columns c2
    WHERE c2.table_name = t.table_name 
    AND c2.column_name = c.column_name
)
ORDER BY problematic_rows DESC;
```

### 3. Pokreni SQL Skriptu

```bash
# Opcija 1: Kroz psql
psql -h host -U user -d uslugar -f FIX-ENCODING-ALL-TABLES.sql

# Opcija 2: Kroz psql direktno
psql $DATABASE_URL < FIX-ENCODING-ALL-TABLES.sql

# Opcija 3: Kopiraj i zalijepi SQL u pgAdmin / DBeaver Query Tool
```

### 4. Pregled Rezultata

Skripta automatski kreira `encoding_fix_log` tablicu s detaljima svih promjena:

```sql
SELECT 
    table_name,
    column_name,
    rows_updated,
    sample_before,
    sample_after,
    fixed_at
FROM encoding_fix_log
ORDER BY rows_updated DESC, fixed_at DESC;
```

### 5. Commit ili Rollback

Skripta je omotana u `BEGIN;` transakciju tako da možeš:

- **COMMIT** - Ako su rezultati OK, commitaj promjene
- **ROLLBACK** - Ako nešto nije OK, vrati sve natrag

**VAŽNO:** Na kraju skripte odkomentiraj `COMMIT;` ili `ROLLBACK;` ovisno o rezultatu.

## Što Skripta Radi

1. **Kreira funkciju `fix_encoding_text()`** - Popravlja poznate encoding probleme
2. **Pronalazi sve tablice i kolone** - Automatski prolazi kroz sve `text`, `varchar`, `char` kolone
3. **Provjerava probleme** - Traži redove s problematičnim znakovima (`<|`, `┼`, `Â`, `Ã`)
4. **Popravlja podatke** - Ažurira samo redove koji imaju probleme
5. **Logira promjene** - Snima sve promjene u `encoding_fix_log` tablicu

## Popravljeni Znakovi

- `ž` - `<|`, `┼ż`, `Âž`, `Ãž` → `ž`
- `ć` - `┼í`, `Âć`, `Ãć` → `ć`
- `č` - `┼ì`, `Âč`, `Ãč` → `č`
- `đ` - `┼░`, `Âđ`, `Ãđ` → `đ`
- `š` - `┼í`, `Âš`, `Ãš` → `š`
- `Ž` - `┼ü`, `ÂŽ`, `ÃŽ` → `Ž`
- `Ć` - `┼î`, `ÂĆ`, `ÃĆ` → `Ć`
- `Č` - `┼î`, `ÂČ`, `ÃČ` → `Č`
- `Đ` - `┼î`, `ÂĐ`, `ÃĐ` → `Đ`
- `Š` - `┼Ü`, `ÂŠ`, `ÃŠ` → `Š`

## Provjera Nakon Popravke

```sql
-- Provjeri da li su problemi riješeni u DocumentationFeature
SELECT 
    id,
    name,
    summary,
    LENGTH(name) as char_length,
    OCTET_LENGTH(name) as byte_length
FROM "DocumentationFeature"
WHERE name LIKE '%ž%' 
   OR name LIKE '%ć%'
   OR name LIKE '%č%'
   OR name LIKE '%đ%'
   OR name LIKE '%š%'
LIMIT 10;

-- Trebali bi vidjeti ispravne hrvatske znakove!
```

## Sigurnosne Provjere

Skripta automatski:
- ✅ Preskače sistemske tablice (`_prisma%`, `pg_%`, `information_schema%`)
- ✅ Radi samo u `public` shemi
- ✅ Ažurira samo redove koji imaju probleme
- ✅ Koristi transakciju za sigurnost
- ✅ Logira sve promjene

## Troubleshooting

### Problem: "function already exists"

```sql
-- Obriši postojeću funkciju
DROP FUNCTION IF EXISTS fix_encoding_text(TEXT);
```

### Problem: "too many rows to update"

Ako ima previše redova, možda želiš ograničiti UPDATE:

```sql
-- Dodaj LIMIT u DO bloku (modificiraj skriptu)
-- ... WHERE ... LIMIT 1000;
```

### Problem: Skripta je spora

Za velike baze, možda želiš pokrenuti po tablicama:

```sql
-- Fokusi se samo na DocumentationFeature
UPDATE "DocumentationFeature"
SET 
    name = fix_encoding_text(name),
    summary = fix_encoding_text(summary),
    details = fix_encoding_text(details)
WHERE name LIKE '%<%' OR name LIKE '%┼%'
   OR summary LIKE '%<%' OR summary LIKE '%┼%'
   OR details LIKE '%<%' OR details LIKE '%┼%';
```

## Alternativno: Re-seed Umjesto Fix-a

Ako imaš veliku bazu ili ne želiš riskirati, možda je bolje:

1. Backup postojećih podataka
2. Obriši dokumentacije
3. Re-seed s ispravnim encoding-om

```bash
# Re-seed dokumentacije
DATABASE_URL="postgresql://...?client_encoding=utf8" \
node prisma/seeds/seed-documentation.js
```

