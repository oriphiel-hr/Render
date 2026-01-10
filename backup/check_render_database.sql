-- ============================================================================
-- SKRIPTA ZA PROVERU RENDER BAZE PODATAKA
-- ============================================================================
-- Pokrenite ovu skriptu da proverite da li su sve tabele iz Prisma schema
-- prisutne u Render bazi
-- ============================================================================
-- Kako koristiti:
-- psql "postgresql://uslugar_user:Qwvk5j6QpbR8XGO8flXIDeg0GU76xORm@dpg-d5g06gshg0os738en9cg-a.frankfurt-postgres.render.com/uslugar" -f check_render_database.sql
-- ============================================================================

\echo '============================================================================'
\echo 'PROVERA TABELA U RENDER BAZI'
\echo '============================================================================'
\echo ''

-- Lista svih tabela u bazi
\echo '--- SVE TABELE U BAZI ---'
SELECT 
    table_name as "Tabela",
    CASE 
        WHEN table_name IN (
            'AddonEventLog', 'AddonSubscription', 'AddonUsage', 'ApiRequestLog', 'AuditLog',
            'BillingAdjustment', 'BillingPlan', 'Category', 'ChatbotSession', 'ChatMessage',
            'ChatRoom', 'ClientVerification', 'CompanyFeatureOwnership', 'CompanyLeadQueue',
            'CreditTransaction', 'DocumentationCategory', 'DocumentationFeature', 'ErrorLog',
            'FeatureCatalog', 'FeatureOwnershipHistory', 'Invoice', 'Job', 'JobAlert',
            'LeadPurchase', 'LeadQueue', 'LegalStatus', 'MessageSLA', 'MessageVersion',
            'Notification', 'Offer', 'ProviderLicense', 'ProviderProfile', 'ProviderROI',
            'ProviderTeamLocation', 'PushSubscription', 'Review', 'SavedSearch', 'SmsLog',
            'Subscription', 'SubscriptionHistory', 'SubscriptionPlan', 'SupportTicket',
            'TestItem', 'TestPlan', 'TestRun', 'TestRunItem', 'TrialEngagement',
            'User', 'WhiteLabel'
        ) THEN '✅ Prisma model'
        WHEN table_name IN ('_ProviderCategories', '_participants', '_prisma_migrations') THEN '🔗 Join/Internal'
        ELSE '❓ Neočekivana'
    END as "Status"
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY "Status", table_name;

\echo ''
\echo '--- STATISTIKA TABELA ---'
SELECT 
    COUNT(*) FILTER (WHERE table_name IN (
        'AddonEventLog', 'AddonSubscription', 'AddonUsage', 'ApiRequestLog', 'AuditLog',
        'BillingAdjustment', 'BillingPlan', 'Category', 'ChatbotSession', 'ChatMessage',
        'ChatRoom', 'ClientVerification', 'CompanyFeatureOwnership', 'CompanyLeadQueue',
        'CreditTransaction', 'DocumentationCategory', 'DocumentationFeature', 'ErrorLog',
        'FeatureCatalog', 'FeatureOwnershipHistory', 'Invoice', 'Job', 'JobAlert',
        'LeadPurchase', 'LeadQueue', 'LegalStatus', 'MessageSLA', 'MessageVersion',
        'Notification', 'Offer', 'ProviderLicense', 'ProviderProfile', 'ProviderROI',
        'ProviderTeamLocation', 'PushSubscription', 'Review', 'SavedSearch', 'SmsLog',
        'Subscription', 'SubscriptionHistory', 'SubscriptionPlan', 'SupportTicket',
        'TestItem', 'TestPlan', 'TestRun', 'TestRunItem', 'TrialEngagement',
        'User', 'WhiteLabel'
    )) as "Prisma modeli u bazi",
    COUNT(*) FILTER (WHERE table_name IN ('_ProviderCategories', '_participants', '_prisma_migrations')) as "Join/Internal tabele",
    COUNT(*) as "Ukupno tabela",
    49 as "Očekivano Prisma modela",
    3 as "Očekivano Join/Internal"
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

\echo ''
\echo '--- NEDOSTAJUĆE TABELE (Prisma modeli) ---'
SELECT 
    model_name as "Nedostaje tabela"
FROM (
    VALUES 
        ('AddonEventLog'), ('AddonSubscription'), ('AddonUsage'), ('ApiRequestLog'), ('AuditLog'),
        ('BillingAdjustment'), ('BillingPlan'), ('Category'), ('ChatbotSession'), ('ChatMessage'),
        ('ChatRoom'), ('ClientVerification'), ('CompanyFeatureOwnership'), ('CompanyLeadQueue'),
        ('CreditTransaction'), ('DocumentationCategory'), ('DocumentationFeature'), ('ErrorLog'),
        ('FeatureCatalog'), ('FeatureOwnershipHistory'), ('Invoice'), ('Job'), ('JobAlert'),
        ('LeadPurchase'), ('LeadQueue'), ('LegalStatus'), ('MessageSLA'), ('MessageVersion'),
        ('Notification'), ('Offer'), ('ProviderLicense'), ('ProviderProfile'), ('ProviderROI'),
        ('ProviderTeamLocation'), ('PushSubscription'), ('Review'), ('SavedSearch'), ('SmsLog'),
        ('Subscription'), ('SubscriptionHistory'), ('SubscriptionPlan'), ('SupportTicket'),
        ('TestItem'), ('TestPlan'), ('TestRun'), ('TestRunItem'), ('TrialEngagement'),
        ('User'), ('WhiteLabel')
) AS expected_models(model_name)
WHERE model_name NOT IN (
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
)
ORDER BY model_name;

