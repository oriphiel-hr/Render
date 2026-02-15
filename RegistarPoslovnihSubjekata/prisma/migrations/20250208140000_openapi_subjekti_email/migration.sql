-- Subjekti: dodavanje stupaca prema OpenAPI
ALTER TABLE "sudreg_subjekti" ADD COLUMN IF NOT EXISTS "sud_id_nadlezan" BIGINT;
ALTER TABLE "sudreg_subjekti" ADD COLUMN IF NOT EXISTS "sud_id_sluzba" BIGINT;
ALTER TABLE "sudreg_subjekti" ADD COLUMN IF NOT EXISTS "mb" INTEGER;
ALTER TABLE "sudreg_subjekti" ADD COLUMN IF NOT EXISTS "stecajna_masa" INTEGER;
ALTER TABLE "sudreg_subjekti" ADD COLUMN IF NOT EXISTS "likvidacijska_masa" INTEGER;
ALTER TABLE "sudreg_subjekti" ADD COLUMN IF NOT EXISTS "mbs_brisanog_subjekta" BIGINT;
ALTER TABLE "sudreg_subjekti" ADD COLUMN IF NOT EXISTS "glavna_djelatnost" INTEGER;
ALTER TABLE "sudreg_subjekti" ADD COLUMN IF NOT EXISTS "glavna_podruznica_rbr" INTEGER;
ALTER TABLE "sudreg_subjekti" ADD COLUMN IF NOT EXISTS "sud_id_brisanja" BIGINT;
ALTER TABLE "sudreg_subjekti" ADD COLUMN IF NOT EXISTS "tvrtka_kod_brisanja" VARCHAR(1024);
ALTER TABLE "sudreg_subjekti" ADD COLUMN IF NOT EXISTS "poslovni_broj_brisanja" VARCHAR(17);

-- EmailAdrese: preimenovanje redni_broj -> email_adresa_rbr (OpenAPI)
ALTER TABLE "sudreg_email_adrese" RENAME COLUMN "redni_broj" TO "email_adresa_rbr";
