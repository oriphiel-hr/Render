-- Kreira view sudreg_promjene_razlike – samo redovi gdje se scn po mbs promijenio.
-- Pokreni ručno: psql $DATABASE_URL -f scripts/create_promjene_razlike_view.sql

CREATE OR REPLACE VIEW sudreg_promjene_razlike AS
SELECT snapshot_id, mbs, scn, vrijeme, prev_snapshot_id, prev_scn, prev_vrijeme, scn_changed
FROM (
  SELECT
    snapshot_id,
    mbs,
    scn,
    vrijeme,
    LAG(snapshot_id) OVER w AS prev_snapshot_id,
    LAG(scn) OVER w AS prev_scn,
    LAG(vrijeme) OVER w AS prev_vrijeme,
    (scn IS DISTINCT FROM LAG(scn) OVER w) AS scn_changed
  FROM sudreg_promjene_stavke
  WINDOW w AS (PARTITION BY mbs ORDER BY snapshot_id)
) sub
WHERE scn_changed = true AND prev_snapshot_id IS NOT NULL;

COMMENT ON VIEW sudreg_promjene_razlike IS 'Razlike po mbs i scn između uzastopnih snapshot_id; scn_changed = true kada je scn drugačiji od prethodnog snapshota.';
