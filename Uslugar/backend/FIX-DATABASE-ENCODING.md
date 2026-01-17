# 🔧 Popravak Encoding Problema u Bazi Podataka

## Problem

Tekst u bazi je zapisan u pogrešnom encoding-u. Primjerice, umjesto "ž" piše "<|" ili "┼ż". To znači da su podaci već u bazi u pogrešnom encoding-u.

## Uzrok

Podaci su zapisani u bazi dok je `client_encoding` bio postavljen na pogrešan encoding (npr. LATIN1 ili Windows-1252) umjesto UTF-8.

## Rješenje

### Metoda 1: Re-seed podataka s ispravnim encoding-om (PREPORUČENO)

**Najbolje rješenje je ponovno pokrenuti seed skriptu s ispravnim UTF-8 encoding-om:**

1. **Backup postojećih podataka:**
   ```bash
   pg_dump -h host -U user -d uslugar > backup_before_reseed.sql
   ```

2. **Obriši sve dokumentacije iz baze:**
   ```sql
   DELETE FROM "DocumentationFeature";
   DELETE FROM "DocumentationCategory";
   ```

3. **Osiguraj da je DATABASE_URL postavljen s UTF-8 encoding-om:**
   ```bash
   # Dodaj ?client_encoding=utf8 u DATABASE_URL
   export DATABASE_URL="postgresql://user:password@host:port/database?client_encoding=utf8"
   ```

4. **Pokreni seed ponovo:**
   ```bash
   cd backend
   node prisma/seeds/seed-documentation.js
   ```

   **ILI:**
   ```bash
   npm run seed:documentation
   ```

### Metoda 2: SQL pretvorba postojećih podataka

**Ako ne želiš gubiti postojeće podatke (npr. custom edits), možeš pokušati pretvoriti postojeće podatke:**

1. **Provjeri encoding baze:**
   ```sql
   SELECT pg_encoding_to_char(encoding) as encoding
   FROM pg_database 
   WHERE datname = current_database();
   ```

2. **Provjeri problematične podatke:**
   ```sql
   SELECT id, name 
   FROM "DocumentationFeature"
   WHERE name LIKE '%<%' OR name LIKE '%┼%'
   LIMIT 10;
   ```

3. **Pokušaj pretvoriti koristeći convert():**
   ```sql
   -- Prvo kreiraj konverziju ako ne postoji
   CREATE CONVERSION IF NOT EXISTS latin1_to_utf8
       FOR 'LATIN1' TO 'UTF8'
       FROM pg_catalog.utf8_to_latin1;

   -- Zatim pretvori podatke
   UPDATE "DocumentationFeature"
   SET name = convert(name::bytea::text, 'LATIN1', 'UTF8')
   WHERE name LIKE '%<%' OR name LIKE '%┼%';
   ```

**NAPOMENA:** Ovo može raditi ili ne, ovisno o tome kako su podaci zapisani.

### Metoda 3: Ručna zamjena znakova (WORKAROUND)

**Ako druge metode ne rade, možeš ručno zamijeniti znakove:**

```sql
-- Backup prije!
UPDATE "DocumentationFeature"
SET 
    name = REPLACE(
        REPLACE(
            REPLACE(
                REPLACE(
                    REPLACE(name, '<|', 'ž'),
                    '┼ż', 'ž'
                ),
                '┼í', 'ć'
            ),
            '┼ì', 'č'
        ),
        '┼░', 'đ'
    ),
    summary = REPLACE(REPLACE(REPLACE(REPLACE(summary, '<|', 'ž'), '┼ż', 'ž'), '┼í', 'ć'), '┼ì', 'č'),
    details = REPLACE(REPLACE(REPLACE(REPLACE(details, '<|', 'ž'), '┼ż', 'ž'), '┼í', 'ć'), '┼ì', 'č')
WHERE name LIKE '%<%' OR name LIKE '%┼%' 
   OR summary LIKE '%<%' OR summary LIKE '%┼%' 
   OR details LIKE '%<%' OR details LIKE '%┼%';
```

## Provjera nakon popravke

```sql
-- Provjeri da li su problemi riješeni
SELECT 
    id,
    name,
    LEFT(name, 50) as name_preview
FROM "DocumentationFeature"
WHERE name LIKE '%ž%' 
   OR name LIKE '%ć%'
   OR name LIKE '%č%'
   OR name LIKE '%đ%'
   OR name LIKE '%š%'
LIMIT 10;

-- Trebali bi vidjeti ispravne hrvatske znakove!
```

## Prevencija u budućnosti

1. **Osiguraj da DATABASE_URL uvijek ima `?client_encoding=utf8`:**
   ```bash
   DATABASE_URL="postgresql://user:pass@host:port/db?client_encoding=utf8"
   ```

2. **Osiguraj da seed skripte koriste UTF-8:**
   - Provjeri da Node.js proces koristi UTF-8 encoding
   - Provjeri da su source fajlovi sačuvani u UTF-8

3. **Provjeri encoding prije seed-a:**
   ```bash
   # U seed skripti
   await prisma.$executeRaw`SET client_encoding TO 'UTF8'`;
   ```

## Preporuka

**Metoda 1 (re-seed)** je najbolje rješenje jer osigurava da su podaci zapisani u ispravnom encoding-u od početka. Ostale metode su workaround-i koji mogu raditi ili ne, ovisno o tome kako su podaci zapisani.

