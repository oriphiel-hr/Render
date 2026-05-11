-- CreateTable
CREATE TABLE "PendingMessengerSend" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "meta" JSONB,

    CONSTRAINT "PendingMessengerSend_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PendingMessengerSend_status_createdAt_idx" ON "PendingMessengerSend"("status", "createdAt");
