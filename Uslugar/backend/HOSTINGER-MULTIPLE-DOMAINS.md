# 🔍 Kako Znati Na Koju Domenu Se DNS Zapis Odnosi (Više Domena)

## ✅ Odgovor: Provjeri Header i Breadcrumb Navigaciju

Kada imaš više domena u Hostinger Control Panel-u, **uvijek provjeri header i breadcrumb navigaciju** da vidiš koja domena je trenutno odabrana.

---

## 🔍 Kako Provjeriti Trenutnu Domenu

### **1. Provjeri Header (Gore na Stranici)**

**U Hostinger Control Panel-u, gore na stranici bi trebao vidjeti:**

```
Domain portfolio - uslugar.eu - DNS / Nameservers
```

**ILI:**

```
uslugar.eu - DNS / Nameservers
```

**ILI:**

```
Select domain: uslugar.eu
```

**Ovo pokazuje koja domena je trenutno odabrana!**

### **2. Provjeri Breadcrumb Navigaciju**

**Breadcrumb navigaciju (putanja) gore na stranici:**

```
Home > Domains > uslugar.eu > DNS / Nameservers
```

**ILI:**

```
Domains > uslugar.eu > DNS / Nameservers
```

**Ovo također pokazuje koja domena je odabrana!**

### **3. Provjeri Dropdown "Select domain"**

**Ako vidiš dropdown "Select domain" gore na stranici:**

```
Select domain ▼
  uslugar.eu  ← Ovo je trenutno odabrano
  druga-domena.com
  treca-domena.hr
```

**Klikni na dropdown da vidiš sve domene i koja je odabrana.**

---

## 📋 Kako Promijeniti Domenu

### **1. Korak 1: Klikni na "Select domain" Dropdown**

**Ako vidiš dropdown "Select domain" gore na stranici:**

1. **Klikni na dropdown** "Select domain"
2. **Odaberi domenu** koju želiš (npr. `uslugar.eu`)
3. **Stranica će se osvježiti** s DNS zapisima za tu domenu

### **2. Korak 2: ILI Idi na Domains Listu**

1. **Klikni "Domains"** u glavnom meniju (lijevo)
2. **Pronađi domenu** koju želiš (npr. `uslugar.eu`)
3. **Klikni na domenu** → Otvorit će se Domain Overview
4. **Klikni "DNS / Nameservers"** tab
5. **Sada si u DNS postavkama za tu domenu**

---

## 🎯 Primjer: Kako Vidjeti Koja Domena Je Odabrana

### **Scenario: Imaš 3 Domene**

```
1. uslugar.eu
2. druga-domena.com
3. treca-domena.hr
```

### **Kada Otvoriš DNS / Nameservers:**

**Provjeri header:**
```
Domain portfolio - uslugar.eu - DNS / Nameservers
                    ^^^^^^^^^
                    Ovo je trenutno odabrana domena!
```

**Provjeri breadcrumb:**
```
Home > Domains > uslugar.eu > DNS / Nameservers
                          ^^^^^^^^^
                          Ovo je trenutno odabrana domena!
```

**Provjeri dropdown:**
```
Select domain: uslugar.eu ▼
              ^^^^^^^^^
              Ovo je trenutno odabrana domena!
```

---

## 📋 Checklist: Provjeri Prije Dodavanja DNS Zapisa

**Prije nego što dodaš ili urediš DNS zapis:**

- [ ] **Provjeri header** - Koja domena je prikazana?
- [ ] **Provjeri breadcrumb** - Koja domena je u putanji?
- [ ] **Provjeri dropdown** - Koja domena je odabrana?
- [ ] **Provjeri da DNS zapisi odgovaraju** toj domeni

**Ako nisi siguran:**
- [ ] **Klikni "Domains"** u glavnom meniju
- [ ] **Pronađi domenu** koju želiš
- [ ] **Klikni na domenu** → Otvorit će se Domain Overview
- [ ] **Klikni "DNS / Nameservers"** tab
- [ ] **Sada si siguran** da si u DNS postavkama za tu domenu

---

## 🔍 Kako Provjeriti Da Li Si Na Pravoj Domeni

### **1. Provjeri Postojeće DNS Zapis**

**Ako si na pravoj domeni (`uslugar.eu`), trebao bi vidjeti:**

```
Type    Name    Content
----    ----    -------
ALIAS   api     api.uslugar.eu.cdn.hstgr.net  ← Ovo je za uslugar.eu!
ALIAS   @       uslugar.eu.cdn.hstgr.net      ← Ovo je za uslugar.eu!
CNAME   www     www.uslugar.eu.cdn.hstgr.net  ← Ovo je za uslugar.eu!
```

