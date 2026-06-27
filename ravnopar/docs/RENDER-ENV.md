# Ravnopar — Render env varijable

## ravnopar-backend

| Key | Vrijednost |
|-----|------------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Internal Database URL iz `ravnopar-db` |
| `JWT_SECRET` | jak random string (min. 32 znaka) |
| `FRONTEND_BASE_URL` | `https://ravnopar-frontend.onrender.com` |
| `DAILY_CONTACT_LIMIT` | `30` |
| `FIRST_USER_IS_ADMIN` | `false` |

### Email (preporučeno u produkciji)

| Key | Opis |
|-----|------|
| `SMTP_HOST` | npr. `smtp.hostinger.com` |
| `SMTP_PORT` | `587` (STARTTLS) ili `465` (SSL) |
| `SMTP_SECURE` | samo za port **465**: `true`. Za port **587** ostavi prazno ili `false` |
| `SMTP_USER` | puni email, npr. `ravnopar@oriph.io` |
| `SMTP_PASS` | lozinka mail računa |
| `MAIL_FROM` | `Ravnopar <ravnopar@oriph.io>` |
| `ADMIN_NOTIFY_EMAIL` | email za admin obavijesti o prijavama |

**Hostinger (preporučeno):**
```
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=ravnopar@oriph.io
SMTP_PASS=<lozinka>
MAIL_FROM=Ravnopar <ravnopar@oriph.io>
```
Ne postavljaj `SMTP_SECURE` na portu 587 — inače dobiješ `wrong version number` u logu.

Bez SMTP-a kodovi se logiraju u backend konzolu (Render → Logs).

| Key | Opis |
|-----|------|
| `MESSAGE_EMAIL_COOLDOWN_MS` | Cooldown emaila za nove poruke (default `900000` = 15 min) |

### Monitoring

Vidi [MONITORING.md](./MONITORING.md) — UptimeRobot na `/health`.

### Stripe Premium

| Key | Opis |
|-----|------|
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (`checkout.session.completed`) |
| `PLANS_ENABLED` | `true` kad želiš uključiti Premium checkout |

Webhook URL u Stripe Dashboardu:
```
https://ravnopar-backend.onrender.com/api/payments/stripe/webhook
```

### S3/R2 pohrana fotografija (opcionalno)

| Key | Opis |
|-----|------|
| `S3_BUCKET` | ime bucketa |
| `S3_ENDPOINT` | npr. R2 endpoint |
| `S3_ACCESS_KEY` | access key |
| `S3_SECRET_KEY` | secret key |
| `S3_PUBLIC_BASE_URL` | javni URL prefiks |
| `S3_REGION` | `auto` za R2 |

Bez S3-a fotografije ostaju u bazi (base64) — OK za start.

### Anti-bot (opcionalno)

| Key | Opis |
|-----|------|
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret |

**Build:** `npm install && npm run build`  
**Start:** `npm run start`  
**Health:** `/health`  
**Root:** `ravnopar/backend`

Migracije se pokreću automatski u build koraku (`prisma migrate deploy`).

---

## ravnopar-frontend

| Key | Vrijednost |
|-----|------------|
| `VITE_API_BASE_URL` | `https://ravnopar-backend.onrender.com/api` |
| `VITE_CONTACT_EMAIL` | `podrska@ravnopar.app` |
| `VITE_PLANS_ENABLED` | `false` (ili `true` uz Stripe) |

### Donacije

| Key | Opis |
|-----|------|
| `VITE_DONATE_IBAN` | IBAN |
| `VITE_DONATE_RECIPIENT` | Primatelj |
| `VITE_DONATE_REFERENCE` | `Ravnopar donacija` |
| `VITE_DONATE_REVOLUT_URL` | Revolut link |

### Analitika i captcha (opcionalno)

| Key | Opis |
|-----|------|
| `VITE_ANALYTICS_URL` | Plausible/Umami script URL |
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key |

**Build:** `npm install && npm run build`  
**Publish:** `dist`  
**Root:** `ravnopar/frontend`  
**Rewrite:** `/*` → `/index.html` (200)

---

## Provjera nakon deploya

```bash
curl https://ravnopar-backend.onrender.com/health
curl https://ravnopar-backend.onrender.com/api/matchmaking/public-stats
```

Checklist:
- [ ] Registracija + email kod (ili dev kod u logu)
- [ ] Reset lozinke (`/auth?reset=1`)
- [ ] Upload fotografije u Postavkama
- [ ] Match + chat + nepročitane poruke
- [ ] Admin `/admin` — korisnici, moderacija, plaćanja
- [ ] Cookie banner + footer linkovi
