# 🚀 Pokreni Popravak Encoding Problema

## Brzi Popravak - Samo `┼ż` -> `ž`

Za brzi popravak samo problema s `┼ż` u dokumentaciji:

```bash
# Pokreni jednostavnu SQL skriptu
psql $DATABASE_URL -f backend/FIX-ENCODING-SIMPLE.sql
```

ILI kopiraj i zalijepi SQL u pgAdmin/DBeaver i pokreni.

## Kompletni Popravak - Sve Tablice

Za popravak encoding problema u **svim tablicama**:

```bash
# Pokreni kompletnu SQL skriptu
psql $DATABASE_URL -f backend/FIX-ENCODING-ALL-TABLES.sql
```

## Kako Provjeriti Rezultate

```sql
-- Provjeri da li ima još problema
SELECT 
    name,
    LEFT(name, 100) as preview
FROM "DocumentationFeature"
WHERE name LIKE '%┼%' 
   OR name LIKE '%<%'
LIMIT 10;

-- Ako nema rezultata, problem je riješen! ✅
```

## Nakon Pokretanja

1. **Pregledaj rezultate** u terminalu/query tool-u
2. **Ako su rezultati OK** → odkomentiraj `COMMIT;` na kraju SQL skripte
3. **Ako nešto nije OK** → odkomentiraj `ROLLBACK;` na kraju SQL skripte

**VAŽNO:** Sve skripte su omotane u transakciju - promjene se neće sačuvati dok ne pokreneš `COMMIT;`

