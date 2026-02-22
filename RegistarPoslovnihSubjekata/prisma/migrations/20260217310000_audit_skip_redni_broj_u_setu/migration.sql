-- Audit trigger: izostavi i redni_broj_u_setu (naš izračun, ne iz Sudskog registra).
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
  skip_cols text[] := ARRAY['snapshot_id', 'created_at', 'updated_at', 'modified_at', 'glava_id', 'redni_broj_u_setu'];
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
      AND a.attname != ALL(skip_cols)
  LOOP
    EXECUTE format('SELECT ($1).%I::text, ($2).%I::text', col_name, col_name)
      INTO old_val, new_val
      USING OLD, NEW;
    IF old_val IS DISTINCT FROM new_val THEN
      INSERT INTO rps_sudreg_audit_promjene (tablica, red_kljuc, stupac, stara_vrijednost, nova_vrijednost, snapshot_id, izvor)
      VALUES (TG_TABLE_NAME, pk_text, col_name, left(old_val, 50000), left(new_val, 50000), snapshot_id_val, izvor_val);
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
