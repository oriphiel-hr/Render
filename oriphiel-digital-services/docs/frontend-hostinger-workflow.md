# Frontend deploy workflow (Hostinger)

GitHub Actions workflow je dodan u:

- `.github/workflows/frontend-oriphiel-digital-services.yml`

Deploy radi:

1. `npm ci`
2. `npm run build` za `oriphiel-digital-services/frontend`
3. upload `dist/` na Hostinger preko FTP-a

## GitHub Secrets koje treba postaviti

U GitHub repozitoriju otvori **Settings -> Secrets and variables -> Actions** i dodaj (specifično za ovaj projekt/prod):

- `ORIPHIEL_DIGITAL_SERVICES_PROD_HOSTINGER_FTP_HOST` = `194.5.156.10`
- `ORIPHIEL_DIGITAL_SERVICES_PROD_HOSTINGER_FTP_USERNAME` = `u208993221.oriphiel-digital-services.oriph.io`
- `ORIPHIEL_DIGITAL_SERVICES_PROD_HOSTINGER_FTP_PASSWORD` = (FTP lozinka)
- `ORIPHIEL_DIGITAL_SERVICES_PROD_HOSTINGER_FTP_SERVER_DIR` = ciljna mapa na hostingu (npr. `/public_html/`)
- `ORIPHIEL_DIGITAL_SERVICES_PROD_VITE_API_BASE_URL` = Render backend URL (npr. `https://your-backend.onrender.com/api`)

## Trigger

- automatski na `push` u `main` kad se promijeni `oriphiel-digital-services/frontend/**`
- ili ručno preko `workflow_dispatch`

## Sigurnosna preporuka

Ako je FTP lozinka već dijeljena izvan sigurnog kanala, odmah je promijeni u Hostingeru i ažuriraj `ORIPHIEL_DIGITAL_SERVICES_PROD_HOSTINGER_FTP_PASSWORD` secret.
