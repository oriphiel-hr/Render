# Start Uslugar Backend Server (Development)
# Za Windows PowerShell

Write-Host "🚀 Pokrećem Uslugar Backend Server..." -ForegroundColor Green

# Postavi environment varijable
$env:NODE_ENV = "development"

# Pokreni server
node src/server.js

