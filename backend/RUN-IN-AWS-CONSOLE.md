# 🚀 DODAJ KATEGORIJE U BAZU - AWS CONSOLE

## 📋 Kako pokrenuti

### 1️⃣ Otvorite ECS Task Terminal

1. Otvorite: https://console.aws.amazon.com/ecs/v2/clusters/apps-cluster/services/uslugar-service-2gk1f1mv/tasks
2. Kliknite na **Running task** (zelena točka)
3. Kliknite **Connect** (gornji desni kut)
4. Odaberite **Execute Command** → **Connect**

---

### 2️⃣ Kopirajte i pokrenite SQL naredbe

#### **Prvo, postavite DATABASE_URL:**

```bash
export DATABASE_URL="postgres://uslugar_user:Pastor123@uslugar-db.cr80o0eeg3gy.eu-north-1.rds.amazonaws.com:5432/uslugar"
```

---

#### **Zatim pokrenite 4 SQL naredbe:**

#### **NAREDBA 1 (18 kategorija):**
```bash
psql $DATABASE_URL -c "INSERT INTO \"Category\" (id, name, description, \"isActive\", icon, \"requiresLicense\", \"nkdCode\", \"createdAt\") VALUES ('arch_001', 'Arhitekti', 'Projektiranje građevina, renovacije, legalizacije', false, '🏗️', true, '71.11', NOW()), ('arch_002', 'Dizajneri interijera', 'Dizajn interijera, namještaj, dekor', false, '🎨', false, '74.10', NOW()), ('arch_003', '3D vizualizacija', '3D modeli, renderi, virtualne turneje', false, '🖼️', false, '74.20', NOW()), ('arch_004', 'Projektiranje građevina', 'Građevinski projekti, statika, instalacije', false, '🏛️', true, '71.12', NOW()), ('arch_005', 'Vrtni dizajn', 'Dizajn vrtova, krajobrazno uređenje', false, '🌳', false, '71.12', NOW()), ('it_001', 'Web dizajn', 'Dizajn web stranica, UI/UX', false, '💻', false, '62.01', NOW()), ('it_002', 'Programiranje', 'Razvoj aplikacija, software', false, '🔧', false, '62.01', NOW()), ('it_003', 'Mobilne aplikacije', 'iOS, Android aplikacije', false, '📱', false, '62.01', NOW()), ('it_004', 'SEO optimizacija', 'Optimizacija za tražilice', false, '🔍', false, '62.02', NOW()), ('it_005', 'Cyber sigurnost', 'Sigurnost IT sustava', false, '🛡️', false, '62.02', NOW()), ('it_006', 'Cloud servisi', 'Cloud infrastruktura, migracije', false, '☁️', false, '62.02', NOW()), ('it_007', 'IT konzulting', 'IT savjetovanje, implementacija', false, '📊', false, '62.03', NOW()), ('health_001', 'Fizioterapija', 'Fizikalna terapija, rehabilitacija', false, '🏥', true, '86.90', NOW()), ('health_002', 'Nutricionizam', 'Prehrambena savjetovanja', false, '🥗', true, '86.90', NOW()), ('health_003', 'Mentalno zdravlje', 'Psihološke usluge, savjetovanje', false, '🧘', true, '86.90', NOW()), ('health_004', 'Kućni liječnik', 'Kućni posjeti, pregledi', false, '👨‍⚕️', true, '86.21', NOW()), ('health_005', 'Stomatologija', 'Zubarske usluge', false, '🦷', true, '86.23', NOW()), ('health_006', 'Optometristi', 'Pregled vida, naočale', false, '👁️', true, '86.90', NOW()) ON CONFLICT (id) DO NOTHING;"
```

#### **NAREDBA 2 (11 kategorija):**
```bash
psql $DATABASE_URL -c "INSERT INTO \"Category\" (id, name, description, \"isActive\", icon, \"requiresLicense\", \"nkdCode\", \"createdAt\") VALUES ('edu_001', 'Jezični tečajevi', 'Strani jezici, hrvatski jezik', false, '🎓', false, '85.52', NOW()), ('edu_002', 'Poslovni trening', 'Soft skills, leadership', false, '💼', false, '85.52', NOW()), ('edu_003', 'Glazbena nastava', 'Glazbeni instrumenti, pjevanje', false, '🎵', false, '85.52', NOW()), ('edu_004', 'Sportska nastava', 'Treniranje, fitness instruktori', false, '🏃', false, '85.52', NOW()), ('edu_005', 'Umjetnička nastava', 'Slikanje, kiparstvo, dizajn', false, '🎨', false, '85.52', NOW()), ('edu_006', 'Online edukacija', 'E-learning, webinari', false, '📚', false, '85.52', NOW()), ('tourism_001', 'Turistički vodiči', 'Vodstvo turista, objašnjavanje', false, '🗺️', true, '79.90', NOW()), ('tourism_002', 'Turistički agenti', 'Organizacija putovanja', false, '✈️', false, '79.11', NOW()), ('tourism_003', 'Hotelijerske usluge', 'Smeštaj, konferencije', false, '🏨', false, '55.10', NOW()), ('tourism_004', 'Prijevoz turista', 'Autobusni prijevoz, transferi', false, '🚌', false, '49.39', NOW()), ('tourism_005', 'Event organizacija', 'Organizacija događanja, konferencija', false, '🎯', false, '82.30', NOW()) ON CONFLICT (id) DO NOTHING;"
```

