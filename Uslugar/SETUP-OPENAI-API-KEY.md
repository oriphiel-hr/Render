# 🔑 Kako dobiti i postaviti OPENAI_API_KEY

## 📋 Što je OPENAI_API_KEY?

`OPENAI_API_KEY` je API ključ za OpenAI servis koji se koristi za **AI automatsku moderaciju recenzija** u aplikaciji.

### Za što se koristi:

- **AI provjera sadržaja recenzija** - automatska detekcija neprikladnog sadržaja (hate speech, harassment, violence, spam, itd.)
- **Kategorizacija recenzija** - automatsko određivanje da li recenzija treba biti odobrena, odbijena ili čeka ljudsku moderaciju
- **Sprječavanje spam-a i neprikladnog sadržaja** - brža i točnija provjera nego osnovne fallback provjere

### Je li obavezno?

**NE, nije obavezno!** Aplikacija radi i bez njega, ali koristi osnovne fallback provjere:
- Provjera zabranjenih riječi
- Detekcija linkova, email-ova, telefona
- Osnovne spam provjere

**Ali s OpenAI API key-om dobivaš:**
- ✅ Bolju AI detekciju neprikladnog sadržaja
- ✅ Točniju kategorizaciju recenzija
- ✅ Automatsku provjeru hate speech, harassment, violence, itd.
- ✅ Veću pouzdanost u moderaciji

---

## 🚀 Kako dobiti OPENAI_API_KEY - Korak po korak

### 1. **Kreiraj OpenAI račun**

1. Idi na: https://platform.openai.com/
2. Klikni **"Sign up"** ili **"Log in"** ako već imaš račun
3. Ako se registriraš, verifikiraj email

### 2. **Dodaj Payment Method** (ako je potrebno)

1. U OpenAI Dashboard → **Billing** → **Payment methods**
2. Dodaj kreditnu karticu ili PayPal
3. **Napomena:** OpenAI ima besplatni credit za nove korisnike (oko $5), ali ćeš trebati payment method za daljnje korištenje

### 3. **Kreiraj API Key**

1. Idi na: https://platform.openai.com/api-keys
2. Klikni **"Create new secret key"**
3. Unesi naziv (npr. "USLUGAR Review Moderation")
4. **VAŽNO:** Kopiraj API key **ODMAH** - nećeš moći vidjeti ponovno!
5. Spremi ga na sigurno mjesto (npr. password manager)

### 4. **Format API Key-a**

API key izgleda ovako:
```
sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Napomena:** Počinje s `sk-proj-` ili `sk-`

---

## 🔧 Kako postaviti na Render.com

### Korak 1: Otvori Render Dashboard

1. Idi na: https://dashboard.render.com/
2. Prijavi se

### Korak 2: Otvori Backend Service

1. Klikni na tvoj **Backend Service** (npr. "uslugar-backend")
2. Idi na **Environment** tab

### Korak 3: Dodaj Environment Variable

1. Klikni **"Add Environment Variable"**
2. **Key:** `OPENAI_API_KEY`
3. **Value:** Tvoj OpenAI API key (npr. `sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
4. Klikni **"Save Changes"**

### Korak 4: Redeploy Backend

1. Render će automatski pokrenuti redeploy
2. Ili klikni **"Manual Deploy"** → **"Deploy latest commit"**
3. Pričekaj da se deploy završi (2-5 minuta)

---

## 🧪 Testiranje

### Provjeri da li API key radi:

1. **Provjeri backend logove na Render.com:**
   ```
   [REVIEW_MODERATION] OpenAI Moderation API initialized
   ```

2. **Provjeri da li vidiš upozorenje:**
   ```
   [REVIEW_MODERATION] OPENAI_API_KEY not set, using fallback moderation only
   ```
   - Ako vidiš ovo upozorenje, API key nije postavljen ili nije redeployed
   - Ako ne vidiš upozorenje, API key je ispravno postavljen! ✅

3. **Testiraj kroz API:**
   - Kreiraj test recenziju s neprikladnim sadržajem
   - Provjeri da li se automatski odbija ili stavlja na PENDING

---

## 💰 Troškovi

### OpenAI Moderation API cijene:

- **Moderation API:** Besplatno! (Free tier)
  - Moderacioni API je besplatan za sve korisnike
  - Nema ograničenja broja zahtjeva

### Dodatni OpenAI servisi (ako želiš koristiti u budućnosti):

- **GPT-4, GPT-3.5:** ~$0.002-0.06 po 1K tokens
- **Embeddings:** ~$0.0001 po 1K tokens

**Za Review Moderation koristi se samo Moderation API koji je besplatan!** ✅

---

## 🔒 Sigurnost

### Best Practices:

1. **NE commitaj API key u Git!**
   - Nikada ne dodaj API key u kod
   - Koristi environment variables

2. **Ne dijelite API key javno**
   - Drži ga u sigurnosti
   - Koristi password manager

3. **Rotiraj API key redovito**
   - Ako sumnjaš da je kompromitiran, kreiraj novi
   - Obriši stari API key u OpenAI Dashboard

4. **Ograniči API key dozvole** (ako je moguće)
   - U OpenAI Dashboard možeš ograničiti koje API-je key može koristiti

---

## 🐛 Troubleshooting

### Problem: "OPENAI_API_KEY not set"

**Rješenje:**
- Provjeri da li je environment variable postavljen na Render.com
- Provjeri da li je backend redeployed nakon dodavanja varijable
- Provjeri da li je naziv varijable točan: `OPENAI_API_KEY` (točno ovako, velika slova)

### Problem: "OpenAI API error"

**Mogući uzroci:**
1. **Invalid API key** - provjeri da li je API key točan
2. **API key expired** - kreiraj novi API key
3. **Rate limit** - premalo requesta (Moderation API ima visok limit)
4. **Network issue** - provjeri konekciju

**Rješenje:**
- Provjeri API key u OpenAI Dashboard
- Provjeri backend logove za detalje greške
- Aplikacija će koristiti fallback moderaciju ako OpenAI API ne radi

### Problem: Aplikacija i dalje koristi fallback

**Provjeri:**
1. Da li je `OPENAI_API_KEY` postavljen na Render.com ✅
2. Da li je backend redeployed nakon postavljanja ✅
3. Da li API key počinje s `sk-proj-` ili `sk-` ✅
4. Backend logove - traži `[REVIEW_MODERATION]` poruke

---

## 📚 Dodatne informacije

### OpenAI Dokumentacija:

- **Moderation API:** https://platform.openai.com/docs/guides/moderation
- **API Keys:** https://platform.openai.com/api-keys
- **Pricing:** https://openai.com/pricing

### Kako funkcionira u aplikaciji:

1. Korisnik kreira recenziju
2. Backend poziva `autoModerateReview()` funkciju
3. Funkcija pokušava koristiti OpenAI Moderation API
4. Ako API key nije postavljen ili API ne radi, koristi se fallback moderacija
5. Recenzija se kategorizira: APPROVED, PENDING, ili REJECTED

---

## ✅ Checklist

- [ ] Kreiran OpenAI račun
- [ ] Dodana payment method (ako je potrebno)
- [ ] Kreiran API key
- [ ] API key spremljen na sigurno mjesto
- [ ] Dodan `OPENAI_API_KEY` na Render.com
- [ ] Backend redeployed
- [ ] Provjereni backend logovi (nema upozorenja)
- [ ] Testirana moderacija recenzija

---

**Napomena:** Ako ne postaviš API key, aplikacija će i dalje raditi s osnovnom fallback moderacijom. Ali za bolju AI moderaciju, preporučujem da ga postaviš! 🚀

