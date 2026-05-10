#Requires -Version 5.1
<#
  Meta Graph API: dohvat Page ID + Page token (/me/accounts), zatim
  POST /{page-id}/subscribed_apps za Messenger polja.

  Prije pokretanja:
  1. Graph API Explorer → User token → pages_show_list → kopiraj u $UserAccessToken
  2. Pokreni:  .\scripts\meta-page-subscribed-apps.ps1

  Ako me/accounts stalno vrati 500: probaj $ApiVersionsTry, novi token, ili ručno
  $ManualPageId + $ManualPageToken (Explorer → User or Page → Page token).

  Ne commitaj token u git.
#>

# ========================= CONFIG =========================
$UserAccessToken = "GGQVllVHBXdFZAoX3ZAJU05DajgzdjRWYXBsamlidmdJNlZAaMTRnNEtmcnZAlbzd3cHpqSXcwVmtSLTVXWnFwLXlCdVNxZAjl0dHcyeDFXUkh5Mk93OG5PRklfYzZA0Q2lQMzRvZAmdSUFNYdjhKMGJmN0ZAwUDVTeVNSM0NDc05WV0k4NjluTUpmamVxRjRPZAXNqWkQ0T1FQSzBlOENvbFRuTUk5eGhSTnI4WGNxZA3NN"

# Ako Graph za me/accounts pada, probaj ove verzije redom:
$ApiVersionsTry = @("v21.0", "v20.0", "v19.0", "v18.0")

# Za POST/GET nakon što imaš page token (koristi istu verziju koja prođe za accounts):
$ApiVersionFallback = "v21.0"

$SubscribedFields = @(
  "messages",
  "messaging_postbacks",
  "messaging_optins",
  "message_deliveries",
  "message_reads"
) -join ","

# --- Zaobilazak ako /me/accounts ne radi (500): upiši broj i token, ostavi UserAccessToken praznim ili ga ignoriraj ---
$ManualPageId    = ""
$ManualPageToken = ""
# ==========================================================

$ErrorActionPreference = "Stop"

function Stop-Script {
  param([string]$Message, [int]$Code = 1)
  Write-Host "`n$Message" -ForegroundColor Red
  Read-Host "`nPritisni Enter za izlaz"
  exit $Code
}

function Show-GraphError {
  param([System.Management.Automation.ErrorRecord]$Err)
  if ($Err.ErrorDetails -and $Err.ErrorDetails.Message) {
    Write-Host "Graph ErrorDetails: $($Err.ErrorDetails.Message)" -ForegroundColor Yellow
  }
  $ex = $Err.Exception
  while ($ex) {
    if ($ex.Response) {
      try {
        $stream = $ex.Response.GetResponseStream()
        if ($stream) {
          $reader = New-Object System.IO.StreamReader($stream)
          $body = $reader.ReadToEnd()
          if ($body) { Write-Host "HTTP tijelo: $body" -ForegroundColor Yellow }
        }
      } catch {}
    }
    $ex = $ex.InnerException
  }
  Write-Host "Izuzetak: $($Err.Exception.Message)" -ForegroundColor Red
}

function Get-MeAccounts {
  param([string]$BaseUrl, [string]$Token)
  $accUri = "$BaseUrl/me/accounts?fields=id,name,access_token&access_token=$([Uri]::EscapeDataString($Token))"
  return Invoke-RestMethod -Uri $accUri -Method Get
}

