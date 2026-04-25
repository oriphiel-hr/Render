# Uslugar — što je u repou vs. izvan trenutnog opsega

Sažetak stanja platforme (brzi termini, sporovi, isplate, kalendar). Ažurirati kad se doda veća značajka. Usporedba s konkretnim tržišnim platformama: [COMPETITIVE-FEATURES-MATRIX.md](COMPETITIVE-FEATURES-MATRIX.md). Dugoročni slojevi (a11y, i18n, podrška, SEO, revizija sigurnosti, DSGVO): [ENTERPRISE-READINESS-CHECKLIST.md](ENTERPRISE-READINESS-CHECKLIST.md).

## Pregled

| Tema | Stanje u repou |
|------|----------------|
| **Pružatelj na webu — unos slotova + dolazni instant** | **Da.** `ProviderAvailabilityPanel.jsx` u **Moj profil pružatelja** (`frontend/src/pages/ProviderProfile.jsx`), API `GET/POST/DELETE /growth/availability-slots`, `GET/PATCH /growth/instant-bookings`. |
| **Klijent na webu — moji poslani brzi termini** | **Da.** `ClientInstantBookingsPanel.jsx` u **Korisnički profil** (`UserProfile.jsx`), `GET /growth/instant-bookings?view=client`, `PATCH` za odustanak / prihvat alternativnog termina. |
| **Mobilno — ista logika** | **Da.** `getInstantBookingRequests({ view: 'client' })`, `listInstantAsClient` i `patchInstant` u `useGrowthFlow` (`packages/shared` + `mobile/src/hooks/useGrowthFlow.js`). Default `listInstant` i dalje: dolazni za PROVIDER, odlazni za USER. |
| **Puni CRM / tiket workflow** | **Ne** — nema odvojenog sustava tipa Zendesk. Postoje `DisputeCase`, admin `PATCH /growth/disputes/:id`, korisnički obrasci; to je *lagani* workflow, ne puni CRM. |
| **Stvarne isplate (automatizam)** | **Ne** — polja poput `payoutAmountCents` su informativna / za ručni proces; nema bankovne integracije u ovom opsegu. |
| **Kalendar s ponavljanjem (RRULE)** | **Ne** — nema RRULE u kodu; slotovi su jednokratni `startAt` / `endAt` u `ProviderAvailabilitySlot`. |

**Što nije u opsegu** (npr. puni CRM, isplate, RRULE) **ostaje kako je u ovoj tablici** — to nije „riješeno“ u smislu cjelovitog proizvoda, već je **namjerno izvan trenutnog kruga** rada. Ne treba to tumačiti kao da je zadatak propao; tablica opisuje namjenu.

**Sljedeći korak (ručno):** na stvarnom backendu proći **Profil (mobil)** → osvježavanje liste brzih termina, zatim **odustajanje** i **prihvaćanje** alternativnog termina (gdje postoji) i provjeriti da se stanje ažurira očekivano.

## API: brzi termini (referenca)

- `GET /api/growth/instant-bookings` — default: `USER` → moji odlazni; `PROVIDER` → dolazni.
- `GET /api/growth/instant-bookings?view=client` — uvijek **moji odlazni** (i za pružatelja koji je tražio tuđu uslugu).
- `PATCH /api/growth/instant-bookings/:id` — `action`: pružatelj `confirm` \| `decline` \| `counter`; klijent `cancel` \| `accept_counter`.
