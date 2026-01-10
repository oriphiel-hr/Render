# Kako Pronaći Node.js Logs

## Problem
Vidim samo nginx logs, ne Node.js logs.

## Rješenje

### 1. Provjeri SVE log streams u `/ecs/uslugar`

U CloudWatch:
1. Klikni na `/ecs/uslugar` log group
2. Provjeri **SVE log streams** (ne samo najnoviji)
3. Traži log stream koji ima Node.js output

### 2. Traži specifične poruke

U bilo kojem log stream-u traži:
- `🚀 Starting server...`
- `✅ Migrations complete.`
- `🔍 Registering /migration-status-test endpoint`
- `🔍 Admin router loaded`
- `Server running on port`
- `Error`
- `SyntaxError`

### 3. Provjeri da li se aplikacija uopće pokreće

Ako ne vidiš Node.js logs, možda:
- Aplikacija se ne pokreće (greška pri startu)
- Logs se pišu negdje drugdje
- Deployment nije uspješan

### 4. Provjeri ECS Task Status

1. Otvori ECS Console
2. Odaberi cluster `uslugar`
3. Odaberi service `uslugar`
4. Provjeri **Running tasks**
5. Klikni na task → **Logs** tab

### 5. Provjeri da li postoji greška pri startu

Ako se aplikacija ne pokreće, provjeri:
- Da li postoji greška u Dockerfile
- Da li postoji greška u start.sh
- Da li postoji greška u src/server.js

