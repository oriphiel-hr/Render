# uslugar-webhooks

Zasebni **Node + Express + PostgreSQL** servis za **više kanala** (Meta/Facebook/Messenger danas; Instagram, WhatsApp, generički ingest, … preko istog modela). Uključuje:

- **Meta** — `GET`/`POST /webhook` (verifikacija + spremanje u bazu).
- **Ostali kanali** — `POST /api/v1/messages` s API ključem (isti univerzalni model poruke).
- **Promptovi u bazi** — `PromptTemplate` + `GET /api/v1/prompts/active/:slug`.

## Struktura

| Put | Opis |
|-----|------|
| `GET /health` | Health check |
| `GET /webhook` | Meta verify (`hub.verify_token` = `VERIFY_TOKEN`) |
| `POST /webhook` | Meta događaji → `ChannelMessage` |
| `POST /api/v1/messages` | Univerzalni unos; header `X-Ingest-Key: $INGEST_API_KEY` |
| `GET /api/v1/prompts/active/:slug` | Aktivan prompt; opcija `?channel=MESSENGER` |

## Lokalno

```bash
cd uslugar-webhooks
cp .env.example .env
# U .env: DATABASE_URL, VERIFY_TOKEN, INGEST_API_KEY, …
npm install
npm run prisma:validate
npx prisma migrate deploy
npm run db:seed
npm start
```

## Render

- `render.yaml` — Web servis + PostgreSQL. U dashboardu dodaj `VERIFY_TOKEN`, `FACEBOOK_APP_SECRET`, `INGEST_API_KEY`.
- Ako je Git **monorepo** (root = `Render`), u Render UI postavi **Root Directory** na `uslugar-webhooks` ili prilagodi blueprint `rootDir`.

Jednokratno nakon prvog deploya:

```bash
npx prisma db seed
```

## GitHub Actions

`.github/workflows/ci.yml` — validacija + generate + syntax check.  
Za CI, Git root treba uključivati ovaj folder (ili prilagodi workflow za monorepo).

## Migracija sa starog naziva mape

Ako još postoji mapa `uslugar-facebook-webhooks`, nakon zatvaranja procesa koji je drže otvorenom **obriši je** i koristi samo **`uslugar-webhooks`** (ovaj projekt je kopija s ažuriranim imenima).

## Model podataka

- **`ChannelMessage`** — `channel` enum (`MESSENGER`, `INSTAGRAM`, `WHATSAPP`, `FACEBOOK_PAGE_FEED`, `GENERIC`), `rawPayload`, deduplikacija `(channel, externalMessageId)`.
- **`PromptTemplate`** — verzionirani promptovi, aktivacija po `slug` / kanalu.

Interni moduli `facebookWebhook.js` i `ingest/facebook.js` i dalje su specifični za Meta — dodavanje drugog kanala = novi ingest + po želji nova ruta, isti `storeMessages`.
