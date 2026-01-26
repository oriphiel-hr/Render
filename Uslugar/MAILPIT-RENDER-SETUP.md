# 🚀 Mailpit na Render - Setup Guide

Mailpit može raditi na Render-u kao **Private Service** koji je dostupan samo unutar Render network-a (nije javno dostupan).

## 📋 Opcije za Mailpit na Render-u

### Opcija 1: Private Service (Preporučeno za testiranje na Render-u)

Mailpit kao zasebni servis koji je dostupan samo backend servisu kroz interne URL-ove.

**Prednosti:**
- ✅ Dostupan 24/7
- ✅ Automatski restart
- ✅ Integriran s Render network-om
- ✅ Ne zahtijeva javni pristup

**Nedostaci:**
- ⚠️ Ne možeš pristupiti Web UI iz browsera (osim ako ne koristiš SSH tunnel)
- ⚠️ Trošak dodatnog servisa (Starter plan: $7/mjesec)

### Opcija 2: Lokalno (Samo za development)

Mailpit pokrenut lokalno na tvom računalu.

**Prednosti:**
- ✅ Besplatno
- ✅ Web UI dostupan na http://localhost:8025
- ✅ Nema dodatnih troškova

**Nedostaci:**
- ❌ Ne radi kada nisi lokalno
- ❌ Ne može se koristiti za testiranje na Render-u

## 🎯 Korak 1: Kreiraj Mailpit kao Private Service na Render-u

**✅ Dockerfile je već kreiran u `mailpit/Dockerfile` - samo slijedi korake ispod!**

### 1.1. Render Dashboard → New → Private Service

1. **Connect GitHub:**
   - Repository: `oriphiel-hr/Render` (ili bilo koji repo)
   - Branch: `main`

2. **Basic Settings:**
   - **Name:** `mailpit` (ili `uslugar-mailpit`)
   - **Region:** `Frankfurt (EU Central)` (isti kao backend)
   - **Branch:** `main`
   - **Root Directory:** `mailpit` ⭐ **KLJUČNO!**

3. **Environment:**
   - **Environment:** `Docker`
   - **Dockerfile Path:** `Dockerfile` (već je u `mailpit/Dockerfile`)
   - **Docker Context:** `.`

4. **Plan:**
   - **Starter** ($7/mjesec) - dovoljno za testiranje

5. **Health Check:**
   - **Health Check Path:** `/api/v1/messages` (ili `/`)

6. **Environment Variables:**
   - Nema potrebe za environment varijablama (Mailpit radi bez konfiguracije)

7. **Create Private Service**

**Napomena:** Dockerfile je već kreiran u `mailpit/Dockerfile` - samo odaberi `mailpit` kao Root Directory!

5. **Plan:**
   - **Starter** ($7/mjesec) - dovoljno za testiranje

6. **Environment Variables:**
   - Nema potrebe za environment varijablama (Mailpit radi bez konfiguracije)

7. **Health Check:**
   - **Health Check Path:** `/api/v1/messages` (ili `/`)

8. **Create Private Service**

### 1.2. Dobij Internal URL

Nakon što se servis pokrene, Render će dodijeliti **internal URL**:
```
http://mailpit:8025
```

**ILI** ako je ime servisa `uslugar-mailpit`:
```
http://uslugar-mailpit:8025
```

**Važno:** 
- Internal URL je dostupan **samo unutar Render network-a**
- Ne možeš pristupiti iz browsera direktno
- Backend servis može pristupiti kroz internal URL

## 🔧 Korak 2: Konfiguriraj Backend na Render-u

### 2.1. Environment Variables u Backend Servisu

U Render Dashboard → Backend Service → Environment:

```env
# Mailpit SMTP Configuration (za testiranje)
MAILPIT_SMTP_HOST=mailpit  # Ili uslugar-mailpit (ime Private Service-a)
MAILPIT_SMTP_PORT=1025
MAILPIT_SMTP_USER=test@uslugar.hr
MAILPIT_SMTP_PASS=

# Mailpit API URL (za dohvaćanje mailova)
MAILPIT_API_URL=http://mailpit:8025/api/v1  # Ili http://uslugar-mailpit:8025/api/v1
MAILPIT_WEB_URL=http://mailpit:8025  # Ili http://uslugar-mailpit:8025
```

**Napomena:** 
- `mailpit` je ime Private Service-a (ili `uslugar-mailpit` ako si tako nazvao)
- Render automatski rješava internal URL-ove između servisa

### 2.2. Ažuriraj Admin Panel Test Data

U Admin Panelu → Testing → Test Podaci:

- **Mailpit API URL:** `http://mailpit:8025/api/v1` (ili internal URL tvog servisa)

**ILI** koristi environment varijablu:
- Backend automatski koristi `MAILPIT_API_URL` ako je postavljen

