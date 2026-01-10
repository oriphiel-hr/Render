# 🔧 CASCADE DELETE - Rješenje Foreign Key Problema

## ❌ Problem

Greška koja se javlja:
```
Foreign key constraint violated: `ProviderProfile_userId_fkey (index)`
```

Ova greška se javlja kada pokušate obrisati `User`-a koji ima povezane podatke (ProviderProfile, Jobs, Offers, itd.).

## ✅ Rješenje

Dodao sam `onDelete: Cascade` na sve foreign key relacije u Prisma schema. Sada kada se obriše User, automatski će se obrisati i svi povezani podaci.

### Izmenjene relacije:

- ✅ `ProviderProfile` → `User` (Cascade)
- ✅ `Job` → `User` (Cascade)
- ✅ `Offer` → `Job` (Cascade)
- ✅ `Offer` → `User` (Cascade)
- ✅ `Review` → `User` (from & to) (Cascade)
- ✅ `Notification` → `User` (Cascade)
- ✅ `ChatRoom` → `Job` (Cascade)
- ✅ `ChatMessage` → `User` (Cascade)
- ✅ `ChatMessage` → `ChatRoom` (Cascade)

## 🚀 Kako primeniti migraciju?

### Opcija 1: Automatska migracija (preporučeno za development)

Pokrenite PowerShell skriptu:

```powershell
cd uslugar/backend
.\apply-cascade-migration.ps1
```

Izaberite opciju **1** za automatsku migraciju.

### Opcija 2: Ručna migracija (za production/AWS)

1. SQL skripta se nalazi u:
   ```
   uslugar/backend/prisma/migrations/20251020_add_cascade_deletes.sql
   ```

2. Pokrenite je na vašoj bazi pomoću:
   - **AWS RDS Query Editor**
   - **pgAdmin**
   - **psql**: 
     ```bash
     psql -h your-host -U your-user -d uslugar_db -f prisma/migrations/20251020_add_cascade_deletes.sql
     ```

### Opcija 3: Prisma Migrate direktno

```powershell
cd uslugar/backend
npx prisma migrate dev --name add_cascade_deletes
npx prisma generate
```

**Napomena:** Baza podataka mora biti pokrenuta i dostupna.

## 📋 Šta radi CASCADE DELETE?

Kada obrišete `User`-a:
```javascript
await prisma.user.delete({ where: { id: userId } });
```

Automatski se brišu i:
- ✅ ProviderProfile (ako postoji)
- ✅ Svi Jobs koje je kreirao
- ✅ Svi Offers koje je poslao
- ✅ Sve Reviews (date i primljene)
- ✅ Sve Notifications
- ✅ Sve ChatMessages
- ✅ Učešća u ChatRooms

## ⚠️ VAŽNO

**CASCADE DELETE je trajno!** Svi povezani podaci će biti nepovratno obrisani.

Ako želite soft delete umesto toga, razmotriteimplementaciju:
```prisma
model User {
  // ...
  isDeleted Boolean @default(false)
  deletedAt DateTime?
}
```

## ✅ Testiranje

Nakon primene migracije, možete testirati:

```javascript
// Ovo više neće bacati grešku:
await prisma.user.delete({ 
  where: { id: 'user-id-koji-ima-provider-profile' } 
});
```

## 🔍 Verifikacija

Provjerite da su constraints aplicirani:

```sql
-- PostgreSQL
SELECT 
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  confrelid::regclass AS referenced_table,
  confdeltype AS on_delete_action
FROM pg_constraint
WHERE contype = 'f'
  AND confdeltype = 'c'  -- 'c' = CASCADE
ORDER BY conrelid::regclass::text;
```

`on_delete_action` = 'c' znači CASCADE je aktivan.

---

**Status:** ✅ Schema ažurirana, spremna za migraciju
**Datum:** 20. oktobar 2025

