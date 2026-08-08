# Ravnopar Frontend (Next.js)

SEO-friendly App Router verzija. Stari Vite SPA ostaje u `../frontend`.

## API URL

Postavi u `.env.local` (ili Vercel env):

```
NEXT_PUBLIC_API_BASE_URL=https://ravnopar-backend.onrender.com/api
NEXT_PUBLIC_SITE_URL=https://ravnopar.oriph.io
```

Kod: `src/lib/env.js`

## Pokretanje lokalno

```bash
cd frontend-next
cp .env.example .env.local
npm install
npm run dev
```

Otvori http://localhost:3000 → redirect na `/hr`.

## Build

```bash
npm run build
npm start
```

## Deploy (Vercel)

1. Importaj repo na [vercel.com](https://vercel.com)
2. Root Directory: `ravnopar/frontend-next`
3. Framework: Next.js
4. Env variables:
   - `NEXT_PUBLIC_API_BASE_URL` = `https://ravnopar-backend.onrender.com/api`
   - `NEXT_PUBLIC_SITE_URL` = `https://ravnopar.oriph.io`
   - ostale `NEXT_PUBLIC_*` po `.env.example`
5. Deploy

CLI:

```bash
npx vercel --cwd ravnopar/frontend-next
```

## Rute (SSR / SEO)

| URL | Stranica |
|-----|----------|
| `/[locale]` | Home + `getPublicStats` (server) |
| `/[locale]/planovi` | Planovi |
| `/[locale]/kako-radi-feed` | Fair feed |
| `/[locale]/fer-izvjestaj` | Fairness report (server fetch) |
| `/[locale]/doniraj` | Donacije (server impact) |
| `/[locale]/pomoc` | FAQ |
| `/[locale]/pravila` | Pravila |
| `/[locale]/privatnost` | Privatnost |
| `/[locale]/uvjeti` | Uvjeti |
| `/[locale]/kontakt` | Kontakt |

Privatne (noindex): `/auth`, `/app/*`, `/admin`

Sitemap: `/sitemap.xml` · Robots: `/robots.txt`
