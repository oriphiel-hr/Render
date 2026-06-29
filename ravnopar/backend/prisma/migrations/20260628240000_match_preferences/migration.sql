-- Matching preferences: age range, max distance, same-country filter.

ALTER TABLE "UserProfile" ADD COLUMN "seekingAgeMin" INTEGER;
ALTER TABLE "UserProfile" ADD COLUMN "seekingAgeMax" INTEGER;
ALTER TABLE "UserProfile" ADD COLUMN "maxDistanceKm" INTEGER;
ALTER TABLE "UserProfile" ADD COLUMN "sameCountryOnly" BOOLEAN NOT NULL DEFAULT false;

UPDATE "UserProfile"
SET
  "seekingAgeMin" = GREATEST(18, "age" - 7),
  "seekingAgeMax" = LEAST(99, "age" + 7)
WHERE "seekingAgeMin" IS NULL OR "seekingAgeMax" IS NULL;

ALTER TABLE "UserProfile" ALTER COLUMN "seekingAgeMin" SET NOT NULL;
ALTER TABLE "UserProfile" ALTER COLUMN "seekingAgeMin" SET DEFAULT 18;
ALTER TABLE "UserProfile" ALTER COLUMN "seekingAgeMax" SET NOT NULL;
ALTER TABLE "UserProfile" ALTER COLUMN "seekingAgeMax" SET DEFAULT 99;
