# 🚀 POKRENITE OVO U CLOUDSHELL

## Kopirajte i pokrenite:

```bash
# 1. Get task ARN
TASK_ARN=$(aws ecs list-tasks --cluster apps-cluster --service-name uslugar-service-2gk1f1mv --region eu-north-1 --query 'taskArns[0]' --output text)

echo "Task ARN: $TASK_ARN"

# 2. Run Prisma seed
aws ecs execute-command \
  --cluster apps-cluster \
  --task $TASK_ARN \
  --container uslugar \
  --region eu-north-1 \
  --command "cd /app && npx prisma generate --schema=./prisma/schema.prisma && npm run seed" \
  2>&1
```

---

## ⚠️ Alternativa: Ručno u AWS Console

Ako gornja naredba ne radi, koristite AWS Console:

1. Otvorite: https://console.aws.amazon.com/ecs/v2/clusters/apps-cluster/services/uslugar-service-2gk1f1mv/tasks
2. Kliknite Running task → Connect → Execute Command → Connect
3. Kopirajte i pokrenite:

```bash
cd /app
npx prisma generate --schema=./prisma/schema.prisma
npm run seed
```

---

## ✅ Provjera

Nakon seeda, provjerite:

```bash
npm run prisma studio
```

ili u terminalu:

```bash
npx prisma studio
```
