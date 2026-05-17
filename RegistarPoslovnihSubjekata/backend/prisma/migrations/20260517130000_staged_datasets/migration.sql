-- CreateTable
CREATE TABLE "staged_datasets" (
    "id" TEXT NOT NULL,
    "snapshotId" INTEGER NOT NULL,
    "datasetKey" TEXT NOT NULL,
    "apiPath" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "metaJson" JSONB NOT NULL,
    "diskRelPath" TEXT NOT NULL,
    "rowCount" INTEGER NOT NULL DEFAULT 0,
    "savedAt" TIMESTAMP(3) NOT NULL,
    "dbSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "stagedSnapshotId" TEXT,

    CONSTRAINT "staged_datasets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maticni_redovi" (
    "id" TEXT NOT NULL,
    "snapshotId" INTEGER NOT NULL,
    "datasetKey" TEXT NOT NULL,
    "mbs" INTEGER,
    "payload" JSONB NOT NULL,
    "stagedDatasetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "maticni_redovi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "staged_datasets_snapshotId_datasetKey_key" ON "staged_datasets"("snapshotId", "datasetKey");

-- CreateIndex
CREATE INDEX "staged_datasets_snapshotId_idx" ON "staged_datasets"("snapshotId");

-- CreateIndex
CREATE INDEX "maticni_redovi_snapshotId_datasetKey_idx" ON "maticni_redovi"("snapshotId", "datasetKey");

-- CreateIndex
CREATE INDEX "maticni_redovi_mbs_idx" ON "maticni_redovi"("mbs");

-- AddForeignKey
ALTER TABLE "staged_datasets" ADD CONSTRAINT "staged_datasets_stagedSnapshotId_fkey" FOREIGN KEY ("stagedSnapshotId") REFERENCES "staged_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maticni_redovi" ADD CONSTRAINT "maticni_redovi_stagedDatasetId_fkey" FOREIGN KEY ("stagedDatasetId") REFERENCES "staged_datasets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
