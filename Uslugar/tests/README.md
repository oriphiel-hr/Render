# Automatski E2E Testovi

Ovaj direktorij sadrži automatske E2E testove za platformu Uslugar koristeći Playwright.

## Instalacija

```bash
cd tests
npm install
npx playwright install
```

## Test Data

Test podaci se nalaze u `test-data.json` i uključuju:
- **Korisnike**: email, lozinka, podaci za registraciju
- **Dokumente**: licence, KYC dokumente, portfolio slike
- **Test podatke**: poslovi, ponude, recenzije
- **API konfiguraciju**: base URL-ovi i timeoutovi

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

