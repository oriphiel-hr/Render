ALTER TABLE "maticni_change_log"
  ADD COLUMN IF NOT EXISTS "changed_columns" JSONB,
  ADD COLUMN IF NOT EXISTS "field_changes" JSONB;
