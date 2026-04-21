-- Add SLA collection window fields for competitive offers
ALTER TABLE "Job"
ADD COLUMN "competitiveOfferWindowHours" INTEGER,
ADD COLUMN "offerWindowEndsAt" TIMESTAMP(3);
