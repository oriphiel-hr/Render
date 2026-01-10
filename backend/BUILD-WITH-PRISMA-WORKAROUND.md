# Workaround za Prisma CDN Problem

Ako Prisma CDN vraća 500 greške tijekom Docker build-a, koristite ovaj workaround:

## ✅ Preporučeno rješenje: Generiraj Prisma Client lokalno

Dockerfile automatski detektira lokalno generirani Prisma Client i koristi ga umjesto pokušaja preuzimanja s CDN-a.

```bash
cd uslugar/backend

# 1. Generiraj Prisma Client lokalno (koristi lokalni cache)
npx prisma generate

# 2. Zatim pokreni Docker build (automatski će koristiti lokalni Prisma Client)
docker build -f Dockerfile.prisma .
```

**Kako funkcionira:**
- Dockerfile provjerava postoji li `node_modules/.prisma` i `node_modules/@prisma/client`
- Ako postoje, preskače `prisma generate` i koristi lokalno generirani client
- Ako ne postoje, pokušava generirati s CDN-a (s retry logikom)

## Alternativne opcije

### Opcija 2: Pričekaj da Prisma CDN bude dostupan

Prisma CDN problemi su obično privremeni. Pokušajte ponovno za nekoliko sati.

Provjerite Prisma status na: https://www.prisma.io/status

### Opcija 3: Koristi alternativni mirror (ako postoji)

```bash
export PRISMA_ENGINES_MIRROR=https://alternative-mirror.com
docker build -f Dockerfile.prisma .
```

## Troubleshooting

**Problem:** `Error: Failed to fetch the engine file - 500 Internal Server Error`

**Rješenje:**
1. Generiraj Prisma Client lokalno: `npx prisma generate`
2. Pokreni Docker build: `docker build -f Dockerfile.prisma .`
3. Dockerfile će automatski koristiti lokalno generirani client

**Problem:** `Prisma Client not found in cache`

**Rješenje:**
- Provjeri da je `npx prisma generate` uspješno završio
- Provjeri da postoje `node_modules/.prisma` i `node_modules/@prisma/client` direktoriji
- Pokreni `npm install` ako nedostaju dependencies

