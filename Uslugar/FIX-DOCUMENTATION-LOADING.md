# 🔧 Fix: Greška pri učitavanju dokumentacije

## Problem

Na stranici https://uslugar.eu/#documentation prikazuje se greška:
```
Greška pri učitavanju dokumentacije. Molimo pokušajte ponovo.

Dokumentacija se učitava iz baze podataka. Provjeri da li je backend pokrenut i da li su podaci seedani.
```

## Mogući uzroci

1. **Backend nije pokrenut** - API ne odgovara na `/api/documentation`
2. **Migracije nisu primijenjene** - Tablice `DocumentationCategory` i `DocumentationFeature` ne postoje
3. **Podaci nisu seedani** - Tablice postoje, ali su prazne
4. **Baza podataka nije dostupna** - DATABASE_URL nije ispravan ili baza nije dostupna

---

## Rješenje - Korak po korak

### 1. Provjeri status dokumentacije (diagnostic)

```bash
# Na serveru (Render.com) ili lokalno
curl https://api.uslugar.eu/api/documentation/status
```

Ovo će pokazati:
- Postoje li tablice
- Ima li kategorija
- Ima li features
- Preporuke za rješavanje

### 2. Primijeni migracije (ako tablice ne postoje)

```bash
cd backend
npx prisma migrate deploy
```

Ili ako je development:
```bash
npx prisma migrate dev
```

### 3. Seed dokumentaciju (ako tablice postoje, ali su prazne)

```bash
cd backend
npm run seed:documentation
```

Ili direktno:
```bash
node prisma/seeds/seed-documentation.js
```

### 4. Provjeri backend status

```bash
# Provjeri da li backend radi
curl https://api.uslugar.eu/api/health

# Provjeri da li documentation endpoint radi
curl https://api.uslugar.eu/api/documentation
```

---

## Za Render.com deployment

### Kroz Render Dashboard:

1. **Otvorite Backend Service** na Render.com
2. **Shell Tab** → otvorite shell
3. **Pokrenite komande:**

```bash
cd backend
npx prisma migrate deploy
npm run seed:documentation
```

### Ili kroz Build Command (automatski):

U `render.yaml` ili Build Settings dodajte:

```yaml
services:
  - type: web
    name: uslugar-backend
    env: node
    buildCommand: npm install && npx prisma migrate deploy && npm run seed:documentation
    startCommand: npm start
```

---

## Za lokalni development

### 1. Provjeri .env

```bash
# backend/.env
DATABASE_URL="postgresql://user:password@host:5432/database?client_encoding=utf8"
```

### 2. Pokreni migracije

```bash
cd backend
npx prisma migrate dev
```

### 3. Seed dokumentaciju

```bash
npm run seed:documentation
```

### 4. Provjeri frontend

```bash
cd frontend
npm run dev
# Otvori http://localhost:5173/#documentation
```

---

## Diagnostic endpointi

### Status dokumentacije:
```
GET /api/documentation/status
```

Vraća:
- Postoje li tablice
- Broj kategorija i features
- Preporuke za rješavanje

### Provjera encoding-a:
```
GET /api/documentation/check-encoding
```

Vraća:
- Encoding baze podataka
- Encoding konekcije
- Test podaci s hrvatskim znakovima

---

## Testiranje

### 1. Provjeri da tablice postoje:

```sql
-- Kroz psql ili database client
SELECT COUNT(*) FROM "DocumentationCategory";
SELECT COUNT(*) FROM "DocumentationFeature";
```

### 2. Provjeri da ima podataka:

```sql
SELECT COUNT(*) FROM "DocumentationCategory" WHERE "isActive" = true;
SELECT COUNT(*) FROM "DocumentationFeature" WHERE "deprecated" = false AND "isAdminOnly" = false;
```

### 3. Test API endpoint:

```bash
curl https://api.uslugar.eu/api/documentation | jq '.features | length'
```

Očekivani rezultat: Broj > 0

---

## Troubleshooting

### Problem: "Table does not exist"

**Rješenje:**
```bash
npx prisma migrate deploy
```

### Problem: "No data returned"

**Rješenje:**
```bash
npm run seed:documentation
```

### Problem: "Database connection failed"

**Provjeri:**
- DATABASE_URL environment variable
- Database accessibility
- Network connectivity (za Render.com)

### Problem: "Encoding issues" (čudni znakovi)

**Rješenje:**
1. Provjeri encoding baze:
```sql
SHOW client_encoding;
```

2. Dodaj u DATABASE_URL:
```
?client_encoding=utf8
```

3. Provjeri diagnostic:
```bash
curl https://api.uslugar.eu/api/documentation/check-encoding
```

---

## Automatski test

Dodajte u CI/CD pipeline:

```bash
# Provjeri da dokumentacija radi
curl -f https://api.uslugar.eu/api/documentation/status || exit 1

# Provjeri da ima podataka
FEATURES_COUNT=$(curl -s https://api.uslugar.eu/api/documentation | jq '.features | length')
if [ "$FEATURES_COUNT" -eq 0 ]; then
  echo "⚠️  Documentation has no features!"
  exit 1
fi
```

---

## Ako i dalje ne radi

1. **Provjeri backend logove:**
   ```bash
   # Na Render.com → Backend Service → Logs
   # Traži greške vezane uz "DocumentationCategory" ili "documentation"
   ```

2. **Provjeri database logove:**
   - Traži SQL greške
   - Provjeri connection pool

3. **Kontaktiraj podršku:**
   - Pregledaj error poruke iz diagnostic endpointa
   - Provjeri backend health check

---

**Napomena:** Nakon što riješiš problem, dokumentacija će se automatski učitati na frontendu. Ako i dalje ne radi, možda trebaš osvježiti stranicu (Ctrl+F5) ili očistiti cache.

