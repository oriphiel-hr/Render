# Reklama za Uslugar (tekst, ljudi, platforme, glazba)

Cilj: **pravi oglas** (poruka + ljudi + proizvod), ne samo slideshow screenshotova aplikacije.

---

## 0) AI generirane slike u repou

U `frontend/public/promo-ai/` nalaze se **četiri AI vizuala** (klijent s mobitelom, kuhinja, pružatelj s tabletom, tim u uredu) + `promo-manifest.json` s hrvatskim tekstom. To **nisu** stvarni korisnici niti snimak pravog Uslugar UI-a (ekrani su zamućeni / generički).

Gotov TikTok 9:16 video možeš ponovno složiti skriptama iz `README.txt` u tom folderu; izlaz je u `promo-ai/out/` (mapa je u `.gitignore`).

---

## 1) Što platforme očekuju (kratko, nije pravni savjet)

- **Istinitost**: ne tvrditi ono što aplikacija ne radi; ako je UI simulacija/demonstracija, to mora biti jasno u kreativu ili opisu oglasa gdje je to potrebno.
- **Bez lažnih dojmova**: ne predstavljati stock fotografiju kao stvarnog korisnika s imenom ako nije.
- **Glazba u oglasima**: za **plaćene** kampanje na Meta / TikTok / YouTube koristi izvore koji **eksplicitno dopuštaju commercial use** u oglasima (Creative Center, Sound Collection, pretplatnička biblioteka). Sintetička FFmpeg podloga iz repoa nema tuđe autorsko djelo, ali kvaliteta je ograničena.
- **Pristupačnost**: titlovi / tekst na videu pomažu i skladno su s dobrom praksom.

Detalje uvijek provjeri u **trenutnim pravilima** svake platforme i u **uvjetima licence** za svaku sliku i svaku traku.

---

## 2) Realistične slike „ljudi + Uslugar”

Aplikacija sama ne generira stock ljude. Najčešći ispravan put:

| Izvor | Napomena |
|--------|-----------|
| **Vlastita fotografija** / snimanje s korisnicima (**model release**) | Najbolje za povjerenje. |
| **Stock** (npr. Pexels, Unsplash, pretplatničke biblioteke) | Provjeri **komercijalnu dozvolu** i **zabranu za oglase** ako postoji. |
| **AI generirane slike** | Provjeri **uvjete alata** (komercijala, oglasi) i izbjegavaj „previše savršene” lažne portrete bez oznake ako platforma to traži. |

**Što tražiti u kadru (primjeri ideja, ne URL-ovi):**

- klijent: telefon ili laptop, **čitljiv ekran zamućen** ili generički UI ako nema dozvole za snimak stvarnog Uslugar UI-a u oglasu;
- pružatelj: tablet u radionici, pozitivan radni kontekst;
- tim: ured, zajednički pregled (opet: UI samo ako imaš pravo).

Slike spremi u jedan folder (npr. `D:\promo\assets\`) i u manifestu navedi **samo naziv datoteke**.

---

## 3) Struktura poruke (korisnici vs pružatelji)

- **Korisnici**: problem (vrijeme, kaos) → rješenje (jedan upit, više ponuda) → poziv (uslugar.eu).
- **Pružatelji**: bol (prazni razgovori) → rješenje (konkretni upiti, leadovi) → poziv.

Drži **jednu glavnu rečenicu po kadru** (naslov), drugi red kao pojedinjenje (subtitle).

---

## 4) Tehnički: video iz manifesta + glazba

1. Kopiraj `backend/scripts/promo-manifest.example.json` → svoj `promo-manifest.json`.
2. Zamijeni `image` nazive stvarnim datotekama u `AssetsDir`.
3. Generiraj podlogu **bez vibracije** (harmonijski slojevi):

```powershell
cd backend\scripts
.\Generate-UslugarAmbientMusic.ps1 -OutFile ".\generated-audio\uslugar-bed-promo.mp3" -DurationSec 90 -Mood warm
```

4. Složi video (primjer TikTok 9:16):

```powershell
.\Build-UslugarPromoFromManifest.ps1 -AssetsDir "D:\promo\assets" -ManifestFile "D:\promo\promo-manifest.json" `
  -Width 1080 -Height 1920 -OutFile "D:\promo\out\uslugar_promo_tiktok.mp4" `
  -MusicFile ".\generated-audio\uslugar-bed-promo.mp3"
```

Za YouTube 16:9: `-Width 1920 -Height 1080`. Za Facebook 4:5: `-Width 1080 -Height 1350`.

5. **Brand** (logo + traka): nakon toga pokreni `Add-UslugarBrandOverlay.ps1` s `-KeepInputAudio` na dobiveni `uslugar_promo_*.mp4`.

---

## 5) Glazba: „pravi instrument”

FFmpeg sinteza **nije** snimljen klavir — ali smo **uklonili tremolo** i dodali **alikvote** da zvuči mekše, kao statičan instrumentalni pad.

Za **pravu** instrumentalnu glazbu (gitara, klavir) uz profesionalni ton: **licencirana biblioteka** ili **snimka vlastitog instrumenta** + mux u FFmpeg.

---

## 6) Sljedeći korak u produkciji

- Dogovoriti **3–6 kadrova** (storyboard).
- Nabaviti **6 slika** (stock + vlastite) u istoj estetici.
- Napisati **finalni tekst** na hrvatskom.
- Jedan `promo-manifest.json` po formatu (TikTok može kraći tekst, veći font već skripta podešava).

Ako želiš, u repou se može dodati i **drugi primjer manifesta** isključivo za pružatelje ili isključivo za klijente.
