# 🚀 Migracija Backend-a sa AWS ECS na Render

## 📋 Pregled

Ovaj vodič objašnjava kako premjestiti Node.js backend aplikaciju sa AWS ECS na Render platformu.

---

## 🎯 Render vs AWS - Razlike

| Komponenta | AWS ECS | Render |
|------------|---------|--------|
| **Deployment** | Docker + ECR | Git push auto-deploy |
| **Database** | RDS/Neon (odvojeno) | PostgreSQL add-on |
| **Secrets** | AWS Secrets Manager | Environment Variables |
| **Storage** | S3 | Render Disk (ili S3) |
| **Port** | 8080 (hardcoded) | $PORT (dinamički) |
| **Health Check** | `/hc` endpoint | Auto ili custom |
| **Build** | Dockerfile | Build Command |
| **Logs** | CloudWatch | Render Dashboard |

---

## 📝 Korak 1: Priprema Render Blueprint (render.yaml)

Kreiraj fajl `render.yaml` u root direktoriju repozitorija:

```yaml
services:
  # Backend API Service
  - type: web
    name: uslugar-backend
    runtime: docker
    plan: starter  # ili standard/pro ($7-25/mesec)
    region: frankfurt  # ili oregon
    dockerfilePath: ./uslugar/backend/Dockerfile.prod
    dockerContext: ./uslugar/backend
    dockerCommand: /app/start.sh
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000  # Render koristi $PORT dinamički
      - key: DATABASE_URL
        fromDatabase:
          name: uslugar-db
          property: connectionString
      # Email (SMTP)
      - key: SMTP_HOST
        sync: false  # Postavi ručno u Render Dashboard
      - key: SMTP_PORT
        sync: false
      - key: SMTP_USER
        sync: false
      - key: SMTP_PASS
        sync: false
      - key: FRONTEND_URL
        sync: false
      # JWT
      - key: JWT_SECRET
        sync: false
      # CORS
      - key: CORS_ORIGINS
        sync: false
      # Push Notifications (VAPID)
      - key: VAPID_PUBLIC_KEY
        sync: false
      - key: VAPID_PRIVATE_KEY
        sync: false
      - key: VAPID_SUBJECT
        sync: false
      # Stripe
      - key: STRIPE_SECRET_KEY
        sync: false
      - key: STRIPE_PUBLISHABLE_KEY
        sync: false
      - key: STRIPE_WEBHOOK_SECRET
        sync: false
      # Twilio
      - key: TWILIO_ACCOUNT_SID
        sync: false
      - key: TWILIO_AUTH_TOKEN
        sync: false
      - key: TWILIO_PHONE_NUMBER
        sync: false
      # Sudreg
      - key: SUDREG_CLIENT_ID
        sync: false
      - key: SUDREG_CLIENT_SECRET
        sync: false
      # AWS S3 (ako i dalje koristiš S3)
      - key: AWS_S3_BUCKET_NAME
        sync: false
      - key: AWS_REGION
        sync: false
      - key: AWS_ACCESS_KEY_ID
        sync: false
      - key: AWS_SECRET_ACCESS_KEY
        sync: false

  # PostgreSQL Database
  - type: pspg
    name: uslugar-db
    plan: starter  # $7/mesec, 256 MB RAM, 1 GB storage
    databaseName: uslugar
    user: uslugar_user
```

---

## 🔧 Korak 2: Ažuriraj Dockerfile.prod za Render

Render automatski postavlja `$PORT` environment variable. Trebaš ažurirati Dockerfile da koristi `$PORT`:

```dockerfile
# Na kraju Dockerfile.prod, umjesto:
EXPOSE 4000
CMD ["/app/start.sh"]

# Trebalo bi biti:
EXPOSE $PORT
CMD ["/app/start.sh"]
```

**ILI** ažuriraj `start.sh` da koristi `$PORT`:

```bash
#!/bin/sh
set -e

PORT=${PORT:-4000}

echo "Starting server on port $PORT..."

# Prisma migrate (opcionalno - Render može koristiti build command)
npx prisma migrate deploy --schema=./prisma/schema.prisma || true

# Start server
node src/server.js
```

---

## 🔧 Korak 3: Ažuriraj server.js da koristi Render PORT

U `src/server.js`, provjeri da koristi `process.env.PORT`:

```javascript
const PORT = process.env.PORT || 4000  // ✅ Već je ovako
```

Render automatski postavlja `$PORT`, tako da će ovo raditi.

---

## 🔧 Korak 4: Health Check Endpoint

Render treba health check endpoint. Dodaj u `src/server.js` ili u routes:

```javascript
// Health check endpoint (Render koristi za status)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

ILI ako već imaš `/hc` endpoint, promijeni u `render.yaml`:
```yaml
healthCheckPath: /hc
```

---

## 📦 Korak 5: Build Command (Alternative to Docker)

Ako želiš koristiti Render build umjesto Docker:

```yaml
services:
  - type: web
    name: uslugar-backend
    runtime: node
    plan: starter
    region: frankfurt
    buildCommand: cd uslugar/backend && npm ci && npx prisma generate --schema=./prisma/schema.prisma && npx prisma migrate deploy --schema=./prisma/schema.prisma
    startCommand: cd uslugar/backend && node src/server.js
    rootDir: uslugar/backend
