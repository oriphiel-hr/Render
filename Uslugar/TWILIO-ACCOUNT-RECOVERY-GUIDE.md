# 🔒 Twilio Account Recovery Guide - Restricted Account

## ⚠️ Situacija

Twilio je ograničio vaš račun zbog sumnjive/neovlaštene aktivnosti. To znači da:
- Račun je **OGANIČEN** (ne potpuno suspendiran)
- Možete pristupiti računu, ali ne možete koristiti sve servise
- **MORATE** proći kroz Account Recovery proces

## 🚨 Što je ograničeno:

- ❌ Kreiranje subaccounts
- ❌ Phone number lookup API
- ❌ Voice calls
- ❌ Slanje velikog volumena poruka
- ❌ Kupnja novih telefonskih brojeva
- ❌ 10DLC kampanje (suspendirane)

## ✅ Što još radi (vjerojatno):

- ✅ Pregled account informacija
- ✅ Account Recovery proces
- ✅ Možda osnovni SMS (ovisno o razini ograničenja)

---

## 📋 Korak-po-korak: Account Recovery

### 1. **Pristupite Account Recovery Flow**

**Link:** https://www.twilio.com/help/account-recovery

Ili:
1. Prijavite se na https://console.twilio.com
2. Trebali biste vidjeti poruku o ograničenom računu
3. Kliknite "Start account recovery flow"

### 2. **Što će Twilio tražiti:**

#### **Verifikacija identiteta:**
- Email adresa (koju koristite za Twilio)
- Broj telefona (vezan za račun)
- Osobni podaci (ime, adresa)
- **Mogu tražiti:** Photo ID, business verification documents

#### **Sigurnosne provjere:**
- Provjera neobičnih aktivnosti na računu
- Pregled API poziva i korištenja servisa
- Provjera payment metode
- Provjera recent changes na računu

#### **Securing account:**
- Promjena lozinke
- Verifikacija 2FA (Two-Factor Authentication)
- Pregled i uklanjanje neovlaštenih API keys
- Provjera webhook-a i callback URL-ova

### 3. **Što ćete trebati pripremiti:**

- ✅ Email adresa koju koristite za Twilio
- ✅ Broj telefona (ako je bio dodan)
- ✅ Payment information (kartica koja se koristi)
- ✅ Business information (ako je business account)
- ✅ Photo ID (u slučaju da Twilio traži)
- ✅ Evidence o legitimnom korištenju Twilio servisa

---

## 🔍 Što proći prije Recovery procesa

### 1. **Provjerite Account Activity**

1. Login na https://console.twilio.com
2. Idite na **Monitor → Logs → Activity Log**
3. Pregledajte sve recentne aktivnosti:
   - API pozive
   - SMS poruke
   - Phone number purchases
   - Account changes

4. **Tražite neobične aktivnosti:**
   - API pozivi s nepoznatih IP adresa
   - SMS poruke koje niste slali
   - Phone numbers koje niste kupili
   - Promjene credentials ili settings

### 2. **Provjerite API Keys**

1. **Console → Account → API Keys & Tokens**
2. Pregledajte sve API keys
3. **Delete sve keys koje niste kreirali ili ne koristite**
4. Za keys koje koristite:
   - Note gdje ih koristite (application, environment)
   - Ako sumnjate da je neki kompromitiran, delete i kreiraj novi

### 3. **Provjerite Webhooks & Callbacks**

1. **Console → Phone Numbers → Manage → Active numbers**
2. Provjerite sve webhook URL-ove
3. **Uklonite ili ažurirajte** sve sumnjive URL-ove

### 4. **Provjerite Usage & Billing**

1. **Console → Usage**
2. Provjerite ima li neobičnih charges
3. Provjerite usage patterns - postoji li spike u korištenju?
4. Provjerite recent invoices

### 5. **Provjerite Security Settings**

1. **Console → Account → Security**
2. Provjerite je li 2FA enabled
3. Provjerite trusted IP addresses
4. Provjerite recent login locations

---

## 📝 Što napisati u Recovery procesu

### **Kada Twilio pita za objašnjenje:**

