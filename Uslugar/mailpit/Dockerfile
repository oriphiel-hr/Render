# Mailpit Dockerfile za Render Private Service
# Mailpit je lokalni SMTP testing server

FROM axllent/mailpit:latest

# Mailpit koristi portove:
# - 8025 za Web UI i API
# - 1025 za SMTP server
EXPOSE 8025 1025

# Mailpit automatski pokreće oba servisa
# Nema potrebe za CMD - base image već ima ENTRYPOINT

