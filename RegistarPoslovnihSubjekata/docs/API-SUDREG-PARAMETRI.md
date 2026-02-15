# API Sudskog registra – endpointe i parametri

Ovaj servis izlaže **samo dohvat** (proxy) prema [sudreg-data.gov.hr](https://sudreg-data.gov.hr). Zahtjevi idu na `GET /api/sudreg_<endpoint>` (npr. `/api/sudreg_sudovi`, `/api/sudreg_detalji_subjekta`); query parametri i header `X-Snapshot-Id` prosljeđuju se Sudreg API-ju. **Podaci se ne spremaju u bazu** – to je zasebna funkcionalnost (ETL/sync).

**Autorizacija:** Servis sam dohvaća OAuth token (cache 6 h). Klijent ne šalje credentials.

**Logiranje:** Svaki poziv na `/api/sudreg_<endpoint>` zapisuje se u tablicu **sudreg_proxy_log** (u polju endpoint: npr. `sudreg_sudovi`): endpoint, query_string, response_status, duration_ms, client_ip (iz X-Forwarded-For / X-Real-IP), user_agent, created_at. Korisno za audit, statistiku i debug.

**Base URL:** `https://registar-poslovnih-subjekata.onrender.com` (ili lokalno `http://localhost:PORT`)

---

## Format poziva

```
GET /api/sudreg_{endpoint}?param1=value1&param2=value2
Header: X-Snapshot-Id (opcionalno) – za konzistentan snapshot
```

Primjer: `GET /api/sudreg_sudovi`, `GET /api/sudreg_detalji_subjekta?tip_identifikatora=oib&identifikator=...`

---

## Lista endpointa i poznati parametri

Prema dokumentaciji [data.gov.hr – Sudski registar](https://data.gov.hr/ckan/dataset/sudski-registar) i OpenAPI javni. Parametri koji nisu navedeni mogu biti podržani od strane API-ja – prosljeđuju se kao query string.

| Endpoint | Opis | Ulazni parametri (poznati) |
|----------|------|----------------------------|
| **detalji_subjekta** | Detalji jednog subjekta (OIB ili MBS) | **tip_identifikatora** (obavezno): `oib` ili `mbo`<br>**identifikator** (obavezno): vrijednost OIB-a (11 znamenki) ili MBS-a (9 znamenki)<br>**expand_relations** (opcionalno): `true` za proširene relacije |
| **subjekti** | Lista subjekata | Paginacija / filteri prema OpenAPI (npr. **page**, **limit**); **X-Snapshot-Id** u headeru za konzistentan snapshot |
| **tvrtke** | Nazivi tvrtki | Vjerojatno **mbs** ili paginacija; provjeri OpenAPI |
| **skracene_tvrtke** | Skraćeni nazivi | Vjerojatno **mbs** ili paginacija |
| **sjedista** | Sjedišta / adrese | Vjerojatno **mbs** ili **subjekt_id** |
| **email_adrese** | Email adrese | Vjerojatno **mbs** / **subjekt_id** |
| **pravni_oblici** | Pravni oblik | Vjerojatno **mbs** / **subjekt_id** |
| **pretezite_djelatnosti** | Pretežite djelatnosti | Vjerojatno **mbs** / **subjekt_id** |
| **predmeti_poslovanja** | Predmet poslovanja | Vjerojatno **mbs** / **subjekt_id** |
| **evidencijske_djelatnosti** | Evidencijske djelatnosti | Vjerojatno **mbs** / **subjekt_id** |
| **temeljni_kapitali** | Temeljni kapital | Vjerojatno **mbs** / **subjekt_id** |
| **postupci** | Postupak (stečaj, likvidacija) | Vjerojatno **mbs** / **subjekt_id** |
| **snapshots** | Dostupne snimke | Bez parametara ili **expand_relations** |
| **drzave** | Šifrarnik država | Bez parametara ili **expand_relations** |
| **sudovi** | Šifrarnik sudova | Bez parametara ili **expand_relations=true** |
| **valute** | Šifrarnik valuta | Bez parametara |
| **vrste_pravnih_oblika** | Šifrarnik pravnih oblika | Bez parametara |
| **vrste_postupaka** | Šifrarnik vrsta postupka | Bez parametara |
| **nacionalna_klasifikacija_djelatnosti** | Šifrarnik NKD | Bez parametara ili paginacija |
| **bris_pravni_oblici** | BRIS pravni oblik | Prema OpenAPI |
| **bris_registri** | BRIS registri | Prema OpenAPI |
| **counts** | Brojači | Prema OpenAPI |
| **djelatnosti_podruznica** | Djelatnosti podružnica | Prema OpenAPI |
| **email_adrese_podruznica** | Email podružnica | Prema OpenAPI |
| **gfi** | GFI | Prema OpenAPI |
| **inozemni_registri** | Inozemni registri | Prema OpenAPI |
| **jezici** | Jezici | Prema OpenAPI |
| **nazivi_podruznica** | Nazivi podružnica | Prema OpenAPI |
| **objave_priopcenja** | Objave priopćenja | Prema OpenAPI |
| **prijevodi_skracenih_tvrtki** | Prijevodi skraćenih tvrtki | Prema OpenAPI |
| **prijevodi_tvrtki** | Prijevodi tvrtki | Prema OpenAPI |
| **promjene** | Promjene | Prema OpenAPI |
| **sjedista_podruznica** | Sjedišta podružnica | Prema OpenAPI |
| **skraceni_nazivi_podruznica** | Skraćeni nazivi podružnica | Prema OpenAPI |
| **statusi** | Statusi | Prema OpenAPI |
| **vrste_gfi_dokumenata** | Vrste GFI dokumenata | Prema OpenAPI |

*Točan popis parametara za svaki endpoint nalazi se u službenoj OpenAPI dokumentaciji na [sudreg-data.gov.hr](https://sudreg-data.gov.hr) (nakon registracije).*

---

## Sync u bazu (upis) i detekcija promjena

**Redoslijed preporučen za puni sync:** prvo **promjene**, zatim šifrarnici (sudovi, drzave, valute, …), zatim ostale tablice po potrebi.

### Promjene (prvi korak)

Metoda **promjene** vraća za svaki subjekt **SCN** (System Change Number) i datum/vrijeme zadnje promjene. Služi za detekciju *koji* su subjekti se promijenili od prošlog preuzimanja.

- **POST** `/api/sudreg_sync_promjene` – dohvaća cijeli popis (paginirano), sprema u tablicu **sudreg_promjene_stavke** (snapshot_id, subjekt_id, scn, changed_at).
- **Detekcija promjena:** usporedi s prethodnim snapshotom:
  - **MAX(SCN):** ako je `MAX(scn)` u novom snapshotu veći od `MAX(scn)` u prethodnom snapshotu u bazi, došlo je do promjena. Za pojedinačne subjekte: ako za subjekt X vrijedi `novi_scn > stari_scn`, subjekt X je promijenjen.
  - U SQL: npr. `SELECT MAX(scn) FROM sudreg_promjene_stavke WHERE snapshot_id = :zadnji_snapshot`; nakon novog synca usporedi s `MAX(scn)` iz prethodnog snapshota.
- Nakon detekcije promijenjenih subjekata možeš za njih dohvatiti detalje putem **detalji_subjekta** (primjereno za manji broj subjekata).

### Ostali sync endpointi (šifrarnici)

- **POST** `/api/sudreg_sync_sudovi`, `/api/sudreg_sync_drzave`, `/api/sudreg_sync_valute`, `/api/sudreg_sync_nacionalna_klasifikacija_djelatnosti`, `/api/sudreg_sync_vrste_pravnih_oblika`, `/api/sudreg_sync_vrste_postupaka` – paginirani dohvat i upsert u odgovarajuće tablice (bez duplikata po id).

---

## Primjeri curl

**Token (ako treba ručno):**
```bash
curl "https://registar-poslovnih-subjekata.onrender.com/api/token"
```

**Detalji subjekta po OIB-u:**
```bash
curl "https://registar-poslovnih-subjekata.onrender.com/api/sudreg_detalji_subjekta?tip_identifikatora=oib&identifikator=12345678901&expand_relations=true"
```

**Detalji subjekta po MBS-u:**
```bash
curl "https://registar-poslovnih-subjekata.onrender.com/api/sudreg_detalji_subjekta?tip_identifikatora=mbo&identifikator=080229250&expand_relations=true"
```

**Sudovi (šifrarnik):**
```bash
curl "https://registar-poslovnih-subjekata.onrender.com/api/sudreg_sudovi?expand_relations=true"
```

**Snapshots:**
```bash
curl "https://registar-poslovnih-subjekata.onrender.com/api/sudreg_snapshots"
```

**S konzistentnim snapshotom (header):**
```bash
curl -H "X-Snapshot-Id: 12345" "https://registar-poslovnih-subjekata.onrender.com/api/sudreg_subjekti?page=1&limit=10"
```

**Sync promjene (prvi korak – upis u bazu za detekciju promjena):**
```bash
curl -X POST "https://registar-poslovnih-subjekata.onrender.com/api/sudreg_sync_promjene"
```

**Sync šifrarnik sudova:**
```bash
curl -X POST "https://registar-poslovnih-subjekata.onrender.com/api/sudreg_sync_sudovi"
```
