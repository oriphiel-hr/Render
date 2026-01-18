# 🔧 Fix: CORS Origin Error

## Problem

```
Access to XMLHttpRequest at 'https://api.uslugar.eu/api/documentation' from origin 'https://uslugar.eu' 
has been blocked by CORS policy: The 'Access-Control-Allow-Origin' header has a value 
'https://www.uslugar.eu' that is not equal to the supplied origin.
```

**Uzrok:** Frontend je na `https://uslugar.eu` (bez www), ali backend dozvoljava samo `https://www.uslugar.eu` (s www).

---

## ✅ Rješenje - Automatska normalizacija (IMPLEMENTIRANO)

Backend sada **automatski dodaje www i non-www varijante** za sve origins u `CORS_ORIGINS` environment variable.

### Kako radi:

1. Ako postaviš `CORS_ORIGINS=https://www.uslugar.eu`
   - Backend automatski dodaje `https://uslugar.eu` (bez www)
   - Obe varijante su dozvoljene

2. Ako postaviš `CORS_ORIGINS=https://uslugar.eu`
   - Backend automatski dodaje `https://www.uslugar.eu` (s www)
   - Obe varijante su dozvoljene

---

## 🔧 Na Render.com - Provjeri Environment Variables

### Opcija 1: Samo jedna varijanta (automatski dodaje drugu)

Na Render.com → Backend Service → Environment → Provjeri:

```
CORS_ORIGINS=https://www.uslugar.eu,https://uslugar.oriph.io
```

Ili:

```
CORS_ORIGINS=https://uslugar.eu,https://uslugar.oriph.io
```

**Obe varijante su sada dozvoljene automatski!**

### Opcija 2: Eksplicitno obje varijante

Ako želiš biti eksplicitan, možeš dodati obje:

```
CORS_ORIGINS=https://uslugar.eu,https://www.uslugar.eu,https://uslugar.oriph.io
```

---

## 🧪 Testiranje

### Provjeri da CORS radi:

1. **S www:**
   ```bash
   curl -H "Origin: https://www.uslugar.eu" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS \
        https://api.uslugar.eu/api/documentation
   ```

2. **Bez www:**
   ```bash
   curl -H "Origin: https://uslugar.eu" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS \
        https://api.uslugar.eu/api/documentation
   ```

Oba bi trebala vratiti `Access-Control-Allow-Origin` header.

---

## 📋 Checklist

- [x] CORS middleware automatski dodaje www/non-www varijante
- [ ] Provjeri `CORS_ORIGINS` na Render.com
- [ ] Provjeri da su obje varijante dostupne (s i bez www)
- [ ] Testiraj API pozive s obje varijante

---

## 🐛 Ako i dalje ne radi

1. **Provjeri backend logove na Render.com:**
   ```
   [CORS] Allowed origins: [...]
   ```
   Trebao bi vidjeti obje varijante u logovima.

2. **Provjeri blocked origins:**
   ```
   [CORS] Blocked origin: https://uslugar.eu
   [CORS] Allowed origins: [...]
   ```
   Ako vidiš blocked origin, provjeri environment variable.

3. **Osveži stranicu:**
   - Hard refresh: Ctrl+F5 (Windows) ili Cmd+Shift+R (Mac)
   - Ili očisti cache browsera

4. **Provjeri da je backend redeployed:**
   - Render Dashboard → Backend Service → najnoviji deploy
   - Trebao bi biti nakon commit-a s CORS fix-om

---

**Napomena:** Nakon deploy-a na Render.com, obe varijante (s i bez www) će automatski raditi! 🚀

