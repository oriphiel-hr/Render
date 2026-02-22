-- Dodaj modified_at (TIMESTAMP WITH TIME ZONE) na tablice koje imaju created_at
-- PostgreSQL ne podržava TIMESTAMPTZ(6); koristi TIMESTAMP WITH TIME ZONE.

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
