Ove slike generirao je AI (vizual za marketing). Na ekranima telefona/tableta namjerno je zamucen genericki UI — nije stvarni snimak aplikacije Uslugar.

Za oglase na Meta / TikTok / YouTube provjeri trenutna pravila o AI/sintetickom sadrzaju i obaveznoj oznaci ako platforma to trazi.

Video iz ovih slika (promo-manifest.json — samo ove 4 slike u folderu):
  cd backend\scripts
  .\Generate-UslugarAmbientMusic.ps1 -OutFile ".\generated-audio\bed.mp3" -DurationSec 60 -Mood warm
  .\Build-UslugarPromoFromManifest.ps1 -AssetsDir "..\..\frontend\public\promo-ai" -ManifestFile "promo-manifest.json" -Width 1080 -Height 1920 -OutFile "..\..\frontend\public\promo-ai\out\uslugar_promo_tiktok.mp4" -MusicFile ".\generated-audio\bed.mp3" -SkipBrandOverlay

  Za drustvene videoe s hrvatskim tekstom po kadru + zadnji kadar kontakt vidi
  social-story-*.json i Run-Generate-All-Promo-Videos.ps1 (docs mapa screenshotova).
