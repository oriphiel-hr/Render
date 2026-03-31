# Technology Catalog Live Sync

## Sto je dodano

- Public endpoint: `GET /api/technology-catalog`
- Admin endpoint status: `GET /api/admin/technology-catalog/status`
- Admin endpoint refresh: `POST /api/admin/technology-catalog/refresh`
- Polja po tehnologiji:
  - `lastVerifiedAt`
  - `sourceOk`
  - `sourceHttpStatus`
  - `sourceResponseTimeMs`

## Periodicni refresh

- Konfiguracija: `CATALOG_SYNC_INTERVAL_MINUTES`
- `0` = bez periodickog refresha (samo manual refresh)
- `>0` = refresh u zadanom intervalu

## Napomena

Verifikacija izvora provjerava dostupnost sluzbenih URL-ova tehnologija (HEAD request s timeoutom).
