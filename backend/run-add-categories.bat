@echo off
echo =========================================
echo   ADD NEW CATEGORIES TO USLUGAR DB
echo =========================================
echo.

cd /d "%~dp0"

echo Current directory: %CD%
echo.

echo Setting DATABASE_URL...
set DATABASE_URL=postgres://uslugar_user:Pastor123@uslugar-db.cr80o0eeg3gy.eu-north-1.rds.amazonaws.com:5432/uslugar
echo.

echo Running add-new-categories.js...
node add-new-categories.js

echo.
echo =========================================
echo Done!
echo =========================================
pause
