# Upute: API URL i frontend za run-single (ApiRequestLog u delti)

Ovo je referenca **bez nagađanja**: točne datoteke, varijable i uvjeti da zahtjevi iz Playwright testa budu logirani na istom backendu koji servira `run-single`, pa da se **ApiRequestLog** u „Promjene u bazi” (checkpoint delta) puni.

---

## 1. Tko što čita (izvor istine u kodu)

### 1.1 Backend – koji URL Playwright otvara (frontend stranica)

| Što | Gdje | Kada |
|-----|------|------|
| URL na koji se ide s `page.goto(...)` | `backend/src/services/testRunnerService.js`, metoda `_getFrontendUrl()` (oko redaka 45–50) | Runtime pri svakom pokretanju testa |
| Izvor vrijednosti | `process.env.TEST_FRONTEND_URL` (prioritet), zatim `process.env.FRONTEND_URL`; ako nijedan nije postavljen, koristi se `'https://www.uslugar.eu'` | Runtime (env backend procesa) |

```js
// testRunnerService.js
_getFrontendUrl() {
  return process.env.TEST_FRONTEND_URL || process.env.FRONTEND_URL || 'https://www.uslugar.eu';
}
```

Svi pozivi tipa `page.goto(...)` i `_capturePageScreenshot(..., url, ...)` u tom servisu koriste `this._getFrontendUrl()` za bazu URL-a (npr. `${this._getFrontendUrl()}/register`, `${this._getFrontendUrl()}/#login`).

### 1.2 Frontend – na koji API šalje zahtjeve

| Što | Gdje | Kada |
|-----|------|------|
| API base URL za axios/fetch | `frontend/src/api.js` redak 8: `import.meta.env.VITE_API_URL` | **Build time** (vrijednost se ugrađuje u build) |
| Isti izvor koriste | `frontend/api/http.js` redak 2, `frontend/src/hooks/usePushNotifications.js` redak 4 | **Build time** |

```js
// frontend/src/api.js
const API_BASE = import.meta.env.VITE_API_URL || 'https://api.uslugar.oriph.io';
// Zatim se dodaje /api ako nedostaje (redaci 11–14)
```

U Vite projektu `import.meta.env.VITE_*` se zamjenjuje **prilikom builda** (`npm run build` / `vite build`). Nema koda koji u ovom repozitoriju runtime mijenja API URL na temelju backend env varijabli.

### 1.3 run-single – koji backend „vladá” testom

| Što | Gdje | Kada |
|-----|------|------|
| URL backenda za checkpoint/API pozive iz testa | `backend/src/routes/testing.js` oko redaka 603–604 | Runtime za svaki zahtjev |
| Izvor | `req.body.apiBaseUrl` ili `req.protocol` + `req.get('host')` (domena/port na koji je poslan zahtjev `POST .../run-single`) | Request prema tom backendu |

Znači: backend koji **prima** zahtjev na `POST /api/testing/run-single` je onaj čija se baza koristi za checkpoint i za upit na `ApiRequestLog`. Ako frontend koji Playwright otvori šalje zahtjeve na **drugi** backend, ti zahtjevi se upisuju u bazu tog drugog backenda i u delti ovog backenda ostaje 0.

---

## 2. Uvjet da ApiRequestLog u delti bude pun

- **Playwright** otvara stranicu s URL-a koji vraća `_getFrontendUrl()` → dakle **`FRONTEND_URL`** iz env-a backend procesa koji servira run-single.
- **Ta stranica** (frontend build) šalje sve API zahtjeve na **jedan fiksni URL** koji je u njoj ugrađen pri buildu → **`VITE_API_URL`** (iz env-a pri `vite build`).
- Da se logovi upisuju u bazu backenda koji servira run-single, **taj isti backend** mora biti i onaj na koji frontend šalje zahtjeve.

Dakle:

1. **Backend** (onaj koji servira `POST /api/testing/run-single`) mora imati u okolini **`TEST_FRONTEND_URL`** ili **`FRONTEND_URL`** postavljen na puni URL frontenda koji želiš da Playwright otvori. (`TEST_FRONTEND_URL` ima prioritet – korisno za lokalno testiranje bez mijenjanja `FRONTEND_URL` za email linkove.)
2. **Taj frontend** (dostupan na tom URL-u) mora biti **build** s **`VITE_API_URL`** koji pokazuje na **isti taj backend** (isti origin kao `req.protocol` + `req.get('host')` kad se run-single zove na tom backendu).

Nema drugog mehanizma u trenutnom kodu: API URL frontenda je fiksiran pri buildu.

---

## 3. Točni koraci (bez nagađanja)

### 3.1 Backend env

