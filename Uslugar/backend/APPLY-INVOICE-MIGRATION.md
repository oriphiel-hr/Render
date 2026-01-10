# Migracija Invoice Model

## Opis
Ova migracija dodaje Invoice model za fakturiranje pretplata i kupovine leadova.

## Struktura
- **InvoiceType enum**: SUBSCRIPTION, LEAD_PURCHASE
- **InvoiceStatus enum**: DRAFT, SENT, PAID, CANCELLED
- **Invoice table**: Kompletna tabela s veza na User, Subscription, LeadPurchase

## Pokretanje migracije

### Development (sa Prisma)
```bash
cd uslugar/backend
npx prisma migrate dev --name add_invoice_model
```

### Production (bez Prisma)
```bash
# Spoji se na bazu podataka
psql -h <host> -U <user> -d uslugar_db -f prisma/migrations/20250204000000_add_invoice_model/migration.sql
```

### AWS RDS (preko CloudShell)
```bash
# Eksportiraj migraciju
cat prisma/migrations/20250204000000_add_invoice_model/migration.sql | psql -h <rds-endpoint> -U postgres -d uslugar_db
```

## Provjera nakon migracije

```sql
-- Provjeri da li su enum-ovi kreirani
SELECT typname FROM pg_type WHERE typname IN ('InvoiceType', 'InvoiceStatus');

-- Provjeri da li je tabela kreirana
SELECT tablename FROM pg_tables WHERE tablename = 'Invoice';

-- Provjeri strukturu
\d "Invoice"
```

## Rollback (ako je potrebno)

```sql
-- Brisanje foreign key constraints
ALTER TABLE "Invoice" DROP CONSTRAINT IF EXISTS "Invoice_userId_fkey";
ALTER TABLE "Invoice" DROP CONSTRAINT IF EXISTS "Invoice_subscriptionId_fkey";
ALTER TABLE "Invoice" DROP CONSTRAINT IF EXISTS "Invoice_leadPurchaseId_fkey";

-- Brisanje indexa
DROP INDEX IF EXISTS "Invoice_invoiceNumber_key";
DROP INDEX IF EXISTS "Invoice_userId_idx";
DROP INDEX IF EXISTS "Invoice_type_idx";
DROP INDEX IF EXISTS "Invoice_status_idx";
DROP INDEX IF EXISTS "Invoice_issueDate_idx";

-- Brisanje tabele
DROP TABLE IF EXISTS "Invoice";

-- Brisanje enum-ova
DROP TYPE IF EXISTS "InvoiceStatus";
DROP TYPE IF EXISTS "InvoiceType";
```

## Napomene
- Migracija je idempotentna - može se pokrenuti više puta bez greške
- InvoiceNumber mora biti unique (constraint)
- Automatsko kreiranje faktura se događa u:
  - `activateSubscription()` u `routes/payments.js`
  - `purchaseLead()` u `services/lead-service.js`

