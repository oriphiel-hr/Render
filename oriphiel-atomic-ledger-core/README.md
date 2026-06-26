# oriphiel-atomic-ledger-core

Robustna Laravel 11 simulacija kripto mjenjačnice fokusirana na **Balance Synchronization Issue** — sprječavanje race conditiona i double spendinga uz distribuirano zaključavanje (Redis) i PostgreSQL row-level locking.

## Stack

- PHP 8.3
- Laravel 11
- PostgreSQL 16
- Redis 7
- Docker / Render
- Binance Spot Testnet bridge (`EXCHANGE_MODE=testnet`)

## Brzi start (Docker)

```bash
cp .env.example .env
docker compose up -d --build
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate --seed
```

## Demo login

| Account | Email | Password | Role |
|---------|-------|----------|------|
| Alice | alice@demo.local | password | user |
| Bob | bob@demo.local | password | user |
| Charlie | charlie@demo.local | password | user |
| Admin | admin@demo.local | password | admin |

Dashboard: `GET /` → login → wallets, deposit, withdraw, trade, transfer, admin reconciliation.

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@demo.local","password":"password"}'
```

## API (authenticated)

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/wallets
curl -X POST -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/deposits \
  -H "Content-Type: application/json" -d '{"asset":"USDT","amount":"10"}'
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/admin/reconciliation
php artisan ledger:reconcile
```

Legacy transfer (requires Sanctum token):

```bash
curl -X POST http://localhost:8000/api/transfers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sender_id":1,"receiver_id":2,"amount":"10.5","asset":"USDT"}'
```

Status:

```bash
curl http://localhost:8000/api/status
```

## Testiranje

```bash
# Standardni testovi (SQLite in-memory)
docker compose exec app php artisan test --exclude-group=concurrency

# Concurrency test (zahtijeva Redis)
docker compose exec app php artisan test --filter=ConcurrentTransferTest
```

## Binance testnet → produkcija

| Env var | Staging | Production |
|---------|---------|------------|
| `EXCHANGE_ENABLED` | `false` / `true` | `true` |
| `EXCHANGE_MODE` | `testnet` | `production` |
| `BINANCE_API_KEY` | testnet key | production key |
| `BINANCE_API_SECRET` | testnet secret | production secret |

Ključevi: [testnet.binance.vision](https://testnet.binance.vision) (login preko GitHuba).

## Render deploy

Koristi `render.yaml` Blueprint. Postavi secret env varijable u Render dashboardu prije cutovera na produkciju.

## Git workflow

Vidi [docs/GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md).

## Arhitektura

```
Request → TransferFundsRequest → TransferController
       → BalanceService
            1. Redis Cache::lock (distributed mutex)
            2. DB::transaction
            3. lockForUpdate() na users redovima (deadlock-safe sort)
            4. BCMath provjera i update balansa
            5. Transaction + AuditLog
            6. ExchangeLedgerBridge (opcionalno — Binance)
```

## Production-ready obrazloženje

### Zašto je ova arhitektura spremna za fintech

1. **Dvoslojno zaključavanje** — Redis `Cache::lock` koordinira više aplikacijskih instanci (horizontalno skaliranje na Renderu), dok PostgreSQL `SELECT ... FOR UPDATE` garantira atomičnost na razini reda čak i ako Redis padne tijekom kritične sekcije.
2. **BCMath + DECIMAL(24,8)** — nema IEEE-754 grešaka zaokruživanja; svaki iznos je string s fiksnom preciznošću od 8 decimala.
3. **ACID transakcije** — cijeli debit/kredit je jedna DB transakcija; rollback vraća konzistentno stanje.
4. **Idempotency key** — sprječava duplikate pri mrežnim retryjima.
5. **Audit trail** — `audit_logs` + `ledger` log kanal za regulatornu sljedivost.
6. **Eksplicitne domenske iznimke** — `InsufficientFundsException` s strukturiranim API odgovorom.

### Zašto PostgreSQL > MySQL za financijske transakcije

| Kriterij | PostgreSQL | MySQL (InnoDB) |
|----------|------------|----------------|
| **ACID** | Strogi MVCC model; čitaoci ne blokiraju pisce u tipičnom workloadu | ACID pod InnoDB, ali ponašanje ovisi o isolation levelu i gap locks |
| **MVCC** | Snapshot isolation po dizajnu; manje surprise lock contention | Row locks + gap locks mogu uzrokovati neočekivane blokade |
| **Tipovi** | `NUMERIC/DECIMAL` bez silent truncation; bogat tip sustav | `DECIMAL` podržan, ali povijesno više edge-caseova s implicitnim castovima |
| **Preciznost** | Arbitrary precision numerics native | DECIMAL podržan, ali manje konzistentan ekosustav za kompleksne financijske upite |
| **Serializable** | Prava SSI (Serializable Snapshot Isolation) | Serializable implementacija različita, često skuplja |

Za ledger sustav gdje je **točnost balansa nepregovarajuća**, PostgreSQL kombinacija `DECIMAL(24,8)`, row-level `FOR UPDATE` i MVCC-a daje predvidljivo ponašanje pod konkurentnim opterećenjem — upravo scenarij koji `ConcurrentTransferTest` dokazuje.
