<#
.SYNOPSIS
  Reklamni video iz JPG/PNG slika + JSON manifesta (naslov + podnaslov po kadru).

.DESCRIPTION
  Svaki kadar: slika (letterbox), dva reda teksta. Dugi tekst automatski se lomi u više redaka i smanjuje font dok stane u okvir.
  UTF-8 datoteke za hrvatske znakove (č, ć, š, ž, đ).
  slideType "contact": zadnji kadar bez slike — tamna podloga s naslovom i kontaktom; opcijski logo (PNG, transparentno) iznad teksta: -ContactLogoPng ili isti folder/oriphiel-contact-logo.png.

  Zvuk: obavezno zadaj -MusicFile (npr. Generate-UslugarAmbientMusic) ili stavi prazan za video bez zvuka.

.PARAMETER SkipBrandOverlay
  Ne zovi Add-UslugarBrandOverlay — izlaz je spoj segmenata + glazba (npr. kad je kontakt zadnji kadar u manifestu).

.EXAMPLE
  .\Build-UslugarPromoFromManifest.ps1 -AssetsDir "D:\docs" -ManifestFile ".\social-story-tiktok.json" `
    -Width 1080 -Height 1920 -OutFile "D:\docs\output\final.mp4" -MusicFile ".\generated-audio\bed.mp3" -SkipBrandOverlay
#>
param(
  [Parameter(Mandatory = $true)]
  [string] $AssetsDir,
  [Parameter(Mandatory = $true)]
  [string] $ManifestFile,
  [Parameter(Mandatory = $true)]
  [string] $OutFile,
  [int] $Width = 1080,
  [int] $Height = 1920,
  [int] $Fps = 30,
  [string] $MusicFile = "",
  [string] $LogoPng = "",
  # PNG s transparentnom pozadinom — na kontakt kadru (slideType contact) centrirano iznad teksta.
  [string] $ContactLogoPng = "",
  [switch] $BrandNoLogo,
  [switch] $SkipBrandOverlay,
  [ValidateSet("TikTok", "Facebook", "YouTube")]
  [string] $BrandProfile = "TikTok",
  [string] $BrandPromoLine = "",
  [string] $FontFile = "",
  [string] $Preset = "veryfast",
  [string] $Crf = "20",
  [int] $MaxTitleLinesOverride = -1,
  [int] $MaxSubLinesOverride = -1,
  [int] $MaxContactSubLinesOverride = -1,
  [ValidateRange(0.35, 0.85)]
  [double] $DrawtextCharWidthFactor = 0.62
)

$ErrorActionPreference = "Stop"
if ([string]::IsNullOrWhiteSpace($BrandPromoLine)) {
  $BrandPromoLine = @'
Jedan upit, više ponuda – iz cijele Hrvatske. Tako klijenti i izvođači koriste Uslugar.
'@.Trim()
}

if ([string]::IsNullOrWhiteSpace($FontFile)) {
  $segoe = "C:/Windows/Fonts/segoeui.ttf"
  $arial = "C:/Windows/Fonts/arial.ttf"
  if (Test-Path $segoe) { $FontFile = $segoe } elseif (Test-Path $arial) { $FontFile = $arial } else { $FontFile = $arial }
}

$ScriptDir = $PSScriptRoot
$assets = Resolve-Path $AssetsDir
$manifestPath = if ([IO.Path]::IsPathRooted($ManifestFile)) { $ManifestFile } else { Join-Path $assets $ManifestFile }
if (-not (Test-Path $manifestPath)) { throw "Nema manifesta: $manifestPath" }

$rawJson = [System.IO.File]::ReadAllText($manifestPath, [System.Text.UTF8Encoding]::new($false))
$slides = $rawJson | ConvertFrom-Json
if (-not ($slides -is [Array])) { $slides = @($slides) }

$outPath = if ([IO.Path]::IsPathRooted($OutFile)) { $OutFile } else { Join-Path $assets $OutFile }
$outDir = Split-Path $outPath -Parent
if ($outDir -and -not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }

$titleFs = [Math]::Max(38, [Math]::Min(78, [int][Math]::Round(54 * $Width / 1080.0)))
$subFs = [Math]::Max(28, [Math]::Min(56, [int][Math]::Round(40 * $Width / 1080.0)))
$contactTitleFs = [Math]::Max(44, [Math]::Min(88, [int][Math]::Round(58 * $Width / 1080.0)))
$contactSubFs = [Math]::Max(28, [Math]::Min(56, [int][Math]::Round(38 * $Width / 1080.0)))
# Niži okvir (npr. YouTube 1080 visine): manje redaka, viši blok naslova da se ne preklapa s podnaslovom
$isShortFrame = ($Height -le 1200)
# Više redaka = manje forsiranog smanjenja fonta na dugim tekstovima (bez skraćivanja u skripti).
$maxTitleLines = if ($isShortFrame) { 5 } else { 8 }
$maxSubLines = if ($isShortFrame) { 7 } else { 12 }
if ($MaxTitleLinesOverride -ge 1) { $maxTitleLines = $MaxTitleLinesOverride }
if ($MaxSubLinesOverride -ge 1) { $maxSubLines = $MaxSubLinesOverride }
$maxContactSubLines = if ($MaxContactSubLinesOverride -ge 1) {
  $MaxContactSubLinesOverride
} else {
  if ($isShortFrame) { 8 } else { 12 }
}
$yTitleImg = if ($isShortFrame) { "h*0.48" } else { "h*0.54" }
$ySubImg = if ($isShortFrame) { "h*0.66" } else { "h*0.74" }
$yTitleContact = if ($isShortFrame) { "h*0.28" } else { "h*0.30" }
$ySubContact = if ($isShortFrame) { "h*0.44" } else { "h*0.48" }

$work = Join-Path ([System.IO.Path]::GetTempPath()) ("uslugar-promo-" + [Guid]::NewGuid().ToString("n"))
New-Item -ItemType Directory -Path $work -Force | Out-Null
$concatList = Join-Path $work "video_concat.txt"
$fontEsc = ($FontFile -replace '\\', '/') -replace '^([A-Za-z]):', '${1}\:'
$utf8 = New-Object System.Text.UTF8Encoding $false
# Za drawtext textfile na Windowsu: UTF-8 s BOM pouzdanije prepoznaje višebajtne znakove (bez toga ponekad □ umjesto č/ć/š…).
$utf8Bom = New-Object System.Text.UTF8Encoding $true
$concatLines = [System.Collections.Generic.List[string]]::new()

$contactLogoResolved = $null
$defaultContactLogo = Join-Path $ScriptDir "oriphiel-contact-logo.png"
if (-not [string]::IsNullOrWhiteSpace($ContactLogoPng)) {
  if (Test-Path $ContactLogoPng) { $contactLogoResolved = (Resolve-Path $ContactLogoPng).Path }
} elseif (Test-Path $defaultContactLogo) {
  $contactLogoResolved = (Resolve-Path $defaultContactLogo).Path
}

function Finalize-UslugarCaptionText {
  param([string] $Text)
  if ([string]::IsNullOrWhiteSpace($Text)) { return "" }
  $t = $Text.Trim().Normalize([System.Text.NormalizationForm]::FormC)
  $t = $t -replace "`r", ""
  $t = $t -replace "[\u200B-\u200F\uFEFF\u2060\u00AD]", ""
  $t = $t -replace [char]0x00A0, ' '
  # Svi Unicode „space separator” (NBSP, narrow NBSP, figure space…) → običan razmak — inače FreeType često crta □.
  $t = [regex]::Replace($t, '\p{Zs}', ' ')
  # Nevidljivi format znakovi (Cf) — mogu završiti kao □ u drawtext/HarfBuzz.
  $t = [regex]::Replace($t, '\p{Cf}', '')
  $t = $t -replace [char]0x2028, "`n"
  $t = $t -replace [char]0x2029, "`n"
  $t = $t -replace "[\u2018\u2019\u02BC]", "'"
  $t = $t -replace "[\u201C\u201D]", '"'
  $t = $t -replace "[\u2013\u2014\u2212]", "-"
  # Unicode ellipsis (…) nije u dozvoljenom skupu ispod — zamijeni razmakom prije filtriranja
  $t = $t -replace [char]0x2026, ' '
  $t = $t -replace "\u201A", ","
  $t = $t -replace "\uFF0C", ","
  $t = $t -replace "[\uFFFD\u25A0-\u25FF]", ""
  # Samo hrvatska slova (ASCII + U+010C/0107/0110/0111/0160/0161/017D/017E), brojevi, mail/web, interpunkcija
  $hrChars = [string]::new([char[]]@(
      0x010C, 0x0106, 0x0110, 0x0160, 0x017D, 0x010D, 0x0107, 0x0111, 0x0161, 0x017E
    ))
  $pat = '[^0-9A-Za-z' + $hrChars + ' \n\.,!\?:;''"\(\)\-@\/\+]'
  $t = [regex]::Replace($t, $pat, "")
  $t = $t -replace " +", " "
  $t = $t.Trim()
  # Hrvatski mobitel u jednom vizualnom bloku (+385 …) — NBSP da Wrap ne lomi broj; prikaz kao „+385 91 561 8258”.
  $t = Convert-UslugarHrPhoneToDisplay -Text $t
  return $t
}

