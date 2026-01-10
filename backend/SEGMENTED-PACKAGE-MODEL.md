# Segmentni model paketa (po regiji/kategoriji)

## Pregled

Segmentni model paketa omogućava definiranje različitih paketa prema regijama ili kategorijama, što omogućava fleksibilniju strukturu paketa prilagođenu specifičnim tržišnim potrebama.

## Implementacija

### 1. Database Schema

**Model: `SubscriptionPlan`**

Dodana su dva nova opcionalna polja:
- `categoryId` (String?) - Kategorija za koju je paket specifičan (null = sve kategorije)
- `region` (String?) - Regija/grad za koju je paket specifičan (null = sve regije)

**Unique Constraint:**
- Kombinacija `(name, categoryId, region)` mora biti jedinstvena
- Omogućava više paketa s istim imenom (npr. "PREMIUM") ali različitim segmentacijama

**Indeksi:**
- `categoryId` - za brže pretraživanje po kategoriji
- `region` - za brže pretraživanje po regiji
- `(categoryId, region)` - kompozitni indeks za kombinirane upite

### 2. Migracija

**File:** `prisma/migrations/20251118123434_add_segmented_package_model/migration.sql`

Migracija dodaje:
- Kolone `categoryId` i `region` u `SubscriptionPlan` tablicu
- Foreign key constraint na `Category` tablicu
- Unique constraint na kombinaciju `(name, categoryId, region)`
- Indekse za performanse

### 3. API Endpoints

**GET `/api/subscriptions/plans`**

Podržava query parametre za filtriranje:
- `?categoryId=xxx` - Filtriraj pakete po kategoriji
- `?region=Zagreb` - Filtriraj pakete po regiji
- `?categoryId=xxx&region=Zagreb` - Kombinirano filtriranje

**Primjer:**
```bash
# Svi paketi
GET /api/subscriptions/plans

# Paketi za Građevinu
GET /api/subscriptions/plans?categoryId=cat_123

# Paketi za Zagreb
GET /api/subscriptions/plans?region=Zagreb

# Paketi za Građevinu u Zagrebu
GET /api/subscriptions/plans?categoryId=cat_123&region=Zagreb
```

### 4. Seed Podaci

Seed datoteka (`prisma/seed.js`) uključuje primjere:

**Osnovni paketi (bez segmentacije):**
- BASIC (categoryId: null, region: null)
- PREMIUM (categoryId: null, region: null)
- PRO (categoryId: null, region: null)

**Segmentirani paketi (primjeri):**
- PREMIUM - Građevina Zagreb (categoryId: gradevina, region: "Zagreb")
- PRO - IT Dalmacija (categoryId: it, region: "Dalmacija")
- BASIC - Arhitekti Istra (categoryId: arhitekti, region: "Istra")

## Korištenje

### Kreiranje segmentiranog paketa

```javascript
await prisma.subscriptionPlan.create({
  data: {
    name: 'PREMIUM',
    displayName: 'Premium - Građevina Zagreb',
    price: 79,
    currency: 'EUR',
    credits: 25,
    categoryId: 'cat_gradevina',
    region: 'Zagreb',
    // ... ostala polja
  }
});
```

### Pretraživanje segmentiranih paketa

```javascript
// Paketi za specifičnu kategoriju
const plans = await prisma.subscriptionPlan.findMany({
  where: {
    categoryId: 'cat_gradevina',
    isActive: true
  },
  include: {
    category: true
  }
});

// Paketi za specifičnu regiju
const plans = await prisma.subscriptionPlan.findMany({
  where: {
    region: 'Zagreb',
    isActive: true
  }
});

// Kombinirano
const plans = await prisma.subscriptionPlan.findMany({
  where: {
    categoryId: 'cat_gradevina',
    region: 'Zagreb',
    isActive: true
  }
});
```

## Prednosti

1. **Fleksibilnost** - Različite cijene i uvjete za različite tržišne segmente
2. **Lokalizacija** - Prilagođeni paketi za specifične regije
3. **Kategorizacija** - Paketi specifični za određene kategorije usluga
4. **Skalabilnost** - Lako dodavanje novih segmentiranih paketa bez utjecaja na postojeće

## Napomene

- Osnovni paketi (bez segmentacije) imaju `categoryId: null` i `region: null`
- Segmentirani paketi mogu imati samo `categoryId`, samo `region`, ili oba
- Unique constraint osigurava da ne može postojati duplikat kombinacije `(name, categoryId, region)`
- Foreign key na `Category` osigurava referencijalnu integritet

## Primjena migracije

```bash
cd uslugar/backend
npx prisma migrate deploy
# ili
npx prisma migrate dev --name add_segmented_package_model
```

## Seed podaci

```bash
cd uslugar/backend
npx prisma db seed
```

