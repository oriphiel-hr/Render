-- Redoslijed stupaca: snapshot_id, mbs (PK zajedno), scn, vrijeme, created_at na kraju
-- Rekreira tablicu s ispravnim redoslijedom i kopira podatke.

BEGIN;

CREATE TABLE IF NOT EXISTS sudreg_promjene_stavke_new (
  snapshot_id BIGINT NOT NULL,
  mbs         BIGINT NOT NULL,
  scn         BIGINT NOT NULL,
  vrijeme     TIMESTAMPTZ(6),
  created_at  TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  PRIMARY KEY (snapshot_id, mbs)
);

INSERT INTO sudreg_promjene_stavke_new (snapshot_id, mbs, scn, vrijeme, created_at)
SELECT snapshot_id, mbs, scn, vrijeme, created_at
FROM sudreg_promjene_stavke;

DROP TABLE sudreg_promjene_stavke;

ALTER TABLE sudreg_promjene_stavke_new RENAME TO sudreg_promjene_stavke;

CREATE INDEX IF NOT EXISTS sudreg_promjene_stavke_snapshot_id_idx ON sudreg_promjene_stavke(snapshot_id);
CREATE INDEX IF NOT EXISTS sudreg_promjene_stavke_scn_idx ON sudreg_promjene_stavke(scn);

COMMIT;