function Convert-UslugarHrPhoneToDisplay {
  param([string]$Text)
  if ([string]::IsNullOrWhiteSpace($Text)) { return $Text }
  $nb = [char]0x00A0
  # +385 9x xxx xxxx ili 09x xxx xxxx (x = mrežna znamenka)
  $r = [regex]'(?:\+385\s*(9[1-9])|0(9[1-9]))\s*(\d{3})\s*(\d{3,4})(?!\d)'
  return $r.Replace($Text, {
      param($m)
      $net = if ($m.Groups[1].Success) { $m.Groups[1].Value } else { $m.Groups[2].Value }
      return "+385$nb$net$nb$($m.Groups[3].Value)$nb$($m.Groups[4].Value)"
    })
}

function Split-UslugarLongWord {
  param(
    [string] $Word,
    [int] $MaxCharsPerLine
  )
  if ([string]::IsNullOrWhiteSpace($Word)) { return @() }
  if ($Word.Length -le $MaxCharsPerLine) { return @($Word) }
  $lines = [System.Collections.Generic.List[string]]::new()
  $enum = [System.Globalization.StringInfo]::GetTextElementEnumerator($Word)
  $buf = New-Object System.Text.StringBuilder
  while ($enum.MoveNext()) {
    $te = $enum.GetTextElement()
    if ($buf.Length -eq 0) {
      [void]$buf.Append($te)
      continue
    }
    if ($buf.Length + $te.Length -gt $MaxCharsPerLine) {
      $lines.Add($buf.ToString()) | Out-Null
      $buf.Clear() | Out-Null
      [void]$buf.Append($te)
    } else {
      [void]$buf.Append($te)
    }
  }
  if ($buf.Length -gt 0) { $lines.Add($buf.ToString()) | Out-Null }
  return $lines
}

