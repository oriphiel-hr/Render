-- Prefiks rps_sudreg_ za naše tablice (sync, expected counts, audit, logovi).

ALTER TABLE IF EXISTS sudreg_last_response RENAME TO rps_sudreg_last_response;
ALTER TABLE IF EXISTS sudreg_last_response_audit RENAME TO rps_sudreg_last_response_audit;
ALTER TABLE IF EXISTS sudreg_sync_glava RENAME TO rps_sudreg_sync_glava;
ALTER TABLE IF EXISTS sudreg_proxy_log RENAME TO rps_sudreg_proxy_log;
ALTER TABLE IF EXISTS sudreg_expected_counts RENAME TO rps_sudreg_expected_counts;
ALTER TABLE IF EXISTS sudreg_sync_state RENAME TO rps_sudreg_sync_state;
ALTER TABLE IF EXISTS sudreg_sync_lock RENAME TO rps_sudreg_sync_lock;
ALTER TABLE IF EXISTS sudreg_audit_promjene RENAME TO rps_sudreg_audit_promjene;

-- Trigger funkcija mora pisati u novu tablicu
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
      INSERT INTO rps_sudreg_audit_promjene (tablica, red_kljuc, stupac, stara_vrijednost, nova_vrijednost, snapshot_id, izvor)
      VALUES (TG_TABLE_NAME, pk_text, col_name, left(old_val, 50000), left(new_val, 50000), snapshot_id_val, izvor_val);
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
