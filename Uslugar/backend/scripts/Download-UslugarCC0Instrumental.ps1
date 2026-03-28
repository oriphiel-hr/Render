<#
.SYNOPSIS
  Preuzima instrumental (klavir) s Wikimedia Commons - javna domena (CC0).

.DESCRIPTION
  Snimak: Kimiko Ishizaka - J. S. Bach, Goldberg Variations, 01 Aria (Open Goldberg project).
  Licenca: CC0 - mozes koristiti u reklamama; u opisu videa mozes zahvaliti izvodacu/projekt.

  Izlaz: MP3 (konverzija FFmpeg-om) pogodan za Run-Generate-All-Promo-Videos.ps1.

.PARAMETER OutFile
  Ciljna putanja (.mp3). Zadano: .\generated-audio\uslugar-instrumental.mp3

.EXAMPLE
  .\Download-UslugarCC0Instrumental.ps1
  .\Download-UslugarCC0Instrumental.ps1 -Force
#>
param(
  [string] $OutFile = "",
  [switch] $Force
)

$ErrorActionPreference = "Stop"
$Scripts = Split-Path -Parent $MyInvocation.MyCommand.Path
$Gen = Join-Path $Scripts "generated-audio"
if (-not (Test-Path $Gen)) { New-Item -ItemType Directory -Path $Gen -Force | Out-Null }

$out = if ($OutFile -ne "") {
  if ([IO.Path]::IsPathRooted($OutFile)) { $OutFile } else { Join-Path $Scripts $OutFile }
} else {
  Join-Path $Gen "uslugar-instrumental.mp3"
}

if ((Test-Path $out) -and -not $Force) {
  Write-Host "Vec postoji: $out (koristi -Force za ponovno preuzimanje)" -ForegroundColor Yellow
  exit 0
}

# Stabilni direktni link (upload.wikimedia.org)
$srcOgg = "https://upload.wikimedia.org/wikipedia/commons/e/e6/Kimiko_Ishizaka_-_01_-_Aria.ogg"
$tmpOgg = Join-Path $env:TEMP ("uslugar-aria-" + [Guid]::NewGuid().ToString("n") + ".ogg")

Write-Host "Preuzimanje: Open Goldberg Variations - Aria (CC0)..." -ForegroundColor Cyan
Write-Host $srcOgg
try {
  Invoke-WebRequest -Uri $srcOgg -OutFile $tmpOgg -UseBasicParsing
} catch {
  throw "Preuzimanje nije uspjelo (mreza / blokada). Stavi vlastiti MP3 kao generated-audio\uslugar-instrumental.mp3"
}

Write-Host "Konverzija u MP3..." -ForegroundColor Cyan
& ffmpeg -y -i $tmpOgg -c:a libmp3lame -q:a 2 $out
if ($LASTEXITCODE -ne 0) {
  Remove-Item $tmpOgg -Force -ErrorAction SilentlyContinue
  throw "ffmpeg konverzija exit $LASTEXITCODE"
}
Remove-Item $tmpOgg -Force -ErrorAction SilentlyContinue
Write-Host ('OK: ' + $out) -ForegroundColor Green
Write-Host 'Licenca: CC0 (Open Goldberg). Po zelji u opisu: Kimiko Ishizaka, opengoldbergvariations.org' -ForegroundColor DarkGray
