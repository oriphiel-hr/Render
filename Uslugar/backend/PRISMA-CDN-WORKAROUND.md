# Prisma CDN Workaround - Vodič

## Problem

Prisma CDN (`binaries.prisma.sh`) ponekad vraća 500 greške tijekom Docker build-a, što onemogućava generiranje Prisma Client-a.

## ✅ Rješenje: Lokalno generiranje Prisma Client-a

Oba Dockerfile-a (`Dockerfile.prisma` i `Dockerfile.prod`) automatski detektiraju lokalno generirani Prisma Client i koriste ga umjesto pokušaja preuzimanja s CDN-a.

### Koraci

1. **Generiraj Prisma Client lokalno:**
   ```bash
   cd uslugar/backend
   npx prisma generate
   ```

2. **Pokreni Docker build:**
   ```bash
   # Za Prisma tasks image
   docker build -f Dockerfile.prisma .
   
   # Za production image
   docker build -f Dockerfile.prod .
   ```

Dockerfile će automatski:
- Detektirati lokalno generirani Prisma Client
- Preskočiti `prisma generate` (CDN poziv)
- Koristiti lokalni cache

## Kako funkcionira

### Dockerfile.prisma
1. Kopira `node_modules/.prisma*` i `node_modules/@prisma*` ako postoje
2. Provjerava postoji li Prisma Client u cache-u
3. Ako postoji → koristi ga (preskače CDN)
4. Ako ne postoji → pokušava generirati s CDN-a (s retry logikom)

### Dockerfile.prod
1. Kopira `node_modules/.prisma*` i `node_modules/@prisma*` ako postoje
2. Provjerava postoji li Prisma Client u cache-u
3. Ako postoji → koristi ga (preskače CDN)
4. Ako ne postoji → pokušava generirati s CDN-a (s retry logikom)

## .dockerignore konfiguracija

`.dockerignore` je ažuriran da dozvoli kopiranje Prisma Client direktorija:
```
node_modules/
!node_modules/.prisma/
!node_modules/.prisma/**
!node_modules/@prisma/
!node_modules/@prisma/**
```

Ovo omogućava da se `node_modules/` ignorira, ali Prisma Client direktoriji se kopiraju.

## Alternativne opcije

### Opcija 1: Pričekaj da Prisma CDN bude dostupan
Provjerite Prisma status: https://www.prisma.io/status

### Opcija 2: Koristi alternativni mirror (ako postoji)
```bash
export PRISMA_ENGINES_MIRROR=https://alternative-mirror.com
docker build -f Dockerfile.prod .
```

## Troubleshooting

**Problem:** `Error: Failed to fetch the engine file - 500 Internal Server Error`

**Rješenje:**
1. Generiraj Prisma Client lokalno: `npx prisma generate`
2. Pokreni Docker build: `docker build -f Dockerfile.prod .`
3. Dockerfile će automatski koristiti lokalno generirani client

**Problem:** `Prisma Client not found in cache`

**Rješenje:**
- Provjeri da je `npx prisma generate` uspješno završio
- Provjeri da postoje `node_modules/.prisma` i `node_modules/@prisma/client` direktoriji
- Pokreni `npm install` ako nedostaju dependencies

**Problem:** `.dockerignore` blokira kopiranje Prisma Client-a

**Rješenje:**
- Provjeri da `.dockerignore` sadrži `!node_modules/.prisma/` i `!node_modules/@prisma/` pravila
- Ako ne radi, privremeno ukloni `node_modules/` iz `.dockerignore` (ne preporučuje se za production)

## Best Practices

1. **Uvijek generiraj Prisma Client lokalno prije build-a** ako Prisma CDN ima probleme
2. **Commit-aj `node_modules/.prisma` i `node_modules/@prisma`** u git samo ako je potrebno (obično se ignorišu)
3. **Koristi CI/CD cache** za Prisma Client da se ne generira svaki put
4. **Provjeri Prisma status** prije build-a ako ima problema

## CI/CD Integracija

Za CI/CD pipeline, dodaj korak za generiranje Prisma Client-a:

```yaml
# GitHub Actions primjer
- name: Generate Prisma Client
  run: |
    cd uslugar/backend
    npx prisma generate
    
- name: Build Docker image
  run: |
    docker build -f uslugar/backend/Dockerfile.prod .
```

Ovo osigurava da Prisma Client bude dostupan prije Docker build-a.

