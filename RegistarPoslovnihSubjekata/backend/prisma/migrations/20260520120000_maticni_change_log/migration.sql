-- row_key za jedinstveni matični red (UPDATE umjesto kopije po snimci)
ALTER TABLE "maticni_redovi" ADD COLUMN IF NOT EXISTS "row_key" TEXT NOT NULL DEFAULT '_0';
ALTER TABLE "maticni_redovi" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill row_key iz payload (postojeći redovi)
UPDATE "maticni_redovi"
SET "row_key" = COALESCE(payload->>'row_key', '_0')
WHERE "row_key" = '_0' OR "row_key" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "maticni_redovi_dataset_key_mbs_row_key_key"
  ON "maticni_redovi" ("dataset_key", "mbs", "row_key");

CREATE TABLE IF NOT EXISTS "maticni_change_log" (
  "id" TEXT NOT NULL,
  "snapshot_id_from" INTEGER NOT NULL,
  "snapshot_id_to" INTEGER NOT NULL,
  "dataset_key" TEXT NOT NULL,
  "mbs" INTEGER NOT NULL,
  "row_key" TEXT NOT NULL DEFAULT '_0',
  "operation" TEXT NOT NULL,
  "vrsta" TEXT,
  "payload_before" JSONB,
  "payload_after" JSONB,
  "maticni_red_id" TEXT,
  "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "maticni_change_log_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "maticni_change_log_snapshot_id_to_idx"
  ON "maticni_change_log" ("snapshot_id_to");
CREATE INDEX IF NOT EXISTS "maticni_change_log_snapshot_pair_idx"
  ON "maticni_change_log" ("snapshot_id_from", "snapshot_id_to");
CREATE INDEX IF NOT EXISTS "maticni_change_log_mbs_idx" ON "maticni_change_log" ("mbs");
CREATE INDEX IF NOT EXISTS "maticni_change_log_operation_idx" ON "maticni_change_log" ("operation");
CREATE INDEX IF NOT EXISTS "maticni_change_log_applied_at_idx" ON "maticni_change_log" ("applied_at");
