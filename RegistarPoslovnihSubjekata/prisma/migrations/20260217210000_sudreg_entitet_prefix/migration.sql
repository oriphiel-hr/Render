-- Prefiks sudreg_entitet_ za entitetske tablice (podaci iz API-ja)

ALTER TABLE IF EXISTS sudreg_counts RENAME TO sudreg_entitet_counts;
ALTER TABLE IF EXISTS sudreg_detalji_subjekta RENAME TO sudreg_entitet_detalji_subjekta;
ALTER TABLE IF EXISTS sudreg_subjekti RENAME TO sudreg_entitet_subjekti;
ALTER TABLE IF EXISTS sudreg_djelatnosti_podruznica RENAME TO sudreg_entitet_djelatnosti_podruznica;
ALTER TABLE IF EXISTS sudreg_email_adrese RENAME TO sudreg_entitet_email_adrese;
ALTER TABLE IF EXISTS sudreg_email_adrese_podruznica RENAME TO sudreg_entitet_email_adrese_podruznica;
ALTER TABLE IF EXISTS sudreg_evidencijske_djelatnosti RENAME TO sudreg_entitet_evidencijske_djelatnosti;
ALTER TABLE IF EXISTS sudreg_gfi RENAME TO sudreg_entitet_gfi;
ALTER TABLE IF EXISTS sudreg_inozemni_registri RENAME TO sudreg_entitet_inozemni_registri;
ALTER TABLE IF EXISTS sudreg_nazivi_podruznica RENAME TO sudreg_entitet_nazivi_podruznica;
ALTER TABLE IF EXISTS sudreg_objave_priopcenja RENAME TO sudreg_entitet_objave_priopcenja;
ALTER TABLE IF EXISTS sudreg_postupci RENAME TO sudreg_entitet_postupci;
ALTER TABLE IF EXISTS sudreg_predmeti_poslovanja RENAME TO sudreg_entitet_predmeti_poslovanja;
ALTER TABLE IF EXISTS sudreg_pretezite_djelatnosti RENAME TO sudreg_entitet_pretezite_djelatnosti;
ALTER TABLE IF EXISTS sudreg_prijevodi_skracenih_tvrtki RENAME TO sudreg_entitet_prijevodi_skracenih_tvrtki;
ALTER TABLE IF EXISTS sudreg_prijevodi_tvrtki RENAME TO sudreg_entitet_prijevodi_tvrtki;
ALTER TABLE IF EXISTS sudreg_sjedista RENAME TO sudreg_entitet_sjedista;
ALTER TABLE IF EXISTS sudreg_sjedista_podruznica RENAME TO sudreg_entitet_sjedista_podruznica;
ALTER TABLE IF EXISTS sudreg_skracene_tvrtke RENAME TO sudreg_entitet_skracene_tvrtke;
ALTER TABLE IF EXISTS sudreg_skraceni_nazivi_podruznica RENAME TO sudreg_entitet_skraceni_nazivi_podruznica;
ALTER TABLE IF EXISTS sudreg_temeljni_kapitali RENAME TO sudreg_entitet_temeljni_kapitali;
ALTER TABLE IF EXISTS sudreg_tvrtke RENAME TO sudreg_entitet_tvrtke;
