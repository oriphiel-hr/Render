<#
.SYNOPSIS
  Kontakt traka + promotivni tekst preko MP4; opcijski logo.

.DESCRIPTION
  -NoLogo: bez loga — samo gornji promotivni redak i donja traka s kontaktom.
  Izlazni video MORA biti mapiran s [vout] iz filter_complex (inace dupli video stream i player bez zvuka).

  Zvuk: -KeepInputAudio (npr. nakon Build-UslugarSlideshow s glazbom) ili -MusicFile za zamjenu.

.EXAMPLE
  .\Add-UslugarBrandOverlay.ps1 -InputVideo ".\out\slideshow.mp4" -Profile TikTok -OutVideo ".\out\final.mp4" -KeepInputAudio -NoLogo
#>
param(
  [Parameter(Mandatory = $true)]
  [string] $InputVideo,
  [string] $LogoPng = "",
  [switch] $NoLogo,
  [Parameter(Mandatory = $true)]
  [ValidateSet("TikTok", "Facebook", "YouTube")]
  [string] $Profile,
  [Parameter(Mandatory = $true)]
  [string] $OutVideo,
  [string] $MusicFile = "",
  [switch] $KeepInputAudio,
  [string] $PromoLine = "",
  [string] $FontFile = "C:/Windows/Fonts/arial.ttf",
  [string] $Preset = "veryfast",
  [string] $Crf = "20"
)

$ErrorActionPreference = "Stop"
if ([string]::IsNullOrWhiteSpace($PromoLine)) {
  $PromoLine = @'
Jedan upit, više ponuda – iz cijele Hrvatske. Tako klijenti i izvođači koriste Uslugar.
'@.Trim()
}
if (-not $NoLogo -and [string]::IsNullOrWhiteSpace($LogoPng)) {
  throw "Zadaj -LogoPng ili koristi -NoLogo."
}

$in = Resolve-Path $InputVideo
$out = if ([IO.Path]::IsPathRooted($OutVideo)) { $OutVideo } else { Join-Path (Get-Location) $OutVideo }
$outDir = Split-Path $out -Parent
if ($outDir -and -not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }

$fontEsc = ($FontFile -replace '\\', '/') -replace '^([A-Za-z]):', '${1}\:'
$utf8 = New-Object System.Text.UTF8Encoding $false
$tmpDir = Join-Path ([IO.Path]::GetTempPath()) ("uslugar-ov-" + [Guid]::NewGuid().ToString("n"))
New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null
$promoFile = Join-Path $tmpDir "promo.txt"
$contactFile = Join-Path $tmpDir "contact.txt"
try {
  [System.IO.File]::WriteAllText($promoFile, $PromoLine.Trim(), $utf8)
  [System.IO.File]::WriteAllText($contactFile, "www.uslugar.eu  ·  uslugar@oriphiel.hr", $utf8)
  $promoEsc = ($promoFile -replace '\\', '/') -replace '^([A-Za-z]):', '${1}\:'
  $contactEsc = ($contactFile -replace '\\', '/') -replace '^([A-Za-z]):', '${1}\:'

  switch ($Profile) {
    "Facebook" {
      $topBar = "92"; $botBar = "108"; $promoFs = "28"; $promoY = "30"; $contactFs = "26"; $contactY = "h-72"
      $scale = "210:-1"; $sx = "36"; $sy = "42"; $lx = "30"; $ly = "30"
      $px = "18"; $py = "22"; $pw = "226"; $ph = "102"
    }
    "TikTok" {
      $topBar = "100"; $botBar = "118"; $promoFs = "26"; $promoY = "34"; $contactFs = "25"; $contactY = "h-82"
      $scale = "180:-1"; $sx = "30"; $sy = "46"; $lx = "24"; $ly = "40"
      $px = "12"; $py = "30"; $pw = "196"; $ph = "92"
    }
    "YouTube" {
      $topBar = "88"; $botBar = "100"; $promoFs = "30"; $promoY = "26"; $contactFs = "27"; $contactY = "h-68"
      $scale = "240:-1"; $sx = "40"; $sy = "46"; $lx = "34"; $ly = "40"
      $px = "22"; $py = "28"; $pw = "260"; $ph = "118"
    }
  }

  $dtPromo = "drawtext=fontfile='$fontEsc':textfile='$promoEsc':fontsize=${promoFs}:fontcolor=white:borderw=2:bordercolor=black@0.9:x=(w-text_w)/2:y=${promoY}"
  $dtContact = "drawtext=fontfile='$fontEsc':textfile='$contactEsc':fontsize=${contactFs}:fontcolor=white:borderw=2:bordercolor=black@0.88:x=(w-text_w)/2:y=${contactY}"

  if ($NoLogo) {
    $fc = @"
[0:v]drawbox=x=0:y=0:w=iw:h=${topBar}:color=black@0.5:t=fill,$dtPromo,drawbox=x=0:y=ih-${botBar}:w=iw:h=${botBar}:color=black@0.55:t=fill,$dtContact[vout]
"@
    $argList = @(
      "-y",
      "-i", $in.Path,
      "-filter_complex", $fc,
      "-map", "[vout]",
      "-c:v", "libx264",
      "-preset", $Preset,
      "-crf", $Crf,
      "-pix_fmt", "yuv420p",
      "-movflags", "+faststart"
    )
  } else {
    $logo = Resolve-Path $LogoPng
    $fc = @"
[1:v]scale=$scale,format=rgba,eq=brightness=0.12:contrast=1.08,split[lg0][lg1];
[lg1]colorchannelmixer=aa=0.35,gblur=sigma=8[sh];
[0:v][sh]overlay=x=${sx}:y=${sy}:format=auto:shortest=1[tmp0];
[tmp0]drawbox=x=${px}:y=${py}:w=${pw}:h=${ph}:color=white@0.22:t=fill[tmp1];
[tmp1][lg0]overlay=x=${lx}:y=${ly}:format=auto:shortest=1,drawbox=x=0:y=0:w=iw:h=${topBar}:color=black@0.5:t=fill,$dtPromo,drawbox=x=0:y=ih-${botBar}:w=iw:h=${botBar}:color=black@0.55:t=fill,$dtContact[vout]
"@
    $argList = @(
      "-y",
      "-i", $in.Path,
      "-loop", "1",
      "-i", $logo.Path,
      "-filter_complex", $fc,
      "-shortest",
      "-map", "[vout]",
      "-c:v", "libx264",
      "-preset", $Preset,
      "-crf", $Crf,
      "-pix_fmt", "yuv420p",
      "-movflags", "+faststart"
    )
  }

  if ($MusicFile -ne "") {
    $mus = Resolve-Path $MusicFile
    $idx = if ($NoLogo) { "1" } else { "2" }
    $argList += @("-i", $mus.Path, "-map", "${idx}:a:0", "-c:a", "aac", "-b:a", "192k")
  } elseif ($KeepInputAudio) {
    $hasA = & ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 $in.Path 2>$null
    if ($hasA) {
      $argList += @("-map", "0:a:0", "-c:a", "aac", "-b:a", "192k")
    } else {
      $argList += "-an"
    }
  } else {
    $argList += "-an"
  }

  $argList += $out

  Write-Host "ffmpeg $($argList -join ' ')"
  & ffmpeg @argList
  if ($LASTEXITCODE -ne 0) { throw "ffmpeg exit $LASTEXITCODE" }
  Write-Host "OK -> $out"
}
finally {
  Remove-Item -Path $tmpDir -Recurse -Force -ErrorAction SilentlyContinue
}
