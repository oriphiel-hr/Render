-- Stupac id u rps_sudreg_* tablicama preimenovan u rps_sudreg_<tablica>_id

ALTER TABLE rps_sudreg_last_response RENAME COLUMN id TO rps_sudreg_last_response_id;
ALTER TABLE rps_sudreg_last_response_audit RENAME COLUMN id TO rps_sudreg_last_response_audit_id;
ALTER TABLE rps_sudreg_sync_glava RENAME COLUMN id TO rps_sudreg_sync_glava_id;
ALTER TABLE rps_sudreg_proxy_log RENAME COLUMN id TO rps_sudreg_proxy_log_id;
ALTER TABLE rps_sudreg_sync_state RENAME COLUMN id TO rps_sudreg_sync_state_id;
ALTER TABLE rps_sudreg_sync_lock RENAME COLUMN id TO rps_sudreg_sync_lock_id;
ALTER TABLE rps_sudreg_audit_promjene RENAME COLUMN id TO rps_sudreg_audit_promjene_id;
