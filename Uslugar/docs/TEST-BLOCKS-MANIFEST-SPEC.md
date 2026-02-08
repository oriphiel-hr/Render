# Specifikacija: Blokovski pristup testiranju

**Verzija:** 2.0  
**Datum:** 31.01.2025  
**Status:** Proširena dokumentacija (20+ stranica)

---

## Sadržaj

1. [Uvod i svrha dokumenta](#1-uvod-i-svrha-dokumenta)
2. [Osnovni koncepti](#2-osnovni-koncepti)
3. [Struktura bloka u manifestu](#3-struktura-bloka-u-manifestu)
4. [Ulančavanje blokova i DAG](#4-ulančavanje-blokova-i-dag)
5. [Savepoint i rollback](#5-savepoint-i-rollback)
6. [Pokrivenost – što blok može uključivati](#6-pokrivenost)
7. [Datoteke sustava i struktura projekta](#7-datoteke-sustava)
8. [Kontejner – struktura i primjeri](#8-kontejner)
9. [Rezultati testova](#9-rezultati-testova)
10. [Što još nedostaje](#10-što-još-nedostaje)
11. [Orkestrator i komponente](#11-orkestrator)
12. [Prednosti pristupa](#12-prednosti-pristupa)
13. [API endpointi](#13-api-endpointi)
14. [Stvarna implementacija](#14-stvarna-implementacija)
15. [Tok izvršavanja testa](#15-tok-izvršavanja-testa)
16. [Troubleshooting](#16-troubleshooting)
17. [Implementacijski checklist](#17-implementacijski-checklist)
18. [Kompletan katalog kontejnera po sektorima](#18-katalog-kontejnera)
19. [Sigurnost i performanse](#19-sigurnost-i-performanse)
20. [Često postavljana pitanja (FAQ)](#20-faq)
21. [Rječnik pojmova](#21-rječnik-pojmova)
22. [Dodatak A: Puni YAML primjeri](#dodatak-a)
23. [Dodatak B: Konfiguracija okruženja](#dodatak-b)
24. [Dodatak C: Dijagrami toka (ASCII)](#dodatak-c)
25. [Dodatak D: Vodič za dodavanje novog bloka](#dodatak-d)
26. [Dodatak E: Primjeri rezultata run-single](#dodatak-e)
27. [Dodatak F: Svi kontejneri – kompletna tablica](#dodatak-f)
28. [Dodatak G: Kontakt i podrška](#dodatak-g)

---

## 1. Uvod i svrha dokumenta

### 1.1 Kontekst

Ovaj dokument definira **blokovski pristup testiranju** – metodologiju za gradnju, održavanje i izvršavanje end-to-end testova u projektu Uslugar. Pristup je dizajniran kako bi riješio probleme klasičnih E2E testova: fragmentiranost, dupliciranje logike, nedostatak prozirnosti i teškoću održavanja.

### 1.2 Svrha dokumenta

Dokument služi kao:

- **Specifikacija** – definira sve koncepte, strukture i pravila sustava
- **Vodič za implementaciju** – objašnjava gdje što nalazi u kodu
- **Referenca** – katalog svih blokova, kontejnera i API-ja
- **Troubleshooting priručnik** – rješenja uobičajenih problema

### 1.3 Problemi koje pristup rješava

**Prije (klasični testovi):**

- Svaki test ima vlastitu logiku – login se ponavlja u desetak testova
- Teško je vidjeti što se točno testira – nema centralne definicije
- Rezultati su nejasni – nema detalja o API pozivima, promjenama u bazi
- Promjena u flow-u zahtijeva ažuriranje mnogo testova

**Poslije (blokovski pristup):**

- Blokovi se ponovno koriste – login je jedan blok, koristi ga svaki test koji treba prijavu
- Manifest je katalog – vidimo sve blokove i njihove ovisnosti na jednom mjestu
- Rezultati su standardizirani – apiCalls, blockStatuses, checkpointDelta, logs
- Promjena u bloku automatski se propagira u sve testove koji ga koriste

### 1.4 Ciljna publika

- Razvojni inženjeri koji pišu ili održavaju testove
- QA inženjeri koji pokreću testove i analiziraju rezultate
- Arhitekti koji planiraju proširenje sustava
- Novi članovi tima koji se upoznaju s test infrastrukturom

---

## 2. Osnovni koncepti

### 2.1 Cigla (brick)

**Definicija:** Cigla je najmanja izvršna jedinica – atomarna akcija koju test može izvršiti.

**Tipovi cigli:**

| Tip | Opis | Primjer |
|-----|------|---------|
| API poziv | Jedan HTTP zahtjev (metoda, path, body) | POST /api/auth/login |
| URL navigacija | Promjena hash-a ili putanje | window.location.hash = '#user' |
| Jedan klik | Klik na gumb, link, dropdown | page.click('button[type=submit]') |
| Jedan unos | Popunjavanje polja forme | page.fill('#email', 'test@example.com') |
| Čitanje elementa | Dohvat teksta ili atributa | page.textContent('[data-testid=job-title]') |

**Važno:** Cigla ne mora imati API. Može biti samo promjena URL-a, otvaranje modala ili čitanje elementa sa stranice. Cilj je dekomponirati složene flow-ove u male, jasno definirane korake koje je lako testirati i debugirati.

**Konkretni primjeri cigli u registracijskom flow-u:**

1. Navigacija na `/register` – cigla tipa URL navigacija
2. Klik na "Registriraj se" (ako je forma u hash sekciji) – cigla tipa klik
3. Unos emaila u polje – cigla tipa unos
4. Unos lozinke – cigla tipa unos
5. Unos imena – cigla tipa unos
6. Klik na submit gumb – cigla tipa klik
7. POST na `/api/auth/register` – cigla tipa API poziv
8. Čekanje na redirect ili poruku – cigla tipa čekanje

### 2.2 Blok (block)

**Definicija:** Blok je logička cjelina – kombinacija cigli koja ima jasnu poslovnu svrhu, definirane ulaze, izlaze i ovisnosti.

**Sastav bloka:**

- **API dio** – endpoint, HTTP metoda, tijelo zahtjeva (npr. POST /offers)
- **Frontend dio** – URL, state prije/poslije, trigger (form submit, klik)
- **Izlaz (outputs)** – što blok proizvodi i šalje u kontekst (jobId, offerId, userId)

**Razlika od cigle:** Cigla = jedna akcija. Blok = skupina akcija s jasnim ulazima, izlazima i ovisnostima. Blok se može ponovno koristiti u više testova – to je ključna prednost pristupa.

**Primjer bloka send-offer:**

Blok `send-offer` uključuje: navigaciju na stranicu poslova, odabir posla, otvaranje forme ponude, unos iznosa i poruke, slanje API poziva POST /offers, provjeru da je ponuda vidljiva u listi. Izlaz: `offerId`, `jobId`. Ovisi o blokovima `create-job` (da imamo posao) i `login` (da imamo prijavljenog providera).

**Blokovi bez API-ja:** Npr. `view-job-detail` – isključivo otvaranje stranice s odabranim poslom, bez API poziva. Frontend navigacija i čitanje stanja.

### 2.3 Manifest

**Definicija:** Manifest je katalog svih blokova – centralna definicija strukture, ovisnosti i ponašanja svakog bloka.

**Što manifest sadrži:**

- Definiciju svakog bloka (inputs, outputs, api, frontend, auth, sideEffects)
- Ovisnosti između blokova (inputs.from, inherit)
- Shemu – što blok očekuje i što vraća

**Što manifest NE sadrži:** Konkretne vrijednosti (email, lozinka, iznosi, grad). To je namjerno – vrijednosti dolaze iz datoteke vrijednosti ili test-data API-ja, pa se manifest ostaje stabilan kad se testni podaci mijenjaju.

**Lokacija u projektu:**

- `backend/src/config/blocksManifest.js` – BLOCKS_BY_TEST, CONTAINER_NAMES, getBlocksForTest
- `backend/src/config/blocksDefinitions.js` – BLOCK_DEFINITIONS (shema svakog bloka)

### 2.4 Test kompozicija

**Definicija:** Test kompozicija definira koji blokovi se izvršavaju u pojedinom testu i u kojem redoslijedu.

**Eksplicitni slijed:** Npr. `blocks: [login, create-job, send-offer]` – redoslijed je eksplicitno naveden.

**Implicitni slijed:** Npr. `blocks: [send-offer]` – orkestrator automatski dodaje `login` i `create-job` zbog ovisnosti definiranih u `inputs.from`. Nije potrebno eksplicitno navoditi cijeli lanac – dovoljno je navesti ciljni blok(ove).

**Prednost implicitnog slijeda:** Ako `send-offer` jednom promijeni ovisnosti (npr. doda `fetch-categories`), svi testovi koji ga koriste automatski dobivaju ažurirani slijed bez promjene kompozicije.

### 2.5 Datoteka vrijednosti

**Definicija:** Datoteka vrijednosti sadrži konkretne podatke po testu – amount, categoryId, grad, poruke, specifične parametre.

**Odvojenost od manifesta:** Manifest = struktura (što blok prima). Vrijednosti = podaci (konkretne brojke i stringovi). Na taj način se manifest ne mijenja kad treba drugi budžet za test 3.3 (npr. 1000–3000 umjesto 500–2000) ili drugu poruku za ponudu u 4.1.

**Credentials:** Email, lozinka i slično obično dolaze iz test-data API-ja (`GET /api/testing/test-data`) ili env varijabli – nikad iz manifesta.

**Lokacija:** `backend/src/config/blocksValues.js`, endpoint `/api/testing/test-data`

### 2.6 Kontejner (test)

**Definicija:** Kontejner je logička cjelina s jasnom poslovnom svrhom – odgovara jednom test slučaju (npr. "3.3 - Postavljanje budžeta").

**Komponente kontejnera:**

| Komponenta | Opis |
|------------|------|
| Identifikator | Npr. 3.3, 4.1 – jedinstveni ID unutar sustava |
| Naziv | Kratak opis – "Postavljanje budžeta" |
| Opis | Detaljniji opis što test pokriva |
| Blokovi | Lista blokova koji se izvršavaju |
| Assert | Što se provjerava – npr. budget-visible, offer-accepted |
| Vrijednosti | Opcionalno – specifične za taj test |

**Razlika blok vs kontejner:** Blok = izvršna jedinica (ponovno upotrebljiva u više testova). Kontejner = test slučaj (poslovni smisao, grupa blokova s jasnom svrhom).

**Pravilo uspjeha:** Test (kontejner) je uspješan **ako i samo ako je svaki blok uspio**. Ako jedan blok padne, cijeli test pada. Nema djelomičnog uspjeha – svi blokovi moraju proći.

---

## 3. Struktura bloka u manifestu

Svaki blok definira svoje ulaze, izlaze, API, frontend, autentifikaciju i nuspojave. Slijedi potpuna struktura s objašnjenjima.

### 3.1 Puna YAML struktura

```yaml
block-id:
  inputs:
    from: [block-a, block-b]
    inherit: [jobId, userId]
  params:
    amount: number
    message: string
  outputs: [jobId, offerId]
  db:
    input: { Job: { id: jobId } }
    output: { Offer: { id: offerId, jobId: jobId } }
  api:
    method: POST
    path: /offers
    body: { jobId, amount, message }
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
  auth:
    required: true
    role: PROVIDER
  sideEffects:
    email: { subjectContains: ["ponuda"] }
    sms: false
  trigger:
    type: email-link | sms-link | webhook | cron | external-api
    details:
      email:
        source: mailpit
        subjectContains: ["verify"]
        extractLink: "href"
  screenshot:
    after: true
    capture: "viewport"
    element: "[data-testid=job-detail]"
    waitFor: "[data-testid=job-detail]"
  savepoint:
    db: true
    frontend: true
    backend: false
```

### 3.2 Detaljno objašnjenje polja

**inputs.from** – Lista blokova od kojih ovaj blok ovisi. Ti blokovi moraju se izvršiti prije ovog bloka. Orkestrator koristi ovo za gradnju DAG-a i topološko sortiranje.

**inputs.inherit** – Koje izlaze ovaj blok preuzima iz prethodnih blokova. Npr. `jobId` iz `create-job`, `userId` iz `login`. Vrijednosti se prenose u kontekst izvršavanja.

**params** – Parametri koje blok prima – iz values datoteke ili konteksta. Npr. `budgetMin`, `budgetMax` za create-job-with-budget.

**outputs** – Što blok vraća u kontekst za sljedeće blokove. Npr. `jobId`, `offerId`, `userId`, `token`.

**db.input** – Koji DB entiteti se koriste kao ulaz (npr. Job s id = jobId).

**db.output** – Koji DB entiteti se stvaraju ili mijenjaju (npr. Offer s id = offerId, jobId = jobId).

**api.method, api.path** – HTTP metoda i puna putanja API-ja (npr. POST /api/auth/register). Koristi se za prozirnost – odmah vidimo koji se API poziva.

**frontend.url** – URL ili hash na koji korisnik navigira (#user, #register).

**frontend.stateBefore/stateAfter** – Stanje React aplikacije prije i poslije bloka (opcionalno).

**frontend.trigger** – Što pokreće akciju – form submit, klik, itd.

**frontend.interactions** – Lista UI interakcija – dropdown, click, fill, s selektorima.

**auth.required, auth.role** – Je li potreban JWT, koja rola (USER, PROVIDER, ADMIN).

**sideEffects** – Nuspojave koje se provjeravaju – email (subjectContains), SMS.

**trigger** – Ako blok reagira na vanjski događaj – email link, webhook, cron.

**screenshot** – Kad snimiti (after), što (viewport/fullPage/element), koji selektor, waitFor.

**savepoint** – Da li koristiti DB/frontend savepoint prije/poslije bloka.

---

## 4. Ulančavanje blokova i DAG

### 4.1 Graf ovisnosti (DAG)

Blok deklarira ovisnosti kroz `inputs.from`. Orkestrator gradi **Directed Acyclic Graph (DAG)** – usmjereni graf bez ciklusa.

**Algoritam:**

1. Za svaki blok u kompoziciji, dodaj ga u graf
2. Za svaki blok, dodaj rubove od svih blokova iz `inputs.from` prema tom bloku
3. Provjeri da nema ciklusa (inace greška – cirkularna ovisnost)
4. Primijeni topološko sortiranje – dobije se redoslijed izvršavanja
5. Izvršavaj blokove u tom redoslijedu

**Primjer:** `send-offer` ovisi o `create-job` i `login`. `create-job` ovisi o `login`. Redoslijed: `login` → `create-job` → `send-offer`.

### 4.2 Automatsko rješavanje ovisnosti

Ako test navodi samo `blocks: [send-offer]`, orkestrator automatski dodaje `create-job` i `login` jer su oni u `inputs.from` od `send-offer`. Rezultat: potpuni lanac bez dupliciranja u kompoziciji.

**Prednost:** Ako `send-offer` promijeni ovisnosti (npr. doda `fetch-categories`), svi testovi automatski dobivaju ažurirani slijed. Jedna promjena u definiciji bloka = ažurirani svi testovi.

---

## 5. Savepoint i rollback

### 5.1 Koncept

Savepoint je snimka stanja baze (ili frontenda) u određenom trenutku. Rollback vraća stanje na tu snimku. Cilj: izolacija testova – jedan test ne smije utjecati na druge.

### 5.2 Na razini bloka

- **DB savepoint** – snimka stanja baze prije/poslije bloka (Prisma, transakcije, SAVEPOINT)
- **Frontend savepoint** – React state, URL (gdje je moguće)
- **Backend savepoint** – opcionalno, teško implementirati zbog stateless arhitekture

### 5.3 U test kompoziciji

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
      to: previous
```

Na početku testa kreira se `initial`. Nakon `create-job` može se kreirati `after-setup`. Na kraju testa (uspjeh ili neuspjeh) baza se vraća na `initial`.

### 5.4 SQL u manifestu

U manifestu **ne** pišemo SQL – ostaje deklarativno (at, to, block). Orkestrator prevodi u stvarne DB pozive. Custom SQL samo za posebne blokove (npr. seed) – kao referenca na SQL file.

---

## 6. Pokrivenost

### 6.1 Što blok može uključivati

- **API (unutarnji)** – POST /api/auth/register, GET /api/jobs, PUT /api/providers/me
- **Vanjski servisi** – Stripe (webhook, checkout), Infobip (SMS)
- **Cron/jobovi** – processJobAlerts, subscription reminder
- **Klik na link u emailu** – Mailpit, dohvat maila, ekstrakcija linka, Playwright klik
- **Klik na link u SMS-u** – slično emailu
- **Webhookovi** – Stripe, plaćanja, vanjski sustavi

### 6.2 UI interakcije

- **Dropdown** – odabir vrijednosti iz padajuće liste
- **Click** – gumb, link, kartica, ikona
- **Fill** – unos teksta u polje (input, textarea)
- **File upload** – slike, PDF-ovi (KYC, portfolio, licence)
- **Modal** – otvaranje, zatvaranje, potvrda
- **Redirect** – provjera da je došlo do preusmjeravanja nakon akcije
- **Map picker** – odabir lokacije na karti
- **Validacijske greške** – provjera poruka grešaka na formi

---

## 7. Datoteke sustava i struktura projekta

### 7.1 Pregled datoteka

| Datoteka | Sadržaj | Lokacija |
|----------|---------|----------|
| **Manifest** | Katalog blokova, shema, ovisnosti | blocksManifest.js, blocksDefinitions.js |
| **Vrijednosti** | Konkretni podaci po testu | blocksValues.js, /api/testing/test-data |
| **Test kompozicija** | Koji blokovi za koji test | blocksManifest.js (BLOCKS_BY_TEST) |

### 7.2 blocksManifest.js

Sadrži:
- **BLOCKS_BY_TEST** – objekt gdje je ključ testId (npr. "1.1", "4.1"), vrijednost je { blocks: [...], assert: [...] }
- **CONTAINER_NAMES** – mapa testId → ljudski čitljiv naziv (npr. "4.1" → "Slanje ponuda za poslove")
- **getBlocksForTest(testId)** – funkcija koja vraća blocks, assert i name za dani testId

### 7.3 blocksDefinitions.js

Sadrži **BLOCK_DEFINITIONS** – objekt gdje je ključ blockId (npr. "login", "send-offer"), vrijednost je definicija bloka (inputs, outputs, api, frontend, auth, db, sideEffects, itd.). Svaki blok koji se koristi u BLOCKS_BY_TEST trebao bi imati definiciju ovdje.

### 7.4 blocksValues.js

Sadrži **VALUES_BY_TEST** – objekt gdje je ključ testId, vrijednost su konkretni parametri za taj test (npr. 3.3: { budgetMin: 500, budgetMax: 2000 }, 4.1: { amount: 150, message: "..." }). Credentials (email, lozinka) ne dolaze odavde – dolaze iz test-data API-ja.

### 7.5 testRunnerService.js

Orkestrator – `backend/src/services/testRunnerService.js`. Ključne metode:
- **runTestByBlocks(testId, userData)** – glavna metoda; čita blocks iz manifesta, izvršava ih redom, vraća blockStatuses, logs, screenshots, apiCalls
- **_runApiTest(method, path, options)** – poziva API, push-a u _apiCalls niz
- **BLOCK_TO_TEST** – statička mapa blockId → testType (npr. "register-user" → "registration")
- Handleri: runRegistrationTest, runJobCreationTest, runForgotPasswordTest, itd.

### 7.6 API endpoint

**GET /api/testing/blocks-manifest/:testId** – vraća JSON:
```json
{
  "container": { "testId": "1.1", "name": "...", "blocks": ["register-user"], "assert": ["user-created", "email-sent"] },
  "blockDefinitions": { "register-user": { "inputs": {...}, "api": {...}, ... } },
  "values": null
}
```

---

## 8. Kontejner – struktura i primjeri

### 8.1 Struktura kontejnera

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

### 8.2 Hijerarhija

```
Kontejner (3.3 Postavljanje budžeta)
    └── blok: login
    └── blok: create-job-with-budget
    └── blok: view-job-detail
    └── assert: budget-visible, budget-correct-range
```

### 8.3 Primjeri flow-a

**Test 3.1 (kreiranje posla):**  
`[login] → [navigate-#user] → [open-job-form] → [fill-submit-job] → [assert-job-in-list]`

**Test 4.1 (slanje ponude):**  
`[login] → [create-job] → [navigate-to-job] → [open-offer-form] → [fill-submit-offer] → [assert-offer-visible]`

**Test 1.1 (registracija korisnika):**  
`[register-user] → assert: user-created, email-sent`  
Blok register-user: frontend forma #register, form submit, API POST /api/auth/register, sideEffect: email.

---

## 9. Rezultati testova

### 9.1 Standardizirani format

- JSON shema za results
- Prošao/pao, koji blokovi, assertioni, koraci (logs)
- Bez: svi pokušaji pronalaska elementa, debug logovi

### 9.2 API u rezultatima

Za svaki API poziv: **ulazni parametri** (method, path, body), **rezultat** (status, response body, greške). Omogućuje brzo utvrditi koji se API pozvao, što je poslano i što je vraćeno.

### 9.3 Promjene u bazi

Rezultati prikazuju **checkpointDelta** – koji su redovi se promijenili: INSERT, UPDATE, DELETE po tablicama. Format: `{ Job: { inserted: [1], updated: [], deleted: [] }, Offer: { inserted: [1], ... } }`

### 9.4 Simulacija pravog korisnika

- **Direktan put** – bez LIKE, search, retry – korisnik zna gdje je gumb
- **Email** – filter na jedan očekivani mail, jedan link, jedan klik
- **Jedinstveni podaci** – jedinstveni email po testu (npr. test+timestamp@domain.com)

### 9.5 Pravilo obaveznog screenshota

**Ako blok treba screenshot i on se ne može kreirati, blok pada.**

Implementacija: Context blokovi uzimaju screenshot nakon uspješnog izvršavanja. Ako screenshot baca iznimku ili vrati prazan niz → blok pada. API blokovi ne uzimaju screenshot – pravilo se ne primjenjuje.

---

## 10. Što još nedostaje

| Komponenta | Opis |
|------------|------|
| Assertions | Što točno provjeravamo – selektor, API odgovor, DB stanje |
| Timeout/wait | Koliko čekati na API, element, mail (5s za element, 30s za mail) |
| Okruženje | Base URL, API URL, Mailpit – local vs CI vs staging |
| Retry/error handling | Retry na pad (1–3 puta), rollback na previous |
| Izolacija podataka | Jedinstveni emailovi, useri po testu |
| Credentials | Test useri, env, test-data endpoint |
| Test metadata | Naziv, opis, tagovi, prioritet – za reporting |

---

## 11. Orkestrator i komponente

### 11.1 Lokacija i uloga

**Lokacija:** `backend/src/services/testRunnerService.js`

Orkestrator je centralna komponenta koja:
- Čita manifest (blocks, assert) za dani testId
- Rješava ovisnosti (DAG) – trenutno se koristi eksplicitni redoslijed iz blocks arraya
- Mapira blockId na test handler (BLOCK_TO_TEST)
- Izvršava blokove sekvencijalno
- Prikuplja apiCalls (ako handler koristi _runApiTest)
- Prikuplja blockStatuses (ok/fail za svaki blok)
- Vraća sve u run-single odgovoru

### 11.2 Ključne metode

- **runTestByBlocks(testId, userData)** – glavna metoda orkestratora
- **_runApiTest(method, path, options)** – axios poziv na API, push u _apiCalls
- **runRegistrationTest(userData)** – handler za register-user
- **runJobCreationTest(userData)** – handler za create-job
- **runForgotPasswordTest(userData)** – handler za forgot-password
- **_createTestJobWithLogin(logs)** – helper: login + create job za setup

### 11.3 BLOCK_TO_TEST mapa

Mapira blockId na testType koji se koristi u runGenericTest ili direktno poziva handler. Npr. "register-user" → "registration" poziva runRegistrationTest. "login" se može izvršiti direktno preko _runApiTest ako je samostalni blok.

### 11.4 Načini izvršavanja

- **API-only** – preskače Playwright, koristi samo API (brži, za smoke testove)
- **Full** – DB + API + frontend (Playwright) – kompletan E2E
- Odabir se definira u TEST_ID_MAP (apiOnly: true za odgovarajuće testove)

---

## 12. Prednosti pristupa

- Manifest – jedan katalog
- Kompozicija – bez dupliciranja
- Vrijednosti odvojeno
- Cjelovit test – DB+API+frontend
- Direktan put
- Standardizirani rezultati

---

## 13. API endpointi

| Endpoint | Opis |
|----------|------|
| GET /api/testing/blocks-manifest | Manifest svih testova |
| GET /api/testing/blocks-manifest/:testId | Puna definicija kontejnera |
| POST /api/testing/run-single | Pokreće test, vraća status, screenshots, logs, apiCalls, blockStatuses, checkpointDelta |
| GET /api/testing/test-data | Test korisnici, Mailpit konfiguracija |

---

## 14. Stvarna implementacija

### 14.1 Primjer: login

```javascript
login: {
  inputs: { from: [] },
  outputs: ['userId', 'token'],
  api: { method: 'POST', path: '/auth/login' },
  auth: { required: false }
}
```

### 14.2 Primjer: send-offer

```javascript
'send-offer': {
  inputs: { from: ['create-job', 'login'], inherit: ['jobId', 'userId'] },
  outputs: ['jobId', 'offerId'],
  api: { method: 'POST', path: '/offers' },
  db: { input: { Job: { id: 'jobId' } }, output: { Offer: { id: 'offerId', jobId: 'jobId' } } },
  auth: { required: true, role: 'PROVIDER' }
}
```

### 14.3 Primjer: register-user

```javascript
'register-user': {
  inputs: { from: [] },
  outputs: ['userId'],
  api: { method: 'POST', path: '/api/auth/register' },
  frontend: { url: '#register', trigger: 'form submit' },
  sideEffects: { email: true }
}
```

### 14.4 Mapiranje blok → test tip

| Blok | Test tip | Opis |
|------|----------|------|
| register-user | registration | Playwright: forma, Mailpit |
| login | (API direktno) | _runApiTest |
| create-job | job_creation | API + Playwright |
| send-offer | (API + UI) | API, screenshots |
| forgot-password | forgot-password | Playwright + klik na link |

---

## 15. Tok izvršavanja testa

1. Zahtjev – POST run-single
2. Checkpoint – kreiranje DB checkpointa
3. Mapiranje – testId → blocks
4. Redoslijed – topološko sortiranje
5. Izvršavanje – za svaki blok: handler, apiCalls, screenshots, logs
6. Mailpit – za testove s emailom
7. Checkpoint delta – usporedba baze
8. Rollback – vraćanje baze
9. Odgovor – JSON s rezultatima

---

## 16. Troubleshooting

| Problem | Uzrok | Rješenje |
|---------|-------|----------|
| Mail screenshot: NE | Chromium bez --no-sandbox | args: ['--no-sandbox', '--disable-setuid-sandbox'] |
| apiCalls prazan za 1.1 | Playwright, ne _runApiTest | Definicija bloka ima api.path |
| path "/" u ApiRequestLog | Zahtjev na root | GET base URL – userId null |
| Blok pada | Screenshot nije kreiran | Provjeriti Playwright, logs "Razlog:" |
| Rollback fail | Transakcija otvorena | Pričekati 2–3 s prije rollbacka |

---

## 17. Implementacijski checklist

- [ ] Blokovi s API imaju api: { method, path }
- [ ] Credentials iz test-data ili env
- [ ] Playwright s --no-sandbox u kontejnerima
- [ ] apiCalls i blockStatuses u run-single odgovoru
- [ ] Logs u Admin UI (Koraci)
- [ ] Request/response body u ApiRequestLog
- [ ] Pravilo screenshota

---

## 18. Kompletan katalog kontejnera po sektorima

### Sektor 1: Registracija i Autentifikacija

| ID | Naziv | Blokovi | Assert |
|----|-------|---------|--------|
| 1.1 | Registracija korisnika usluge | register-user | user-created, email-sent |
| 1.2 | Registracija pružatelja usluga | register-provider | provider-created, email-sent |
| 1.3 | Prijava korisnika | login | token-received |
| 1.4 | Email verifikacija | register-user, email-verify | user-verified |
| 1.5 | Resetiranje lozinke | forgot-password, email-reset-link | reset-link-sent, link-clickable |
| 1.6 | JWT token autentifikacija | login, jwt-auth | token-valid, api-access |

### Sektor 2: Upravljanje Kategorijama

| ID | Naziv | Blokovi | Assert |
|----|-------|---------|--------|
| 2.1 | Dinamičko učitavanje kategorija | fetch-categories | categories-loaded |
| 2.2 | Hijerarhijska struktura kategorija | fetch-categories | hierarchy-correct |
| 2.3 | Filtriranje poslova po kategorijama | login, fetch-categories, filter-jobs-by-category | filtered-results |

### Sektor 3: Upravljanje Poslovima

| ID | Naziv | Blokovi | Assert |
|----|-------|---------|--------|
| 3.1 | Objavljivanje novih poslova | login, create-job | job-in-list |
| 3.2 | Detaljni opis posla | login, create-job, view-job-detail | details-visible |
| 3.3 | Postavljanje budžeta | login, create-job-with-budget, view-job-detail | budget-visible |
| 3.4 | Lokacija i Geolokacija | login, create-job, map-picker, address-autocomplete | location-saved |
| 3.5 | Status posla | login, create-job, job-status-flow | status-transitions |
| 3.6 | Pretraživanje poslova | login, job-search | search-results |
| 3.7 | Napredni filteri | login, fetch-categories, job-advanced-filters | filtered-results |
| 3.8 | Sortiranje poslova | login, job-sorting | sorted-results |

### Sektor 4: Sustav Ponuda

| ID | Naziv | Blokovi | Assert |
|----|-------|---------|--------|
| 4.1 | Slanje ponuda za poslove | login, create-job, send-offer | offer-visible |
| 4.2 | Status ponude | login, create-job, send-offer, offer-status | status-correct |
| 4.3 | Prihvaćanje/odbijanje ponuda | login, create-job, send-offer, accept-reject-offer | offer-accepted |

### Sektori 6–31 (sažeto)

Sektor 6: Profili Pružatelja (6.1–6.4). Sektor 12: Matchmaking (12.1). Sektor 14: Pravni Status (14.1). Sektor 18: Plaćanja i Stripe (18.1–18.4). Sektor 19: Tvrtke i Timovi (19.1–19.2). Sektor 20: Chat (20.1–20.2). Sektor 21: SMS (21.1–21.4). Sektor 22: KYC (22.1–22.4). Sektor 23: Portfolio (23.1–23.4). Sektor 24: Email Notifikacije (24.1–24.4). Sektor 25: Saved Searches i Job Alerts (25.1–25.4). Sektor 26: Admin (26.1–26.4). Sektor 27: Wizard (27.1–27.4). Sektor 28: Pretplata (28.1–28.4). Sektor 29: ROI (29.1–29.4). Sektor 30: Credit (30.1–30.4). Sektor 31: Security (31.1–31.4).

---

## 19. Sigurnost i performanse

### 19.1 Sigurnost

- **Credentials** – nikad u manifestu ili kodu; uvijek iz env ili test-data API-ja
- **Tokeni u logovima** – redaktirani kao *** u apiCalls i ApiRequestLog
- **Lozinke** – redaktirane u request body pri logiranju

### 19.2 Performanse

- **API-only testovi** – preskaču Playwright, brži za smoke testove
- **Checkpoint** – rollback na kraju osigurava čistu bazu za sljedeći test
- **Paralelizacija** – neovisni kontejneri mogu se pokretati paralelno (budući rad)

---

## 20. Često postavljana pitanja (FAQ)

**Q: Zašto apiCalls prazan za test 1.1?**  
A: Registracija koristi Playwright (forma u browseru). API se poziva u browseru, ne preko _runApiTest. Definicija bloka ima api.path za prozirnost.

**Q: Kako dodati novi blok?**  
A: 1) Dodaj definiciju u blocksDefinitions.js. 2) Ako treba, dodaj handler u testRunnerService (BLOCK_TO_TEST). 3) Dodaj blok u BLOCKS_BY_TEST za odgovarajući test.

**Q: Gdje su credentials?**  
A: GET /api/testing/test-data vraća test usere (email, password). Koriste se iz run-single kada se šalje userData.

**Q: Što ako dva testa koriste isti email?**  
A: Za registraciju koristi se jedinstveni email: test+timestamp@domain.com. Ostali testovi koriste seed korisnike iz test-data.

---

## 21. Rječnik pojmova

| Pojam | Definicija |
|-------|------------|
| **Cigla** | Najmanja izvršna jedinica – jedna akcija |
| **Blok** | Logička cjelina – skupina cigli s ulazima, izlazima, ovisnostima |
| **Manifest** | Katalog svih blokova |
| **Kontejner** | Test slučaj – grupa blokova s jasnom svrhom |
| **DAG** | Directed Acyclic Graph – graf ovisnosti bez ciklusa |
| **Savepoint** | Snimka stanja baze u trenutku |
| **Rollback** | Vraćanje stanja na savepoint |
| **Assert** | Što se provjerava na kraju testa |
| **Orkestrator** | Komponenta koja izvršava blokove u ispravnom redoslijedu |

---

## Dodatak A: Puni YAML primjeri

### Primjer: send-offer blok (potpuna definicija)

```yaml
send-offer:
  inputs:
    from: [create-job, login]
    inherit: [jobId, userId]
  params:
    amount: number
    message: string
  outputs: [jobId, offerId]
  db:
    input: { Job: { id: jobId } }
    output: { Offer: { id: offerId, jobId: jobId } }
  api:
    method: POST
    path: /offers
    body: { jobId, amount, message }
  auth:
    required: true
    role: PROVIDER
```

### Primjer: kontejner 4.1

```yaml
4.1:
  id: "4.1"
  name: "Slanje ponuda za poslove"
  description: "Provider šalje ponudu za posao kreiran od strane klijenta"
  blocks: [login, create-job, send-offer]
  assert: [offer-visible]
  values:
    amount: 150
    message: "Ponuda za elektroinstalaterske radove"
```

---

## Dodatak B: Konfiguracija okruženja

### Env varijable

| Varijabla | Opis | Primjer |
|-----------|------|---------|
| FRONTEND_URL | URL frontenda | https://www.uslugar.eu |
| API_URL | URL API-ja | https://api.uslugar.eu |
| MAILPIT_API_URL | Mailpit API | http://mailpit:8025/api/v1 |
| MAILPIT_WEB_URL | Mailpit web UI | http://mailpit:8025 |

### Lokalno vs CI vs Staging

- **Lokalno:** localhost, Mailpit na 8025
- **CI (GitHub Actions):** Render URL-ovi, Mailpit servis
- **Staging:** staging URLs, test Mailpit

---

## Dodatak C: Dijagrami toka (ASCII)

### Tok izvršavanja testa 1.1 (registracija)

```
[Client]                    [Backend]                   [Mailpit]
    |                            |                           |
    | POST /run-single           |                           |
    |--------------------------->|                           |
    |                            | create checkpoint         |
    |                            | runTestByBlocks           |
    |                            |   └─ runRegistrationTest  |
    |                            |        └─ Playwright      |
    |                            |             goto /register|
    |                            |             fill form     |
    |                            |             submit        |
    |                            |<------POST /auth/register-|
    |                            |        (from browser)     |
    |                            |                           |
    |                            | fetch emails-------------->
    |                            |<--------------------------|
    |                            | screenshot email          |
    |                            | click verify link         |
    |                            | checkpoint delta          |
    |                            | rollback                  |
    |<---------------------------|                           |
    | JSON: status, screenshots, |                           |
    | logs, apiCalls, blockStatuses                          |
```

### Graf ovisnosti za test 4.1

```
     login
        |
        v
  create-job
        |
        v
  send-offer  ---> assert: offer-visible
```

---

## Dodatak D: Vodič za dodavanje novog bloka

### Korak 1: Definiraj blok u blocksDefinitions.js

```javascript
'my-new-block': {
  inputs: { from: ['login'], inherit: ['userId'] },
  outputs: ['myOutputId'],
  api: { method: 'POST', path: '/api/my-endpoint' },
  frontend: { url: '#my-page', trigger: 'form submit' },
  auth: { required: true, role: 'USER' }
}
```

### Korak 2: Dodaj handler (ako treba)

Ako blok ne koristi postojeći test tip, dodaj mapiranje u testRunnerService.js:

```javascript
static BLOCK_TO_TEST = {
  // ...
  'my-new-block': 'my-new-test-type'
}
```

Zatim implementiraj handler u runTestByBlocks – ili koristi generički runGenericTest.

### Korak 3: Dodaj blok u kompoziciju

U blocksManifest.js, BLOCKS_BY_TEST:

```javascript
'5.1': { blocks: ['login', 'my-new-block'], assert: ['my-assertion'] }
```

### Korak 4: Ako treba, dodaj vrijednosti

U blocksValues.js za test 5.1:

```javascript
'5.1': { myParam: 'value' }
```

---

## Dodatak E: Primjeri rezultata run-single

### Uspješan odgovor (test 1.1)

```json
{
  "success": true,
  "testId": "1.1",
  "status": "PASS",
  "duration": 12500,
  "screenshots": [
    { "step": "Stranica učitana", "url": "/test-screenshots/..." },
    { "step": "Forma poslana", "url": "/test-screenshots/..." }
  ],
  "emailScreenshots": [
    { "subject": "Potvrdi email", "screenshotUrl": "/test-screenshots/..." }
  ],
  "logs": ["✓ Test pokrenuo", "✓ Browser pokrenuo", "✓ Mail screenshot kreiran: DA", ...],
  "apiCalls": [],
  "blockStatuses": [{ "id": "register-user", "status": "ok" }],
  "checkpointDelta": { "User": { "inserted": [1], "updated": [], "deleted": [] } },
  "blocks": ["register-user"],
  "assert": ["user-created", "email-sent"]
}
```

### Neuspješan odgovor (blok pao)

```json
{
  "success": false,
  "testId": "4.1",
  "status": "FAIL",
  "error": "Blok 'send-offer' pao",
  "blockStatuses": [
    { "id": "login", "status": "ok" },
    { "id": "create-job", "status": "ok" },
    { "id": "send-offer", "status": "fail", "error": "401 Unauthorized" }
  ],
  "apiCalls": [
    { "input": { "method": "POST", "path": "/api/auth/login", "body": {...} }, "result": { "status": 200, "ok": true } },
    { "input": { "method": "POST", "path": "/api/jobs", "body": {...} }, "result": { "status": 201, "ok": true } },
    { "input": { "method": "POST", "path": "/api/offers", "body": {...} }, "result": { "status": 401, "ok": false } }
  ]
}
```

---

## Dodatak F: Svi kontejneri – kompletna tablica

| ID | Naziv | Blokovi |
|----|-------|---------|
| 1.1 | Registracija korisnika | register-user |
| 1.2 | Registracija pružatelja | register-provider |
| 1.3 | Prijava korisnika | login |
| 1.4 | Email verifikacija | register-user, email-verify |
| 1.5 | Resetiranje lozinke | forgot-password, email-reset-link |
| 1.6 | JWT autentifikacija | login, jwt-auth |
| 2.1 | Učitavanje kategorija | fetch-categories |
| 2.2 | Hijerarhija kategorija | fetch-categories |
| 2.3 | Filtriranje po kategorijama | login, fetch-categories, filter-jobs-by-category |
| 3.1 | Objavljivanje poslova | login, create-job |
| 3.2 | Detalji posla | login, create-job, view-job-detail |
| 3.3 | Postavljanje budžeta | login, create-job-with-budget, view-job-detail |
| 3.4 | Lokacija | login, create-job, map-picker, address-autocomplete |
| 3.5 | Status posla | login, create-job, job-status-flow |
| 3.6 | Pretraga poslova | login, job-search |
| 3.7 | Napredni filteri | login, fetch-categories, job-advanced-filters |
| 3.8 | Sortiranje | login, job-sorting |
| 4.1 | Slanje ponude | login, create-job, send-offer |
| 4.2 | Status ponude | login, create-job, send-offer, offer-status |
| 4.3 | Prihvaćanje ponude | login, create-job, send-offer, accept-reject-offer |
| 6.1–6.4 | Profili providera | login + specifični blokovi |
| 12.1 | Matchmaking | matchmaking |
| 14.1 | Pravni status | verify-registar |
| 18.1–18.4 | Stripe | login, stripe-* |
| 19.1–19.2 | Tvrtke | login, director-dashboard, lead-distribution |
| 20.1–20.2 | Chat | login, chat-public, chat-internal |
| 21.1–21.4 | SMS | login, sms-* |
| 22.1–22.4 | KYC | login, kyc-* |
| 23.1–23.4 | Portfolio | login, portfolio-*, license-*, gallery-preview |
| 24.1–24.4 | Email notifikacije | login, create-job, send-offer, email-* |
| 25.1–25.4 | Job alerts | login, saved-search, job-alert-* |
| 26.1–26.4 | Admin | login, admin-* |
| 27.1–27.4 | Wizard | wizard-* |
| 28.1–28.4 | Pretplata | login, subscription-*, trial-activate |
| 29.1–29.4 | ROI | login, roi-* |
| 30.1–30.4 | Credit | login, credit-* |
| 31.1–31.4 | Security | cors-check, csrf-check, rate-limiting, sql-injection |

---

## Dodatak G: Kontakt i podrška

Za pitanja o blokovskom pristupu testiranju, pogledajte:

- Ovaj dokument (TEST-BLOCKS-MANIFEST-SPEC.md)
- Kod: backend/src/config/blocksManifest.js, blocksDefinitions.js, blocksValues.js
- Orkestrator: backend/src/services/testRunnerService.js
- Admin UI: frontend/src/pages/AdminTestingBlocks.jsx

---

*Dokument kreiran: 31.01.2025 | Verzija: 2.0 | Prošireno na 20+ stranica*
