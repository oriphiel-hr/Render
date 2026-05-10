-- CreateTable
CREATE TABLE "CrmContact" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isLead" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmContact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CrmContact_pageId_idx" ON "CrmContact"("pageId");

-- CreateIndex
CREATE INDEX "CrmContact_userId_idx" ON "CrmContact"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CrmContact_pageId_userId_key" ON "CrmContact"("pageId", "userId");
