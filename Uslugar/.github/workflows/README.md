# GitHub Actions Workflows

## Frontend Deployment Workflow

### `frontend-uslugar.yml`

Automatski build i deploy frontend aplikacije na Hostinger hosting preko FTP-a.

### **Kada se Pokreće:**

- **Push na `main` branch** kada se promijene fajlovi u `frontend/` folderu
- **Manual trigger** (`workflow_dispatch`)

### **Što Radi:**

1. **Detektira framework** (Vite, Next.js, React, Angular, itd.)
2. **Build-a frontend** aplikaciju
3. **Pronalazi build output** (`dist/`, `build/`, `out/`, itd.)
4. **Deploy-uje preko FTP-a** na Hostinger hosting (`public_html/`)

### **Potrebni GitHub Secrets:**

**Opcija 1: Hostinger Secrets (Preporučeno)**
- `HOSTINGER_HOST` - FTP hostname (npr. `ftp.uslugar.eu` ili IP adresa)
- `HOSTINGER_USERNAME` - FTP username
- `HOSTINGER_PASSWORD` - FTP password
- `HOSTINGER_SERVER_DIR` - Server directory (opcionalno, default: `public_html/`)

**Opcija 2: Generic FTP Secrets (Fallback)**
- `FTP_HOST` - FTP hostname
- `FTP_USERNAME` - FTP username
- `FTP_PASSWORD` - FTP password

**Opcionalno:**
- `VITE_API_URL` - API URL za frontend (default: `https://api.uslugar.eu`)

### **Kako Dodati Secrets:**

1. **GitHub Repository** → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret**
3. Dodaj svaki secret:
   - Name: `HOSTINGER_HOST`
   - Value: `ftp.uslugar.eu` (ili IP adresa)
4. **Add secret**

### **Struktura Projekta:**

```
Render/
├── frontend/              ← Frontend kod
│   ├── package.json
│   ├── src/
│   ├── dist/             ← Build output (nakon build-a)
│   └── .htaccess         ← SPA routing (opcionalno)
├── backend/              ← Backend kod
└── .github/
    └── workflows/
        └── frontend-uslugar.yml
```

### **Build Output Detection:**

Workflow automatski detektira build output folder:
- `dist/` (Vite, Vue, itd.)
- `build/` (Create React App)
- `out/` (Next.js export)
- `.next/` (Next.js SSR - ne može se deploy-ati preko FTP-a)

### **FTP Deployment:**

Workflow pokušava više FTP protokola:
1. **FTP** (port 21, passive mode)
2. **FTPS implicit** (port 21)
3. **FTPS explicit** (port 990)
4. **FTPS legacy** (port 21)

### **Troubleshooting:**

Ako deployment ne uspije:
1. Provjeri GitHub Secrets su postavljeni
2. Provjeri FTP hostname je točan (bez `ftp://` prefiksa)
3. Provjeri FTP credentials u Hostinger Control Panel-u
4. Testiraj FTP konekciju ručno (FileZilla, itd.)
5. Provjeri da server podržava FTP (ne samo SFTP)

### **Manual Deployment:**

Ako GitHub Actions ne radi, možeš deploy-ovati ručno:

```powershell
# PowerShell script (ako postoji)
cd frontend
npm run build
# Upload dist/* to public_html/ preko FileZilla ili FTP klijenta
```

### **Primjer Korištenja:**

1. **Push-aj promjene** u `frontend/` folderu na `main` branch
2. **GitHub Actions** automatski pokreće workflow
3. **Frontend se build-a** i deploy-uje na Hostinger
4. **Provjeri** `https://www.uslugar.eu/` - frontend bi trebao biti ažuriran

---

## Backend Deployment

Backend se deploy-uje na Render preko Git push-a (Render automatski build-a i deploy-uje).

Nema potrebe za GitHub Actions workflow za backend - Render automatski detektira promjene u Git repository-ju.

