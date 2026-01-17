# 🔍 Provjera Encoding Problema - PostgreSQL UTF-8

## Problem

Umjesto hrvatskih znakova (ž, ć, č, đ, š) prikazuje se `<|` ili `┼ż` - to znači da se UTF-8 podaci čitaju kao da su u pogrešnom encoding-u.

## Pravi Uzrok

Encoding problemi u PostgreSQL-u mogu nastati na nekoliko razina:

1. **Baza nije kreirana s UTF-8 encoding-om**
2. **Client encoding nije postavljen na UTF-8** (Prisma konekcija)
3. **Podaci su već zapisani u bazi u pogrešnom encoding-u**

## Provjera Encoding-a

### 1. Provjeri encoding baze podataka

```sql
-- Provjeri encoding baze
SELECT datname, pg_encoding_to_char(encoding) as encoding
FROM pg_database 
WHERE datname = 'uslugar';

-- Očekivani rezultat: UTF8
```

### 2. Provjeri client encoding (konekcija)

```sql
-- Provjeri trenutni client encoding
SHOW client_encoding;

-- Očekivani rezultat: UTF8
```

### 3. Provjeri encoding tablica i kolona

```sql
-- Provjeri encoding za specifičnu tablicu
SELECT 
    t.table_name,
    c.column_name,
    c.data_type
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public' 
  AND t.table_name = 'DocumentationFeature'
  AND c.column_name IN ('name', 'summary', 'details');

-- PostgreSQL koristi encoding baze za sve tablice
```

### 4. Provjeri kako se podaci čitaju

```sql
-- Provjeri jedan red s problematičnim znakom
SELECT 
    id,
    name,
    encode(name::bytea, 'hex') as name_hex,
    encode(name::bytea, 'escape') as name_escaped
FROM "DocumentationFeature"
WHERE name LIKE '%ž%' OR name LIKE '%<%'
LIMIT 5;

-- Ako name_hex sadrži C5BE (UTF-8 za "ž"), podaci su OK u bazi
-- Problem je u čitanju (client encoding)
```

## Rješenje

### Rješenje 1: Dodaj encoding parametar u DATABASE_URL (PREPORUČENO)

U `DATABASE_URL` dodaj `?client_encoding=utf8`:

```
postgresql://user:password@host:port/database?client_encoding=utf8
```

**ILI koristi environment variable:**

```bash
DATABASE_URL="postgresql://user:password@host:port/database?client_encoding=utf8"
```

### Rješenje 2: Postavi encoding kroz SQL (VEĆ IMPLEMENTIRANO)

Već sam dodao kod u `backend/src/lib/prisma.js` koji postavlja `SET client_encoding TO 'UTF8'` pri inicijalizaciji.

### Rješenje 3: Provjeri i popravi encoding baze (ako je problem u bazi)

Ako baza nije kreirana s UTF-8 encoding-om:

```sql
-- PROČITAJ OPREZ: Ovo može trajati dugo na velikim bazama!
-- Backup bazu PRIJE nego što pokreneš ove naredbe!

-- 1. Provjeri trenutni encoding
SELECT datname, pg_encoding_to_char(encoding) as encoding
FROM pg_database 
WHERE datname = 'uslugar';

-- 2. Ako nije UTF8, moraš rekreirati bazu (OPASNO - gubi podatke!)
-- NAPOMENA: Ovo zahtijeva kreiranje nove baze i migraciju podataka
-- Koristi pg_dump i pg_restore s UTF-8 encoding-om
```

## Provjera nakon popravke

1. **Restartaj backend server**
2. **Provjeri dokumentaciju** na `https://www.uslugar.eu/#documentation`
3. **Provjeri encoding kroz SQL:**

```sql
-- Provjeri kako Prisma čita podatke
SHOW client_encoding;

-- Trebalo bi biti: UTF8
```

## Ako problem i dalje postoji

Ako se problem i dalje pojavljuje, mogući uzroci:

1. **Podaci su već zapisani u bazi u pogrešnom encoding-u** - tada treba rekonvertirati podatke
2. **DATABASE_URL ne sadrži encoding parametar** - dodaj `?client_encoding=utf8`
3. **Prisma connection pool koristi starije konekcije** - restartaj backend server

## SQL za dijagnostiku problema

```sql
-- Sveobuhvatna provjera encoding-a
SELECT 
    'Database encoding' as check_type,
    pg_encoding_to_char(encoding) as encoding,
    datname as name
FROM pg_database 
WHERE datname = 'uslugar'

UNION ALL

SELECT 
    'Client encoding' as check_type,
    current_setting('client_encoding') as encoding,
    'current connection' as name;
```

