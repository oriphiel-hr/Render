# Automatski E2E Testovi

Ovaj direktorij sadrži automatske E2E testove za platformu Uslugar koristeći Playwright.

## Instalacija

```bash
cd tests
npm install
npx playwright install
```

## Test Data

**Svaki test automatski kreira svojeg korisnika i briše ga nakon završetka!**

Ovo osigurava:
- ✅ **Predvidljiv broj korisnika** - svaki test ima svojeg korisnika
- ✅ **Izolirani testovi** - testovi se ne utječu jedan na drugog
- ✅ **Čisto okruženje** - nema zaostalih korisnika nakon testova
- ✅ **Paralelno izvršavanje** - testovi mogu raditi paralelno bez konflikata

Test podaci se nalaze u `test-data.json` i uključuju:
- **Korisnike**: email, lozinka, podaci za registraciju
- **Dokumente**: licence, KYC dokumente, portfolio slike
- **Test podatke**: poslovi, ponude, recenzije
- **API konfiguraciju**: base URL-ovi i timeoutovi

### Odabir Korisnika

Testovi automatski odabiru korisnike iz `test-data.json` koristeći `user-helper.js`:

**Strategije odabira:**
- `'first'` (default) - Koristi prvog dostupnog korisnika određenog tipa
- `'specific'` - Koristi korisnika na određenom indexu (0 = glavni, 1 = client1, 2 = client2, itd.)
- `'random'` - Koristi nasumičnog korisnika određenog tipa

**Primjer korištenja:**
```javascript
import { getUser } from '../lib/user-helper.js';

// Koristi prvog dostupnog client korisnika (client, client1, client2, ...)
const user = getUser(testData, 'client', { strategy: 'first' });

// Koristi drugog client korisnika (client1)
const user2 = getUser(testData, 'client', { strategy: 'specific', index: 1 });

// Koristi nasumičnog provider korisnika
const randomProvider = getUser(testData, 'provider', { strategy: 'random' });
```

**Podržani tipovi korisnika:**
- `'client'` - Klijenti (client, client1, client2, ...)
- `'provider'` - Pružatelji (provider, provider1, provider2, ...)
- `'admin'` - Administratori (admin, admin1, admin2, ...)
- `'providerCompany'` - Pružatelji kao tvrtke (providerCompany)

**Kako test zna kojeg korisnika koristiti:**
- Default strategija je `'first'` - test automatski koristi prvog dostupnog korisnika određenog tipa
- Ako postoji `client`, koristi se `client`
- Ako postoji `client1`, a `client` ne postoji, koristi se `client1`
- Ako želite specifičnog korisnika, koristite `strategy: 'specific', index: X`

## Pokretanje Testova

### Svi testovi
```bash
npm test
```

### Specifični test
```bash
npx playwright test e2e/auth.spec.js
```

### U headed modu (vidljiv browser)
```bash
npx playwright test --headed
```

### Debug mod
```bash
npx playwright test --debug
```

## Test Data Konfiguracija

### Korisnici

Definiraj email, lozinku i pristup emailu u `test-data.json`:

```json
{
  "users": {
    "client": {
      "email": "test.client@uslugar.hr",
      "password": "Test123456!",
      "emailAccess": true
    }
  }
}
```

### Dokumenti

Dokumenti (licence, KYC dokumenti, slike) trebaju biti u `tests/fixtures/` folderu.

Kreiraj placeholder dokumente ili koristi stvarne dokumente za testiranje.

## Test Coverage

- ✅ **AUTH**: Registracija, prijava, verifikacija emaila, reset lozinke
- ✅ **KYC**: Upload dokumenta, ekstrakcija OIB-a
- ✅ **JOBS**: Objava posla, filtri, statusi
- ✅ **LEADS**: Kupnja leadova, ponude, ROI statusi
- ✅ **CHAT**: Slanje poruka
- ✅ **REVIEWS**: Ocjenjivanje i recenzije
- ✅ **ALL-DOMAINS**: Kompletan E2E flow

## CI/CD Integracija

Testovi se mogu pokrenuti u CI/CD pipeline-u:

```yaml
- name: Run E2E tests
  run: |
    cd tests
    npm install
    npx playwright install
    npx playwright test
```

## Napomene

- Email verifikacija i reset lozinke zahtijevaju pristup emailu ili mock email servis
- Dokument upload testovi zahtijevaju postojeće dokumente u `fixtures/` folderu
- Testovi koriste stvarne API endpointove (definirano u `test-data.json`)

