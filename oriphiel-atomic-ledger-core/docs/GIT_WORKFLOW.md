# Git Workflow — oriphiel-atomic-ledger-core

## Branching model

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code deployed to Render |
| `develop` | Integration branch for features |
| `feature/*` | New ledger features (e.g. `feature/coinbase-webhooks`) |
| `fix/*` | Bug fixes (e.g. `fix/lock-timeout`) |
| `release/*` | Release preparation and hardening |

## Daily flow

1. Branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/my-change
   ```
2. Commit with conventional messages:
   - `feat: add idempotency middleware`
   - `fix: prevent negative balance on rollback`
   - `test: extend concurrent transfer coverage`
3. Open PR to `develop` — CI must pass (PHPUnit + PostgreSQL + Redis).
4. After QA on staging Render service, merge `develop` → `main`.

## Coinbase sandbox → production cutover

1. Keep `COINBASE_ENABLED=false` and `COINBASE_SANDBOX=true` in staging.
2. Validate transfers against Coinbase Developer Platform sandbox.
3. For production deploy on Render, set:
   - `COINBASE_SANDBOX=false`
   - `COINBASE_ENABLED=true`
   - Production API credentials (Render secret env vars)

## Render deployment

- Connect repository to Render and use `render.yaml` Blueprint.
- `main` auto-deploys production web service + managed PostgreSQL + Redis.
- Run migrations via `startCommand` in `render.yaml`.

## Local Docker workflow

```bash
cp .env.example .env
docker compose up -d --build
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate --seed
docker compose exec app php artisan test
```

## Concurrency test requirement

`ConcurrentTransferTest` requires Redis (`CACHE_STORE=redis`). Standard unit tests use in-memory SQLite and array cache.
