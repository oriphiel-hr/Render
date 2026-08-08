ALTER TABLE "UserProfile" ADD COLUMN "referralCode" TEXT;
ALTER TABLE "UserProfile" ADD COLUMN "referredByProfileId" TEXT;
CREATE UNIQUE INDEX "UserProfile_referralCode_key" ON "UserProfile"("referralCode");

CREATE TABLE "PairMessageEmailLog" (
    "pairId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "lastSentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PairMessageEmailLog_pkey" PRIMARY KEY ("pairId","profileId")
);
