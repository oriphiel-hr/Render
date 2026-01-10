# S3 Test - Jednostavna PowerShell skripta
# Koristi postojeceg korisnika

param(
    [string]$Email = "",
    [string]$Password = ""
)

$API_URL = "https://uslugar.api.oriph.io"

# Ako nisu zadani, zatrazi ih
if ([string]::IsNullOrEmpty($Email)) {
    Write-Host "Unesi email i password za login" -ForegroundColor Cyan
    Write-Host ""
    $Email = Read-Host "Email"
    $Password = Read-Host "Password" -AsSecureString
    $Password = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Password)
    )
}

Write-Host "Prijava..." -ForegroundColor Cyan
Write-Host "Email: $Email" -ForegroundColor Gray
Write-Host ""

# Login
$body = @{
    email = $Email
    password = $Password
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$API_URL/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -ErrorAction Stop

    if ($loginResponse.token) {
        $TOKEN = $loginResponse.token
        Write-Host "Login uspjesan!" -ForegroundColor Green
        Write-Host "Korisnik: $($loginResponse.user.fullName) ($($loginResponse.user.role))" -ForegroundColor Gray
        Write-Host ""
        
        # Postavi token
        $env:JWT_TOKEN = $TOKEN
        $headers = @{Authorization = "Bearer $TOKEN"}
        
        # Dohvati fakture
        Write-Host "Dohvacanje faktura..." -ForegroundColor Cyan
        $invoices = Invoke-RestMethod -Uri "$API_URL/api/invoices" `
            -Method GET `
            -Headers $headers `
            -ErrorAction Stop
        
        Write-Host "Pronadeno faktura: $($invoices.total)" -ForegroundColor Gray
        Write-Host ""
        
        if ($invoices.invoices.Count -eq 0) {
            Write-Host "Nema faktura!" -ForegroundColor Yellow
            Write-Host "Aktiviraj pretplatu preko Stripe checkout-a da se kreira faktura." -ForegroundColor Gray
            Write-Host ""
        } else {
            Write-Host "Fakture:" -ForegroundColor Cyan
            $invoices.invoices | ForEach-Object {
                $pdfStatus = if ($_.pdfUrl) { "OK" } else { "MISSING" }
                Write-Host "  $pdfStatus $($_.invoiceNumber): $($_.pdfUrl)" -ForegroundColor Gray
            }
            Write-Host ""
        }
        
        # Provjeri S3 bucket
        Write-Host "Provjera S3 bucket-a..." -ForegroundColor Cyan
        $s3List = aws s3 ls s3://uslugar-invoices/invoices/ --region eu-north-1 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            if ($s3List) {
                Write-Host "PDF-ovi u S3:" -ForegroundColor Green
                $s3List | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
            } else {
                Write-Host "S3 bucket je prazan (nema PDF-ova)" -ForegroundColor Yellow
            }
        } else {
            Write-Host "Greska pri provjeri S3 bucket-a" -ForegroundColor Yellow
            Write-Host $s3List -ForegroundColor Gray
        }
        Write-Host ""
        
        # Preuzmi prvu fakturu (ako postoji)
        if ($invoices.invoices.Count -gt 0) {
            $invoice = $invoices.invoices[0]
            $invoiceId = $invoice.id
            $invoiceNumber = $invoice.invoiceNumber
            
            Write-Host "Preuzimanje PDF-a za $invoiceNumber..." -ForegroundColor Cyan
            try {
                Invoke-WebRequest -Uri "$API_URL/api/invoices/$invoiceId/pdf" `
                    -Headers $headers `
                    -OutFile "invoice-$invoiceNumber.pdf" `
                    -ErrorAction Stop
                
                $fileSize = (Get-Item "invoice-$invoiceNumber.pdf").Length
                Write-Host "PDF preuzet: invoice-$invoiceNumber.pdf ($fileSize bytes)" -ForegroundColor Green
            } catch {
                Write-Host "Greska pri preuzimanju PDF-a: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        
        Write-Host ""
        Write-Host "Test zavrsen!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Token spremljen u: `$env:JWT_TOKEN" -ForegroundColor Cyan
        Write-Host "Mozes koristiti za dodatne testove." -ForegroundColor Gray
        
    } else {
        Write-Host "Login neuspjesan - token nedostaje!" -ForegroundColor Red
        Write-Host $loginResponse | ConvertTo-Json
    }
} catch {
    Write-Host "Greska!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Yellow
    }
}
