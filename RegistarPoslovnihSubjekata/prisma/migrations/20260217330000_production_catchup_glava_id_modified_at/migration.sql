-- Catch-up: dodaj glava_id i modified_at na produkcijsku bazu ako migracije nisu sve prošle.
-- Idempotentno: ADD COLUMN IF NOT EXISTS, constraint/index samo ako ne postoji.
-- Pokreni: npx prisma db execute --schema prisma/schema.prisma --file prisma/migrations/20260217330000_production_catchup_glava_id_modified_at/migration.sql

-- ---------- glava_id (šifrarnici) ----------
ALTER TABLE sudreg_sifrarnik_bris_pravni_oblici ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_bris_pravni_oblici_glava') THEN ALTER TABLE sudreg_sifrarnik_bris_pravni_oblici ADD CONSTRAINT fk_bris_pravni_oblici_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id); END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_sifrarnik_bris_pravni_oblici_glava_id_idx ON sudreg_sifrarnik_bris_pravni_oblici(glava_id);

ALTER TABLE sudreg_sifrarnik_bris_registri ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_bris_registri_glava') THEN ALTER TABLE sudreg_sifrarnik_bris_registri ADD CONSTRAINT fk_bris_registri_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id); END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_sifrarnik_bris_registri_glava_id_idx ON sudreg_sifrarnik_bris_registri(glava_id);

ALTER TABLE sudreg_sifrarnik_drzave ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_drzave_glava') THEN ALTER TABLE sudreg_sifrarnik_drzave ADD CONSTRAINT fk_drzave_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id); END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_sifrarnik_drzave_glava_id_idx ON sudreg_sifrarnik_drzave(glava_id);

ALTER TABLE sudreg_sifrarnik_nacionalna_klasifikacija_djelatnosti ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_nacionalna_klasifikacija_djelatnosti_glava') THEN ALTER TABLE sudreg_sifrarnik_nacionalna_klasifikacija_djelatnosti ADD CONSTRAINT fk_nacionalna_klasifikacija_djelatnosti_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id); END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_sifrarnik_nacionalna_klasifikacija_djelatnosti_glava_id_idx ON sudreg_sifrarnik_nacionalna_klasifikacija_djelatnosti(glava_id);

ALTER TABLE sudreg_sifrarnik_sudovi ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_sudovi_glava') THEN ALTER TABLE sudreg_sifrarnik_sudovi ADD CONSTRAINT fk_sudovi_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id); END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_sifrarnik_sudovi_glava_id_idx ON sudreg_sifrarnik_sudovi(glava_id);

ALTER TABLE sudreg_sifrarnik_valute ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_valute_glava') THEN ALTER TABLE sudreg_sifrarnik_valute ADD CONSTRAINT fk_valute_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id); END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_sifrarnik_valute_glava_id_idx ON sudreg_sifrarnik_valute(glava_id);

ALTER TABLE sudreg_sifrarnik_vrste_postupaka ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_vrste_postupaka_glava') THEN ALTER TABLE sudreg_sifrarnik_vrste_postupaka ADD CONSTRAINT fk_vrste_postupaka_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id); END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_sifrarnik_vrste_postupaka_glava_id_idx ON sudreg_sifrarnik_vrste_postupaka(glava_id);

ALTER TABLE sudreg_sifrarnik_vrste_pravnih_oblika ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_vrste_pravnih_oblika_glava') THEN ALTER TABLE sudreg_sifrarnik_vrste_pravnih_oblika ADD CONSTRAINT fk_vrste_pravnih_oblika_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id); END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_sifrarnik_vrste_pravnih_oblika_glava_id_idx ON sudreg_sifrarnik_vrste_pravnih_oblika(glava_id);

-- ---------- glava_id (entitet + ostali šifrarnici) ----------
ALTER TABLE sudreg_entitet_counts ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_counts_glava') THEN ALTER TABLE sudreg_entitet_counts ADD CONSTRAINT fk_counts_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id); END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_entitet_counts_glava_id_idx ON sudreg_entitet_counts(glava_id);

ALTER TABLE sudreg_entitet_detalji_subjekta ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_detalji_subjekta_glava') THEN ALTER TABLE sudreg_entitet_detalji_subjekta ADD CONSTRAINT fk_detalji_subjekta_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id); END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_entitet_detalji_subjekta_glava_id_idx ON sudreg_entitet_detalji_subjekta(glava_id);

ALTER TABLE sudreg_entitet_subjekti ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_subjekti_glava') THEN ALTER TABLE sudreg_entitet_subjekti ADD CONSTRAINT fk_subjekti_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id); END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_entitet_subjekti_glava_id_idx ON sudreg_entitet_subjekti(glava_id);

ALTER TABLE sudreg_entitet_djelatnosti_podruznica ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_djelatnosti_podruznica_glava') THEN ALTER TABLE sudreg_entitet_djelatnosti_podruznica ADD CONSTRAINT fk_djelatnosti_podruznica_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id); END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_entitet_djelatnosti_podruznica_glava_id_idx ON sudreg_entitet_djelatnosti_podruznica(glava_id);