function Wrap-UslugarCaptionText {
  param(
    [string] $Text,
    [int] $MaxCharsPerLine
  )
  if ([string]::IsNullOrWhiteSpace($Text)) { return "" }
  $mc = [Math]::Max(8, $MaxCharsPerLine)
  $paragraphs = $Text -split "`n"
  $out = [System.Collections.Generic.List[string]]::new()
  foreach ($para in $paragraphs) {
    if ([string]::IsNullOrWhiteSpace($para)) { continue }
    $words = $para.Trim() -split '\s+'
    $lines = [System.Collections.Generic.List[string]]::new()
    $cur = ""
    foreach ($w in $words) {
      if ([string]::IsNullOrWhiteSpace($w)) { continue }
      $trial = if ($cur) { "$cur $w" } else { $w }
      if ($trial.Length -le $mc) {
        $cur = $trial
        continue
      }
      if ($cur) { $lines.Add($cur) | Out-Null; $cur = "" }
      if ($w.Length -le $mc) {
        $cur = $w
      } else {
        foreach ($part in (Split-UslugarLongWord -Word $w -MaxCharsPerLine $mc)) {
          $lines.Add($part) | Out-Null
        }
      }
    }
    if ($cur) { $lines.Add($cur) | Out-Null }
    foreach ($ln in $lines) { $out.Add($ln) | Out-Null }
  }
  return ($out -join "`n")
}

function Clean-UslugarDrawtextLines {
  param([string] $Text)
  if ([string]::IsNullOrWhiteSpace($Text)) { return "" }
  $t = $Text -replace "`r", ""
  # Remove control chars except LF/TAB
  $t = [regex]::Replace($t, "[\x00-\x08\x0B-\x1F\x7F-\x9F]", "")
  # Strip trailing whitespace/control-like debris per line
  $lines = @($t -split "`n")
  $clean = [System.Collections.Generic.List[string]]::new()
  foreach ($ln in $lines) {
    $l = $ln -replace "`r", ""
    # Zadrži U+00A0 (NBSP) — broj telefona u jednom bloku (.NET: Zs minus NBSP).
    $l = [regex]::Replace($l, '[\p{Zs}-[\u00A0]]', ' ')
    $l = $l -replace "[\s]+$", ""
    $clean.Add($l) | Out-Null
  }
  # Samo LF između redaka (drawtext multiline).
  return ($clean -join "`n")
}

