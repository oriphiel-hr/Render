<#
.SYNOPSIS
  Kopira promo slike (klijent / pružatelj / tim) u docs\people\ i spaja ih s UI concat listom.

.DESCRIPTION
  Prvi put: kopira postojeći tiktok_concat.txt -> tiktok_concat_ui.txt (samo UI), zatim
  generira tiktok_concat.txt = people + UI. Daljnji putovi: čitaju *_concat_ui.txt.
#>
param(
  [Parameter(Mandatory = $true)]
  [string] $DocsRoot,
  [Parameter(Mandatory = $true)]
  [string] $RepoRoot,
  [Parameter(Mandatory = $true)]
  [string] $ScriptsDir
)

$ErrorActionPreference = "Stop"
$docs = Resolve-Path $DocsRoot
$repo = Resolve-Path $RepoRoot
$people = Join-Path $docs "people"
New-Item -ItemType Directory -Path $people -Force | Out-Null

$promoSrc = Join-Path $repo "frontend\public\promo-ai"
$pngs = @(
  "promo-klijent-mobitel.png",
  "promo-pruzatelj-tablet.png",
  "promo-tim-ured.png",
  "promo-kuha-mobitel.png"
)
foreach ($n in $pngs) {
  $s = Join-Path $promoSrc $n
  if (-not (Test-Path $s)) { throw "Nema slike za slideshow: $s" }
  Copy-Item -Path $s -Destination (Join-Path $people $n) -Force
}

$utf8 = New-Object System.Text.UTF8Encoding $false
foreach ($pair in @(
    @{ name = "tiktok"; snippet = "concat-people-tiktok.txt" },
    @{ name = "youtube"; snippet = "concat-people-youtube.txt" },
    @{ name = "facebook"; snippet = "concat-people-facebook.txt" }
  )) {
  $uiBackup = Join-Path $docs ("{0}_concat_ui.txt" -f $pair.name)
  $outConcat = Join-Path $docs ("{0}_concat.txt" -f $pair.name)
  $snippetPath = Join-Path $ScriptsDir $pair.snippet

  if (-not (Test-Path $snippetPath)) { throw "Nema: $snippetPath" }

  if (-not (Test-Path $uiBackup)) {
    if (-not (Test-Path $outConcat)) { throw "Nema concat: $outConcat" }
    Copy-Item $outConcat $uiBackup -Force
  }

  $head = [System.IO.File]::ReadAllText($snippetPath)
  $tail = [System.IO.File]::ReadAllText($uiBackup)
  if (-not $tail.EndsWith("`n")) { $tail += "`n" }
  [System.IO.File]::WriteAllText($outConcat, $head + $tail, $utf8)
  Write-Host "OK concat -> $outConcat" -ForegroundColor Green
}
