# 📋 Instrukcije za AWS Console

## Korak-po-korak

### 1️⃣ Pristupite ECS kontejneru

1. **Otvorite AWS Console** → https://console.aws.amazon.com
2. Idite na **ECS (Elastic Container Service)**
3. Odaberite **Cluster: `apps-cluster`**
4. Kliknite na **Services** → **`uslugar-service-2gk1f1mv`**
5. Kliknite na **Running task** (zelena točka)
6. Kliknite **Connect** (gornji desni kut)
7. Odaberite **Execute Command**

---

### 2️⃣ Pokrenite Node.js skriptu

U terminalu AWS Console kopirajte i pokrenite:

```bash
node add-new-categories.js
```

**ILI** ako skripta nije u kontejneru, pokrenite direktno:

```bash
cd /app && node -e "$(curl -s https://raw.githubusercontent.com/your-repo/add-new-categories.js)"
```

---

### 3️⃣ ALTERNATIVA: SQL pristup

Ako Node.js ne radi, koristite direktni SQL:

```bash
# Prvo provjerite postojeće kategorije
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"Category\";"

# Zatim pokrenite SQL import
psql $DATABASE_URL -f add-categories.sql
```

ILI kopirajte SQL sadržaj i pokrenite direktno:

```bash
psql $DATABASE_URL << EOF
INSERT INTO "Category" (id, name, description, "isActive", icon, "requiresLicense", "nkdCode", "createdAt") VALUES
('arch_001', 'Arhitekti', 'Projektiranje građevina, renovacije, legalizacije', false, '🏗️', true, '71.11', NOW()),
('arch_002', 'Dizajneri interijera', 'Dizajn interijera, namještaj, dekor', false, '🎨', false, '74.10', NOW()),
...
(onastavi sa svim kategorijama)
EOF
```

---

### 4️⃣ Provjera rezultata

```sql
-- Provjeri broj kategorija
SELECT COUNT(*) FROM "Category" WHERE "isActive" = false;

-- Provjeri nove kategorije
SELECT id, name, icon, "requiresLicense" 
FROM "Category" 
WHERE id LIKE 'arch_%' OR id LIKE 'it_%' OR id LIKE 'health_%'
ORDER BY id
LIMIT 10;
```

---

### 5️⃣ Aktivacija kategorija (opcionalno)

```sql
-- Aktiviraj sve nove kategorije
UPDATE "Category" 
SET "isActive" = true 
WHERE id LIKE 'arch_%' OR id LIKE 'it_%' OR id LIKE 'health_%' 
   OR id LIKE 'edu_%' OR id LIKE 'tourism_%' OR id LIKE 'finance_%' 
   OR id LIKE 'marketing_%' OR id LIKE 'transport_%' OR id LIKE 'other_%';
```

---

## 🚨 Troubleshooting

### Problem: "File not found"
**Rješenje:** Provjerite da li ste u `/app` direktoriju:
```bash
pwd
ls -la
```

### Problem: "Module not found"
**Rješenje:** Provjerite Prisma instalaciju:
```bash
npm list @prisma/client
```

### Problem: "Database connection failed"
**Rješenje:** Provjerite environment varijablu:
```bash
echo $DATABASE_URL
```

---

## ✅ Očekivani rezultat

Nakon uspješnog izvršavanja:
- **58 novih kategorija** će biti dodano
- Sve će biti **neaktivne** (`isActive: false`)
- Ukupno kategorija: **100** (42 postojeće + 58 novih)
