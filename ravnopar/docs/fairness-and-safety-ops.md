# Fairness & Safety Operations

## Fairness policy

- Nema skrivenog smanjenja dosega (`noReachThrottling`).
- Koristi se fairness rangiranje kako bi korisnici bez kontakta dobili priliku.
- Aktivni parovi su privremeno izvan glavnog feeda dok traje fokusirani kontakt.

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
