-- AlterTable UserProfile
ALTER TABLE "UserProfile" ADD COLUMN IF NOT EXISTS "photoVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "UserProfile" ADD COLUMN IF NOT EXISTS "onboardingDone" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable UserAccount
ALTER TABLE "UserAccount" ADD COLUMN IF NOT EXISTS "suspendedAt" TIMESTAMP(3);

-- CreateTable PasswordResetCode
CREATE TABLE IF NOT EXISTS "PasswordResetCode" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PasswordResetCode_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PasswordResetCode_email_createdAt_idx" ON "PasswordResetCode"("email", "createdAt");
CREATE INDEX IF NOT EXISTS "PasswordResetCode_email_code_expiresAt_idx" ON "PasswordResetCode"("email", "code", "expiresAt");

-- CreateTable PairReadState
CREATE TABLE IF NOT EXISTS "PairReadState" (
    "id" TEXT NOT NULL,
    "pairId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "lastReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PairReadState_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PairReadState_pairId_profileId_key" ON "PairReadState"("pairId", "profileId");
CREATE INDEX IF NOT EXISTS "PairReadState_profileId_idx" ON "PairReadState"("profileId");
