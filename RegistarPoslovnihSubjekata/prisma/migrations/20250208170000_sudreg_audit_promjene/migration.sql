-- Tablica: što se točno promijenilo kod UPDATE (stupac, stara i nova vrijednost).
CREATE TABLE IF NOT EXISTS "sudreg_audit_promjene" (
  "id" BIGSERIAL PRIMARY KEY,
  "tablica" VARCHAR(128) NOT NULL,
  "red_kljuc" VARCHAR(1024),
  "stupac" VARCHAR(128) NOT NULL,
  "stara_vrijednost" TEXT,
  "nova_vrijednost" TEXT,
  "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "sudreg_audit_promjene_tablica_idx" ON "sudreg_audit_promjene"("tablica");
CREATE INDEX IF NOT EXISTS "sudreg_audit_promjene_changed_at_idx" ON "sudreg_audit_promjene"("changed_at");

-- Trigger funkcija: za svaki stupac usporedi OLD i NEW, ako se razlikuju upiši red u audit.
CREATE OR REPLACE FUNCTION sudreg_audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  col_name text;
  old_val text;
  new_val text;
  pk_text text;
BEGIN
  pk_text := left(row_to_json(OLD)::text, 1024);
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
      INSERT INTO sudreg_audit_promjene (tablica, red_kljuc, stupac, stara_vrijednost, nova_vrijednost)
      VALUES (TG_TABLE_NAME, pk_text, col_name, left(old_val, 50000), left(new_val, 50000));
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Stavi trigger na sve sudreg_* tablice (kod UPDATE-a bilježi promjene po stupcu).
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename LIKE 'sudreg_%'
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS sudreg_audit_%s ON %I; CREATE TRIGGER sudreg_audit_%s AFTER UPDATE ON %I FOR EACH ROW EXECUTE PROCEDURE sudreg_audit_trigger_func()',
      r.tablename, r.tablename, r.tablename, r.tablename
    );
  END LOOP;
END;
$$;
