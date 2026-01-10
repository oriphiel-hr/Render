# 🚀 Primena CASCADE DELETE na AWS RDS Bazu

## 📋 Šta trebate uraditi

Pošto lokalna baza nije pokrenuta, primenićemo migraciju direktno na **AWS RDS bazu**.

## 🔧 KORAK 1: Priprema SQL skripte

SQL skripta je već spremna:
```
uslugar/backend/prisma/migrations/20251020_add_cascade_deletes.sql
```

## 🔧 KORAK 2: Pokretanje na AWS RDS

### Opcija A: AWS RDS Query Editor (najlakše)

1. **Idite na AWS Console**
   - Otvorite: https://console.aws.amazon.com/rds/
   - Kliknite na **Query Editor**

2. **Povežite se na bazu**
   - Database: `uslugar_db`
   - Username: `postgres` (ili vaš username)
   - Password: vaša lozinka

3. **Kopirajte i pokrenite SQL**
   - Otvorite fajl: `prisma/migrations/20251020_add_cascade_deletes.sql`
   - Kopirajte cijeli sadržaj
   - Paste u Query Editor
   - Kliknite **Run**

### Opcija B: pgAdmin

1. **Otvorite pgAdmin**
2. **Povežite se na AWS RDS**
   - Host: vaš RDS endpoint (npr. `uslugar-db.xxxxx.eu-central-1.rds.amazonaws.com`)
   - Port: `5432`
   - Database: `uslugar_db`
   - Username & Password

3. **Pokrenite SQL skriptu**
   - Tools → Query Tool
   - File → Open: `prisma/migrations/20251020_add_cascade_deletes.sql`
   - Kliknite **Execute** (F5)

### Opcija C: psql iz terminala

```powershell
# Postavite environment varijable (zamените sa pravim vrednostima)
$env:PGHOST="uslugar-db.xxxxx.eu-central-1.rds.amazonaws.com"
$env:PGPORT="5432"
$env:PGDATABASE="uslugar_db"
$env:PGUSER="postgres"

# Pokrenite SQL skriptu
psql -f prisma/migrations/20251020_add_cascade_deletes.sql
```

## 🔧 KORAK 3: Regenerišite Prisma Client

Nakon što SQL skripta uspešno prođe, regenerišite Prisma Client:

```powershell
cd uslugar/backend
npx prisma generate
```

## ✅ KORAK 4: Verifikacija

Testirajte da li cascade delete radi:

```javascript
// Ovo više neće bacati grešku:
await prisma.user.delete({ 
  where: { id: 'user-id-sa-provider-profile' } 
});
```

## 📄 SQL Skripta (za copy-paste)

Ako vam treba direktan pristup skripti:

```sql
-- Ovaj kod je u: prisma/migrations/20251020_add_cascade_deletes.sql

ALTER TABLE "ProviderProfile" DROP CONSTRAINT IF EXISTS "ProviderProfile_userId_fkey";
ALTER TABLE "ProviderProfile" ADD CONSTRAINT "ProviderProfile_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Job" DROP CONSTRAINT IF EXISTS "Job_userId_fkey";
ALTER TABLE "Job" ADD CONSTRAINT "Job_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Offer" DROP CONSTRAINT IF EXISTS "Offer_jobId_fkey";
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_jobId_fkey" 
  FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Offer" DROP CONSTRAINT IF EXISTS "Offer_userId_fkey";
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Review" DROP CONSTRAINT IF EXISTS "Review_fromUserId_fkey";
ALTER TABLE "Review" ADD CONSTRAINT "Review_fromUserId_fkey" 
  FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Review" DROP CONSTRAINT IF EXISTS "Review_toUserId_fkey";
ALTER TABLE "Review" ADD CONSTRAINT "Review_toUserId_fkey" 
  FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Notification" DROP CONSTRAINT IF EXISTS "Notification_userId_fkey";
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ChatRoom" DROP CONSTRAINT IF EXISTS "ChatRoom_jobId_fkey";
ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_jobId_fkey" 
  FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ChatMessage" DROP CONSTRAINT IF EXISTS "ChatMessage_senderId_fkey";
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey" 
  FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ChatMessage" DROP CONSTRAINT IF EXISTS "ChatMessage_roomId_fkey";
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_roomId_fkey" 
  FOREIGN KEY ("roomId") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

## ⚠️ VAŽNO

**Backup:** Prije pokretanja na production bazi, napravite backup!

```sql
-- Kreirajte snapshot u AWS RDS Console prije nego što pokrenete skriptu
```

---

**Nakon primene:** Foreign key constraint greška će biti riješena! ✅

