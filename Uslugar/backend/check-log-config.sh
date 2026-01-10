#!/bin/bash

TASK_DEF="arn:aws:ecs:eu-north-1:666203386231:task-definition/uslugar:334"
REGION="eu-north-1"

echo "========================================"
echo "  Provjera Log Configuration"
echo "========================================"
echo ""

echo "📋 Dohvati log configuration iz task definition..."
LOG_CONFIG=$(aws ecs describe-task-definition \
  --task-definition "$TASK_DEF" \
  --region $REGION \
  --query 'taskDefinition.containerDefinitions[?name==`uslugar`].logConfiguration' \
  --output json 2>/dev/null)

if [ ! -z "$LOG_CONFIG" ] && [ "$LOG_CONFIG" != "null" ] && [ "$LOG_CONFIG" != "[]" ]; then
  echo "$LOG_CONFIG" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    if data and len(data) > 0:
        config = data[0]
        print(f'✅ Log Driver: {config.get(\"logDriver\", \"N/A\")}')
        if 'options' in config:
            opts = config['options']
            log_group = opts.get('awslogs-group', 'NEDOSTAJE')
            stream_prefix = opts.get('awslogs-stream-prefix', 'N/A')
            region = opts.get('awslogs-region', 'N/A')
            print(f'✅ Log Group: {log_group}')
            print(f'   Stream Prefix: {stream_prefix}')
            print(f'   Region: {region}')
            print('')
            print('📋 Komanda za provjeru logova:')
            print(f'   aws logs tail {log_group} --region {REGION} --since 5m | grep -i \"twilio config\"')
    else:
        print('⚠️  Nema log configuration')
except Exception as e:
    print(f'⚠️  Greška pri parsiranju: {e}')
    print('Raw output:')
    print(data)
"
else
  echo "⚠️  Nema log configuration za container 'uslugar'"
  echo ""
  echo "🔍 Provjeri sve containere u task definition:"
  aws ecs describe-task-definition \
    --task-definition "$TASK_DEF" \
    --region $REGION \
    --query 'taskDefinition.containerDefinitions[*].name' \
    --output table
fi