function Write-UslugarDrawtextLineFiles {
  param(
    [string[]]$Lines,
    [string]$WorkDir,
    [string]$FilePrefix,
    [int]$SegIdx,
    [System.Text.Encoding]$Enc
  )
  $escaped = [System.Collections.Generic.List[string]]::new()
  $li = 0
  foreach ($raw in $Lines) {
    if ($null -eq $raw) { $raw = '' }
    $one = [regex]::Replace($raw.Trim(), '\p{Cf}', '')
    if ([string]::IsNullOrWhiteSpace($one)) { $one = ' ' }
    $path = Join-Path $WorkDir ("{0}_{1}_L{2}.txt" -f $FilePrefix, $SegIdx, $li)
    [System.IO.File]::WriteAllText($path, $one, $Enc)
    $escaped.Add((($path -replace '\\', '/') -replace '^([A-Za-z]):', '${1}\:')) | Out-Null
    $li++
  }
  # Bez vodećeg zareza: `return ,$arr` u PS-u vraća jedan element koji je cijeli niz → kasnije se spaja u jedan string s razmacima i FFmpeg vidi jedan krivi textfile=.
  return [string[]]$escaped.ToArray()
}

function New-UslugarDrawtextFilterChain {
  param(
    [string[]]$EscapedPaths,
    [string]$fontEsc,
    [int]$fs,
    [string]$fontColor,
    [string]$boxColor,
    [int]$boxBorder,
    [string]$xExpr,
    [string[]]$yExprs,
    [string]$TextAlign = ""
  )
  if ($null -eq $EscapedPaths -or $EscapedPaths.Count -eq 0) { return "" }
  $bits = [System.Collections.Generic.List[string]]::new()
  for ($i = 0; $i -lt $EscapedPaths.Count; $i++) {
    $p = $EscapedPaths[$i]
    $y = $yExprs[$i]
    $ta = if ([string]::IsNullOrWhiteSpace($TextAlign)) { "" } else { ":text_align=${TextAlign}" }
    $bits.Add("drawtext=fontfile='$fontEsc':textfile='$p':expansion=none:fontsize=${fs}:fontcolor=${fontColor}:line_spacing=0:text_shaping=1:box=1:boxcolor=${boxColor}:boxborderw=${boxBorder}:borderw=0:x=${xExpr}:y=${y}${ta}") | Out-Null
  }
  return ($bits -join ",")
}

function Get-UslugarImageDisplayDimensions {
  param(
    [string] $ImagePath,
    [int] $FrameW,
    [int] $ImgMaxH
  )
  $W0 = 0
  $H0 = 0
  $raw = & ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x -- $ImagePath 2>$null
  $line = if ($null -eq $raw) { "" } elseif ($raw -is [Array]) { [string]$raw[-1] } else { [string]$raw }
  $line = $line.Trim()
  if ($LASTEXITCODE -eq 0 -and $line -match '^(\d+)x(\d+)$') {
    $W0 = [int]$Matches[1]
    $H0 = [int]$Matches[2]
  }
  if ($W0 -le 0 -or $H0 -le 0) {
    try {
      Add-Type -AssemblyName System.Drawing -ErrorAction Stop
      $rp = (Resolve-Path -LiteralPath $ImagePath).Path
      $bmp = [System.Drawing.Image]::FromFile($rp)
      $W0 = $bmp.Width
      $H0 = $bmp.Height
      $bmp.Dispose()
    } catch {
      return @{ W = $FrameW; H = $ImgMaxH }
    }
  }
  if ($W0 -le 0 -or $H0 -le 0) { return @{ W = $FrameW; H = $ImgMaxH } }
  $s = [Math]::Min($FrameW / $W0, $ImgMaxH / $H0)
  $dispW = [int][Math]::Floor($W0 * $s)
  $dispH = [int][Math]::Floor($H0 * $s)
  if ($dispW -gt $FrameW) { $dispW = $FrameW }
  if ($dispH -gt $ImgMaxH) { $dispH = $ImgMaxH }
  return @{ W = $dispW; H = $dispH }
}

