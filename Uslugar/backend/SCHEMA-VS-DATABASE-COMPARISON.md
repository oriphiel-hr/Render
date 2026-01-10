# 🔍 Usporedba Prisma Schema vs Baza Podataka

## 📋 Pregled

Ovaj dokument pruža detaljnu usporedbu između Prisma schema (`prisma/schema.prisma`) i stvarne baze podataka.

## 🎯 Glavni Problem

**Greška pri login-u:**
```
The column `ProviderProfile.isDirector` does not exist in the current database.
```

## ✅ Rješenje

1. **Migracija kreirana:** `20251123000000_add_director_fields/migration.sql`
2. **Auto-fix dodan:** `src/server.js` → `ensureDirectorFields()`

## 📊 ProviderProfile - Sva Polja

### Očekivana Polja (iz Prisma Schema)

#### Osnovna Polja
- ✅ `id` - String (PK)
- ✅ `userId` - String (unique, FK → User)
- ✅ `bio` - String? (nullable)
- ✅ `portfolio` - Json? (nullable)
- ✅ `ratingAvg` - Float (default: 0)
- ✅ `ratingCount` - Int (default: 0)

#### Reputation System
- ✅ `avgResponseTimeMinutes` - Float (default: 0)
- ✅ `totalResponseTimeTracked` - Int (default: 0)
- ✅ `conversionRate` - Float (default: 0)

#### Profil Informacije
- ✅ `serviceArea` - String? (nullable)
- ✅ `specialties` - String[] (array)
- ✅ `experience` - Int? (nullable)
- ✅ `website` - String? (nullable)
- ✅ `isAvailable` - Boolean (default: true)

#### Legal Status
- ✅ `legalStatusId` - String? (nullable, FK → LegalStatus)
- ✅ `taxId` - String? (nullable)
- ✅ `companyName` - String? (nullable)

#### Uslugar Exclusive
- ✅ `maxCategories` - Int (default: 5)
- ✅ `nkdCodes` - String[] (array)

#### Featured Profile
- ✅ `isFeatured` - Boolean (default: false)

#### Approval Status
- ✅ `approvalStatus` - ProviderApprovalStatus? (nullable, default: WAITING_FOR_APPROVAL)

#### KYC Verification
- ✅ `kycVerified` - Boolean (default: false)
- ✅ `kycDocumentUrl` - String? (nullable)
- ✅ `kycExtractedOib` - String? (nullable)
- ✅ `kycExtractedName` - String? (nullable)
- ✅ `kycDocumentType` - String? (nullable)
- ✅ `kycPublicConsent` - Boolean (default: false)
- ✅ `kycVerificationNotes` - String? (nullable)
- ✅ `kycVerifiedAt` - DateTime? (nullable)
- ✅ `kycOcrVerified` - Boolean (default: false)
- ✅ `kycOibValidated` - Boolean (default: false)
- ✅ `kycObrtnRegChecked` - Boolean (default: false)
- ✅ `kycKamaraChecked` - Boolean (default: false)
- ✅ `kycViesChecked` - Boolean (default: false)

#### Email Verification (Company Domain)
- ✅ `identityEmailAddress` - String? (nullable)
- ✅ `identityEmailToken` - String? (nullable)
- ✅ `identityEmailTokenExpiresAt` - DateTime? (nullable)
- ✅ `identityEmailVerified` - Boolean (default: false)
- ✅ `identityEmailVerifiedAt` - DateTime? (nullable)

#### Director & Team Management ⚠️
- ❌ `isDirector` - Boolean (default: false) - **MISSING u bazi**
- ❌ `companyId` - String? (nullable, FK → ProviderProfile) - **MISSING u bazi**

## 🔍 Kako Provjeriti

### Opcija 1: SQL Query (Preporučeno)

Pokreni `check-all-providerprofile-fields.sql` na produkcijskoj bazi:

```sql
-- Provjeri sva polja
-- (vidi check-all-providerprofile-fields.sql)
```

### Opcija 2: Kroz ECS Task

```bash
export DATABASE_URL="postgres://uslugar_user:Pastor123@uslugar-db.cr80o0eeg3gy.eu-north-1.rds.amazonaws.com:5432/uslugar"
npx prisma migrate status
```

### Opcija 3: Prisma Studio (Lokalno)

```bash
npx prisma studio
```

## 🚀 Rješenje

### 1. Migracija Postoji

✅ `prisma/migrations/20251123000000_add_director_fields/migration.sql`

Dodaje:
- `isDirector` BOOLEAN NOT NULL DEFAULT false
- `companyId` TEXT (nullable)
- Foreign key constraint
- Indexes

### 2. Auto-Fix Funkcija

✅ `src/server.js` → `ensureDirectorFields()`

Automatski provjerava i dodaje polja pri startu servera ako nedostaju.

### 3. Deployment

Nakon deploymenta:
1. Migracija će se primijeniti (`prisma migrate deploy`)
2. Ili auto-fix će dodati polja pri startu

## 📝 Sljedeći Koraci

1. **Commitaj promjene:**
   ```bash
   git add prisma/migrations/20251123000000_add_director_fields/
   git add src/server.js
   git commit -m "fix: Add isDirector and companyId fields to ProviderProfile"
   git push origin main
   ```

2. **Provjeri nakon deploymenta:**
   - Login bi trebao raditi
   - SQL query bi trebao pokazati da polja postoje

3. **Ako i dalje ne radi:**
   - Provjeri CloudWatch logs
   - Provjeri da li je migracija primijenjena
   - Provjeri da li auto-fix radi

## 🔗 Povezani Fajlovi

- `prisma/schema.prisma` - Prisma schema definicija
- `prisma/migrations/20251123000000_add_director_fields/migration.sql` - Migracija
- `src/server.js` - Auto-fix funkcija
- `check-all-providerprofile-fields.sql` - SQL query za provjeru
- `check-schema-differences.sql` - SQL query za provjeru razlika

