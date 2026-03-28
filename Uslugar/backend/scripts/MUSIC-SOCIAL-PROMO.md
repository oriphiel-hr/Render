# Glazba za Uslugar promo (Facebook / TikTok / YouTube)

Ovo je **smjernica za odabir**, ne gotovi audio fajlovi. Za objave i oglase uvijek provjeri **uvjete licence** za svaki kanal (posebno plaćeni oglasi).

---

## 1) Što tražiti u audiju (brand: marketplace, povjerenje, brzina)

| Publika | Karakter | Tempo / karakter | Izbjegavati |
|--------|----------|------------------|-------------|
| **Krajnji korisnici** (traže uslugu) | toplo, jasno, “lako je” | umjereno živahno, major tonalitet, čisti ritam | agresivni dubstep, tamni trailer |
| **Pružatelji** (majstori, obrtnici) | energija, sigurnost, posao | rock/pop “drive” blagi, 100–115 BPM | previše korporativni elevator |
| **Tvrtke / tim / direktor** | premium, kontrola, mir | ambient + blagi beat ili klavir/strings, manje “tiktok loop” | childish zvjezdice, komični efekti |

---

## 2) Po platformi (što “sjedi” u feedu)

### TikTok (kratko, rezovi, prve 2 s su presudne)

- **Zvuk**: jasna **kuka** u prvim 1–2 s (ritam ili melodični motiv), ne predugo uvod bez ritma.
- **Žanr**: “light corporate pop”, “indie upbeat”, “modern percussive” (bez teškog basa koji ruši glas ili voiceover).
- **Duljina loopa**: 15–25 s varijante; izbjegavaj 3-minute ambient ako režeš na 2 s kadrove.

### Facebook / Instagram (Reels i feed 4:5 / kvadrat)

- **Zvuk**: malo **topliji** i manje “agresivan” nego tipični TikTok trend; i dalje jasna struktura.
- **Žanr**: acoustic + light drums, modern corporate, “uplifting” bez prevelikog dropa.

### YouTube (45–60 s, više “priče”)

- **Zvuk**: **sporiji build**, manje ponavljanja istog 4-takt loopa; dozvoljen je blagi **dugmatic** (ambient → lagani beat).
- **Žanr**: cinematic lite, corporate ambient, soft piano + subtle pulse.

---

## 3) Gdje skinuti glazbu uz jasnu licencu (početak)

- **YouTube Studio → Audio Library**: pogodno za mnoge projekte; **za svaki track** provjeri oznaku *attribution* i **može li se koristiti izvan YouTubea** (nekad ograničeno — čitaj licencu na kartici trake).
- **Meta Sound Collection** (unutar Meta alata): namijenjeno sadržaju na Meta platformama — provjeri uvjete za **plaćene oglase**.
- **TikTok Commercial Music Library** / Creative Center: za **poslovne** objave i oglase koristi eksplicitno **commercial-safe** kategorije kad su dostupne.
- **Pretplatničke biblioteke** (Artlist, Epidemic Sound, Motion Array, itd.): najmanje grey zone za **paid ads** i **white-label** klijente — drži račun i PDF licence.

Ako klijent **forwarda** video dalje (WhatsApp, mail), i dalje vrijede uvjeti originalne licence — “besplatno na YouTubeu” ≠ automatski “slobodno u svim kanalima”.

---

## 4) Tehnički: ugradnja u tvoj FFmpeg pipeline

1. Spremi `.mp3` ili `.m4a` (npr. `promo-tiktok.mp3`).
2. Slideshow **s** zvukom:

```powershell
.\Build-UslugarSlideshow.ps1 -DocsDir "…\docs" -ConcatFile "tiktok_concat.txt" `
  -Width 1080 -Height 1920 -OutFile "output\slideshow_tiktok.mp4" `
  -MusicFile "…\promo-tiktok.mp3"
```

3. Brand overlay **zadrži** zvuk iz videa:

```powershell
.\Add-UslugarBrandOverlay.ps1 -InputVideo "…\slideshow_tiktok.mp4" -LogoPng "…\uslugar_logo_alpha.png" `
  -Profile TikTok -OutVideo "…\final_tiktok.mp4" -KeepInputAudio
```

4. Ako je glazba tiha u odnosu na govor/titlove, u FFmpeg-u naknadno možeš pojačati samo audio (primjer):

```text
-af "volume=1.4"
```

(Granična glasnoća ovisi o masteru — cilj je često oko **-14 LUFS** za društvene mreže, ali platforme i dalje normaliziraju.)

---

## 5) Tri gotova “briefa” za traženje traka u biblioteci

Kopiraj u search/filter:

1. **TikTok – korisnici**: `upbeat`, `positive`, `acoustic light`, `percussion light`, kratka dionica (do ~30 s)  
2. **Facebook – B2B / tim**: `uplifting corporate`, `warm`, `motivational light`, bez heavy bass  
3. **YouTube – explainer**: `ambient corporate`, `cinematic soft`, `piano minimal`, slow build  

---

## 6) Napomena o “složiti glazbu”

Automatski **generirana** glazba ili nasumični download s interneta bez licence nisu prikladni za ozbiljne klijente. Najsigurniji put za **paid social** i **reklamne** kampanje: pretplatnička biblioteka s **explicit commercial** licencom ili interni pravni odjel / agencija.

Ako želiš sljedeći korak u repou: mogu dodati **parametre u skripte** (npr. `-AudioVolume`, `-Loudnorm`) kad odabereš konkretne datoteke.

---

## 7) Originalna “podloga” bez tuđih uzoraka (ograničenje kvalitete)

Za **pravu reklamu** s ljudima, tekstom i stock fotografijama vidi `REKLAMA-USLUGAR.md` i skriptu `Build-UslugarPromoFromManifest.ps1`. Generirana podloga **nema tremolo** (nema “vibracije”) — samo miran harmonijski sloj iz više sinusnih tonova + alikvota.

---

## 8) Originalna “podloga” — tehnički detalj (slideshow stariji workflow)

Skripta `Generate-UslugarAmbientMusic.ps1` generira **samo sintezu** (bas + tri tona + tihi alikvoti, **bez tremola**, fade) — **nema sample biblioteka**. To je i dalje jednostavan “pad”, ne snimljen instrument.

Primjer (tri platforme):

```powershell
cd backend\scripts
.\Generate-UslugarAmbientMusic.ps1 -OutFile ".\generated-audio\uslugar-bed-youtube.mp3" -DurationSec 55 -Mood calm
.\Generate-UslugarAmbientMusic.ps1 -OutFile ".\generated-audio\uslugar-bed-tiktok.mp3" -DurationSec 25 -Mood bright
.\Generate-UslugarAmbientMusic.ps1 -OutFile ".\generated-audio\uslugar-bed-facebook.mp3" -DurationSec 40 -Mood warm
```

**Facebook (1080×1350, 4:5)** — slideshow s istom podlogom:

```powershell
.\Build-UslugarSlideshow.ps1 -DocsDir "…\docs" -ConcatFile "facebook_concat.txt" `
  -Width 1080 -Height 1350 -OutFile "output\slideshow_facebook.mp4" `
  -MusicFile ".\generated-audio\uslugar-bed-facebook.mp3"
```

Zatim `Add-UslugarBrandOverlay.ps1` s `-Profile Facebook` i `-KeepInputAudio` (ili `-MusicFile` ako brand radiš iz videa bez zvuka).

Mapa `generated-audio/` je u `.gitignore` (generiraj lokalno).
