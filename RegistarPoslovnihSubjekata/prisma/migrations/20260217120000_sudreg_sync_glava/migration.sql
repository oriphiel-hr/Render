-- Generička glava za sync po snapshotu i tipu entiteta (subjekti, promjene, …)
CREATE TABLE IF NOT EXISTS "sudreg_sync_glava" (
  "id" BIGSERIAL NOT NULL,
  "snapshot_id" BIGINT NOT NULL,
  "tip_entiteta" VARCHAR(64) NOT NULL,
  "status" VARCHAR(32) NOT NULL DEFAULT 'u_tijeku',
  "expected_count" BIGINT,
  "actual_count" BIGINT,
  "vrijeme_pocetka" TIMESTAMPTZ(6),
  "vrijeme_zavrsetka" TIMESTAMPTZ(6),
  "greska" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "sudreg_sync_glava_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "sudreg_sync_glava_snapshot_id_tip_entiteta_key" ON "sudreg_sync_glava"("snapshot_id", "tip_entiteta");
CREATE INDEX IF NOT EXISTS "sudreg_sync_glava_snapshot_id_idx" ON "sudreg_sync_glava"("snapshot_id");

-- Status i vrijeme završetka na glavi promjena
ALTER TABLE "sudreg_promjene"
  ADD COLUMN IF NOT EXISTS "status" VARCHAR(32),
  ADD COLUMN IF NOT EXISTS "vrijeme_zavrsetka" TIMESTAMPTZ(6);
