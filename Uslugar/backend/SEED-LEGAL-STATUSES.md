# Seed Legal Statuses u Bazu Podataka

## Problem
Aplikacija pokušava kreirati korisnike sa `legalStatusId` koji ne postoji u bazi, što uzrokuje grešku:
```
Foreign key constraint violated: `User_legalStatusId_fkey (index)`
```

## Rješenje

Trebate dodati pravne statuse u bazu podataka. Evo 3 načina:

---

## **Metoda 1: AWS RDS Query Editor (Najbrže)** ✅

1. Otvorite [AWS RDS Console](https://console.aws.amazon.com/rds/)
2. Odaberite vašu bazu podataka
3. Kliknite **Query Editor**
4. Kopirajte i zalijepite sadržaj file-a: `prisma/insert-legal-statuses.sql`
5. Kliknite **Run**

---

## **Metoda 2: pgAdmin / DBeaver**

1. Spojite se na AWS RDS bazu putem pgAdmin ili DBeaver
2. Otvorite Query Tool
3. Kopirajte i zalijepite sadržaj file-a: `prisma/insert-legal-statuses.sql`
4. Izvršite query (F5 ili Execute)

---

## **Metoda 3: psql Command Line**

```powershell
# 1. Učitajte DATABASE_URL iz .env
$env:DATABASE_URL = "postgresql://user:password@your-rds-endpoint:5432/dbname"

# 2. Izvršite SQL
psql $env:DATABASE_URL -f prisma/insert-legal-statuses.sql
```

---

## **Metoda 4: Node.js Seed (samo za lokalnu bazu)**

Ako koristite lokalnu PostgreSQL bazu:

```powershell
# 1. Provjerite da lokalna baza radi
pg_isready

# 2. Pokrenite seed
npm run seed
```

---

## Provjera

Nakon izvršavanja, provjerite da li su pravni statusi dodani:

```sql
SELECT * FROM "LegalStatus" ORDER BY "id";
```

Trebali biste vidjeti 6 redova:
- `cls1_individual` - Fizička osoba
- `cls2_sole_trader` - Obrtnik
- `cls3_pausal` - Paušalni obrt
- `cls4_doo` - d.o.o.
- `cls5_jdoo` - j.d.o.o.
- `cls6_freelancer` - Samostalni djelatnik

---

## Nakon seed-a

Sada možete normalno registrirati pružatelje usluga i firme! 🎉

