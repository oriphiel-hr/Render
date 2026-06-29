-- Profile tags (public/private) and last activity timestamp.

ALTER TABLE "UserProfile" ADD COLUMN "publicTags" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "UserProfile" ADD COLUMN "privateTags" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "UserProfile" ADD COLUMN "lastActiveAt" TIMESTAMP(3);

UPDATE "UserProfile" SET "lastActiveAt" = "updatedAt" WHERE "lastActiveAt" IS NULL;
