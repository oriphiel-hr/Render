# Add-on Paketi - Implementacija

## Pregled

Add-on paketi omogućavaju proširenje osnovnog plana novim regijama, kategorijama ili kreditima uz lifecycle management (active → low balance → expired → grace mode), omogućavajući fleksibilno širenje poslovanja bez mijenjanja osnovnog paketa.

## Implementacija

### 1. Database Schema

**Modeli:**
- `AddonSubscription` - Glavni model za add-on pakete
- `AddonUsage` - Praćenje potrošnje add-ona
- `AddonEventLog` - Povijest promjena statusa

**Enumovi:**
- `AddonType`: REGION, CATEGORY, CREDITS
- `AddonStatus`: ACTIVE, LOW_BALANCE, EXPIRED, DEPLETED, GRACE_MODE, CANCELLED

**Ključne značajke:**
- Unique constraint na `(userId, type, scope)` - jedan add-on po tipu i scope-u
- Grace period od 7 dana nakon isteka
- Auto-renew opcija
- Praćenje potrošnje s notifikacijama na 80%, 50%, 20%

### 2. Migracija

**File:** `prisma/migrations/20251118150000_add_addon_packages/migration.sql`

Migracija dodaje:
- Enumove `AddonType` i `AddonStatus`
- Tablice `AddonSubscription`, `AddonUsage`, `AddonEventLog`
- Foreign key constraints
- Indekse za performanse
- Dodaje `ADDON` u `InvoiceType` enum

### 3. API Endpoints

**GET `/api/director/addons`**
- Dohvati sve add-one korisnika
- Query params: `?status=ACTIVE&type=REGION`

**GET `/api/director/addons/available`**
- Dohvati dostupne add-one (cjenik)

**GET `/api/director/addons/:id`**
- Dohvati detalje određenog add-ona

**POST `/api/director/addons/purchase`**
- Kupi novi add-on paket
- Body: `{ type, scope, displayName, categoryId?, creditsAmount?, price, validUntil, autoRenew? }`

**POST `/api/director/addons/:id/renew`**
- Obnovi add-on paket
- Body: `{ validUntil, autoRenew? }`

**POST `/api/director/addons/:id/cancel`**
- Otkaži add-on paket
- Body: `{ reason? }`

**POST `/api/director/addons/quote`**
- Izračunava doplatu za novi add-on uzimajući u obzir već otkupljene funkcionalnosti

### 4. Lifecycle Management

**Status prijelazi:**
- `ACTIVE` → `LOW_BALANCE` (kada je potrošeno ≥80%)
- `ACTIVE` → `EXPIRED` (kada istekne validUntil)
- `ACTIVE` → `DEPLETED` (kada se potroše svi krediti - za CREDITS add-one)
- `EXPIRED` → `GRACE_MODE` (7 dana grace period)
- `GRACE_MODE` → `ACTIVE` (auto-renew ili ručna obnova)

**Cron Job:**
- Pokreće se svaki sat u `queueScheduler.js`
- Provjerava lifecycle status svih aktivnih add-ona
- Obavlja auto-renewale za add-one s `autoRenew=true`

### 5. Notifikacije

**Automatske notifikacije:**
- 80% potrošnje
- 50% potrošnje
- 20% potrošnje (preostalo)
- 3 dana prije isteka

**Notifikacije se šalju kroz `Notification` model i ne blokiraju glavne operacije.**

### 6. Integracija s postojećim sustavom

**Tracking potrošnje:**
- `trackCreditsConsumption()` - poziva se iz `lead-service.js` kada se troše krediti
- `trackLeadReceived()` - poziva se kada se primi lead za regiju/kategoriju

**CREDITS add-one:**
- Krediti se automatski dodaju u `Subscription.creditsBalance` pri kupnji/obnovi
- Potrošnja se prati kroz `AddonUsage`

**REGION/CATEGORY add-one:**
- Praćenje broja primljenih leadova kroz `AddonUsage.leadsReceived`

## Korištenje

### Primjer: Kupnja REGION add-ona

```javascript
POST /api/director/addons/purchase
{
  "type": "REGION",
  "scope": "Dalmacija",
  "displayName": "Dalmacija Add-on",
  "price": 29.99,
  "validUntil": "2025-12-18T00:00:00Z",
  "autoRenew": true
}
```

### Primjer: Kupnja CATEGORY add-ona

```javascript
POST /api/director/addons/purchase
{
  "type": "CATEGORY",
  "scope": "cat_gradevina",
  "displayName": "Građevina Add-on",
  "categoryId": "cat_gradevina",
  "price": 39.99,
  "validUntil": "2025-12-18T00:00:00Z",
  "autoRenew": false
}
```

### Primjer: Kupnja CREDITS add-ona

```javascript
POST /api/director/addons/purchase
{
  "type": "CREDITS",
  "scope": "50",
  "displayName": "50 Extra Credits",
  "creditsAmount": 50,
  "price": 49.50,
  "validUntil": "2025-12-18T00:00:00Z",
  "autoRenew": false
}
```

## Prednosti

1. **Fleksibilnost** - Proširenje bez mijenjanja osnovnog paketa
2. **Lifecycle Management** - Automatsko praćenje statusa i isteka
3. **Grace Period** - 7 dana za obnovu nakon isteka
4. **Auto-renew** - Automatska obnova za kontinuitet
5. **Notifikacije** - Upozorenja pri kritičnim razinama potrošnje
6. **Tracking** - Detaljno praćenje potrošnje i ROI

## Primjena migracije

```bash
cd uslugar/backend
npx prisma migrate deploy
# ili
npx prisma migrate dev --name add_addon_packages
```

## Status

✅ **Implementirano:**
- Database schema i migracija
- API endpoints
- Lifecycle management
- Auto-renew funkcionalnost
- Grace period (7 dana)
- Notifikacije (80%, 50%, 20%, isteak)
- Integracija s lead-service za tracking potrošnje
- Cron job za automatsko upravljanje

