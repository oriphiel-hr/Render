-- Tablica očekivanog broja redova po endpointu + snapshot (X-Total-Count s offset=0&limit=0).
-- Pokreti nakon: npx prisma db push ili ručno:
CREATE TABLE IF NOT EXISTS sudreg_expected_counts (
  endpoint   VARCHAR(64) NOT NULL,
  snapshot_id BIGINT NOT NULL,
  total_count BIGINT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (endpoint, snapshot_id)
);
CREATE INDEX IF NOT EXISTS sudreg_expected_counts_snapshot_id_idx ON sudreg_expected_counts(snapshot_id);
