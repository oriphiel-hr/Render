-- Prefiks sudreg_sifrarnik_ za šifrarnike (lookup tablice)

ALTER TABLE IF EXISTS sudreg_bris_pravni_oblici RENAME TO sudreg_sifrarnik_bris_pravni_oblici;
ALTER TABLE IF EXISTS sudreg_bris_registri RENAME TO sudreg_sifrarnik_bris_registri;
ALTER TABLE IF EXISTS sudreg_drzave RENAME TO sudreg_sifrarnik_drzave;
ALTER TABLE IF EXISTS sudreg_jezici RENAME TO sudreg_sifrarnik_jezici;
ALTER TABLE IF EXISTS sudreg_nacionalna_klasifikacija_djelatnosti RENAME TO sudreg_sifrarnik_nacionalna_klasifikacija_djelatnosti;
ALTER TABLE IF EXISTS sudreg_statusi RENAME TO sudreg_sifrarnik_statusi;
ALTER TABLE IF EXISTS sudreg_pravni_oblici RENAME TO sudreg_sifrarnik_pravni_oblici;
ALTER TABLE IF EXISTS sudreg_sudovi RENAME TO sudreg_sifrarnik_sudovi;
ALTER TABLE IF EXISTS sudreg_sudovi_deleted RENAME TO sudreg_sifrarnik_sudovi_deleted;
ALTER TABLE IF EXISTS sudreg_valute RENAME TO sudreg_sifrarnik_valute;
ALTER TABLE IF EXISTS sudreg_vrste_gfi_dokumenata RENAME TO sudreg_sifrarnik_vrste_gfi_dokumenata;
ALTER TABLE IF EXISTS sudreg_vrste_postupaka RENAME TO sudreg_sifrarnik_vrste_postupaka;
ALTER TABLE IF EXISTS sudreg_vrste_pravnih_oblika RENAME TO sudreg_sifrarnik_vrste_pravnih_oblika;
