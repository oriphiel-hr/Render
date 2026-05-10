#Requires -Version 5.1
<#
  Meta Graph (PowerShell): /me → user id, zatim /{user-id}/accounts (Page ID + page token).
  Verzija API-ja: automatski pokušaj v21.0, v20.0, v25.0, v19.0 — ne ovisi o Graph API Explorer dropdownu.

  POPUNI: $UserToken = User access token (Graph Explorer → User Token).
  Ne koristi Page token za /accounts — mora biti User token s pravom listati stranice kad Meta dopusti.

  Ne commitaj tokene u git.
#>

$ErrorActionPreference = "Stop"

# ==================== CONFIG ====================
$AppId     = "952560654334875"
$AppSecret = "9c1811b3e9e539c91f921242cf7bea17"

# User access token (Explorer: User Token). NE Page token.
$UserToken = "GGQVllVHBXdFZAoX3ZAJU05DajgzdjRWYXBsamlidmdJNlZAaMTRnNEtmcnZAlbzd3cHpqSXcwVmtSLTVXWnFwLXlCdVNxZAjl0dHcyeDFXUkh5Mk93OG5PRklfYzZA0Q2lQMzRvZAmdSUFNYdjhKMGJmN0ZAwUDVTeVNSM0NDc05WV0k4NjluTUpmamVxRjRPZAXNqWkQ0T1FQSzBlOENvbFRuTUk5eGhSTnI4WGNxZA3NN"
# ===============================================

$ApiVersions = @("v21.0", "v20.0", "v25.0", "v19.0")

function Invoke-FbGet {
  param(
    [Parameter(Mandatory)][string]$GraphPath,
    [Parameter(Mandatory)][string]$Token
  )
  # GraphPath npr. "me?fields=id,name" ili "123456/accounts?fields=id,name,access_token"
  $lastErr = $null
  foreach ($ver in $ApiVersions) {
    $base = "https://graph.facebook.com/$ver/$GraphPath"
    $sep = if ($GraphPath -match '\?') { '&' } else { '?' }
    $uri = "$base$sep" + "access_token=$([Uri]::EscapeDataString($Token))"
    try {
      $r = Invoke-RestMethod -Uri $uri -Method Get -TimeoutSec 90
      Write-Host "[OK] GET $ver/$GraphPath" -ForegroundColor Green
      return [PSCustomObject]@{ Version = $ver; Response = $r }
    } catch {
      $lastErr = $_
      Write-Host "[FAIL] $ver - $($_.Exception.Message)" -ForegroundColor DarkYellow
    }
  }
  if ($lastErr) {
    try {
      $stream = $lastErr.Exception.Response.GetResponseStream()
      $reader = New-Object System.IO.StreamReader($stream)
      Write-Host ($reader.ReadToEnd()) -ForegroundColor Red
    } catch {}
  }
  throw "Sve verzije neuspjele za: $GraphPath"
}

if ([string]::IsNullOrWhiteSpace($UserToken)) {
  throw "Postavi `$UserToken."
}

Write-Host "`n=== 1) GET /me ===`n"
$meWrap = Invoke-FbGet -GraphPath "me?fields=id,name" -Token $UserToken
$meWrap.Response | Format-List

$userId = [string]$meWrap.Response.id
if ([string]::IsNullOrWhiteSpace($userId)) {
  throw "/me nije vratio id."
}

Write-Host "`n=== 2) Lista stranica (isti User token; sluzbeno: me/accounts ili user-id/accounts) ===`n"

$accWrap = $null

Write-Host "--- 2a) GET me/accounts ---`n"
try {
  $accWrap = Invoke-FbGet -GraphPath "me/accounts?fields=id,name,access_token" -Token $UserToken
} catch {
  Write-Host "2a neuspjeh: $($_.Exception.Message)" -ForegroundColor DarkYellow
}

if (-not $accWrap) {
  Write-Host "`n--- 2b) GET {userId}/accounts ---`n"
  try {
    $accWrap = Invoke-FbGet -GraphPath "${userId}/accounts?fields=id,name,access_token" -Token $UserToken
  } catch {
    Write-Host "2b neuspjeh: $($_.Exception.Message)" -ForegroundColor DarkYellow
  }
}

if ($accWrap) {
  $accWrap.Response | ConvertTo-Json -Depth 10
} else {
  $hint = @'
NIJE USPJEO ni me/accounts ni userId/accounts.

- HTTP 500 na objema: cesto privremeni problem na Meta Graphu - probaj kasnije ili drugu mrezu.
- Kod 100 nonexisting field (accounts): token nije User token ili nema Page dozvole za app.
- Zaobilazak: Page ID iz postavki Facebook stranice + Page token iz Explorera kad odaberes Page.

'@
  Write-Host $hint -ForegroundColor Yellow

  Write-Host "`n--- 2c) Raw tijelo odgovora uz gresku (trazi fbtrace_id u JSON-u) ---`n"
  $diagUri = "https://graph.facebook.com/v21.0/me/accounts?fields=id,name&access_token=$([Uri]::EscapeDataString($UserToken))"
  try {
    $wr = Invoke-WebRequest -Uri $diagUri -UseBasicParsing -TimeoutSec 90
    Write-Host $wr.Content
  } catch {
    $ex = $_.Exception
    Write-Host "Exception: $($ex.Message)"

    $resp = $null
    if ($null -ne $ex.Response) {
      $resp = $ex.Response
    } elseif ($ex.InnerException -and $ex.InnerException.Response) {
      $resp = $ex.InnerException.Response
    }

    if ($resp) {
      try {
        Write-Host "HTTP status:" $resp.StatusCode.value__ $resp.StatusDescription
      } catch {}
      try {
        $stream = $resp.GetResponseStream()
        if ($null -eq $stream) {
          Write-Host "(GetResponseStream vratio null)"
        } else {
          $reader = New-Object System.IO.StreamReader($stream)
          $body = $reader.ReadToEnd()
          if ([string]::IsNullOrWhiteSpace($body)) {
            Write-Host "(tijelo odgovora prazno - Meta cesto ne salje JSON uz 500)"
          } else {
            Write-Host $body
          }
        }
      } catch {
        Write-Host "Citajuci tijelo:" $_.Exception.Message
      }
    } else {
      Write-Host "(Exception.Response je null - PowerShell nema HTTP tijelo za ovaj fail)"
    }

    if (Get-Command curl.exe -ErrorAction SilentlyContinue) {
      Write-Host "`n--- curl.exe (ako zelis probati izvan .NET) ---"
      Write-Host "curl.exe -sS -i `"$diagUri`""
      Write-Host "(kopiraj URL iz Explorera ako token u cmd liniji predugačak)"
    }
  }
}

Write-Host "`n=== 3) (Opcija) debug_token za User token ===`n"
$appTok = "${AppId}|${AppSecret}"
$v = $meWrap.Version
$dbg = "https://graph.facebook.com/$v/debug_token?input_token=$([Uri]::EscapeDataString($UserToken))&access_token=$([Uri]::EscapeDataString($appTok))"
try {
  Invoke-RestMethod -Uri $dbg -Method Get -TimeoutSec 90 | ConvertTo-Json -Depth 10
} catch {
  Write-Host "debug_token nije uspio (Meta 500 / code 1 je cest). Koristi https://developers.facebook.com/tools/accesstoken" -ForegroundColor Yellow
  Write-Host $_.Exception.Message
}

Write-Host "`nGotovo."
Read-Host "Enter za kraj"
