# Usporedba OpenAPI sheme i Prisma tablica

Izvor: `open_api (1)` (Sudski registar API v3.0.4). Tablice se usklađuju s `components.schemas` iz te datoteke.

## Stanje po tablici

| Tablica | OpenAPI schema | Prisma | Napomena |
|---------|----------------|--------|----------|
| **subjekti** | mbs, status, sud_id_nadlezan, sud_id_sluzba, postupak, oib, mb, ino_podruznica, stecajna_masa, likvidacijska_masa, mbs_brisanog_subjekta, glavna_djelatnost, glavna_podruznica_rbr, datum_osnivanja, datum_brisanja, sud_id_brisanja, tvrtka_kod_brisanja, poslovni_broj_brisanja | Nedostaju: sud_id_nadlezan, sud_id_sluzba, mb, stecajna_masa, likvidacijska_masa, mbs_brisanog_subjekta, glavna_djelatnost, glavna_podruznica_rbr, sud_id_brisanja, tvrtka_kod_brisanja, poslovni_broj_brisanja | Dodani u shemu |
| **email_adrese** | mbs, email_adresa_rbr, adresa | redni_broj umjesto email_adresa_rbr | Zamijenjeno redni_broj → email_adresa_rbr |
| **tvrtke** | mbs, ime, naznaka_imena | mbo, ime, naznakaImena | OK (mbo = MBS) |
| **skracene_tvrtke** | mbs, ime | mbo, ime | OK |
| **sjedista** | mbs, drzava_id, sifra_zupanije, naziv_zupanije, sifra_opcine, naziv_opcine, sifra_naselja, naziv_naselja, naselje_van_sifrarnika, sifra_ulice, ulica, kucni_broj, kucni_podbroj, postanski_broj | + redniBroj (nema u API listi) | Ostavljeno |
| **postupci** | mbs, postupak, datum_stecaja | mbo, postupak, datumStecaja | OK |
| **pravni_oblici** | mbs, vrsta_pravnog_oblika_id | mbo, vrstaPravnogOblikaId | OK |
| **pretezite_djelatnosti** | mbs, nacionalna_klasifikacija_djelatnosti_id (required) | + redniBroj, djelatnost_tekst | API nema redni_broj/djelatnost_tekst; ostavljeno |
| **predmeti_poslovanja** | mbs, djelatnost_rbr, nacionalna_klasifikacija_djelatnosti_id, djelatnost_tekst | redniBroj = djelatnost_rbr | Mapiranje u kodu |
| **evidencijske_djelatnosti** | mbs, djelatnost_rbr, nacionalna_klasifikacija_djelatnosti_id, djelatnost_tekst | redniBroj = djelatnost_rbr | Mapiranje u kodu |
| **temeljni_kapitali** | mbs, temeljni_kapital_rbr, valuta_id, iznos | mbo, temeljniKapitalRbr, valutaId, iznos | OK |
| **djelatnosti_podruznica** | mbs, podruznica_rbr, djelatnost_rbr, nacionalna_klasifikacija_djelatnosti_id, djelatnost_tekst | Usklađeno | OK |
| **promjene** (stavke) | mbs, id, vrijeme, scn | PromjeneStavka: snapshot_id, mbs, scn, vrijeme (bez id) | Namjerno po snapshotu |
| **gfi** | mbs, gfi_rbr, vrsta_dokumenta, oznaka_konsolidacije, godina_izvjestaja, datum_dostave, datum_od, datum_do | Stub | Dodana puna shema |
| **objave_priopcenja** | mbs, tekst | Stub | Dodana puna shema |
| **nazivi_podruznica** | mbs, podruznica_rbr, ime, naznaka_imena, postupak, glavna_podruznica | Stub | Dodana puna shema |
| **skraceni_nazivi_podruznica** | mbs, podruznica_rbr, ime | Stub | Dodana puna shema |
| **sjedista_podruznica** | mbs, podruznica_rbr, sifra_zupanije, naziv_zupanije, sifra_opcine, naziv_opcine, sifra_naselja, naziv_naselja, sifra_ulice, ulica, kucni_broj, kucni_podbroj | Stub | Dodana puna shema |
| **email_adrese_podruznica** | mbs, podruznica_rbr, email_adresa_rbr, adresa | Stub | Dodana puna shema |
| **inozemni_registri** | mbs, drzava_id, naziv_registra, registarsko_tijelo, broj_iz_registra, pravni_oblik, bris_registar_identifikator, euid, bris_pravni_oblik_kod | Stub | Dodana puna shema |
| **counts** | table_name, count_aktivni | Stub | Dodana puna shema |
| **bris_pravni_oblici** | bris_kod, kratica, naziv, drzava_id, vrsta_pravnog_oblika_id, status | Stub | Dodana puna shema |
| **bris_registri** | identifikator, naziv, drzava_id, status | Stub | Dodana puna shema |
| **prijevodi_tvrtki** | mbs, prijevod_tvrtke_rbr, ime, jezik_id | Stub | Dodana puna shema |
| **prijevodi_skracenih_tvrtki** | mbs, prijevod_skracene_tvrtke_rbr, ime, jezik_id | Stub | Dodana puna shema |

**Ažurirano:** Stub tablice dopunjene punom OpenAPI shemom: gfi, objave_priopcenja, nazivi_podruznica, skraceni_nazivi_podruznica, sjedista_podruznica, email_adrese_podruznica, inozemni_registri, counts, bris_pravni_oblici, bris_registri, prijevodi_tvrtki, prijevodi_skracenih_tvrtki.

Ostale stub tablice (detalji_subjekta, last_response, last_response_audit, statusi, vrste_gfi_dokumenata, sudovi_deleted, jezici) – nisu list endpointi u OpenAPI ili su posebne; ostavljene kao stub dok nema potrebe za punom shemom.
