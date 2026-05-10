-- CreateTable
CREATE TABLE "ChannelMessageAttachment" (
    "id" TEXT NOT NULL,
    "channelMessageId" TEXT NOT NULL,
    "kind" TEXT,
    "url" TEXT,
    "name" TEXT,
    "ordinal" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChannelMessageAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChannelMessageAttachment_channelMessageId_idx" ON "ChannelMessageAttachment"("channelMessageId");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelMessageAttachment_channelMessageId_ordinal_key" ON "ChannelMessageAttachment"("channelMessageId", "ordinal");

-- AddForeignKey
ALTER TABLE "ChannelMessageAttachment" ADD CONSTRAINT "ChannelMessageAttachment_channelMessageId_fkey" FOREIGN KEY ("channelMessageId") REFERENCES "ChannelMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
