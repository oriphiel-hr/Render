-- Stub tablice zamijenjene punom OpenAPI shemom (gfi, objave_priopcenja, nazivi_podruznica, skraceni_nazivi_podruznica, sjedista_podruznica, email_adrese_podruznica, inozemni_registri, counts, bris_pravni_oblici, bris_registri, prijevodi_tvrtki, prijevodi_skracenih_tvrtki)

DROP TABLE IF EXISTS "sudreg_gfi";
CREATE TABLE "sudreg_gfi" (
  "snapshot_id" BIGINT NOT NULL,
  "mbs" BIGINT NOT NULL,
  "gfi_rbr" BIGINT NOT NULL,
  "vrsta_dokumenta" INTEGER NOT NULL,
  "oznaka_konsolidacije" INTEGER NOT NULL,
  "godina_izvjestaja" INTEGER NOT NULL,
  "datum_dostave" DATE NOT NULL,
  "datum_od" DATE NOT NULL,
  "datum_do" DATE NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("snapshot_id","mbs","gfi_rbr")
);
CREATE INDEX "sudreg_gfi_snapshot_id_idx" ON "sudreg_gfi"("snapshot_id");

DROP TABLE IF EXISTS "sudreg_objave_priopcenja";
CREATE TABLE "sudreg_objave_priopcenja" (
  "snapshot_id" BIGINT NOT NULL,
  "mbs" BIGINT NOT NULL,
  "tekst" VARCHAR(2000) NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("snapshot_id","mbs","tekst")
);
CREATE INDEX "sudreg_objave_priopcenja_snapshot_id_idx" ON "sudreg_objave_priopcenja"("snapshot_id");

DROP TABLE IF EXISTS "sudreg_nazivi_podruznica";
CREATE TABLE "sudreg_nazivi_podruznica" (
  "snapshot_id" BIGINT NOT NULL,
  "mbs" BIGINT NOT NULL,
  "podruznica_rbr" INTEGER NOT NULL,
  "ime" VARCHAR(1024) NOT NULL,
  "naznaka_imena" VARCHAR(128),
  "postupak" INTEGER NOT NULL,
  "glavna_podruznica" INTEGER NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("snapshot_id","mbs","podruznica_rbr")
);
CREATE INDEX "sudreg_nazivi_podruznica_snapshot_id_idx" ON "sudreg_nazivi_podruznica"("snapshot_id");

DROP TABLE IF EXISTS "sudreg_skraceni_nazivi_podruznica";
CREATE TABLE "sudreg_skraceni_nazivi_podruznica" (
  "snapshot_id" BIGINT NOT NULL,
  "mbs" BIGINT NOT NULL,
  "podruznica_rbr" INTEGER NOT NULL,
  "ime" VARCHAR(512) NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("snapshot_id","mbs","podruznica_rbr")
);
CREATE INDEX "sudreg_skraceni_nazivi_podruznica_snapshot_id_idx" ON "sudreg_skraceni_nazivi_podruznica"("snapshot_id");

DROP TABLE IF EXISTS "sudreg_sjedista_podruznica";
CREATE TABLE "sudreg_sjedista_podruznica" (
  "snapshot_id" BIGINT NOT NULL,
  "mbs" BIGINT NOT NULL,
  "podruznica_rbr" INTEGER NOT NULL,
  "sifra_zupanije" INTEGER NOT NULL,
  "naziv_zupanije" VARCHAR(128) NOT NULL,
  "sifra_opcine" INTEGER NOT NULL,
  "naziv_opcine" VARCHAR(128) NOT NULL,
  "sifra_naselja" BIGINT NOT NULL,
  "naziv_naselja" VARCHAR(128) NOT NULL,
  "sifra_ulice" BIGINT,
  "ulica" VARCHAR(512),
  "kucni_broj" INTEGER,
  "kucni_podbroj" VARCHAR(10),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("snapshot_id","mbs","podruznica_rbr")
);
CREATE INDEX "sudreg_sjedista_podruznica_snapshot_id_idx" ON "sudreg_sjedista_podruznica"("snapshot_id");

