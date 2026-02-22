-- Catch-up: redni_broj_u_setu na entitetskim tablicama (ako migracija 20260217300000 nije prošla na produkciji).
ALTER TABLE sudreg_entitet_subjekti ADD COLUMN IF NOT EXISTS redni_broj_u_setu BIGINT;
ALTER TABLE sudreg_entitet_tvrtke ADD COLUMN IF NOT EXISTS redni_broj_u_setu BIGINT;
ALTER TABLE sudreg_entitet_skracene_tvrtke ADD COLUMN IF NOT EXISTS redni_broj_u_setu BIGINT;
ALTER TABLE sudreg_entitet_sjedista ADD COLUMN IF NOT EXISTS redni_broj_u_setu BIGINT;
ALTER TABLE sudreg_entitet_email_adrese ADD COLUMN IF NOT EXISTS redni_broj_u_setu BIGINT;
ALTER TABLE sudreg_entitet_postupci ADD COLUMN IF NOT EXISTS redni_broj_u_setu BIGINT;
ALTER TABLE sudreg_sifrarnik_pravni_oblici ADD COLUMN IF NOT EXISTS redni_broj_u_setu BIGINT;
ALTER TABLE sudreg_entitet_pretezite_djelatnosti ADD COLUMN IF NOT EXISTS redni_broj_u_setu BIGINT;
ALTER TABLE sudreg_entitet_predmeti_poslovanja ADD COLUMN IF NOT EXISTS redni_broj_u_setu BIGINT;
ALTER TABLE sudreg_entitet_evidencijske_djelatnosti ADD COLUMN IF NOT EXISTS redni_broj_u_setu BIGINT;
ALTER TABLE sudreg_entitet_temeljni_kapitali ADD COLUMN IF NOT EXISTS redni_broj_u_setu BIGINT;
