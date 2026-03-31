-- Add Client and ClientConfiguration models, plus PartnerInquiry -> Client relation.

CREATE TABLE IF NOT EXISTS "Client" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "companyName" TEXT,
  "phone" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ClientConfiguration" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "sourceInquiryId" TEXT,
  "strategySnapshot" JSONB NOT NULL,
  "pricingSnapshot" JSONB,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ClientConfiguration_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "PartnerInquiry"
  ADD COLUMN IF NOT EXISTS "clientId" TEXT;

CREATE INDEX IF NOT EXISTS "Client_email_idx" ON "Client"("email");
CREATE INDEX IF NOT EXISTS "Client_createdAt_idx" ON "Client"("createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "ClientConfiguration_clientId_version_key" ON "ClientConfiguration"("clientId", "version");
CREATE INDEX IF NOT EXISTS "ClientConfiguration_clientId_createdAt_idx" ON "ClientConfiguration"("clientId", "createdAt");
CREATE INDEX IF NOT EXISTS "ClientConfiguration_status_idx" ON "ClientConfiguration"("status");
CREATE INDEX IF NOT EXISTS "PartnerInquiry_clientId_idx" ON "PartnerInquiry"("clientId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'PartnerInquiry_clientId_fkey'
  ) THEN
    ALTER TABLE "PartnerInquiry"
      ADD CONSTRAINT "PartnerInquiry_clientId_fkey"
      FOREIGN KEY ("clientId") REFERENCES "Client"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'ClientConfiguration_clientId_fkey'
  ) THEN
    ALTER TABLE "ClientConfiguration"
      ADD CONSTRAINT "ClientConfiguration_clientId_fkey"
      FOREIGN KEY ("clientId") REFERENCES "Client"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