DROP TABLE IF EXISTS "sudreg_email_adrese_podruznica";
CREATE TABLE "sudreg_email_adrese_podruznica" (
  "snapshot_id" BIGINT NOT NULL,
  "mbs" BIGINT NOT NULL,
  "podruznica_rbr" INTEGER NOT NULL,
  "email_adresa_rbr" INTEGER NOT NULL,
  "adresa" VARCHAR(256) NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("snapshot_id","mbs","podruznica_rbr","email_adresa_rbr")
);
CREATE INDEX "sudreg_email_adrese_podruznica_snapshot_id_idx" ON "sudreg_email_adrese_podruznica"("snapshot_id");

DROP TABLE IF EXISTS "sudreg_inozemni_registri";
CREATE TABLE "sudreg_inozemni_registri" (
  "snapshot_id" BIGINT NOT NULL,
  "mbs" BIGINT NOT NULL,
  "drzava_id" BIGINT NOT NULL,
  "naziv_registra" VARCHAR(128),
  "registarsko_tijelo" VARCHAR(128),
  "broj_iz_registra" VARCHAR(128),
  "pravni_oblik" VARCHAR(200),
  "bris_registar_identifikator" VARCHAR(15),
  "euid" VARCHAR(54),
  "bris_pravni_oblik_kod" VARCHAR(9),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("snapshot_id","mbs","drzava_id")
);
CREATE INDEX "sudreg_inozemni_registri_snapshot_id_idx" ON "sudreg_inozemni_registri"("snapshot_id");

DROP TABLE IF EXISTS "sudreg_counts";
CREATE TABLE "sudreg_counts" (
  "snapshot_id" BIGINT NOT NULL,
  "table_name" VARCHAR(128) NOT NULL,
  "count_aktivni" BIGINT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("snapshot_id","table_name")
);
CREATE INDEX "sudreg_counts_snapshot_id_idx" ON "sudreg_counts"("snapshot_id");

DROP TABLE IF EXISTS "sudreg_bris_pravni_oblici";
CREATE TABLE "sudreg_bris_pravni_oblici" (
  "snapshot_id" BIGINT NOT NULL,
  "bris_kod" VARCHAR(9) NOT NULL,
  "kratica" VARCHAR(130),
  "naziv" VARCHAR(1024) NOT NULL,
  "drzava_id" BIGINT NOT NULL,
  "vrsta_pravnog_oblika_id" BIGINT,
  "status" INTEGER NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("snapshot_id","bris_kod")
);
CREATE INDEX "sudreg_bris_pravni_oblici_snapshot_id_idx" ON "sudreg_bris_pravni_oblici"("snapshot_id");

DROP TABLE IF EXISTS "sudreg_bris_registri";
CREATE TABLE "sudreg_bris_registri" (
  "snapshot_id" BIGINT NOT NULL,
  "identifikator" VARCHAR(15) NOT NULL,
  "naziv" VARCHAR(256) NOT NULL,
  "drzava_id" BIGINT NOT NULL,
  "status" INTEGER NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("snapshot_id","identifikator")
);
CREATE INDEX "sudreg_bris_registri_snapshot_id_idx" ON "sudreg_bris_registri"("snapshot_id");

DROP TABLE IF EXISTS "sudreg_prijevodi_tvrtki";
CREATE TABLE "sudreg_prijevodi_tvrtki" (
  "snapshot_id" BIGINT NOT NULL,
  "mbs" BIGINT NOT NULL,
  "prijevod_tvrtke_rbr" INTEGER NOT NULL,
  "ime" VARCHAR(1024) NOT NULL,
  "jezik_id" BIGINT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("snapshot_id","mbs","prijevod_tvrtke_rbr")
);
CREATE INDEX "sudreg_prijevodi_tvrtki_snapshot_id_idx" ON "sudreg_prijevodi_tvrtki"("snapshot_id");

DROP TABLE IF EXISTS "sudreg_prijevodi_skracenih_tvrtki";
CREATE TABLE "sudreg_prijevodi_skracenih_tvrtki" (
  "snapshot_id" BIGINT NOT NULL,
  "mbs" BIGINT NOT NULL,
  "prijevod_skracene_tvrtke_rbr" INTEGER NOT NULL,
  "ime" VARCHAR(512) NOT NULL,
  "jezik_id" BIGINT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("snapshot_id","mbs","prijevod_skracene_tvrtke_rbr")
);
CREATE INDEX "sudreg_prijevodi_skracenih_tvrtki_snapshot_id_idx" ON "sudreg_prijevodi_skracenih_tvrtki"("snapshot_id");
