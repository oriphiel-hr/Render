#!/bin/bash

# Varijable
export AWS_DEFAULT_REGION=eu-north-1
export CLUSTER="apps-cluster"
export FAMILY="uslugar-add-categories"
export SUBNETS="subnet-0a00f97768705bbcf,subnet-01b67edfd00dc288c"
export SECGRP="sg-084c1e49c9c77aff1"
export DATABASE_URL="postgres://uslugar_user:Pastor123@uslugar-db.cr80o0eeg3gy.eu-north-1.rds.amazonaws.com:5432/uslugar"

# 1. Kreiraj task definition JSON
cat > td-add-categories.json << 'EOF'
{
  "family": "uslugar-add-categories",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::666203386231:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "add-categories",
      "image": "node:18-alpine",
      "essential": true,
      "environment": [
        {
          "name": "DATABASE_URL",
          "value": "postgres://uslugar_user:Pastor123@uslugar-db.cr80o0eeg3gy.eu-north-1.rds.amazonaws.com:5432/uslugar"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-region": "eu-north-1",
          "awslogs-group": "/ecs/uslugar/add-categories",
          "awslogs-stream-prefix": "add-categories"
        }
      },
      "command": [
        "sh",
        "-c",
        "apk add --no-cache postgresql-client && psql \"$DATABASE_URL\" << 'SQLEND' && echo 'Categories added successfully!' || echo 'Error adding categories!';\n-- Insert categories here\nSQLEND"
      ]
    }
  ]
}
EOF

# 2. Network config
cat > netcfg.json << EOF
{
  "awsvpcConfiguration": {
    "subnets": ["subnet-0a00f97768705bbcf", "subnet-01b67edfd00dc288c"],
    "securityGroups": ["sg-084c1e49c9c77aff1"],
    "assignPublicIp": "DISABLED"
  }
}
EOF

# 3. Pokreni task
echo "Starting ECS task to add categories..."

TASK_ARN=$(aws ecs run-task \
  --cluster "$CLUSTER" \
  --launch-type FARGATE \
  --task-definition "$FAMILY" \
  --network-configuration file://netcfg.json \
  --query 'tasks[0].taskArn' --output text 2>/dev/null || echo "")

if [ -z "$TASK_ARN" ] || [ "$TASK_ARN" = "None" ]; then
  echo "⚠️  Task definition not found. Let me register it first..."
  
  # Registriraj task definition
  TD_ARN=$(aws ecs register-task-definition \
    --cli-input-json file://td-add-categories.json \
    --query 'taskDefinition.taskDefinitionArn' --output text)
  echo "✅ Task definition registered: $TD_ARN"
  
  # Pokreni task
  TASK_ARN=$(aws ecs run-task \
    --cluster "$CLUSTER" \
    --launch-type FARGATE \
    --task-definition "$TD_ARN" \
    --network-configuration file://netcfg.json \
    --query 'tasks[0].taskArn' --output text)
fi

echo "Task ARN: $TASK_ARN"
echo "Waiting for task to complete..."

# Čekaj da se task završi
aws ecs wait tasks-stopped --cluster "$CLUSTER" --tasks "$TASK_ARN"

# Prikaži logove
echo ""
echo "=== TASK LOGS ==="
aws logs get-log-events \
  --log-group-name /ecs/uslugar/add-categories \
  --log-stream-name "add-categories/add-categories/${TASK_ARN##*/}" \
  --start-from-head \
  --query 'events[].message' --output text 2>/dev/null || echo "No logs found"

echo ""
echo "✅ Done!"
