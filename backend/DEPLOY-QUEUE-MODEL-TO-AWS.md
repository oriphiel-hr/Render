# 🚀 USLUGAR Queue Model - AWS Deployment Guide

Pošto ne možeš direktno pristupiti AWS RDS bazi s lokalnog računala, evo kako deployati Queue Model na AWS:

---

## Metoda 1: Automatski Deployment (Preporučeno) ✅

### Korak 1: Commit i Push Promjene

```powershell
cd C:\GIT_PROJEKTI\AWS\AWS_projekti

# Stage sve promjene
git add .

# Commit
git commit -m "feat: Add Queue Model with NKD codes and licenses

- Add ProviderLicense model for license verification
- Add LeadQueue model for queue-based lead distribution
- Add NKD codes to Category model
- Add license tracking to ProviderProfile
- Add queue scheduler (runs every hour)
- Add 50+ categories with NKD codes
- Add lead-queue API endpoints
- Add automated migration script"

# Push to GitHub
git push origin main
```

### Korak 2: Deploy na AWS

```powershell
cd uslugar\backend

# Build i deploy
docker build -t uslugar-backend:latest .
aws ecr get-login-password --region eu-north-1 | docker login --username AWS --password-stdin 339713096106.dkr.ecr.eu-north-1.amazonaws.com
docker tag uslugar-backend:latest 339713096106.dkr.ecr.eu-north-1.amazonaws.com/uslugar-backend:latest
docker push 339713096106.dkr.ecr.eu-north-1.amazonaws.com/uslugar-backend:latest

# Update ECS service
aws ecs update-service --cluster uslugar-cluster --service uslugar-backend-service --force-new-deployment --region eu-north-1
```

### Korak 3: Pokreni Migraciju na AWS

SSH u running ECS task ili koristi AWS ECS Exec:

```bash
# Connect to running task
aws ecs execute-command \
  --cluster uslugar-cluster \
  --task TASK_ID \
  --container uslugar-backend \
  --interactive \
  --command "/bin/sh"

# Inside container, run:
node run-migration.js
```

---

## Metoda 2: Ručna Migracija preko AWS Console

### Korak 1: Otvori AWS RDS Query Editor

1. Idi na AWS Console → RDS
2. Odaberi `uslugar-db`
3. Klikni "Query Editor"
4. Connect s credentials: `uslugar_user` / `Pastor123`

### Korak 2: Izvršiporučdemo SQL

Kopiraj SQL iz:
`backend/prisma/migrations/20251021_add_queue_model_and_licenses/migration.sql`

I izvršakoj ga u Query Editor-u.

### Korak 3: Seed Kategorije

Deploy backend na AWS (korak iz Metode 1), pa pokreni:

```bash
# Inside ECS container
node prisma/seeds/seed-categories.js
```

---

## Metoda 3: Startup Script (Najlakše) ⭐

Ažuriraj `Dockerfile` da automatski pokrene migraciju pri startu:

### Već je dodano u Dockerfile!

Provjeri `Dockerfile`:

```dockerfile
# ... existing content ...

# Copy migration runner
COPY run-migration.js .
COPY prisma/migrations ./prisma/migrations
COPY prisma/seeds ./prisma/seeds

# Run migration on startup (before starting server)
CMD ["sh", "-c", "node run-migration.js && node src/server.js"]
```

**Onda samo redeploy:**

```powershell
# Build, push, redeploy
docker build -t uslugar-backend:latest .
# ... push to ECR ...
# ... update ECS service ...
```

Migracija će se automatski pokrenuti pri svakom deployment-u!

---

## Metoda 4: Lambda Function (Advanced)

Kreiraj Lambda funkciju koja pokreće migraciju:

```javascript
// lambda-migration.js
const { execSync } = require('child_process');

exports.handler = async (event) => {
    try {
        execSync('npx prisma migrate deploy');
        execSync('node prisma/seeds/seed-categories.js');
        return { statusCode: 200, body: 'Migration complete' };
    } catch (error) {
        return { statusCode: 500, body: error.message };
    }
};
```

Deploy Lambda u VPC gdje je RDS dostupan.

---

## ✅ Verifikacija

Nakon deployment-a, provjeri da li radi:

### 1. Provjeri Server Logs

```bash
# CloudWatch Logs ili
aws logs tail /ecs/uslugar-backend --follow
```

Trebao bi vidjeti:
```
✅ Queue Scheduler started successfully
[OK] Queue Model
```

### 2. Test API

```bash
curl https://uslugar-api.oriph.io/api/lead-queue/my-offers \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Provjeri Bazu

```sql
-- Check new tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('ProviderLicense', 'LeadQueue');

-- Check categories have NKD codes
SELECT name, "nkdCode", "requiresLicense" FROM "Category" 
WHERE "nkdCode" IS NOT NULL LIMIT 5;
```

---

## 🔧 Troubleshooting

### Problem: Migracija pada

**Provjeri:**
1. DATABASE_URL je postavljen u ECS Task Definition
2. Security Group dozvoljava pristup RDS-u
3. RDS je running
4. Credentials su točni

**Logs:**
```bash
aws logs tail /ecs/uslugar-backend --since 5m
```

### Problem: ECS Task ne može pristupiti RDS-u

**Rješenje:**
1. Provjeri Security Group RDS-a
2. Dodaj Security Group ECS Task-a u Inbound rules
3. Port 5432 mora biti otvoren

---

## 📝 Preporučeni Pristup

**Za produkciju, najlakše je:**

1. **Ažuriraj Dockerfile** da automatski pokrene migraciju:
   ```dockerfile
   CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
   ```

2. **Redeploy:**
   ```powershell
   cd backend
   docker build -t uslugar-backend .
   # ... push to ECR ...
   aws ecs update-service --cluster uslugar-cluster --service uslugar-backend-service --force-new-deployment
   ```

3. **Gotovo!** Migracija će se pokrenuti automatski.

---

## 🚀 Quick Deploy (TL;DR)

```powershell
# 1. Commit promjene
cd C:\GIT_PROJEKTI\AWS\AWS_projekti
git add .
git commit -m "feat: Add Queue Model"
git push

# 2. Build & Deploy
cd uslugar\backend
docker build -t uslugar-backend .
aws ecr get-login-password --region eu-north-1 | docker login --username AWS --password-stdin 339713096106.dkr.ecr.eu-north-1.amazonaws.com
docker tag uslugar-backend:latest 339713096106.dkr.ecr.eu-north-1.amazonaws.com/uslugar-backend:latest
docker push 339713096106.dkr.ecr.eu-north-1.amazonaws.com/uslugar-backend:latest

# 3. Redeploy service (će automatski pokrenuti migraciju)
aws ecs update-service --cluster uslugar-cluster --service uslugar-backend-service --force-new-deployment --region eu-north-1

# 4. Prati logs
aws logs tail /ecs/uslugar-backend --follow
```

---

**Status:** 🟢 READY FOR DEPLOYMENT  
**Preporučena Metoda:** Metoda 3 (Startup Script)

Javi mi koji pristup želiš koristiti! 🚀

