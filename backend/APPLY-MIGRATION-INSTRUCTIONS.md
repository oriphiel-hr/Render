# How to Apply Migration Manually

## Problem
The migration `20250121_add_subscription_plan_and_anonymous_job_support` was not applied to the database, even though Prisma workflow shows "No pending migrations to apply".

## Evidence
- CloudWatch logs show: "9 migrations found, No pending migrations to apply"
- Seed fails with: "The table `public.SubscriptionPlan` does not exist"
- Migration file exists in code but table doesn't exist in database

## Solution
Manually apply the migration SQL to the database.

## Method 1: AWS CloudShell (Recommended)

### Step 1: Open CloudShell
1. Go to https://eu-north-1.console.aws.amazon.com/
2. Click CloudShell icon (top right)

### Step 2: Install PostgreSQL Client
```bash
sudo apt-get update
sudo apt-get install -y postgresql-client
```

### Step 3: Connect to Database
```bash
export PGPASSWORD="Pastor123"
psql -h uslugar-db.cr80o0eeg3gy.eu-north-1.rds.amazonaws.com -U uslugar_user -d uslugar
```

### Step 4: Run Migration SQL
Copy and paste the SQL from `migration-temp.sql`:

```sql
-- CreateTable
CREATE TABLE IF NOT EXISTS "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "credits" INTEGER NOT NULL,
    "features" TEXT[],
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "savings" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "SubscriptionPlan_name_key" ON "SubscriptionPlan"("name");
CREATE INDEX IF NOT EXISTS "SubscriptionPlan_isActive_idx" ON "SubscriptionPlan"("isActive");
CREATE INDEX IF NOT EXISTS "SubscriptionPlan_displayOrder_idx" ON "SubscriptionPlan"("displayOrder");

-- AlterTable: Make Job.userId nullable
DO $$  
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Job' AND column_name = 'userId' AND is_nullable = 'NO') THEN
        ALTER TABLE "Job" ALTER COLUMN "userId" DROP NOT NULL;
    END IF;
END $$;

-- AlterTable: Add linking token fields
DO $$  
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Job' AND column_name = 'linkingToken') THEN
        ALTER TABLE "Job" ADD COLUMN "linkingToken" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Job' AND column_name = 'linkingTokenExpiresAt') THEN
        ALTER TABLE "Job" ADD COLUMN "linkingTokenExpiresAt" TIMESTAMP(3);
    END IF;
END $$;
```

### Step 5: Verify
```sql
-- Check if table exists
SELECT tablename FROM pg_tables WHERE tablename = 'SubscriptionPlan';

-- Check Job columns
SELECT column_name, is_nullable FROM information_schema.columns 
WHERE table_name = 'Job' AND column_name IN ('userId', 'linkingToken', 'linkingTokenExpiresAt');
```

Expected output:
- `SubscriptionPlan` table exists
- `userId` is nullable (YES)
- `linkingToken` and `linkingTokenExpiresAt` columns exist

### Step 6: Exit
```sql
\q
```

## Method 2: DBeaver / pgAdmin

1. Install DBeaver: https://dbeaver.io/download/
2. Create PostgreSQL connection:
   - Host: `uslugar-db.cr80o0eeg3gy.eu-north-1.rds.amazonaws.com`
   - Port: `5432`
   - Database: `uslugar`
   - Username: `uslugar_user`
   - Password: `Pastor123`
3. Open SQL Editor
4. Run the SQL from `migration-temp.sql`

## Method 3: AWS RDS Query Editor

1. Go to AWS RDS Console
2. Select `uslugar-db`
3. Open "Query Editor" (requires IAM authentication setup)
4. Run the SQL

## Verification After Applying

Run this query to verify everything is correct:

```sql
SELECT 
  (SELECT COUNT(*) FROM pg_tables WHERE tablename = 'SubscriptionPlan') as has_subscription_plan,
  (SELECT is_nullable FROM information_schema.columns WHERE table_name = 'Job' AND column_name = 'userId') as job_userid_nullable,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'Job' AND column_name IN ('linkingToken', 'linkingTokenExpiresAt')) as has_linking_columns;
```

Expected result:
```
 has_subscription_plan | job_userid_nullable | has_linking_columns
-----------------------+---------------------+--------------------
                     1 | YES                 |                   2
```

## After Migration Applied

1. Run seed to populate SubscriptionPlan table
2. All workflows should now pass
3. Check that subscription plans appear in admin panel
4. Check that anonymous job posting works

## Files

- `migration-temp.sql` - SQL script to apply
- `apply-migration-manually.ps1` - PowerShell script helper
- `check-db-prisma.ps1` - Verification script
- `APPLY-MIGRATION-INSTRUCTIONS.md` - This file
