# Infobip SMS – upute za Uslugar

Uslugar koristi **Infobip** za SMS poruke (verifikacija, lead obavijesti, refund). Twilio je zamijenjen.

---

## 1. Environment varijable

Dodaj u `.env` (lokalno) i Render Dashboard → Environment:

```env
INFOBIP_BASE_URL=https://eejv92.api.infobip.com
INFOBIP_API_KEY=your_api_key_here
INFOBIP_SENDER=ServiceSMS
```

**Sigurnost:** Ako si API ključ dijelio u chat-u ili bilo gdje, napravi novi u Infobip portalu (stari revoke).

---

## 2. Registracija (ako još nemaš račun)

1. **https://www.infobip.com/signup**
2. Odaberi **Transactions** i **By using code (APIs, SDKs)**
3. Verificiraj mobilni broj (trial šalje samo na verificirane brojeve)

---

## 3. API ključ

1. **https://portal.infobip.com** → Developers → API keys
2. Create API key, scope: `sms:message:send`
3. Spremi ključ – prikazuje se samo jednom
4. Base URL: `https://eejv92.api.infobip.com` (tvoj subdomain) ili `https://api.infobip.com`

---

## 4. Sender (trial)

Trial koristi `ServiceSMS` – ne treba dodatna konfiguracija.

Produkcija: naruči broj ili alfanumerički sender u portalu.

---

## 5. Test (curl)

```bash
curl -X POST "https://eejv92.api.infobip.com/sms/3/messages" \
  -H "Authorization: App YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"sender":"ServiceSMS","destinations":[{"to":"+385911234567"}],"content":{"text":"Test Uslugar"}}]}'
```

Zamijeni `YOUR_API_KEY` i broj s verificiranim mobilnim.

---

## 6. Render.com

1. Dashboard → Backend servis → Environment
2. Add:
   - `INFOBIP_BASE_URL` = `https://eejv92.api.infobip.com`
   - `INFOBIP_API_KEY` = tvoj API ključ
   - `INFOBIP_SENDER` = `ServiceSMS`
3. Redeploy

---

## 7. Ograničenja trial

- 60 dana
- Do 100 poruka po kanalu
- Samo na verificirane brojeve

---

## 8. Korisni linkovi

| Stranica | URL |
|----------|-----|
| Portal | https://portal.infobip.com |
| Registracija | https://www.infobip.com/signup |
| SMS API | https://www.infobip.com/docs/sms/api |
