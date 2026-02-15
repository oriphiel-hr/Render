-- AlterTable: preimenovanje subjekt_id -> mbo u tablicama koje ga imaju
ALTER TABLE "sudreg_email_adrese" RENAME COLUMN "subjekt_id" TO "mbo";
ALTER TABLE "sudreg_evidencijske_djelatnosti" RENAME COLUMN "subjekt_id" TO "mbo";
ALTER TABLE "sudreg_postupci" RENAME COLUMN "subjekt_id" TO "mbo";
ALTER TABLE "sudreg_pravni_oblici" RENAME COLUMN "subjekt_id" TO "mbo";
ALTER TABLE "sudreg_predmeti_poslovanja" RENAME COLUMN "subjekt_id" TO "mbo";
ALTER TABLE "sudreg_pretezite_djelatnosti" RENAME COLUMN "subjekt_id" TO "mbo";
ALTER TABLE "sudreg_sjedista" RENAME COLUMN "subjekt_id" TO "mbo";
ALTER TABLE "sudreg_skracene_tvrtke" RENAME COLUMN "subjekt_id" TO "mbo";
ALTER TABLE "sudreg_temeljni_kapitali" RENAME COLUMN "subjekt_id" TO "mbo";
ALTER TABLE "sudreg_tvrtke" RENAME COLUMN "subjekt_id" TO "mbo";
