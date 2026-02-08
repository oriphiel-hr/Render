# Popravak naziva PDF-ova - sadrzaj verificiran ručno
$base = "C:\GIT_PROJEKTI\Render\Uslugar"
$dir = Get-ChildItem -Path $base -Directory | Where-Object { $_.Name -match "SPECIJALIST" } | Select-Object -First 1 -ExpandProperty FullName
if (-not $dir) { $dir = Join-Path $base "SPECIJALISTIČKI NALAZI I OTPUSNA PISMA" }
Set-Location $dir

# Korak 1: Zamjena Reumatologija <-> Krvna grupa (sadrzaj provjeren)
Rename-Item "2025-04-07_Kristina_Vukojevic_Povijest_bolesti_Reumatologija_PRFR.pdf" "TEMP_swap1.pdf" -Force
Rename-Item "2025-03-10_Kristina_Vukojevic_Krvna_grupa_HZTM.pdf" "2025-04-07_Kristina_Vukojevic_Povijest_bolesti_Reumatologija_PRFR.pdf" -Force
Rename-Item "TEMP_swap1.pdf" "2025-04-04_Kristina_Vukojevic_Krvna_grupa_HZTM.pdf" -Force
Write-Host "Swap 1: Reumatologija <-> Krvna grupa"

# Korak 2: Neurologija Hitna (2025-01-27_KB_Merkur_2 zapravo sadrzi Neurologija Hitna 11.01.2023)
Rename-Item "2025-01-27_Kristina_Vukojevic_Povijest_bolesti_KB_Merkur_2.pdf" "2023-01-11_Kristina_Mesnik_Specijalisticki_pregled_Neurologija_Hitna_KBC_Rijeka_2.pdf" -Force
Write-Host "Fix 2: Neurologija Hitna"

# Korak 3: Nefrologija (2025-03-03_KB_Merkur_4 zapravo sadrzi Nefrologija KBC Rijeka 26.02.2021)
Rename-Item "2025-03-03_Kristina_Vukojevic_Povijest_bolesti_KB_Merkur_4.pdf" "2021-02-26_Kristina_Mesnik_Specijalisticki_pregled_Nefrologija_KBC_Rijeka.pdf" -Force
Write-Host "Fix 3: Nefrologija"

# Korak 4: Mamografija KBC Rijeka (2025-03-31_KB_Merkur_3 zapravo sadrzi Mamografija KBC Rijeka 28.3.2022)
Rename-Item "2025-03-31_Kristina_Vukojevic_Povijest_bolesti_KB_Merkur_3.pdf" "2022-03-28_Kristina_Mesnik_Mamografija_KBC_Rijeka.pdf" -Force
Write-Host "Fix 4: Mamografija KBC Rijeka"

# Korak 5: Zamjena Fonijatrija <-> Kirurgija (2025-03-03_Kirurgija sadrzi Fonijatrija 05.03.2025)
Rename-Item "2025-03-05_Kristina_Vukojevic_Fonijatrija_KBC_Zagreb.pdf" "TEMP_swap2.pdf" -Force
Rename-Item "2025-03-03_Kristina_Vukojevic_Povijest_bolesti_Kirurgija_KB_Merkur.pdf" "2025-03-05_Kristina_Vukojevic_Fonijatrija_KBC_Zagreb.pdf" -Force
Rename-Item "TEMP_swap2.pdf" "2025-03-03_Kristina_Vukojevic_Povijest_bolesti_Kirurgija_KB_Merkur.pdf" -Force
Write-Host "Swap 2: Fonijatrija <-> Kirurgija"

Write-Host "`nPopravak zavrsen."
