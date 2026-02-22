-- sudreg_sync_glava: glava za sync po snapshotu i tipu entiteta (promjene, subjekti, …)
CREATE TABLE IF NOT EXISTS "sudreg_sync_glava" (
  "id" BIGSERIAL NOT NULL,
  "snapshot_id" BIGINT NOT NULL,
  "tip_entiteta" VARCHAR(64) NOT NULL,
  "status" VARCHAR(32) NOT NULL DEFAULT 'u_tijeku',
  "expected_count" BIGINT,
  "actual_count" BIGINT,
  "next_offset_to_fetch" BIGINT NULL,
  "vrijeme_pocetka" TIMESTAMPTZ(6),
  "vrijeme_zavrsetka" TIMESTAMPTZ(6),
  "greska" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "sudreg_sync_glava_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "sudreg_sync_glava_snapshot_id_tip_entiteta_key" ON "sudreg_sync_glava"("snapshot_id", "tip_entiteta");
CREATE INDEX IF NOT EXISTS "sudreg_sync_glava_snapshot_id_idx" ON "sudreg_sync_glava"("snapshot_id");

ALTER TABLE "sudreg_sync_glava"
  ADD COLUMN IF NOT EXISTS "next_offset_to_fetch" BIGINT;


-- sudreg_promjene_stavke: stavke promjena po snapshotu (mbs, scn, vrijeme)
CREATE TABLE IF NOT EXISTS "sudreg_promjene_stavke" (
  "snapshot_id" BIGINT NOT NULL,
  "mbs" BIGINT NOT NULL,
  "scn" BIGINT NOT NULL,
  "vrijeme" TIMESTAMPTZ(6),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "sudreg_promjene_stavke_pkey" PRIMARY KEY ("snapshot_id", "mbs")
);

CREATE INDEX IF NOT EXISTS "sudreg_promjene_stavke_snapshot_id_idx" ON "sudreg_promjene_stavke"("snapshot_id");
CREATE INDEX IF NOT EXISTS "sudreg_promjene_stavke_scn_idx" ON "sudreg_promjene_stavke"("scn");
