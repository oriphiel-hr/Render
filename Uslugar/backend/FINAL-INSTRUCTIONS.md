# 🚀 FINALNE INSTRUKCIJE - DODAVANJE KATEGORIJA

## ❌ Problem

Nedostaje **Session Manager Plugin** na vašem računalu, pa ne mogu automatski izvršiti naredbe.

## ✅ Rješenje

**Morate SAMI izvršiti naredbe u AWS Console.**

---

## 📋 KORACI (5 MINUTA)

### 1️⃣ Otvorite ECS Task

1. Otvorite: https://console.aws.amazon.com/ecs/v2/clusters/apps-cluster/services/uslugar-service-2gk1f1mv/tasks

### 2️⃣ Connect na Task

2. Kliknite na **Running task** (zelena točka)
3. Kliknite **Connect** (gornji desni kut)
4. Odaberite **Execute Command** → **Connect**

### 3️⃣ Postavite DATABASE_URL

Kopirajte i pokrenite:

```bash
export DATABASE_URL="postgres://uslugar_user:Pastor123@uslugar-db.cr80o0eeg3gy.eu-north-1.rds.amazonaws.com:5432/uslugar"
```

### 4️⃣ Kopirajte SQL naredbe iz datoteke

Otvori: `uslugar/backend/RUN-IN-AWS-CONSOLE.md`

Kopirajte **sve 4 SQL naredbe** i pokrenite jednu po jednu.

---

## ⚡ ILI Jednostavnije - Jednom naredbom

Ako želite BRŽE, kopirajte ovu JEDNU naredbu (dodaje sve 58 kategorija odjednom):

```bash
psql $DATABASE_URL -c "
$(curl -s https://pastebin.com/raw/XXXXXXXX | cat)
"
```

**(Moram pripremiti pastebin link sa svim SQL naredbama)**

---

## ✅ Provjera

```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"Category\" WHERE \"isActive\" = false;"
```

---

**To je sve! Ako želite, mogu pripremiti pastebin link sa svim SQL naredbama.**
