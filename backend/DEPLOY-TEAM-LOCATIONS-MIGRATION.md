# 🚀 Deployment Guide: ProviderTeamLocation Migration

Ovaj guide objašnjava kako deployati novu `ProviderTeamLocation` migraciju na AWS ECS.

---

## ✅ Pre-requisites

- ✅ Migracija je commitana i pushana na GitHub
- ✅ Dockerfile.prod već ima automatsko pokretanje migracija
- ✅ Sve promjene su spremne za deployment

---

## 🎯 Automatska Migracija (Opcija 2 - Preporučeno)

Dockerfile.prod je konfiguriran da automatski pokrene `prisma migrate deploy` pri svakom startu kontejnera.

### Korak 1: Build Docker Image

```powershell
# Navigate to backend directory
cd C:\GIT_PROJEKTI\AWS\AWS_projekti\uslugar\backend

# Build production image
docker build -f Dockerfile.prod -t uslugar-backend:latest .
```

### Korak 2: Login to AWS ECR

```powershell
# Get ECR login password
aws ecr get-login-password --region eu-north-1 | `
  docker login --username AWS --password-stdin 339713096106.dkr.ecr.eu-north-1.amazonaws.com
```

### Korak 3: Tag and Push Image

```powershell
# Tag image
docker tag uslugar-backend:latest 339713096106.dkr.ecr.eu-north-1.amazonaws.com/uslugar-backend:latest

# Push to ECR
docker push 339713096106.dkr.ecr.eu-north-1.amazonaws.com/uslugar-backend:latest
```

### Korak 4: Deploy to ECS

```powershell
# Force new deployment (ovo će automatski pokrenuti migraciju)
aws ecs update-service `
  --cluster uslugar-cluster `
  --service uslugar-backend-service `
  --force-new-deployment `
  --region eu-north-1
```

### Korak 5: Monitor Deployment

```powershell
# Provjeri status deploymenta
aws ecs describe-services `
  --cluster uslugar-cluster `
  --services uslugar-backend-service `
  --region eu-north-1 `
  --query 'services[0].deployments'

# Provjeri logove za migraciju
aws ecs list-tasks --cluster uslugar-cluster --region eu-north-1

# Kopiraj task ID iz outputa, zatim:
aws logs tail /ecs/uslugar-backend --follow --region eu-north-1
```

---

## 🔍 Verifikacija Migracije

### Provjeri da li je tablica kreirana

Nakon deploymenta, provjeri da li je migracija uspješna:

#### Opcija A: RDS Query Editor

1. AWS Console → RDS → `uslugar-db` → **Query Editor**
2. Connect s credentials
3. Pokreni:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'ProviderTeamLocation';
```

Ako vraća 1 red, migracija je uspješna! ✅

#### Opcija B: ECS Execute Command

```powershell
# Dohvati running task
$taskArn = (aws ecs list-tasks --cluster uslugar-cluster --region eu-north-1 --query 'taskArns[0]' --output text)

# Execute command
aws ecs execute-command `
  --cluster uslugar-cluster `
  --task $taskArn `
  --container uslugar-backend `
  --interactive `
  --command "/bin/sh" `
  --region eu-north-1
```

U kontejneru:

```bash
# Provjeri Prisma migrations status
npx prisma migrate status --schema=prisma/schema.prisma

# Ili direktno provjeri tablicu
npx prisma db execute --stdin --schema=prisma/schema.prisma <<< "SELECT COUNT(*) FROM \"ProviderTeamLocation\";"
```

---

## 🐛 Troubleshooting

### Problem: Migracija nije pokrenuta

**Rješenje:** Provjeri logove kontejnera:

```powershell
aws logs tail /ecs/uslugar-backend --since 30m --region eu-north-1 | Select-String "migrate"
```

Ako vidiš greške, provjeri:
- Database connection string u `.env`
- Prisma schema je validan
- Migracija file postoji u `/app/prisma/migrations/`

### Problem: Tablica već postoji

**To je OK!** Migracija koristi `IF NOT EXISTS`, tako da je sigurna za pokretanje više puta.

### Problem: Foreign key constraint error

**Rješenje:** Provjeri da li `ProviderProfile` tablica postoji:

```sql
SELECT COUNT(*) FROM "ProviderProfile";
```

Ako vraća 0, to znači da nema provider profila u bazi (što je OK za novu instalaciju).

---

## 📋 Checklist Prije Deploymenta

- [ ] Git pull najnoviji kod sa `main` brancha
- [ ] Provjeri da li je migracija commitana
- [ ] Provjeri Dockerfile.prod ima `prisma migrate deploy` u start.sh
- [ ] Build image lokalno i provjeri da li radi
- [ ] Push image na ECR
- [ ] Deploy na ECS
- [ ] Provjeri logove za migraciju
- [ ] Verificiraj da je tablica kreirana

---

## 🔄 Alternativni Način: Ručna Migracija (Ako automatska ne radi)

Ako automatska migracija ne radi, možeš je pokrenuti ručno:

### Korak 1: ECS Execute Command

```powershell
# Dohvati running task
$taskArn = (aws ecs list-tasks --cluster uslugar-cluster --region eu-north-1 --query 'taskArns[0]' --output text)

# Connect
aws ecs execute-command `
  --cluster uslugar-cluster `
  --task $taskArn `
  --container uslugar-backend `
  --interactive `
  --command "/bin/sh" `
  --region eu-north-1
```

### Korak 2: U kontejneru

```bash
# Navigate to app directory
cd /app

# Pokreni migraciju
npx prisma migrate deploy --schema=prisma/schema.prisma

# Provjeri status
npx prisma migrate status --schema=prisma/schema.prisma
```

---

## ✅ Uspešan Deployment

Kada je migracija uspješna, trebao bi vidjeti:

- ✅ `ProviderTeamLocation` tablica postoji u bazi
- ✅ API endpoint `/api/exclusive/leads/available` radi bez 500 greške
- ✅ Frontend stranica `#team-locations` može dohvatiti lokacije

---

## 📞 Support

Ako imaš problema:

1. Provjeri CloudWatch logove: `/ecs/uslugar-backend`
2. Provjeri ECS task status u AWS Console
3. Provjeri RDS connection health

---

**Napomena:** Migracija je idempotentna (`IF NOT EXISTS`) - sigurna je za pokretanje više puta bez štetnih posljedica.

