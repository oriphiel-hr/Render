-- Deduplicate sudreg_promjene by snapshot_id (keep one row per snapshot_id)
DELETE FROM sudreg_promjene a
USING sudreg_promjene b
WHERE a.id > b.id
  AND a.snapshot_id IS NOT NULL
  AND b.snapshot_id IS NOT NULL
  AND a.snapshot_id = b.snapshot_id;

-- Audit synca: koliko je trebalo biti učitano, koliko je učitano
ALTER TABLE sudreg_promjene
  ADD COLUMN IF NOT EXISTS expected_count BIGINT,
  ADD COLUMN IF NOT EXISTS total_loaded BIGINT;

-- Unique constraint so stavke can reference promjene(snapshot_id)
ALTER TABLE sudreg_promjene
  ADD CONSTRAINT sudreg_promjene_snapshot_id_key UNIQUE (snapshot_id);

-- Ensure every snapshot_id in stavke exists in promjene (referencijalni integritet)
INSERT INTO sudreg_promjene (snapshot_id, updated_at)
SELECT DISTINCT s.snapshot_id, NOW()
FROM sudreg_promjene_stavke s
WHERE NOT EXISTS (SELECT 1 FROM sudreg_promjene p WHERE p.snapshot_id = s.snapshot_id);

-- Strani ključ: sudreg_promjene_stavke.snapshot_id -> sudreg_promjene.snapshot_id
ALTER TABLE sudreg_promjene_stavke
  ADD CONSTRAINT sudreg_promjene_stavke_snapshot_id_fkey
  FOREIGN KEY (snapshot_id) REFERENCES sudreg_promjene(snapshot_id);
