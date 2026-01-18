# 🔧 Prisma Workflow Setup - Render Database

## 📋 Render Database Configuration

Tvoj Render PostgreSQL connection string:
```
postgresql://uslugar_user:Qwvk5j6QpbR8XGO8flXIDeg0GU76xORm@dpg-d5g06gshg0os738en9cg-a.frankfurt-postgres.render.com/uslugar
```

## 🔐 GitHub Secrets Setup

### Korak 1: Dodaj DATABASE_URL Secret

1. **GitHub Repository** → **Settings** → **Secrets and variables** → **Actions**
2. Klikni **"New repository secret"**
3. **Name:** `DATABASE_URL`
4. **Secret:** `postgresql://uslugar_user:Qwvk5j6QpbR8XGO8flXIDeg0GU76xORm@dpg-d5g06gshg0os738en9cg-a.frankfurt-postgres.render.com/uslugar`
5. Klikni **"Add secret"**

### Korak 2: Verifikacija

Nakon dodavanja secret-a, Prisma workflow će automatski:
- ✅ Validirati Prisma schema
- ✅ Generirati Prisma Client
- ✅ Primijeniti migracije na Render bazu (samo na `main` branch-u)

---

## 🚀 Kako Pokrenuti Migracije

### Automatski (Preporučeno)

Migracije će se automatski pokrenuti kada:
- ✅ Push-aš promjene u `backend/prisma/schema.prisma` na `main` branch
- ✅ Push-aš nove migracije u `backend/prisma/migrations/` na `main` branch

### Ručno

1. **GitHub Repository** → **Actions** tab
2. Odaberi workflow **"Prisma - Migrate Database"**
3. Klikni **"Run workflow"**
4. Odaberi branch (npr. `main`)
5. Klikni **"Run workflow"**

---

## ⚠️ Važne Napomene

### 1. Render Connection Pooling

Render koristi connection pooling. Ako dobiješ grešku "too many connections", možda trebaš:
- Koristiti **read replica** endpoint za read operacije
- Optimizirati connection pooling u aplikaciji

### 2. Migracije se Primjenjuju Samo na Main

Za sigurnost, migracije se primjenjuju samo kada:
- ✅ Branch je `main`
- ✅ Event je `push` ili `workflow_dispatch` (ne `pull_request`)

### 3. Prisma Client se Generira uvijek

Prisma Client se generira i u build i u migrate workflow-u, što osigurava da je uvijek sinkroniziran sa schema-om.

---

## 🔍 Troubleshooting

### Problem: "DATABASE_URL not set"

**Rješenje:**
1. Provjeri da li je `DATABASE_URL` secret dodan u GitHub Secrets
2. Provjeri da li je secret točno napisan (bez razmaka, s cijelim connection string-om)

### Problem: "Connection refused" ili "timeout"

**Rješenje:**
1. Provjeri da li je Render baza aktívna (Render Dashboard)
2. Provjeri da li IP GitHub Actions runner-a nije blokiran
3. Render baze su javno dostupne, ali provjeri firewall rules

### Problem: "Migration failed"

**Rješenje:**
1. Provjeri Prisma migracije lokalno prije push-a
2. Provjeri da li migracije nisu u konfliktu s postojećim podacima
3. Provjeri logove u GitHub Actions za detaljnu grešku

---

## 📋 Workflow Status

Provjeri status migracija:

1. **GitHub Repository** → **Actions**
2. Pronađi **"Prisma - Migrate Database"** workflow
3. Klikni na najnoviji run da vidiš detalje

---

## ✅ Checklist

- [ ] `DATABASE_URL` secret je dodan u GitHub Secrets
- [ ] Connection string je točan i komplet
- [ ] Prisma schema je validan (`npx prisma validate`)
- [ ] Migracije su testirane lokalno
- [ ] Render baza je aktívna i dostupna

---

## 🎯 Sledeći Koraci

1. **Dodaj `DATABASE_URL` secret** (ako već nije dodan)
2. **Testiraj workflow** ručno preko "Run workflow"
3. **Provjeri logove** da se migracije primjenjuju ispravno
4. **Monitor Render bazu** nakon migracija

