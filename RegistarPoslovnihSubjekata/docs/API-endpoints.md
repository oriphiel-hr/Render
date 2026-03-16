# API endpointi – Registar poslovnih subjekata

Backend izlaže sljedeće rute. Base URL: `https://registar-poslovnih-subjekata.onrender.com` (ili tvoj Render URL).

---

## Javni endpointi (bez API ključa)

| Metoda | Putanja | Opis |
|--------|---------|------|
| GET | `/` | Health-check (isti odgovor kao `/health`). |
| GET | `/health` | Health-check. |
| GET | `/api/sudreg_token` | Dohvat OAuth tokena za Sudreg (client_credentials). |
| GET | `/api/sudreg` | Proxy prema Sudreg API-ju. Parametar `endpoint` obavezan (npr. `subjekti`, `detalji_subjekta`, `sudovi`). Ostali query parametri se prosljeđuju. |
| GET | `/api/sudreg_expected_counts` | Čitanje očekivanih brojeva redaka po endpointu/snapshotu iz baze. Parametri: `snapshot_id` (obavezno), opcionalno `endpoint`, `limit`, `offset`. |
| GET | `/api/sudreg_cron_daily/status` | Status zadnjeg cron_daily joba (startedAt, finishedAt, status, summary, currentPhase, currentEndpoint). |
| GET | `/api/sudreg_docs` | JSON s popisom svih endpointa i konfiguracijom Sudreg API-ja. |

---

## Write endpointi (zahtijevaju API ključ: `X-API-Key` ili `Authorization: Bearer <key>`)

| Metoda | Putanja | Opis |
|--------|---------|------|
| POST | `/api/sudreg_token` | Dohvat OAuth tokena (isti kao GET). |
| POST | `/api/sudreg_expected_counts` | Dohvat X-Total-Count sa Sudreg API-ja i upis u `rps_sudreg_expected_counts`. Opcionalno: `snapshot_id`. |
| POST | `/api/sudreg_sync_entiteti` | Sync entitetskih tablica (subjekti, tvrtke, sjedista, …) za jedan snapshot. Parametri: `snapshot_id`, `max_batches`. |
| POST | `/api/sudreg_sync_promjene` | Sync Sudreg promjena u tablicu `sudreg_promjene`. Parametri: `snapshot_id`, `start_offset`. |

---

## Cron / ETL endpointi (zahtijevaju API ključ)

| Metoda | Putanja | Opis |
|--------|---------|------|
| POST | `/api/sudreg_cron_daily` | Pokreće daily job: expected_counts → sync šifrarnici → sync entiteti. Bez parametara: 202 u pozadini. `?wait=1`: čeka i vraća 200 + summary. |
| POST | `/api/sudreg_cron_daily/stop` | Zahtjev za zaustavljanje tekućeg sync joba. |
| POST | `/api/sudreg_cron_daily/rollback` | Zaustavlja sync i briše sve podatke iz `sudreg_%` i `rps_sudreg_%` tablica. |

---

*Generirano iz `server.js`. Za live strukturu pozovi `GET /api/sudreg_docs`.*
