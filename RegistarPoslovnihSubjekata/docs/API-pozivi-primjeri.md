# Primjeri API poziva – Registar poslovnih subjekata

Base URL: `https://registar-poslovnih-subjekata.onrender.com` (ili lokalno `http://localhost:3000`).

---

## 1. Pozivi koji samo pozivaju Sudreg API (bez upisa u bazu)

Backend radi kao **proxy**: dohvaća OAuth token, šalje zahtjev na `https://sudreg-data.gov.hr/api/javni` i vraća odgovor. Ništa se ne upisuje u bazu (osim eventualno log u `rps_sudreg_api_request_log`).

### 1.1 OAuth token (potreban za proxy)

```bash
# GET – dohvat tokena za Sudreg (koristi se interno za /api/sudreg)
curl -s "https://registar-poslovnih-subjekata.onrender.com/api/sudreg_token"
```

Odgovor (primjer): `{"access_token":"...", "token_type":"Bearer", "expires_in":21600}`.

---

### 1.2 Proxy prema Sudreg API-ju – čitanje podataka

Svi query parametri (osim `endpoint`) prosljeđuju se Sudreg API-ju. **Ništa se ne upisuje u bazu.**

```bash
# Snimke (dostupni snapshot_id-ovi)
curl -s "https://registar-poslovnih-subjekata.onrender.com/api/sudreg?endpoint=snapshots"

# Subjekti – prva stranica (limit 10), za zadani snapshot
curl -s "https://registar-poslovnih-subjekata.onrender.com/api/sudreg?endpoint=subjekti&snapshot_id=123&limit=10&offset=0"

# Detalji subjekta po OIB-u (obavezni parametri: tip_identifikatora, identifikator)
curl -s "https://registar-poslovnih-subjekata.onrender.com/api/sudreg?endpoint=detalji_subjekta&tip_identifikatora=oib&identifikator=12345678901"

# Detalji subjekta po MBS-u
curl -s "https://registar-poslovnih-subjekata.onrender.com/api/sudreg?endpoint=detalji_subjekta&tip_identifikatora=mbs&identifikator=12345"

# Šifrarnik sudova
curl -s "https://registar-poslovnih-subjekata.onrender.com/api/sudreg?endpoint=sudovi&snapshot_id=123"

# Tvrtke – stranica 2, 20 po stranici
curl -s "https://registar-poslovnih-subjekata.onrender.com/api/sudreg?endpoint=tvrtke&snapshot_id=123&limit=20&offset=20"

# Promjene (bez upisa u našu bazu – samo čitanje s Sudreg API-ja)
curl -s "https://registar-poslovnih-subjekata.onrender.com/api/sudreg?endpoint=promjene&snapshot_id=123&limit=100"
```

**Napomena:** Backend interno dohvaća token (GET `/api/sudreg_token`) i šalje ga u `Authorization: Bearer ...` prema Sudregu. Odgovor (JSON + headeri tipa `X-Total-Count`, `X-Snapshot-Id`) vraća korisniku.

---

### 1.3 Čitanje iz naše baze (bez poziva prema Sudreg API-ju)

GET `/api/sudreg_expected_counts` **ne poziva** Sudreg – čita samo tablicu `rps_sudreg_expected_counts`.

```bash
# Očekivani brojevi redaka po endpointu za snapshot_id=123 (već ranije upisani u bazu)
curl -s "https://registar-poslovnih-subjekata.onrender.com/api/sudreg_expected_counts?snapshot_id=123"

# Filtrirano po endpointu, s paginacijom
curl -s "https://registar-poslovnih-subjekata.onrender.com/api/sudreg_expected_counts?snapshot_id=123&endpoint=subjekti&limit=10&offset=0"
```

---

### 1.4 Status cron joba i dokumentacija

```bash
# Status zadnjeg cron_daily pokretanja (samo čitanje stanja u memoriji/bez upisa)
curl -s "https://registar-poslovnih-subjekata.onrender.com/api/sudreg_cron_daily/status"

# Popis naših endpointa i konfiguracije (statički odgovor)
curl -s "https://registar-poslovnih-subjekata.onrender.com/api/sudreg_docs"
```

---

## 2. Primjer s upisom u bazu

Ovi pozivi **pozivaju Sudreg API** i **upisuju ili ažuriraju podatke u bazu**. Zahtijevaju API ključ: header `X-API-Key: <tvoj_kljuc>` ili `Authorization: Bearer <tvoj_kljuc>`. Ključ je vrijednost env varijable `SUDREG_WRITE_API_KEY` na serveru.

