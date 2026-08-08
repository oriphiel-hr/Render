-- Strategy features: donations tracking, in-app notifications, push subscriptions

CREATE TYPE "PaymentOrderType" AS ENUM ('DONATION', 'PLAN', 'CUSTOM');

ALTER TABLE "PaymentOrder" ADD COLUMN "orderType" "PaymentOrderType" NOT NULL DEFAULT 'CUSTOM';
ALTER TABLE "PaymentOrder" ADD COLUMN "planId" TEXT;
ALTER TABLE "PaymentOrder" ALTER COLUMN "userProfileId" DROP NOT NULL;

ALTER TABLE "UserProfile" ADD COLUMN "supporterSince" TIMESTAMP(3);
ALTER TABLE "UserProfile" ADD COLUMN "lifetimeDonatedCents" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "UserProfile" ADD COLUMN "donorBadgeVisible" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE "InAppNotification" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "linkPath" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InAppNotification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "InAppNotification_profileId_readAt_createdAt_idx" ON "InAppNotification"("profileId", "readAt", "createdAt");

CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");
CREATE INDEX "PushSubscription_profileId_idx" ON "PushSubscription"("profileId");
