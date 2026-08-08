-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN "photos" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "UserProfile" ADD COLUMN "planTier" TEXT NOT NULL DEFAULT 'free';
ALTER TABLE "UserProfile" ADD COLUMN "notifyEmail" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "PairMessage" (
    "id" TEXT NOT NULL,
    "pairId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PairMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PairMessage_pairId_createdAt_idx" ON "PairMessage"("pairId", "createdAt");
