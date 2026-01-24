# 📸 Checkpoint & Rollback Mehanizam za Testiranje

Fleksibilan sistem koji omogućuje kreiranje "snimaka" baze podataka i vraćanje na te točke. Savršen za E2E testove koji trebaju izolirane okoline.

## 🎯 Karakteristike

✅ **Tablica-specifičan** - Kreiraj checkpoint samo za tablice koje ti trebaju  
✅ **Brz** - Sprema samo relevantne podatke  
✅ **Fleksibilan** - `null` = sve tablice, ili specificiraj koje trebaju  
✅ **Persistent** - Checkpoint-i se sprema u datoteke  
✅ **Jednostavan** - API pristup preko REST-a  

## 📚 API Primjeri

### 1. Kreiraj checkpoint za sve tablice

```bash
curl -X POST http://localhost:3000/api/testing/checkpoint/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "before_registration_test",
    "tables": null
  }'
```

**Odgovor:**
```json
{
  "success": true,
  "checkpointId": "before_registration_test_1706354399999_abc123",
  "message": "Checkpoint 'before_registration_test' kreiran"
}
```

### 2. Kreiraj checkpoint samo za specifične tablice

```bash
curl -X POST http://localhost:3000/api/testing/checkpoint/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "before_provider_registration",
    "tables": ["User", "ProviderProfile", "Job", "Offer"]
  }'
```

**Odgovor:**
```json
{
  "success": true,
  "checkpointId": "before_provider_registration_1706354399999_xyz789",
  "message": "Checkpoint 'before_provider_registration' kreiran"
}
```

### 3. Vrati bazu na checkpoint

```bash
curl -X POST http://localhost:3000/api/testing/checkpoint/rollback \
  -H "Content-Type: application/json" \
  -d '{
    "checkpointId": "before_provider_registration_1706354399999_xyz789"
  }'
```

**Odgovor:**
```json
{
  "success": true,
  "message": "Rollback na checkpoint 'before_provider_registration_1706354399999_xyz789' uspješan"
}
```

### 4. Prikazi sve checkpoint-e

```bash
curl http://localhost:3000/api/testing/checkpoints
```

**Odgovor:**
```json
{
  "checkpoints": [
    {
      "id": "before_registration_test_1706354399999_abc123",
      "name": "before_registration_test",
      "tables": ["User", "ProviderProfile", "Job", "Offer", "Chat"],
      "timestamp": "2024-01-27T10:00:00.000Z"
    },
    {
      "id": "before_provider_registration_1706354399999_xyz789",
      "name": "before_provider_registration",
      "tables": ["User", "ProviderProfile"],
      "timestamp": "2024-01-27T10:15:00.000Z"
    }
  ]
}
```

### 5. Obriši checkpoint

```bash
curl -X DELETE http://localhost:3000/api/testing/checkpoint/before_registration_test_1706354399999_abc123
```

**Odgovor:**
```json
{
  "success": true,
  "message": "Checkpoint 'before_registration_test_1706354399999_abc123' obrisan"
}
```

## 🧪 Primjer Test Scenarija

