-- CreateEnum
CREATE TYPE "AuditCategory" AS ENUM ('ADMIN_ACTION', 'MODERATION', 'SECURITY', 'FEED_RANKING', 'COMPLIANCE');

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "category" "AuditCategory" NOT NULL,
    "action" TEXT NOT NULL,
    "actorProfileId" TEXT,
    "targetProfileId" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "summary" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModerationDecision" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "resolvedByProfileId" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "actionTaken" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModerationDecision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditEvent_category_createdAt_idx" ON "AuditEvent"("category", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_actorProfileId_createdAt_idx" ON "AuditEvent"("actorProfileId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_targetProfileId_createdAt_idx" ON "AuditEvent"("targetProfileId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_entityType_entityId_idx" ON "AuditEvent"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditEvent_createdAt_idx" ON "AuditEvent"("createdAt");

-- CreateIndex
CREATE INDEX "ModerationDecision_reportId_idx" ON "ModerationDecision"("reportId");

-- CreateIndex
CREATE INDEX "ModerationDecision_resolvedByProfileId_createdAt_idx" ON "ModerationDecision"("resolvedByProfileId", "createdAt");

-- CreateIndex
CREATE INDEX "ModerationDecision_createdAt_idx" ON "ModerationDecision"("createdAt");
