# Mailpit za Render

Ovaj direktorij sadrži Dockerfile za pokretanje Mailpit-a kao Render Private Service.

## Kako koristiti

### 1. Render Dashboard → New → Private Service

1. **Connect GitHub:**
   - Repository: `oriphiel-hr/Render` (ili tvoj repo)
   - Branch: `main`

2. **Basic Settings:**
   - **Name:** `mailpit` (ili `uslugar-mailpit`)
   - **Region:** `Frankfurt (EU Central)` (isti kao backend)
   - **Branch:** `main`
   - **Root Directory:** `mailpit` ⭐ **KLJUČNO!**

3. **Environment:**
   - **Environment:** `Docker`
   - **Dockerfile Path:** `Dockerfile` (već je u root directory-u)
   - **Docker Context:** `.`

4. **Plan:**
   - **Starter** ($7/mjesec) - dovoljno za testiranje

5. **Health Check:**
   - **Health Check Path:** `/api/v1/messages` (ili `/`)

6. **Create Private Service**

### 2. Postavi Environment Varijable u Backend Servisu

U Render Dashboard → Backend Service → Environment:

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
- `mailpit` je ime Private Service-a (ili `uslugar-mailpit` ako si tako nazvao)
- Render automatski rješava internal URL-ove između servisa

### 3. Provjeri da radi

Nakon deploy-a, provjeri backend logove:
```
[SMTP] Using Mailpit for email testing (no auth required)
[MAILPIT] Base URL postavljen: http://mailpit:10000/api/v1
```

## Portovi

- **10000** - Web UI i REST API (na Renderu; lokalno docker koristi 8025)
- **1025** - SMTP server

## Pristup Web UI

Mailpit Web UI nije javno dostupan, ali možeš koristiti SSH tunnel:

```bash
# Render Dashboard → Mailpit Service → SSH
# Kopiraj SSH komandu i pokreni:
ssh -L 8025:localhost:10000 <render-ssh-command>

# Zatim otvori browser: http://localhost:8025
```

## Troubleshooting

### Backend ne može pristupiti Mailpit-u

1. Provjeri da su oba servisa u **istom projektu** na Render-u
2. Provjeri da koristiš **internal URL** (`http://mailpit:10000`, ne `http://mailpit.onrender.com`)
3. Provjeri da je ime servisa ispravno u environment varijablama

### Mailpit se ne pokreće

1. Provjeri Render logove za Mailpit servis
2. Provjeri da je Root Directory postavljen na `mailpit`
3. Provjeri da Dockerfile Path je `Dockerfile`