```
Account: Testiranje (AC[...] - use your actual Account SID)

Hello Twilio Trust and Compliance Team,

I received a notice that my account has been restricted due to suspicious activity. 
I would like to restore my account and secure it properly.

Use Case:
I use Twilio SMS services for my application (USLUGAR Platform) for:
- User phone number verification
- Transactional SMS notifications
- Two-factor authentication

Recent Activity Review:
I have reviewed my account activity logs and can confirm:
- [List legitimate activities you recognize]
- [Note any activities that you don't recognize - these may be the suspicious ones]

Security Measures I Will Implement:
1. Enable 2FA if not already enabled
2. Rotate all API keys after account recovery
3. Review and secure all webhook URLs
4. Monitor account activity regularly
5. Implement IP restrictions if possible

I understand the importance of account security and am committed to maintaining 
a secure account. Please help me restore access and secure my account.

Thank you,
[Your Name]
```

---

## 🔐 Nakon Account Recovery

### **Obavezno uradite:**

1. **Promijenite lozinku**
   - Koristite jaku, jedinstvenu lozinku
   - Ne koristite istu lozinku kao drugdje

2. **Omogućite 2FA** (Two-Factor Authentication)
   - Console → Account → Security → 2FA
   - Koristite authenticator app (Google Authenticator, Authy)

3. **Rotirajte API Keys**
   - Delete stare keys
   - Kreiraj nove keys
   - Ažuriraj u environment variables (Render.com, .env)

4. **Provjerite Payment Method**
   - Provjerite je li kartica ispravna
   - Provjerite billing limits

5. **Ažuriraj Environment Variables**
   ```bash
   # Na Render.com, ažuriraj:
   TEST_TWILIO_ACCOUNT_SID=AC[novi ako je promijenjen]
   TEST_TWILIO_AUTH_TOKEN=[novi auth token]
   ```

6. **Monitor Account Activity**
   - Provjeravajte Activity Logs redovito
   - Postavite alerts za neobične aktivnosti

7. **Review Code & Security**
   - Provjerite da credentials nisu hardcoded u kod
   - Provjerite da su svi API keys u environment variables
   - Provjerite .gitignore da ne commit-ate credentials

---

## ⚡ Hitno - Što ako ne mogu pristupiti Recovery Flow?

1. **Kontaktirajte Twilio Support direktno:**
   - Email: help@twilio.com
   - Subject: "URGENT: Account Recovery - Restricted Account AC[...]"

2. **Reference u emailu:**
   - Account SID: AC[...] - use your actual Account SID
   - Email koju koristite za Twilio
   - Screenshot poruke o ograničenom računu

3. **Budite jasni o urgentnosti:**
   - Objasnite da vam je potreban pristup za production/testing

---

## 🎯 Očekivani Timeline

- **Account Recovery Review:** 24-72 sata (obično)
- **Za urgentne slučajeve:** Može biti brže ako kontaktirate support direktno
- **Za kompleksne slučajeve:** Može potrajati tjedan dana

---

## 📞 Kontakt Informacije

**Twilio Support:**
- Web: https://support.twilio.com/
- Email: help@twilio.com
- Account Recovery: https://www.twilio.com/help/account-recovery

**Trust & Compliance Team:**
- Email (ako imate): trust@twilio.com (obično se ne koristi, ali možete probati)

---

## ⚠️ Važne napomene

1. **NE dijelite** Account SID ili Auth Token javno
2. **NE commit-ajte** credentials u Git
3. **PROVJERITE** da li je netko drugi imao pristup vašim credentials
4. **MONITORIRAJTE** account aktivnost redovito nakon recovery-a
5. **BACKUP** - razmislite o backup Twilio account-u za production

---

## ✅ Checklist za nakon Recovery-a

- [ ] Account Recovery proces završen
- [ ] Lozinka promijenjena
- [ ] 2FA enabled
- [ ] API Keys rotirane
- [ ] Environment variables ažurirane (Render.com)
- [ ] Activity logs pregledani
- [ ] Webhooks provjereni
- [ ] Payment method provjeren
- [ ] Security settings pregledani
- [ ] Monitoring postavljen
- [ ] Code reviewed za hardcoded credentials

---

**Sretno s Account Recovery procesom! 🔒**

