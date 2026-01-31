#Requires -Version 5.1
<#
.SYNOPSIS
    Otvara Mailpit Web UI iz Render Private Service putem SSH tunela.

.DESCRIPTION
    Ova skripta kreira SSH tunel do Mailpit servisa na Render-u i otvara
    Web UI u browseru na http://localhost:8025

    Potrebno je imati:
    1. SSH ključ dodan u Render Account Settings
    2. Render SSH komandu za Mailpit servis (Dashboard → Mailpit → Connect → SSH)

.EXAMPLE
    .\mailpit-tunnel.ps1

.NOTES
    Prva upotreba: Uredi $RENDER_SSH_COMMAND ispod svojom Render SSH komandom.
#>

param(
    [switch]$NoBrowser  # Ne otvaraj browser automatski
)

# ═══════════════════════════════════════════════════════════════════════════════
# KONFIGURACIJA - Uredi ovu vrijednost!
# ═══════════════════════════════════════════════════════════════════════════════
# Render Dashboard → Mailpit servis → Connect (gore desno) → SSH tab
# Kopiraj cijelu SSH komandu (npr. ssh srv-xxxxx@ssh.frankfurt.render.com)
# ═══════════════════════════════════════════════════════════════════════════════

$RENDER_SSH_COMMAND = "ssh srv-XXXXX@ssh.frankfurt.render.com"

# Pokušaj učitati iz config datoteke (ako postoji)
$configPath = Join-Path $PSScriptRoot "mailpit-tunnel.config.ps1"
if (Test-Path $configPath) {
    try {
        . $configPath
    } catch {
        Write-Warning "Ne mogu učitati config: $_"
    }
}

# Validacija
if ($RENDER_SSH_COMMAND -match "srv-XXXXX") {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "  KONFIGURACIJA POTREBNA" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Otvori Render Dashboard: https://dashboard.render.com" -ForegroundColor Cyan
    Write-Host "2. Odaberi Mailpit servis (Private Service)" -ForegroundColor Cyan
    Write-Host "3. Klikni 'Connect' (gore desno) → SSH tab" -ForegroundColor Cyan
    Write-Host "4. Kopiraj SSH komandu (npr. ssh srv-abc123@ssh.frankfurt.render.com)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "5a. Opcija A - Uredi ovu skriptu:" -ForegroundColor Cyan
    Write-Host "    Otvori mailpit-tunnel.ps1 i zamijeni `$RENDER_SSH_COMMAND" -ForegroundColor Gray
    Write-Host ""
    Write-Host "5b. Opcija B - Kreiraj config datoteku:" -ForegroundColor Cyan
    Write-Host "    Copy mailpit-tunnel.config.example.ps1 -> mailpit-tunnel.config.ps1" -ForegroundColor Gray
    Write-Host "    Uredi mailpit-tunnel.config.ps1 i postavi svoju SSH komandu" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Provjeri da imaš SSH ključ u Render Account Settings!" -ForegroundColor Yellow
    Write-Host "  https://dashboard.render.com/settings#ssh-public-keys" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

# Izvuci host iz SSH komande
$sshParts = $RENDER_SSH_COMMAND.Trim() -split "\s+", 2
$sshHost = if ($sshParts[0] -eq "ssh") { $sshParts[1] } else { $sshParts[0] }
if (-not $sshHost) {
    Write-Error "Nevaljana SSH komanda: $RENDER_SSH_COMMAND"
    exit 1
}

# Kreiraj SSH komandu s port forwarding
# -L 8025:localhost:8025 = lokalni port 8025 -> remote localhost:8025
# -N = ne izvršavaj remote komandu (samo tunel)
$tunnelCmd = "ssh -L 8025:localhost:8025 -N $sshHost"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Mailpit SSH Tunnel" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Tunel: localhost:8025 -> Mailpit na Renderu" -ForegroundColor Cyan
Write-Host "Web UI: http://localhost:8025" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pokrećem SSH tunel u novom prozoru..." -ForegroundColor Gray
Write-Host "Zatvori taj prozor kad završiš s Mailpitom." -ForegroundColor Gray
Write-Host ""

# Pokreni SSH tunel u novom prozoru (ostaje otvoren dok ga korisnik ne zatvori)
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Write-Host 'SSH Tunnel aktivan - zatvori ovaj prozor da prekineš tunel' -ForegroundColor Green; $tunnelCmd"
)

# Čekaj da se tunel uspostavi
Write-Host "Čekam uspostavu tunela (3 sec)..." -ForegroundColor Gray
Start-Sleep -Seconds 3

# Otvori browser (ako nije --NoBrowser)
if (-not $NoBrowser) {
    Write-Host "Otvaram Mailpit u browseru..." -ForegroundColor Green
    Start-Process "http://localhost:8025"
} else {
    Write-Host "Otvori http://localhost:8025 u browseru" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Tunel radi! Pusti prozor s SSH-om otvoren." -ForegroundColor Green
Write-Host ""
