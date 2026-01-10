# Prisma Seed Fix - ESM/CommonJS Problem

## Problem

Prisma seed fajlovi koriste ESM sintaksu (`import { PrismaClient } from '@prisma/client'`), ali Prisma Client nije generiran u Docker image-u, što uzrokuje grešku:

```
SyntaxError: Named export 'PrismaClient' not found. The requested module '@prisma/client' is a CommonJS module
```

## Uzrok

Prisma Client nije generiran u Docker image-u zbog:
1. Prisma CDN problema (500 greške)
2. Dockerfile.prisma ne generira Prisma Client uspješno
3. Prisma Client nije kopiran u finalni image

## Rješenje

### Opcija 1: Generiraj Prisma Client lokalno prije build-a (Preporučeno)

```bash
cd uslugar/backend

# 1. Generiraj Prisma Client lokalno
npx prisma generate

# 2. Build Docker image (automatski će koristiti lokalni Prisma Client)
docker build -f Dockerfile.prisma .
```

Dockerfile.prisma automatski detektira lokalno generirani Prisma Client i koristi ga.

### Opcija 2: Osiguraj da se Prisma Client generira u Docker image-u

Dockerfile.prisma već ima retry logiku (5 pokušaja) za generiranje Prisma Client-a s CDN-a. Ako CDN ne radi, build će propasti s jasnom porukom.

### Opcija 3: Promijeni import sintaksu u seed fajlovima (Fallback)

Ako Prisma Client ne može biti generiran kao ESM modul, možemo promijeniti import sintaksu:

```javascript
// Umjesto:
import { PrismaClient } from '@prisma/client';

// Koristi:
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
```

**Napomena:** Ovo nije preporučeno jer Prisma Client bi trebao raditi s ESM sintaksom.

## Provjera

Nakon build-a, provjeri da li je Prisma Client generiran:

```bash
docker run --rm <image-id> ls -la node_modules/@prisma/client/
```

Trebao bi vidjeti `index.js` i druge fajlove.

## Troubleshooting

**Problem:** `Prisma Client not found in cache`

**Rješenje:**
- Provjeri da je `npx prisma generate` uspješno završio lokalno
- Provjeri da postoje `node_modules/.prisma` i `node_modules/@prisma/client` direktoriji
- Provjeri `.dockerignore` da ne blokira kopiranje Prisma Client-a

**Problem:** `Prisma CDN appears to be down`

**Rješenje:**
- Generiraj Prisma Client lokalno prije build-a
- Provjeri Prisma status: https://www.prisma.io/status
- Pričekaj da Prisma CDN bude dostupan

## Best Practices

1. **Uvijek generiraj Prisma Client lokalno prije build-a** ako Prisma CDN ima probleme
2. **Provjeri da je Prisma Client generiran** prije pokretanja seed komandi
3. **Koristi CI/CD cache** za Prisma Client da se ne generira svaki put

