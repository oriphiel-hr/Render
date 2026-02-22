-- Ensure UNIQUE(snapshot_id) exists (required for Prisma upsert).
-- Deduplicate first in case of duplicate snapshot_id.
DELETE FROM sudreg_promjene a
USING sudreg_promjene b
WHERE a.id > b.id
  AND a.snapshot_id IS NOT NULL
  AND b.snapshot_id IS NOT NULL
  AND a.snapshot_id = b.snapshot_id;

-- Add constraint only if missing (idempotent for manual run on Render).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'sudreg_promjene'::regclass
      AND conname = 'sudreg_promjene_snapshot_id_key'
  ) THEN
    ALTER TABLE sudreg_promjene
      ADD CONSTRAINT sudreg_promjene_snapshot_id_key UNIQUE (snapshot_id);
  END IF;
END $$;
