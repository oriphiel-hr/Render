# ⚖️ Legal Status - Frontend Integracija

## ✅ Implementirano

### 1. **Custom Hook - useLegalStatuses**

**Fajl:** `src/hooks/useLegalStatuses.js`

Dohvaća pravne statuse iz API-ja:

```javascript
import { useLegalStatuses } from '../hooks/useLegalStatuses';

function MyComponent() {
  const { legalStatuses, loading, error } = useLegalStatuses();
  
  return (
    <select>
      {legalStatuses.map(status => (
        <option key={status.id} value={status.id}>
          {status.name} - {status.description}
        </option>
      ))}
    </select>
  );
}
```

**API Endpoint:** `GET https://uslugar.api.oriph.io/api/legal-statuses`

---

### 2. **Provider Registracija** ✅

**Fajl:** `src/pages/ProviderRegister.jsx`

**Izmjene:**
- ✅ Koristi `useLegalStatuses()` hook
- ✅ Dinamički dropdown za pravne statuse
- ✅ Conditional rendering za OIB i companyName
- ✅ Opcionalni legal status (Phase 1 - soft validation)

**UI Features:**
- Pravni status dropdown sa opisom
- OIB input (11 brojeva)
- Naziv firme/obrta input
- Prikazuje se samo ako odabere legal status

---

### 3. **User Registracija** ✅

**Fajl:** `src/pages/UserRegister.jsx`

**Izmjene:**
- ✅ Koristi `useLegalStatuses()` hook  
- ✅ Checkbox "Registriram se kao firma/obrt"
- ✅ Conditional rendering za legal status polja
- ✅ Dinamički legal statuses umjesto hardcoded

**UI Features:**
- Toggle za firmu/privatnu osobu
- Legal status dropdown (ako je firma)
- OIB i naziv firme (ako je firma)

---

### 4. **Postani Pružatelj Usluga** ✅ (NOVO!)

**Fajl:** `src/pages/UpgradeToProvider.jsx`

**Nova stranica za nadogradnju USER → PROVIDER**

**Features:**
- ✅ Auto-fill email-a (ako je login-ovan)
- ✅ Password potvrda
- ✅ **OBAVEZAN** pravni status (preparation za Phase 2)
- ✅ OIB input sa validacijom (11 brojeva)
- ✅ Naziv firme/obrta
- ✅ Success screen sa auto-redirect
- ✅ Info box sa pravnim objašnjenjem

**API:** `POST /api/auth/upgrade-to-provider`

```javascript
{
  email: 'user@example.com',
  password: 'password123',
  legalStatusId: 'cls2_sole_trader',
  taxId: '12345678901',
  companyName: 'Obrt Horvat'
}
```

---

### 5. **App.jsx Routing** ✅

**Fajl:** `src/App.jsx`

**Izmjene:**
- ✅ Import `UpgradeToProvider` komponente
- ✅ Dodan 'upgrade-to-provider' tab
- ✅ "Postani pružatelj" dugme (prikazuje se samo ako je login-ovan)
- ✅ Routing za `#upgrade-to-provider`

**Nova dugmad:**
```jsx
{token && (
  <button onClick={() => setTab('upgrade-to-provider')}>
    Postani pružatelj
  </button>
)}
```

---

## 🧪 Testiranje

### Test 1: Legal Statuses API

```javascript
// Otvori Console (F12)
fetch('https://uslugar.api.oriph.io/api/legal-statuses')
  .then(r => r.json())
  .then(console.log);
```

**Expected:**
```json
[
  {
    "id": "cls1_individual",
    "code": "INDIVIDUAL",
    "name": "Fizička osoba",
    "description": "...",
    "isActive": true
  },
  ...
]
```

### Test 2: Provider Registracija

1. Idi na https://uslugar.oriph.io
2. Klikni "Registracija providera"
3. Popuni formu
4. Odaberi legal status iz dropdowna
5. Unesi OIB i naziv firme
6. Klikni "Registriraj se"

**Expected:** Success screen + email verification

### Test 3: Upgrade to Provider

1. Registriraj se kao USER
2. Verifikuj email
3. Login
4. Klikni "Postani pružatelj" dugme
5. Popuni legal status, OIB, naziv firme
6. Unesi password za potvrdu
7. Klikni "Postani pružatelj usluga"

**Expected:** Success screen + auto-redirect + novi JWT token sa role=PROVIDER

---

## 📊 Komponente Struktura

```
frontend/src/
├── hooks/
│   └── useLegalStatuses.js         (Custom hook za API)
├── pages/
│   ├── UserRegister.jsx            (Ažurirano - dynamic legal statuses)
│   ├── ProviderRegister.jsx        (Ažurirano - dynamic legal statuses)
│   └── UpgradeToProvider.jsx       (NOVO - upgrade USER→PROVIDER)
└── App.jsx                          (Ažurirano - routing)
```

