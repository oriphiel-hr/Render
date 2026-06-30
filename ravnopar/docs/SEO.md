# Ravnopar — SEO vodič

Tehnički SEO je ugrađen u frontend build. Ovo je checklist za organski promet.

## Što je već implementirano

- **Meta tagovi** po stranici (title, description, robots)
- **Open Graph + Twitter Card** za dijeljenje linkova
- **Canonical URL** + **hreflang** za 13 jezika (`?lang=de`, `?lang=pl`, …)
- **JSON-LD**: Organization, WebSite, WebApplication (početna), FAQPage (`/pomoc`)
- **`robots.txt`** — blokira `/app/`, `/auth`, `/admin`
- **`sitemap.xml`** — generira se pri buildu (10 javnih ruta × 13 jezika = 130 URL-ova)
- **Javne stranice**: `/`, `/planovi`, `/pomoc`, `/kako-radi-feed`, `/fer-izvjestaj`, `/doniraj`, `/kontakt`, `/pravila`, `/privatnost`, `/uvjeti`

## Env

| Key | Vrijednost |
|-----|------------|
| `VITE_SITE_URL` | `https://ravnopar.onrender.com` |

## Google Search Console (obavezno)

1. [search.google.com/search-console](https://search.google.com/search-console)
2. Dodaj property: `https://ravnopar.onrender.com`
3. Verifikacija: HTML tag ili DNS
4. **Sitemaps** → pošalji: `https://ravnopar.onrender.com/sitemap.xml`
5. **URL inspection** → zatraži indeksiranje početne i `/pomoc?lang=hr`

## Bing Webmaster Tools (opcionalno)

[bing.com/webmasters](https://www.bing.com/webmasters) — isti sitemap.

## Ograničenja (SPA)

Ravnopar je React SPA — Google renderira JavaScript, ali indeksiranje je sporije nego kod statičnog HTML-a. Za maksimalni SEO u budućnosti razmotri **prerender** ili **SSR** javnih stranica.

## Što još pomaže (ručno, besplatno)

1. **Lokaliziraj sadržaj** — ne samo UI, nego FAQ i landing copy po jeziku
2. **Blog / vodiči** — „ghosting”, „besplatno upoznavanje”, „fer feed”
3. **Backlinkovi** — mediji, forumi, Product Hunt
4. **Brzina** — Render static site je OK; prati Core Web Vitals u Search Console

## Korisni upiti za praćenje (primjeri)

- HR: fer upoznavanje, dating bez pretplate, ghosting upoznavanje
- DE: faires dating, dating ohne paywall
- PL: uczciwe randki, randki bez paywalla
- EN: fair dating app, no paywall dating

## Provjera nakon deploya

```bash
curl https://ravnopar.onrender.com/robots.txt
curl https://ravnopar.onrender.com/sitemap.xml
```

U pregledniku: View Source na `/pomoc?lang=de` — nakon učitavanja provjeri `<title>` i canonical u DevTools → Elements.