- Na stroju/servisu gdje radi backend koji servira run-single postavi **environment varijablu** (jednu od):
  - **`TEST_FRONTEND_URL`** (preporučeno za lokalno – ne diraš `FRONTEND_URL` za email linkove): npr. `TEST_FRONTEND_URL=http://localhost:5173`
  - **`FRONTEND_URL`**: puni URL frontenda (npr. `http://localhost:5173` ili `https://tvoj-frontend.example.com`), **bez** trailing slasha.
- Ako su oba postavljena, koristi se `TEST_FRONTEND_URL`.
- Primjer za lokalni backend (`.env` u `backend/`):  
  `TEST_FRONTEND_URL=http://localhost:5173`  
  (vidi `backend/ENV_EXAMPLE.txt` za ostale varijable.)

### 3.2 Frontend build koji će Playwright otvoriti

- Frontend koji serviraš na `FRONTEND_URL` mora biti buildan s **`VITE_API_URL`** jednakim **URL-u backenda** koji servira run-single (isti host/port kao u browseru kad zoveš run-single).
- **Format:** URL bez trailing slasha; **ne** dodavati `/api` na kraj – to radi `frontend/src/api.js` (redaci 11–14).
  - Primjeri: `VITE_API_URL=http://localhost:4000` ili `VITE_API_URL=https://api.uslugar.oriph.io`
- Gdje postaviti:
  - **Lokalno:** u `frontend/.env` (ili u shellu prije naredbe builda).
  - **CI/CD:** u env varijablama build koraka (npr. `VITE_API_URL=... npm run build`).
- Zatim u direktoriju `frontend/`:  
  `npm run build`  
  (ili odgovarajuća build naredba projekta.)  
  Taj build serviraj na domeni/portu koji si stavio u **`FRONTEND_URL`** na backendu.

### 3.3 Kako provjeriti na koji API ide postojeći frontend build

- Otvori u browseru stranicu na `FRONTEND_URL`.
- DevTools → Network.
- Napravi akciju koja šalje API zahtjev (npr. login, učitavanje liste).
- Klikni na API zahtjev i pogledaj **Request URL**.  
  **Origin** tog URL-a (shema + host + port) je API koji taj build koristi. Ako to nije isti backend koji servira run-single, delta će ostati 0 dok ne napraviš novi build s ispravnim `VITE_API_URL` i ne serviraš ga na `FRONTEND_URL`.

### 3.4 Lokalni primjer (sve na jednom stroju)

1. Backend na `http://localhost:4000`, u `backend/.env`:  
   `TEST_FRONTEND_URL=http://localhost:5173` (ili `FRONTEND_URL=http://localhost:5173`).
2. U `frontend/.env`:  
   `VITE_API_URL=http://localhost:4000`
3. Pokreni frontend dev server (npr. `npm run dev` u `frontend/`) – Vite u dev modu učitava `VITE_API_URL` iz `.env`.
4. Pokreni backend (npr. `npm run dev` u `backend/`).
5. Pozovi run-single na `http://localhost:4000` (npr. iz Admina ili s `curl`).  
   Playwright otvara `http://localhost:5173`, frontend šalje zahtjeve na `http://localhost:4000` → ApiRequestLog se upisuje na ovaj backend, delta će imati unose.

### 3.5 Produkcija / Render

- Na Renderu (ili drugom hostu) backend servis koji servira run-single u Environment varijablama treba imati **`TEST_FRONTEND_URL`** ili **`FRONTEND_URL`** = URL na kojem je deployan frontend koji želiš koristiti za testove.
- Taj frontend **mora** biti buildan s **`VITE_API_URL`** = puni URL tog backend servisa (npr. `https://tvoj-backend.onrender.com`).  
  Ako koristiš postojeći produkcijski build napravljen za drugi API (npr. stari backend), zahtjevi će ići na taj drugi API i u delti ovog backenda ostaje 0 – tada treba poseban build za testiranje (s `VITE_API_URL` na ovaj backend) i servirati ga na nekom URL-u koji onda staviš u `TEST_FRONTEND_URL` ili `FRONTEND_URL`.

---

## 4. Sažetak varijabli

| Varijabla | Gdje se koristi | Kada se čita | Svrha |
|-----------|------------------|--------------|--------|
| **TEST_FRONTEND_URL** | `backend/src/services/testRunnerService.js` (`_getFrontendUrl`) | Runtime | URL na koji Playwright otvara stranicu (prioritet nad FRONTEND_URL) |
| **FRONTEND_URL** | Isti servis + email/notifikacije | Runtime | Fallback za Playwright; inače linkovi u mailovima |
| **VITE_API_URL** | `frontend/src/api.js`, `frontend/api/http.js`, `frontend/src/hooks/usePushNotifications.js` | **Build time** (prilikom `vite build`) | API base URL ugrađen u frontend build; na taj URL frontend šalje zahtjeve |

Uvjet za punjenje ApiRequestLog u delti: frontend na URL-u iz `TEST_FRONTEND_URL` ili `FRONTEND_URL` mora biti buildan s `VITE_API_URL` = URL backenda koji servira run-single.