## 🔍 Korak 3: Provjeri Konfiguraciju

### 3.1. Provjeri Backend Logove

Nakon deploy-a, u backend logovima bi trebao vidjeti:
```
SMTP Configuration:
  📧 Using Mailpit for email testing
  MAILPIT_SMTP_HOST: mailpit
  MAILPIT_SMTP_USER: SET (test@uslugar.hr)
  MAILPIT_SMTP_PORT: 1025
[SMTP] Using Mailpit for email testing (no auth required)
[MAILPIT] Base URL postavljen: http://mailpit:8025/api/v1
```

### 3.2. Testiraj Slanje Emaila

1. Pokreni automatski test u Admin Panelu
2. Provjeri backend logove - trebao bi vidjeti:
   ```
   [MAILPIT] Dohvaćeno N mailova
   [MAILPIT] Kreiram screenshot maila: ...
   ```

### 3.3. Provjeri Mailpit Logove

U Render Dashboard → Mailpit Service → Logs:
- Trebao bi vidjeti HTTP zahtjeve na `/api/v1/messages`
- Trebao bi vidjeti SMTP konekcije na portu 1025

## 🌐 Korak 4: Pristup Mailpit Web UI (Opcionalno)

Mailpit Web UI nije javno dostupan, ali možeš koristiti **SSH Tunnel**:

### 4.1. Render SSH Access

1. Render Dashboard → Mailpit Service → SSH
2. Kopiraj SSH komandu (npr. `ssh ...`)
3. Pokreni u terminalu

### 4.2. SSH Tunnel

```bash
# U jednom terminalu - kreiraj tunnel
ssh -L 8025:localhost:8025 <render-ssh-command>

# U drugom terminalu - otvori browser
# Web UI će biti dostupan na http://localhost:8025
```

**ILI** koristi Render CLI:
```bash
render ssh --service mailpit --port 8025:8025
```

## 📊 Korak 5: Alternativa - Render Background Worker

Ako ne želiš plaćati dodatni servis, možeš pokrenuti Mailpit kao **Background Worker**:

### 5.1. Background Worker Setup

1. **Render Dashboard → New → Background Worker**
2. **Docker Command:**
   ```
   docker run -p 8025:8025 -p 1025:1025 axllent/mailpit
   ```
3. **Plan:** Starter ($7/mjesec) - **ISTI TROŠAK kao Private Service**

**Razlika:**
- Background Worker se može zaustaviti nakon određenog vremena
- Private Service je uvijek aktivan

## 💡 Preporuka

**Za testiranje na Render-u:**
- ✅ Koristi **Private Service** za Mailpit
- ✅ Postavi internal URL-ove u backend environment varijable
- ✅ Koristi SSH tunnel za pristup Web UI (ako trebaš)

**Za lokalno testiranje:**
- ✅ Pokreni Mailpit lokalno: `docker run -d -p 8025:8025 -p 1025:1025 axllent/mailpit`
- ✅ Koristi `localhost` u environment varijablama

## 🔒 Sigurnost

**⚠️ VAŽNO:**
- Mailpit kao Private Service **nije javno dostupan** - samo unutar Render network-a
- Ne postavljaj Mailpit kao **Web Service** (javno dostupan) bez autentifikacije
- Za produkciju koristi pravi SMTP server, ne Mailpit

## 🐛 Troubleshooting

### Problem: Backend ne može pristupiti Mailpit-u

**Rješenje:**
1. Provjeri da je Mailpit servis pokrenut (Render Dashboard)
2. Provjeri da su oba servisa u **istom projektu** na Render-u
3. Provjeri internal URL - koristi ime servisa (npr. `mailpit`, ne `mailpit.onrender.com`)
4. Provjeri environment varijable u backend servisu:
   ```
   MAILPIT_API_URL=http://mailpit:8025/api/v1
   MAILPIT_SMTP_HOST=mailpit
   ```

### Problem: Mailpit API vraća connection refused

**Rješenje:**
1. Provjeri da Mailpit servis radi (Render Dashboard → Logs)
2. Provjeri da Mailpit sluša na portu 8025 (provjeri logove)
3. Provjeri da koristiš **internal URL** (npr. `http://mailpit:8025`, ne `http://mailpit.onrender.com:8025`)

### Problem: Ne mogu pristupiti Web UI

**Rješenje:**
- Web UI nije javno dostupan - koristi SSH tunnel (vidi Korak 4)

## 📚 Dodatni Resursi

- **Render Private Services**: https://render.com/docs/private-services
- **Render Internal URLs**: https://render.com/docs/networking#internal-names
- **Mailpit GitHub**: https://github.com/axllent/mailpit

---

**Napomena:** Mailpit na Render-u je idealan za testiranje, ali za produkciju koristi pravi SMTP server (SendGrid, AWS SES, Hostinger).