ALTER TABLE sudreg_entitet_email_adrese ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_email_adrese_glava') THEN ALTER TABLE sudreg_entitet_email_adrese ADD CONSTRAINT fk_email_adrese_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id); END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_entitet_email_adrese_glava_id_idx ON sudreg_entitet_email_adrese(glava_id);

ALTER TABLE sudreg_entitet_email_adrese_podruznica ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_email_adrese_podruznica_glava') THEN ALTER TABLE sudreg_entitet_email_adrese_podruznica ADD CONSTRAINT fk_email_adrese_podruznica_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id); END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_entitet_email_adrese_podruznica_glava_id_idx ON sudreg_entitet_email_adrese_podruznica(glava_id);

ALTER TABLE sudreg_entitet_evidencijske_djelatnosti ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_evidencijske_djelatnosti_glava') THEN ALTER TABLE sudreg_entitet_evidencijske_djelatnosti ADD CONSTRAINT fk_evidencijske_djelatnosti_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id); END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_entitet_evidencijske_djelatnosti_glava_id_idx ON sudreg_entitet_evidencijske_djelatnosti(glava_id);

ALTER TABLE sudreg_entitet_gfi ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_gfi_glava') THEN ALTER TABLE sudreg_entitet_gfi ADD CONSTRAINT fk_gfi_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id); END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_entitet_gfi_glava_id_idx ON sudreg_entitet_gfi(glava_id);

ALTER TABLE sudreg_entitet_inozemni_registri ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_inozemni_registri_glava') THEN ALTER TABLE sudreg_entitet_inozemni_registri ADD CONSTRAINT fk_inozemni_registri_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id); END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_entitet_inozemni_registri_glava_id_idx ON sudreg_entitet_inozemni_registri(glava_id);

ALTER TABLE sudreg_entitet_nazivi_podruznica ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_nazivi_podruznica_glava') THEN ALTER TABLE sudreg_entitet_nazivi_podruznica ADD CONSTRAINT fk_nazivi_podruznica_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id); END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_entitet_nazivi_podruznica_glava_id_idx ON sudreg_entitet_nazivi_podruznica(glava_id);

ALTER TABLE sudreg_entitet_objave_priopcenja ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_objave_priopcenja_glava') THEN ALTER TABLE sudreg_entitet_objave_priopcenja ADD CONSTRAINT fk_objave_priopcenja_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id); END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_entitet_objave_priopcenja_glava_id_idx ON sudreg_entitet_objave_priopcenja(glava_id);

ALTER TABLE sudreg_entitet_postupci ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_postupci_glava') THEN ALTER TABLE sudreg_entitet_postupci ADD CONSTRAINT fk_postupci_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id); END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_entitet_postupci_glava_id_idx ON sudreg_entitet_postupci(glava_id);

ALTER TABLE sudreg_entitet_predmeti_poslovanja ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_predmeti_poslovanja_glava') THEN ALTER TABLE sudreg_entitet_predmeti_poslovanja ADD CONSTRAINT fk_predmeti_poslovanja_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id); END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_entitet_predmeti_poslovanja_glava_id_idx ON sudreg_entitet_predmeti_poslovanja(glava_id);

ALTER TABLE sudreg_entitet_pretezite_djelatnosti ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_pretezite_djelatnosti_glava') THEN ALTER TABLE sudreg_entitet_pretezite_djelatnosti ADD CONSTRAINT fk_pretezite_djelatnosti_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id); END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_entitet_pretezite_djelatnosti_glava_id_idx ON sudreg_entitet_pretezite_djelatnosti(glava_id);

ALTER TABLE sudreg_entitet_prijevodi_skracenih_tvrtki ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_prijevodi_skracenih_tvrtki_glava') THEN ALTER TABLE sudreg_entitet_prijevodi_skracenih_tvrtki ADD CONSTRAINT fk_prijevodi_skracenih_tvrtki_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id); END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_entitet_prijevodi_skracenih_tvrtki_glava_id_idx ON sudreg_entitet_prijevodi_skracenih_tvrtki(glava_id);

ALTER TABLE sudreg_entitet_prijevodi_tvrtki ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_prijevodi_tvrtki_glava') THEN ALTER TABLE sudreg_entitet_prijevodi_tvrtki ADD CONSTRAINT fk_prijevodi_tvrtki_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id); END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_entitet_prijevodi_tvrtki_glava_id_idx ON sudreg_entitet_prijevodi_tvrtki(glava_id);

ALTER TABLE sudreg_entitet_sjedista ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_sjedista_glava') THEN ALTER TABLE sudreg_entitet_sjedista ADD CONSTRAINT fk_sjedista_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id); END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_entitet_sjedista_glava_id_idx ON sudreg_entitet_sjedista(glava_id);

ALTER TABLE sudreg_entitet_sjedista_podruznica ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_sjedista_podruznica_glava') THEN ALTER TABLE sudreg_entitet_sjedista_podruznica ADD CONSTRAINT fk_sjedista_podruznica_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id); END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_entitet_sjedista_podruznica_glava_id_idx ON sudreg_entitet_sjedista_podruznica(glava_id);

