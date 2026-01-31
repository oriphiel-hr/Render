# 🚀 Mailpit na Renderu - Brzi Start

## ✅ Checklist za Kreiranje Mailpit Servisa

### Korak 1: Render Dashboard → New → Private Service

1. **Render Dashboard:**
   - Idi na https://dashboard.render.com
   - Klikni **"New +"** → **"Private Service"**

2. **Connect Repository:**
   - **Repository:** Odaberi svoj GitHub repo (npr. `oriphiel-hr/Render`)
   - **Branch:** `main`

3. **Basic Settings:**
   - **Name:** `mailpit` ⭐ (ili `uslugar-mailpit` - ovo će biti internal URL)
   - **Region:** `Frankfurt (EU Central)` (isti kao backend)
   - **Branch:** `main`
   - **Root Directory:** `mailpit` ⭐⭐⭐ **KLJUČNO!**

4. **Environment:**
   - **Environment:** `Docker`
   - **Dockerfile Path:** `Dockerfile` (automatski će naći `mailpit/Dockerfile`)
   - **Docker Context:** `.` (točka)

5. **Plan:**
   - **Plan:** `Starter` ($7/mjesec)

6. **Health Check:**
   - **Health Check Path:** `/api/v1/messages` (ili `/`)

7. **Environment Variables:**
   - ❌ **Nema potrebe** - Mailpit radi bez konfiguracije

8. **Create Private Service** → Klikni **"Create Private Service"**

---

### Korak 2: Čekaj Deploy

- Render će automatski:
  1. Klonirati repo
  2. Build-ati Docker image iz `mailpit/Dockerfile`
  3. Pokrenuti Mailpit servis
  4. Dodijeliti internal URL: `http://mailpit:10000`

**Vrijeme:** ~2-5 minuta

---

### Korak 3: Postavi Environment Varijable u Backend Servisu

1. **Render Dashboard** → **Backend Service** (npr. `uslugar-backend`)
2. **Environment** tab
3. **Add Environment Variable** → Dodaj:

```env
# Mailpit SMTP Configuration (za slanje mailova)
MAILPIT_SMTP_HOST=mailpit
MAILPIT_SMTP_PORT=1025
MAILPIT_SMTP_USER=test@uslugar.hr
MAILPIT_SMTP_PASS=

# Mailpit API Configuration (za dohvaćanje mailova)
MAILPIT_API_URL=http://mailpit:10000/api/v1
MAILPIT_WEB_URL=http://mailpit:10000
```

**Napomena:** 
- `mailpit` je ime Private Service-a (ako si ga nazvao drugačije, koristi to ime)
- Render automatski rješava internal URL-ove između servisa

4. **Save Changes** → Backend će se automatski redeploy-ati

---

### Korak 4: Ažuriraj Admin Panel

1. **Admin Panel** → **Testing** → **Test Podaci**
2. **Mailpit API URL:** Promijeni na:
   ```
   http://mailpit:10000/api/v1
   ```
   (umjesto `http://localhost:8025/api/v1`)

3. **Klikni "Provjeri"** → Trebao bi vidjeti:
   ```
   ✅ Mailpit dostupan
   🔗 Provjeravam: http://mailpit:10000/api/v1
   ```

---

### Korak 5: Provjeri da Radi

1. **Backend Logs:**
   - Render Dashboard → Backend Service → Logs
   - Trebao bi vidjeti:
     ```
     [SMTP] Using Mailpit for email testing (no auth required)
     [MAILPIT] Base URL postavljen: http://mailpit:10000/api/v1
     ```

2. **Mailpit Logs:**
   - Render Dashboard → Mailpit Service → Logs
   - Trebao bi vidjeti HTTP zahtjeve na `/api/v1/messages`

3. **Test:**
   - Pokreni automatski test u Admin Panelu
   - Trebao bi vidjeti mailove u Mailpit-u

---

## 🔍 Troubleshooting

### Problem: Backend ne može pristupiti Mailpit-u

**Rješenje:**
1. Provjeri da su oba servisa u **istom projektu** na Render-u
2. Provjeri da koristiš **internal URL** (`http://mailpit:10000`, ne `http://mailpit.onrender.com`)
3. Provjeri da je ime servisa ispravno u environment varijablama
4. Provjeri da je Mailpit servis **pokrenut** (Render Dashboard → Mailpit Service → Status)

### Problem: Mailpit se ne pokreće

**Rješenje:**
1. Provjeri Render logove za Mailpit servis
2. Provjeri da je **Root Directory** postavljen na `mailpit` ⭐
3. Provjeri da **Dockerfile Path** je `Dockerfile`
4. Provjeri da Dockerfile postoji u `mailpit/Dockerfile`

### Problem: "Mailpit nedostupan" u Admin Panelu

**Rješenje:**
1. Provjeri da je URL u Admin Panelu: `http://mailpit:10000/api/v1` (ne `localhost`)
2. Provjeri da je Mailpit servis pokrenut
3. Provjeri backend logove za greške

---

## 📊 Portovi

- **10000** - Web UI i REST API (na Renderu; lokalno je 8025)
- **1025** - SMTP server

---

## 🌐 Pristup Web UI (Opcionalno)

Mailpit Web UI nije javno dostupan, ali možeš koristiti **SSH Tunnel**:

1. **Render Dashboard** → **Mailpit Service** → **SSH**
2. Kopiraj SSH komandu
3. Pokreni u terminalu:
   ```bash
   ssh -L 8025:localhost:10000 <render-ssh-command>
   ```
4. Otvori browser: http://localhost:8025 (tunel prosleđuje na mailpit:10000)

---

## ✅ Gotovo!

Nakon ovih koraka, Mailpit bi trebao raditi na Renderu i biti dostupan backend servisu kroz internal URL.

**Provjeri:**
- ✅ Mailpit servis vidljiv u Render Dashboard-u
- ✅ Backend logovi pokazuju Mailpit konfiguraciju
- ✅ Admin Panel prikazuje "✅ Mailpit dostupan"
- ✅ Testovi mogu slati i primati mailove

