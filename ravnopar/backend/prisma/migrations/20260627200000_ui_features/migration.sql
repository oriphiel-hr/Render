ALTER TABLE "UserProfile" ADD COLUMN "icebreakers" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "PairMessage" ADD COLUMN "reaction" TEXT;
