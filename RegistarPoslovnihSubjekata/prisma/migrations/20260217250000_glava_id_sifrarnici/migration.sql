-- Strani ključ glava_id na šifrarnik tablice (referencira rps_sudreg_sync_glava)
-- Idempotentno: ADD COLUMN IF NOT EXISTS, constraint samo ako ne postoji.

ALTER TABLE sudreg_sifrarnik_bris_pravni_oblici ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_bris_pravni_oblici_glava') THEN
    ALTER TABLE sudreg_sifrarnik_bris_pravni_oblici ADD CONSTRAINT fk_bris_pravni_oblici_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id);
  END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_sifrarnik_bris_pravni_oblici_glava_id_idx ON sudreg_sifrarnik_bris_pravni_oblici(glava_id);

ALTER TABLE sudreg_sifrarnik_bris_registri ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_bris_registri_glava') THEN
    ALTER TABLE sudreg_sifrarnik_bris_registri ADD CONSTRAINT fk_bris_registri_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id);
  END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_sifrarnik_bris_registri_glava_id_idx ON sudreg_sifrarnik_bris_registri(glava_id);

ALTER TABLE sudreg_sifrarnik_drzave ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_drzave_glava') THEN
    ALTER TABLE sudreg_sifrarnik_drzave ADD CONSTRAINT fk_drzave_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id);
  END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_sifrarnik_drzave_glava_id_idx ON sudreg_sifrarnik_drzave(glava_id);

ALTER TABLE sudreg_sifrarnik_nacionalna_klasifikacija_djelatnosti ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_nacionalna_klasifikacija_djelatnosti_glava') THEN
    ALTER TABLE sudreg_sifrarnik_nacionalna_klasifikacija_djelatnosti ADD CONSTRAINT fk_nacionalna_klasifikacija_djelatnosti_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id);
  END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_sifrarnik_nacionalna_klasifikacija_djelatnosti_glava_id_idx ON sudreg_sifrarnik_nacionalna_klasifikacija_djelatnosti(glava_id);

ALTER TABLE sudreg_sifrarnik_sudovi ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_sudovi_glava') THEN
    ALTER TABLE sudreg_sifrarnik_sudovi ADD CONSTRAINT fk_sudovi_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id);
  END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_sifrarnik_sudovi_glava_id_idx ON sudreg_sifrarnik_sudovi(glava_id);

ALTER TABLE sudreg_sifrarnik_valute ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_valute_glava') THEN
    ALTER TABLE sudreg_sifrarnik_valute ADD CONSTRAINT fk_valute_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id);
  END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_sifrarnik_valute_glava_id_idx ON sudreg_sifrarnik_valute(glava_id);

ALTER TABLE sudreg_sifrarnik_vrste_postupaka ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_vrste_postupaka_glava') THEN
    ALTER TABLE sudreg_sifrarnik_vrste_postupaka ADD CONSTRAINT fk_vrste_postupaka_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id);
  END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_sifrarnik_vrste_postupaka_glava_id_idx ON sudreg_sifrarnik_vrste_postupaka(glava_id);

ALTER TABLE sudreg_sifrarnik_vrste_pravnih_oblika ADD COLUMN IF NOT EXISTS glava_id BIGINT;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_vrste_pravnih_oblika_glava') THEN
    ALTER TABLE sudreg_sifrarnik_vrste_pravnih_oblika ADD CONSTRAINT fk_vrste_pravnih_oblika_glava FOREIGN KEY (glava_id) REFERENCES rps_sudreg_sync_glava(rps_sudreg_sync_glava_id);
  END IF; END $$;
CREATE INDEX IF NOT EXISTS sudreg_sifrarnik_vrste_pravnih_oblika_glava_id_idx ON sudreg_sifrarnik_vrste_pravnih_oblika(glava_id);
