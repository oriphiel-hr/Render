#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Skripta za generiranje INSERT statementa za Category tablicu iz backup datoteke.
Generira INSERT statemente za SVE retke s ispravnim encodingom.
"""

import re
import sys
from pathlib import Path

# Problematični znakovi koje treba popraviti
PROBLEMATIC_PATTERNS = [
    (r'┼ż', 'ž'), (r'┼í', 'š'), (r'┼ì', 'č'), (r'┼░', 'đ'), (r'┼ü', 'Ž'), (r'┼Ü', 'Š'),
    (r'<\|', 'ž'), (r'\|>', 'ž'),
    (r'Âž', 'ž'), (r'Âć', 'ć'), (r'Âč', 'č'), (r'Âđ', 'đ'), (r'Âš', 'š'), (r'ÂŽ', 'Ž'), (r'ÂĆ', 'Ć'), (r'ÂČ', 'Č'),
    (r'─Ź', 'č'), (r'─ć', 'ć'), (r'─î', 'Č'), (r'─í', 'ć'), (r'─ì', 'č'), (r'─Ĺ', 'đ'), (r'─ç', 'ć'),
    (r'┼á', 'š'), (r'Ôćö', '↔'), (r'Ôëą', '≥'), (r'Ôćĺ', '→'),
    (r'ZAVRšEN', 'ZAVRŠEN'),  # CASE fix
    (r'\\n', '\n'),  # Literalni \n -> stvarni novi red
    # Dodatni encoding problemi - zamijeni s ASCII ekvivalentom ili ostavi ako nije poznat
    (r'├ę', 'e'),  # Plinoinstalat├ęr -> Plinoinstalater
    # Možda treba biti drugačije - provjeri kontekst
]

def fix_encoding(text):
    """Popravi encoding u tekstu - primjenjuje sve zamjene."""
    if not text or not isinstance(text, str):
        return text
    result = text
    # Primjeni sve zamjene redom
    for pattern, replacement in PROBLEMATIC_PATTERNS:
        result = re.sub(pattern, replacement, result)
    return result

def escape_sql_string(value):
    """Escape SQL string vrijednosti."""
    if value is None:
        return 'NULL'
    
    # Zamijeni ' s ''
    escaped = str(value).replace("'", "''")
    
    # Provjeri ima li novih redova, tabova ili backslash-ova
    has_newline = '\n' in escaped
    has_tab = '\t' in escaped
    has_backslash = '\\' in escaped and '\\' not in ['\n', '\t', '\r']
    
    # Ako ima novih redova, tabova ili backslash-ova, koristi E'' syntax
    if has_newline or has_tab or has_backslash:
        # Prvo escape-aj postojeće backslash-ove (osim onih koji su dio \n, \t, \r)
        # Stvarni novi red (\n) treba ostati kao \n u E'' sintaksi
        # Ali doslovni backslash (\) treba biti escape-an kao \\
        
        # Zamijeni stvarni novi red s placeholder
        escaped = escaped.replace('\n', '__NEWLINE__')
        escaped = escaped.replace('\t', '__TAB__')
        escaped = escaped.replace('\r', '__CR__')
        
        # Sada escape-aj sve doslovne backslash-ove
        escaped = escaped.replace('\\', '\\\\')
        
        # Vrati nove redove kao \n u E'' sintaksi
        escaped = escaped.replace('__NEWLINE__', '\\n')
        escaped = escaped.replace('__TAB__', '\\t')
        escaped = escaped.replace('__CR__', '\\r')
        
        return f"E'{escaped}'"
    return f"'{escaped}'"

def parse_data_line(line):
    """Parsira redak podataka (tab-separated values)."""
    # Jednostavno split po tab-ovima
    # U PostgreSQL COPY formatu, tab je separator između kolona
    parts = line.split('\t')
    
    # Zamijeni \N s None
    parts = [None if p == '\\N' else p for p in parts]
    
    # Popravi literalni \n (backslash + n) u tekstualnim vrijednostima
    # Ovo će se popraviti u fix_encoding funkciji, ali sada zadrži kao string
    return parts

def process_category_backup(backup_path, output_path):
    """Glavna funkcija za procesiranje Category tablice iz backup datoteke."""
    backup_file = Path(backup_path)
    if not backup_file.exists():
        print(f"[ERROR] Backup datoteka ne postoji: {backup_path}", file=sys.stderr)
        return False
    
    print(f"[INFO] Citanje backup datoteke: {backup_path}")
    
    # Kategorija kolone (prema COPY statementu)
    category_columns = [
        'id', 'name', 'description', 'parentId', 'isActive', 'createdAt',
        'nkdCode', 'requiresLicense', 'licenseType', 'licenseAuthority', 'icon'
    ]
    
    insert_statements = []
    in_category_section = False
    line_count = 0
    
    try:
        with open(backup_file, 'r', encoding='utf-8', errors='ignore') as f:
            for line_num, line in enumerate(f, 1):
                line = line.rstrip('\n\r')
                
                # Provjeri je li COPY statement za Category
                if line.startswith('COPY public."Category"'):
                    in_category_section = True
                    print(f"[INFO] Pronadjen COPY statement za Category tablicu")
                    continue
                
                # Provjeri je li kraj COPY bloka
                if (line == '\\.' or line.strip() == '\\.') and in_category_section:
                    print(f"[INFO] Kraj Category sekcije")
                    break
                
                # Ako smo u Category sekciji, parsiraj podatke
                if in_category_section and line.strip():
                    line_count += 1
                    
                    # Parsiraj redak podataka
                    try:
                        data_parts = parse_data_line(line)
                        
                        if len(data_parts) != len(category_columns):
                            print(f"[WARNING] Linija {line_num}: Očekivano {len(category_columns)} kolona, dobiveno {len(data_parts)}")
                            continue
                        
                        # Popravi encoding za sve tekstualne vrijednosti
                        fixed_parts = []
                        for part in data_parts:
                            if part is not None:
                                fixed_parts.append(fix_encoding(str(part)))
                            else:
                                fixed_parts.append(None)
                        
                        # Generiraj INSERT statement
                        # Column names - PostgreSQL koristi camelCase kolone s navodnicima
                        # Prema COPY statementu u backup datoteci:
                        # S navodnicima: "parentId", "isActive", "createdAt", "nkdCode", "requiresLicense", "licenseType", "licenseAuthority"
                        # Bez navodnika: id, name, description, icon
                        column_mapping = {
                            'id': 'id',
                            'name': 'name',
                            'description': 'description',
                            'parentId': '"parentId"',  # camelCase - trebaju navodnici
                            'isActive': '"isActive"',  # camelCase - trebaju navodnici
                            'createdAt': '"createdAt"',  # camelCase - trebaju navodnici
                            'nkdCode': '"nkdCode"',  # camelCase - trebaju navodnici (u COPY ima navodnike)
                            'requiresLicense': '"requiresLicense"',  # camelCase - trebaju navodnici (u COPY ima navodnike)
                            'licenseType': '"licenseType"',  # camelCase - trebaju navodnici (u COPY ima navodnike)
                            'licenseAuthority': '"licenseAuthority"',  # camelCase - trebaju navodnici (u COPY ima navodnike)
                            'icon': 'icon'  # Bez navodnika u COPY
                        }
                        columns_str = ', '.join([column_mapping.get(col, col) for col in category_columns])
                        
                        # Values
                        values_list = []
                        for i, val in enumerate(fixed_parts):
                            if val is None or val == '\\N':
                                values_list.append('NULL')
                            elif category_columns[i] in ['isActive', 'requiresLicense']:
                                # Boolean
                                values_list.append('true' if str(val).lower() == 't' else 'false')
                            elif category_columns[i] in ['createdAt']:
                                # Timestamp
                                values_list.append(f"'{val}'")
                            elif category_columns[i] in ['parentId'] and (val is None or val == '\\N'):
                                values_list.append('NULL')
                            elif category_columns[i] == 'nkdCode' and (val is None or val == '\\N'):
                                values_list.append('NULL')
                            else:
                                # Text - koristi escape_sql_string
                                values_list.append(escape_sql_string(val))
                        
                        values_str = ', '.join(values_list)
                        
                        insert_stmt = f'INSERT INTO public."Category" ({columns_str}) VALUES ({values_str});'
                        insert_statements.append(insert_stmt)
                    
                    except Exception as e:
                        print(f"[WARNING] Linija {line_num}: Greska pri parsiranju: {e}")
                        continue
    
    except Exception as e:
        print(f"[ERROR] Greska pri citanju datoteke: {e}", file=sys.stderr)
        return False
    
    print(f"[OK] Procesirano {line_count} redaka")
    print(f"[OK] Generirano {len(insert_statements)} INSERT statementa")
    
    # Spremi INSERT statemente u datoteku
    if insert_statements:
        output_file = Path(output_path)
        output_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("-- ============================================================================\n")
            f.write("-- GENERIRANI INSERT STATEMENTI ZA CATEGORY TABLICU\n")
            f.write("-- ============================================================================\n")
            f.write(f"-- Izvor: {backup_path}\n")
            f.write(f"-- Generirano: {len(insert_statements)} INSERT statementa\n")
            f.write("-- ============================================================================\n\n")
            f.write("BEGIN;\n\n")
            f.write("-- Obriši postojeće podatke (opcionalno)\n")
            f.write("-- DELETE FROM public.\"Category\";\n\n")
            
            for stmt in insert_statements:
                f.write(stmt + '\n')
            
            f.write("\nCOMMIT;\n")
        
        print(f"[OK] INSERT statementi spremljeni u: {output_path}")
        return True
    else:
        print("[INFO] Nisu pronadjeni retci za Category tablicu")
        return True

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Korištenje: python GENERATE-INSERT-CATEGORY.py <backup_file> [output_file]")
        sys.exit(1)
    
    backup_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else 'INSERT-CATEGORY.sql'
    
    success = process_category_backup(backup_file, output_file)
    sys.exit(0 if success else 1)