```

**NAPOMENA:** Docker pristup je **preporučen** jer imaš kompleksan Dockerfile sa Prisma client build-om.

---

## 🔐 Korak 6: Prebacivanje Secrets iz AWS Secrets Manager

### Opcija A: Render Environment Variables (Ručno)

1. Idi u Render Dashboard → `uslugar-backend` service
2. **Environment** tab
3. Dodaj sve environment varijable iz AWS Secrets Manager

**Lista svih env varijabli** (vidi `ALL_ENV_VARIABLES_AND_SECRETS.md`):
- `DATABASE_URL` - automatski iz PostgreSQL add-on
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `FRONTEND_URL`
- `JWT_SECRET`
- `CORS_ORIGINS`
- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- `SUDREG_CLIENT_ID`, `SUDREG_CLIENT_SECRET`
- `AWS_S3_BUCKET_NAME`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- `NODE_ENV=production`
- `PORT=10000` (Render automatski, ali možeš eksplicitno)

### Opcija B: Render Secrets Sync (Ako imaš Render CLI)

```bash
# Install Render CLI
npm install -g @render/cli

# Login
render login

# Sync secrets from file
render secrets:set --file .env.production
```

---

## 🗄️ Korak 7: Migracija Database

### Opcija A: Render PostgreSQL (Preporučeno za start)

1. **Kreiraj PostgreSQL add-on:**
   - Render Dashboard → New → PostgreSQL
   - Name: `uslugar-db`
   - Plan: Starter ($7/mesec) ili Standard ($20/mesec)
   - Region: Frankfurt (EU) ili Oregon (US)

2. **Migriraj podatke:**
   ```bash
   # Backup iz Render (AWS) baze
   pg_dump "postgresql://uslugar_user:Qwvk5j6QpbR8XGO8flXIDeg0GU76xORm@dpg-d5g06gshg0os738en9cg-a.frankfurt-postgres.render.com/uslugar" > backup.sql
   
   # Restore na Render PostgreSQL
   psql "postgresql://uslugar_user:password@dpg-xxx.render.com/uslugar" < backup.sql
   ```

3. **Poveži u render.yaml:**
   ```yaml
   - key: DATABASE_URL
     fromDatabase:
       name: uslugar-db
       property: connectionString
   ```

### Opcija B: Zadrži Render PostgreSQL (Već postoji)

Ako već imaš Render PostgreSQL bazu (`postgresql://uslugar_user:...@dpg-d5g06gshg0os738en9cg-a.frankfurt-postgres.render.com/uslugar`):
- Samo dodaj `DATABASE_URL` u environment variables
- Ili koristi `fromDatabase` u render.yaml

---

## ☁️ Korak 8: AWS S3 Storage (Opcionalno)

Ako i dalje želiš koristiti AWS S3 za fakture:

1. **Kreiraj IAM user u AWS:**
   ```bash
   aws iam create-user --user-name render-s3-access
   aws iam attach-user-policy --user-name render-s3-access --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
   aws iam create-access-key --user-name render-s3-access
   ```

2. **Dodaj credentials u Render:**
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_S3_BUCKET_NAME=uslugar-invoices`
   - `AWS_REGION=eu-north-1`

**ILI** koristi Render Disk za lokalno storage (jednostavnije, ali manje skalabilno).

---

## 🚀 Korak 9: Deployment na Render

### Metoda 1: GitHub Auto-Deploy (Preporučeno)

1. **Push render.yaml u Git:**
   ```bash
   git add render.yaml
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```

2. **Poveži GitHub repo na Render:**
   - Render Dashboard → New → Blueprint
   - Odaberi GitHub repo
   - Render će automatski detektirati `render.yaml`
   - Klikni **Apply**

3. **Render će automatski:**
   - Kreirati PostgreSQL add-on
   - Build Docker image
   - Deploy service
   - Postaviti environment variables

### Metoda 2: Render Dashboard (Ručno)

1. **Kreiraj Web Service:**
   - Render Dashboard → New → Web Service
   - Connect GitHub repo
   - Root Directory: `uslugar/backend`
   - Build Command: (prazno - koristi Docker)
   - Start Command: `/app/start.sh`
   - Dockerfile Path: `Dockerfile.prod`

2. **Dodaj PostgreSQL:**
   - New → PostgreSQL
   - Poveži sa web service

3. **Dodaj Environment Variables** (ručno)

---

## 📝 Korak 10: Ažuriranje start.sh za Render

Render možda neće moći izvršiti Prisma migracije tokom starta (bolje u build command). Ažuriraj `start.sh`:

```bash
#!/bin/sh
set -e

PORT=${PORT:-4000}
echo "🚀 Starting uslugar backend on port $PORT..."

