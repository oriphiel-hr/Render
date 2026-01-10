# 🚀 POKRENITE OVO U AWS CONSOLE

## Koraci:

### 1. Otvorite: https://console.aws.amazon.com/ecs/v2/clusters/apps-cluster/services/uslugar-service-2gk1f1mv/tasks

### 2. Kliknite: Running task → Connect → Execute Command

### 3. Kopirajte i pokrenite sljedeće naredbe (jednu po jednu):

#### PRVA NAREDBA (10 kategorija):

```bash
psql $DATABASE_URL -c "INSERT INTO \"Category\" (id, name, description, \"isActive\", icon, \"requiresLicense\", \"nkdCode\", \"createdAt\") VALUES ('arch_001', 'Arhitekti', 'Projektiranje građevina, renovacije, legalizacije', false, '🏗️', true, '71.11', NOW()), ('arch_002', 'Dizajneri interijera', 'Dizajn interijera, namještaj, dekor', false, '🎨', false, '74.10', NOW()), ('arch_003', '3D vizualizacija', '3D modeli, renderi, virtualne turneje', false, '🖼️', false, '74.20', NOW()), ('arch_004', 'Projektiranje građevina', 'Građevinski projekti, statika, instalacije', false, '🏛️', true, '71.12', NOW()), ('arch_005', 'Vrtni dizajn', 'Dizajn vrtova, krajobrazno uređenje', false, '🌳', false, '71.12', NOW()), ('it_001', 'Web dizajn', 'Dizajn web stranica, UI/UX', false, '💻', false, '62.01', NOW()), ('it_002', 'Programiranje', 'Razvoj aplikacija, software', false, '🔧', false, '62.01', NOW()), ('it_003', 'Mobilne aplikacije', 'iOS, Android aplikacije', false, '📱', false, '62.01', NOW()), ('it_004', 'SEO optimizacija', 'Optimizacija za tražilice', false, '🔍', false, '62.02', NOW()), ('it_005', 'Cyber sigurnost', 'Sigurnost IT sustava', false, '🛡️', false, '62.02', NOW()) ON CONFLICT (id) DO NOTHING;"
```

#### DRUGA NAREDBA (10 kategorija):

```bash
psql $DATABASE_URL -c "INSERT INTO \"Category\" (id, name, description, \"isActive\", icon, \"requiresLicense\", \"nkdCode\", \"createdAt\") VALUES ('it_006', 'Cloud servisi', 'Cloud infrastruktura, migracije', false, '☁️', false, '62.02', NOW()), ('it_007', 'IT konzulting', 'IT savjetovanje, implementacija', false, '📊', false, '62.03', NOW()), ('health_001', 'Fizioterapija', 'Fizikalna terapija, rehabilitacija', false, '🏥', true, '86.90', NOW()), ('health_002', 'Nutricionizam', 'Prehrambena savjetovanja', false, '🥗', true, '86.90', NOW()), ('health_003', 'Mentalno zdravlje', 'Psihološke usluge, savjetovanje', false, '🧘', true, '86.90', NOW()), ('health_004', 'Kućni liječnik', 'Kućni posjeti, pregledi', false, '👨‍⚕️', true, '86.21', NOW()), ('health_005', 'Stomatologija', 'Zubarske usluge', false, '🦷', true, '86.23', NOW()), ('health_006', 'Optometristi', 'Pregled vida, naočale', false, '👁️', true, '86.90', NOW()), ('edu_001', 'Jezični tečajevi', 'Strani jezici, hrvatski jezik', false, '🎓', false, '85.52', NOW()), ('edu_002', 'Poslovni trening', 'Soft skills, leadership', false, '💼', false, '85.52', NOW()) ON CONFLICT (id) DO NOTHING;"
```

**Pokrenite sve 6 naredbi jednu za drugom!**

---

## Provjera:

```sql
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"Category\" WHERE id LIKE 'arch_%' OR id LIKE 'it_%' OR id LIKE 'health_%';"
```

Očekivano: **26 rezultata** (10 + 10 + još 6)

---

**Napomena**: Trebam dodati još 6 naredbi za preostalih ~38 kategorija. Želite li da ih dodam?
