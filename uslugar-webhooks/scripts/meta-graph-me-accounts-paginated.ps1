#Requires -Version 5.1
<#
  Meta Graph: dohvati SVE stranice korisnika preko GET /me/accounts s paginacijom (paging.next).

  MORA biti User Access Token (Graph Explorer → User Token), ne Page token.
  Tipično dopuštenje za listu: pages_show_list (ovisno o app verziji / review).

  Pokretanje:
    $env:FB_USER_TOKEN = "<user token>"
    .\meta-graph-me-accounts-paginated.ps1

  Opcije:
    .\meta-graph-me-accounts-paginated.ps1 -ApiVersion v25.0 -Limit 25

  Ne commitaj tokene u git.
#>

param(
  [string]$ApiVersion = "v25.0",
  [int]$Limit = 25,
  [string]$Fields = "id,name,access_token"
)

$ErrorActionPreference = "Stop"

function Get-FbUserToken {
  $t = $env:FB_USER_TOKEN
  if ([string]::IsNullOrWhiteSpace($t)) {
    $secure = Read-Host "User access token (Graph Explorer)" -AsSecureString
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try {
      $t = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
    } finally {
      [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    }
  }
  if ([string]::IsNullOrWhiteSpace($t)) {
    throw "Postavi `$env:FB_USER_TOKEN ili unesi token."
  }
  return $t.Trim()
}

$UserToken = Get-FbUserToken

$encodedFields = [Uri]::EscapeDataString($Fields)
$firstUrl = "https://graph.facebook.com/$ApiVersion/me/accounts?fields=$encodedFields&limit=$Limit&access_token=$([Uri]::EscapeDataString($UserToken))"

$collected = New-Object System.Collections.Generic.List[object]
$uri = $firstUrl
$pageNum = 0

while ($null -ne $uri) {
  $pageNum++
  Write-Host "`n--- Stranica rezultata $pageNum ---" -ForegroundColor Cyan

  try {
    $r = Invoke-RestMethod -Uri $uri -Method Get -TimeoutSec 120
  } catch {
    $reader = $null
    try {
      $resp = $_.Exception.Response
      if ($resp) {
        $stream = $resp.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Host ($reader.ReadToEnd()) -ForegroundColor Red
      }
    } catch {}
    throw
  }

  if ($r.data) {
    foreach ($row in @($r.data)) {
      $collected.Add($row)
    }
  }

  $next = $null
  if ($r.paging -and $r.paging.next) {
    $next = [string]$r.paging.next
  }

  if ([string]::IsNullOrWhiteSpace($next)) {
    $uri = $null
  } else {
    $uri = $next
  }
}

Write-Host "`nUkupno stranica (broj redaka): $($collected.Count)" -ForegroundColor Green
$collected | ConvertTo-Json -Depth 10
