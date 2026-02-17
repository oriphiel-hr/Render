# Runbook: Sync podataka iz Sudreg API-ja

Redoslijed koraka za uspješan sync po snapshotu i provjeru valjanosti.

## 1. Upis očekivanih brojeva (expected counts)

Prije bilo kojeg synca po snapshotu mora postojati redak u `sudreg_expected_counts` za svaki endpoint i taj snapshot.

```bash
# Jedan snapshot (npr. 1090)
curl -X POST "https://<APP_URL>/api/sudreg_expected_counts?snapshot_id=1090"
```

- Ako **ne** navedeš `snapshot_id`, API vraća 400.
- Ovo dohvaća X-Total-Count s Sudreg API-ja za sve endpointe i upisuje u bazu.

## 2. Sync promjena (popis promjena + expected counts)

Ovo dohvaća popis promjena (MBS + SCN) i upisuje u `sudreg_promjene_stavke`. Također ponovno upisuje expected counts (korak 1 je moguće preskočiti ako odmah pokreneš ovaj korak).

```bash
# Sync za snapshot 1090 (može trajati 10+ min)
curl -X POST "https://<APP_URL>/api/sudreg_sync_promjene?snapshot_id=1090"

# Opcija: pokreni u pozadini (202 Accepted, sync nastavlja na serveru)
curl -X POST "https://<APP_URL>/api/sudreg_sync_promjene?snapshot_id=1090&background=1"
```

- **Lock:** samo jedan sync odjednom (promjene ili po tablici). Ako je sync već u tijeku, vraća se 409. Lock isteče nakon 2 sata.

## 3. Sync po tablicama (subjekti, tvrtke, itd.)

Nakon koraka 1 i 2 možeš syncati pojedine tablice za isti snapshot. Za tablice s MBO prvo moraju postojati redovi u `sudreg_promjene_stavke` za taj snapshot.

```bash
# Primjer: sync subjekata za snapshot 1090
curl -X POST "https://<APP_URL>/api/sudreg_sync_subjekti?snapshot_id=1090"
```

- Uvjeti (inače 409):
  - Red u `sudreg_expected_counts` za (endpoint, snapshot_id).
  - Za tablice s MBO: redovi u `sudreg_promjene_stavke` za taj snapshot.
  - Ciljana tablica **ne smije** već imati podatke za taj snapshot_id (unos samo jednom po snapshotu). Kod **chunked synca** (nastavak s `start_offset`) tablica smije imati podatke.

### Chunked sync (velike tablice, izbjegavanje timeouta)

Za tablice s puno redaka (npr. predmeti_poslovanja) jedan poziv može trajati sat vremena i premašiti limit zahtjeva. Koristi **max_batches** ili **max_rows** da jedan HTTP poziv obradi samo dio; odgovor sadrži `has_more` i `next_start_offset` za nastavak.

| Parametar       | Značenje |
|-----------------|----------|
| `max_batches`   | Maksimalan broj batch-eva (po 500 redaka) u ovom pozivu. |
| `max_rows`      | Maksimalan broj redaka za upis u ovom pozivu. |
| `start_offset`  | Nastavak: od kojeg offseta (list) odnosno indeksa (detalji) nastaviti. Prvi poziv bez ovoga; sljedeći s vrijednošću iz `next_start_offset`. |

- Prvi poziv: bez `start_offset` (na početku se brišu postojeći redovi za snapshot, zatim upis do `max_batches`/`max_rows`).
- Ako odgovor ima `has_more: true`, ponovi poziv s `start_offset=<next_start_offset>` (i istim `max_batches`/`max_rows`) dok `has_more` ne nestane.

```bash
# Primjer: sync predmeti_poslovanja po 100 batch-eva (50 000 redaka) po pozivu
curl -X POST "https://<APP_URL>/api/sudreg_sync_predmeti_poslovanja?snapshot_id=1090&max_batches=100"
# Ako odgovor: "has_more": true, "next_start_offset": 50000
curl -X POST "https://<APP_URL>/api/sudreg_sync_predmeti_poslovanja?snapshot_id=1090&max_batches=100&start_offset=50000"
# Ponavljaj s novim next_start_offset dok has_more nije false
```

## 4. Provjera grešaka (validacija)

Provjeri slaže li se broj upisanih redaka s očekivanim.

```bash
# Greške za trenutni snapshot (iz sudreg_sync_state)
curl "https://<APP_URL>/api/sudreg_sync_greske"

# Greške za određeni snapshot
curl "https://<APP_URL>/api/sudreg_sync_greske?snapshot_id=1090"
```

- Ako je `summary.sGreskama > 0`, neki endpointi imaju neslaganje (očekivano vs stvarno). Popraviti sync ili ponoviti za dotične tablice.

## 5. Ostalo

- **Trenutno stanje (snapshot + redni broj):**  
  `GET /api/sudreg_sync_state`