function Get-WrappedCaption {
  param(
    [string] $Text,
    [int] $VideoWidth,
    [int] $FontSize,
    [int] $MinFont,
    [int] $MaxLines,
    [double] $CharWidthFactor = 0.62,
    [int] $HorizontalPadPx = 32,
    [double] $WidthSafetyFactor = 1.0,
    # Donji limit znakova/retka da drawtext ne reže red; niže = više znakova po retku (duži retci do ruba). Više = sigurnije od reza.
    [double] $MaxLinePixelCharFactor = 0.47,
    [double] $MaxLinePixelBudget = 0.93,
    # Podnaslov na slici: jedna procjena širine retka = od lijevog do desnog ruba slike (x=(w-dispW)/2+pad), bez dvostrukog „min” koji je skraćivao retke.
    [switch] $ImageSubtitleFullWidth
  )
  # VideoWidth = širina u kojoj smije stati tekst (npr. širina slike nakon scale) ili puni kadar; HorizontalPadPx = unutarnji razmak od rubova te širine.
  # WidthSafetyFactor < 1 smanjuje efektivnu širinu (manje znakova po retku) da FFmpeg drawtext ne „odreže” retke — procjena širine znaka nije savršena.
  $inner = [double]($VideoWidth - 2 * $HorizontalPadPx) * $WidthSafetyFactor
  $usable = [Math]::Max(220, [int][Math]::Floor($inner))
  $fs = $FontSize
  $cw = $CharWidthFactor
  while ($fs -ge $MinFont) {
    if ($ImageSubtitleFullWidth) {
      # ~0.42×font ≈ prosjek za Segoe/hrvatski; 0.97×usable = blago konzervativno da retak ne „pukne” u FFmpegu.
      $maxChars = [Math]::Max(12, [int][Math]::Floor(($usable * 0.97) / ($fs * 0.42)))
    } else {
      $avgW = $fs * $cw
      $maxChars = [Math]::Max(10, [int][Math]::Floor($usable / $avgW))
      $pxPerCharSafe = $fs * $MaxLinePixelCharFactor
      $maxCharsSafe = [Math]::Max(10, [int][Math]::Floor(($usable * $MaxLinePixelBudget) / $pxPerCharSafe))
      if ($maxChars -gt $maxCharsSafe) { $maxChars = $maxCharsSafe }
    }
    $wrapped = Wrap-UslugarCaptionText -Text $Text -MaxCharsPerLine $maxChars
    $n = 1
    if ($wrapped) { $n = @($wrapped -split "`n").Count }
    if ($n -le $MaxLines) {
      return @{ Text = $wrapped; FontSize = $fs }
    }
    $fs = [int][Math]::Floor($fs * 0.9)
  }
  if ($ImageSubtitleFullWidth) {
    $maxChars = [Math]::Max(12, [int][Math]::Floor(($usable * 0.97) / ($MinFont * 0.42)))
  } else {
    $maxChars = [Math]::Max(10, [int][Math]::Floor($usable / ($MinFont * $cw)))
    $pxPerCharSafe = $MinFont * $MaxLinePixelCharFactor
    $maxCharsSafe = [Math]::Max(10, [int][Math]::Floor(($usable * $MaxLinePixelBudget) / $pxPerCharSafe))
    if ($maxChars -gt $maxCharsSafe) { $maxChars = $maxCharsSafe }
  }
  return @{
    Text       = (Wrap-UslugarCaptionText -Text $Text -MaxCharsPerLine $maxChars)
    FontSize   = $MinFont
  }
}

