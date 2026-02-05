# Specifikacija: Blokovski pristup testiranju

Dokument definira koncept blokova (cigle), manifesta, test kompozicije i sve povezane komponente za standardizirani, održivi sustav testiranja.

---

## 1. Osnovni koncepti

### 1.1 Cigla (brick)
- **Najmanja jedinica** – API endpoint, URL, HTTP metoda, polje forme, jedan klik
- Može biti i bez API-ja (npr. promjena URL-a, otvaranje modala)

### 1.2 Blok (block)
- **Logička cjelina** – kombinacija cigli
- Sastavljen od: endpoint + URL + metoda (npr. POST) ili druge kombinacije
- Ne mora imati API – može biti samo navigacija ili UI akcija

### 1.3 Manifest
- **Katalog svih blokova** – definicija strukture, ovisnosti, što blok radi
- Jedan fajl, lako pronaći i ažurirati
- Ne sadrži konkretne vrijednosti – samo shema

### 1.4 Test kompozicija
- **Koji blokovi se izvršavaju** u pojedinom testu
- Ne koriste se svi blokovi – svaki test bira podskup
- Definira slijed (ili slijed proizlazi iz ovisnosti)

### 1.5 Datoteka vrijednosti
- **Konkretni podaci** – amount, categoryId, grad, poruke, credentials
- Odvojena od manifesta – manifest = struktura, vrijednosti = podaci
- Može varirati po testu, okolini, scenariju

### 1.6 Kontejner (test)
- **Logička cjelina** – grupa blokova s jasnom svrhom (npr. "3.3 - Postavljanje budžeta")
- Ima: identifikator (3.3), naziv, opis, listu blokova, assertion, vrijednosti
- Blok = izvršna jedinica (ponovno upotrebljiva)
- Kontejner = test slučaj (poslovni smisao)

**Pravilo uspjeha:** Test (kontejner) je uspješan **ako je svaki blok uspio**. Ako jedan blok padne → test pada.

---

## 2. Struktura bloka u manifestu

```yaml
block-id:
  # Ovisnosti (od prethodnih blokova)
  inputs:
    from: [block-a, block-b]
    inherit: [jobId, userId]
  
  params:
    amount: number
    message: string
  
  outputs: [jobId, offerId]
  
  # Baza
  db:
    input: { Job: { id: jobId } }
    output: { Offer: { id: offerId, jobId } }
  
  # API
  api:
    method: POST
    path: /offers
    body: { jobId, amount, message }
  
  # Frontend / React state
  frontend:
    url: "#user"
    stateBefore: { tab: "user" }
    stateAfter: { selectedJobId: jobId, showOfferForm: false }
    trigger: "form submit"
    interactions:
      - type: "dropdown"
        target: "category"
        selector: "[data-testid=category-filter]"
        value: categoryId
      - type: "click"
        target: "submit"
        selector: "button[type=submit]"
  
  # Auth
  auth:
    required: true
    role: PROVIDER
  
  # Nuspojave (za provjeru)
  sideEffects:
    email: { subjectContains: ["ponuda"] }
    sms: false
  
  # Trigger tipovi (email link, webhook, cron, vanjski servis)
  trigger:
    type: email-link | sms-link | webhook | cron | external-api
    details:
      email:
        source: mailpit
        subjectContains: ["verify"]
        extractLink: "href"
      webhook:
        path: /webhooks/stripe
        method: POST
  
  # Screenshot
  screenshot:
    after: true
    capture: "viewport"  # ili "fullPage", "element"
    element: "[data-testid=job-detail]"
    waitFor: "[data-testid=job-detail]"
  
  # Savepoint na razini bloka
  savepoint:
    db: true
    frontend: true
    backend: false
```

---

## 3. Ulančavanje blokova

### 3.1 Ovisnost = slijed
- Blok deklarira `inputs.from: [block-a, block-b]`
- Orkestrator gradi graf ovisnosti (DAG)
- Topološkim sortiranjem dobiva se redoslijed izvršavanja

### 3.2 Automatsko rješavanje
- Test navodi `blocks: [send-offer]`
- Orkestrator automatski dodaje `create-job` i `login` zbog ovisnosti
- Nije potrebno eksplicitno navoditi redoslijed

---

## 4. Savepoint i rollback

### 4.1 Na razini bloka
- **DB savepoint** – prije/poslije bloka
- **Frontend savepoint** – React state, URL (gdje je moguće)
- **Backend savepoint** – opcionalno (teško implementirati)

### 4.2 U test kompoziciji
```yaml
db:
  savepoints:
    - name: initial
      at: test-start
    - name: after-setup
      at: after-block
      block: create-job
  
  rollback:
    at: test-end
    to: initial
    onFailure:
      to: previous  # ili named savepoint
```

### 4.3 SQL
- **Ne** u manifestu – ostaje deklarativno (at, to)
- Orkestrator prevodi u stvarne DB pozive (Prisma, SAVEPOINT, ROLLBACK)
- Custom SQL samo za posebne blokove (npr. seed) – referenca na SQL file

---

## 5. Pokrivenost

### 5.1 Što blok može uključivati
- API (unutarnji)
- Vanjski servisi (Stripe, Infobip)
- Cron/jobovi (npr. processJobAlerts)
- Klik na link u emailu
- Klik na link u SMS-u
- Webhookovi

