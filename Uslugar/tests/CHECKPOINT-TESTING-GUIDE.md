# 📸 Checkpoint & Rollback Testing Guide

Fleksibilan mehanizam za upravljanje test bazom podataka. Savršen za:

✅ **Data Isolation** testove - provjera da korisnici vide samo svoje podatke  
✅ **Multi-user scenariji** - testiranje s više istovremenih korisnika  
✅ **Ponovna korištenja baze** - isti checkpoint za više test varijacija  
✅ **Brzo cleanup** - automatski vraćanje nakon svakog testa  

---

## 🚀 Brzi Start

### 1. Kreiraj checkpoint preko Admin Panela

1. Otvori: `https://www.uslugar.eu/admin/testing#test-data`
2. Klikom na tab **⚙️ Konfiguracija**
3. Pronađi sekciju **📸 Checkpoint & Rollback**
4. Unesi:
   - **Naziv**: npr. `before_data_isolation_test`
   - **Tablice**: npr. `User,Job,Offer,Chat` (ostavi prazno za sve)
5. Kliknuti **📸 Kreiraj**

### 2. U Playwright Testu

```javascript
import { CheckpointHelper } from '../helpers/checkpoint-helper.js';

const checkpoint = new CheckpointHelper('http://localhost:3000/api');

test('Moj test', async ({ page }) => {
  // Kreiraj checkpoint PRE testa
  const cpId = await checkpoint.create('my_test', ['User', 'Job']);

  try {
    // TESTIRANJE
    // ... test kod ...
  } finally {
    // Vrati se na checkpoint nakon testa
    await checkpoint.rollback(cpId);
  }
});
```

---

## 📚 Detaljni Primjeri

### Primjer 1: Data Isolation Test

```javascript
test('Data Isolation: Klijent ne vidi tuđe poslove', async ({ browser }) => {
  // 1. Checkpoint samo za tablice koje trebam
  const cpId = await checkpoint.create('data_isolation', ['User', 'Job']);

  try {
    // 2. Dva odvojena browsera = dva različita klijenta
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // Klijent 1: Registracija i objava posla
    await registerAndPostJob(page1, 'client1@test.hr');

    // Klijent 2: Registracija
    await register(page2, 'client2@test.hr');

    // Klijent 2: Provjeri da ne vidi posao od Klijenta 1
    await page2.goto('http://localhost:5173/jobs');
    const jobTitle = page2.locator('text=Posao od Klijenta 1');
    
    // TREBALO BI DA NE BUDE VIDLJIVO!
    const isVisible = await jobTitle.isVisible({ timeout: 1000 }).catch(() => false);
    expect(isVisible).toBe(false); // ✅ PASS

    await context1.close();
    await context2.close();

  } finally {
    // Cleanup: Vrati bazu
    await checkpoint.rollback(cpId);
  }
});
```

### Primjer 2: Ponovna Korištenja Checkpointa

```javascript
test('Reuse - Isti checkpoint za više scenarija', async ({ page }) => {
  // Kreiraj checkpoint JEDNOM
  const cpId = await checkpoint.create('reusable', ['User', 'Job']);

  try {
    // Scenario 1
    await testScenario1(page);
    await checkpoint.rollback(cpId); // Vrati se

    // Scenario 2
    await testScenario2(page);
    await checkpoint.rollback(cpId); // Vrati se

    // Scenario 3
    await testScenario3(page);
    await checkpoint.rollback(cpId); // Vrati se

  } finally {
    // Cleanup
    await checkpoint.cleanup(); // Obriši sve checkpoint-e
  }
});
```

### Primjer 3: Cijela Baza (null = sve tablice)

```javascript
test('Integracijski test - cijela baza', async ({ page }) => {
  // null = sve tablice (spora, ali kompletan snapshot)
  const cpId = await checkpoint.create('full_integration', null);

  try {
    // Kompletan test flow
    await completeUserJourney(page);
  } finally {
    await checkpoint.rollback(cpId);
  }
});
```

### Primjer 4: Cleanup Helper

```javascript
import { setupCheckpointTesting } from '../helpers/checkpoint-helper.js';

test.describe('Testovi s checkpoint-ima', () => {
  const checkpoint = setupCheckpointTesting(test);
  let cpId;

  test.beforeEach(async () => {
    // Kreiraj checkpoint prije svakog testa
    cpId = await checkpoint.create(`test_${Date.now()}`, ['User', 'Job']);
  });

  test.afterEach(async () => {
    // Rollback nakon svakog testa
    await checkpoint.rollback(cpId);
  });

  test.afterAll(async () => {
    // Cleanup na kraju (automatski!)
    // setupCheckpointTesting to radi
  });

  test('Test 1', async ({ page }) => {
    // Svaki test počinje s čistom bazom!
  });

  test('Test 2', async ({ page }) => {
    // Čista baza opet
  });
});
```

---

## 🔧 API Reference

### CheckpointHelper Klasa

#### `new CheckpointHelper(apiUrl)`
```javascript
const cp = new CheckpointHelper('http://localhost:3000/api');
```

#### `create(name, tables)`
Kreiraj checkpoint

```javascript
// Sve tablice
const id = await cp.create('my_checkpoint', null);

// Samo specifične
const id = await cp.create('my_checkpoint', ['User', 'Job', 'Offer']);
```

**Parametri:**
- `name` (string) - Naziv checkpoint-a
- `tables` (Array | null) - Tablice za checkpoint (null = sve)

**Vraća:** checkpointId (string)

