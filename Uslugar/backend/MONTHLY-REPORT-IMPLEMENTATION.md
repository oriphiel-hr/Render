# Mjesečni izvještaj o isporučenim leadovima - Implementacija

## Pregled

Mjesečni izvještaj o isporučenim leadovima automatski generira i šalje klijentima detaljne izvještaje o isporučenim leadovima u obračunskom periodu, uključujući statistike, trendove i billing informacije.

## Status

✅ **POTPUNO IMPLEMENTIRANO**

## Implementacija

### 1. Servis za generiranje izvještaja

**File:** `src/services/report-generator.js`

- `generateMonthlyReport(providerId, year, month)` - Generira mjesečni izvještaj s:
  - Statistikama (ukupno kupljenih, konvertiranih, stopa konverzije, procijenjeni prihod)
  - Statistikama po kategorijama
  - Trend analizom (usporedba s prošlim mjesecom)
  - Billing informacijama (očekivani vs isporučeni leadovi, korekcije)
  - Listom svih leadova u periodu
  - Credit transakcijama

- `getBillingInfoForPeriod(providerId, periodStart, periodEnd)` - Dohvaća billing informacije:
  - Aktivne billing planove korisnika
  - Billing adjustments za period
  - Ukupne statistike (očekivani, isporučeni, razlika, krediti iz korekcija)

### 2. Servis za slanje email izvještaja

**File:** `src/services/monthly-report-service.js`

- `sendMonthlyReport(providerId, year, month)` - Šalje mjesečni izvještaj određenom korisniku
- `sendMonthlyReportsToAllUsers()` - Šalje izvještaje svim aktivnim korisnicima za prošli mjesec
- `generateEmailTemplate(reportData)` - Generira HTML email template s:
  - Statistikama (kupljeni, konvertirani, stopa konverzije, prihod)
  - Billing informacijama (očekivani vs isporučeni leadovi)
  - Trendovima (usporedba s prošlim mjesecom)
  - Top kategorijama
  - Linkom na detaljnu analitiku

### 3. Automatsko slanje (Cron Job)

**File:** `src/lib/queueScheduler.js`

- Cron job pokreće se **1. dana u mjesecu u 9:00**
- Automatski šalje izvještaje za **prošli mjesec** svim aktivnim korisnicima
- Logira rezultate (poslano, neuspješno, greške)

### 4. API Endpoints

**File:** `src/routes/provider-roi.js`

- `POST /api/roi/send-monthly-report` - Ručno pošalji mjesečni izvještaj emailom
  - Body: `{ year?, month? }` (opcionalno - default: prošli mjesec)
  - Auth: PROVIDER

**File:** `src/routes/admin.js`

- `POST /api/admin/reports/send-monthly-reports` - Pošalji izvještaje svim korisnicima
  - Body: `{ year?, month? }` (opcionalno - default: prošli mjesec)
  - Auth: ADMIN

- `POST /api/admin/reports/send-monthly-report/:userId` - Pošalji izvještaj određenom korisniku
  - Body: `{ year?, month? }` (opcionalno - default: prošli mjesec)
  - Auth: ADMIN

### 5. Billing Integracija

Izvještaj uključuje billing informacije:
- **Očekivani leadovi** - iz BillingPlan.expectedLeads
- **Isporučeni leadovi** - iz LeadPurchase za period
- **Razlika** - deliveredLeads - expectedLeads
- **Krediti iz korekcija** - iz BillingAdjustment gdje je adjustmentType = 'CREDIT'
- **Detalji po planovima** - za svaki aktivni BillingPlan

## Email Template

Email uključuje:
- 📊 Statistike (kupljeni, konvertirani, stopa konverzije, prihod)
- 💰 Billing informacije (očekivani vs isporučeni leadovi)
- 📈 Trendovi (usporedba s prošlim mjesecom)
- 🏆 Top kategorije
- 🔗 Link na detaljnu analitiku u dashboardu

## Korištenje

### Automatsko slanje

Izvještaji se automatski šalju 1. dana u mjesecu u 9:00 za prošli mjesec.

### Ručno slanje (korisnik)

```bash
POST /api/roi/send-monthly-report
Authorization: Bearer <token>
Content-Type: application/json

{
  "year": 2025,
  "month": 11
}
```

### Ručno slanje (admin - svi korisnici)

```bash
POST /api/admin/reports/send-monthly-reports
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "year": 2025,
  "month": 11
}
```

### Ručno slanje (admin - određeni korisnik)

```bash
POST /api/admin/reports/send-monthly-report/:userId
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "year": 2025,
  "month": 11
}
```

## Prednosti

1. **Transparentnost** - Klijenti dobivaju detaljne informacije o isporučenim leadovima
2. **Automatsko** - Nema potrebe za ručnim slanjem
3. **Billing informacije** - Uključuje očekivane vs isporučene leadove i korekcije
4. **Trend analiza** - Usporedba s prošlim mjesecom
5. **Profesionalni email** - HTML formatirani izvještaj

## Status

✅ **Implementirano:**
- Generiranje mjesečnih izvještaja s billing informacijama
- Email servis za slanje izvještaja
- Automatsko slanje (cron job - 1. dan u mjesecu)
- API endpointi za ručno slanje
- Admin endpointi za upravljanje
- HTML email template
- Integracija s billing sustavom

