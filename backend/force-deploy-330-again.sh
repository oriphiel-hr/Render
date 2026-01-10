#!/bin/bash
set -e

REGION="eu-north-1"
CLUSTER_NAME="apps-cluster"
SERVICE_NAME="uslugar-service-2gk1f1mv"
TASK_DEFINITION="uslugar:330"

echo "========================================"
echo "  Ponovno Pokretanje Deploymenta 330"
echo "========================================"
echo ""

# Provjeri da li task definition 330 postoji
echo "🔍 Provjera task definition 330:"
TASK_DEF_EXISTS=$(aws ecs describe-task-definition --task-definition $TASK_DEFINITION --region $REGION --query 'taskDefinition.revision' --output text 2>/dev/null)

if [ -z "$TASK_DEF_EXISTS" ]; then
  echo "  ❌ Task definition 330 ne postoji!"
  echo "  💡 Možda je obrisana ili ne postoji"
  exit 1
fi

echo "  ✅ Task definition 330 postoji (revision: $TASK_DEF_EXISTS)"

# Provjeri Twilio secrets u 330
echo ""
echo "📋 Provjera Twilio secrets u task definition 330:"
TWILIO_SECRETS=$(aws ecs describe-task-definition --task-definition $TASK_DEFINITION --region $REGION --query 'taskDefinition.containerDefinitions[?name==`uslugar`].secrets' --output json)

TWILIO_COUNT=$(echo "$TWILIO_SECRETS" | python3 -c "import json, sys; data=json.load(sys.stdin); print(len([s for s in data[0] if 'TWILIO' in s.get('name', '')]))")

if [ "$TWILIO_COUNT" -eq "3" ]; then
  echo "  ✅ Task definition 330 ima 3 Twilio secrets"
else
  echo "  ⚠️  Task definition 330 ima samo $TWILIO_COUNT Twilio secrets (očekivano: 3)"
fi

# Forsiraj deployment s 330
echo ""
echo "🚀 Forsiranje novog deploymenta s task definition 330:"
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $SERVICE_NAME \
  --task-definition $TASK_DEFINITION \
  --force-new-deployment \
  --region $REGION > /dev/null

echo "  ✅ Deployment iniciran"

echo ""
echo "========================================"
echo "  ⏳ Pričekajte 2-3 minute za deployment"
echo "========================================"
echo ""

# Provjeri status odmah
echo "📊 Trenutni Status:"
aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $REGION \
  --query 'services[0].deployments[*].{Status:status,TaskDefinition:taskDefinition,RunningCount:runningCount,DesiredCount:desiredCount}' \
  --output table

echo ""
echo "💡 Provjeri status za 2-3 minute:"
echo "   aws ecs describe-services --cluster apps-cluster --services uslugar-service-2gk1f1mv --region eu-north-1 --query 'services[0].deployments[*].{Status:status,TaskDefinition:taskDefinition,RunningCount:runningCount}' --output table"
echo ""

