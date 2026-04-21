-- Add optional cap for number of competitive offers per job
ALTER TABLE "Job"
ADD COLUMN "maxOffers" INTEGER;
