#!/bin/bash

REGION="eu-north-1"
CLUSTER_NAME="apps-cluster"
SERVICE_NAME="uslugar-service-2gk1f1mv"

echo "========================================"
echo "  Provjera Novog Deploymenta (330)"
echo "========================================"
echo ""

# Provjeri sve taskove (uključujući one koji se pokreću)
echo "📦 Svi Taskovi (uključujući PROVISIONING):"
ALL_TASKS=$(aws ecs list-tasks --cluster $CLUSTER_NAME --service-name $SERVICE_NAME --region $REGION --desired-status RUNNING --query 'taskArns[]' --output text)

if [ ! -z "$ALL_TASKS" ]; then
  for TASK_ARN in $ALL_TASKS; do
    echo "Task: $(basename $TASK_ARN)"
    
    TASK_INFO=$(aws ecs describe-tasks --cluster $CLUSTER_NAME --tasks $TASK_ARN --region $REGION --query 'tasks[0]' --output json)
    
    TASK_DEF=$(echo "$TASK_INFO" | python3 -c "import json, sys; print(json.load(sys.stdin)['taskDefinitionArn'])")
    STATUS=$(echo "$TASK_INFO" | python3 -c "import json, sys; print(json.load(sys.stdin)['lastStatus'])")
    DESIRED_STATUS=$(echo "$TASK_INFO" | python3 -c "import json, sys; print(json.load(sys.stdin)['desiredStatus'])")
    
    TASK_REVISION=$(echo "$TASK_DEF" | sed 's/.*task-definition\/[^:]*://')
    
    echo "  Revision: $TASK_REVISION"
    echo "  Status: $STATUS"
    echo "  Desired Status: $DESIRED_STATUS"
    
    if [ "$TASK_REVISION" -eq "330" ]; then
      if [ "$STATUS" = "RUNNING" ]; then
        echo "  ✅ Nova revision 330 je RUNNING!"
      elif [ "$STATUS" = "PROVISIONING" ] || [ "$STATUS" = "PENDING" ]; then
        echo "  ⏳ Nova revision 330 se pokreće..."
      else
        echo "  ⚠️  Status: $STATUS"
      fi
    elif [ "$TASK_REVISION" -eq "326" ]; then
      echo "  ⚠️  Stari task (326) - bit će zaustavljen kada 330 postane RUNNING"
    fi
    echo ""
  done
else
  echo "  ⚠️  Nema taskova"
fi

echo "========================================"
echo ""
echo "💡 Ako novi task (330) je još u PROVISIONING:"
echo "   - Pričekajte 2-3 minute"
echo "   - Pokrenite ovu skriptu ponovno"
echo ""
echo "💡 Ako želite forsirati zaustavljanje starog taska:"
echo "   - Stari task će se automatski zaustaviti kada 330 postane RUNNING"
echo "   - Ili ručno: aws ecs stop-task --cluster apps-cluster --task <TASK_ARN> --region eu-north-1"
echo ""

