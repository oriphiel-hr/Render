-- CreateTable
CREATE TABLE "staged_snapshots" (
    "id" TEXT NOT NULL,
    "snapshotId" INTEGER NOT NULL,
    "metaJson" JSONB NOT NULL,
    "diskRelPath" TEXT NOT NULL,
    "rowCount" INTEGER NOT NULL DEFAULT 0,
    "savedAt" TIMESTAMP(3) NOT NULL,
    "dbSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staged_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staged_diffs" (
    "id" TEXT NOT NULL,
    "snapshotIdFrom" INTEGER NOT NULL,
    "snapshotIdTo" INTEGER NOT NULL,
    "metaJson" JSONB NOT NULL,
    "diskRelPath" TEXT NOT NULL,
    "diffRowCount" INTEGER NOT NULL DEFAULT 0,
    "savedAt" TIMESTAMP(3) NOT NULL,
    "dbSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staged_diffs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promjene" (
    "id" TEXT NOT NULL,
    "mbs" INTEGER NOT NULL,
    "promjenaId" BIGINT NOT NULL,
    "vrijeme" TIMESTAMP(3) NOT NULL,
    "scn" BIGINT NOT NULL,
    "snapshotId" INTEGER,
    "snapshotIdFrom" INTEGER,
    "snapshotIdTo" INTEGER,
    "vrsta" TEXT,
    "scnStaro" BIGINT,
    "stagedSnapshotId" TEXT,
    "stagedDiffId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promjene_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "staged_snapshots_snapshotId_key" ON "staged_snapshots"("snapshotId");

-- CreateIndex
CREATE UNIQUE INDEX "staged_diffs_snapshotIdFrom_snapshotIdTo_key" ON "staged_diffs"("snapshotIdFrom", "snapshotIdTo");

-- CreateIndex
CREATE UNIQUE INDEX "promjene_snapshotId_promjenaId_key" ON "promjene"("snapshotId", "promjenaId");

-- CreateIndex
CREATE UNIQUE INDEX "promjene_snapshotIdFrom_snapshotIdTo_mbs_key" ON "promjene"("snapshotIdFrom", "snapshotIdTo", "mbs");

-- CreateIndex
CREATE INDEX "promjene_snapshotId_idx" ON "promjene"("snapshotId");

-- CreateIndex
CREATE INDEX "promjene_snapshotIdTo_idx" ON "promjene"("snapshotIdTo");

-- CreateIndex
CREATE INDEX "promjene_mbs_idx" ON "promjene"("mbs");

-- AddForeignKey
ALTER TABLE "promjene" ADD CONSTRAINT "promjene_stagedSnapshotId_fkey" FOREIGN KEY ("stagedSnapshotId") REFERENCES "staged_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promjene" ADD CONSTRAINT "promjene_stagedDiffId_fkey" FOREIGN KEY ("stagedDiffId") REFERENCES "staged_diffs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
