# Postavi kredencijale za testne korisnike (isti kao "Generiraj testne korisnike" u Adminu).
# Prvo u Adminu klikni "Generiraj testne korisnike", pa pokreni ovu skriptu i zatim npm run screenshots:docs.

$env:BASE_URL = "https://www.uslugar.eu"
$env:OUT_DIR = "C:\GIT_PROJEKTI\Render\Uslugar\frontend\public\docs"

# Lozinka (default u backendu: ScreenshotTest123!)
$pass = "ScreenshotTest123!"

$env:TEST_EMAIL_KORISNIK = "screenshot-korisnik@uslugar.hr"
$env:TEST_PASSWORD_KORISNIK = $pass

$env:TEST_EMAIL_PRUVATELJ = "screenshot-pružatelj@uslugar.hr"
$env:TEST_PASSWORD_PRUVATELJ = $pass

$env:TEST_EMAIL_TIM_CLAN = "screenshot-tim@uslugar.hr"
$env:TEST_PASSWORD_TIM_CLAN = $pass

$env:TEST_EMAIL_DIREKTOR = "screenshot-direktor@uslugar.hr"
$env:TEST_PASSWORD_DIREKTOR = $pass

Write-Host "Env postavljen. Pokreni: npm run screenshots:docs"