- **Razlike između dva snapshota (tko se promijenio):**  
  `GET /api/sudreg_promjene_razlike?stari_snapshot=1090&novi_snapshot=1091`
- **Čišćenje audit tablice (stari UPDATE log):**  
  `POST /api/sudreg_audit_promjene_cleanup?days=90`
- **Cron za greške + webhook:**  
  `GET /api/sudreg_sync_check_webhook` (ako je postavljen `SUDREG_WEBHOOK_URL`, šalje POST s greškama).
- **Dokumentacija svih endpointa (primjeri PowerShell i curl):**  
  `GET /api/sudreg_docs`
- **Log dolaznih API poziva (path + queryString):**  
  `GET /api/sudreg_request_log?limit=20&offset=0`
- **Log svih poziva prema Sudreg API-ju (s točnim parametrima):**  
  `GET /api/sudreg_proxy_log?limit=50&offset=0`  
  Opcionalno: `?response_status=400` za greške (npr. 505), `?endpoint=sudreg_evidencijske_djelatnosti` za jedan endpoint. Uključuje i interne pozive (expected count, sync).
- **OAuth token za Sudreg:**  
  `GET` ili `POST /api/sudreg_token`

## 6. Primjeri curl za sve endpointe

Zamijeni `<APP_URL>` s bazom aplikacije (npr. `registar-poslovnih-subjekata.onrender.com`). Na Windows PowerShellu koristi `Invoke-WebRequest` ili `curl.exe` umjesto `curl`.

### Health i stanje

```bash
# Health (s provjerom baze; 503 ako DB ne odgovara)
curl "https://<APP_URL>/health"

# Trenutni snapshot i redni broj synca
curl "https://<APP_URL>/api/sudreg_sync_state"
```

### Expected counts

```bash
# Očekivani vs stvarni brojevi (svi za snapshot 1090)
curl "https://<APP_URL>/api/sudreg_expected_counts?snapshot_id=1090"

# S paginacijom (npr. prvih 50, preskoči 0)
curl "https://<APP_URL>/api/sudreg_expected_counts?snapshot_id=1090&limit=50&offset=0"

# Upis expected counts u bazu (obavezan snapshot_id)
curl -X POST "https://<APP_URL>/api/sudreg_expected_counts?snapshot_id=1090"
```

### Greške i validacija

```bash
# Greške za trenutni snapshot (default)
curl "https://<APP_URL>/api/sudreg_sync_greske"

# Greške za određeni snapshot
curl "https://<APP_URL>/api/sudreg_sync_greske?snapshot_id=1090"

# Cron: provjera grešaka + slanje na webhook ako ima (env SUDREG_WEBHOOK_URL)
curl "https://<APP_URL>/api/sudreg_sync_check_webhook"
curl "https://<APP_URL>/api/sudreg_sync_check_webhook?snapshot_id=1090"
```

### Sync (lock: samo jedan odjednom)

```bash
# Sync promjena (može trajati 10+ min)
curl -X POST "https://<APP_URL>/api/sudreg_sync_promjene?snapshot_id=1090"

# Sync u pozadini (202 odmah)
curl -X POST "https://<APP_URL>/api/sudreg_sync_promjene?snapshot_id=1090&background=1"

# Sync po tablici
curl -X POST "https://<APP_URL>/api/sudreg_sync_subjekti?snapshot_id=1090"
```

### Razlike i audit

```bash
# Tko se promijenio između dva snapshota
curl "https://<APP_URL>/api/sudreg_promjene_razlike?stari_snapshot=1090&novi_snapshot=1091"

# Briši audit redove starije od 90 dana (default)
curl -X POST "https://<APP_URL>/api/sudreg_audit_promjene_cleanup?days=90"
```

### PowerShell (Windows)

```powershell
# GET
Invoke-WebRequest -Uri "https://<APP_URL>/api/sudreg_sync_greske" -Method GET

# POST
Invoke-WebRequest -Uri "https://<APP_URL>/api/sudreg_expected_counts?snapshot_id=1090" -Method POST
```

## Troubleshooting (Render / logovi)

- **`Environment variable not found: DATABASE_URL`** – Ako koristiš Render **Cron Job** koji poziva ovu aplikaciju, tom Cron Jobu mora biti postavljena varijabla **DATABASE_URL** (isti connection string kao Web Service). U Renderu: Cron Job → Environment → dodaj DATABASE_URL ili ga naslijedi iz Environment Group.
- **`Application exited early`** – Često uzrok: nedostaje DATABASE_URL u okruženju koji pokreće proces (npr. build ili Cron bez env).
- **Sudreg API 505 „Vaš zahtjev nije vratio ni jedan redak“** – Prema OpenAPI parametri za list/expected count su: **offset**, **limit**, **no_data_error** (0 = ne vraćaj grešku kad nema redaka), **snapshot_id** (opcionalno). Aplikacija šalje `offset=0&limit=0&no_data_error=0` i `snapshot_id` iz zahtjeva. Ako API ipak vrati 505, vjerojatno je problem u parametrima ili snapshot nije dostupan; aplikacija upisuje **totalCount=-1** („nepoznato“, ne 0 da ne bi izgledalo kao stvarno nula redaka). Provjeri OpenAPI spec (datoteka `open_api (1)`) za točan naziv i vrijednosti parametara po endpointu.

