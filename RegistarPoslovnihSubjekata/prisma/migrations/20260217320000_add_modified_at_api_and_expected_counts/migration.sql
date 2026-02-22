-- Kolona modified_at na rps_sudreg_api_request_log i rps_sudreg_expected_counts (valjana PostgreSQL sintaksa).
-- Ako je 20260217270000_add_modified_at na produkciji pala zbog TIMESTAMPTZ(6), ove tablice nemaju kolonu.
ALTER TABLE rps_sudreg_api_request_log ADD COLUMN IF NOT EXISTS modified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE rps_sudreg_expected_counts ADD COLUMN IF NOT EXISTS modified_at TIMESTAMP WITH TIME ZONE;