---

## 🚀 Deployment

### Build Frontend

```bash
cd uslugar/frontend

# Production build
VITE_API_URL=https://uslugar.api.oriph.io/api npm run build

# Development
npm run dev
```

### Deploy na FTP

```powershell
cd uslugar/frontend

# Deploy sa ispravnom putanjom
.\deploy-frontend-ftp-fixed.ps1
```

Fajlovi će biti upload-ovani na:
- **Remote:** `/domains/oriph.io/public_html/uslugar/`
- **URL:** https://uslugar.oriph.io

---

## 🎯 User Flow

### Scenario 1: Registracija Providera (Nova)
```
1. Klikni "Registracija providera"
2. Popuni osnovne podatke
3. Odaberi pravni status iz dropdowna ✅ (DYNAMIC)
4. Unesi OIB i naziv firme
5. Registriraj se
6. Verifikuj email
7. Login → može slati ponude
```

### Scenario 2: Registracija Usera → Upgrade
```
1. Klikni "Registracija korisnika"
2. Popuni podatke (bez pravnog statusa)
3. Registriraj se kao USER
4. Verifikuj email
5. Login
6. Klikni "Postani pružatelj" dugme ✅ (NOVO)
7. Popuni legal status, OIB, naziv firme
8. Potvrdi lozinku
9. Upgrade → može slati ponude I tražiti usluge
```

### Scenario 3: USER ostaje USER
```
1. Registriraj se kao USER
2. Ne klikćeš "Postani pružatelj"
3. Možeš samo tražiti usluge (objavljivati Job-ove)
4. Ne možeš slati ponude
```

---

## 💡 Phase 2 - Strict Validation

Kada budete spremni za obaveznu validaciju:

### Backend (jedna linija):

U `backend/src/routes/auth.js`, promjenite:

```javascript
// FROM (Phase 1 - soft):
if (role === 'PROVIDER' && legalStatusId) {
  // validate if provided
}

// TO (Phase 2 - strict):
if (role === 'PROVIDER') {
  if (!legalStatusId || !taxId || !companyName) {
    return res.status(400).json({ error: 'Required' });
  }
}
```

### Frontend:

Dodajte `required` atribut na inpute u `ProviderRegister.jsx`:

```jsx
<select name="legalStatusId" required>  // dodaj required
<input name="taxId" required>           // dodaj required
<input name="companyName" required>     // dodaj required
```

---

## ✅ Checklist - Kompletna Integracija

### Frontend:
- [x] ✅ Custom hook `useLegalStatuses`
- [x] ✅ Dynamic legal status dropdown u `ProviderRegister`
- [x] ✅ Dynamic legal status dropdown u `UserRegister`
- [x] ✅ Nova stranica `UpgradeToProvider`
- [x] ✅ Routing u `App.jsx`
- [x] ✅ "Postani pružatelj" dugme
- [ ] 🔄 Build + Deploy na FTP

### Backend:
- [x] ✅ `GET /api/legal-statuses` endpoint
- [x] ✅ Seed data (6 legal statuses)
- [x] ✅ Soft validation u `register`
- [x] ✅ Soft validation u `upgrade-to-provider`
- [x] ✅ Deploy na AWS

### Testing:
- [ ] 🔄 Test legal statuses API call
- [ ] 🔄 Test Provider registracija
- [ ] 🔄 Test User registracija
- [ ] 🔄 Test Upgrade to Provider

---

## 📝 API Reference

### GET /api/legal-statuses

**Response:**
```json
[
  {
    "id": "cls1_individual",
    "code": "INDIVIDUAL",
    "name": "Fizička osoba",
    "description": "Samostalna fizička osoba",
    "isActive": true,
    "createdAt": "2025-10-19T20:08:26.804Z"
  },
  {
    "id": "cls2_sole_trader",
    "code": "SOLE_TRADER",
    "name": "Obrtnik",
    "description": "Registrirani obrt",
    "isActive": true,
    "createdAt": "2025-10-19T20:08:26.804Z"
  },
  ...
]
```

### POST /api/auth/upgrade-to-provider

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "legalStatusId": "cls2_sole_trader",
  "taxId": "12345678901",
  "companyName": "Obrt Horvat"
}
```

**Response Success (200):**
```json
{
  "message": "Successfully upgraded to provider!",
  "token": "new-jwt-with-provider-role",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "role": "PROVIDER",
    "fullName": "User Name",
    "isVerified": true
  }
}
```

**Response Error (400):**
```json
{
  "error": "Pružatelj usluga mora imati pravni oblik",
  "message": "Za postati pružatelj...",
  "requiredFields": ["legalStatusId", "taxId", "companyName"]
}
```

---

**Datum:** 20. oktobar 2025  
**Status:** ✅ Frontend Integration Complete (Ready for Build & Deploy)


