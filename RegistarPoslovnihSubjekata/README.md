# RegistarPoslovnihSubjekata

Zajednička baza i API za pretragu tvrtki, obrta i OPG-ova – agregirani podaci iz javnih registara (FINA, sudski registar, obrtni registar, itd.) na jednom mjestu.

Koristi ga više projekata (npr. CRM, evidencija za obrte) preko istog API-ja – brza pretraga bez poziva na više izvora.

## Status

Projekt u pripremi.

## Plan

- Baza: agregirani podaci (tvrtke, obrti, OPG-ovi)
- API: pretraga po OIB, naziv, adresa
- ETL/job: povlačenje i ažuriranje iz registara (prema uvjetima korištenja izvora)
- Potrošači: drugi projekti (Uslugar, CRM, itd.) koriste isti API
