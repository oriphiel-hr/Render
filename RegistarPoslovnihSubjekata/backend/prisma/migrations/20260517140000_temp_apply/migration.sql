-- CreateTable
CREATE TABLE "temp_apply_runs" (
    "id" TEXT NOT NULL,
    "snapshotIdFrom" INTEGER NOT NULL,
    "snapshotIdTo" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "diffRows" INTEGER NOT NULL DEFAULT 0,
    "noviCount" INTEGER NOT NULL DEFAULT 0,
    "promjenaCount" INTEGER NOT NULL DEFAULT 0,
    "neaktivniCount" INTEGER NOT NULL DEFAULT 0,
    "subjektRowCount" INTEGER NOT NULL DEFAULT 0,
    "baselineSource" TEXT,
    "targetSource" TEXT,
    "metaJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "temp_apply_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temp_subjekti" (
    "id" TEXT NOT NULL,
    "applyRunId" TEXT NOT NULL,
    "mbs" INTEGER NOT NULL,
    "vrsta" TEXT NOT NULL,
    "snapshotIdFrom" INTEGER NOT NULL,
    "snapshotIdTo" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "promjenaJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "temp_subjekti_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "temp_apply_runs_snapshotIdFrom_snapshotIdTo_key" ON "temp_apply_runs"("snapshotIdFrom", "snapshotIdTo");

-- CreateIndex
CREATE INDEX "temp_apply_runs_snapshotIdTo_idx" ON "temp_apply_runs"("snapshotIdTo");

-- CreateIndex
CREATE UNIQUE INDEX "temp_subjekti_applyRunId_mbs_key" ON "temp_subjekti"("applyRunId", "mbs");

-- CreateIndex
CREATE INDEX "temp_subjekti_snapshotIdTo_vrsta_idx" ON "temp_subjekti"("snapshotIdTo", "vrsta");

-- CreateIndex
CREATE INDEX "temp_subjekti_mbs_idx" ON "temp_subjekti"("mbs");

-- AddForeignKey
ALTER TABLE "temp_subjekti" ADD CONSTRAINT "temp_subjekti_applyRunId_fkey" FOREIGN KEY ("applyRunId") REFERENCES "temp_apply_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
