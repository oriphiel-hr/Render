# oriphiel-digital-services

Zaseban projekt za Oriphiel digitalne usluge (odvojeno od Uslugara).

## Cilj

- Zaprimanje partner upita preko javne forme
- Admin obrada upita (statusi, dodjela, sljedeća akcija)
- Jasna poslovna i tehnička separacija od Uslugara

## Struktura

- `backend/` - Express API + Prisma
- `frontend/` - Vite + React javna forma i admin pregled
- `docs/` - interni workflow, SLA, operativne upute

## Brzi start

1. Backend
   - `cd backend`
   - `npm install`
   - kopiraj `.env.example` u `.env`
   - `npx prisma migrate dev --name init_partner_inquiries`
   - `npm run dev`
2. Frontend
   - `cd frontend`
   - `npm install`
   - `npm run dev`

## Napomena

Ovaj repo je namjerno izoliran da razvoj novih usluga ne utjece na produkciju Uslugara.
# Oriphiel Partner Upiti (Novi Projekt)

Ovaj direktorij je inicijalni root za odvojeni projekt:
- nova stranica na Hostingeru
- nova baza na Renderu

## Faza A - File-by-file task lista

- `backend/prisma/schema.prisma`
  - dodati model `PartnerInquiry`
  - dodati enume: `PartnerInquiryStatus`, `PartnerInquirySource`, `PartnerInquiryServiceType`
  - dodati indekse: `status`, `source`, `serviceType`, `createdAt`, `assignedTo`

- `backend/prisma/migrations/*`
  - generirati migraciju za novi model

- `backend/src/routes/public.js`
  - dodati `POST /api/partner-inquiries` (validacija, rate-limit, honeypot)
  - standardizirani response: `{ success: true, id }`

- `backend/src/routes/admin.js`
  - dodati:
    - `GET /api/admin/partner-inquiries`
    - `GET /api/admin/partner-inquiries/:id`
    - `PATCH /api/admin/partner-inquiries/:id`
    - `GET /api/admin/partner-inquiries/stats`
  - svi endpointi iza `auth(true, ['ADMIN'])`

- `backend/src/lib/validation.js`
  - validacija payloada za public create i admin update

- `backend/src/lib/rate-limit.js`
  - limiter profil za partner inquiry endpoint (strozi nego opci)

- `backend/src/lib/email.js`
  - `sendPartnerInquiryConfirmationEmail`
  - opcionalno: interna notifikacija adminu

- `frontend/src/App.jsx`
  - nova tab/ruta: `partner-services` u `validTabs`
  - dodati navigacijski link
  - render sekcije/komponente za javnu formu

- `frontend/src/pages/PartnerServices.jsx` (novo)
  - forma za zaprimanje upita + disclaimer
  - submit na `POST /api/partner-inquiries`
  - success/error state

- `frontend/src/admin/router.jsx`
  - import + route: `/admin/partner-inquiries`

- `frontend/src/admin/Layout.jsx`
  - sidebar stavka: `Partner upiti`
  - title mapiranje za breadcrumb

- `frontend/src/pages/AdminPartnerInquiries.jsx` (novo)
  - tablica, filteri, paginacija
  - detail drawer/modal
  - quick update: `status`, `assignedTo`, `nextActionAt`

- `frontend/src/api/index.js`
  - helper metode za partner inquiry API pozive (opcionalno, preporuceno)

- `docs/`
  - interni dokument: workflow statusa (`NEW -> ...`) + SLA pravilo

