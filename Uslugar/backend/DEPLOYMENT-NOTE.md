# Deployment Note - Anonymous Job Posting Feature

## Deployment Triggered
Date: $(date)
Commit: 2f929ae

## Changes Deployed:
1. Anonymous job posting support
2. Email notification with registration link
3. Job linking functionality after registration
4. Database schema changes (linkingToken, linkingTokenExpiresAt)

## Next Steps:
1. Monitor GitHub Actions workflow: `.github/workflows/prisma-uslugar.yml`
2. Monitor backend deployment: `.github/workflows/backend-uslugar-ecs.yml`
3. Test anonymous job posting endpoint
4. Verify email sending works

---
This file will be deleted after successful deployment.
