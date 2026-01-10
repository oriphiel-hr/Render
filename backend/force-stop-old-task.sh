#!/bin/bash

REGION="eu-north-1"
CLUSTER_NAME="apps-cluster"
SERVICE_NAME="uslugar-service-2gk1f1mv"

echo "========================================"
echo "  Zaustavljanje Starog Taska (326)"
echo "========================================"
echo ""

# Pronađi sve taskove
ALL_TASKS=$(aws ecs list-tasks --cluster $CLUSTER_NAME --service-name $SERVICE_NAME --region $REGION --query 'taskArns[]' --output text)

echo "📦 Pronađeni taskovi:"
for TASK_ARN in $ALL_TASKS; do
  if [ ! -z "$TASK_ARN" ]; then
    TASK_DEF=$(aws ecs describe-tasks --cluster $CLUSTER_NAME --tasks $TASK_ARN --region $REGION --query 'tasks[0].taskDefinitionArn' --output text)
    STATUS=$(aws ecs describe-tasks --cluster $CLUSTER_NAME --tasks $TASK_ARN --region $REGION --query 'tasks[0].lastStatus' --output text)
    
    TASK_REVISION=$(echo "$TASK_DEF" | sed 's/.*task-definition\/[^:]*://')
    
    echo "  Task: $(basename $TASK_ARN)"
    echo "    Revision: $TASK_REVISION"
    echo "    Status: $STATUS"
    
    if [ "$TASK_REVISION" -eq "326" ] && [ "$STATUS" = "RUNNING" ]; then
      echo "    🛑 Zaustavljam stari task..."
      aws ecs stop-task --cluster $CLUSTER_NAME --task "$TASK_ARN" --region $REGION --reason "Force stop old revision to allow 330 to deploy" > /dev/null
      echo "    ✅ Stari task zaustavljen"
    fi
    echo ""
  fi
done

echo "========================================"
echo ""
echo "⏳ Pričekajte 30 sekundi, zatim provjerite status:"
echo "   aws ecs describe-services --cluster apps-cluster --services uslugar-service-2gk1f1mv --region eu-north-1 --query 'services[0].deployments[*].{Status:status,TaskDefinition:taskDefinition,RunningCount:runningCount}' --output table"
echo ""

