-- sudreg_djelatnosti_podruznica: zamjena stub sheme punom shemom prema OpenAPI (mbs, podruznica_rbr, djelatnost_rbr, nacionalna_klasifikacija_djelatnosti_id, djelatnost_tekst)
DROP TABLE IF EXISTS "sudreg_djelatnosti_podruznica";

CREATE TABLE "sudreg_djelatnosti_podruznica" (
    "snapshot_id" BIGINT NOT NULL,
    "mbs" BIGINT NOT NULL,
    "podruznica_rbr" INTEGER NOT NULL,
    "djelatnost_rbr" INTEGER NOT NULL,
    "nacionalna_klasifikacija_djelatnosti_id" BIGINT,
    "djelatnost_tekst" VARCHAR(4000),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sudreg_djelatnosti_podruznica_pkey" PRIMARY KEY ("snapshot_id","mbs","podruznica_rbr","djelatnost_rbr")
);

CREATE INDEX "sudreg_djelatnosti_podruznica_snapshot_id_idx" ON "sudreg_djelatnosti_podruznica"("snapshot_id");