#### `rollback(checkpointId)`
Vrati bazu na checkpoint

```javascript
await cp.rollback(checkpointId);
```

#### `delete(checkpointId)`
Obriši checkpoint

```javascript
await cp.delete(checkpointId);
```

#### `list()`
Prikazi sve checkpoint-e

```javascript
const checkpoints = await cp.list();
checkpoints.forEach(cp => {
  console.log(`${cp.name}: ${cp.tables.join(', ')}`);
});
```

#### `cleanup()`
Obriši sve kreirane checkpoint-e u sesiji

```javascript
await cp.cleanup(); // Najjednostavnije!
```

---

## 📊 Primjeri Tablica za Checkpoint

### Scenarij 1: Auth Testovi
```javascript
['User']
```

### Scenarij 2: Job Posting
```javascript
['User', 'Job', 'Media', 'JobImage']
```

### Scenarij 3: Offers & Negotiation
```javascript
['User', 'ProviderProfile', 'Job', 'Offer', 'Chat']
```

### Scenarij 4: Payments & Subscriptions
```javascript
['User', 'SubscriptionPlan', 'Payment', 'Invoice']
```

### Scenarij 5: KYC & Admin
```javascript
['User', 'ProviderProfile', 'KYCDocument', 'Review']
```

### Scenarij 6: Kompletan Flow
```javascript
null // sve tablice
```

---

## ⚡ Performance Tips

### 1. Koristi samo tablice koje trebaju
```javascript
// ❌ SPORO - sve tablice
await cp.create('test', null);

// ✅ BRZO - samo što trebam
await cp.create('test', ['User', 'Job']);
```

### 2. Reusuj checkpoint za više scenarija
```javascript
// ❌ SPORO - kreiraj checkpoint za svaki test
for (let i = 0; i < 10; i++) {
  const id = await cp.create(`test_${i}`, ['User']);
  // test
  await cp.rollback(id);
  await cp.delete(id);
}

// ✅ BRZO - kreiraj jednom, koristi više puta
const id = await cp.create('reusable', ['User']);
for (let i = 0; i < 10; i++) {
  // test
  await cp.rollback(id);
}
```

### 3. Cleanup na kraju
```javascript
// ❌ ZAGAĐENJE - checkpoint-i ostaju
await cp.delete(cpId1);
await cp.delete(cpId2);
// ... zabiću

// ✅ ČISTO - sve odjednom
await cp.cleanup();
```

---

## 🐛 Troubleshooting

### Problem: "Checkpoint nije pronađen"
```
❌ Error: Checkpoint abc123 nije pronađen
```

**Rješenje:**
- Provjeri je li checkpoint ID točan
- Provjeri je li API dostupan (http://localhost:3000/api)
- Vidi sve checkpoint-e: `await cp.list()`

### Problem: "Foreign key violation pri rollback-u"
```
❌ Error: Foreign key violation
```

**Rješenje:**
- Uključi sve povezane tablice u checkpoint
- Npr. ako trebaš Job, trebaj i User:
  ```javascript
  ['User', 'Job', 'JobImage']
  ```

### Problem: "Timeout pri kreiranju checkpointa"
```
❌ Timeout nakon 10s
```

**Rješenje:**
- Smanjи broj tablica (ne trebam sve?)
- Ili povećaj timeout u konfigu
- Provjeri veličinu baze

---

## 🎯 Best Practices

### ✅ DO:
- ✓ Kreiraj checkpoint PRE testa
- ✓ Rollback NAKON testa (u finally bloku!)
- ✓ Koristi specifične tablice
- ✓ Logiraj checkpoint ID-eve
- ✓ Cleanup na kraju sesije

### ❌ DON'T:
- ✗ Ne čekaj manual rollback-u
- ✗ Nemoj koristiti checkpoint-e između odjeljenih test sesija
- ✗ Ne kreiraj checkpoint-e za svaki test ako možeš reusati
- ✗ Ne zaboravi cleanup!

---

## 🔗 Vide Također

- [CHECKPOINT-ROLLBACK-USAGE.md](../backend/CHECKPOINT-ROLLBACK-USAGE.md) - Backend dokumentacija
- [checkpoint-helper.js](./helpers/checkpoint-helper.js) - Izvorni kod
- [checkpoint-example.spec.js](./e2e/checkpoint-example.spec.js) - Primjer testova

---

## 💬 FAQ

**P: Koji je minimalni checkpoint?**  
O: Samo `['User']` - osnovni snapshot baze

**P: Mogu li koristiti checkpoint-e s lokalnom bazom?**  
O: DA! Trebao bi API endpoint (`POST /api/testing/checkpoint/create`)

**P: Može li se checkpoint koristiti izvan test-a?**  
O: DA! Koristi REST API direktno:
```bash
curl -X POST http://localhost:3000/api/testing/checkpoint/create \
  -d '{"name":"manual","tables":["User"]}'
```

**P: Koliko checkpoint-a mogu imati?**  
O: Koliko memorije! Obriši stare nakon što su gotovi.

**P: Možeš li koristiti checkpoint-e u produkciji?**  
O: ❌ NE! Samo za testiranje. Kreiraj poseban test API user.

---

## 🚀 Sljedeći Koraci

1. **Provjeri Admin Panel**: `https://www.uslugar.eu/admin/testing#test-data`
2. **Kreiraj prvi checkpoint** s UI-jem
3. **Koristi ga u testu** s `CheckpointHelper`
4. **Rollback nakon testa** - gotovo!

Happy testing! 🎉

