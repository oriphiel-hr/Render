#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Skripta za proveru da li su sve tabele iz Prisma schema prisutne u Render bazi
"""

import psycopg2
from psycopg2 import sql

# Connection string za Render bazu
DATABASE_URL = "postgresql://uslugar_user:Qwvk5j6QpbR8XGO8flXIDeg0GU76xORm@dpg-d5g06gshg0os738en9cg-a.frankfurt-postgres.render.com/uslugar"

# Lista tabela iz Prisma schema
PRISMA_MODELS = [
    "AddonEventLog", "AddonSubscription", "AddonUsage", "ApiRequestLog", "AuditLog",
    "BillingAdjustment", "BillingPlan", "Category", "ChatbotSession", "ChatMessage",
    "ChatRoom", "ClientVerification", "CompanyFeatureOwnership", "CompanyLeadQueue",
    "CreditTransaction", "DocumentationCategory", "DocumentationFeature", "ErrorLog",
    "FeatureCatalog", "FeatureOwnershipHistory", "Invoice", "Job", "JobAlert",
    "LeadPurchase", "LeadQueue", "LegalStatus", "MessageSLA", "MessageVersion",
    "Notification", "Offer", "ProviderLicense", "ProviderProfile", "ProviderROI",
    "ProviderTeamLocation", "PushSubscription", "Review", "SavedSearch", "SmsLog",
    "Subscription", "SubscriptionHistory", "SubscriptionPlan", "SupportTicket",
    "TestItem", "TestPlan", "TestRun", "TestRunItem", "TrialEngagement",
    "User", "WhiteLabel"
]

# Join tabele i Prisma internal
ADDITIONAL_TABLES = [
    "_ProviderCategories", "_participants", "_prisma_migrations"
]

# Enum tipovi koji trebaju postojati
REQUIRED_ENUMS = [
    "BillingPeriod", "BillingAdjustmentType", "BillingAdjustmentStatus",
    "CompanyLeadQueueStatus", "CompanyLeadAssignmentType", "AuditActionType"
]

def check_database():
    try:
        # Poveži se na bazu
        print("🔌 Povezivanje na Render bazu podataka...")
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        print("✅ Uspešno povezano!\n")
        
        # Proveri tabele
        print("=" * 70)
        print("PROVERA TABELA")
        print("=" * 70)
        
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        """)
        
        existing_tables = {row[0] for row in cur.fetchall()}
        all_required_tables = set(PRISMA_MODELS + ADDITIONAL_TABLES)
        
        # Proveri Prisma modele
        missing_models = []
        extra_tables = []
        
        for model in PRISMA_MODELS:
            if model not in existing_tables:
                missing_models.append(model)
        
        for table in existing_tables:
            if table not in all_required_tables and not table.startswith('_'):
                extra_tables.append(table)
        
        print(f"\n📊 Statistika:")
        print(f"   Prisma modeli (očekivano): {len(PRISMA_MODELS)}")
        print(f"   Dodatne tabele (join/internal): {len(ADDITIONAL_TABLES)}")
        print(f"   Tabele u bazi (ukupno): {len(existing_tables)}")
        print(f"   Prisma modeli u bazi: {len([t for t in existing_tables if t in PRISMA_MODELS])}")
        
        if missing_models:
            print(f"\n❌ NEDOSTAJUĆE TABELE ({len(missing_models)}):")
            for model in missing_models:
                print(f"   - {model}")
        else:
            print(f"\n✅ Svi Prisma modeli su prisutni u bazi!")
        
        if extra_tables:
            print(f"\n⚠️  DODATNE TABELE u bazi (ne postoje u Prisma schema):")
            for table in extra_tables:
                print(f"   - {table}")
        
        # Proveri join tabele
        missing_join = []
        for join_table in ADDITIONAL_TABLES:
            if join_table not in existing_tables:
                missing_join.append(join_table)
        
        if missing_join:
            print(f"\n⚠️  Nedostaju join/internal tabele:")
            for table in missing_join:
                print(f"   - {table}")
        else:
            print(f"\n✅ Sve join/internal tabele su prisutne!")
        
        # Proveri enum tipove
        print("\n" + "=" * 70)
        print("PROVERA ENUM TIPOVA")
        print("=" * 70)
        
        cur.execute("""
            SELECT typname 
            FROM pg_type 
            WHERE typtype = 'e' 
            AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
            ORDER BY typname;
        """)
        
        existing_enums = {row[0] for row in cur.fetchall()}
        
        missing_enums = []
        for enum in REQUIRED_ENUMS:
            if enum not in existing_enums:
                missing_enums.append(enum)
        
        print(f"\n📊 Statistika:")
        print(f"   Očekivano enum tipova: {len(REQUIRED_ENUMS)}")
        print(f"   Enum tipovi u bazi: {len([e for e in existing_enums if e in REQUIRED_ENUMS])}")
        
        if missing_enums:
            print(f"\n❌ NEDOSTAJUĆI ENUM TIPOVI ({len(missing_enums)}):")
            for enum in missing_enums:
                print(f"   - {enum}")
        else:
            print(f"\n✅ Svi potrebni enum tipovi su prisutni!")
        
        if len(existing_enums) > len(REQUIRED_ENUMS):
            extra_enums = existing_enums - set(REQUIRED_ENUMS)
            print(f"\nℹ️  Dodatni enum tipovi u bazi (koje koriste postojeće tabele):")
            for enum in sorted(extra_enums):
                print(f"   - {enum}")
        
        # Proveri da li postoje podaci u tabelama
        print("\n" + "=" * 70)
        print("BROJ REDOVA U TABELAMA")
        print("=" * 70)
        
        print(f"\n{'Tabela':<35} {'Broj redova':<15}")
        print("-" * 50)
        
        for table in sorted(existing_tables):
            if table in PRISMA_MODELS:
                try:
                    cur.execute(sql.SQL("SELECT COUNT(*) FROM {}").format(
                        sql.Identifier(table)
                    ))
                    count = cur.fetchone()[0]
                    status = "✅" if count > 0 else "📭"
                    print(f"{status} {table:<33} {count:>10}")
                except Exception as e:
                    print(f"❌ {table:<33} ERROR: {str(e)[:30]}")
        
        # Finalni rezime
        print("\n" + "=" * 70)
        print("FINALNI REZIME")
        print("=" * 70)
        
        total_issues = len(missing_models) + len(missing_enums)
        
        if total_issues == 0:
            print("\n✅ SVE JE U REDU!")
            print("   - Svi Prisma modeli su prisutni")
            print("   - Svi potrebni enum tipovi su prisutni")
            print("   - Baza je usklađena sa Prisma schema")
        else:
            print(f"\n⚠️  PRONAĐENO {total_issues} PROBLEMA:")
            if missing_models:
                print(f"   - Nedostaje {len(missing_models)} tabela")
            if missing_enums:
                print(f"   - Nedostaje {len(missing_enums)} enum tipova")
            print("\n💡 Preporuka: Pokrenite uslugar_import_script.sql da dodate nedostajuće tabele/enum tipove.")
        
        cur.close()
        conn.close()
        
    except psycopg2.OperationalError as e:
        print(f"❌ Greška pri povezivanju na bazu: {e}")
        print("\n💡 Proverite:")
        print("   1. Da li je Render baza dostupna")
        print("   2. Da li su kredencijali tačni")
        print("   3. Da li je psycopg2 instaliran: pip install psycopg2-binary")
    except Exception as e:
        print(f"❌ Greška: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_database()

