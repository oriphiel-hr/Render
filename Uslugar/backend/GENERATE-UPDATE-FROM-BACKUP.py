#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Skripta za generiranje UPDATE statementa iz backup SQL datoteke.
Za svaki redak s problematičnim znakovima generira UPDATE naredbu.
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
    (r'\\n', '\n'),  # Literalni \n -> stvarni novi red (dva znaka: backslash + n -> jedan znak: novi red)
]

def has_problematic_chars(text):
    """Provjeri ima li tekst problematičnih znakova."""
    if not text or not isinstance(text, str):
        return False
    for pattern, _ in PROBLEMATIC_PATTERNS:
        if re.search(pattern, text):
            return True
    return False

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

def fix_encoding(text):
    """Popravi encoding u tekstu - primjenjuje sve zamjene."""
    if not text or not isinstance(text, str):
        return text
    result = text
    # Primjeni sve zamjene redom
    for pattern, replacement in PROBLEMATIC_PATTERNS:
        result = re.sub(pattern, replacement, result)
    
    # Dodatne zamjene koje mogu biti u backup datoteci
    # Backup datoteka može imati različite encoding varijante
    additional_fixes = [
        (r'┼í', 'š'),  # Ć često je u backup datoteci kao ┼í umjesto š
        (r'─Ź', 'č'),  # Č u backup datoteci
        (r'─ć', 'ć'),  # ć u backup datoteci
        (r'─Ĺ', 'đ'),  # đ u backup datoteci
        (r'─í', 'ć'),  # alternativni encoding za ć
        (r'─ì', 'č'),  # alternativni encoding za č
        (r'─î', 'Č'),  # Č veliko
        (r'─ç', 'ć'),  # alternativni encoding za ć
        (r'┼ż', 'ž'),  # ž
        (r'┼░', 'đ'),  # đ
        (r'┼ì', 'č'),  # č
        (r'┼á', 'š'),  # š
        (r'┼ü', 'Ž'),  # Ž veliko
        (r'┼Ü', 'Š'),  # Š veliko
        (r'Âž', 'ž'),  # ž
        (r'Âć', 'ć'),  # ć
        (r'Âč', 'č'),  # č
        (r'Âđ', 'đ'),  # đ
        (r'Âš', 'š'),  # š
        (r'ÂŽ', 'Ž'),  # Ž veliko
        (r'ÂĆ', 'Ć'),  # Ć veliko
        (r'ÂČ', 'Č'),  # Č veliko
        (r'<\|', 'ž'),  # ž alternativni
        (r'\|>', 'ž'),  # ž alternativni
        (r'Ôćö', '↔'),  # ↔
        (r'Ôëą', '≥'),  # ≥
        (r'Ôćĺ', '→'),  # →
        (r'ZAVRšEN', 'ZAVRŠEN'),  # CASE fix
        (r'\\n', '\n'),  # literalni \n -> stvarni novi red
    ]
    
    # Primjeni dodatne zamjene (možda su već u PROBLEMATIC_PATTERNS, ali ponovimo radi sigurnosti)
    for pattern, replacement in additional_fixes:
        if pattern not in [p[0] for p in PROBLEMATIC_PATTERNS]:
            result = re.sub(pattern, replacement, result)
    
    return result

def parse_copy_statement(line, table_name, columns):
    """Parsira COPY statement i vraća tablicu, kolone."""
    # Format: COPY public."TableName" (col1, col2, ...) FROM stdin;
    match = re.match(r'COPY\s+public\.?"?([^"]+)"?\s*\(([^)]+)\)\s+FROM\s+stdin;', line)
    if match:
        return match.group(1).strip('"'), [col.strip().strip('"') for col in match.group(2).split(',')]
    return None, None

def parse_data_line(line):
    """Parsira redak podataka (tab-separated values)."""
    # PostgreSQL COPY format koristi tab kao separator
    # NULL vrijednosti su \N
    # Literalni \n (backslash + n) treba ostati kao dva znaka za daljnju obradu
    parts = []
    current = []
    i = 0
    while i < len(line):
        char = line[i]
        if char == '\\':
            # Provjeri je li \N (NULL) ili literalni \n
            if i + 1 < len(line):
                next_char = line[i + 1]
                if next_char == 'N':
                    # NULL vrijednost - dodaj \N i preskoči
                    if current:  # Ako imaš trenutni dio, spremi ga
                        parts.append(''.join(current))
                        current = []
                    parts.append('\\N')
                    i += 2
                    continue
                elif next_char == 'n':
                    # Literalni \n - zadrži kao dva znaka (\ + n) za daljnju obradu
                    current.append('\\')
                    current.append('n')
                    i += 2
                    continue
                elif next_char == 't':
                    # Literalni \t - zadrži kao dva znaka
                    current.append('\\')
                    current.append('t')
                    i += 2
                    continue
                elif next_char == '\\':
                    # Escaped backslash - dodaj jedan backslash
                    current.append('\\')
                    i += 2
                    continue
            # Ako nije posebna escape sekvenca, dodaj backslash
            current.append('\\')
            i += 1
        elif char == '\t':
            # Tab separator - spremi trenutni dio
            parts.append(''.join(current))
            current = []
            i += 1
        else:
            current.append(char)
            i += 1
    
    if current:
        parts.append(''.join(current))
    
    # Zamijeni \N s None
    parts = [None if p == '\\N' else p for p in parts]
    return parts

