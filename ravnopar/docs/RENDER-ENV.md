# Ravnopar — Render env varijable

## ravnopar-backend

Postavi u **Environment** (Dashboard → ravnopar-backend → Environment):

| Key | Vrijednost |
|-----|------------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Internal Database URL iz `ravnopar-db` → Connections |
| `JWT_SECRET` | jak random string (min. 32 znaka) |
| `FRONTEND_BASE_URL` | `https://ravnopar-frontend.onrender.com` |
| `DAILY_CONTACT_LIMIT` | `30` |
| `FIRST_USER_IS_ADMIN` | `false` |

Opcionalno: `STRIPE_SECRET_KEY`

**Build Command:**
```
npm install && npm run build
```

**Start Command:** `npm run start`  
**Health Check Path:** `/health`  
**Root Directory:** `ravnopar/backend`

Nakon prvog deploya (samo staging): Shell → `npm run seed`

---

## ravnopar-frontend

| Key | Vrijednost |
|-----|------------|
| `VITE_API_BASE_URL` | `https://ravnopar-backend.onrender.com/api` |

Opcionalno (dobrovoljne donacije):

| Key | Vrijednost |
|-----|------------|
| `VITE_DONATE_IBAN` | HRxx... (bankovna uplata) |
| `VITE_DONATE_RECIPIENT` | Ime i prezime primatelja |
| `VITE_DONATE_REFERENCE` | `Ravnopar donacija` |
| `VITE_DONATE_STRIPE_URL` | Stripe Payment Link (opcionalno, umjesto integriranog checkouta) |

**Backend** (donacije karticom preko Stripe Checkout):

| Key | Vrijednost |
|-----|------------|
| `STRIPE_SECRET_KEY` | `sk_test_...` ili `sk_live_...` iz Stripe Dashboarda |

**Build Command:** `npm install && npm run build`  
**Publish Directory:** `dist`  
**Root Directory:** `ravnopar/frontend`

**Redirects/Rewrites:**

| Source | Destination | Action |
|--------|-------------|--------|
| `/*` | `/index.html` | Rewrite (200) |

---

## Provjera

```bash
curl https://ravnopar-backend.onrender.com/health
```

Frontend: otvori https://ravnopar-frontend.onrender.com i probaj registraciju.
