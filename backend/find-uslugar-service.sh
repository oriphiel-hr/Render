#!/bin/bash

REGION="eu-north-1"

echo "🔍 Tražim ECS servise koji bi mogli biti Uslugar backend..."
echo ""

CLUSTERS=$(aws ecs list-clusters --region $REGION --query 'clusterArns[]' --output text)

for cluster_arn in $CLUSTERS; do
  cluster=$(basename $cluster_arn)
  echo "📋 Klaster: $cluster"
  
  SERVICES=$(aws ecs list-services --cluster $cluster --region $REGION --query 'serviceArns[]' --output text 2>/dev/null)
  
  if [ -z "$SERVICES" ]; then
    echo "  (nema servisa)"
    echo ""
    continue
  fi
  
  for service_arn in $SERVICES; do
    service=$(basename $service_arn)
    
    TASK_DEF=$(aws ecs describe-services \
      --cluster $cluster \
      --services $service \
      --region $REGION \
      --query 'services[0].taskDefinition' \
      --output text 2>/dev/null)
    
    if [ ! -z "$TASK_DEF" ] && [ "$TASK_DEF" != "None" ]; then
      TASK_FAMILY=$(echo $TASK_DEF | cut -d: -f1)
      TASK_REVISION=$(echo $TASK_DEF | cut -d: -f2)
      
      echo "  ✅ Service: $service"
      echo "     Task Definition: $TASK_FAMILY:$TASK_REVISION"
      
      # Provjeri container name u task definition
      CONTAINER_NAME=$(aws ecs describe-task-definition \
        --task-definition $TASK_DEF \
        --region $REGION \
        --query 'taskDefinition.containerDefinitions[0].name' \
        --output text 2>/dev/null)
      
      if [ ! -z "$CONTAINER_NAME" ]; then
        echo "     Container: $CONTAINER_NAME"
      fi
      
      # Provjeri da li sadrži 'uslugar' u nazivu
      if echo "$service" | grep -qi "uslugar\|backend\|api"; then
        echo "     🎯 LIKELY USLUGAR BACKEND!"
        echo ""
        echo "     Koristi ove vrijednosti:"
        echo "     CLUSTER_NAME=\"$cluster\""
        echo "     SERVICE_NAME=\"$service\""
        echo "     TASK_FAMILY=\"$TASK_FAMILY\""
        echo ""
      fi
      echo ""
    fi
  done
done