### 5.2 UI interakcije
- Dropdown, click, fill
- File upload, modal, redirect
- Map picker, validacijske greške

---

## 6. Datoteke sustava

| Datoteka | Sadržaj |
|----------|---------|
| **Manifest** (`blocks.yaml`) | Katalog blokova, shema, ovisnosti |
| **Vrijednosti** (`values.yaml`) | Konkretni podaci po testu |
| **Test kompozicija** (`tests.yaml`) | Koji blokovi za koji test |

---

## 7. Kontejner i sadašnji testovi

### 7.1 Struktura kontejnera
```yaml
3.3-postavljanje-budzeta:
  id: "3.3"
  name: "Postavljanje budžeta"
  description: "Korisnik može postaviti min i max budžet za posao"
  blocks: [login, create-job-with-budget, view-job-detail]
  assert:
    - budget-visible
    - budget-correct-range
  values:
    budgetMin: 500
    budgetMax: 2000
```

### 7.2 Hijerarhija
```
Kontejner (3.3 Postavljanje budžeta)
    └── blok: login
    └── blok: create-job-with-budget
    └── blok: view-job-detail
    └── assert
```

### 7.3 Primjeri kompozicije blokova
Test 3.1 (kreiranje posla):
```
[login] → [navigate-#user] → [open-job-form] → [fill-submit-job] → [assert-job-in-list]
```

Test 4.1 (slanje ponude):
```
[login] → [create-job] → [navigate-to-job] → [open-offer-form] → [fill-submit-offer] → [assert-offer-visible]
```

---

## 8. Rezultati

### 8.1 Standardizirani format
- JSON schema za results
- Samo relevantne informacije: prošao/pao, koji blokovi, assertioni
- Bez: svi pokušaji pronalaska elementa, svi mailovi, debug logovi

### 8.2 Simulacija pravog korisnika
- Direktan put – bez LIKE, search, retry
- Korisnik odmah klikne – zna gdje je gumb
- Email: filter na jedan očekivani mail, jedan link, jedan klik

### 8.3 Pohrana rezultata
```
test-results/
  2025-01-31/
    run-001/
      results.json
      screenshots/
        block-view-job-detail.png
      db-delta.json  # opcionalno
```

- **Sažetak** – može se committati u Git (mali footprint)
- **Screenshotovi, puni logovi** – obično ne, ili samo za failed testove
- **CI artifacts** – rezultati dostupni preko GitHub Actions / Jenkinsa

---

## 9. Što još nedostaje (za implementaciju)

| Komponenta | Opis |
|------------|------|
| Assertions | Što točno provjeravamo – selektor, API, DB |
| Timeout / wait | Koliko čekati na API, element, mail |
| Okruženje | Base URL, API URL, Mailpit – local vs CI vs staging |
| Retry / error handling | Retry na pad, rollback na previous |
| Izolacija podataka | Jedinstveni emailovi, useri po testu |
| Credentials | Test useri, API ključevi – env, secrets |
| Test metadata | Naziv, opis, tagovi, prioritet – za reporting |

---

## 10. Orkestrator i komponente

### 10.1 Orkestrator
- **Uloga:** Čita manifest, kompoziciju i vrijednosti; izvršava blokove u ispravnom redoslijedu
- **Lokacija:** npr. `tests/orchestrator/` ili `tests/runner/`
- **Funkcije:** rješavanje ovisnosti (DAG), savepoint/rollback, pozivanje API-ja, Playwright za UI, dohvat mailova

### 10.2 Izvještavanje grešaka
- Kad blok padne: ime bloka, koji korak, poruka greške
- Screenshot u trenutku pada
- Opcionalno: debug mod – pokreni pojedini blok, pauza za inspekciju

### 10.3 Validacija
- Provjera da referencirani blokovi postoje u manifestu
- Validacija sheme manifesta (YAML schema)
- Provjera da kompozicija ima sve potrebne ovisnosti

### 10.4 Put migracije
- Inkrementalno: prvo kontejner 3.1, zatim ostali
- Postojeći testovi se postupno zamjenjuju kompozicijama blokova

### 10.5 Paralelno izvršavanje
- Neovisni kontejneri mogu se pokretati paralelno
- Blokovi bez međusobne ovisnosti – mogu se izvršavati paralelno

### 10.6 Načini izvršavanja
| Način | Što radi | Primjena |
|-------|----------|----------|
| API-only | Preskače UI, koristi samo API za setup | Brži setup |
| Full | DB + API + frontend | Kompletan test |
| Definicija u kontejneru ili bloku | Odabir načina po potrebi | |

### 10.7 Generiranje dokumentacije
- Automatska dokumentacija iz manifesta
- Popis blokova, kontejnera, ovisnosti
- Export u HTML/Markdown za pregled

---

## 11. Prednosti pristupa

- **Manifest** – jedan katalog, lako naći i ažurirati
- **Kompozicija** – testovi se sastoje od blokova, bez dupliciranja
- **Vrijednosti odvojeno** – manifest stabilan, podaci se mijenjaju
- **Cjelovit test** – DB + API + frontend + interakcije
- **Direktan put** – simulacija pravog korisnika, bez nepotrebnog traženja
- **Standardizirani rezultati** – usporedba, povijest, CI integracija

---

*Dokument kreiran: 31.01.2025*  
*Verzija: 1.1*
