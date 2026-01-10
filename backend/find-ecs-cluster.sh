#!/bin/bash

REGION="eu-north-1"

echo "🔍 Tražim ECS klastere..."
echo ""

# Lista svih klastera
CLUSTERS=$(aws ecs list-clusters --region $REGION --query 'clusterArns[]' --output text)

if [ -z "$CLUSTERS" ]; then
  echo "❌ Nema klastera u regiji $REGION"
  exit 1
fi

echo "Pronađeni klasteri:"
for cluster in $CLUSTERS; do
  CLUSTER_NAME=$(basename $cluster)
  echo "  - $CLUSTER_NAME"
done

echo ""
echo "🔍 Tražim servise u svakom klasteru..."
echo ""

for cluster in $CLUSTERS; do
  CLUSTER_NAME=$(basename $cluster)
  echo "📋 Klaster: $CLUSTER_NAME"
  
  SERVICES=$(aws ecs list-services --cluster $CLUSTER_NAME --region $REGION --query 'serviceArns[]' --output text 2>/dev/null)
  
  if [ -z "$SERVICES" ]; then
    echo "  (nema servisa)"
  else
    for service in $SERVICES; do
      SERVICE_NAME=$(basename $service)
      echo "  - Service: $SERVICE_NAME"
      
      # Dohvati task definition
      TASK_DEF=$(aws ecs describe-services \
        --cluster $CLUSTER_NAME \
        --services $SERVICE_NAME \
        --region $REGION \
        --query 'services[0].taskDefinition' \
        --output text 2>/dev/null)
      
      if [ ! -z "$TASK_DEF" ] && [ "$TASK_DEF" != "None" ]; then
        TASK_FAMILY=$(echo $TASK_DEF | cut -d: -f1)
        echo "    Task Definition: $TASK_FAMILY"
      fi
    done
  fi
  echo ""
done

