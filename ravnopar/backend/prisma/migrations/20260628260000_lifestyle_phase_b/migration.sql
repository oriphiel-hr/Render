-- Phase B: optional lifestyle fields (children, smoking, relationship status).

ALTER TABLE "UserProfile" ADD COLUMN "childrenPref" TEXT;
ALTER TABLE "UserProfile" ADD COLUMN "smoking" TEXT;
ALTER TABLE "UserProfile" ADD COLUMN "relationshipStatus" TEXT;
