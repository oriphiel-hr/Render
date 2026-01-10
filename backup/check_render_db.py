#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Skripta za proveru tabela u Render PostgreSQL bazi
"""

import sys
import re

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
except ImportError:
    print("❌ psycopg2 nije instaliran. Instalirajte sa: pip install psycopg2-binary")
    sys.exit(1)

# Connection string
DB_URL = "postgresql://uslugar_user:Qwvk5j6QpbR8XGO8flXIDeg0GU76xORm@dpg-d5g06gshg0os738en9cg-a.frankfurt-postgres.render.com/uslugar"

def get_prisma_models():
    """Učitaj Prisma modele iz schema fajla"""
    models = []
    try:
        with open('schema_20260107_225253.prisma', 'r', encoding='utf-8') as f:
            for line in f:
                match = re.match(r'^model (\w+)', line)
                if match:
                    models.append(match.group(1))
    except FileNotFoundError:
        print("❌ schema_20260107_225253.prisma fajl nije pronađen!")
        sys.exit(1)
    return sorted(models)

def get_render_tables():
    """Poveži se na Render bazu i dohvati listu tabela"""
    try:
        # Parse connection string
        conn = psycopg2.connect(DB_URL)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Dohvati sve tabele
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
              AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        """)
        
        tables = [row['table_name'] for row in cursor.fetchall()]
        
        cursor.close()
        conn.close()
        
        return sorted(tables)
        
    except psycopg2.Error as e:
        print(f"❌ Greška pri povezivanju na bazu: {e}")
        sys.exit(1)

def main():
    print("\n" + "="*60)
    print("PROVERA TABELA U RENDER BAZI")
    print("="*60)
    
    # Učitaj Prisma modele
    print("\n📋 Učitavam Prisma modele...")
    prisma_models = get_prisma_models()
    print(f"   Pronađeno: {len(prisma_models)} Prisma modela")
    
    # Dohvati tabele iz Render baze
    print("\n🔌 Povezujem se na Render bazu...")
    render_tables = get_render_tables()
    print(f"   Pronađeno: {len(render_tables)} tabela u Render bazi")
    
    # Poredi
    print("\n" + "="*60)
    print("POREDJENJE")
    print("="*60)
    
    prisma_set = set(prisma_models)
    render_set = set(render_tables)
    
    missing = prisma_set - render_set
    extra = render_set - prisma_set
    
    # Nedostajuće tabele
    if missing:
        print(f"\n❌ NEDOSTAJU U RENDER BAZI ({len(missing)}):")
        for table in sorted(missing):
            print(f"   - {table}")
    else:
        print("\n✅ Svi Prisma modeli su prisutni u Render bazi!")
    
    # Dodatne tabele
    if extra:
        print(f"\n📋 DODATNE TABELE U RENDER BAZI ({len(extra)}):")
        for table in sorted(extra):
            print(f"   ✓ {table} (join tabela ili Prisma internal)")
    
    # Statistika
    print("\n" + "="*60)
    print("STATISTIKA")
    print("="*60)
    print(f"Prisma modeli:     {len(prisma_models)}")
    print(f"Render tabele:     {len(render_tables)}")
    print(f"Nedostaju:         {len(missing)}")
    print(f"Dodatne:           {len(extra)}")
    
    # Lista svih tabela
    print("\n" + "="*60)
    print("SVE TABELE U RENDER BAZI")
    print("="*60)
    for i, table in enumerate(render_tables, 1):
        status = "✅" if table in prisma_set else "📋"
        print(f"{i:3}. {status} {table}")
    
    print("\n" + "="*60)
    
    if missing:
        print("\n⚠️  NEDOSTAJUĆE TABELE - potrebno je pokrenuti migracije!")
        return 1
    else:
        print("\n✅ Sve tabele su prisutne!")
        return 0

if __name__ == "__main__":
    sys.exit(main())