### 2.1 POST `/api/sudreg_expected_counts` – dohvat brojeva s Sudreg API-ja + upis u bazu

1. Backend dohvaća token i poziva Sudreg `GET /snapshots`.
2. Za svaki endpoint iz liste (subjekti, tvrtke, sudovi, …) šalje GET prema Sudregu s `limit=0` i čita header `X-Total-Count`.
3. Rezultate upisuje u tablicu **`rps_sudreg_expected_counts`** (endpoint, snapshot_id, total_count).

**Primjer: jedan snapshot**

```bash
# snapshot_id=123 – dohvat X-Total-Count sa Sudreg API-ja za sve endpointe i upis u rps_sudreg_expected_counts
curl -s -X POST "https://registar-poslovnih-subjekata.onrender.com/api/sudreg_expected_counts?snapshot_id=123" \
  -H "X-API-Key: TVOJ_API_KLJUC"
```

**Primjer: bez snapshot_id** – puni sve snapshotove od (max u bazi + 1) do max iz Sudreg API-ja:

```bash
curl -s -X POST "https://registar-poslovnih-subjekata.onrender.com/api/sudreg_expected_counts" \
  -H "X-API-Key: TVOJ_API_KLJUC"
```

Tipičan odgovor (jedan snapshot):

```json
{
  "snapshot_id": 123,
  "updated": 42,
  "saved": true,
  "items": [
    { "endpoint": "subjekti", "total_count": 500000 },
    { "endpoint": "tvrtke", "total_count": 500000 },
    ...
  ]
}
```

---

### 2.2 POST `/api/sudreg_sync_promjene` – Sudreg `/promjene` → upis u `sudreg_promjene`

Poziva Sudreg endpoint `/promjene`, dohvaća podatke i upisuje ih u tablicu **`sudreg_promjene`**.

```bash
curl -s -X POST "https://registar-poslovnih-subjekata.onrender.com/api/sudreg_sync_promjene?snapshot_id=123" \
  -H "X-API-Key: TVOJ_API_KLJUC"
```

Opcionalno: `start_offset` za nastavak od određenog offseta.

---

### 2.3 POST `/api/sudreg_sync_entiteti` – sync entitetskih tablica (subjekti, tvrtke, …)

Poziva Sudreg endpointe (npr. `subjekti`, `tvrtke`, `sjedista`, …), straničeno, i upisuje redove u **tablice `sudreg_*`** (Prisma modeli).

```bash
# Za snapshot_id=123, maksimalno 5 batch-eva po endpointu (za test)
curl -s -X POST "https://registar-poslovnih-subjekata.onrender.com/api/sudreg_sync_entiteti?snapshot_id=123&max_batches=5" \
  -H "X-API-Key: TVOJ_API_KLJUC"
```

---

### 2.4 POST `/api/sudreg_cron_daily` – cijeli ETL (expected_counts → šifrarnici → entiteti)

Pokreće daily job koji interno poziva POST expected_counts, sync šifrarnika i sync entiteta. **Sve upisuje u bazu.**

```bash
# Pokretanje u pozadini (vraća 202)
curl -s -X POST "https://registar-poslovnih-subjekata.onrender.com/api/sudreg_cron_daily" \
  -H "X-API-Key: TVOJ_API_KLJUC"

# Pokretanje i čekanje završetka (vraća 200 + summary)
curl -s -X POST "https://registar-poslovnih-subjekata.onrender.com/api/sudreg_cron_daily?wait=1" \
  -H "X-API-Key: TVOJ_API_KLJUC"
```

---

## Sažetak

| Vrsta | Primjer | Poziva Sudreg? | Upis u bazu? |
|------|---------|----------------|--------------|
| Proxy (čitanje) | GET `/api/sudreg?endpoint=subjekti&...` | Da | Ne |
| Token | GET `/api/sudreg_token` | Da (OAuth) | Ne |
| Čitanje naše baze | GET `/api/sudreg_expected_counts?snapshot_id=123` | Ne | Ne |
| Upis (expected counts) | POST `/api/sudreg_expected_counts?snapshot_id=123` + API ključ | Da | Da (`rps_sudreg_expected_counts`) |
| Sync promjene | POST `/api/sudreg_sync_promjene?snapshot_id=123` + API ključ | Da | Da (`sudreg_promjene`, `rps_sudreg_sync_glava`) |
| Sync entiteti | POST `/api/sudreg_sync_entiteti?snapshot_id=123` + API ključ | Da | Da (tablice `sudreg_*`) |
| Cron daily | POST `/api/sudreg_cron_daily` + API ključ | Da | Da (sve gore navedene tablice) |
