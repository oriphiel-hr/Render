# Deploy na Render (Docker + PostgreSQL + Redis)

Portfolio setup — 3 resursa na listi projekata: **Web**, **PostgreSQL**, **Redis**.

## Opcija A — Blueprint (najbrže)

1. Pushaj zadnje promjene na `main` (uključujući `render.yaml`).
2. [dashboard.render.com](https://dashboard.render.com) → **New → Blueprint**
3. Repo: `oriphiel-hr/Render`
4. **Blueprint file path:** `oriphiel-atomic-ledger-core/render.yaml`
5. **Apply**

Blueprint automatski kreira:

| Resurs | Tip |
|--------|-----|
| `oriphiel-atomic-ledger` | Web (Docker) |
| `oriphiel-postgres` | PostgreSQL |
| `oriphiel-redis` | Key Value (Redis) |

Env varijable za DB i Redis se povežu same (`fromDatabase` / `fromService`).

### Nakon deploya

```bash
curl https://oriphiel-atomic-ledger.onrender.com/up
curl https://oriphiel-atomic-ledger.onrender.com/api/status
```

Seeder kreira Alice (id=1), Bob (id=2), Charlie (id=3) s početnim balansom.

```bash
curl -X POST https://oriphiel-atomic-ledger.onrender.com/api/transfers \
  -H "Content-Type: application/json" \
  -d '{"sender_id":1,"receiver_id":2,"amount":"10"}'
```

---

## Opcija B — Ručno (3 koraka)

### 1. PostgreSQL

**New → PostgreSQL**

- Name: `oriphiel-postgres`
- Database: `oriphiel_ledger`
- User: `oriphiel`
- Region: Frankfurt

### 2. Redis

**New → Key Value**

- Name: `oriphiel-redis`
- Region: Frankfurt

### 3. Web (Docker)

**New → Web Service**

| Polje | Vrijednost |
|-------|------------|
| Name | `oriphiel-atomic-ledger` |
| Runtime | **Docker** |
| Root Directory | `oriphiel-atomic-ledger-core` |
| Dockerfile | `./Dockerfile` |
| Health Check | `/up` |

**Start Command:**
```bash
php artisan migrate --force && php artisan db:seed --force && php artisan serve --host=0.0.0.0 --port=$PORT
```

**Environment** (DB/Redis vrijednosti kopiraj iz dashboarda svakog servisa):

```
APP_ENV=production
APP_DEBUG=false
APP_KEY=<generiraj: php artisan key:generate --show>
LOG_CHANNEL=stderr

DB_CONNECTION=pgsql
DB_HOST=<Internal Hostname iz Postgres>
DB_PORT=5432
DB_DATABASE=oriphiel_ledger
DB_USERNAME=oriphiel
DB_PASSWORD=<secret>

CACHE_STORE=redis
QUEUE_CONNECTION=redis
REDIS_HOST=<Internal Hostname iz Redis>
REDIS_PORT=6379

COINBASE_ENABLED=false
COINBASE_SANDBOX=true
```

Koristi **Internal** hostname (npr. `dpg-xxxxx-a.frankfurt-postgres.render.com`), ne External.

---

## Za CV / intervjue

```
Stack: Laravel 11 · PHP 8.3 · PostgreSQL · Redis · Docker · Render
Demo:  https://oriphiel-atomic-ledger.onrender.com/api/status
Code:  github.com/oriphiel-hr/Render/tree/main/oriphiel-atomic-ledger-core
```

Naglasak za posao:
- Redis `Cache::lock` — distribuirano zaključavanje
- PostgreSQL `lockForUpdate()` — row-level safety
- BCMath — bez float grešaka
- `ConcurrentTransferTest` — dokaz protiv double spendinga

---

## Free tier napomene

- Web servis “spava” nakon neaktivnosti (~50 s wake-up).
- Free Postgres traje 90 dana, zatim treba upgrade ili novi export.
- Za stalni portfolio razmisli o **Starter** planu (~7 USD/mj. po servisu).

---

## Troubleshooting

| Problem | Rješenje |
|---------|----------|
| Dockerfile not found | Root Directory = `oriphiel-atomic-ledger-core` |
| DB connection error | Internal hostname, ne `localhost` |
| Redis lock fail | `CACHE_STORE=redis` + ispravan `REDIS_HOST` |
| Prazni useri | Ponovi deploy (seed u `startCommand`) |
