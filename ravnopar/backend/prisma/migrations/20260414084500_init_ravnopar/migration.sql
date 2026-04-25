-- Initial schema for Ravnopar.

CREATE TYPE "ProfileAvailability" AS ENUM ('AVAILABLE', 'FOCUSED_CONTACT', 'PAUSED');
CREATE TYPE "PairStatus" AS ENUM ('ACTIVE', 'CLOSED');
CREATE TYPE "ContactStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'AUTO_CLOSED');
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "ModerationReportStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED');
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE', 'BANK_TRANSFER');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED');

CREATE TABLE "UserProfile" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "age" INTEGER NOT NULL,
  "dateOfBirth" TIMESTAMP(3) NOT NULL,
  "city" TEXT NOT NULL,
  "bio" TEXT,
  "identity" TEXT NOT NULL DEFAULT 'OTHER',
  "profileType" TEXT NOT NULL DEFAULT 'INDIVIDUAL',
  "seekingIdentities" JSONB NOT NULL,
  "seekingProfileTypes" JSONB NOT NULL,
  "intents" JSONB NOT NULL,
  "availability" "ProfileAvailability" NOT NULL DEFAULT 'AVAILABLE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserAccount" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'USER',
  "verifiedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EmailVerificationCode" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmailVerificationCode_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MatchContact" (
  "id" TEXT NOT NULL,
  "requesterId" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "status" "ContactStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MatchContact_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EngagedPair" (
  "id" TEXT NOT NULL,
  "userAId" TEXT NOT NULL,
  "userBId" TEXT NOT NULL,
  "sourceContactId" TEXT,
  "status" "PairStatus" NOT NULL DEFAULT 'ACTIVE',
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endedAt" TIMESTAMP(3),
  "closeReason" TEXT,
  CONSTRAINT "EngagedPair_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserBlock" (
  "id" TEXT NOT NULL,
  "blockerId" TEXT NOT NULL,
  "blockedId" TEXT NOT NULL,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserBlock_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserReport" (
  "id" TEXT NOT NULL,
  "reporterId" TEXT NOT NULL,
  "reportedId" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "details" TEXT,
  "status" "ModerationReportStatus" NOT NULL DEFAULT 'OPEN',
  "priority" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserReport_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserRating" (
  "id" TEXT NOT NULL,
  "fromUserId" TEXT NOT NULL,
  "toUserId" TEXT NOT NULL,
  "score" INTEGER NOT NULL,
  "comment" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserRating_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FairnessConfigChange" (
  "id" TEXT NOT NULL,
  "changedByUserId" TEXT,
  "oldDailyLimit" INTEGER NOT NULL,
  "newDailyLimit" INTEGER NOT NULL,
  "reason" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FairnessConfigChange_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PaymentOrder" (
  "id" TEXT NOT NULL,
  "userProfileId" TEXT NOT NULL,
  "provider" "PaymentProvider" NOT NULL,
  "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "amountCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'EUR',
  "description" TEXT NOT NULL,
  "stripeSessionId" TEXT,
  "bankTransferReference" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PaymentOrder_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserProfile_email_key" ON "UserProfile"("email");
CREATE UNIQUE INDEX "UserAccount_profileId_key" ON "UserAccount"("profileId");
CREATE UNIQUE INDEX "UserBlock_blockerId_blockedId_key" ON "UserBlock"("blockerId", "blockedId");

CREATE INDEX "EmailVerificationCode_email_createdAt_idx" ON "EmailVerificationCode"("email", "createdAt");
CREATE INDEX "EmailVerificationCode_email_code_expiresAt_idx" ON "EmailVerificationCode"("email", "code", "expiresAt");
CREATE INDEX "MatchContact_requesterId_status_createdAt_idx" ON "MatchContact"("requesterId", "status", "createdAt");
CREATE INDEX "MatchContact_targetId_status_createdAt_idx" ON "MatchContact"("targetId", "status", "createdAt");
CREATE INDEX "EngagedPair_status_startedAt_idx" ON "EngagedPair"("status", "startedAt");
CREATE INDEX "EngagedPair_userAId_userBId_status_idx" ON "EngagedPair"("userAId", "userBId", "status");
CREATE INDEX "UserBlock_blockerId_createdAt_idx" ON "UserBlock"("blockerId", "createdAt");
CREATE INDEX "UserReport_status_priority_createdAt_idx" ON "UserReport"("status", "priority", "createdAt");
CREATE INDEX "UserReport_reportedId_createdAt_idx" ON "UserReport"("reportedId", "createdAt");
CREATE INDEX "UserRating_toUserId_createdAt_idx" ON "UserRating"("toUserId", "createdAt");
CREATE INDEX "UserRating_fromUserId_createdAt_idx" ON "UserRating"("fromUserId", "createdAt");
CREATE INDEX "FairnessConfigChange_createdAt_idx" ON "FairnessConfigChange"("createdAt");
CREATE INDEX "PaymentOrder_userProfileId_createdAt_idx" ON "PaymentOrder"("userProfileId", "createdAt");
CREATE INDEX "PaymentOrder_status_createdAt_idx" ON "PaymentOrder"("status", "createdAt");

ALTER TABLE "UserAccount"
  ADD CONSTRAINT "UserAccount_profileId_fkey"
  FOREIGN KEY ("profileId") REFERENCES "UserProfile"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