```javascript
// Playwright test primjer
import { test, expect } from '@playwright/test';

const API = 'http://localhost:3000/api';

test('Sigurnost: Klijent ne vidi tuđe poslove', async ({ page }) => {
  // 1. Kreiraj checkpoint PRE nego što kreneš s testom
  const checkpointRes = await fetch(`${API}/testing/checkpoint/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'before_data_isolation_test',
      tables: ['User', 'Job', 'Offer', 'Chat']
    })
  });
  const { checkpointId } = await checkpointRes.json();
  console.log(`✅ Checkpoint kreiran: ${checkpointId}`);

  try {
    // 2. TESTIRANJE
    
    // Kreiraj client1 i objavi posao
    await page.goto('https://uslugar.eu/register');
    // ... registracija ...
    // ... objava posla ...
    
    // Odjavi se
    // ... logout ...
    
    // Prijavi se kao client2
    // Provjeri da client2 NE VIDI posao od client1
    const isJobVisible = await page.locator('text=Posao od client1').isVisible({ timeout: 1000 }).catch(() => false);
    expect(isJobVisible).toBe(false);
    
    console.log('✅ Test prošao: Data isolation radi');

  } finally {
    // 3. ROLLBACK - vrati bazu u originalnu stanju
    const rollbackRes = await fetch(`${API}/testing/checkpoint/rollback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkpointId })
    });
    console.log(`⏪ Rollback uspješan`);

    // 4. Obriši checkpoint (opciono)
    await fetch(`${API}/testing/checkpoint/${checkpointId}`, { method: 'DELETE' });
  }
});
```

## 📊 Primjer: Testiranje s više scenarija

```javascript
// Koristi isti checkpoint za više test varijacija
async function runDataIsolationTests() {
  // Kreiraj checkpoint jednom
  const res = await fetch(`${API}/testing/checkpoint/create`, {
    method: 'POST',
    body: JSON.stringify({
      name: 'isolation_baseline',
      tables: ['User', 'Job', 'Offer', 'Chat', 'Review']
    })
  });
  const { checkpointId } = await res.json();

  try {
    // Scenario 1: Klijent ne vidi tuđe poslove
    await testScenario1();
    await rollback(checkpointId); // Vrati se nakon testa 1

    // Scenario 2: Provider ne vidi tuđe ponude
    await testScenario2();
    await rollback(checkpointId); // Vrati se nakon testa 2

    // Scenario 3: Director vidi samo svoj tim
    await testScenario3();
    await rollback(checkpointId); // Vrati se nakon testa 3

  } finally {
    // Obriši checkpoint na kraju
    await fetch(`${API}/testing/checkpoint/${checkpointId}`, { method: 'DELETE' });
  }
}
```

## 🔧 Tablica-specifičan Rollback (Primjeri)

### Scenario 1: Test samo registracije (samo User tablica)
```javascript
const res = await fetch(`${API}/testing/checkpoint/create`, {
  method: 'POST',
  body: JSON.stringify({
    name: 'auth_test',
    tables: ['User'] // Samo registracija korisnika
  })
});
```

### Scenario 2: Test objave posla (User, Job, Media tablice)
```javascript
const res = await fetch(`${API}/testing/checkpoint/create`, {
  method: 'POST',
  body: JSON.stringify({
    name: 'job_posting_test',
    tables: ['User', 'Job', 'Media', 'JobImage']
  })
});
```

### Scenario 3: Test cijelog flow-a (sve tablice)
```javascript
const res = await fetch(`${API}/testing/checkpoint/create`, {
  method: 'POST',
  body: JSON.stringify({
    name: 'full_integration_test',
    tables: null // null = sve tablice
  })
});
```

## 💾 Checkpoint Datoteke

Checkpoint-i se automatski sprema u:
```
backend/.test-checkpoints/
├── before_registration_test_1706354399999_abc123.json
├── before_provider_registration_1706354399999_xyz789.json
└── ...
```

Svaki fajl sadrži:
```json
{
  "id": "...",
  "name": "...",
  "tables": ["User", "Job", ...],
  "timestamp": "2024-01-27T10:00:00.000Z",
  "data": {
    "User": [{ id: "...", email: "...", ... }, ...],
    "Job": [{ id: "...", title: "...", ... }, ...]
  }
}
```

## ⚠️ Važne Napomene

1. **Performanse**: Kreiraj checkpoint-e samo za tablice koje ti trebaju, ne za cijelu bazu
2. **Integritet**: Rollback obrišu sve redake i vraćaju checkpoint podatke - pazi na foreign key-eve!
3. **Cleanup**: Obriši stare checkpoint-e nakon što su testovi gotovi
4. **Parallelizacija**: Koristi različite checkpoint ID-eve za paralelne testove

## 🚀 Best Practices

✅ Kreiraj checkpoint **prije** testiranja  
✅ Koristi **specifične tablice** (manje datoteke, brže)  
✅ Rollback-aj nakon **svakog test scenarija**  
✅ Obriši checkpoint-e na kraju sesije  
✅ Logiraj checkpoint ID-eve za debugging  

## 🔗 Povezane Rute

```
POST   /api/testing/checkpoint/create    - Kreiraj checkpoint
POST   /api/testing/checkpoint/rollback  - Vrati se na checkpoint
GET    /api/testing/checkpoints          - Prikazi sve checkpoint-e
DELETE /api/testing/checkpoint/:id       - Obriši checkpoint
POST   /api/testing/test-data            - Spremi test podatke
GET    /api/testing/test-data            - Preuzmi test podatke
```

