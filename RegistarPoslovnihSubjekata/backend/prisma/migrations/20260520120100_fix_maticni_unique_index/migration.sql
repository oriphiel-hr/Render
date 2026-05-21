-- Oporavak ako je 20260520120000 djelomično pao (pogrešan naziv stupca dataset_key)
DROP INDEX IF EXISTS "maticni_redovi_dataset_key_mbs_row_key_key";

CREATE UNIQUE INDEX IF NOT EXISTS "maticni_redovi_datasetKey_mbs_row_key_key"
  ON "maticni_redovi" ("datasetKey", "mbs", "row_key");
