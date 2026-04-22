-- Add user soft-block fields for Admin Lite actions
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "isBlocked" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "blockedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "blockedReason" TEXT;

CREATE INDEX IF NOT EXISTS "User_isBlocked_idx" ON "User"("isBlocked");
