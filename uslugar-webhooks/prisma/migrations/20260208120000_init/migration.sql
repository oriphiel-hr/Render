-- CreateEnum
CREATE TYPE "MessageChannel" AS ENUM ('MESSENGER', 'INSTAGRAM', 'WHATSAPP', 'FACEBOOK_PAGE_FEED', 'GENERIC');

-- CreateTable
CREATE TABLE "ChannelMessage" (
    "id" TEXT NOT NULL,
    "channel" "MessageChannel" NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'unknown',
    "externalThreadId" TEXT,
    "externalMessageId" TEXT,
    "direction" TEXT NOT NULL DEFAULT 'inbound',
    "bodyText" TEXT,
    "rawPayload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChannelMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptTemplate" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "channel" "MessageChannel",
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromptTemplate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ChannelMessage_channel_externalMessageId_key" ON "ChannelMessage"("channel", "externalMessageId");

CREATE INDEX "ChannelMessage_channel_externalThreadId_idx" ON "ChannelMessage"("channel", "externalThreadId");

CREATE INDEX "ChannelMessage_channel_createdAt_idx" ON "ChannelMessage"("channel", "createdAt");

CREATE UNIQUE INDEX "PromptTemplate_slug_version_key" ON "PromptTemplate"("slug", "version");

CREATE INDEX "PromptTemplate_slug_isActive_idx" ON "PromptTemplate"("slug", "isActive");
