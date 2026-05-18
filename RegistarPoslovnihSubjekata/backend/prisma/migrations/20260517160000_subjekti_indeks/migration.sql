-- CreateTable
CREATE TABLE "subjekti_indeks" (
    "id" TEXT NOT NULL,
    "snapshotId" INTEGER NOT NULL,
    "mbs" INTEGER NOT NULL,
    "oib" INTEGER,
    "status" INTEGER,
    "naziv" TEXT,
    "skracena_tvrtka" TEXT,
    "vrsta_pravnog_oblika_id" INTEGER,
    "vrsta_pravnog_oblika_sifra" TEXT,
    "vrsta_pravnog_oblika_naziv" TEXT,
    "datum_brisanja" DATE,
    "postupak" TEXT,
    "glavna_djelatnost" TEXT,
    "sud_id_nadlezan" INTEGER,
    "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subjekti_indeks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subjekti_indeks_snapshotId_mbs_key" ON "subjekti_indeks"("snapshotId", "mbs");

-- CreateIndex
CREATE INDEX "subjekti_indeks_snapshotId_status_idx" ON "subjekti_indeks"("snapshotId", "status");

-- CreateIndex
CREATE INDEX "subjekti_indeks_snapshotId_oib_idx" ON "subjekti_indeks"("snapshotId", "oib");

-- CreateIndex
CREATE INDEX "subjekti_indeks_snapshotId_naziv_idx" ON "subjekti_indeks"("snapshotId", "naziv");
