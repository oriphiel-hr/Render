-- Tablica stanja: trenutni snapshot_id i redni broj synca (ažurira se kad prođe upis).
CREATE TABLE IF NOT EXISTS "sudreg_sync_state" (
  "id" VARCHAR(32) NOT NULL DEFAULT 'default',
  "snapshot_id" BIGINT NOT NULL,
  "redni_broj" INTEGER NOT NULL,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "sudreg_sync_state_pkey" PRIMARY KEY ("id")
);

-- Početni red ako želimo (opcionalno; aplikacija radi upsert).
-- INSERT INTO "sudreg_sync_state" ("id", "snapshot_id", "redni_broj") VALUES ('default', 0, 0) ON CONFLICT ("id") DO NOTHING;
