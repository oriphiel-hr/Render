@echo off
REM Import SQL dump to Render.com PostgreSQL

echo ========================================
echo IMPORT BAZE U RENDER.COM
echo ========================================
echo.

cd /d "%~dp0"

REM Check if SQL dump exists
if not exist "backup\uslugar_complete_backup_20260107_232327.sql" (
    echo ❌ SQL dump nije pronadjen!
    echo Kopiraj iz: AWS\uslugar_render\backup\
    pause
    exit /b 1
)

echo ✅ SQL dump pronadjen
echo.

REM Render.com Database URL
set RENDER_DB_URL=postgresql://uslugar_user:Qwvk5j6QpbR8XGO8flXIDeg0GU76xORm@dpg-d5g06gshg0os738en9cg-a.frankfurt-postgres.render.com/uslugar

echo ⚠️  UPOZORENJE: Ovo ce OBRISATI postojece podatke!
echo.
set /p confirm="Nastaviti? (yes/no): "
if /i not "%confirm%"=="yes" (
    echo Import otkazan.
    pause
    exit /b 0
)

echo.
echo 🔍 Testiranje konekcije...
docker run --rm -e PGPASSWORD=Qwvk5j6QpbR8XGO8flXIDeg0GU76xORm postgres:16 psql -h dpg-d5g06gshg0os738en9cg-a.frankfurt-postgres.render.com -p 5432 -U uslugar_user -d uslugar -c "SELECT version();"

if errorlevel 1 (
    echo ❌ Konekcija neuspjesna!
    pause
    exit /b 1
)

echo ✅ Konekcija uspjesna!
echo.
echo 📥 Importiranje SQL dump-a...
echo    Ovo moze potrajati 10-30 minuta...
echo.

REM Copy to temp for Docker
set TEMP_FILE=%TEMP%\render_import_%RANDOM%.sql
copy "backup\uslugar_complete_backup_20260107_232327.sql" "%TEMP_FILE%" >nul

echo    Kopiran u temp: %TEMP_FILE%
echo.
echo 🔄 Pokretanje importa preko Docker-a...
echo.

docker run --rm -v "%TEMP_FILE%:/backup.sql:ro" -e PGPASSWORD=Qwvk5j6QpbR8XGO8flXIDeg0GU76xORm postgres:16 sh -c "psql -h dpg-d5g06gshg0os738en9cg-a.frankfurt-postgres.render.com -p 5432 -U uslugar_user -d uslugar -f /backup.sql"

if errorlevel 1 (
    echo.
    echo ❌ IMPORT NEUSPJESAN!
    del "%TEMP_FILE%" 2>nul
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ IMPORT USPJESAN!
echo ========================================
echo.
echo ✅ Baza uspjesno importirana u Render.com!
echo.
echo 📋 Sljedeci koraci:
echo 1. Provjeri podatke u Render.com PostgreSQL dashboardu
echo 2. Deploy backend na Render.com
echo.

REM Cleanup
del "%TEMP_FILE%" 2>nul

pause

