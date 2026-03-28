<#
  Pipeline: (opcionalno) concat liste za ljude u docs\people\ -> glazba -> tri story videa (TikTok, YouTube, Facebook).
  Isti engine kao jedan poziv Build-UslugarPromoFromManifest (višeredni titlovi, UTF-8, itd.).

  Zadano (bez parametara): fiksni DocsRoot, manifesti u backend\scripts\social-story-*.json, izlaz docs\output\.

  Za druge projekte (npr. Oriphiel): -AssetsDir, -OutDir, -ManifestDir + -ManifestBaseName ili tri -Manifest* putanje,
  -OutFilePrefix oriphiel_ad -> oriphiel_ad_tiktok.mp4, …, -SkipPrepareConcats ako ne trebaš people concat.

  Zadano: ako nema uslugar-instrumental.mp3, skripta preuzima CC0 instrumental. Za sintetsku podlogu: -UseSyntheticBed.
  Za vlastiti MP3: generated-audio\uslugar-instrumental.mp3 ili -InstrumentalPath.
#>
param(
  [string] $AssetsDir = "",
  [string] $OutDir = "",
  [string] $ManifestTikTok = "",
  [string] $ManifestYouTube = "",
  [string] $ManifestFacebook = "",
  [string] $ManifestDir = "",
  [string] $ManifestBaseName = "",
  [string] $OutFilePrefix = "",
  [string] $InstrumentalPath = "",
  [switch] $UseSyntheticBed,
  [switch] $SkipPrepareConcats
)

$ErrorActionPreference = "Stop"
$Scripts = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = (Resolve-Path (Join-Path $Scripts "..\..")).Path
$defaultDocs = "C:\Users\vittv\Downloads\uslugar-screenshots-2026-03-24\docs"
$DocsRoot = if ($AssetsDir -ne "") { (Resolve-Path $AssetsDir).Path } else { $defaultDocs }
$Gen = Join-Path $Scripts "generated-audio"
if ($OutDir -ne "") {
  if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir -Force | Out-Null }
  $OutDir = (Resolve-Path $OutDir).Path
} else {
  $o = Join-Path $DocsRoot "output"
  if (-not (Test-Path $o)) { New-Item -ItemType Directory -Path $o -Force | Out-Null }
  $OutDir = (Resolve-Path $o).Path
}
if (-not (Test-Path $Gen)) { New-Item -ItemType Directory -Path $Gen -Force | Out-Null }

$fontStory = if (Test-Path "C:/Windows/Fonts/segoeui.ttf") { "C:/Windows/Fonts/segoeui.ttf" } else { "C:/Windows/Fonts/arial.ttf" }

if (-not $SkipPrepareConcats) {
  Write-Host "=== Spajanje concat lista (ljudi u docs\people) ===" -ForegroundColor Cyan
  & (Join-Path $Scripts "Prepare-UslugarSlideshowConcats.ps1") -DocsRoot $DocsRoot -RepoRoot $RepoRoot -ScriptsDir $Scripts
} else {
  Write-Host "=== Preskočeno: Prepare-UslugarSlideshowConcats (-SkipPrepareConcats) ===" -ForegroundColor DarkGray
}

$defaultInst = Join-Path $Gen "uslugar-instrumental.mp3"
$useInstrumental = $false
$instFile = $null
if ($InstrumentalPath -ne "" -and (Test-Path $InstrumentalPath)) {
  $instFile = (Resolve-Path $InstrumentalPath).Path
  $useInstrumental = $true
} elseif (Test-Path $defaultInst) {
  $instFile = (Resolve-Path $defaultInst).Path
  $useInstrumental = $true
} elseif (-not $UseSyntheticBed) {
  Write-Host "=== Preuzimanje CC0 instrumental (klavir - Bach Aria, Open Goldberg) ===" -ForegroundColor Cyan
  try {
    & (Join-Path $Scripts "Download-UslugarCC0Instrumental.ps1") -OutFile $defaultInst
  } catch {
    Write-Warning $_.Exception.Message
  }
  if (Test-Path $defaultInst) {
    $instFile = (Resolve-Path $defaultInst).Path
    $useInstrumental = $true
  }
}

