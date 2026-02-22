# Cron (Render) – expected counts + sync promjene

Render **Cron Job** radi u minimalnom okruženju (nema `node`, `wget` nema HTTPS).  
Koristi **jedan** vanjski cron poziv na **cron_daily**.

## Jedan job: expected counts + upis u promjene

Endpoint **POST /api/sudreg_cron_daily** u jednom pozivu:

1. pokreće **expected counts** (kao POST bez parametra),
2. zatim **sync_promjene** u petlji dok sve stavke nisu učitane.

Na **cron-job.org** stavi **jedan** cron job koji poziva taj URL.

### Korak po korak (cron-job.org)

1. Otvori **[cron-job.org](https://cron-job.org)** i prijavi se.
2. **Create Cronjob** (ili Dashboard → Create).
3. Ispuni:
   - **Title:** npr. `Registar – daily (expected counts + promjene)`
   - **URL:**  
     `https://registar-poslovnih-subjekata.onrender.com/api/sudreg_cron_daily`
   - **Schedule:** npr. jednom dnevno (Daily) ili `0 2 * * *` (02:00).
   - **Request Method:** **POST**.
   - **Request Headers:** jedan red:
     - **Name:** `X-API-Key`  
     - **Value:** `<tvoja SUDREG_WRITE_API_KEY>` (isti ključ kao u Renderu)
4. Spremi.

Jedan poziv = prvo expected counts, pa automatski cijeli sync promjena (više chunkova u jednoj petlji na serveru).  
*(Uptime Robot besplatno ne podržava POST s custom headerima – to je Pro značajka.)*

---

## Samo expected counts (bez promjena)

Ako želiš samo napuniti expected counts bez sync_promjene, koristi URL  
`https://registar-poslovnih-subjekata.onrender.com/api/sudreg_expected_counts` (POST, isti header).

---

Skripta `cron-expected-counts.sh` služi za lokalno pokretanje; na Renderu se ne koristi.
