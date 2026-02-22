-- Uklanjanje tablice sudreg_promjene; stanje synca samo u sudreg_sync_glava.

-- Strani ključ stavki na glavu (ako postoji)
ALTER TABLE sudreg_promjene_stavke
  DROP CONSTRAINT IF EXISTS sudreg_promjene_stavke_snapshot_id_fkey;

-- Sljedeći offset za chunked sync u glavi
ALTER TABLE sudreg_sync_glava
  ADD COLUMN IF NOT EXISTS next_offset_to_fetch BIGINT;

-- Ukloni staru glavu promjena
DROP TABLE IF EXISTS sudreg_promjene;