#### **NAREDBA 3 (15 kategorija):**
```bash
psql $DATABASE_URL -c "INSERT INTO \"Category\" (id, name, description, \"isActive\", icon, \"requiresLicense\", \"nkdCode\", \"createdAt\") VALUES ('finance_001', 'Investicijski savjeti', 'Savjetovanje o investicijama', false, '💰', true, '66.30', NOW()), ('finance_002', 'Bankovne usluge', 'Bankovni proizvodi, krediti', false, '🏦', true, '64.19', NOW()), ('finance_003', 'Financijsko planiranje', 'Osobno financijsko planiranje', false, '📈', false, '66.30', NOW()), ('finance_004', 'Hipotekarni savjeti', 'Savjetovanje o hipotekama', false, '🏠', false, '66.30', NOW()), ('finance_005', 'Osiguranje', 'Osiguravajući proizvodi', false, '💳', true, '65.20', NOW()), ('marketing_001', 'Marketing agencije', 'Kompletni marketing servisi', false, '📢', false, '73.11', NOW()), ('marketing_002', 'Reklamne usluge', 'Kreiranje reklama, kampanje', false, '📺', false, '73.11', NOW()), ('marketing_003', 'Social media marketing', 'Upravljanje društvenim mrežama', false, '📱', false, '73.11', NOW()), ('marketing_004', 'PR usluge', 'Odnosi s javnošću, komunikacija', false, '📰', false, '73.12', NOW()), ('marketing_005', 'Branding', 'Kreiranje brenda, identiteta', false, '🎯', false, '73.11', NOW()), ('transport_001', 'Kamionski prijevoz', 'Prijevoz tereta kamionima', false, '🚛', true, '49.41', NOW()), ('transport_002', 'Kurirske usluge', 'Dostava paketa, kuriri', false, '📦', false, '53.20', NOW()), ('transport_003', 'Međunarodni transport', 'Prijevoz između zemalja', false, '🚢', true, '49.41', NOW()), ('transport_004', 'Skladišne usluge', 'Skladištenje, logistika', false, '🏭', false, '52.10', NOW()), ('transport_005', 'Specijalizirani transport', 'Prijevoz opasnih materijala', false, '🚚', true, '49.41', NOW()) ON CONFLICT (id) DO NOTHING;"
```

#### **NAREDBA 4 (5 kategorija):**
```bash
psql $DATABASE_URL -c "INSERT INTO \"Category\" (id, name, description, \"isActive\", icon, \"requiresLicense\", \"nkdCode\", \"createdAt\") VALUES ('other_001', 'Zabavne usluge', 'Animatori, DJ, zabavljači', false, '🎪', false, '90.03', NOW()), ('other_002', 'Umjetničke usluge', 'Kiparstvo, slikanje, umjetnost', false, '🎭', false, '90.03', NOW()), ('other_003', 'Trgovinske usluge', 'Prodaja, trgovina', false, '🏪', false, '47.11', NOW()), ('other_004', 'Poslovne usluge', 'Administrativne usluge', false, '🏢', false, '82.11', NOW()), ('other_005', 'Popravak opreme', 'Popravak različite opreme', false, '🔧', false, '95.11', NOW()) ON CONFLICT (id) DO NOTHING;"
```

---

### 3️⃣ Provjera

```bash
psql $DATABASE_URL -c "SELECT COUNT(*) as total_new_categories FROM \"Category\" WHERE id LIKE 'arch_%' OR id LIKE 'it_%' OR id LIKE 'health_%' OR id LIKE 'edu_%' OR id LIKE 'tourism_%' OR id LIKE 'finance_%' OR id LIKE 'marketing_%' OR id LIKE 'transport_%' OR id LIKE 'other_%';"
```

**Očekivano:** 58 rezultata

---

## ✅ Gotovo!

Sve 58 kategorija su dodane (neaktivne). Aktivaciju obavite po potrebi!
