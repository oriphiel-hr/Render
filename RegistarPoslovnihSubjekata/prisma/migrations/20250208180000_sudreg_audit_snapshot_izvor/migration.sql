-- Dodaj snapshot_id (iz retka koji se ažurira) i izvor (koji proces – iz session app.audit_context).
ALTER TABLE "sudreg_audit_promjene"
  ADD COLUMN IF NOT EXISTS "snapshot_id" BIGINT,
  ADD COLUMN IF NOT EXISTS "izvor" VARCHAR(256);

CREATE INDEX IF NOT EXISTS "sudreg_audit_promjene_snapshot_id_idx" ON "sudreg_audit_promjene"("snapshot_id");
CREATE INDEX IF NOT EXISTS "sudreg_audit_promjene_izvor_idx" ON "sudreg_audit_promjene"("izvor");

-- Trigger funkcija: snapshot_id iz NEW ako postoji stupac; izvor iz current_setting('app.audit_context', true).
CREATE OR REPLACE FUNCTION sudreg_audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  col_name text;
  old_val text;
  new_val text;
  pk_text text;
  snapshot_id_val bigint;
  izvor_val text;
  j json;
BEGIN
  pk_text := left(row_to_json(OLD)::text, 1024);
  j := row_to_json(NEW);
  BEGIN
    snapshot_id_val := (j->>'snapshot_id')::bigint;
  EXCEPTION WHEN OTHERS THEN
    snapshot_id_val := NULL;
  END;
  izvor_val := nullif(trim(current_setting('app.audit_context', true)), '');

  FOR col_name IN
    SELECT a.attname
    FROM pg_attribute a
    JOIN pg_class c ON c.oid = a.attrelid
    WHERE c.relname = TG_TABLE_NAME
      AND a.attnum > 0
      AND NOT a.attisdropped
  LOOP
    EXECUTE format('SELECT ($1).%I::text, ($2).%I::text', col_name, col_name)
      INTO old_val, new_val
      USING OLD, NEW;
    IF old_val IS DISTINCT FROM new_val THEN
      INSERT INTO sudreg_audit_promjene (tablica, red_kljuc, stupac, stara_vrijednost, nova_vrijednost, snapshot_id, izvor)
      VALUES (TG_TABLE_NAME, pk_text, col_name, left(old_val, 50000), left(new_val, 50000), snapshot_id_val, izvor_val);
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