**Ako vidiš druge domene u Content polju, možda si na krivoj domeni!**

### **2. Provjeri URL u Browser-u**

**URL u browser-u bi trebao biti:**

```
https://hpanel.hostinger.com/domains/uslugar.eu/dns
```

**ILI:**

```
https://hpanel.hostinger.com/domains/[domain-id]/dns
```

**Provjeri da URL sadrži `uslugar.eu`!**

---

## 🆘 Troubleshooting

### **Problem: Ne Znam Na Koju Domenu Se Odnosi DNS Zapis**

**Rješenje:**
1. ✅ **Provjeri header** - Koja domena je prikazana?
2. ✅ **Provjeri breadcrumb** - Koja domena je u putanji?
3. ✅ **Provjeri dropdown** - Koja domena je odabrana?
4. ✅ **Provjeri URL** - Koja domena je u URL-u?
5. ✅ **Provjeri postojeće DNS zapise** - Odgovaraju li toj domeni?

### **Problem: DNS Zapis Se Ne Odnosi Na Pravu Domenu**

**Uzrok:** Možda si na krivoj domeni u DNS postavkama

**Rješenje:**
1. ✅ **Klikni "Domains"** u glavnom meniju
2. ✅ **Pronađi pravu domenu** (npr. `uslugar.eu`)
3. ✅ **Klikni na domenu** → Domain Overview
4. ✅ **Klikni "DNS / Nameservers"** tab
5. ✅ **Sada si na pravoj domeni!**

### **Problem: Ne Vidim "Select domain" Dropdown**

**Rješenje:**
1. ✅ **Provjeri header** - Domena bi trebala biti prikazana
2. ✅ **Provjeri breadcrumb** - Domena bi trebala biti u putanji
3. ✅ **Klikni "Domains"** u glavnom meniju da vidiš sve domene
4. ✅ **Klikni na domenu** koju želiš

---

## 📝 Primjer: Navigacija Između Domena

### **Scenario: Imaš 3 Domene**

```
1. uslugar.eu
2. druga-domena.com
3. treca-domena.hr
```

### **Koraci da Otvoriš DNS za `uslugar.eu`:**

1. **Hostinger Control Panel** → **Domains** (glavni meni)
2. **Pronađi** `uslugar.eu` u listi domena
3. **Klikni na** `uslugar.eu`
4. **Domain Overview** se otvara
5. **Klikni "DNS / Nameservers"** tab
6. **Sada si u DNS postavkama za `uslugar.eu`**

### **Kako Provjeriti Da Si Na Pravoj Domeni:**

**Provjeri header:**
```
Domain portfolio - uslugar.eu - DNS / Nameservers
                    ^^^^^^^^^
                    ✅ Ovo je prava domena!
```

**Provjeri postojeće DNS zapise:**
```
ALIAS   api     api.uslugar.eu.cdn.hstgr.net
                ^^^^^^^^^^^^
                ✅ Sadrži "uslugar.eu" - prava domena!
```

---

## ✅ Konačni Odgovor

**Kako znati na koju domenu se DNS zapis odnosi?**

**Provjeri:**
1. ✅ **Header** - Koja domena je prikazana gore na stranici?
2. ✅ **Breadcrumb** - Koja domena je u putanji?
3. ✅ **Dropdown** - Koja domena je odabrana u "Select domain"?
4. ✅ **URL** - Koja domena je u browser URL-u?
5. ✅ **Postojeći DNS zapisi** - Odgovaraju li toj domeni?

**Ako nisi siguran:**
- ✅ **Klikni "Domains"** u glavnom meniju
- ✅ **Pronađi domenu** koju želiš
- ✅ **Klikni na domenu** → Domain Overview
- ✅ **Klikni "DNS / Nameservers"** tab
- ✅ **Sada si siguran** da si na pravoj domeni!

---

## 🎯 Sažetak

**Kada imaš više domena:**

1. ✅ **Uvijek provjeri header/breadcrumb** prije dodavanja DNS zapisa
2. ✅ **Koristi "Domains" meni** da navigiraš između domena
3. ✅ **Provjeri postojeće DNS zapise** da potvrdiš da si na pravoj domeni
4. ✅ **URL u browser-u** također pokazuje koja domena je odabrana

**Hostinger uvijek prikazuje koja domena je odabrana** - samo trebaš provjeriti header, breadcrumb ili dropdown!

