<#
.SYNOPSIS
  FFmpeg slideshow iz concat liste PNG-ova s ispravnim letterboxom (cijeli screenshot vidljiv).

.DESCRIPTION
  Bez scale+pad(decrease), siroki PNG u 9:16 ili 16:9 cesto zavrsi cropanim ili "izvan kadra".
  Ovdje: scale=force_original_aspect_ratio=decrease + pad centrirano.

.EXAMPLE
  .\Build-UslugarSlideshow.ps1 -DocsDir "C:\path\docs" -ConcatFile "tiktok_concat.txt" -Width 1080 -Height 1920 -OutFile "output\slideshow_tiktok.mp4"
  .\Build-UslugarSlideshow.ps1 -DocsDir "C:\path\docs" -MusicFile "track.mp3" -ConcatFile "youtube_concat.txt" -Width 1920 -Height 1080
#>
param(
  [Parameter(Mandatory = $true)]
  [string] $DocsDir,
  [Parameter(Mandatory = $true)]
  [string] $ConcatFile,
  [Parameter(Mandatory = $true)]
  [string] $OutFile,
  [int] $Width = 1080,
  [int] $Height = 1920,
  [int] $Fps = 30,
  [string] $MusicFile = "",
  [string] $PixelFormat = "yuv420p",
  [string] $Preset = "veryfast",
  [string] $Crf = "20"
)

$ErrorActionPreference = "Stop"
$docs = Resolve-Path $DocsDir
$concatPath = Join-Path $docs $ConcatFile
if (-not (Test-Path $concatPath)) { throw "Nema concat datoteke: $concatPath" }
$outPath = if ([IO.Path]::IsPathRooted($OutFile)) { $OutFile } else { Join-Path $docs $OutFile }
$outDir = Split-Path $outPath -Parent
if ($outDir -and -not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }

# Letterbox: cijela slika unutar okvira, crne trake po potrebi
$vf = "fps=$Fps,format=$PixelFormat,scale=${Width}:${Height}:force_original_aspect_ratio=decrease,pad=${Width}:${Height}:(ow-iw)/2:(oh-ih)/2:color=black"

# Svi ulazi prije izlaznih opcija (-vf). Drugi -i (glazba) mora odmah nakon concat ulaza.
$args = @(
  "-y",
  "-f", "concat",
  "-safe", "0",
  "-i", $concatPath
)
if ($MusicFile -ne "") {
  $mus = Resolve-Path $MusicFile
  # Petlja zvuka dok traje video (inace -shortest skrati video na duljinu MP3-a).
  $args += @("-stream_loop", "-1", "-i", $mus.Path)
}
$args += @(
  "-vf", $vf,
  "-c:v", "libx264",
  "-preset", $Preset,
  "-crf", $Crf,
  "-movflags", "+faststart"
)
if ($MusicFile -ne "") {
  $args += @("-map", "0:v:0", "-map", "1:a:0", "-c:a", "aac", "-b:a", "192k", "-shortest")
} else {
  $args += "-an"
}
$args += $outPath
Write-Host "ffmpeg $($args -join ' ')"
& ffmpeg @args
if ($LASTEXITCODE -ne 0) { throw "ffmpeg exit $LASTEXITCODE" }
Write-Host "OK -> $outPath"
