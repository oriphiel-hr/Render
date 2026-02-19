-- Sljedeći offset za chunked sync (limit 1000 po pozivu)
ALTER TABLE sudreg_promjene
  ADD COLUMN IF NOT EXISTS next_offset_to_fetch BIGINT;
