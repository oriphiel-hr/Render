# Fairness & Safety Operations

## Fairness policy

- Nema skrivenog smanjenja dosega (`noReachThrottling`).
- Koristi se fairness rangiranje kako bi korisnici bez kontakta dobili priliku.
- Aktivni parovi su privremeno izvan glavnog feeda dok traje fokusirani kontakt.

## Audit sustav

Append-only zapisi u `AuditEvent` i `ModerationDecision` (migracija `20260628220000_audit_system`).

### Kategorije

| Kategorija | Što se bilježi |
|------------|----------------|
| `ADMIN_ACTION` | suspend, brisanje, paket, uloga, verifikacija |
| `MODERATION` | rješavanje prijava s odlukom i akcijom |
| `SECURITY` | blok, prijava profila |
| `FEED_RANKING` | snapshot rangiranja pri učitavanju feeda |
| `COMPLIANCE` | GDPR export, brisanje računa, admin pretraga |

### API (admin)

- `GET /api/admin/audit/events?category=&limit=`
- `GET /api/admin/audit/moderation-decisions`
- `GET /api/admin/audit/fairness`
- `GET /api/admin/audit/feed-explain?viewerId=`
- `GET /api/admin/audit/retention-policy`
- `POST /api/admin/audit/resolve-report` — `{ reportId, outcome, actionTaken, notes }`

### Feed rangiranje

Paket (`planTier`) **ne daje bodove**. Bodovi: fer boost za korisnike bez dolaznih zahtjeva, potpunost profila, verifikacija.

Zadržavanje: `AUDIT_RETENTION_DAYS` (default 365).

## Fairness changelog

- Admin mijenja `dailyContactLimit` kroz endpoint:
  - `POST /api/matchmaking/admin/fairness-config`
- Svaka promjena se zapisuje u `FairnessConfigChange`:
  - stara vrijednost
  - nova vrijednost
  - razlog promjene
  - tko je promijenio

## Moderation queue

- Korisnici prijavljuju profile kroz `POST /api/matchmaking/report`.
- Prijave se prikazuju u:
  - `GET /api/matchmaking/admin/moderation-queue`
- Admin obrađuje prijave kroz:
  - `PATCH /api/matchmaking/admin/reports/:reportId`

## User controls

- `POST /api/matchmaking/block` - blokada korisnika
- `POST /api/matchmaking/rate` - ocjenjivanje iskustva
- Blokirani korisnici ne ulaze u međusobni feed.

## Payments

- Stripe checkout: `POST /api/payments/checkout/stripe`
- Alternativa (bank transfer): `POST /api/payments/checkout/bank-transfer`
- Pregled uplata: `GET /api/payments/my-orders`
