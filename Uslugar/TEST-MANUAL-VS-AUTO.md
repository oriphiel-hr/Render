# Ručni vs. automatski testovi

## Svi testovi imaju Automatski gumb 🤖

Svi testovi u Admin Testing stranici imaju i Ručni i Automatski gumb. Backend mapira `testId` na `testType` kroz `backend/src/config/testTypes.js`.

## Implementacija automatskih testova

| Tip | Testovi | Opis |
|-----|---------|------|
| **registration** | 1.1, 1.2, 1.4 | Playwright + Mailpit (registracija, verifikacija linka) |
| **login** | 1.3 | Playwright – prijava u formu |
| **forgot-password** | 1.5 | Playwright – reset lozinke |
| **jwt-auth** | 1.6 | API – login + /me |
| **categories-load** | 2.1 | API – GET /api/categories |
| **categories-hierarchy** | 2.2 | API – GET /api/categories?tree=true |
| **jobs-filter** | 2.3 | API – GET /api/jobs |
| **verify-registar** | 14.1 | API – Sudski/Obrtni registar |
| **provider-profile** | 6.1 | API – GET /api/providers |
| **director-dashboard** | 19.1, 19.2 | API – login + /api/director/team |
| **admin-kyc-metrics** | 26.4 | API – login admin + verification-documents |
| **saved-search** | 25.1 | API – login + /api/saved-searches |
| **job-alert** | 25.2, 25.3 | API – login + /api/job-alerts |
| **wizard** | 27.1, 27.2, 27.3 | API – login provider + /api/wizard/status |
| **roi-dashboard** | 29.1–29.4 | API – login provider + /api/exclusive/roi |
| **credit-history** | 30.3 | API – login provider + lead-queue/credits |
| **cors** | 31.1 | API – GET /api/health |
| **rate-limiting** | 31.3 | API – višestruki login zahtjevi |
| **sql-injection** | 31.4 | API – test parametrizacije |
| **_stubTest** | ostalo | Osnovna provjera – vraća success, za punu provjeru koristi ručni |

## API-only testovi (bez checkpointa/rollbacka)

Testovi s `apiOnly: true` ne kreiraju checkpoint niti izvršavaju rollback jer ne mijenjaju bazu.
