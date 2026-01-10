#!/bin/bash

REGION="eu-north-1"
CLUSTER_NAME="apps-cluster"
SERVICE_NAME="uslugar-service-2gk1f1mv"

echo "========================================"
echo "  Provjera Pokrenutih Taskova"
echo "========================================"
echo ""

# Dohvati sve taskove
TASK_ARNS=$(aws ecs list-tasks --cluster $CLUSTER_NAME --service-name $SERVICE_NAME --region $REGION --query 'taskArns[]' --output text)

if [ -z "$TASK_ARNS" ]; then
  echo "  ⚠️  Nema pokrenutih taskova"
  exit 1
fi

for TASK_ARN in $TASK_ARNS; do
  echo "📦 Task: $(basename $TASK_ARN)"
  
  # Dohvati detalje taska
  TASK_DETAILS=$(aws ecs describe-tasks --cluster $CLUSTER_NAME --tasks $TASK_ARN --region $REGION --query 'tasks[0]' --output json)
  
  TASK_DEF=$(echo "$TASK_DETAILS" | python3 -c "import json, sys; print(json.load(sys.stdin)['taskDefinitionArn'])")
  STATUS=$(echo "$TASK_DETAILS" | python3 -c "import json, sys; print(json.load(sys.stdin)['lastStatus'])")
  CREATED=$(echo "$TASK_DETAILS" | python3 -c "import json, sys; print(json.load(sys.stdin)['createdAt'])")
  
  echo "  Task Definition: $TASK_DEF"
  echo "  Status: $STATUS"
  echo "  Created: $CREATED"
  
  # Ekstraktiraj revision
  REVISION=$(echo "$TASK_DEF" | cut -d: -f2)
  echo "  Revision: $REVISION"
  
  if [ "$REVISION" -ge "330" ]; then
    echo "  ✅ Koristi novu task definition (330+)"
  else
    echo "  ⚠️  Koristi staru task definition (<330)"
  fi
  
  echo ""
done

echo "========================================"

