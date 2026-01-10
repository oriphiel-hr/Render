# 🔧 FIX PRODUCTION DATABASE - projectType Error

**Problem**: 
```
Invalid `prisma.job.findMany()` invocation: 
The column `Job.projectType` does not exist in the current database.
```

**URL**: https://uslugar.oriph.io/#leads

---

## 🎯 Rješenje

Kod koristi `projectType` i `customFields` kolone koje ne postoje u produkcijskoj bazi podataka.

---

## ✅ Koraci za Fix

### **1. Kreirana Migracija** 

📁 `backend/prisma/migrations/20251021120000_add_project_type/migration.sql`

```sql
-- Add projectType and customFields to Job table
ALTER TABLE "Job" ADD COLUMN "projectType" TEXT;
ALTER TABLE "Job" ADD COLUMN "customFields" JSONB;
```

### **2. Pokrenuti Migraciju na Produkciji**

```bash
# Na AWS ECS (CloudShell ili direktno u AWS Console)

# Opcija A: ECS Exec
aws ecs execute-command \
  --cluster apps-cluster \
  --task <TASK_ARN> \
  --container uslugar \
  --region eu-north-1 \
  --command "npx prisma migrate deploy --schema=prisma/schema.prisma"

# Opcija B: RDS direktno (SQL)
psql $DATABASE_URL -f prisma/migrations/20251021120000_add_project_type/migration.sql
```

---

## 📋 SQL Naredba (Direktno)

Ako nemate pristup ECS Exec, pokrenite SQL direktno na RDS:

```sql
-- Pokrenite ovo na AWS RDS PostgreSQL bazi:
ALTER TABLE "Job" ADD COLUMN "projectType" TEXT;
ALTER TABLE "Job" ADD COLUMN "customFields" JSONB;
```

---

## 🔍 Provjera

```sql
-- Provjerite da li kolone postoje:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Job' 
AND column_name IN ('projectType', 'customFields');
```

---

## ⚠️ Alternativno: Privremeno Fix

Ako ne možete odmah dodati kolone, privremeno uklonite `projectType` iz koda:

```javascript
// backend/src/routes/jobs.js
const job = await prisma.job.create({
  data: {
    title, 
    description, 
    categoryId: finalCategoryId,
    // projectType: projectType || null,  // ← Privremeno zakomentiraj
    customFields: customFields || null,
    // ...
  }
});
```

**Ovo NIJE preporučeno** - bolje je dodati kolone u bazu!

---

## 🚀 Preporučeni Put

1. **Pokrenite migraciju** preko ECS Exec ili SQL direktno
2. **Ponovo pokrenite** `/api/jobs` i `/api/exclusive/leads/available`
3. **Provjerite** da error više nije prisutan

---

## 📊 Što su ove Kolone?

**projectType**: Vrsta projekta (npr. "Renovacija", "Gradnja", "Popravak")

**customFields**: JSON podaci o dodatnim poljima specifičnim za kategoriju

**U schema.prisma:**
```prisma
model Job {
  // ...
  projectType  String? // Vrsta projekta (npr. "Renovacija", "Gradnja", "Popravak")
  customFields Json? // Dinamička polja ovisno o kategoriji i vrsti projekta
  // ...
}
```

---

## ✅ STATUS

- ✅ Migracija kreirana
- ⏳ Čeka deployment na produkciju
- ⏳ Treba pokrenuti SQL na AWS RDS

