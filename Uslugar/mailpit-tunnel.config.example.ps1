# Mailpit Tunnel - Primjer konfiguracije
# Kopiraj ovu datoteku kao mailpit-tunnel.config.ps1 i uredi vrijednost ispod.

# Render Dashboard → Mailpit servis → Connect → SSH tab
# Zalijepi cijelu SSH komandu (bez ssh na početku ili s njim - skripta će izvući host)
$RENDER_SSH_COMMAND = "ssh srv-XXXXX@ssh.frankfurt.render.com"

# Primjer za Frankfurt region:
# $RENDER_SSH_COMMAND = "ssh srv-abc123xyz@ssh.frankfurt.render.com"

# Primjer za Oregon region:
# $RENDER_SSH_COMMAND = "ssh srv-abc123xyz@ssh.oregon.render.com"
