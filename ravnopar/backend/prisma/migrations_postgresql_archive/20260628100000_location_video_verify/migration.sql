ALTER TABLE "UserProfile" ADD COLUMN "latitude" DOUBLE PRECISION;
ALTER TABLE "UserProfile" ADD COLUMN "longitude" DOUBLE PRECISION;
ALTER TABLE "UserProfile" ADD COLUMN "shareLocation" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "UserProfile" ADD COLUMN "videoUrl" TEXT;
ALTER TABLE "UserProfile" ADD COLUMN "verificationSelfie" TEXT;
ALTER TABLE "UserProfile" ADD COLUMN "verificationPending" BOOLEAN NOT NULL DEFAULT false;
