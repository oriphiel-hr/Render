# PowerShell script za dohvat JWT tokena za testiranje API-ja

$API_URL = if ($env:API_URL) { $env:API_URL } else { "https://uslugar.api.oriph.io" }
$EMAIL = if ($env:EMAIL) { $env:EMAIL } else { "" }
$PASSWORD = if ($env:PASSWORD) { $env:PASSWORD } else { "" }

if ([string]::IsNullOrEmpty($EMAIL) -or [string]::IsNullOrEmpty($PASSWORD)) {
  Write-Host "📝 Unesi email i password za login" -ForegroundColor Cyan
  Write-Host ""
  $EMAIL = Read-Host "Email"
  $PASSWORD = Read-Host "Password" -AsSecureString
  $PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($PASSWORD)
  )
}

Write-Host "🔐 Prijava u tijeku..." -ForegroundColor Cyan
Write-Host "API URL: $API_URL" -ForegroundColor Gray
Write-Host "Email: $EMAIL" -ForegroundColor Gray
Write-Host ""

# Login request
$body = @{
  email = $EMAIL
  password = $PASSWORD
} | ConvertTo-Json

try {
  $response = Invoke-RestMethod -Uri "$API_URL/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body `
    -ErrorAction Stop

  if ($response.token) {
    $TOKEN = $response.token
    $USER = $response.user

    Write-Host "✅ Login uspješan!" -ForegroundColor Green
    Write-Host ""
    Write-Host "👤 Korisnik:" -ForegroundColor Cyan
    $USER | ConvertTo-Json -Depth 10
    Write-Host ""
    Write-Host "🔑 JWT Token:" -ForegroundColor Yellow
    Write-Host $TOKEN -ForegroundColor White
    Write-Host ""
    Write-Host "📋 Koristi token u curl komandama:" -ForegroundColor Cyan
    Write-Host "`$env:JWT_TOKEN = `"$TOKEN`"" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📝 Primjer korištenja:" -ForegroundColor Cyan
    Write-Host "curl -X GET $API_URL/api/invoices \`" -ForegroundColor Gray
    Write-Host "  -H `"Authorization: Bearer $TOKEN`"" -ForegroundColor Gray
    Write-Host ""
    
    # Spremi token u fajl (opcionalno)
    $TOKEN | Out-File -FilePath ".jwt-token" -Encoding UTF8 -NoNewline
    Write-Host "💾 Token spremljen u .jwt-token fajl" -ForegroundColor Green
  } else {
    Write-Host "❌ Login neuspješan - token nedostaje u response-u!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 10
    exit 1
  }
} catch {
  Write-Host "❌ Greška pri login-u!" -ForegroundColor Red
  Write-Host ""
  Write-Host "Error:" -ForegroundColor Yellow
  Write-Host $_.Exception.Message -ForegroundColor Red
  if ($_.ErrorDetails) {
    Write-Host ""
    Write-Host "Details:" -ForegroundColor Yellow
    Write-Host $_.ErrorDetails.Message -ForegroundColor Red
  }
  exit 1
}

