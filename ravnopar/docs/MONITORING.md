# Ravnopar — monitoring

## Health check

Backend endpoint (za UptimeRobot, Better Stack, itd.):

```
GET https://ravnopar-backend.onrender.com/health
```

Očekivani odgovor (200):

```json
{
  "ok": true,
  "service": "ravnopar-backend",
  "startedAt": "2026-06-28T...",
  "database": "ok"
}
```

Ako baza nije dostupna → **503** i `"database": "error"`.

---

## UptimeRobot (besplatno)

1. Registracija na [uptimerobot.com](https://uptimerobot.com)
2. **Add New Monitor**
   - Monitor Type: **HTTP(s)**
   - Friendly Name: `Ravnopar Backend`
   - URL: `https://ravnopar-backend.onrender.com/health`
   - Monitoring Interval: 5 min
3. **Alert Contacts** → tvoj email (i opcionalno SMS)
4. Spremi

Opcionalno drugi monitor za frontend (`ravnopar` static site):

```
https://ravnopar.onrender.com/
```

---

## Render Logs

Render Dashboard → **ravnopar-backend** → **Logs**

Korisno za:
- SMTP / email greške (`[ravnopar-mail:error]`)
- Prisma migracije pri deployu
- 5xx greške

---

## Ručna provjera

```bash
curl https://ravnopar-backend.onrender.com/health
curl https://ravnopar-backend.onrender.com/api/matchmaking/public-stats
```

---

## Cron (anti-ghosting)

Postavi `CRON_SECRET` na backendu i pozivaj dnevno:

```bash
curl -X POST https://ravnopar-backend.onrender.com/api/matchmaking/internal/cron/sweep \
  -H "x-cron-secret: YOUR_SECRET"
```

Zatvara neaktivne razgovore, šalje upozorenja i istječe stare PENDING zahtjeve.

Opcionalno: `MONTHLY_OPERATING_COST_CENTS=2500` za postotak pokrivenosti donacijama.

---

## Plausible (posjete stranici)

Analitika se učitava **tek nakon** „Razumijem” na cookie banneru (GDPR).

| Env | Vrijednost |
|-----|------------|
| `VITE_ANALYTICS_URL` | `https://plausible.io/js/pa-en9H0khVpSTdd-AfH6hU1.js` |

Dashboard: [plausible.io](https://plausible.io) — posjete, stranice, izvori prometa.

**Napomena:** Search Console i dalje pokazuje samo klikove iz Google pretrage; Plausible pokriva sve posjete (direktne, bookmark, društvene mreže).

Na Renderu postavi isti `VITE_ANALYTICS_URL` i redeploy frontenda.

---

| Key | Opis |
|-----|------|
| `MESSAGE_EMAIL_COOLDOWN_MS` | Cooldown email obavijesti za poruke (default 900000 = 15 min) |
| `ADMIN_NOTIFY_EMAIL` | Alert email za admin prijave |
