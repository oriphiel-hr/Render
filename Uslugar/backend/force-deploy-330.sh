#!/bin/bash
set -e

REGION="eu-north-1"
CLUSTER_NAME="apps-cluster"
SERVICE_NAME="uslugar-service-2gk1f1mv"
TASK_DEFINITION="uslugar:330"

echo "========================================"
echo "  Forsiranje Deploymenta s Task Def 330"
echo "========================================"
echo ""

echo "📊 Trenutna situacija:"
CURRENT_TASK_DEF=$(aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $REGION \
  --query 'services[0].taskDefinition' \
  --output text)

echo "  Trenutna task definition: $CURRENT_TASK_DEF"
echo "  Željena task definition: $TASK_DEFINITION"
echo ""

if [ "$CURRENT_TASK_DEF" = "arn:aws:ecs:${REGION}:666203386231:task-definition/${TASK_DEFINITION}" ]; then
  echo "  ✅ Servis već koristi task definition 330"
  echo "  ⏳ Deployment možda još traje, provjerite deployment status"
else
  echo "  🔄 Forsiranje novog deploymenta..."
  
  aws ecs update-service \
    --cluster $CLUSTER_NAME \
    --service $SERVICE_NAME \
    --task-definition $TASK_DEFINITION \
    --force-new-deployment \
    --region $REGION > /dev/null
  
  echo "  ✅ Deployment iniciran"
fi

echo ""
echo "========================================"
echo "  📊 Provjera deployment statusa:"
echo "========================================"
echo ""

# Provjeri deployment status
aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $REGION \
  --query 'services[0].deployments[*].{status:status,taskDefinition:taskDefinition,desiredCount:desiredCount,runningCount:runningCount,createdAt:createdAt}' \
  --output table

echo ""
echo "⏳ Pričekajte 2-3 minute za deployment da završi"
echo ""

echo "🔍 Provjera Twilio secrets nakon deploymenta:"
echo "   Pokrenite ovu naredbu za ~3 minute:"
echo ""
echo "   aws logs tail /ecs/uslugar-backend --region eu-north-1 --since 5m | grep -i 'twilio config'"
echo ""

