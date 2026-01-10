#!/bin/bash

REGION="eu-north-1"
CLUSTER_NAME="apps-cluster"
SERVICE_NAME="uslugar-service-2gk1f1mv"

echo "========================================"
echo "  Provjera Twilio Konfiguracije"
echo "========================================"
echo ""

# 1. Provjeri pokrenute taskove
echo "📦 Pokrenuti Taskovi:"
TASK_ARNS=$(aws ecs list-tasks --cluster $CLUSTER_NAME --service-name $SERVICE_NAME --region $REGION --query 'taskArns[]' --output text)

if [ -z "$TASK_ARNS" ]; then
  echo "  ⚠️  Nema pokrenutih taskova"
  exit 1
fi

for TASK_ARN in $TASK_ARNS; do
  TASK_DEF=$(aws ecs describe-tasks --cluster $CLUSTER_NAME --tasks $TASK_ARN --region $REGION --query 'tasks[0].taskDefinitionArn' --output text)
  STATUS=$(aws ecs describe-tasks --cluster $CLUSTER_NAME --tasks $TASK_ARN --region $REGION --query 'tasks[0].lastStatus' --output text)
  HEALTH=$(aws ecs describe-tasks --cluster $CLUSTER_NAME --tasks $TASK_ARN --region $REGION --query 'tasks[0].healthStatus' --output text 2>/dev/null || echo "N/A")
  
  REVISION=$(echo "$TASK_DEF" | sed 's/.*task-definition\/[^:]*://')
  
  echo "  Task: $(basename $TASK_ARN)"
  echo "    Revision: $REVISION"
  echo "    Status: $STATUS"
  echo "    Health: $HEALTH"
  
  if [ "$REVISION" -eq "330" ] && [ "$STATUS" = "RUNNING" ]; then
    echo "    ✅ Nova revision 330 je RUNNING!"
  fi
  echo ""
done

echo "========================================"
echo ""

# 2. Provjeri Twilio config u logovima
echo "📋 Provjera Twilio Config u Logovima (zadnjih 5 minuta):"
echo ""

TWILIO_LOGS=$(aws logs tail /ecs/uslugar-backend --region $REGION --since 5m --format short 2>/dev/null | grep -i -E "(twilio config|twilio.*check|SMS.*SIMULATION)" | tail -10)

if [ -z "$TWILIO_LOGS" ]; then
  echo "  ⚠️  Nema Twilio logova u zadnjih 5 minuta"
  echo "  💡 Možda još nije bilo SMS zahtjeva"
  echo ""
  echo "  🔍 Provjeravam sve logove (zadnjih 2 minute):"
  aws logs tail /ecs/uslugar-backend --region $REGION --since 2m --format short 2>/dev/null | tail -20
else
  echo "$TWILIO_LOGS"
  echo ""
  
  # Provjeri da li su secrets aktivni
  if echo "$TWILIO_LOGS" | grep -q "hasAccountSID: true"; then
    echo "  ✅✅✅ Twilio secrets su AKTIVNI!"
    echo ""
    echo "  Očekivani rezultat:"
    echo "    - hasAccountSID: true"
    echo "    - hasAuthToken: true"
    echo "    - hasPhoneNumber: true"
    echo "    - phoneNumber: '+18027276987'"
  elif echo "$TWILIO_LOGS" | grep -q "hasAccountSID: false"; then
    echo "  ⚠️  Twilio secrets još nisu aktivni"
    echo "  💡 Možda treba još minutu za potpuni restart"
  else
    echo "  🔍 Provjeravam detaljno..."
    echo "$TWILIO_LOGS" | grep -i "twilio config" | head -3
  fi
fi

echo ""
echo "========================================"
echo ""
echo "💡 Ako Twilio config još ne radi:"
echo "   - Pričekajte 1-2 minute"
echo "   - Pokrenite ovu skriptu ponovno"
echo "   - Ili pokušajte poslati SMS zahtjev kroz aplikaciju"
echo ""

