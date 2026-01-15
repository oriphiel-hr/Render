# 🎯 SERVER_DIR - Final Guide

## 📋 Situacija

**Tvoj URL pattern:** `.../files/` (bez `public_html/`)

**To znači:**
- FTP root je na `/files/` nivou
- Fajlovi trebaju biti u `/files/public_html/`
- Trebamo dodati `public_html/` u putanju

---

## ✅ Rješenje

### **Postavi GitHub Secret:**

1. **GitHub → Settings → Secrets and variables → Actions**
2. **Pronađi ili kreiraj `HOSTINGER_SERVER_DIR` secret**
3. **Postavi vrijednost:** `public_html/`
4. **Spremi**

---

## 🔍 Zašto `public_html/`?

**Hostinger FTP struktura:**
```
/files/                    ← FTP root (gdje si nakon login-a)
  └── public_html/        ← Ovdje trebaju biti fajlovi
      └── (fajlovi)
```

**Ako koristiš `/`:**
- Uploaduje se u `/files/` (root) ❌
- URL: `.../files/` (bez `public_html/`) ❌

**Ako koristiš `public_html/`:**
- Uploaduje se u `/files/public_html/` ✅
- URL: `.../files/public_html/` ✅

---

## ⚠️ Ako Dobiješ Duplikat

**Ako dobiješ `.../files/public_html/public_html/`:**

To znači da je FTP root već u `public_html/`, pa:
1. **Promijeni secret na:** `/`
2. **Pokreni workflow ponovno**

---

## 📋 Checklist

- [ ] Postavi `HOSTINGER_SERVER_DIR` secret na `public_html/`
- [ ] Commit i push workflow fajla
- [ ] Pokreni workflow
- [ ] Provjeri URL: trebao bi biti `.../files/public_html/`
- [ ] Ako dobiješ duplikat, promijeni secret na `/`

---

## ✅ Očekivani Rezultat

**Nakon ispravne konfiguracije:**
- Secret: `HOSTINGER_SERVER_DIR` = `public_html/`
- URL: `https://srv699-files.hstgr.io/ca90c38d09d457bc/files/public_html/`
- Fajlovi su u `public_html/` direktoriju ✅

---

**Gotovo!** 🎯

