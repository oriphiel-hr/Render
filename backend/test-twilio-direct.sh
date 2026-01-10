#!/bin/bash

REGION="eu-north-1"
CLUSTER_NAME="apps-cluster"
SERVICE_NAME="uslugar-service-2gk1f1mv"

echo "========================================"
echo "  Provjera Twilio Konfiguracije"
echo "========================================"
echo ""

# 1. Provjeri sve zadnje logove (možda ima grešaka)
echo "📋 Zadnji Logovi (zadnjih 10 minuta):"
echo ""
aws logs tail /ecs/uslugar-backend --region $REGION --since 10m --format short 2>/dev/null | tail -30

echo ""
echo "========================================"
echo ""

# 2. Provjeri environment varijable u task definition 330
echo "🔍 Provjera Secrets u Task Definition 330:"
TWILIO_SECRETS=$(aws ecs describe-task-definition --task-definition uslugar:330 --region $REGION --query 'taskDefinition.containerDefinitions[?name==`uslugar`].secrets[?contains(name, `TWILIO`)]' --output json)

echo "$TWILIO_SECRETS" | python3 -m json.tool

echo ""
echo "========================================"
echo ""

# 3. Provjeri da li postoji aktivni task i provjeri njegove environment varijable
echo "📦 Provjera Pokrenutog Taska:"
TASK_ARN=$(aws ecs list-tasks --cluster $CLUSTER_NAME --service-name $SERVICE_NAME --region $REGION --query 'taskArns[0]' --output text)

if [ ! -z "$TASK_ARN" ]; then
  echo "  Task: $(basename $TASK_ARN)"
  
  # Provjeri da li task koristi 330
  TASK_DEF=$(aws ecs describe-tasks --cluster $CLUSTER_NAME --tasks $TASK_ARN --region $REGION --query 'tasks[0].taskDefinitionArn' --output text)
  REVISION=$(echo "$TASK_DEF" | sed 's/.*task-definition\/[^:]*://')
  
  echo "  Revision: $REVISION"
  
  if [ "$REVISION" -eq "330" ]; then
    echo "  ✅ Task koristi revision 330"
  fi
else
  echo "  ⚠️  Nema pokrenutih taskova"
fi

echo ""
echo "========================================"
echo ""
echo "💡 Sljedeći korak:"
echo "   1. Otvori aplikaciju: https://uslugar.oriph.io/#user"
echo "   2. Pokušaj poslati SMS verifikacijski kod"
echo "   3. Provjeri logove:"
echo "      aws logs tail /ecs/uslugar-backend --region eu-north-1 --since 2m | grep -i 'twilio'"
echo ""
echo "   Ili sve logove:"
echo "      aws logs tail /ecs/uslugar-backend --region eu-north-1 --since 2m | tail -50"
echo ""