\echo ''
\echo '============================================================================'
\echo 'PROVERA ENUM TIPOVA'
\echo '============================================================================'
\echo ''

\echo '--- SVI ENUM TIPOVI U BAZI ---'
SELECT 
    typname as "Enum tip",
    CASE 
        WHEN typname IN ('BillingPeriod', 'BillingAdjustmentType', 'BillingAdjustmentStatus',
                         'CompanyLeadQueueStatus', 'CompanyLeadAssignmentType', 'AuditActionType')
        THEN '✅ Potreban'
        ELSE 'ℹ️ Dodatni'
    END as "Status"
FROM pg_type 
WHERE typtype = 'e' 
AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY "Status", typname;

\echo ''
\echo '--- NEDOSTAJUĆI ENUM TIPOVI ---'
SELECT 
    enum_name as "Nedostaje enum"
FROM (
    VALUES 
        ('BillingPeriod'), ('BillingAdjustmentType'), ('BillingAdjustmentStatus'),
        ('CompanyLeadQueueStatus'), ('CompanyLeadAssignmentType'), ('AuditActionType')
) AS expected_enums(enum_name)
WHERE enum_name NOT IN (
    SELECT typname 
    FROM pg_type 
    WHERE typtype = 'e' 
    AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
)
ORDER BY enum_name;

\echo ''
\echo '============================================================================'
\echo 'BROJ REDOVA U TABELAMA'
\echo '============================================================================'
\echo ''

DO $$
DECLARE
    rec RECORD;
    row_count BIGINT;
BEGIN
    RAISE NOTICE '%', 'Tabela                          | Broj redova';
    RAISE NOTICE '%', '--------------------------------+-------------';
    
    FOR rec IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name IN (
            'AddonEventLog', 'AddonSubscription', 'AddonUsage', 'ApiRequestLog', 'AuditLog',
            'BillingAdjustment', 'BillingPlan', 'Category', 'ChatbotSession', 'ChatMessage',
            'ChatRoom', 'ClientVerification', 'CompanyFeatureOwnership', 'CompanyLeadQueue',
            'CreditTransaction', 'DocumentationCategory', 'DocumentationFeature', 'ErrorLog',
            'FeatureCatalog', 'FeatureOwnershipHistory', 'Invoice', 'Job', 'JobAlert',
            'LeadPurchase', 'LeadQueue', 'LegalStatus', 'MessageSLA', 'MessageVersion',
            'Notification', 'Offer', 'ProviderLicense', 'ProviderProfile', 'ProviderROI',
            'ProviderTeamLocation', 'PushSubscription', 'Review', 'SavedSearch', 'SmsLog',
            'Subscription', 'SubscriptionHistory', 'SubscriptionPlan', 'SupportTicket',
            'TestItem', 'TestPlan', 'TestRun', 'TestRunItem', 'TrialEngagement',
            'User', 'WhiteLabel'
        )
        ORDER BY table_name
    LOOP
        EXECUTE format('SELECT COUNT(*) FROM %I', rec.table_name) INTO row_count;
        RAISE NOTICE '%', format('%-30s | %10s', rec.table_name, row_count);
    END LOOP;
END $$;

\echo ''
\echo '============================================================================'
\echo 'FINALNI REZIME'
\echo '============================================================================'
\echo ''

SELECT 
    CASE 
        WHEN 
            (SELECT COUNT(*) FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_type = 'BASE TABLE'
             AND table_name IN (
                 'AddonEventLog', 'AddonSubscription', 'AddonUsage', 'ApiRequestLog', 'AuditLog',
                 'BillingAdjustment', 'BillingPlan', 'Category', 'ChatbotSession', 'ChatMessage',
                 'ChatRoom', 'ClientVerification', 'CompanyFeatureOwnership', 'CompanyLeadQueue',
                 'CreditTransaction', 'DocumentationCategory', 'DocumentationFeature', 'ErrorLog',
                 'FeatureCatalog', 'FeatureOwnershipHistory', 'Invoice', 'Job', 'JobAlert',
                 'LeadPurchase', 'LeadQueue', 'LegalStatus', 'MessageSLA', 'MessageVersion',
                 'Notification', 'Offer', 'ProviderLicense', 'ProviderProfile', 'ProviderROI',
                 'ProviderTeamLocation', 'PushSubscription', 'Review', 'SavedSearch', 'SmsLog',
                 'Subscription', 'SubscriptionHistory', 'SubscriptionPlan', 'SupportTicket',
                 'TestItem', 'TestPlan', 'TestRun', 'TestRunItem', 'TrialEngagement',
                 'User', 'WhiteLabel'
             )) = 49
            AND
            (SELECT COUNT(*) FROM pg_type 
             WHERE typtype = 'e' 
             AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
             AND typname IN ('BillingPeriod', 'BillingAdjustmentType', 'BillingAdjustmentStatus',
                            'CompanyLeadQueueStatus', 'CompanyLeadAssignmentType', 'AuditActionType')) >= 6
        THEN '✅ SVE JE U REDU - Baza je usklađena sa Prisma schema!'
        ELSE '⚠️  PRONAĐENI PROBLEMI - Proverite nedostajuće tabele/enum tipove iznad'
    END as "Status";

\echo ''

