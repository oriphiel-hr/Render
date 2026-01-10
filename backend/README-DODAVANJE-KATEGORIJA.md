# 📝 Kako dodati 58 novih kategorija u Uslugar

## ⚡ Brzi Start

**Jednostavno - otvorite AWS Console i pokrenite:**

```bash
node add-new-categories.js
```

Detaljne instrukcije: `AWS-CONSOLE-INSTRUCTIONS.md`

---

## 📁 Kreirane datoteke

1. **`add-new-categories.js`** - Node.js skripta (Glavna!)
2. **`add-categories.sql`** - SQL alternativa
3. **`AWS-CONSOLE-INSTRUCTIONS.md`** - ⭐ Detaljne instrukcije za AWS Console
4. **`ADD-CATEGORIES-INSTRUCTIONS.md`** - Opća dokumentacija
5. **`KAKO-POKRENUTI.md`** - Alternativne metode

---

## 🎯 Što će biti dodano?

- ✅ **58 novih kategorija**
- ✅ Sve su **neaktivne** (`isActive: false`)
- ✅ Podijeljene na 3 prioriteta (visok, srednji, nizak)
- ✅ Svaka ima: ID, naziv, opis, ikonu, NKD kod
- ✅ Ukupno: **100 kategorija** (42 postojeće + 58 novih)

---

## 📋 Kategorije po prioritetima

### 🔥 VISOKA (18 kategorija)
- Arhitektura i dizajn (5)
- IT i web usluge (7)
- Zdravstvene usluge (6)

### ⚡ SREDNJA (28 kategorija)
- Edukacija (6)
- Turizam (5)
- Financije (5)
- Marketing (5)
- Transport (5)

### 📉 NISKA (5 kategorija)
- Ostale usluge (5)

---

## 🚀 Kako pokrenuti?

### Opcija 1: AWS Console (Preporučeno)

1. AWS Console → ECS → `apps-cluster` → `uslugar-service-2gk1f1mv`
2. Running task → Connect → Execute Command
3. Pokrenite: `node add-new-categories.js`

**Vidi:** `AWS-CONSOLE-INSTRUCTIONS.md` za detalje

### Opcija 2: SQL direktno

```bash
psql $DATABASE_URL -f add-categories.sql
```

---

## ✅ Provjera

```sql
SELECT COUNT(*) FROM "Category" WHERE id LIKE 'arch_%' OR id LIKE 'it_%';
```

Očekivano: **58 rezultata**

---

## 🎯 Aktivacija kategorija

```sql
-- Aktiviraj visokoprofitabilne
UPDATE "Category" SET "isActive" = true 
WHERE id IN ('arch_001', 'arch_002', 'it_001', 'it_002', 'health_001');

-- ILI aktiviraj sve odjednom
UPDATE "Category" SET "isActive" = true 
WHERE id LIKE 'arch_%' OR id LIKE 'it_%' OR id LIKE 'health_%';
```

---

## 📞 Pomoć

Za detaljne instrukcije vidi:
- **`AWS-CONSOLE-INSTRUCTIONS.md`** - Za AWS Console
- **`ADD-CATEGORIES-INSTRUCTIONS.md`** - Za sve metode
