-- Procedura: briše podatak iz svih tablica u shemi poštujući redoslijed FK (prvo djeca, pa roditelji).
-- Koristi dinamički dohvat tablica i topološki poredak.
-- Poziv: SELECT * FROM delete_all_data_respecting_fk();  -- cijela public shema
--       SELECT * FROM delete_all_data_respecting_fk('public', 'sudreg_%');  -- samo tablice sudreg_%

CREATE OR REPLACE FUNCTION delete_all_data_respecting_fk(
  p_schema name DEFAULT 'public',
  p_table_pattern text DEFAULT NULL  -- npr. 'sudreg_%' za samo sudreg tablice, NULL = sve
)
RETURNS TABLE(tbl text, rows_deleted bigint)
LANGUAGE plpgsql
AS $$
DECLARE
  delete_order text[] := '{}';
  remaining text[];
  picked text;
  done boolean;
  tbl_name text;
  n bigint;
  i int;
BEGIN
  -- Sve tablice u opsegu
  SELECT array_agg(c.relname ORDER BY c.relname) INTO remaining
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = p_schema
    AND c.relkind = 'r'
    AND (p_table_pattern IS NULL OR c.relname LIKE p_table_pattern);

  IF remaining IS NULL THEN
    RETURN;
  END IF;

  -- Topološki poredak: prvo brišemo tablice koje NE REFERENCIRAJU drugu tablicu u setu (djeca),
  -- na kraju one na koje drugi referenciraju (roditelji). Tablicu "picked" smijemo uzeti ako
  -- je NITKO iz remaining ne referencira (nema FK child -> picked gdje je child u remaining).
  WHILE array_length(remaining, 1) > 0 LOOP
    done := false;
    FOR i IN 1 .. array_length(remaining, 1) LOOP
      picked := remaining[i];
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class child ON child.oid = c.conrelid
        JOIN pg_class parent ON parent.oid = c.confrelid
        JOIN pg_namespace n ON n.oid = child.relnamespace
        WHERE c.contype = 'f'
          AND n.nspname = p_schema
          AND parent.relname = picked
          AND child.relname = ANY(remaining)
          AND child.relname <> picked
      ) THEN
        delete_order := array_append(delete_order, picked);
        remaining := array_remove(remaining, picked);
        done := true;
        EXIT;
      END IF;
    END LOOP;
    IF NOT done THEN
      RAISE EXCEPTION 'Ciklična FK ovisnost medu tablicama u shemi %.', p_schema;
    END IF;
  END LOOP;

  -- Brisanje po redoslijedu
  i := 1;
  WHILE i <= array_length(delete_order, 1) LOOP
    tbl_name := delete_order[i];
    EXECUTE format('DELETE FROM %I.%I', p_schema, tbl_name);
    GET DIAGNOSTICS n = ROW_COUNT;
    tbl := p_schema || '.' || tbl_name;
    rows_deleted := n;
    RETURN NEXT;
    i := i + 1;
  END LOOP;
END;
$$;

-- Primjer poziva:
-- SELECT * FROM delete_all_data_respecting_fk('public');
-- SELECT * FROM delete_all_data_respecting_fk('public', 'sudreg_%');
