# Mailpit Dockerfile za Render Private Service
# Mailpit je lokalni SMTP testing server

FROM axllent/mailpit:latest

# Render postavlja PORT=10000 - Mailpit mora slušati na tom portu za health check
# Inače Render šalje HTTP na SMTP port (1025) -> "500 5.5.2 Syntax error, command unrecognized"
# - 10000 za Web UI i API (Render health check)
# - 1025 za SMTP server (backend šalje mailove)
ENV MP_UI_BIND_ADDR=0.0.0.0:10000
EXPOSE 10000 1025

# Mailpit automatski pokreće oba servisa
# Nema potrebe za CMD - base image već ima ENTRYPOINT

