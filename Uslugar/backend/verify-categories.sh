#!/bin/bash

# Get DATABASE_URL from environment or use default
DATABASE_URL="${DATABASE_URL:-postgres://uslugar_user:Pastor123@uslugar-db.cr80o0eeg3gy.eu-north-1.rds.amazonaws.com:5432/uslugar}"

echo "=== Checking new categories in database ==="
echo ""

# Count new categories
echo "Counting new categories..."
psql "$DATABASE_URL" -c "SELECT COUNT(*) as total_new_categories FROM \"Category\" WHERE id LIKE 'arch_%' OR id LIKE 'it_%' OR id LIKE 'health_%' OR id LIKE 'edu_%' OR id LIKE 'tourism_%' OR id LIKE 'finance_%' OR id LIKE 'marketing_%' OR id LIKE 'transport_%' OR id LIKE 'other_%';"

echo ""
echo "=== First 10 new categories ==="
psql "$DATABASE_URL" -c "SELECT id, name, \"isActive\" FROM \"Category\" WHERE id LIKE 'arch_%' OR id LIKE 'it_%' OR id LIKE 'health_%' OR id LIKE 'edu_%' OR id LIKE 'tourism_%' OR id LIKE 'finance_%' OR id LIKE 'marketing_%' OR id LIKE 'transport_%' OR id LIKE 'other_%' ORDER BY id LIMIT 10;"

echo ""
echo "=== Total categories in database ==="
psql "$DATABASE_URL" -c "SELECT COUNT(*) as total_categories FROM \"Category\";"
