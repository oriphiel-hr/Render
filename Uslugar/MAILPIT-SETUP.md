# 📧 Mailpit Setup Guide

Mailpit je lokalni SMTP testing server koji hvata sve emailove za testiranje. Idealno je za development i E2E testiranje jer ne zahtijeva API key-eve ili cloud servise.

## 📍 Lokacija

- **Lokalno testiranje:** Koristi ovaj vodič
- **Render deployment:** Vidi [MAILPIT-RENDER-SETUP.md](./MAILPIT-RENDER-SETUP.md)

## 🎯 Quick Start

**1. Pokreni Mailpit:**
```bash
docker run -d -p 8025:8025 -p 1025:1025 axllent/mailpit
```

**2. Postavi Mailpit varijable u `backend/.env`:**
```env
MAILPIT_SMTP_HOST=localhost
MAILPIT_SMTP_PORT=1025
MAILPIT_SMTP_USER=test@uslugar.hr
MAILPIT_SMTP_PASS=
```

**3. Provjeri:** Otvori http://localhost:8025

**Napomena:** Mailpit-specifične varijable (`MAILPIT_*`) imaju prioritet nad standardnim SMTP varijablama. Ako su postavljene, koriste se umjesto `SMTP_*` varijabli.

## 🚀 Korak 1: Pokreni Mailpit

### Opcija A: Docker (Preporučeno)

```bash
docker run -d -p 8025:8025 -p 1025:1025 axllent/mailpit
```

