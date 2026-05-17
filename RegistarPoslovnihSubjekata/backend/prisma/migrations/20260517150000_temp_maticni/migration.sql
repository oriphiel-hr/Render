-- AlterTable
ALTER TABLE "temp_apply_runs" ADD COLUMN "maticniRowCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "temp_maticni" (
    "id" TEXT NOT NULL,
    "applyRunId" TEXT NOT NULL,
    "mbs" INTEGER NOT NULL,
    "datasetKey" TEXT NOT NULL,
    "rowKey" TEXT NOT NULL DEFAULT '_',
    "vrsta" TEXT NOT NULL,
    "snapshotIdFrom" INTEGER NOT NULL,
    "snapshotIdTo" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "temp_maticni_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "temp_maticni_applyRunId_mbs_datasetKey_rowKey_key" ON "temp_maticni"("applyRunId", "mbs", "datasetKey", "rowKey");

-- CreateIndex
CREATE INDEX "temp_maticni_snapshotIdTo_datasetKey_idx" ON "temp_maticni"("snapshotIdTo", "datasetKey");

-- CreateIndex
CREATE INDEX "temp_maticni_mbs_idx" ON "temp_maticni"("mbs");

-- AddForeignKey
ALTER TABLE "temp_maticni" ADD CONSTRAINT "temp_maticni_applyRunId_fkey" FOREIGN KEY ("applyRunId") REFERENCES "temp_apply_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