if (-not [string]::IsNullOrWhiteSpace($ManualPageId) -and -not [string]::IsNullOrWhiteSpace($ManualPageToken)) {
  Write-Host "`n=== Ručni Page ID / token (preskačem me/accounts) ===" -ForegroundColor Cyan
  $base = "https://graph.facebook.com/$ApiVersionFallback"
  $pageId = $ManualPageId.Trim()
  $pageToken = $ManualPageToken.Trim()
  $pageName = "(ručno)"
} else {
  if ([string]::IsNullOrWhiteSpace($UserAccessToken)) {
    Stop-Script "Postavi `$UserAccessToken ili `$ManualPageId + `$ManualPageToken."
  }

  Write-Host "`n=== GET /me (provjera tokena) ===" 
  $meOk = $false
  foreach ($ver in $ApiVersionsTry) {
    $tryBase = "https://graph.facebook.com/$ver"
    $meUri = "$tryBase/me?fields=id,name&access_token=$([Uri]::EscapeDataString($UserAccessToken))"
    try {
      $me = Invoke-RestMethod -Uri $meUri -Method Get
      Write-Host "OK /me kao User ($ver): id=$($me.id) name=$($me.name)" -ForegroundColor Green
      $meOk = $true
      break
    } catch {
      Write-Host "/me fail $ver" -ForegroundColor DarkYellow
      Show-GraphError $_
    }
  }
  if (-not $meOk) {
    Stop-Script "/me ne prolazi — token je istekao, kriv tip, ili Graph incident. Generiraj novi User token u Exploreru."
  }

  Write-Host "`n=== GET me/accounts (probam više verzija API-ja) ==="
  $accounts = $null
  $base = $null
  $lastErr = $null
  foreach ($ver in $ApiVersionsTry) {
    $tryBase = "https://graph.facebook.com/$ver"
    Write-Host "Pokušaj $tryBase/me/accounts ..."
    try {
      $accounts = Get-MeAccounts -BaseUrl $tryBase -Token $UserAccessToken
      $base = $tryBase
      Write-Host "me/accounts OK ($ver)" -ForegroundColor Green
      break
    } catch {
      $lastErr = $_
      Show-GraphError $_
    }
  }

  if (-not $accounts) {
    if ($lastErr) { Show-GraphError $lastErr }
    $msg = @(
      "me/accounts nije uspio ni na jednoj verziji (nema odgovora). Uobičajeno:"
      "  - novi User token + pages_show_list u Exploreru"
      "  - privremeni 500 na Meta strani - probaj kasnije"
      "  - zaobilazak: u CONFIG upisi ManualPageId + ManualPageToken (Page token iz Explorera)"
    ) -join [Environment]::NewLine
    Stop-Script $msg
  }

  # Normalizacija: data može biti null, jedan objekt, niz, ili [null] elementi iz Grapha
  $raw = $accounts.data
  if ($null -eq $raw) {
    Stop-Script "accounts.data je null — token vjerojatno nema pages_show_list ili nisi admin na stranici. Probaj ManualPageId + ManualPageToken."
  }
  if ($raw -is [System.Array]) {
    $rows = @(foreach ($x in $raw) { if ($null -ne $x) { $x } })
  } else {
    $rows = @($raw)
  }

  if ($null -eq $rows -or $rows.Count -lt 1) {
    Stop-Script "Nema valjanih stranica u data (prazan popis). Koristi ManualPageId + ManualPageToken ili dodaj pages_show_list."
  }

  $picked = $null
  if ($rows.Count -gt 1) {
    Write-Host "`nStranice:"
    for ($i = 0; $i -lt $rows.Count; $i++) {
      Write-Host "  [$i] $($rows[$i].name)  (id=$($rows[$i].id))"
    }
    $sel = Read-Host "`nBroj stranice [0-$($rows.Count-1)]"
    try {
      $idx = [int]$sel.Trim()
    } catch {
      Stop-Script "Nevaljan broj."
    }
    if ($idx -lt 0 -or $idx -ge $rows.Count) {
      Stop-Script "Indeks izvan raspona."
    }
    $picked = $rows[$idx]
  } else {
    $picked = $rows[0]
  }

  $pageId = [string]$picked.id
  $pageToken = [string]$picked.access_token
  $pageName = [string]$picked.name
}

if ([string]::IsNullOrWhiteSpace($pageId) -or [string]::IsNullOrWhiteSpace($pageToken)) {
  Stop-Script "pageId ili pageToken prazan."
}

Write-Host "`nOdabrano: $pageName"
Write-Host "pageId=$pageId"
Write-Host "pageToken length=$($pageToken.Length)"

Write-Host "`n=== POST /$pageId/subscribed_apps ==="
$form = @(
  "subscribed_fields=$([Uri]::EscapeDataString($SubscribedFields))",
  "access_token=$([Uri]::EscapeDataString($pageToken))"
) -join '&'

$subUri = "$base/$pageId/subscribed_apps"

try {
  $post = Invoke-RestMethod -Uri $subUri -Method Post -Body $form `
    -ContentType "application/x-www-form-urlencoded; charset=UTF-8"
  Write-Host "POST OK:"
  $post | ConvertTo-Json -Depth 5
} catch {
  Show-GraphError $_
  Stop-Script "POST subscribed_apps nije uspio."
}

Write-Host "`n=== GET /$pageId/subscribed_apps (provjera) ==="
try {
  $listUri = "$base/$pageId/subscribed_apps?access_token=$([Uri]::EscapeDataString($pageToken))"
  Invoke-RestMethod -Uri $listUri -Method Get | ConvertTo-Json -Depth 10
} catch {
  Show-GraphError $_
  Stop-Script "GET subscribed_apps nije uspio."
}

Write-Host "`nGotovo." -ForegroundColor Green
Read-Host "`nEnter za kraj"
