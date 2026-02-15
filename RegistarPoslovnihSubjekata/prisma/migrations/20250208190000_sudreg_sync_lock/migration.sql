-- Zaključaj za sync: samo jedan sync odjednom; lock isteče nakon 2 sata.
CREATE TABLE IF NOT EXISTS "sudreg_sync_lock" (
  "id" VARCHAR(32) NOT NULL DEFAULT 'default',
  "locked_at" TIMESTAMP(3),
  "locked_by" VARCHAR(128),

  CONSTRAINT "sudreg_sync_lock_pkey" PRIMARY KEY ("id")
);

INSERT INTO "sudreg_sync_lock" ("id", "locked_at", "locked_by") VALUES ('default', NULL, NULL)
ON CONFLICT ("id") DO NOTHING;
