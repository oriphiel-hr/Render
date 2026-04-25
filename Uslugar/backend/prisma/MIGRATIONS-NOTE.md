# Napomene o migracijama

## Ožujak 2026 – čišćenje neuspjele migracije

- **Migracija `20250208120000_rename_subjekt_id_to_mbo`**  
  U bazi je bila zabilježena kao neuspjela, ali datoteka migracije više ne postoji u repou (vjerojatno stara/uklonjena). U trenutnoj shemi nema polja `subjekt_id` ni `mbo`, pa ta migracija nije potrebna.  
  Označena je kao **rolled back** naredbom:  
  `npx prisma migrate resolve --rolled-back "20250208120000_rename_subjekt_id_to_mbo"`

- **Prazan folder `_add_provider_approval_status`**  
  U `prisma/migrations/` postojao je prazan folder (bez `migration.sql`), što je uzrokovalo grešku pri `migrate deploy`. Folder je uklonjen. Puna verzija iste promjene nalazi se u migraciji `20250128000000_add_provider_approval_status`.

Nakon toga `npx prisma migrate deploy` prolazi bez greške.

## Travanj 2026 – platform growth (trust, favoriti, instant, spor, podsjetnici)

- Migracija: `20260425120000_platform_growth_mvp`.
- **Ako je shema već primijenjena s `prisma db push`**, a zatim želiš uskladiti **Povijest migracija** s bazom:  
  `npx prisma migrate resolve --applied 20260425120000_platform_growth_mvp`  
  (iz `backend/`, s ispravnim `DATABASE_URL`), pa onda u budućnosti samo `npm run migrate:deploy`.
- **Ili** samo na čistoj bazi pokreni `npx prisma migrate deploy` – primijenit će SQL iz mape migracije.
- U monorepu root: `npm run db:migrate:backend` pokreće `migrate:deploy` u backend workspaceu.
- **Render:** u build ili release koraku (nakon `prisma generate`) uobičajeno je `cd backend && npx prisma migrate deploy` s `DATABASE_URL` produkcije.