# Prisma generate (ako nije u build stage)
if [ ! -d "node_modules/.prisma" ]; then
  echo "📦 Generating Prisma Client..."
  npx prisma generate --schema=./prisma/schema.prisma
fi

# Prisma migrate (opcionalno - Render može koristiti build command)
echo "🔄 Running database migrations..."
npx prisma migrate deploy --schema=./prisma/schema.prisma || echo "⚠️ Migrations failed, continuing..."

# Start server
echo "✅ Starting Node.js server..."
exec node src/server.js
```

---

## 🔄 Korak 11: Prisma Migracije na Render

### Opcija A: Build Command (Preporučeno)

U `render.yaml`:
```yaml
buildCommand: |
  cd uslugar/backend &&
  npm ci &&
  npx prisma generate --schema=./prisma/schema.prisma &&
  npx prisma migrate deploy --schema=./prisma/schema.prisma
```

### Opcija B: Manual Deploy Script

Kreiraj `scripts/render-deploy.sh`:
```bash
#!/bin/bash
cd uslugar/backend
npm ci
npx prisma generate --schema=./prisma/schema.prisma
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

---

## 🧪 Korak 12: Testiranje

1. **Provjeri health check:**
   ```bash
   curl https://uslugar-backend.onrender.com/health
   # Ili
   curl https://uslugar-backend.onrender.com/api/health
   ```

2. **Provjeri logove:**
   - Render Dashboard → `uslugar-backend` → Logs

3. **Provjeri database:**
   ```bash
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"User\";"
   ```

---

## ⚠️ Potencijalni Problemi i Rješenja

### Problem 1: Prisma Client Generation Fails
**Rješenje:** Dodaj u build command:
```yaml
buildCommand: |
  cd uslugar/backend &&
  npm ci &&
  PRISMA_OPENSSL_VERSION=3.0.x npx prisma generate --schema=./prisma/schema.prisma
```

### Problem 2: Port Binding Error
**Rješenje:** Provjeri da server.js koristi `process.env.PORT`:
```javascript
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {  // '0.0.0.0' je važno za Render
  console.log(`Server running on port ${PORT}`);
});
```

### Problem 3: Memory Limit (Starter plan = 512 MB)
**Rješenje:** Upgrade na Standard plan ($25/mesec) za 1 GB RAM.

### Problem 4: Build Timeout (> 10 min)
**Rješenje:** Optimiziraj Dockerfile ili koristi Render build cache.

### Problem 5: AWS S3 Access Denied
**Rješenje:** Provjeri AWS credentials u environment variables.

---

## 📊 Troškovi Render

| Plan | CPU | RAM | Storage | Cijena |
|------|-----|-----|---------|--------|
| **Free** | Shared | 512 MB | - | $0 (90 dana) |
| **Starter** | Shared | 512 MB | - | $7/mesec |
| **Standard** | Dedicated | 1 GB | - | $25/mesec |
| **Pro** | Dedicated | 2 GB | - | $85/mesec |

**PostgreSQL:**
- Starter: $7/mesec (256 MB RAM, 1 GB storage)
- Standard: $20/mesec (1 GB RAM, 10 GB storage)

**Ukupno minimalno:**
- Backend Starter: $7/mesec
- PostgreSQL Starter: $7/mesec
- **Total: $14/mesec**

**Preporučeno (production):**
- Backend Standard: $25/mesec
- PostgreSQL Standard: $20/mesec
- **Total: $45/mesec**

---

## ✅ Checklist Migracije

- [ ] Kreiran `render.yaml` fajl
- [ ] Ažuriran `Dockerfile.prod` za Render PORT
- [ ] Ažuriran `start.sh` za Render
- [ ] Health check endpoint dodan (`/health` ili `/hc`)
- [ ] Svi environment variables dodani u Render Dashboard
- [ ] PostgreSQL add-on kreiran (ili postojeća baza povezana)
- [ ] Database migracije izvršene
- [ ] AWS S3 credentials dodane (ako se koristi S3)
- [ ] GitHub repo povezan sa Render
- [ ] Prvi deploy uspješan
- [ ] Health check prolazi
- [ ] API endpoints testirani
- [ ] Logovi provjereni
- [ ] DNS/Custom domain konfiguriran (opcionalno)

---

## 🔗 Korisni Linkovi

- **Render Dashboard:** https://dashboard.render.com
- **Render Docs:** https://render.com/docs
- **Render PostgreSQL:** https://render.com/docs/databases
- **Render Docker:** https://render.com/docs/docker
- **Render Environment Variables:** https://render.com/docs/environment-variables

---

## 📝 Napomene

1. **Render Free Tier:** 90 dana besplatno za nove korisnike
2. **Sleep Mode:** Free/Starter planovi "spavaju" nakon 15 min neaktivnosti (probudi se zahtjevom)
3. **Build Time:** Render ima 10 min build timeout (može se produžiti na Standard plan)
4. **Storage:** Render Disk je persistent storage, ali S3 je bolji za production
5. **Scaling:** Render podržava auto-scaling na Standard+ planovima

---

**Datum kreiranja:** 2026-01-07  
**Verzija:** 1.0

