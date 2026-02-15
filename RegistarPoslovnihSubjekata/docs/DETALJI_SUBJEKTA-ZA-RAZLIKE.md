# Korištenje /detalji_subjekta za punjenje razlika

## Odgovor na pitanje

**Da.** Prema OpenAPI dokumentaciji možemo koristiti metodu **/detalji_subjekta** da za svaki MBS iz skupa “razlike” dohvatimo sve podatke za tog subjekta i upišemo ih u odgovarajuće tablice.

- List endpointi (`/subjekti`, `/tvrtke`, …) **nemaju** filter po MBS – dohvaćaju se stranice (offset/limit) i kod “samo razlike” trenutno filtriramo **na našoj strani** (uzimamo samo redove čiji je mbs u skupu razlika).
- **/detalji_subjekta** je jedina metoda koja dohvaća podatke **po identifikatoru** (MBS ili OIB), što je idealno za punjenje samo promijenjenih subjekata.

## Parametri (prema dokumentaciji)

| Parametar            | Obavezan | Opis |
|----------------------|----------|------|
| **tip_identifikatora** | Da      | `mbs` ili `oib` – tip identifikatora (u specu je **mbs**, ne "mbo"; MBS = matični broj subjekta u sudskom registru). |
| **identifikator**    | Da       | Vrijednost MBS-a ili OIB-a subjekta. |
| **snapshot_id**      | Ne       | Snapshot seta podataka; ako se ne navede, koristi se najnoviji. Za konzistentan diff sync treba ga navesti. |

Primjer poziva:

```
GET /detalji_subjekta?tip_identifikatora=mbs&identifikator=1234567890&snapshot_id=1090
```

## Što odgovor sadrži (detalji_subjekta_svi)

Jedan poziv vraća **cijeli** agregirani objekt za subjekt (za zadani snapshot). U odgovoru se nalaze i podaci koji u list API-ju idu u zasebne tablice:

- **Korijenski objekt** – polja kao u tablici subjekti (mbs, status, sud_id_nadlezan, oib, datum_osnivanja, …).
- **tvrtka** – podaci za tablicu tvrtke (jedan red po subjektu).
- **skracena_tvrtka** – za skracene_tvrtke.
- **sjediste** – za sjedista (može biti jedan ili više).
- **email_adrese** – za email_adrese.
- **postupak** – za postupci.
- **pravni_oblik**, **pretezita_djelatnost**, **predmeti_poslovanja**, **evidencijske_djelatnosti**, **temeljni_kapitali** – za odgovarajuće tablice.
- **prijevodi_tvrtki**, **prijevodi_skracenih_tvrtki** – za prijevodi tablice.
- **inozemni_registar** – za inozemni_registri.
- **podruznice** – niz; unutra podaci za nazivi_podruznica, sjedista_podruznica, email_adrese_podruznica, djelatnosti_podruznica itd.
- **statusni_postupci**, **objava_priopcenja**, **gfi**, **promjene** – za ostale tablice s MBS-om.

Dakle, **jedan poziv po MBS-u** može poslužiti za upis u sve tablice koje imaju MBO/MBS za tog subjekta.

## Mogući način korištenja za “samo razlike”

1. Odrediti skup MBS-ova koji su se promijenili (npr. iz `promjene_razlike` za stari i novi snapshot).
2. Za svaki MBS iz tog skupa:
   - Pozvati `GET /detalji_subjekta?tip_identifikatora=mbs&identifikator=<MBS>&snapshot_id=<novi_snapshot>`.
   - Iz odgovora (JSON) izvući podatke za:
     - subjekti (korijenski objekt),
     - tvrtke, sjedista, email_adrese, postupci, pravni_oblici, pretezite_djelatnosti, predmeti_poslovanja, evidencijske_djelatnosti, temeljni_kapitali, skracene_tvrtke, prijevodi_tvrtki, prijevodi_skracenih_tvrtki, inozemni_registri, gfi, objave_priopcenja, djelatnosti_podruznica, nazivi_podruznica, sjedista_podruznica, email_adrese_podruznica itd.
   - Za svaku od tih tablica napraviti **upsert** (ili delete za taj snapshot + insert) s `snapshot_id` = `<novi_snapshot>`.

Time se “razlike” ubace u odgovarajuće tablice koristeći isključivo **/detalji_subjekta** (bez list endpointa za te tablice).

## Napomene za implementaciju

- **tip_identifikatora**: u dokumentaciji su dozvoljene vrijednosti **mbs** i **oib**. Za matični broj subjekta (sudski registar) koristi se **mbs** (u govoru se često kaže “MBO”, ali u API-ju je parametar `tip_identifikatora=mbs`).
- **Struktura odgovora**: detalji_subjekta vraća **ugnežđene** objekte (npr. `tvrtka`, `sjediste`, `podruznice`). Potrebno je mapirati ta polja na naše flat tablice i na postojeće `mapRow` / shemu (npr. nazivi polja iz API-ja u naša polja u bazi).
- **Podružnice**: `podruznice` je niz; za svaku podružnicu treba generirati redove u tablicama nazivi_podruznica, sjedista_podruznica, email_adrese_podruznica, djelatnosti_podruznica prema shemi `ds_podruznice_*`.
- **Broj poziva**: jedan zahtjev po MBS-u. Ako je razlika npr. 500 subjekata, to je 500 poziva; treba uvesti rate limiting / pauze ako API to zahtijeva, i eventualno batch paralelizam s ograničenjem.
- **X-Snapshot-Id**: u odgovoru se može koristiti header X-Snapshot-Id ako ne šaljemo `snapshot_id` u queryju; za konzistentan diff bolje je eksplicitno slati `snapshot_id`.

## Sažetak

- **Možemo li koristiti tu metodu da se razlike ubace u odgovarajuće tablice?** **Da** – za svaki MBS iz razlika pozivamo `/detalji_subjekta` s `tip_identifikatora=mbs` i `identifikator=<MBS>` (i po želji `snapshot_id`), pa iz jednog odgovora mapiramo podatke u sve relevantne tablice (subjekti, tvrtke, sjedista, …).
- **tip_identifikatora**: u specu je **mbs** (ili oib); za subjekt iz sudskog registra koristi se **mbs**.