## Sažetak redoslijeda

1. `POST /api/sudreg_expected_counts?snapshot_id=<X>` (ili preskoči ako odmah radiš korak 2)
2. `POST /api/sudreg_sync_promjene?snapshot_id=<X>`
3. `POST /api/sudreg_sync_<tablica>?snapshot_id=<X>` za svaku tablicu koju trebaš
4. `GET /api/sudreg_sync_greske` – provjera jesu li sve brojke u redu

## Job: sve tablice za jedan snapshot (npr. 1090)

### API metoda (Render cron)

Jedan HTTP poziv pokreće cijeli job na serveru: prvo `sync_promjene`, zatim za svaku tablicu chunked sync dok ne završi. Cron na Renderu može pozivati ovaj URL.

```bash
# Obavezno: snapshot_id. Opcionalno: max_batches (default 100) – batch-eva po chunku po tablici
curl -X POST "https://<APP_URL>/api/sudreg_sync_run_job?snapshot_id=1090"
curl -X POST "https://<APP_URL>/api/sudreg_sync_run_job?snapshot_id=1090&max_batches=50"
```

- Odgovor 200: `{ ok: true, snapshotId, durationMs, maxBatchesPerChunk, endpoints: [ { endpoint, synced, batches }, ... ] }`. Ako neka tablica već ima podatke ili nema expected count, u `endpoints` će biti `skipped: true, reason: '...'`.
- Za drugi snapshot promijeni samo `snapshot_id=1091` u URL-u.

### Postavljanje Cron Joba na Renderu

Cron Job samo **poziva** Web Service (HTTP). Ne treba mu DATABASE_URL.

U formi za Cron Job **nema** polja „Command” ni „Start Command” – naredba je u **Dockerfileu** (CMD). Koristi se **Language = Docker** i **Dockerfile.cron**.

**Točne korake (samo polja koja postoje):**

| Polje | Vrijednost |
|--------|------------|
| **Name** | `sudreg-sync-daily` (ili kako želiš) |
| **Project** | po želji |
| **Language** | **Docker** |
| **Branch** | `main` (ili branch gdje je `Dockerfile.cron`) |
| **Region** | npr. Frankfurt (EU Central) |
| **Root Directory** | prazno, ili podfolder ako je `Dockerfile.cron` u njemu (npr. `RegistarPoslovnihSubjekata`) |
| **Dockerfile Path** | **`Dockerfile.cron`** |
| **Schedule** | `0 3 * * *` (jednom dnevno u 3:00 UTC) |
| **Instance type** | po želji (npr. Starter) |
| **Environment Variables** | opcionalno: `SUDREG_APP_URL`, `SUDREG_SNAPSHOT_ID` |

Naredba se **ne upisuje** u formu. U repou mora biti datoteka **`Dockerfile.cron`** – u njoj je CMD koji pokreće `curl -X POST "..."`. Render pri svakom runu gradi tu sliku i izvršava njen CMD.

Ako sync traje predugo i dobiješ 502: u **Advanced** → **Docker Command** možeš nadjačati, npr. dodati `&max_batches=30` u URL.

**Kad Render prikaže „There’s an error above”:** Render često ne prikaže točan razlog. Prođi cijelu formu i provjeri: (1) ima li neko polje crveno označeno ili s crvenim tekstom ispod; (2) u browseru otvori Developer Tools (F12) → Console, pa vidi javlja li se neka greška; (3) probaj **Dockerfile Path** prvo `Dockerfile.cron`, pa ako ne prolazi `RegistarPoslovnihSubjekata/Dockerfile.cron`. Ako nađeš točan tekst greške, zapiši ga – korisno je za daljnji troubleshooting. Bilo bi dobro da Render prikazuje konkretnu poruku (npr. „Dockerfile not found” ili „Invalid path”) umjesto samo „error above”.

### PowerShell skripta (ručno)

Skripta `scripts/sync-snapshot-1090.ps1` radi isto kao API job, ali izvana (klijent poziva sync endpoint po endpointu). Korisno za ručno pokretanje s lokalnog računala.

```powershell
$env:SUDREG_APP_URL = "https://your-app.onrender.com"
.\scripts\sync-snapshot-1090.ps1
.\scripts\sync-snapshot-1090.ps1 -SnapshotId 1091 -BaseUrl "https://your-app.onrender.com"
```