def generate_update_statement(table_name, id_value, column_name, original_value, fixed_value):
    """Generira UPDATE statement."""
    id_escaped = escape_sql_string(id_value)
    
    # Provjeri je li camelCase kolona (ima veliko slovo negdje osim na početku) ili već ima navodnike
    # camelCase kolone trebaju navodnike u PostgreSQL-u
    needs_quotes = (
        column_name[0].isupper() or  # Počinje s velikim slovom (npr. "CategoryId")
        any(c.isupper() for c in column_name[1:]) or  # Ima veliko slovo unutra (npr. "technicalDetails")
        '"' in column_name  # Već ima navodnike
    )
    
    column_escaped = f'"{column_name}"' if needs_quotes else column_name
    fixed_escaped = escape_sql_string(fixed_value)
    
    return f'UPDATE "{table_name}" SET {column_escaped} = {fixed_escaped} WHERE id = {id_escaped};'

def process_backup_file(backup_path, output_path):
    """Glavna funkcija za procesiranje backup datoteke."""
    backup_file = Path(backup_path)
    if not backup_file.exists():
        print(f"[ERROR] Backup datoteka ne postoji: {backup_path}", file=sys.stderr)
        return False
    
    print(f"[INFO] Citanje backup datoteke: {backup_path}")
    
    current_table = None
    current_columns = None
    id_column_index = None
    update_statements = []
    line_count = 0
    update_count = 0
    
    try:
        with open(backup_file, 'r', encoding='utf-8', errors='ignore') as f:
            for line_num, line in enumerate(f, 1):
                line = line.rstrip('\n\r')
                
                # Provjeri je li COPY statement
                if line.startswith('COPY '):
                    current_table, current_columns = parse_copy_statement(line, None, None)
                    if current_table and current_columns:
                        # Pronađi index id kolone
                        try:
                            id_column_index = current_columns.index('id')
                        except ValueError:
                            id_column_index = None
                        print(f"  [INFO] Tablica: {current_table}, {len(current_columns)} kolona")
                    continue
                
                # Provjeri je li kraj COPY bloka
                if line == '\\.' or line.strip() == '\\.':
                    current_table = None
                    current_columns = None
                    id_column_index = None
                    continue
                
                # Ako smo u COPY bloku i imamo tablicu, parsiraj podatke
                if current_table and current_columns and id_column_index is not None:
                    line_count += 1
                    if line_count % 1000 == 0:
                        print(f"  [INFO] Procesirano redaka: {line_count}")
                    
                    # Parsiraj redak podataka
                    try:
                        data_parts = parse_data_line(line)
                        
                        if len(data_parts) <= id_column_index:
                            continue
                        
                        id_value = data_parts[id_column_index]
                        if not id_value:
                            continue
                        
                        # Provjeri svaku tekstualnu kolonu
                        for col_index, column_name in enumerate(current_columns):
                            if col_index >= len(data_parts):
                                break
                            
                            value = data_parts[col_index]
                            if value and has_problematic_chars(str(value)):
                                # Popravi encoding
                                fixed_value = fix_encoding(str(value))
                                if fixed_value != value:
                                    update_stmt = generate_update_statement(
                                        current_table, id_value, column_name, value, fixed_value
                                    )
                                    update_statements.append(update_stmt)
                                    update_count += 1
                    
                    except Exception as e:
                        # Preskoči problematične redove
                        continue
    
    except Exception as e:
        print(f"[ERROR] Greska pri citanju datoteke: {e}", file=sys.stderr)
        return False
    
    print(f"[OK] Procesirano {line_count} redaka")
    print(f"[OK] Generirano {update_count} UPDATE statementa")
    
    # Spremi UPDATE statemente u datoteku
    if update_statements:
        output_file = Path(output_path)
        output_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("-- ============================================================================\n")
            f.write("-- GENERIRANI UPDATE STATEMENTI IZ BACKUP DATOTEKE\n")
            f.write("-- ============================================================================\n")
            f.write(f"-- Izvor: {backup_path}\n")
            f.write(f"-- Generirano: {update_count} UPDATE statementa\n")
            f.write("-- ============================================================================\n\n")
            f.write("BEGIN;\n\n")
            
            for stmt in update_statements:
                f.write(stmt + '\n')
            
            f.write("\nCOMMIT;\n")
        
        print(f"[OK] UPDATE statementi spremljeni u: {output_path}")
        return True
    else:
        print("[INFO] Nisu pronadjeni problematicni znakovi")
        return True

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Korištenje: python GENERATE-UPDATE-FROM-BACKUP.py <backup_file> [output_file]")
        sys.exit(1)
    
    backup_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else 'UPDATE-FROM-BACKUP.sql'
    
    success = process_backup_file(backup_file, output_file)
    sys.exit(0 if success else 1)

