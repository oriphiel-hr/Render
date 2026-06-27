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

Opcionalno drugi monitor za frontend:

```
https://ravnopar-frontend.onrender.com/
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

## Env (opcionalno)

| Key | Opis |
|-----|------|
| `MESSAGE_EMAIL_COOLDOWN_MS` | Cooldown email obavijesti za poruke (default 900000 = 15 min) |
| `ADMIN_NOTIFY_EMAIL` | Alert email za admin prijave |
