# uslugar-webhooks

Zasebni **Node + Express + PostgreSQL** servis za **više kanala** (Meta/Facebook/Messenger danas; Instagram, WhatsApp, generički ingest, … preko istog modela). Uključuje:

- **Meta** — `GET`/`POST /webhook` (verifikacija + spremanje u bazu); opcionalno **više Meta aplikacija** na istom servisu preko `META_WEBHOOK_PROFILES`, npr. `GET`/`POST /webhook/instant-game`.
- **Ostali kanali** — `POST /api/v1/messages` s API ključem (isti univerzalni model poruke).
- **Promptovi u bazi** — `PromptTemplate` + `GET /api/v1/prompts/active/:slug`.

## Struktura

| Put | Opis |
|-----|------|
| `GET /health` | Health check (`databaseUrlDefault`, `profileDatabases` po profilima) |
| `GET /webhook` | Meta verify (`hub.verify_token` = `VERIFY_TOKEN`) |
| `POST /webhook` | Meta događaji → `ChannelMessage` |
| `GET/POST /webhook/<profil>` | Druga Meta aplikacija na istom Renderu — vidi **Više Meta aplikacija** |
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

### Više Meta aplikacija na jednom Renderu

1. U env postavi **comma-separated** listu profila (slug u URL-u), npr.  
   `META_WEBHOOK_PROFILES=instant-game,druga-app`

2. Za profil `instant-game` (crtice → underscore u imenu varijable) postavi:  
   **`META_INSTANT_GAME_VERIFY_TOKEN`** i **`META_INSTANT_GAME_APP_SECRET`**  
   (isti verify token i App Secret kao u Meta konzoli za Callback URL koji pokazuje na taj put).

3. Opcionalno **`META_INSTANT_GAME_DATABASE_URL`** — PostgreSQL samo za poruke koje dolaze na `/webhook/instant-game`. Ako ga izostaviš, koristi se **`DATABASE_URL`**. Ista Prisma shema mora postojati na svakoj bazi (isti `migrate deploy`).

4. **Callback URL** u Meta Developer konzoli za tu aplikaciju:  
   `https://<host>/webhook/instant-game`

Zadani **`VERIFY_TOKEN`** / **`FACEBOOK_APP_SECRET`** i dalje vrijede za **`/webhook`** (kompatibilnost sa starim deployem).

## Render

- `render.yaml` — Web servis + PostgreSQL. U dashboardu dodaj `VERIFY_TOKEN`, `FACEBOOK_APP_SECRET`, `INGEST_API_KEY`.
- Ako je Git **monorepo** (root = `Render`), u Render UI postavi **Root Directory** na `uslugar-webhooks` ili prilagodi blueprint `rootDir`.

### IP whitelist (Render → vanjski sustav)

Za scenarij gdje **tvoj kod na Renderu zove vanjski API**, a on traži **source IP allowlist**, koristi raspone iz **`render-network.txt`** (copy-paste u firewall).

- **Dolazni Meta webhook** na tvoj URL ne dolazi s ovih adresa — Meta koristi vlastite rasponse; integritet provjeravaj **`FACEBOOK_APP_SECRET`** / `X-Hub-Signature-256`.
- Datoteka je referenca koja se može proširiti ili zamijeniti službenim outbound rasponima iz Render dashboarda za tvoj region/plan.

Jednokratno nakon prvog deploya:

```bash
npx prisma db seed
```

## GitHub Actions

- **`.github/workflows/uslugar-webhooks-ci.yml`** (u rootu repoa `Render/`) — validacija sheme, `prisma generate`, syntax check kad se mijenja `uslugar-webhooks/**`.
- **`.github/workflows/uslugar-webhooks-migrate.yml`** — **`npx prisma migrate deploy`** na bazu čiji URL držiš u secretu:
  - **Settings → Secrets and variables → Actions → New repository secret**
  - Ime: **`USLUGAR_WEBHOOKS_DATABASE_URL`**
  - Vrijednost: isti string kao **`DATABASE_URL`** na Renderu (External Database URL za PostgreSQL).
  - Workflow se pokreće na **push** u `main`/`master` kad se mijenja `uslugar-webhooks/prisma/**`, ili ručno (**Actions → uslugar-webhooks Prisma migrate → Run workflow**).

Migracije su idempotentne: možeš ih ostaviti i u Render **build** naredbi (`render.yaml`); ako želiš samo GitHub, ukloni `prisma migrate deploy` iz Render builda da ne dupliraš korak.

## Migracija sa starog naziva mape

Ako još postoji mapa `uslugar-facebook-webhooks`, nakon zatvaranja procesa koji je drže otvorenom **obriši je** i koristi samo **`uslugar-webhooks`** (ovaj projekt je kopija s ažuriranim imenima).

## Model podataka

- **`ChannelMessage`** — `channel` enum (`MESSENGER`, `INSTAGRAM`, `WHATSAPP`, `FACEBOOK_PAGE_FEED`, `GENERIC`), `rawPayload`, deduplikacija `(channel, externalMessageId)`.
- **`PromptTemplate`** — verzionirani promptovi, aktivacija po `slug` / kanalu.

Interni moduli `facebookWebhook.js` i `ingest/facebook.js` i dalje su specifični za Meta — dodavanje drugog kanala = novi ingest + po želji nova ruta, isti `storeMessages`.
