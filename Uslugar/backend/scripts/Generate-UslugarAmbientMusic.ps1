<#
.SYNOPSIS
  Blaga podloga iz filtriranog pink / brown / blue noisea — bez sinusnih tonova.

.DESCRIPTION
  Zvuk je "sobna" / ambient tekstura (1/f spektar + niske frekvencije), ne cisti tonovi.
  Za pravi instrumental stavi MP3 u generated-audio\uslugar-instrumental.mp3.

  Mood mijenja ukupnu glasnocu i omjer slojeva.
#>
param(
  [Parameter(Mandatory = $true)]
  [string] $OutFile,
  [int] $DurationSec = 45,
  [ValidateSet("calm", "warm", "bright")]
  [string] $Mood = "calm",
  [int] $SampleRate = 44100,
  [string] $Codec = "libmp3lame",
  [string] $AudioBitrate = "192k"
)

$ErrorActionPreference = "Stop"
$out = if ([IO.Path]::IsPathRooted($OutFile)) { $OutFile } else { Join-Path (Get-Location) $OutFile }
$dir = Split-Path $out -Parent
if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }

$d = [Math]::Max(8, $DurationSec)

# Razine: prije su slojevi bili -26 do -44 dB + amix normalize — ishod je bio ~-85 dB (necujno).
# Sada: umjereno glasni slojevi, normalize=0, limiter, pa lagani loudnorm za stabilnu glasnocu.
switch ($Mood) {
  "bright" {
    $pinkDb = "-10dB"
    $brownDb = "-14dB"
    $pink2Db = "-12dB"
    $postMix = "-2dB"
    $loudI = "-18"
  }
  "warm" {
    $pinkDb = "-11dB"
    $brownDb = "-15dB"
    $pink2Db = "-13dB"
    $postMix = "-3dB"
    $loudI = "-19"
  }
  default {
    $pinkDb = "-12dB"
    $brownDb = "-16dB"
    $pink2Db = "-14dB"
    $postMix = "-4dB"
    $loudI = "-20"
  }
}

$fadeIn = 2.5
$fadeOut = 3.0
$fadeOutStart = [Math]::Max(0, $d - $fadeOut)

# normalize=0: inace amix tiho mjesavinski skalira; loudnorm na kraju (linear true) — cilj ~I dB integrirano
$filter = @"
[0:a]highpass=f=200,lowpass=f=2600,volume=${pinkDb}[p1];
[1:a]lowpass=f=480,volume=${brownDb}[br];
[2:a]highpass=f=700,lowpass=f=5200,volume=${pink2Db}[p2];
[p1][br][p2]amix=inputs=3:duration=longest:dropout_transition=0:normalize=0,volume=${postMix},lowpass=f=3200,aecho=0.65:0.4:28:0.12,aecho=0.7:0.35:67:0.08,acompressor=threshold=-24dB:ratio=2:attack=80:release=400:makeup=1dB,alimiter=level_in=1:level_out=0.98:limit=1,pan=stereo|c0=0.92*c0|c1=0.92*c0,loudnorm=I=${loudI}:TP=-1.5:LRA=11,afade=t=in:st=0:d=${fadeIn},afade=t=out:st=${fadeOutStart}:d=${fadeOut}
"@

$args = @(
  "-y",
  "-f", "lavfi", "-i", "anoisesrc=color=pink:duration=$d`:sample_rate=${SampleRate}",
  "-f", "lavfi", "-i", "anoisesrc=color=brown:duration=$d`:sample_rate=${SampleRate}",
  "-f", "lavfi", "-i", "anoisesrc=color=pink:duration=$d`:sample_rate=${SampleRate}:seed=17341",
  "-filter_complex", $filter,
  "-t", "$d",
  "-c:a", $Codec
)

if ($Codec -eq "libmp3lame") { $args += @("-b:a", $AudioBitrate) }
elseif ($Codec -eq "aac") { $args += @("-b:a", $AudioBitrate) }
$args += $out

Write-Host "ffmpeg $($args -join ' ')"
& ffmpeg @args
if ($LASTEXITCODE -ne 0) { throw "ffmpeg exit $LASTEXITCODE" }
Write-Host "Spremljeno: $out"
