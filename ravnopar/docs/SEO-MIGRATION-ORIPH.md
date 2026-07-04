# Migracija SEO: ravnopar.onrender.com → ravnopar.oriph.io

Cilj: zadržati Google indeks i poziciju za upit „ravnopar”, prebaciti canonical na novi domen.

## Zašto Google još pokazuje onrender.com

Google je indeksirao **stari URL** (`https://ravnopar.onrender.com/`). Dok oba hosta serviraju isti sadržaj bez **301 preusmjeravanja**, Google drži stari domen kao primarni.

---

## Koraci (redoslijed je bitan)

### 1. Render — 301 s onrender.com na oriph.io

**Dashboard → ravnopar (static site) → Settings → Custom Domains**

- `ravnopar.oriph.io` mora biti dodan i **Verified**
- Uključi **„Redirect ravnopar.onrender.com to your custom domain”** (ili slična opcija)

Provjera:

```bash
curl -I https://ravnopar.onrender.com/
curl -I https://ravnopar.onrender.com/hr
```

Očekivano: `HTTP/2 301` i `Location: https://ravnopar.oriph.io/...`

Bez 301 Google **ne prenosi** ranking automatski.

### 2. Env varijable + redeploy

| Servis | Key | Vrijednost |
|--------|-----|------------|
| **ravnopar** (frontend) | `VITE_SITE_URL` | `https://ravnopar.oriph.io` |
| **ravnopar-backend** | `FRONTEND_BASE_URL` | `https://ravnopar.oriph.io` |
| **ravnopar-backend** | `CORS_ALLOWED_ORIGINS` | `https://ravnopar.onrender.com` |

Redeploy **frontenda** (build generira sitemap + canonical s novim domenom).

Provjera nakon deploya:

```bash
curl https://ravnopar.oriph.io/robots.txt
curl https://ravnopar.oriph.io/sitemap.xml | head
```

Sitemap URL-ovi moraju biti `https://ravnopar.oriph.io/hr`, ne `onrender.com`.

View Source na `https://ravnopar.oriph.io/hr` → `<link rel="canonical" href="https://ravnopar.oriph.io/hr">`.

### 3. Google Search Console — novi property

1. [search.google.com/search-console](https://search.google.com/search-console)
2. **Add property** → `https://ravnopar.oriph.io` (ili **Domain** `oriph.io` ako imaš DNS pristup)
3. Verificiraj (DNS TXT preporučeno za Domain property)
4. **Sitemaps** → pošalji: `https://ravnopar.oriph.io/sitemap.xml`
5. **URL inspection** → zatraži indeksiranje:
   - `https://ravnopar.oriph.io/hr`
   - `https://ravnopar.oriph.io/`

**Stari property** (`ravnopar.onrender.com`) **ne briši** — prati preusmjeravanja 3–6 mjeseci.

### 4. Plausible

U Plausible site settings dodaj **`ravnopar.oriph.io`** kao primarni domen (onrender može ostati).

### 5. Što očekivati

| Faza | Trajanje |
|------|----------|
| 301 + novi canonical vidljivi | odmah nakon deploya |
| Google ponovno indeksira oriph.io | nekoliko dana – 2 tjedna |
| SERP prelazi s onrender na oriph.io | 2–6 tjedana |
| Stari onrender URL nestaje iz pretrage | kad Google obradi 301 |

Snippet (naslov/opis) ažurira se kad Google ponovno crawla — već imamo hrvatski naslov u kodu.

---

## Checklist

- [ ] 301 s `ravnopar.onrender.com/*` → `ravnopar.oriph.io/*`
- [ ] `VITE_SITE_URL=https://ravnopar.oriph.io` + frontend redeploy
- [ ] `sitemap.xml` i `robots.txt` na oriph.io pokazuju novi domen
- [ ] GSC property za `ravnopar.oriph.io` + sitemap poslan
- [ ] Zatraženo indeksiranje `/` i `/hr`
- [ ] Stari GSC property ostaje aktivan za praćenje

---

## Česte greške

| Greška | Posljedica |
|--------|------------|
| Oba URL-a bez 301, oba indeksirana | Duplikat sadržaj, ranking se dijeli |
| Promjena SITE_URL bez redeploya | Sitemap/canonical ostaju na starom domenu |
| Brisanje starog GSC propertyja | Gubiš povijest i uvid u migraciju |
| Samo promjena DNS-a bez 301 | Google ne zna da je to ista stranica |
