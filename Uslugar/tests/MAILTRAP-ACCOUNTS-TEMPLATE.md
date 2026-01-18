# Mailtrap.io Test Računi - Template

Ovo je template za Mailtrap.io račune koje treba kreirati za testiranje.

## Preporučena Struktura Računa

### 1. Glavni Mailtrap Račun

**Email:** `uslugar-tests@yourdomain.com` (ili tvoj email)  
**Password:** `[GENERATE_STRONG_PASSWORD]`  
**API Key:** `[GENERATE_FROM_MAILTRAP]` (Settings → API Tokens)

### 2. Inbox-e za Grupe Korisnika

Kreiraj sljedeće inbox-e u Mailtrap-u:

#### Clients Inbox
- **Naziv:** "Uslugar - Test Clients"
- **Inbox ID:** `[ID_IZ_MAILTRAP]` (npr. `12345`)
- **Email adrese koje koriste ovaj inbox:**
  - `test.client@mailtrap.io`
  - `test.client1@mailtrap.io`
  - `test.client2@mailtrap.io`
  - `test.client3@mailtrap.io`
  - `test.client4@mailtrap.io`
  - `test.client5@mailtrap.io`

#### Providers Inbox
- **Naziv:** "Uslugar - Test Providers"
- **Inbox ID:** `[ID_IZ_MAILTRAP]` (npr. `12346`)
- **Email adrese koje koriste ovaj inbox:**
  - `test.provider@mailtrap.io`
  - `test.provider1@mailtrap.io`
  - `test.provider2@mailtrap.io`
  - `test.provider3@mailtrap.io`
  - `test.provider4@mailtrap.io`
  - `test.provider5@mailtrap.io`

#### Provider Company Inbox
- **Naziv:** "Uslugar - Test Provider Companies"
- **Inbox ID:** `[ID_IZ_MAILTRAP]` (npr. `12347`)
- **Email adrese koje koriste ovaj inbox:**
  - `test.company@mailtrap.io`
  - `test.company1@mailtrap.io`

#### Global/Default Inbox
- **Naziv:** "Uslugar - Default/Global"
- **Inbox ID:** `[ID_IZ_MAILTRAP]` (npr. `0` ili default inbox ID)
- **Koristi se:** Za sve ostale emailove ili kao fallback

## Koraci za Kreiranje

### Korak 1: Registracija/Kreiranje Računa

1. Otvori https://mailtrap.io
2. Klikni "Sign Up" (ili "Login" ako već imaš račun)
3. Unesi:
   - Email: `uslugar-tests@yourdomain.com`
   - Password: `[GENERATE_STRONG_PASSWORD]`
4. Potvrdi email adresu

### Korak 2: Kreiranje Projekta

1. U Mailtrap-u, klikni "Create Project"
2. Naziv: `Uslugar E2E Tests`
3. Opis: `Email testiranje za Uslugar platformu`

### Korak 3: Kreiranje Inbox-ova

Za svaki inbox:

1. Klikni "Add Inbox"
2. Unesi naziv (npr. "Uslugar - Test Clients")
3. Kopiraj **Inbox ID** iz URL-a (npr. `https://mailtrap.io/inboxes/12345/messages` → ID je `12345`)
4. Spremi ID za kasnije

### Korak 4: Generiranje API Key-a

1. U Mailtrap-u, otvori **Settings → API Tokens**
2. Klikni **"Generate New Token"**
3. Naziv: `Uslugar E2E Tests API`
4. Kopiraj token (npr. `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)
5. ⚠️ **VAŽNO:** Spremi token negdje sigurno - možeš ga vidjeti samo jednom!

### Korak 5: Konfiguriranje Email Adresa

Mailtrap automatski generira email adrese za svaki inbox:
- `clients@mailtrap.io` (za Clients inbox)
- `providers@mailtrap.io` (za Providers inbox)
- `company@mailtrap.io` (za Company inbox)

Ili možeš koristiti custom email adrese (ako Mailtrap plan to podržava).

## Primjer Konfiguracije za test-data.json

```json
{
  "email": {
    "testService": {
      "type": "mailtrap",
      "apiKey": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
      "inboxId": "0",
      "baseUrl": "https://mailtrap.io",
      "description": "Mailtrap.io za E2E testiranje"
    }
  },
  "users": {
    "client": {
      "email": "test.client@uslugar.hr",
      "mailtrapEmail": "test.client@mailtrap.io",
      "emailConfig": {
        "inboxId": "12345"
      }
    },
    "client1": {
      "email": "test.client1@uslugar.hr",
      "mailtrapEmail": "test.client1@mailtrap.io",
      "emailConfig": {
        "inboxId": "12345"
      }
    },
    "provider": {
      "email": "test.provider@uslugar.hr",
      "mailtrapEmail": "test.provider@mailtrap.io",
      "emailConfig": {
        "inboxId": "12346"
      }
    },
    "provider1": {
      "email": "test.provider1@uslugar.hr",
      "mailtrapEmail": "test.provider1@mailtrap.io",
      "emailConfig": {
        "inboxId": "12346"
      }
    },
    "providerCompany": {
      "email": "test.company@uslugar.hr",
      "mailtrapEmail": "test.company@mailtrap.io",
      "emailConfig": {
        "inboxId": "12347"
      }
    }
  }
}
```

## Sigurnost

⚠️ **VAŽNO:**
- **NE DIJELI** API Key javno
- **NE COMMITAJ** API Key u Git (koristi `.gitignore`)
- **NE DIJELI** Mailtrap lozinku
- Spremi sve podatke na sigurnom mjestu (password manager)

## Backup

Preporučeno je kreirati backup:
1. Eksportiraj sve inbox ID-eve
2. Spremi API Key na sigurnom mjestu
3. Dokumentiraj sve email adrese i njihove inbox-e

## Troubleshooting

Ako ne radi:
1. Provjeri da je API Key ispravan (nema razmaka na početku/kraju)
2. Provjeri da su inbox ID-evi ispravni
3. Provjeri da aplikacija šalje emailove na prave adrese
4. Provjeri Mailtrap logs za greške

## Limiti (Free Plan)

Mailtrap Free plan omogućava:
- 1 projekt
- 2 inbox-a
- 500 emailova/mjesec
- 60 dana retention

Za više inbox-ova i emailova, trebaš upgrade plan.

