<#
  Oriphiel: tri social videa (TikTok 9:16, YouTube 16:9, Facebook 4:5) iz istih asseta.
  Očekivane datoteke u ManifestDir:
    {ManifestBaseName}-tiktok.json, -youtube.json, -facebook.json

  Isti renderer kao Build-UslugarPromoFromManifest (titlovi, letterbox, itd.).

  Primjer:
    .\Run-OriphielPromoVideos.ps1
    .\Run-OriphielPromoVideos.ps1 -InstrumentalPath "D:\moja-podloga.mp3"
#>
param(
  [string] $AssetsDir = "C:\ORIPHIEL\output\oriphiel-ad-assets",
  [string] $OutDir = "C:\ORIPHIEL\output",
  [string] $ManifestDir = "C:\ORIPHIEL",
  [string] $ManifestBaseName = "social-story-oriphiel-ad",
  [string] $OutFilePrefix = "oriphiel_ad",
  [string] $InstrumentalPath = ""
)

$ErrorActionPreference = "Stop"
$Scripts = Split-Path -Parent $MyInvocation.MyCommand.Path
$inst = $InstrumentalPath
if ([string]::IsNullOrWhiteSpace($inst)) {
  $inst = Join-Path $Scripts "generated-audio\uslugar-instrumental.mp3"
}
if (-not (Test-Path $inst)) {
  throw "Nema glazbe: $inst (generiraj MP3 ili zadaj -InstrumentalPath)"
}

& (Join-Path $Scripts "Run-Generate-All-Promo-Videos.ps1") `
  -AssetsDir $AssetsDir `
  -OutDir $OutDir `
  -ManifestDir $ManifestDir `
  -ManifestBaseName $ManifestBaseName `
  -OutFilePrefix $OutFilePrefix `
  -InstrumentalPath $inst `
  -SkipPrepareConcats
