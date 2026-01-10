# Migration Diagnostic Checklist

## Problem
Seed fails because `SubscriptionPlan` table doesn't exist in the database.

## Possible Causes
1. ✅ Commit `996f143` is pushed (contains migration file)
2. ❓ Migration task may have failed silently
3. ❓ Migration SQL may have an error
4. ❓ Migration wasn't applied to the database

## Checks Needed

### 1. GitHub Actions Workflow
- [ ] Open the latest workflow run (commit 996f143 or later)
- [ ] Check the "prisma" job
- [ ] Look for "Run Prisma migrate" step
- [ ] Check if migration task completed successfully (exit code should be 0)
- [ ] Review CloudWatch logs from migration task

### 2. Database Check
Run this query to check if the table exists:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'SubscriptionPlan';
```

Check migration history:
```sql
SELECT * FROM _prisma_migrations WHERE name = '20250121_add_subscription_plan_and_anonymous_job_support';
```

### 3. Migration File
- [x] File exists: `uslugar/backend/prisma/migrations/20250121_add_subscription_plan_and_anonymous_job_support/migration.sql`
- [x] SQL syntax looks correct
- [x] Creates `SubscriptionPlan` table
- [x] Makes `Job.userId` nullable
- [x] Adds `linkingToken` and `linkingTokenExpiresAt` columns

## Expected Behavior
1. Workflow builds docker image with migration file
2. Prisma migration task runs `npx prisma migrate deploy`
3. Migration creates `SubscriptionPlan` table in database
4. Seed task runs and populates `SubscriptionPlan` data
5. Everything completes successfully

## Current Status
- ❌ Migration didn't create the table
- ❌ Seed fails because table is missing

## Next Actions
1. Check GitHub Actions prisma job logs
2. Verify migration task exit code
3. Review CloudWatch logs for errors
4. If migration failed, check the error message
5. If migration passed but table doesn't exist, there's a bug in the workflow