if ($useInstrumental) {
  Write-Host "=== Glazba: instrumental (loop do kraja videa) ===" -ForegroundColor Cyan
  Write-Host $instFile
  $musTik = $instFile; $musYt = $instFile; $musFb = $instFile
} else {
  Write-Host "=== Sintetska podloga (sum) - za pravu glazbu makni -UseSyntheticBed ili stavi MP3 ===" -ForegroundColor Yellow
  Write-Host "=== Generiranje podloge (loop do kraja videa) ===" -ForegroundColor Cyan
  & (Join-Path $Scripts "Generate-UslugarAmbientMusic.ps1") -OutFile (Join-Path $Gen "uslugar-bed-tiktok.mp3") -DurationSec 55 -Mood bright
  & (Join-Path $Scripts "Generate-UslugarAmbientMusic.ps1") -OutFile (Join-Path $Gen "uslugar-bed-youtube.mp3") -DurationSec 95 -Mood calm
  & (Join-Path $Scripts "Generate-UslugarAmbientMusic.ps1") -OutFile (Join-Path $Gen "uslugar-bed-facebook.mp3") -DurationSec 70 -Mood warm
  $musTik = (Join-Path $Gen "uslugar-bed-tiktok.mp3")
  $musYt = (Join-Path $Gen "uslugar-bed-youtube.mp3")
  $musFb = (Join-Path $Gen "uslugar-bed-facebook.mp3")
}

$anyManifest = ($ManifestTikTok -ne "" -or $ManifestYouTube -ne "" -or $ManifestFacebook -ne "")
$haveTriple = ($ManifestTikTok -ne "" -and $ManifestYouTube -ne "" -and $ManifestFacebook -ne "")
$haveDirBase = ($ManifestDir -ne "" -and $ManifestBaseName -ne "")
if ($anyManifest -and -not $haveTriple) {
  throw "Zadaj sve tri putanje: -ManifestTikTok, -ManifestYouTube, -ManifestFacebook (ili ništa od toga i koristi -ManifestDir + -ManifestBaseName)."
}
if ($haveTriple -and $haveDirBase) {
  throw "Koristi ili tri -Manifest* putanje ili -ManifestDir + -ManifestBaseName, ne oboje."
}
if ($haveTriple) {
  $mfTik = if ([IO.Path]::IsPathRooted($ManifestTikTok)) { $ManifestTikTok } else { Join-Path $Scripts $ManifestTikTok }
  $mfYt = if ([IO.Path]::IsPathRooted($ManifestYouTube)) { $ManifestYouTube } else { Join-Path $Scripts $ManifestYouTube }
  $mfFb = if ([IO.Path]::IsPathRooted($ManifestFacebook)) { $ManifestFacebook } else { Join-Path $Scripts $ManifestFacebook }
} elseif ($haveDirBase) {
  $md = (Resolve-Path $ManifestDir).Path
  $mfTik = Join-Path $md ("{0}-tiktok.json" -f $ManifestBaseName)
  $mfYt = Join-Path $md ("{0}-youtube.json" -f $ManifestBaseName)
  $mfFb = Join-Path $md ("{0}-facebook.json" -f $ManifestBaseName)
} else {
  $mfTik = Join-Path $Scripts "social-story-tiktok.json"
  $mfYt = Join-Path $Scripts "social-story-youtube.json"
  $mfFb = Join-Path $Scripts "social-story-facebook.json"
}

foreach ($p in @($mfTik, $mfYt, $mfFb)) {
  if (-not (Test-Path $p)) { throw "Nema manifesta: $p" }
}

if ($OutFilePrefix -ne "") {
  $outTik = Join-Path $OutDir ("{0}_tiktok.mp4" -f $OutFilePrefix)
  $outYt = Join-Path $OutDir ("{0}_youtube.mp4" -f $OutFilePrefix)
  $outFb = Join-Path $OutDir ("{0}_facebook.mp4" -f $OutFilePrefix)
} else {
  $outTik = Join-Path $OutDir "uslugar_tiktok_final.mp4"
  $outYt = Join-Path $OutDir "uslugar_youtube_final.mp4"
  $outFb = Join-Path $OutDir "uslugar_facebook_final.mp4"
}

Write-Host "=== Story TikTok (1080x1920) ===" -ForegroundColor Cyan
& (Join-Path $Scripts "Build-UslugarPromoFromManifest.ps1") -AssetsDir $DocsRoot -ManifestFile $mfTik -Width 1080 -Height 1920 `
  -OutFile $outTik -MusicFile $musTik -SkipBrandOverlay -FontFile $fontStory

Write-Host "=== Story YouTube (1920x1080) ===" -ForegroundColor Cyan
& (Join-Path $Scripts "Build-UslugarPromoFromManifest.ps1") -AssetsDir $DocsRoot -ManifestFile $mfYt -Width 1920 -Height 1080 `
  -OutFile $outYt -MusicFile $musYt -SkipBrandOverlay -FontFile $fontStory

Write-Host "=== Story Facebook (1080x1350) ===" -ForegroundColor Cyan
& (Join-Path $Scripts "Build-UslugarPromoFromManifest.ps1") -AssetsDir $DocsRoot -ManifestFile $mfFb -Width 1080 -Height 1350 `
  -OutFile $outFb -MusicFile $musFb -SkipBrandOverlay -FontFile $fontStory

Write-Host "GOTOVO. Izlazi:" -ForegroundColor Green
Write-Host $outTik
Write-Host $outYt
Write-Host $outFb
