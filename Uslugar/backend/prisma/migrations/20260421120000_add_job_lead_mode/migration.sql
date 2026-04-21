-- Add lead distribution mode for jobs (exclusive vs competitive offers)
CREATE TYPE "LeadMode" AS ENUM ('EXCLUSIVE', 'COMPETITIVE');

ALTER TABLE "Job"
ADD COLUMN "leadMode" "LeadMode" NOT NULL DEFAULT 'EXCLUSIVE';