**Portovi:**
- `8025` - Web UI (http://localhost:8025)
- `1025` - SMTP server (localhost:1025)

### Opcija B: Docker Compose

Kreiraj `docker-compose.yml`:

```yaml
version: '3.8'
services:
  mailpit:
    image: axllent/mailpit
    ports:
      - "8025:8025"  # Web UI
      - "1025:1025"  # SMTP
    restart: unless-stopped
```

Pokreni s:
```bash
docker-compose up -d
```

### Opcija C: Native Installation

```bash
# macOS
brew install mailpit

# Linux
# Preuzmi binary s https://github.com/axllent/mailpit/releases
# Ili koristi Docker (preporučeno)
```

## 🔧 Korak 2: Konfiguriraj Aplikaciju

### Za Lokalni Development

Postavi environment varijable u `.env` fajlu u `backend/` direktoriju:

**Opcija A: Mailpit-specifične varijable (preporučeno za testiranje):**
```env
# Mailpit SMTP Configuration (za testiranje)
MAILPIT_SMTP_HOST=localhost
MAILPIT_SMTP_PORT=1025
MAILPIT_SMTP_USER=test@uslugar.hr
MAILPIT_SMTP_PASS=
```

**Opcija B: Standardne SMTP varijable (također radi):**
```env
# Mailpit SMTP Configuration (za testiranje)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=test@uslugar.hr
SMTP_PASS=
```

**Napomena:** 
- Mailpit ne zahtijeva autentifikaciju, pa `MAILPIT_SMTP_PASS` ili `SMTP_PASS` može biti prazan
- `MAILPIT_SMTP_USER` ili `SMTP_USER` može biti bilo koja email adresa (koristi se kao "from" adresa)
- Ako nijedna varijabla nije postavljena, aplikacija neće slati emailove (vidjet ćeš upozorenje u logovima)
- **Mailpit-specifične varijable (`MAILPIT_*`) imaju prioritet** - ako su postavljene, koriste se umjesto standardnih `SMTP_*` varijabli
- **✅ Email adrese NE MORAJU postojati!** Mailpit prima sve mailove bez provjere DNS-a ili postojanja email adrese

**Provjera konfiguracije:**
Nakon što pokreneš backend, u logovima bi trebao vidjeti:
```
SMTP Configuration:
  📧 Using Mailpit for email testing
  MAILPIT_SMTP_HOST: localhost
  MAILPIT_SMTP_USER: SET (test@uslugar.hr)
  MAILPIT_SMTP_PORT: 1025
[SMTP] Using Mailpit for email testing (no auth required)
```

### Za Production/Staging

Za produkciju koristi pravi SMTP server (npr. SendGrid, AWS SES, Hostinger). Mailpit je samo za testiranje!

```env
# Production SMTP
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=uslugar@oriphiel.hr
SMTP_PASS=your-password
```

## 📋 Korak 3: Konfiguriraj u Admin Panelu

1. Otvori **Admin Panel → Testing → Test Podaci**
2. U sekciji **"📧 Mailpit Konfiguracija (Globalna)"**:
   - **Mailpit API URL**: `http://localhost:8025/api/v1`
   - (Default vrijednost je već postavljena)
   - Ovo se koristi za dohvaćanje mailova iz Mailpit-a tijekom automatskih testova
3. U sekciji **"👥 Test Korisnici"**:
   - Unesi email adrese za testiranje (npr. `test.client@uslugar.hr`)
   - **Nema potrebe za Inbox ID-evima** - Mailpit automatski hvata sve mailove
   - Email adrese se koriste za filtriranje mailova po recipient-u tijekom testiranja

## 🎯 Korak 4: Testiraj Konfiguraciju

### 1. Provjeri da Mailpit radi

Otvori u browseru: http://localhost:8025

Trebao bi vidjeti Mailpit web UI s praznim inboxom.

### 2. Testiraj slanje emaila

```bash
# Test email s command line
echo "Test email" | mail -s "Test Subject" test@example.com -S smtp=localhost:1025
```

**Opcija C: Pokreni automatski test (preporučeno):**
- Admin Panel → Testing → Plans
- Klikni "🤖 Automatski" na bilo kojem testu (npr. "Registracija korisnika usluge")
- Test će automatski:
  1. **Kreirati checkpoint** prije testa (s opisom i svrhom)
  2. **Pokrenuti Playwright test** (registracija korisnika)
  3. **Dohvatiti mailove iz Mailpit-a** (filtrirano po recipient email adresi)
  4. **Kreirati screenshotove mailova** (HTML render maila)
  5. **Kliknuti linkove u mailovima** (npr. verifikacijski link)
  6. **Kreirati screenshotove nakon klika** (stranica nakon klika na link)
  7. **Napraviti rollback na checkpoint** (vraćanje baze na početno stanje)
  
**Test uspije samo ako su svi koraci uspješni:**
- ✅ Playwright test prošao
- ✅ Email screenshot kreiran
- ✅ Link click screenshot kreiran

### 3. Provjeri Mailpit Web UI

Nakon što aplikacija pošalje email:
1. Otvori http://localhost:8025
2. Trebao bi vidjeti primljeni email
3. Možeš pregledati HTML, plain text, headers, itd.

## 🔍 Korak 5: API Pristup

Mailpit ima REST API za programatski pristup:

```javascript
// Dohvati sve mailove
GET http://localhost:8025/api/v1/messages

// Dohvati specifični mail
GET http://localhost:8025/api/v1/message/{id}

// Dohvati HTML sadržaj
GET http://localhost:8025/api/v1/message/{id}/html

// Dohvati plain text
GET http://localhost:8025/api/v1/message/{id}/plain
```

**Primjer s curl:**

```bash
# Dohvati sve mailove
curl http://localhost:8025/api/v1/messages

# Dohvati prvi mail
curl http://localhost:8025/api/v1/message/1

# Dohvati HTML sadržaj
curl http://localhost:8025/api/v1/message/1/html
```

## 🛠️ Korak 6: Environment Varijable za Mailpit API

**Za lokalni development:**
```env
MAILPIT_API_URL=http://localhost:8025/api/v1
MAILPIT_WEB_URL=http://localhost:8025
```

**Za Render deployment:**
📖 Vidi [MAILPIT-RENDER-SETUP.md](./MAILPIT-RENDER-SETUP.md) za detaljne upute.

**Općenito (ako je Mailpit na drugom serveru):**
```env
# Mailpit API URL (ako je na drugom serveru)
MAILPIT_API_URL=http://your-mailpit-server:10000/api/v1
MAILPIT_WEB_URL=http://your-mailpit-server:10000
```

**Za Render Private Service:**
```env
# Koristi internal URL (ime servisa)
MAILPIT_API_URL=http://mailpit:10000/api/v1
MAILPIT_WEB_URL=http://mailpit:10000
MAILPIT_SMTP_HOST=mailpit
MAILPIT_SMTP_PORT=1025
```

## 📝 Korak 7: Test Podaci

U Admin Panelu, unesi email adrese za testiranje:

### Primjer konfiguracije:

```json
{
  "users": {
    "client": {
      "email": "test.client@uslugar.hr",
      "mailtrap": {
        "validData": {
          "email": "test.client@uslugar.hr"
        },
        "invalidData": {
          "email": "test.client.invalid@uslugar.hr"
        },
        "missingData": {
          "email": "test.client.missing@uslugar.hr"
        }
      }
    }
  }
}
```

**Važno:**
- Ne trebaš unijeti Inbox ID-eve (Mailpit ne koristi inbox ID-eve)
- Svi mailovi idu u jedan inbox
- Mailpit automatski filtrira mailove po recipient email adresi

## 🐳 Docker Network Setup (Ako koristiš Docker za aplikaciju)

Ako pokrećeš aplikaciju u Docker kontejneru, koristi Docker network:

```yaml
# docker-compose.yml
version: '3.8'
services:
  mailpit:
    image: axllent/mailpit
    ports:
      - "8025:8025"
      - "1025:1025"
    networks:
      - app-network

  backend:
    # ... tvoja backend konfiguracija
    environment:
      SMTP_HOST: mailpit  # Docker service name
      SMTP_PORT: 1025
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

## 🔒 Sigurnost

**⚠️ VAŽNO:**
- Mailpit je **samo za testiranje** - ne koristi ga u produkciji!
- Mailpit ne zahtijeva autentifikaciju - svi mailovi su javno dostupni
- Ne postavljaj Mailpit na javni server bez zaštite
- Za produkciju koristi pravi SMTP server s autentifikacijom

## 🐛 Troubleshooting

### Problem: Mailpit ne prima mailove

**Rješenje:**
1. **Provjeri da Mailpit radi:**
   ```bash
   docker ps
   # Trebao bi vidjeti mailpit kontejner
   
   # Ili provjeri web UI
   curl http://localhost:8025
   ```

2. **Provjeri SMTP konfiguraciju u `.env` (backend/.env):**
   ```env
   SMTP_HOST=localhost
   SMTP_PORT=1025
   SMTP_USER=test@uslugar.hr  # Može biti bilo koja adresa
   SMTP_PASS=                 # Može biti prazan
   ```

3. **Provjeri backend logove:**
   - Trebao bi vidjeti: `SMTP_HOST: SET`, `SMTP_USER: SET`
   - Ako vidiš `SMTP not configured - email notifications disabled`, provjeri `.env` fajl

4. **Testiraj direktno:**
   - Pokreni registraciju korisnika
   - Provjeri Mailpit Web UI (http://localhost:8025) - trebao bi vidjeti email

### Problem: Ne mogu pristupiti Mailpit Web UI

**Rješenje:**
1. Provjeri da Mailpit radi na portu 8025: `curl http://localhost:8025`
2. Provjeri firewall postavke
3. Ako koristiš Docker, provjeri da je port mapiran: `-p 8025:8025`

### Problem: Test ne pronalazi mailove

**Rješenje:**
1. Provjeri Mailpit Web UI - jesu li mailovi stigli?
2. Provjeri da je `MAILPIT_API_URL` postavljen ispravno
3. Provjeri da test koristi ispravnu email adresu (recipient)
4. Provjeri logove u Admin Panelu - test će pokazati koliko mailova je pronađeno

### Problem: Mailpit API vraća prazan array

**Rješenje:**
1. Provjeri da Mailpit radi
2. Provjeri da je API URL ispravan: `http://localhost:8025/api/v1`
3. Provjeri da su mailovi stigli (pregledaj Web UI)
4. Provjeri da koristiš ispravan recipient email u testu

## 📚 Dodatni Resursi

- **Mailpit GitHub**: https://github.com/axllent/mailpit
- **Mailpit Dokumentacija**: https://github.com/axllent/mailpit#readme
- **Docker Hub**: https://hub.docker.com/r/axllent/mailpit

## ✅ Checklist

- [ ] Mailpit pokrenut (Docker ili native)
- [ ] Web UI dostupan na http://localhost:8025
- [ ] SMTP konfiguracija postavljena u `.env`
- [ ] Mailpit API URL postavljen u Admin Panelu
- [ ] Email adrese unesene u Test Podaci
- [ ] Test uspješno šalje i prima mailove

---

**Napomena:** Mailpit je zamjena za Mailtrap u testiranju. Ne zahtijeva API key-eve, inbox ID-eve ili cloud servise - sve radi lokalno!

