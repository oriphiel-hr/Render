# Quick Database Check - AWS CloudShell

## Prerequisites
- AWS CloudShell opened in your browser
- Access to AWS Console

## Method 1: Using AWS CloudShell + psql

### Step 1: Open AWS CloudShell
1. Go to https://eu-north-1.console.aws.amazon.com/
2. Click on CloudShell icon (top right)
3. Wait for CloudShell to initialize

### Step 2: Install PostgreSQL client (if needed)
```bash
sudo apt-get update
sudo apt-get install -y postgresql-client
```

### Step 3: Connect to database
```bash
export PGPASSWORD="Pastor123"
psql -h uslugar-db.cr80o0eeg3gy.eu-north-1.rds.amazonaws.com -U uslugar_user -d uslugar
```

### Step 4: Run verification queries
```sql
-- Check 1: SubscriptionPlan table exists?
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'SubscriptionPlan';

-- Check 2: Job.userId is nullable?
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'Job' AND column_name = 'userId';

-- Check 3: linkingToken columns exist?
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'Job' 
AND column_name IN ('linkingToken', 'linkingTokenExpiresAt');

-- Check 4: Migration history
SELECT migration_name, started_at, finished_at 
FROM _prisma_migrations 
WHERE migration_name LIKE '%20250121%' 
ORDER BY started_at DESC;

-- Check 5: SubscriptionPlan data
SELECT name, displayName, price, credits, isPopular 
FROM "SubscriptionPlan" 
ORDER BY displayOrder;
```

### Step 5: Exit
```sql
\q
```

## Method 2: Using AWS RDS Query Editor

### Step 1: Open RDS Console
1. Go to https://eu-north-1.console.aws.amazon.com/rds/
2. Click "Databases" in left menu
3. Click on "uslugar-db"

### Step 2: Open Query Editor
1. Click "Query Editor" tab (or "Actions" → "Query with SQL")
2. Connect using master credentials:
   - Username: `uslugar_user`
   - Password: `Pastor123`
   - Database: `uslugar`

### Step 3: Run queries
Copy and paste queries from `VERIFY-DB-QUERIES.sql` or use the ones above

## Expected Results

### ✅ If migrations were successful:
- Query 1: Returns `SubscriptionPlan` (1 row)
- Query 2: Returns `YES` for is_nullable
- Query 3: Returns 2 rows (linkingToken, linkingTokenExpiresAt)
- Query 4: Returns migration record with today's date
- Query 5: Returns 3 rows (BASIC, PREMIUM, PRO plans)

### ❌ If migrations failed:
- Query 1: Returns 0 rows
- Query 2: Returns `NO` for is_nullable
- Query 3: Returns 0 rows
- Query 4: Returns 0 rows
- Query 5: Error "relation SubscriptionPlan does not exist"

## Quick Test
Run this single query to check everything:

```sql
SELECT 
  (SELECT COUNT(*) FROM pg_tables WHERE tablename = 'SubscriptionPlan') as has_subscription_plan,
  (SELECT is_nullable FROM information_schema.columns WHERE table_name = 'Job' AND column_name = 'userId') as job_userid_nullable,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'Job' AND column_name IN ('linkingToken', 'linkingTokenExpiresAt')) as has_linking_columns,
  (SELECT COUNT(*) FROM _prisma_migrations WHERE migration_name LIKE '%20250121%') as has_migration;
```

Expected result if successful:
```
 has_subscription_plan | job_userid_nullable | has_linking_columns | has_migration
-----------------------+---------------------+---------------------+---------------
                     1 | YES                 |                   2 |             1
```

Expected result if failed:
```
 has_subscription_plan | job_userid_nullable | has_linking_columns | has_migration
-----------------------+---------------------+---------------------+---------------
                     0 | NO                  |                   0 |             0
```
