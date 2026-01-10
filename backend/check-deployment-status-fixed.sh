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

echo "  $CURRENT_TASK_DEF"

# Ekstraktiraj revision iz punog ARN-a
# Format: arn:aws:ecs:region:account:task-definition/family:revision
REVISION=$(echo "$CURRENT_TASK_DEF" | sed 's/.*task-definition\/[^:]*://')
echo "  Revision: $REVISION"

if [ "$REVISION" -ge "330" ] 2>/dev/null; then
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
  --query 'services[0].deployments[*].{Status:status,TaskDefinition:taskDefinition,RunningCount:runningCount,DesiredCount:desiredCount}' \
  --output table

echo ""

# 3. Provjeri pokrenute taskove
echo "📦 Pokrenuti Taskovi:"
TASK_ARNS=$(aws ecs list-tasks --cluster $CLUSTER_NAME --service-name $SERVICE_NAME --region $REGION --query 'taskArns[]' --output text)

if [ -z "$TASK_ARNS" ]; then
  echo "  ⚠️  Nema pokrenutih taskova"
else
  for TASK_ARN in $TASK_ARNS; do
    echo "Task: $(basename $TASK_ARN)"
    
    # Dohvati task definition ARN
    TASK_DEF=$(aws ecs describe-tasks --cluster $CLUSTER_NAME --tasks $TASK_ARN --region $REGION --query 'tasks[0].taskDefinitionArn' --output text)
    STATUS=$(aws ecs describe-tasks --cluster $CLUSTER_NAME --tasks $TASK_ARN --region $REGION --query 'tasks[0].lastStatus' --output text)
    
    echo "  Task Definition: $TASK_DEF"
    echo "  Status: $STATUS"
    
    # Ekstraktiraj revision iz punog ARN-a
    TASK_REVISION=$(echo "$TASK_DEF" | sed 's/.*task-definition\/[^:]*://')
    echo "  Revision: $TASK_REVISION"
    
    if [ "$STATUS" = "PROVISIONING" ] || [ "$STATUS" = "PENDING" ]; then
      echo "  ⏳ Task se još pokreće (status: $STATUS)"
    elif [ "$TASK_REVISION" -ge "330" ] 2>/dev/null; then
      echo "  ✅ Koristi novu task definition (330+)"
    else
      echo "  ⚠️  Koristi staru revision (<330)"
    fi
    echo ""
  done
fi

echo "========================================"

# 4. Provjeri Twilio config u logovima (ako je nova revision aktivna)
if [ "$REVISION" -ge "330" ] 2>/dev/null; then
  echo "📋 Provjera Twilio Config u Logovima (zadnjih 5 minuta):"
  echo ""
  
  TWILIO_LOG=$(aws logs tail /ecs/uslugar-backend --region $REGION --since 5m --format short 2>/dev/null | grep -i -E "(twilio config|twilio.*check)" | tail -5)
  
  if [ -z "$TWILIO_LOG" ]; then
    echo "  ⚠️  Nema Twilio config logova u zadnjih 5 minuta"
    echo "  💡 Task je možda još u PROVISIONING fazi - pričekajte 1-2 minute"
  else
    echo "$TWILIO_LOG"
    echo ""
    
    # Provjeri da li su secrets vidljivi
    if echo "$TWILIO_LOG" | grep -q "hasAccountSID: true"; then
      echo "  ✅ Twilio secrets su aktivni!"
    elif echo "$TWILIO_LOG" | grep -q "hasAccountSID: false"; then
      echo "  ⚠️  Twilio secrets još nisu aktivni"
      echo "  💡 Možda treba još minutu za potpuni restart"
    fi
  fi
else
  echo "📋 Twilio Config:"
  echo "  ⚠️  Nije moguće provjeriti - još koristi staru revision ($REVISION)"
fi

echo ""
echo "========================================"
echo ""
echo "💡 Ako je task u PROVISIONING statusu:"
echo "   - Deployment je u tijeku"
echo "   - Pričekajte 2-3 minute"
echo "   - Pokrenite ovu skriptu ponovno za provjeru"
echo ""

