# Ravnopar

Dating aplikacija inspirirana klasicnim matchmaking modelom, ali s postenom logikom:

- nema ogranicavanja dometa komunikacije
- svi imaju priliku za razgovor
- kad se uspostavi obostrani kontakt, ostali korisnici ne trose vrijeme na taj par

## Vizija

Ravnopar je fokusiran na kvalitetu i fer raspodjelu paznje, ne na umjetna ogranicenja.

## Osnovna pravila proizvoda

1. Nema paywall-a za osnovnu komunikaciju.
2. Profil koji je u aktivnom obostranom kontaktu ide u status "zauzet", pa se manje prikazuje drugima.
3. Ako kontakt ne napreduje, status se automatski vraca u "dostupan".
4. Transparentan "Fairness score" na razini sustava (ne javno na profilu).

## Struktura

- `backend/` API i business pravila
- `frontend/` korisnicki i admin dio aplikacije
- `docs/` produkt dokumentacija i pravila postenog sparivanja

## Quick start

1. Backend
   - `cd backend`
   - kopiraj `.env.example` u `.env`
   - `npm install`
   - `npx prisma migrate deploy`
   - `npx prisma generate`
   - `npm run seed`
   - `npm run dev`
2. Frontend
   - `cd frontend`
   - `npm install`
   - `npm run dev`