ALTER TABLE sudreg_entitet_skracene_tvrtke ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_skracene_tvrtke_glava') THEN ALTER TABLE sudreg_entitet_skracene_tvrtke ADD CONSTRAINT fk_skracene_tvrtke_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id); END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_entitet_skracene_tvrtke_glava_id_idx ON sudreg_entitet_skracene_tvrtke(glava_id);

ALTER TABLE sudreg_entitet_skraceni_nazivi_podruznica ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_skraceni_nazivi_podruznica_glava') THEN ALTER TABLE sudreg_entitet_skraceni_nazivi_podruznica ADD CONSTRAINT fk_skraceni_nazivi_podruznica_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id); END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_entitet_skraceni_nazivi_podruznica_glava_id_idx ON sudreg_entitet_skraceni_nazivi_podruznica(glava_id);

ALTER TABLE sudreg_entitet_temeljni_kapitali ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_temeljni_kapitali_glava') THEN ALTER TABLE sudreg_entitet_temeljni_kapitali ADD CONSTRAINT fk_temeljni_kapitali_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id); END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_entitet_temeljni_kapitali_glava_id_idx ON sudreg_entitet_temeljni_kapitali(glava_id);

ALTER TABLE sudreg_entitet_tvrtke ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_tvrtke_glava') THEN ALTER TABLE sudreg_entitet_tvrtke ADD CONSTRAINT fk_tvrtke_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id); END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_entitet_tvrtke_glava_id_idx ON sudreg_entitet_tvrtke(glava_id);

ALTER TABLE sudreg_sifrarnik_pravni_oblici ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_pravni_oblici_glava') THEN ALTER TABLE sudreg_sifrarnik_pravni_oblici ADD CONSTRAINT fk_pravni_oblici_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id); END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_sifrarnik_pravni_oblici_glava_id_idx ON sudreg_sifrarnik_pravni_oblici(glava_id);

ALTER TABLE sudreg_sifrarnik_jezici ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_jezici_glava') THEN ALTER TABLE sudreg_sifrarnik_jezici ADD CONSTRAINT fk_jezici_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id); END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_sifrarnik_jezici_glava_id_idx ON sudreg_sifrarnik_jezici(glava_id);

ALTER TABLE sudreg_sifrarnik_statusi ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_statusi_glava') THEN ALTER TABLE sudreg_sifrarnik_statusi ADD CONSTRAINT fk_statusi_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id); END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_sifrarnik_statusi_glava_id_idx ON sudreg_sifrarnik_statusi(glava_id);

ALTER TABLE sudreg_sifrarnik_sudovi_deleted ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_sudovi_deleted_glava') THEN ALTER TABLE sudreg_sifrarnik_sudovi_deleted ADD CONSTRAINT fk_sudovi_deleted_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id); END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_sifrarnik_sudovi_deleted_glava_id_idx ON sudreg_sifrarnik_sudovi_deleted(glava_id);

ALTER TABLE sudreg_sifrarnik_vrste_gfi_dokumenata ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_vrste_gfi_dokumenata_glava') THEN ALTER TABLE sudreg_sifrarnik_vrste_gfi_dokumenata ADD CONSTRAINT fk_vrste_gfi_dokumenata_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id); END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_sifrarnik_vrste_gfi_dokumenata_glava_id_idx ON sudreg_sifrarnik_vrste_gfi_dokumenata(glava_id);

-- ---------- modified_at (sve tablice iz add_modified_at) ----------
ALTER TABLE sudreg_sifrarnik_bris_pravni_oblici ADD COLUMN IF NOT EXISTS modified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE sudreg_sifrarnik_bris_registri ADD COLUMN IF NOT EXISTS modified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE sudreg_entitet_counts ADD COLUMN IF NOT EXISTS modified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE sudreg_entitet_djelatnosti_podruznica ADD COLUMN IF NOT EXISTS modified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE sudreg_entitet_email_adrese_podruznica ADD COLUMN IF NOT EXISTS modified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE sudreg_entitet_gfi ADD COLUMN IF NOT EXISTS modified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE sudreg_entitet_inozemni_registri ADD COLUMN IF NOT EXISTS modified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE sudreg_entitet_nazivi_podruznica ADD COLUMN IF NOT EXISTS modified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE sudreg_entitet_objave_priopcenja ADD COLUMN IF NOT EXISTS modified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE sudreg_entitet_prijevodi_skracenih_tvrtki ADD COLUMN IF NOT EXISTS modified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE sudreg_entitet_prijevodi_tvrtki ADD COLUMN IF NOT EXISTS modified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE sudreg_entitet_sjedista_podruznica ADD COLUMN IF NOT EXISTS modified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE sudreg_entitet_skraceni_nazivi_podruznica ADD COLUMN IF NOT EXISTS modified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE rps_sudreg_api_request_log ADD COLUMN IF NOT EXISTS modified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE rps_sudreg_expected_counts ADD COLUMN IF NOT EXISTS modified_at TIMESTAMP WITH TIME ZONE;
