# Render deploy — isti account kao Uslugar

Projekt **nije** zaseban GitHub/Render account. Koristi **isti** setup kao `Uslugar/` i `uslugar-webhooks/`:

| Što | Vrijednost |
|-----|------------|
| GitHub repo | `oriphiel-hr/Render` (monorepo) |
| Render account | `mario.vitt@oriphiel.hr` (email login, **ne** novi GitHub signup) |
| Postojeći primjer | `uslugar-backend.onrender.com` |
| Novi servis | `oriphiel-atomic-ledger.onrender.com` |
| Root Directory | `oriphiel-atomic-ledger-core` |

## Prijava na Render (važno)

1. [dashboard.render.com/login](https://dashboard.render.com/login)
2. **Email + lozinka** → `mario.vitt@oriphiel.hr`
3. **Ne** klikaj GitHub ako traži „Create account“ — to je novi user, ne tvoj postojeći account

Kad si unutra, trebao bi vidjeti postojeće Uslugar servise. Novi servis dodaješ u **isti** dashboard.

## Novi Web Service (kao Uslugar)

**New → Web Service** → repo `oriphiel-hr/Render`:

| Polje | Vrijednost |
|-------|------------|
| Name | `oriphiel-atomic-ledger` |
| Root Directory | `oriphiel-atomic-ledger-core` |
| Runtime | **Docker** |
| Branch | `main` |
| Auto-Deploy | Yes |
| **Docker Command** | **prazno** (koristi CMD iz Dockerfile) |

> Za Docker na Renderu **nema** polja Start Command — samo **Docker Command**.  
> Možeš ga ostaviti praznim: `Dockerfile` pokreće `docker/render-entrypoint.sh` (migrate + seed + serve na `$PORT`).

Ručno u **Docker Command** (ako ne želiš prazno):
```bash
sh -c "php artisan migrate --force && php artisan db:seed --force && php artisan serve --host=0.0.0.0 --port=$PORT"
```

**Start Command** (zastarjelo za Docker — ne traži ga):

**Environment** (Postgres koji si već kreirao):
```
APP_ENV=production
APP_DEBUG=false
APP_KEY=<php artisan key:generate --show>
LOG_CHANNEL=stderr

DB_CONNECTION=pgsql
DB_HOST=dpg-d8v6s7ernols7380s2rg-a
DB_PORT=5432
DB_DATABASE=oriphiel_atomic_ledger_core_db
DB_USERNAME=oriphiel_atomic_ledger_core_db_user
DB_PASSWORD=<iz Render Postgres → Connections>

CACHE_STORE=database
QUEUE_CONNECTION=database
COINBASE_ENABLED=false
COINBASE_SANDBOX=true
```

Ili jedna varijabla (Laravel čita `DB_URL`):
```
DB_URL=<cijeli postgresql://... connection string>
```

## GitHub Actions (root `.github/workflows/`)

U monorepu workflowi **moraju** biti u rootu, ne u podprojektu:

| Workflow | Svrha |
|----------|--------|
| `oriphiel-atomic-ledger-core-ci.yml` | PHPUnit na push |
| `oriphiel-atomic-ledger-core-migrate.yml` | Migracije na Render bazu |

### GitHub Secret (opcionalno, za CI migracije)

**Settings → Secrets → Actions → New secret**

- Name: `ORIPHIEL_LEDGER_DATABASE_URL`
- Value: `postgresql://...` (isti string kao u Render Postgres)

> Uslugar koristi `DATABASE_URL` za svoj backend — za ledger koristi **zaseban** secret da se ne miješaju baze.

## Render deploy flow (isto kao Uslugar)

```
git push main → Render auto-deploy (ako je servis povezan na repo)
             → startCommand: migrate + serve
```

Nema posebnog „Render API“ u repou — deploy ide preko **povezanog repozitorija** u dashboardu.

## Provjera

```bash
curl https://oriphiel-atomic-ledger.onrender.com/up
curl https://oriphiel-atomic-ledger.onrender.com/api/status
```

Baza je već migrirana i seedana (3 korisnika).

## Troubleshooting: `php: command not found`

Ako log izgleda ovako:
```
Using Node.js version ...
Running build command 'npm install'...
php: command not found
```

**Uzrok:** servis je **Node**, ne **Docker**. PHP postoji samo u `Dockerfile`.

**Popravak** → servis → **Settings**:

1. **Root Directory:** `oriphiel-atomic-ledger-core`
2. **Runtime:** **Docker** (ne Node)
3. **Dockerfile Path:** `./Dockerfile`
4. **Build Command:** prazno (obriši `npm install`)
5. **Start Command:**
   ```bash
   php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT
   ```
6. **Manual Deploy**

Ako ne možeš promijeniti Node → Docker, obriši servis i kreiraj novi s **Runtime: Docker**.
