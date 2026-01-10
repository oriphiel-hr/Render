#!/bin/bash

REGION="eu-north-1"
CLUSTER_NAME="apps-cluster"
SERVICE_NAME="uslugar-service-2gk1f1mv"

echo "========================================"
echo "  Pronalaženje Log Group-a za ECS"
echo "========================================"
echo ""

echo "🔍 Tražim log groups koji sadrže 'uslugar' ili 'ecs'..."
aws logs describe-log-groups \
  --region $REGION \
  --query 'logGroups[?contains(logGroupName, `uslugar`) || contains(logGroupName, `ecs`)].logGroupName' \
  --output table

echo ""
echo "🔍 Tražim log group preko ECS task definition..."
TASK_DEF=$(aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $REGION \
  --query 'services[0].taskDefinition' \
  --output text 2>/dev/null)

if [ ! -z "$TASK_DEF" ] && [ "$TASK_DEF" != "None" ]; then
  echo "Task Definition: $TASK_DEF"
  
  # Dohvati log configuration iz task definition
  aws ecs describe-task-definition \
    --task-definition "$TASK_DEF" \
    --region $REGION \
    --query 'taskDefinition.containerDefinitions[?name==`uslugar`].logConfiguration.options' \
    --output json 2>/dev/null | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    if data and len(data) > 0:
        for container in data:
            if 'awslogs-group' in container:
                print(f'  ✅ Log Group: {container[\"awslogs-group\"]}')
                print(f'  Stream Prefix: {container.get(\"awslogs-stream-prefix\", \"N/A\")}')
    else:
        print('  ⚠️  Nema log configuration')
except:
    print('  ⚠️  Ne mogu parsirati log configuration')
"
fi

echo ""
echo "💡 Alternativa: Listaj sve log groups..."
aws logs describe-log-groups \
  --region $REGION \
  --query 'logGroups[*].logGroupName' \
  --output table \
  | grep -i "uslugar\|ecs" || echo "  (nema rezultata)"

