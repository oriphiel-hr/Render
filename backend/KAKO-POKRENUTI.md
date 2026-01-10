# Kako pokrenuti dodavanje kategorija

## ⚡ Brzi način (preporučeno)

### Korak 1: Kopirajte SQL datoteku na ECS

```bash
# Copy SQL file to ECS
scp add-categories.sql ubuntu@your-ec2-ip:/tmp/
```

### Korak 2: Logirajte se na ECS kontejner

Putem AWS Console:
1. Idite na ECS → Cluster: `apps-cluster` → Service: `uslugar-service-2gk1f1mv`
2. Kliknite na running task
3. Kliknite "Connect" (desno gore)
4. Odaberite "Execute Command"

### Korak 3: Pokrenite SQL import

Unutar ECS kontejnera:

```bash
# Povezivanje na PostgreSQL
psql $DATABASE_URL -f /app/add-categories.sql
```

ILI ako je SQL već kopiran:

```bash
cd /app
psql $DATABASE_URL < add-categories.sql
```

---

## 📝 Alternativni način: Node.js skripta

### Korak 1: Kopirajte JS datoteku

```bash
scp add-new-categories.js ubuntu@your-ec2-ip:/tmp/
```

### Korak 2: Uploadajte na Docker kontejner

```bash
# Copy file to container
docker cp add-new-categories.js container_name:/app/

# Execute in container
docker exec container_name node /app/add-new-categories.js
```

ILI putem ECS Exec:

```bash
# Pokreni Node.js skriptu
node add-new-categories.js
```

---

## 🔧 Troubleshooting

### Problem: "SessionManagerPlugin is not found"
**Rješenje:** Instalirajte AWS Session Manager plugin:
```bash
# Windows (PowerShell as Admin)
choco install session-manager-plugin

# Mac
brew install session-manager-plugin
```

### Problem: "Can't reach database"
**Rješenje:** Veza je vjerojatno blokirana. Koristite SQL pristup preko ECS-a.

---

## ✅ Provjera nakon dodavanja

```sql
-- Provjeri broj novih kategorija
SELECT COUNT(*) FROM "Category" WHERE id LIKE 'arch_%' OR id LIKE 'it_%' OR id LIKE 'health_%';

-- Provjeri status (sve bi trebale biti neaktivne)
SELECT id, name, "isActive" FROM "Category" WHERE id LIKE 'arch_%' ORDER BY id;
```

---

## 🎯 Aktivacija kategorija

```sql
-- Aktiviraj visokoprofitabilne kategorije
UPDATE "Category" 
SET "isActive" = true 
WHERE id IN ('arch_001', 'arch_002', 'it_001', 'it_002', 'it_003', 'health_001', 'health_002', 'health_003');
```