try {
  $idx = 0
  foreach ($s in $slides) {
    $kind = [string]$s.slideType
    if ([string]::IsNullOrWhiteSpace($kind)) { $kind = "image" }

    $dur = [Math]::Max(1, [int]$s.durationSec)
    $title = Finalize-UslugarCaptionText -Text ([string]$s.title)
    $sub = Finalize-UslugarCaptionText -Text ([string]$s.subtitle)

    $seg = Join-Path $work ("seg{0:D3}.mp4" -f $idx)

    # Lomljenje: na kadrovima sa slikom širina teksta = stvarna širina slike nakon letterboxa (ffprobe / System.Drawing), ne cijeli kadar.
    $padContact = 56
    # Mali rub unutar slike; WidthSafetyFactor u Get-WrappedCaption dodatno sužava retke da drawtext ne reže tekst.
    $padImage = 8
    if ($kind -eq "contact") {
      $fitT = Get-WrappedCaption -Text $title -VideoWidth $Width -FontSize $contactTitleFs -MinFont 28 -MaxLines $(if ($isShortFrame) { 2 } else { 3 }) -CharWidthFactor $DrawtextCharWidthFactor -HorizontalPadPx $padContact
      $fitS = Get-WrappedCaption -Text $sub -VideoWidth $Width -FontSize $contactSubFs -MinFont 20 -MaxLines $maxContactSubLines -CharWidthFactor $DrawtextCharWidthFactor -HorizontalPadPx $padContact
      $ctf = $fitT.FontSize
      $csf = $fitS.FontSize
      $lsT = [Math]::Max(6, [int][Math]::Round($ctf * 0.22))
      $lsS = [Math]::Max(5, [int][Math]::Round($csf * 0.22))
    } else {
      $imgName = $s.image
      if (-not $imgName) { throw "Manifest: nedostaje image na indeksu $idx (slideType=$kind)" }
      $imgPathEarly = Join-Path $assets $imgName
      if (-not (Test-Path $imgPathEarly)) { throw "Nema slike: $imgPathEarly" }
      $imgMaxHForWrap = [int][Math]::Floor($Height * 0.62)
      $disp = Get-UslugarImageDisplayDimensions -ImagePath $imgPathEarly -FrameW $Width -ImgMaxH $imgMaxHForWrap
      $dispW = [int]$disp.W
      $dispH = [int]$disp.H
      $imgTopY = [int][Math]::Floor(([double]($Height - $dispH)) / 2.0)
      $imgBottomY = $imgTopY + $dispH
      # Uski portret (puno letterboxa): titlovi kao na „punoj” širini kadra (~ostale slike), ne uz usku dispW.
      $maxTextByFrame = $Width - 2 * $padImage
      $narrowPortraitTh = [int][Math]::Floor($Width * 0.76)
      $targetTextW = [Math]::Min($maxTextByFrame, [int][Math]::Floor($Width * 0.92))
      if ($dispW -lt $narrowPortraitTh) {
        $wrapW = [Math]::Max($dispW, $targetTextW)
      } else {
        $wrapW = $dispW
      }
      # Naslov: ista formula širine retka kao podnaslov kad je wrapW proširen (inakše naslov ostane už — drugačiji maxChars).
      $cwTitle = [Math]::Max(0.44, [Math]::Min(0.56, $DrawtextCharWidthFactor - 0.06))
      $wrapSafeTitle = 0.86
      if ($wrapW -gt $dispW) {
        $fitT = Get-WrappedCaption -Text $title -VideoWidth $wrapW -FontSize $titleFs -MinFont 24 -MaxLines $maxTitleLines -HorizontalPadPx $padImage -WidthSafetyFactor 0.98 -ImageSubtitleFullWidth
      } else {
        $fitT = Get-WrappedCaption -Text $title -VideoWidth $wrapW -FontSize $titleFs -MinFont 24 -MaxLines $maxTitleLines -CharWidthFactor $cwTitle -HorizontalPadPx $padImage -WidthSafetyFactor $wrapSafeTitle -MaxLinePixelCharFactor 0.46 -MaxLinePixelBudget 0.94
      }
      $fitS = Get-WrappedCaption -Text $sub -VideoWidth $wrapW -FontSize $subFs -MinFont 22 -MaxLines $maxSubLines -HorizontalPadPx $padImage -WidthSafetyFactor 0.98 -ImageSubtitleFullWidth
      $tf = $fitT.FontSize
      $sf = $fitS.FontSize
      $lsT = [Math]::Max(6, [int][Math]::Round($tf * 0.22))
      $lsS = [Math]::Max(5, [int][Math]::Round($sf * 0.22))
    }

    $tFinal = Clean-UslugarDrawtextLines -Text $fitT.Text
    $sFinal = Clean-UslugarDrawtextLines -Text $fitS.Text
    $tLines = @($tFinal -split "`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
    $sLines = @($sFinal -split "`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
    if ($tLines.Count -eq 0) { $tLines = @(' ') }
    if ($sLines.Count -eq 0) { $sLines = @(' ') }

    $pathsT = @(Write-UslugarDrawtextLineFiles -Lines $tLines -WorkDir $work -FilePrefix "t1" -SegIdx $idx -Enc $utf8Bom)
    $pathsS = @(Write-UslugarDrawtextLineFiles -Lines $sLines -WorkDir $work -FilePrefix "t2" -SegIdx $idx -Enc $utf8Bom)

    if ($kind -eq "contact") {
      $xExpr = '(w-text_w)/2'
      $stepT = [Math]::Max(1, [int][Math]::Round($ctf * 1.12) + $lsT)
      $stepS = [Math]::Max(1, [int][Math]::Round($csf * 1.12) + $lsS)
      $ytBase = if ($isShortFrame) { 'h*0.28' } else { 'h*0.30' }
      $ysBase = if ($isShortFrame) { 'h*0.44' } else { 'h*0.48' }
      $yTitleArr = @()
      for ($ti = 0; $ti -lt $pathsT.Count; $ti++) {
        $off = $ti * $stepT
        $yTitleArr += "${ytBase}+${off}"
      }
      $ySubArr = @()
      $logoY = 0
      $logoH = 0
      if ($null -ne $contactLogoResolved) {
        # Logo ispod naslova; podnaslov u pikselima ispod loga.
        $ytFrac = if ($isShortFrame) { 0.28 } else { 0.30 }
        $ytPx = [int][Math]::Floor($Height * $ytFrac)
        $lineHtT = [Math]::Max([int][Math]::Ceiling($ctf * 1.2), $ctf + 8)
        $titleBlockPx = if ($pathsT.Count -le 1) { $lineHtT } else { ($pathsT.Count - 1) * $stepT + $lineHtT }
        $gapTitleLogo = 22
        $logoH = [int][Math]::Max(100, [Math]::Min(380, [int][Math]::Floor($Height * 0.14)))
        $logoY = $ytPx + $titleBlockPx + $gapTitleLogo
        $gapLogoSub = 32
        $ysPx = $logoY + $logoH + $gapLogoSub
        for ($si = 0; $si -lt $pathsS.Count; $si++) {
          $ySubArr += [string]($ysPx + $si * $stepS)
        }
      } else {
        for ($si = 0; $si -lt $pathsS.Count; $si++) {
          $off = $si * $stepS
          $ySubArr += "${ysBase}+${off}"
        }
      }
      $chainT = New-UslugarDrawtextFilterChain -EscapedPaths $pathsT -fontEsc $fontEsc -fs $ctf -fontColor white -boxColor black@0.52 -boxBorder 14 -xExpr $xExpr -yExprs $yTitleArr
      $chainS = New-UslugarDrawtextFilterChain -EscapedPaths $pathsS -fontEsc $fontEsc -fs $csf -fontColor white@0.98 -boxColor black@0.52 -boxBorder 14 -xExpr $xExpr -yExprs $ySubArr
      $baseGraph = "fps=${Fps},format=yuv420p," + $chainT + "," + $chainS
      if ($null -ne $contactLogoResolved) {
        $fc = "[0:v]${baseGraph}[v0];[1:v]scale=-1:${logoH},format=rgba[lg];[v0][lg]overlay=(W-w)/2:${logoY}:format=auto"
        $ffArgs = @(
          "-y", "-f", "lavfi", "-i", "color=c=0x12121a:s=${Width}x${Height}:r=$Fps",
          "-loop", "1", "-i", $contactLogoResolved,
          "-filter_complex", $fc,
          "-t", "$dur", "-pix_fmt", "yuv420p", "-c:v", "libx264", "-preset", $Preset, "-crf", $Crf, $seg
        )
      } else {
        $vf = $baseGraph
        $ffArgs = @(
          "-y", "-f", "lavfi", "-i", "color=c=0x12121a:s=${Width}x${Height}:r=$Fps",
          "-vf", $vf, "-t", "$dur", "-pix_fmt", "yuv420p", "-c:v", "libx264", "-preset", $Preset, "-crf", $Crf, $seg
        )
      }
    } else {
      $imgPath = $imgPathEarly
      # Centar retka: x=(w-text_w)/2 — lijevi rub retka tako da je cijeli red vizualno centriran (ne x=w/2 + text_align, što izgleda kao „od sredine”).
      $xExprTitle = '(w-text_w)/2'
      $xExprSub = '(w-text_w)/2'

      # Slika u sredini (max ~62% visine kadra), letterbox. Mora stati u Width x imgMaxH i u širinu i u visinu — inače široka slika (npr. 1364x1024) ostane šira od 1080 i pad baci "Padded dimensions cannot be smaller than input dimensions".
      $imgMaxH = [int][Math]::Floor($Height * 0.62)
      $stepT = [Math]::Max(1, [int][Math]::Round($tf * 1.12) + $lsT)
      $stepS = [Math]::Max(1, [int][Math]::Round($sf * 1.12) + $lsS)
      # Vertikalno: naslov u gornjoj traci IZNAD slike, podnaslov u donjoj ISPOD — ne fiksno od ruba kadra (to je izgledalo „zalijepljeno”).
      $gapT = 22
      $gapS = 22
      $bottomPad = [Math]::Max(96, [int][Math]::Round($Height * 0.038))
      $minTopPad = [Math]::Max(96, [int][Math]::Round($Height * 0.038))
      $lineHT = [Math]::Max([int][Math]::Ceiling($tf * 1.14), $tf + 4)
      $titleBlockH = if ($pathsT.Count -le 1) { $lineHT } else { ($pathsT.Count - 1) * $stepT + $lineHT }
      $maxTitleY0 = $imgTopY - $gapT - $titleBlockH
      $titleY0 = if ($maxTitleY0 -ge $minTopPad) { $maxTitleY0 } else { [Math]::Max(12, $maxTitleY0) }
      if ($titleY0 -lt $minTopPad) { $titleY0 = $minTopPad }
      if ($titleY0 + $titleBlockH -gt $imgTopY - $gapT) {
        $titleY0 = [Math]::Max(12, $imgTopY - $gapT - $titleBlockH)
      }

      $lineHS = [Math]::Max([int][Math]::Ceiling($sf * 1.14), $sf + 4)
      $subBlockH = if ($pathsS.Count -le 1) { $lineHS } else { ($pathsS.Count - 1) * $stepS + $lineHS }
      $ySubMin = $imgBottomY + $gapS
      $ySubMax = $Height - $bottomPad - $subBlockH
      $ySub0 = if ($ySubMin -le $ySubMax) { $ySubMin } else { $ySubMax }

      $yTitleArr = @()
      for ($ti = 0; $ti -lt $pathsT.Count; $ti++) {
        $yTitleArr += [string]($titleY0 + $ti * $stepT)
      }
      $ySubArr = @()
      for ($si = 0; $si -lt $pathsS.Count; $si++) {
        $ySubArr += [string]($ySub0 + $si * $stepS)
      }
      $chainT = New-UslugarDrawtextFilterChain -EscapedPaths $pathsT -fontEsc $fontEsc -fs $tf -fontColor white -boxColor black@0.50 -boxBorder 12 -xExpr $xExprTitle -yExprs $yTitleArr
      $chainS = New-UslugarDrawtextFilterChain -EscapedPaths $pathsS -fontEsc $fontEsc -fs $sf -fontColor white@0.98 -boxColor black@0.52 -boxBorder 14 -xExpr $xExprSub -yExprs $ySubArr
      $vf = "fps=$Fps,format=yuv420p,scale=w=${Width}:h=${imgMaxH}:force_original_aspect_ratio=decrease,pad=" + $Width + ":" + $Height + ":(ow-iw)/2:(oh-ih)/2:color=black," +
        'eq=brightness=-0.05:gamma=1.02,' + $chainT + "," + $chainS

      $ffArgs = @("-y", "-loop", "1", "-i", $imgPath, "-vf", $vf, "-t", "$dur", "-pix_fmt", "yuv420p", "-c:v", "libx264", "-preset", $Preset, "-crf", $Crf, $seg)
    }

    & ffmpeg @ffArgs
    if ($LASTEXITCODE -ne 0) { throw "ffmpeg segment $idx exit $LASTEXITCODE" }

    $line = "file '" + ($seg -replace '\\', '/') + "'"
    $concatLines.Add($line) | Out-Null
    $idx++
  }

  [System.IO.File]::WriteAllText($concatList, ($concatLines -join "`n") + "`n", $utf8)

  $merged = Join-Path $work "merged_noaudio.mp4"
  $c0 = @("-y", "-f", "concat", "-safe", "0", "-i", $concatList, "-c", "copy", $merged)
  & ffmpeg @c0
  if ($LASTEXITCODE -ne 0) { throw "ffmpeg concat exit $LASTEXITCODE" }

  $staged = Join-Path $work "staged_mux.mp4"
  if ($MusicFile -ne "") {
    $mus = Resolve-Path $MusicFile
    $mArgs = @("-y", "-i", $merged, "-stream_loop", "-1", "-i", $mus.Path, "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", $staged)
    & ffmpeg @mArgs
    if ($LASTEXITCODE -ne 0) { throw "ffmpeg mux exit $LASTEXITCODE" }
  } else {
    $mArgs = @("-y", "-i", $merged, "-c", "copy", "-movflags", "+faststart", $staged)
    & ffmpeg @mArgs
    if ($LASTEXITCODE -ne 0) { throw "ffmpeg copy exit $LASTEXITCODE" }
  }

  if ($SkipBrandOverlay) {
    $fin = @("-y", "-i", $staged, "-c", "copy", "-movflags", "+faststart", $outPath)
    & ffmpeg @fin
    if ($LASTEXITCODE -ne 0) { throw "ffmpeg final copy exit $LASTEXITCODE" }
  } elseif ($BrandNoLogo) {
    $brandScript = Join-Path $ScriptDir "Add-UslugarBrandOverlay.ps1"
    if (-not (Test-Path $brandScript)) { throw "Nema Add-UslugarBrandOverlay.ps1: $brandScript" }
    & $brandScript -InputVideo $staged -Profile $BrandProfile -OutVideo $outPath -KeepInputAudio -NoLogo -PromoLine $BrandPromoLine -Preset $Preset -Crf $Crf -FontFile $FontFile
  } elseif ($LogoPng -ne "") {
    $logoResolved = Resolve-Path $LogoPng
    $brandScript = Join-Path $ScriptDir "Add-UslugarBrandOverlay.ps1"
    if (-not (Test-Path $brandScript)) { throw "Nema Add-UslugarBrandOverlay.ps1: $brandScript" }
    & $brandScript -InputVideo $staged -LogoPng $logoResolved.Path -Profile $BrandProfile -OutVideo $outPath -KeepInputAudio -Preset $Preset -Crf $Crf -FontFile $FontFile
  } else {
    $fin = @("-y", "-i", $staged, "-c", "copy", "-movflags", "+faststart", $outPath)
    & ffmpeg @fin
    if ($LASTEXITCODE -ne 0) { throw "ffmpeg final copy exit $LASTEXITCODE" }
  }

  Write-Host "OK -> $outPath"
}
finally {
  Remove-Item -Path $work -Recurse -Force -ErrorAction SilentlyContinue
}
