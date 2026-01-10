#!/bin/bash

REGION="eu-north-1"
CLUSTER_NAME="apps-cluster"
SERVICE_NAME="uslugar-service-2gk1f1mv"

echo "========================================"
echo "  Provjera Statusa Deploymenta"
echo "========================================"
echo ""

# 1. Provjeri status servisa
echo "📊 Status servisa:"
aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $REGION \
  --query 'services[0].{taskDefinition:taskDefinition,runningCount:runningCount,desiredCount:desiredCount,deployments:deployments[*].{status:status,taskDefinition:taskDefinition,desiredCount:desiredCount,runningCount:runningCount}}' \
  --output json | python3 -m json.tool

echo ""
echo "========================================"

# 2. Provjeri pokrenute taskove
echo "🔄 Pokrenuti taskovi:"
TASK_ARNS=$(aws ecs list-tasks --cluster $CLUSTER_NAME --service-name $SERVICE_NAME --region $REGION --query 'taskArns[]' --output text)

if [ -z "$TASK_ARNS" ]; then
  echo "  ⚠️  Nema pokrenutih taskova"
else
  for TASK_ARN in $TASK_ARNS; do
    echo ""
    echo "  📦 Task: $(basename $TASK_ARN)"
    aws ecs describe-tasks \
      --cluster $CLUSTER_NAME \
      --tasks $TASK_ARN \
      --region $REGION \
      --query 'tasks[0].{taskDefinitionArn:taskDefinitionArn,lastStatus:lastStatus,desiredStatus:desiredStatus,healthStatus:healthStatus,createdAt:createdAt}' \
      --output json | python3 -m json.tool
  done
fi

echo ""
echo "========================================"

# 3. Provjeri Twilio config u logovima
echo "📋 Zadnje logove s Twilio informacijama:"
echo ""
aws logs tail /ecs/uslugar-backend \
  --region $REGION \
  --since 10m \
  --format short \
  | grep -i -E "(twilio|SMS|config check)" | tail -20

echo ""
echo "========================================"
echo "  ✅ Provjera završena"
echo "========================================"


