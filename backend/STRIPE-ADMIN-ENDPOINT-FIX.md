# Stripe Admin Endpoint Fix - Implementacija

## Problem

Admin panel prikazuje "0 plaćenih/neplaćenih" iako postoje fakture na Stripe-u. Endpoint `/api/payments/admin/sessions` vraća prazan array jer `STRIPE_SECRET_KEY` nije dostupan u environment varijablama.

## Rješenje

### 1. Poboljšan Endpoint

**File:** `src/routes/payments.js`

Endpoint je poboljšan da:
- Pokušava inicijalizirati Stripe ako nije već inicijaliziran
- Dohvaća i checkout sessions i invoices iz Stripe-a
- Spaja podatke iz invoices sa sessions za potpuniji prikaz
- Dodaje debug logove za troubleshooting

### 2. AWS Secrets Manager Konfiguracija

Stripe keys su već u AWS Secrets Manager:
- **Secret ARN**: `arn:aws:secretsmanager:eu-north-1:666203386231:secret:uslugar/stripe-keys-4X5yVg`
- **Keys**: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`

### 3. ECS Task Definition

**Provjeri da li je ECS Task Definition ažuriran:**

1. Idi na AWS Console → ECS → Task Definitions → `uslugar`
2. Provjeri najnoviju reviziju
3. Provjeri da li u `secrets` array-u postoji:
   ```json
   {
     "name": "STRIPE_SECRET_KEY",
     "valueFrom": "arn:aws:secretsmanager:eu-north-1:666203386231:secret:uslugar/stripe-keys-4X5yVg::STRIPE_SECRET_KEY::"
   },
   {
     "name": "STRIPE_PUBLISHABLE_KEY",
     "valueFrom": "arn:aws:secretsmanager:eu-north-1:666203386231:secret:uslugar/stripe-keys-4X5yVg::STRIPE_PUBLISHABLE_KEY::"
   }
   ```

### 4. Ako Secrets Nisu Dodani

**Dodaj secrets u ECS Task Definition:**

1. AWS Console → ECS → Task Definitions → `uslugar`
2. Klikni "Create new revision"
3. U "Container definitions" → "uslugar" container
4. U "Environment variables and secrets" sekciji:
   - Klikni "Add additional configuration" → "Secrets"
   - Dodaj:
     - **Name**: `STRIPE_SECRET_KEY`
     - **Value from**: `arn:aws:secretsmanager:eu-north-1:666203386231:secret:uslugar/stripe-keys-4X5yVg::STRIPE_SECRET_KEY::`
   - Dodaj:
     - **Name**: `STRIPE_PUBLISHABLE_KEY`
     - **Value from**: `arn:aws:secretsmanager:eu-north-1:666203386231:secret:uslugar/stripe-keys-4X5yVg::STRIPE_PUBLISHABLE_KEY::`
5. Klikni "Create" da kreiraš novu reviziju
6. Ažuriraj ECS Service da koristi novu reviziju

### 5. Debug Logovi

Endpoint sada logira:
- `[ADMIN PAYMENTS] Fetching Stripe checkout sessions...`
- `[ADMIN PAYMENTS] Found X sessions and Y invoices from Stripe`

Ako vidiš:
- `[ADMIN PAYMENTS] Stripe not configured - STRIPE_SECRET_KEY missing` → Secret nije injektiran u ECS
- `[ADMIN PAYMENTS] Failed to fetch invoices: ...` → Problem s Stripe API pozivom

### 6. Testiranje

Nakon deploymenta:
1. Provjeri CloudWatch logove za `[ADMIN PAYMENTS]` poruke
2. Idi na `/admin/payments` u admin panelu
3. Trebalo bi prikazati sve checkout sessions i invoices

## Status

✅ **Implementirano:**
- Poboljšan endpoint s dohvatom invoices
- Dodana provjera za Stripe inicijalizaciju
- Dodani debug logovi

⏳ **Čeka:**
- ECS Task Definition ažuriranje (ako secrets nisu dodani)
- Deployment novog koda

## Sljedeći Korak

1. Commit i push promjene
2. Provjeri ECS Task Definition da li ima Stripe secrets
3. Ako nema, dodaj secrets preko AWS Console
4. Ažuriraj ECS Service da koristi novu reviziju
5. Testiraj admin panel

