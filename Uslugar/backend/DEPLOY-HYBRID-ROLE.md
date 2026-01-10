# 🚀 Deploy Hybrid Role Implementation na AWS

## 📋 Izmjene za Deployment

### Fajlovi izmijenjeni:
1. ✅ `src/routes/jobs.js` - PROVIDER može kreirati Job-ove i prihvatiti ponude
2. ✅ `src/routes/auth.js` - Novi endpoint `/upgrade-to-provider`

### Database Migration:
❌ **NIJE POTREBNA** - Sve radi sa postojećom šemom

---

## 🧪 Lokalno Testiranje (Opciono)

```powershell
# Terminal 1: Pokreni backend
cd uslugar/backend
node src/server.js

# Terminal 2: Testiraj izmjene
.\test-hybrid-role.ps1
```

**Expected Output:**
```
✅ USER can register
✅ USER can upgrade to PROVIDER
✅ PROVIDER can create Jobs (NEW!)
✅ PROVIDER can send Offers
✅ PROVIDER can accept Offers on their Jobs (NEW!)
```

---

## 🚀 Deployment na AWS ECS

### Opcija 1: PowerShell Deploy Script

```powershell
cd uslugar/backend

# 1. Build Docker image
docker build -t uslugar-api:hybrid-role .

# 2. Login to ECR
aws ecr get-login-password --region eu-north-1 | docker login --username AWS --password-stdin 666203386231.dkr.ecr.eu-north-1.amazonaws.com

# 3. Tag image
$GIT_COMMIT = git rev-parse --short HEAD
docker tag uslugar-api:hybrid-role 666203386231.dkr.ecr.eu-north-1.amazonaws.com/uslugar-api:$GIT_COMMIT
docker tag uslugar-api:hybrid-role 666203386231.dkr.ecr.eu-north-1.amazonaws.com/uslugar-api:latest

# 4. Push to ECR
docker push 666203386231.dkr.ecr.eu-north-1.amazonaws.com/uslugar-api:$GIT_COMMIT
docker push 666203386231.dkr.ecr.eu-north-1.amazonaws.com/uslugar-api:latest

# 5. Force new ECS deployment
aws ecs update-service `
  --cluster apps-cluster `
  --service uslugar-service-2gk1f1mv `
  --force-new-deployment `
  --region eu-north-1

Write-Host "Deployment started! Wait 2-3 minutes for rollout..." -ForegroundColor Green
```

### Opcija 2: AWS Console (Manual)

1. **Build & Push Docker Image lokalno:**
   ```powershell
   docker build -t uslugar-api:hybrid-role .
   
   aws ecr get-login-password --region eu-north-1 | docker login --username AWS --password-stdin 666203386231.dkr.ecr.eu-north-1.amazonaws.com
   
   docker tag uslugar-api:hybrid-role 666203386231.dkr.ecr.eu-north-1.amazonaws.com/uslugar-api:latest
   
   docker push 666203386231.dkr.ecr.eu-north-1.amazonaws.com/uslugar-api:latest
   ```

2. **Update ECS Service u AWS Console:**
   - Idite na: https://console.aws.amazon.com/ecs/
   - Region: `eu-north-1` (Stockholm)
   - Cluster: `apps-cluster`
   - Service: `uslugar-service-2gk1f1mv`
   - Kliknite "Update service"
   - ✅ Čekirajte "Force new deployment"
   - Kliknite "Update"

---

## ✅ Verifikacija Deployment-a

### 1. Check Backend Health
```powershell
curl https://uslugar.api.oriph.io/api/health
```

**Expected:**
```json
{"ok":true,"ts":"2025-10-20T..."}
```

### 2. Test New Endpoint (Upgrade to Provider)
```powershell
curl -X POST https://uslugar.api.oriph.io/api/auth/upgrade-to-provider `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"password123"}'
```

**Expected:**
```json
{
  "message": "Successfully upgraded to provider!",
  "token": "...",
  "user": { ... }
}
```

### 3. Test PROVIDER Creating Job
```powershell
# Prvo se login kao PROVIDER
$loginResponse = curl -X POST https://uslugar.api.oriph.io/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"provider@example.com","password":"password123"}' | ConvertFrom-Json

$token = $loginResponse.token

# Kreiraj Job kao PROVIDER (NEW FEATURE!)
curl -X POST https://uslugar.api.oriph.io/api/jobs `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d '{
    "title":"Test Job",
    "description":"PROVIDER traži uslugu",
    "categoryId":"category-id",
    "city":"Zagreb",
    "budgetMax":500
  }'
```

**Expected:** ✅ 201 Created

---

## 🔄 Rollback Plan

Ako nešto ne radi:

### Brzi Rollback (Previous Task Definition):
```powershell
# Lista prethodnih task definition revisions
aws ecs list-task-definitions --family-prefix uslugar --region eu-north-1

# Update service na prethodnu revision (npr. uslugar:91)
aws ecs update-service `
  --cluster apps-cluster `
  --service uslugar-service-2gk1f1mv `
  --task-definition uslugar:91 `
  --region eu-north-1
```

### Git Revert:
```powershell
git revert HEAD
git push origin main
# Pa deploy ponovo
```

---

## 📊 Deployment Checklist

### Pre-Deployment:
- [x] ✅ Backend kod izmjenjen
- [x] ✅ Linter errors provjereni (nema grešaka)
- [x] ✅ Dokumentacija kreirana
- [x] ✅ Test skripta spremna
- [ ] 🔄 Lokalno testiranje (opciono)

### Deployment:
- [ ] Docker image build
- [ ] Push to ECR
- [ ] Update ECS service
- [ ] Wait for deployment (2-3 min)

### Post-Deployment:
- [ ] Health check test
- [ ] Test `/upgrade-to-provider` endpoint
- [ ] Test PROVIDER creating Job
- [ ] Test PROVIDER accepting Offer
- [ ] Monitor logs za greške

---

## 🎯 Expected Behavior After Deployment

### Što će raditi:
✅ USER može se registrovati (kao prije)  
✅ USER može tražiti usluge (kao prije)  
✅ PROVIDER može nuditi usluge (kao prije)  
✅ **PROVIDER može tražiti usluge** (NOVO!)  
✅ **USER može upgrade-ovati na PROVIDER** (NOVO!)  
✅ **PROVIDER može prihvatiti ponude na svoj Job** (NOVO!)  

### Što NEĆE poremetiti:
✅ Postojeći USER-i nastavljaju normalno raditi  
✅ Postojeći PROVIDER-i nastavljaju normalno raditi  
✅ Sve postojeće funkcionalnosti ostaju iste  
✅ Samo dodajemo nove mogućnosti  

**Ovo je backward compatible deployment!**

---

## 📝 Post-Deployment Tasks

1. ✅ Testirati novi `/upgrade-to-provider` endpoint
2. ✅ Testirati da PROVIDER može kreirati Job
3. 🔄 Frontend - dodati "Postani pružatelj" dugme
4. 🔄 Frontend - ProviderProfile setup flow
5. 🔄 Dokumentacija za krajnje korisnike

---

**Ready for Deployment:** ✅ YES  
**Risk Level:** 🟢 LOW (backward compatible)  
**Estimated Downtime:** 0 minutes (rolling update)

