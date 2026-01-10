#!/bin/bash

REGION="eu-north-1"
CLUSTER_NAME="apps-cluster"
SERVICE_NAME="uslugar-service-2gk1f1mv"

echo "========================================"
echo "  Provjera Statusa Deploymenta"
echo "========================================"
echo ""

# 1. Provjeri aktivnu task definition u servisu
echo "📊 Aktivna Task Definition u Servisu:"
CURRENT_TASK_DEF=$(aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $REGION \
  --query 'services[0].taskDefinition' \
  --output text)

REVISION=$(echo "$CURRENT_TASK_DEF" | cut -d: -f2)
echo "  $CURRENT_TASK_DEF"
echo "  Revision: $REVISION"

if [ "$REVISION" -ge "330" ]; then
  echo "  ✅ Servis koristi task definition 330+"
else
  echo "  ⚠️  Servis još koristi staru revision ($REVISION < 330)"
fi

echo ""

# 2. Provjeri deployment status
echo "🔄 Status Deploymenta:"
aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $REGION \
  --query 'services[0].deployments[*].{Status:status,TaskDefinition:taskDefinition,DesiredCount:desiredCount,RunningCount:runningCount,CreatedAt:createdAt}' \
  --output table

echo ""

# 3. Provjeri pokrenute taskove
echo "📦 Pokrenuti Taskovi:"
TASK_ARNS=$(aws ecs list-tasks --cluster $CLUSTER_NAME --service-name $SERVICE_NAME --region $REGION --query 'taskArns[]' --output text)

if [ -z "$TASK_ARNS" ]; then
  echo "  ⚠️  Nema pokrenutih taskova"
else
  for TASK_ARN in $TASK_ARNS; do
    TASK_DEF=$(aws ecs describe-tasks --cluster $CLUSTER_NAME --tasks $TASK_ARN --region $REGION --query 'tasks[0].taskDefinitionArn' --output text)
    TASK_STATUS=$(aws ecs describe-tasks --cluster $CLUSTER_NAME --tasks $TASK_ARN --region $REGION --query 'tasks[0].lastStatus' --output text)
    TASK_REVISION=$(echo "$TASK_DEF" | cut -d: -f2)
    
    echo "  Task: $(basename $TASK_ARN)"
    echo "    Status: $TASK_STATUS"
    echo "    Task Definition: $TASK_DEF"
    echo "    Revision: $TASK_REVISION"
    
    if [ "$TASK_REVISION" -ge "330" ]; then
      echo "    ✅ Koristi novu task definition (330+)"
    else
      echo "    ⚠️  Koristi staru revision (<330)"
    fi
    echo ""
  done
fi

echo "========================================"

# 4. Provjeri Twilio config u logovima (ako je nova revision aktivna)
if [ "$REVISION" -ge "330" ]; then
  echo "📋 Provjera Twilio Config u Logovima (zadnjih 5 minuta):"
  echo ""
  
  TWILIO_LOG=$(aws logs tail /ecs/uslugar-backend --region $REGION --since 5m --format short 2>/dev/null | grep -i "twilio config" | tail -5)
  
  if [ -z "$TWILIO_LOG" ]; then
    echo "  ⚠️  Nema Twilio config logova u zadnjih 5 minuta"
    echo "  💡 Možda još nema SMS zahtjeva ili task nije još potpuno pokrenut"
  else
    echo "$TWILIO_LOG"
    echo ""
    
    # Provjeri da li su secrets vidljivi
    if echo "$TWILIO_LOG" | grep -q "hasAccountSID: true"; then
      echo "  ✅ Twilio secrets su aktivni (hasAccountSID: true)"
    else
      echo "  ⚠️  Twilio secrets još nisu aktivni (hasAccountSID: false)"
      echo "  💡 Možda treba još minutu za potpuni restart"
    fi
  fi
else
  echo "📋 Twilio Config:"
  echo "  ⚠️  Nije moguće provjeriti - još koristi staru revision"
  echo "  💡 Pokrenite deployment s task definition 330"
fi

echo ""
echo "========================================"

